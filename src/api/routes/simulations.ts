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
import { createInitialPopulation, tick } from '../../engine/runner';
import { insertOrganisms } from '../../repositories/organismRepo';
import { createGeneration } from '../../repositories/generationRepo';
import type { ApiResponse, ISimulation, SimulationStatus } from '../../types';

const router = Router();

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
        body('config.fitnessFunctionId').notEmpty().withMessage('fitnessFunctionId is required'),
        body('config.environmentParams').optional().isObject(),
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
// For long-running simulations this should be offloaded to a BullMQ worker;
// the synchronous path is intentional for the current scope.

router.post(
    '/:id/start',
    [param('id').isMongoId(), handleValidationErrors],
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const sim = await findSimulationById(req.params.id);
            if (!sim) throw new AppError(404, 'Simulation not found');
            if (sim.status === 'running') throw new AppError(409, 'Simulation is already running');
            if (sim.status === 'completed') throw new AppError(409, 'Simulation has already completed');

            await updateSimulationStatus(sim._id, 'running');

            let population  = createInitialPopulation(sim.config);
            let generation  = 0;
            let bestFitness = 0;

            while (true) {
                const result = tick(sim.config, generation, population);

                // Persist generation snapshot
                const genDoc = await createGeneration(
                    sim._id,
                    result.generation,
                    result.population.length,
                    result.stats,
                );

                // Bulk-insert organisms for this generation
                await insertOrganisms(sim._id, genDoc._id, result.population);

                // Keep running best fitness
                bestFitness = Math.max(bestFitness, result.stats.maxFitness);

                await updateSimulationStatus(sim._id, 'running', {
                    currentGeneration: result.generation,
                    bestFitnessEver:   bestFitness,
                });

                population = result.population;
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
