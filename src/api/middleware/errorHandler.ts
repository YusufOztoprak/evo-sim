import type { Request, Response, NextFunction } from 'express';
import type { ApiResponse } from '../../types';

// ─── Application error ────────────────────────────────────────────────────────

/** Throw this from route handlers to return a specific HTTP status + message. */
export class AppError extends Error {
    constructor(
        public readonly statusCode: number,
        message: string,
    ) {
        super(message);
        this.name = 'AppError';
    }
}

// ─── Global error handler ─────────────────────────────────────────────────────

export function errorHandler(
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction,
): void {
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            success: false,
            error:   err.message,
        } satisfies ApiResponse<never>);
        return;
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        res.status(400).json({
            success: false,
            error:   err.message,
        } satisfies ApiResponse<never>);
        return;
    }

    console.error('[error]', err);
    res.status(500).json({
        success: false,
        error:   'Internal server error',
    } satisfies ApiResponse<never>);
}
