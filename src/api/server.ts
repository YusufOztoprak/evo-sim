import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { connectDb } from '../db';
import { errorHandler } from './middleware/errorHandler';
import simulationsRouter from './routes/simulations';
import populationRouter  from './routes/population';
import genomesRouter     from './routes/genomes';
import analyticsRouter   from './routes/analytics';

const PORT = Number(process.env.PORT ?? 3000);

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

async function bootstrap(): Promise<void> {
    await connectDb();

    const app = express();

    // ── CORS ──────────────────────────────────────────────────────────────────
    app.use(cors({
        origin: (origin, cb) => {
            // Allow server-to-server (no origin) and explicitly listed origins.
            // Falls back to permissive when ALLOWED_ORIGINS is not configured.
            if (!origin || ALLOWED_ORIGINS.length === 0 || ALLOWED_ORIGINS.includes(origin)) {
                cb(null, true);
            } else {
                cb(new Error(`CORS: origin ${origin} not allowed`));
            }
        },
        methods:     ['GET', 'POST', 'DELETE', 'OPTIONS'],
        credentials: false,
    }));

    // ── Rate limiting ─────────────────────────────────────────────────────────
    // General API limiter — 120 requests / minute per IP
    app.use('/simulations', rateLimit({
        windowMs:        60_000,
        max:             120,
        standardHeaders: true,
        legacyHeaders:   false,
        message:         { success: false, error: 'Too many requests, please slow down.' },
    }));

    // Start endpoint is expensive — limit to 10 runs / minute per IP
    app.use('/simulations/:id/start', rateLimit({
        windowMs:        60_000,
        max:             10,
        standardHeaders: true,
        legacyHeaders:   false,
        message:         { success: false, error: 'Simulation start rate limit exceeded.' },
    }));

    app.use(express.json({ limit: '1mb' }));

    // ── Health check ──────────────────────────────────────────────────────────
    app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

    // ── Routes ────────────────────────────────────────────────────────────────
    app.use('/simulations', simulationsRouter);
    app.use('/simulations', populationRouter);
    app.use('/organisms',   genomesRouter);
    app.use('/analytics',   analyticsRouter);

    // ── Global error handler (must be registered last) ────────────────────────
    app.use(errorHandler);

    app.listen(PORT, () => {
        console.log(`[server] Listening on port ${PORT}`);
    });
}

bootstrap().catch((err) => {
    console.error('[server] Fatal startup error:', err);
    process.exit(1);
});
