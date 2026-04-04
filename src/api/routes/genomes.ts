import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { param } from 'express-validator';
import { handleValidationErrors } from '../middleware/validate';
import { AppError } from '../middleware/errorHandler';
import {
    findOrganismById,
    findLineage,
    getGenomeDistribution,
} from '../../repositories/organismRepo';
import type { ApiResponse, IOrganism } from '../../types';

const router = Router();

// ─── GET /organisms/:id ───────────────────────────────────────────────────────

router.get(
    '/:id',
    [param('id').isMongoId(), handleValidationErrors],
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const org = await findOrganismById(req.params.id);
            if (!org) throw new AppError(404, 'Organism not found');
            res.json({ success: true, data: org } satisfies ApiResponse<IOrganism>);
        } catch (err) {
            next(err);
        }
    },
);

// ─── GET /organisms/:id/lineage ───────────────────────────────────────────────
// Walks the parentAId chain up to 10 ancestors deep.

router.get(
    '/:id/lineage',
    [param('id').isMongoId(), handleValidationErrors],
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const lineage = await findLineage(req.params.id);
            if (lineage.length === 0) throw new AppError(404, 'Organism not found');
            res.json({ success: true, data: lineage } satisfies ApiResponse<IOrganism[]>);
        } catch (err) {
            next(err);
        }
    },
);

// ─── GET /generations/:generationId/genome-distribution ──────────────────────

router.get(
    '/generation/:generationId/distribution',
    [param('generationId').isMongoId(), handleValidationErrors],
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const dist = await getGenomeDistribution(req.params.generationId);
            res.json({ success: true, data: dist } satisfies ApiResponse<typeof dist>);
        } catch (err) {
            next(err);
        }
    },
);

export default router;
