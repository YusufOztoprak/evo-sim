# EvoSim — Evolutionary Population Simulator

[![Live Demo](https://img.shields.io/badge/demo-live-00ff88?style=flat-square)](https://evo-sim-ten.vercel.app)
[![API](https://img.shields.io/badge/API-Railway-7c3aed?style=flat-square)](https://evo-sim-production.up.railway.app/health)
[![License: MIT](https://img.shields.io/badge/license-MIT-06b6d4?style=flat-square)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

A production-grade full-stack system that simulates **biological evolution** using genetic algorithms. Organisms evolve across generations under configurable environmental pressure — every generation is persisted, visualised in real time, and queryable via REST API.

**[→ Live Demo](https://evo-sim-ten.vercel.app)** · **[→ API](https://evo-sim-production.up.railway.app/health)**

---

## What it does

1. **Configure** a population: genome encoding, size, selection strategy, fitness function, environment parameters.
2. **Run** the simulation — the engine applies selection → crossover → mutation each generation.
3. **Observe** evolution: fitness climbs, diversity spreads, species emerge and go extinct.
4. **Analyse** results: per-generation fitness curves, top organisms, ancestor lineage, genome distribution.

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  React Frontend                  │
│  Landing · Dashboard · Simulation View · Science │
│         Vercel · Vite · Recharts · Framer        │
└────────────────────┬────────────────────────────┘
                     │ REST / JSON
┌────────────────────▼────────────────────────────┐
│              Express REST API                    │
│  /simulations  /organisms  /analytics            │
│         Railway · Node.js · TypeScript           │
├──────────────────────────────────────────────────┤
│           Pure Genetic Algorithm Engine          │
│  runner · geneticAlgo · fitnessEval              │
│  speciation · environment                        │
├──────────────────────────────────────────────────┤
│         Repository / Mongoose Layer              │
│  Simulation · Generation · Organism · Species    │
├──────────────────────────────────────────────────┤
│                  MongoDB Atlas                   │
└──────────────────────────────────────────────────┘
```

**Key design principle:** The engine (`src/engine/`) is completely pure — no database, no HTTP. It takes plain data in and returns plain data out. This makes it independently testable and re-usable.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Recharts |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB (Mongoose) — hosted on Atlas |
| Deployment | Vercel (frontend) · Railway (API) |
| Security | CORS, express-rate-limit, express-validator, Zod |

---

## Genetic Algorithm Engine

### Supported Configurations

| Parameter | Options |
|---|---|
| **Genome Encoding** | `binary` · `real` · `integer` · `permutation` |
| **Selection** | `tournament` · `roulette` · `rank` · `elitist` |
| **Crossover** | `single_point` · `two_point` · `uniform` · `arithmetic` |
| **Fitness Functions** | `onemax` · `summax` · `sphere` · `survival` |

### Built-in Fitness Functions

- **OneMax** — maximise count of 1-bits (binary benchmark)
- **SumMax** — maximise sum of gene values
- **Sphere** — minimise Σ(xᵢ²) (continuous benchmark)
- **Survival** — biologically-inspired: organism traits (speed, vision, camouflage, energy) vs. environment (temperature, food availability, predator pressure)

### Verified Behaviour

OneMax benchmark with 80 organisms, genome length 20:

| Generation | Avg Fitness | Max Fitness |
|---|---|---|
| 1 | 9.91 / 20 | 15 |
| 5 | 14.54 / 20 | 17 |
| 11 | 17.16 / 20 | **20 ✓** |
| 30 | 18.74 / 20 | 20 |

Population converges to the global optimum in ~11 generations — consistent with theoretical expectations for tournament selection + single-point crossover on binary genomes.

---

## API Reference

### Simulations

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/simulations` | Create a simulation |
| `GET` | `/simulations` | List simulations (paginated) |
| `GET` | `/simulations/:id` | Get simulation by ID |
| `POST` | `/simulations/:id/start` | Run the full simulation |
| `POST` | `/simulations/:id/stop` | Pause a running simulation |
| `DELETE` | `/simulations/:id` | Delete simulation |

### Population & Generations

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/simulations/:id/generations` | Generation history |
| `GET` | `/simulations/:id/generations/latest` | Latest generation snapshot |
| `GET` | `/simulations/:id/top-organisms` | Top N organisms by fitness |
| `GET` | `/simulations/generation/:genId/organisms` | All organisms in a generation |

### Organisms

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/organisms/:id` | Organism detail |
| `GET` | `/organisms/:id/lineage` | Ancestor chain (parentAId walk) |
| `GET` | `/organisms/generation/:genId/distribution` | Genome + fitness dump |

### Analytics

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/analytics/simulations/:id/fitness-history` | Per-generation avg/max/min |
| `GET` | `/analytics/simulations/:id/summary` | Overview + species stats |
| `GET` | `/analytics/fitness-functions` | List available fitness functions |

### Example: Create & run a simulation

```bash
# 1. Create
curl -X POST https://evo-sim-production.up.railway.app/simulations \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My First Simulation",
    "config": {
      "populationSize": 100,
      "genomeLength": 20,
      "genomeEncoding": "binary",
      "genomeMin": 0,
      "genomeMax": 1,
      "mutationRate": 0.05,
      "crossoverRate": 0.8,
      "elitismCount": 2,
      "selectionStrategy": "tournament",
      "crossoverStrategy": "single_point",
      "maxGenerations": 50,
      "fitnessFunctionId": "onemax",
      "environmentParams": {}
    }
  }'

# 2. Start (returns when complete)
curl -X POST https://evo-sim-production.up.railway.app/simulations/<id>/start

# 3. Analyse
curl https://evo-sim-production.up.railway.app/analytics/simulations/<id>/fitness-history
```

---

## Local Development

### Prerequisites

- Node.js 20+
- MongoDB (local or Atlas URI)

### Backend

```bash
git clone https://github.com/YusufOztoprak/evo-sim.git
cd evo-sim
npm install
cp .env.example .env   # set MONGODB_URI
npm run dev            # ts-node-dev hot reload on :3000
```

### Frontend

```bash
cd client
npm install
# set VITE_API_URL in client/.env
npm run dev            # Vite dev server on :5173
```

### Build

```bash
# Backend
npm run build          # tsc → dist/

# Frontend
cd client && npm run build   # Vite → client/dist/
```

---

## Project Structure

```
evo-sim/
├── src/
│   ├── engine/            # Pure GA engine (no DB, no HTTP)
│   │   ├── runner.ts      # tick() — one generation cycle
│   │   ├── geneticAlgo.ts # Selection, crossover, mutation, stats
│   │   ├── fitnessEval.ts # Fitness function registry
│   │   ├── speciation.ts  # Genome-distance species clustering
│   │   └── environment.ts # Environment parameter helpers
│   ├── models/            # Mongoose schemas
│   ├── repositories/      # DB access layer (lean() → plain objects)
│   ├── api/
│   │   ├── routes/        # Express routers
│   │   ├── middleware/    # errorHandler, validate
│   │   └── server.ts      # App bootstrap
│   ├── types/index.ts     # Shared interfaces (no Mongoose imports)
│   └── db.ts              # MongoDB connection
└── client/                # React frontend (Vite)
    ├── src/
    │   ├── pages/         # Landing, Dashboard, SimulationView, Science
    │   ├── components/    # Navbar, Footer, CreateModal, EvolutionCanvas
    │   └── api/client.ts  # Axios API wrapper
    └── vercel.json
```

---

## Science

This project implements core concepts from evolutionary computation:

- **Natural Selection** — organisms are selected proportionally to fitness
- **Genetic Crossover** — recombination of parent genomes produces offspring
- **Mutation** — per-gene stochastic perturbation maintains diversity
- **Speciation** — genome-distance clustering tracks diverging sub-populations
- **Elitism** — top N organisms survive unchanged, preventing regression

For a detailed explanation of the biology and mathematics, visit the [Science page](https://evo-sim-ten.vercel.app/science).

---

## Roadmap

- [ ] BullMQ background job queue for async simulation execution
- [ ] WebSocket / SSE for real-time generation streaming
- [ ] Custom fitness function upload (sandboxed evaluation)
- [ ] Multi-objective optimisation (Pareto front)
- [ ] Simulation comparison view (side-by-side fitness curves)

---

## License

MIT © [Yusuf Öztoprak](https://github.com/YusufOztoprak)
