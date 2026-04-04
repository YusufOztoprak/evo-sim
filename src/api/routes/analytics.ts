import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { param } from 'express-validator';
import { handleValidationErrors } from '../middleware/validate';
import { AppError } from '../middleware/errorHandler';
import { getFitnessHistory } from '../../repositories/generationRepo';
import { findTopOrganisms } from '../../repositories/organismRepo';
import { findSimulationById } from '../../repositories/simulationRepo';
import { findAllSpecies } from '../../repositories/speciesRepo';
import { listFitnessFunctions } from '../../engine/fitnessEval';
import type { ApiResponse } from '../../types';

const router = Router();

// ─── GET /analytics/simulations/:id/fitness-history ──────────────────────────
// Returns per-generation avg / max / min fitness — ideal for charting.

router.get(
    '/simulations/:id/fitness-history',
    [param('id').isMongoId(), handleValidationErrors],
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const sim = await findSimulationById(req.params.id);
            if (!sim) throw new AppError(404, 'Simulation not found');
            const history = await getFitnessHistory(req.params.id);
            res.json({ success: true, data: history } satisfies ApiResponse<typeof history>);
        } catch (err) {
            next(err);
        }
    },
);

// ─── GET /analytics/simulations/:id/summary ──────────────────────────────────
// High-level overview: simulation metadata, top organisms, species diversity.

router.get(
    '/simulations/:id/summary',
    [param('id').isMongoId(), handleValidationErrors],
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const sim = await findSimulationById(req.params.id);
            if (!sim) throw new AppError(404, 'Simulation not found');

            const [topOrganisms, allSpecies] = await Promise.all([
                findTopOrganisms(sim._id, 5),
                findAllSpecies(sim._id),
            ]);

            res.json({
                success: true,
                data: {
                    simulation:     sim,
                    topOrganisms,
                    speciesCount:   allSpecies.length,
                    extinctSpecies: allSpecies.filter((s) => s.isExtinct).length,
                    activeSpecies:  allSpecies.filter((s) => !s.isExtinct).length,
                },
            } satisfies ApiResponse<{
                simulation:     typeof sim;
                topOrganisms:   typeof topOrganisms;
                speciesCount:   number;
                extinctSpecies: number;
                activeSpecies:  number;
            }>);
        } catch (err) {
            next(err);
        }
    },
);

// ─── GET /analytics/fitness-functions ────────────────────────────────────────
// Discovery endpoint — lists all registered fitness functions.

router.get('/fitness-functions', (_req, res) => {
    const fns = listFitnessFunctions().map(({ id, label, description }) => ({
        id,
        label,
        description,
    }));
    res.json({ success: true, data: fns });
});

export default router;
