import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { body, param, query } from 'express-validator';
import { handleValidationErrors } from '../middleware/validate';
import { AppError } from '../middleware/errorHandler';
import {
    createSimulation,
    findSimulationById,
    findSimulations,
    updateSimulationStatus,
    deleteSimulation,
} from '../../repositories/simulationRepo';
import { createInitialPopulation, tick, snapshotPopulation } from '../../engine/runner';
import { generateEnvKeyframes } from '../../engine/environment';
import { assignSpecies, clusterIntoSpecies, genomeDistance } from '../../engine/speciation';
import { getFitnessFunction } from '../../engine/fitnessEval';
import { insertOrganisms } from '../../repositories/organismRepo';
import { createGeneration } from '../../repositories/generationRepo';
import {
    findActiveSpecies,
    createSpecies,
    updateSpeciesStats,
    markExtinctSpecies,
} from '../../repositories/speciesRepo';
import type { ApiResponse, ISimulation, ISpecies, OrganismPlain, SimulationStatus } from '../../types';

const router = Router();

// ─── Speciation helper ────────────────────────────────────────────────────────
//
// Assigns every organism in a population to a species, creating new ones as
// needed and marking extinct any that had no members this generation.
//
// Initial generation (no existing species): uses greedy clustering — O(n²) so
// capped at CLUSTER_SAMPLE organisms; larger populations fall back to a single
// seed species with subsequent incremental splits.
//
// Subsequent generations: incremental O(n × |species|) assignment.

const CLUSTER_SAMPLE = 2_000;

async function speciate(
    simulationId: string,
    organisms: OrganismPlain[],
    generationNumber: number,
): Promise<{ organisms: OrganismPlain[]; speciesCount: number }> {
    const activeSpecies = await findActiveSpecies(simulationId);

    // ── Initial clustering (no species exist yet) ──────────────────────────────
    if (activeSpecies.length === 0) {
        let seedSpecies: ISpecies[];

        if (organisms.length <= CLUSTER_SAMPLE) {
            const clusters = clusterIntoSpecies(organisms.map((o) => o.genome));
            const entries  = [...clusters.entries()];
            // Pass explicit labels so parallel creates don't race on countDocuments
            seedSpecies = await Promise.all(
                entries.map(([repIdx], i) =>
                    createSpecies(simulationId, organisms[repIdx].genome, generationNumber, `species-${i + 1}`)
                )
            );
        } else {
            // Population too large for O(n²) — seed with a single species; incremental
            // assignment in later generations will naturally split it.
            seedSpecies = [
                await createSpecies(simulationId, organisms[0].genome, generationNumber, 'species-1'),
            ];
        }

        // Assign every organism to the closest seed species (no threshold guard)
        const countMap = new Map<string, number>();
        const result: OrganismPlain[] = organisms.map((org) => {
            let best     = seedSpecies[0];
            let bestDist = Infinity;
            for (const sp of seedSpecies) {
                const d = genomeDistance(org.genome, sp.representativeGenome);
                if (d < bestDist) { bestDist = d; best = sp; }
            }
            countMap.set(best._id, (countMap.get(best._id) ?? 0) + 1);
            return { ...org, speciesId: best._id };
        });

        await Promise.all(
            [...countMap.entries()].map(([id, count]) =>
                updateSpeciesStats(id, count, generationNumber)
            )
        );

        return { organisms: result, speciesCount: seedSpecies.length };
    }

    // ── Incremental assignment ─────────────────────────────────────────────────
    const workingSpecies = [...activeSpecies];
    const countMap       = new Map<string, number>();
    const result: OrganismPlain[] = [];

    for (const org of organisms) {
        const { speciesId, isNew } = assignSpecies(org.genome, workingSpecies);
        if (isNew) {
            const ns = await createSpecies(simulationId, org.genome, generationNumber);
            workingSpecies.push(ns);
            countMap.set(ns._id, (countMap.get(ns._id) ?? 0) + 1);
            result.push({ ...org, speciesId: ns._id });
        } else {
            countMap.set(speciesId!, (countMap.get(speciesId!) ?? 0) + 1);
            result.push({ ...org, speciesId: speciesId! });
        }
    }

    await Promise.all([
        ...[...countMap.entries()].map(([id, count]) =>
            updateSpeciesStats(id, count, generationNumber)
        ),
        markExtinctSpecies(simulationId, generationNumber, [...countMap.keys()]),
    ]);

    return { organisms: result, speciesCount: countMap.size };
}

