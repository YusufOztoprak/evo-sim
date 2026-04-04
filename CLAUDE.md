# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development (hot-reload via ts-node-dev)
npm run dev

# Build to dist/
npm run build

# Run compiled output
npm start

# Run all tests (--runInBand keeps them serial — important for DB tests)
npm test

# Run a single test file
npx jest src/path/to/file.test.ts --runInBand

# Watch mode
npm run test:watch
```

TypeScript is compiled with `strict: true`, targeting ES2022/CommonJS. Output goes to `dist/`, source root is `src/`.

## Environment

Requires `MONGODB_URI` set in `.env` (or environment). The app won't start without it. BullMQ implies Redis is also needed for job queue functionality.

## Architecture

This is a **Node.js/Express REST API** for running evolutionary algorithm simulations, backed by **MongoDB via Mongoose**.

### Layer diagram

```
HTTP Request
    ↓
src/api/routes/        — Express routers (simulations, population, genomes, analytics)
    ↓
src/api/middleware/    — errorHandler.ts (global), validate.ts (express-validator)
    ↓
src/repositories/      — DB access layer (simulationRepo, generationRepo, organismRepo, speciesRepo)
    ↓
src/models/            — Mongoose schemas (Simulation, Generation, Organism, Species)
    ↓
MongoDB
```

The **engine** (`src/engine/`) is a **pure, synchronous layer** — no DB, no HTTP. It only works with plain TypeScript types from `src/types/index.ts`.

```
src/engine/runner.ts       — tick() runs one generation; createInitialPopulation() bootstraps
src/engine/geneticAlgo.ts  — selection, crossover, mutation, stats, diversity
src/engine/fitnessEval.ts  — registry of named FitnessFunction implementations
src/engine/speciation.ts   — species assignment logic
src/engine/environment.ts  — environment parameter helpers
```

### Key design decisions

- **`src/types/index.ts` is the shared contract**: plain interfaces (`ISimulation`, `IOrganism`, `IGeneration`, `ISpecies`, `OrganismPlain`, `TickResult`) with no Mongoose imports. The engine, repositories, and API layer all import from here.
- **Engine never touches the DB**: `tick()` takes `OrganismPlain[]` and returns `TickResult`. Persistence is the caller's responsibility.
- **Repositories return `.lean()` or `.toObject()`** so callers always receive plain JS objects, not Mongoose documents.
- **Organisms store parent lineage** (`parentAId`, `parentBId`) enabling ancestry tracing via `findLineage()` in `organismRepo`.
- **`SimulationSchema` uses `optimisticConcurrency: true`** — important when concurrent requests update simulation state.
- **BullMQ** is listed as a dependency, suggesting the simulation `tick` loop is intended to run as a background job queue (not yet wired in the current scaffolding).

### Data model relationships

```
Simulation (1)
  └── Generation (many, unique on simulationId + generationNumber)
        └── Organism (many per generation; references parentAId/parentBId)
              └── Species (optional; organisms grouped by genome similarity)
```

All cross-document references are stored as `String` (not `ObjectId`) so the engine's plain `id: string` can round-trip without casting.
