import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { param, query } from 'express-validator';
import { handleValidationErrors } from '../middleware/validate';
import { AppError } from '../middleware/errorHandler';
import {
    findOrganismsByGeneration,
    findTopOrganisms,
} from '../../repositories/organismRepo';
import {
    findGenerationsBySimulation,
    findLatestGeneration,
} from '../../repositories/generationRepo';
import type { ApiResponse, IOrganism, IGeneration } from '../../types';

const router = Router();

// ─── GET /simulations/:id/generations ────────────────────────────────────────

router.get(
    '/:id/generations',
    [
        param('id').isMongoId(),
        query('from').optional().isInt({ min: 0 }),
        query('to').optional().isInt({ min: 0 }),
        query('limit').optional().isInt({ min: 1, max: 1_000 }),
        handleValidationErrors,
    ],
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { from, to, limit } = req.query as Record<string, string>;
            const generations = await findGenerationsBySimulation(req.params.id, {
                from:  from  ? Number(from)  : undefined,
                to:    to    ? Number(to)    : undefined,
                limit: limit ? Number(limit) : undefined,
            });
            res.json({ success: true, data: generations } satisfies ApiResponse<IGeneration[]>);
        } catch (err) {
            next(err);
        }
    },
);

// ─── GET /simulations/:id/generations/latest ─────────────────────────────────

router.get(
    '/:id/generations/latest',
    [param('id').isMongoId(), handleValidationErrors],
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const gen = await findLatestGeneration(req.params.id);
            if (!gen) throw new AppError(404, 'No generations recorded for this simulation');
            res.json({ success: true, data: gen } satisfies ApiResponse<IGeneration>);
        } catch (err) {
            next(err);
        }
    },
);

// ─── GET /simulations/:id/top-organisms ───────────────────────────────────────

router.get(
    '/:id/top-organisms',
    [
        param('id').isMongoId(),
        query('limit').optional().isInt({ min: 1, max: 100 }),
        handleValidationErrors,
    ],
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const limit = req.query.limit ? Number(req.query.limit) : 10;
            const organisms = await findTopOrganisms(req.params.id, limit);
            res.json({ success: true, data: organisms } satisfies ApiResponse<IOrganism[]>);
        } catch (err) {
            next(err);
        }
    },
);

// ─── GET /generations/:generationId/organisms ────────────────────────────────

router.get(
    '/generation/:generationId/organisms',
    [
        param('generationId').isMongoId(),
        query('limit').optional().isInt({ min: 1, max: 10_000 }),
        query('sortByFitness').optional().isBoolean(),
        handleValidationErrors,
    ],
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { limit, sortByFitness } = req.query as Record<string, string>;
            const organisms = await findOrganismsByGeneration(req.params.generationId, {
                limit:         limit         ? Number(limit) : undefined,
                sortByFitness: sortByFitness === 'true',
            });
            res.json({ success: true, data: organisms } satisfies ApiResponse<IOrganism[]>);
        } catch (err) {
            next(err);
        }
    },
);

export default router;