// ─── POST /simulations ────────────────────────────────────────────────────────

router.post(
    '/',
    [
        body('name').trim().notEmpty().withMessage('name is required').isLength({ max: 120 }),
        body('description').optional().trim().isLength({ max: 500 }),
        body('config.populationSize').isInt({ min: 2, max: 100_000 }),
        body('config.genomeLength').isInt({ min: 1, max: 10_000 }),
        body('config.genomeEncoding')
            .optional()
            .isIn(['binary', 'real', 'integer', 'permutation']),
        body('config.genomeMin').optional().isFloat(),
        body('config.genomeMax').optional().isFloat(),
        body('config.mutationRate').isFloat({ min: 0, max: 1 }),
        body('config.crossoverRate').isFloat({ min: 0, max: 1 }),
        body('config.elitismCount').optional().isInt({ min: 0 }),
        body('config.selectionStrategy')
            .optional()
            .isIn(['tournament', 'roulette', 'rank', 'elitist']),
        body('config.crossoverStrategy')
            .optional()
            .isIn(['single_point', 'two_point', 'uniform', 'arithmetic']),
        body('config.maxGenerations').isInt({ min: 1 }),
        body('config.targetFitness').optional().isFloat(),
        body('config.fitnessFunctionId')
            .notEmpty().withMessage('fitnessFunctionId is required')
            .custom((id: string) => {
                try { getFitnessFunction(id); return true; }
                catch { throw new Error(`Unknown fitness function: "${id}"`); }
            }),
        body('config.environmentParams').optional().isObject(),
        body('config.dynamicEnv.enabled').optional().isBoolean(),
        body('config.dynamicEnv.shiftMode').optional().isIn(['gradual', 'abrupt']),
        body('config.dynamicEnv.shiftInterval').optional().isInt({ min: 1 }),
        // Cross-field constraints
        body('config').custom((config: Record<string, number>) => {
            const min = config['genomeMin'];
            const max = config['genomeMax'];
            if (min !== undefined && max !== undefined && min >= max) {
                throw new Error('genomeMin must be less than genomeMax');
            }
            const elitism = config['elitismCount'];
            const pop     = config['populationSize'];
            if (elitism !== undefined && pop !== undefined && elitism >= pop) {
                throw new Error('elitismCount must be less than populationSize');
            }
            return true;
        }),
        handleValidationErrors,
    ],
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const sim = await createSimulation(req.body);
            res.status(201).json({ success: true, data: sim } satisfies ApiResponse<ISimulation>);
        } catch (err) {
            next(err);
        }
    },
);

// ─── GET /simulations ─────────────────────────────────────────────────────────

router.get(
    '/',
    [
        query('status')
            .optional()
            .isIn(['idle', 'running', 'paused', 'completed', 'error']),
        query('page').optional().isInt({ min: 1 }),
        query('limit').optional().isInt({ min: 1, max: 100 }),
        query('sortBy').optional().isString(),
        query('sortOrder').optional().isIn(['asc', 'desc']),
        handleValidationErrors,
    ],
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { status, page, limit, sortBy, sortOrder } = req.query as Record<string, string>;
            const pg  = page  ? Number(page)  : 1;
            const lim = limit ? Number(limit) : 20;

            const { data, total } = await findSimulations(
                { ...(status && { status: status as SimulationStatus }) },
                { page: pg, limit: lim, sortBy, sortOrder: sortOrder as 'asc' | 'desc' },
            );

            res.json({
                success: true,
                data,
                meta: { page: pg, limit: lim, total, totalPages: Math.ceil(total / lim) },
            } satisfies ApiResponse<ISimulation[]>);
        } catch (err) {
            next(err);
        }
    },
);

// ─── GET /simulations/:id ─────────────────────────────────────────────────────

router.get(
    '/:id',
    [param('id').isMongoId(), handleValidationErrors],
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const sim = await findSimulationById(req.params.id);
            if (!sim) throw new AppError(404, 'Simulation not found');
            res.json({ success: true, data: sim } satisfies ApiResponse<ISimulation>);
        } catch (err) {
            next(err);
        }
    },
);

