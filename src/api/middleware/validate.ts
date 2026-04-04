import { validationResult } from 'express-validator';
import type { Request, Response, NextFunction } from 'express';
import type { ApiResponse } from '../../types';

/**
 * Drop this as the last item in any route's validator array.
 * It collects express-validator errors and short-circuits with a 400 if any exist.
 */
export function handleValidationErrors(
    req: Request,
    res: Response,
    next: NextFunction,
): void {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({
            success: false,
            error:   errors.array().map((e) => e.msg).join('; '),
        } satisfies ApiResponse<never>);
        return;
    }
    next();
}
