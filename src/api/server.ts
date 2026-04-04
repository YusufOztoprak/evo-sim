import 'dotenv/config';
import express from 'express';
import { connectDb } from '../db';
import { errorHandler } from './middleware/errorHandler';
import simulationsRouter from './routes/simulations';
import populationRouter  from './routes/population';
import genomesRouter     from './routes/genomes';
import analyticsRouter   from './routes/analytics';

const PORT = Number(process.env.PORT ?? 3000);

async function bootstrap(): Promise<void> {
    await connectDb();

    const app = express();
    app.use(express.json({ limit: '5mb' }));

    // ── Health check ──────────────────────────────────────────────────────────
    app.get('/health', (_req, res) => res.json({ status: 'ok' }));

    // ── Routes ────────────────────────────────────────────────────────────────
    app.use('/simulations', simulationsRouter);
    // Population and generation sub-resources live under /simulations/:id
    app.use('/simulations', populationRouter);
    // Organism detail / lineage / genome distribution
    app.use('/organisms', genomesRouter);
    // Cross-cutting analytics and fitness-function discovery
    app.use('/analytics', analyticsRouter);

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