// ─── POST /simulations/:id/start ─────────────────────────────────────────────
//
// Runs the full simulation synchronously in the request lifecycle.
// For long-running simulations this should be offloaded to a background worker;
// the synchronous path is intentional for the current scope.

router.post(
    '/:id/start',
    [param('id').isMongoId(), handleValidationErrors],
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log(`[start] fetching sim ${req.params.id}`);
            const sim = await findSimulationById(req.params.id);
            if (!sim) throw new AppError(404, 'Simulation not found');
            if (sim.status === 'running')   throw new AppError(409, 'Simulation is already running');
            if (sim.status === 'completed') throw new AppError(409, 'Simulation has already completed');

            console.log(`[start] status=${sim.status} fitnessFn=${sim.config.fitnessFunctionId} popSize=${sim.config.populationSize}`);
            await updateSimulationStatus(sim._id, 'running');

            // Resolve dynamic env config: generate keyframes if enabled but not yet populated
            const cfg = { ...sim.config };
            if (cfg.dynamicEnv?.enabled && !cfg.dynamicEnv.keyframes?.length) {
                cfg.dynamicEnv = {
                    ...cfg.dynamicEnv,
                    keyframes: generateEnvKeyframes(
                        cfg.environmentParams,
                        cfg.maxGenerations,
                        cfg.dynamicEnv.shiftInterval,
                    ),
                };
            }

            console.log(`[start] calling createInitialPopulation`);
            // ── Generation 0 — create, speciate, and persist before the loop ──
            let population  = createInitialPopulation(cfg);
            let generation  = 0;

            const gen0       = snapshotPopulation(cfg, population, 0);
            const gen0Spec   = await speciate(sim._id, population, 0);
            const gen0Doc    = await createGeneration(
                sim._id, 0, population.length,
                gen0.stats, gen0.environmentParams, gen0Spec.speciesCount,
            );
            await insertOrganisms(sim._id, gen0Doc._id, gen0Spec.organisms);

            let bestFitness = gen0.stats.maxFitness;
            population      = gen0Spec.organisms;

            // ── Evolution loop (generations 1 … maxGenerations) ───────────────
            while (true) {
                const result = tick(cfg, generation, population);

                const spec   = await speciate(sim._id, result.population, result.generation);
                const genDoc = await createGeneration(
                    sim._id, result.generation, spec.organisms.length,
                    result.stats, result.environmentParams, spec.speciesCount,
                );
                await insertOrganisms(sim._id, genDoc._id, spec.organisms);

                bestFitness = Math.max(bestFitness, result.stats.maxFitness);

                await updateSimulationStatus(sim._id, 'running', {
                    currentGeneration: result.generation,
                    bestFitnessEver:   bestFitness,
                });

                population = spec.organisms;
                generation = result.generation;

                if (result.shouldStop) break;
            }

            const completed = await updateSimulationStatus(req.params.id, 'completed', {
                currentGeneration: generation,
                bestFitnessEver:   bestFitness,
            });

            res.json({ success: true, data: completed } satisfies ApiResponse<ISimulation | null>);
        } catch (err) {
            await updateSimulationStatus(req.params.id, 'error', {
                errorMessage: err instanceof Error ? err.message : String(err),
            }).catch(() => {});
            next(err);
        }
    },
);

// ─── POST /simulations/:id/stop ───────────────────────────────────────────────

router.post(
    '/:id/stop',
    [param('id').isMongoId(), handleValidationErrors],
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const sim = await findSimulationById(req.params.id);
            if (!sim) throw new AppError(404, 'Simulation not found');
            if (sim.status !== 'running') {
                throw new AppError(409, `Cannot stop a simulation with status "${sim.status}"`);
            }
            const updated = await updateSimulationStatus(req.params.id, 'paused');
            res.json({ success: true, data: updated } satisfies ApiResponse<ISimulation | null>);
        } catch (err) {
            next(err);
        }
    },
);

// ─── DELETE /simulations/:id ──────────────────────────────────────────────────

router.delete(
    '/:id',
    [param('id').isMongoId(), handleValidationErrors],
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const deleted = await deleteSimulation(req.params.id);
            if (!deleted) throw new AppError(404, 'Simulation not found');
            res.status(204).send();
        } catch (err) {
            next(err);
        }
    },
);

export default router;
