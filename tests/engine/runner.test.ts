import { tick, createInitialPopulation, snapshotPopulation } from '../../src/engine/runner';
import type { SimulationConfig, OrganismPlain } from '../../src/types';

// ─── Shared fixture ───────────────────────────────────────────────────────────

const baseCfg: SimulationConfig = {
    populationSize:    10,
    genomeLength:      4,
    genomeEncoding:    'real',
    genomeMin:         0,
    genomeMax:         1,
    mutationRate:      0.05,
    crossoverRate:     0.8,
    elitismCount:      2,
    selectionStrategy: 'tournament',
    crossoverStrategy: 'single_point',
    maxGenerations:    10,
    fitnessFunctionId: 'survival',
    environmentParams: { temperature: 0.5, foodAvailability: 0.5, predatorPressure: 0.3 },
};

// ─── createInitialPopulation ──────────────────────────────────────────────────

describe('createInitialPopulation', () => {
    it('creates the correct number of organisms', () => {
        expect(createInitialPopulation(baseCfg)).toHaveLength(baseCfg.populationSize);
    });

    it('evaluates fitness for all organisms', () => {
        createInitialPopulation(baseCfg).forEach(o =>
            expect(o.fitness).toBeGreaterThanOrEqual(0)
        );
    });

    it('generates genomes of the correct length', () => {
        createInitialPopulation(baseCfg).forEach(o =>
            expect(o.genome).toHaveLength(baseCfg.genomeLength)
        );
    });

    it('assigns unique IDs to every organism', () => {
        const pop = createInitialPopulation(baseCfg);
        const ids = new Set(pop.map(o => o.id));
        expect(ids.size).toBe(pop.length);
    });

    it('generates MongoDB-compatible ObjectId strings', () => {
        const { Types } = require('mongoose');
        const pop = createInitialPopulation(baseCfg);
        pop.forEach(o => expect(Types.ObjectId.isValid(o.id)).toBe(true));
    });
});

// ─── snapshotPopulation ───────────────────────────────────────────────────────

describe('snapshotPopulation', () => {
    it('uses the existing fitness values without re-evaluating', () => {
        const pop: OrganismPlain[] = Array.from({ length: 5 }, (_, i) => ({
            id: `org-${i}`,
            genome: [0.5, 0.5, 0.5, 0.5],
            fitness: i * 0.2, // hand-set, should be preserved
        }));
        const { stats } = snapshotPopulation(baseCfg, pop, 0);
        expect(stats.maxFitness).toBeCloseTo(0.8);
        expect(stats.minFitness).toBeCloseTo(0.0);
        expect(stats.avgFitness).toBeCloseTo(0.4);
    });

    it('sets elapsedMs to 0', () => {
        const pop = createInitialPopulation(baseCfg);
        expect(snapshotPopulation(baseCfg, pop, 0).stats.elapsedMs).toBe(0);
    });

    it('returns environmentParams for the given generation', () => {
        const pop = createInitialPopulation(baseCfg);
        const { environmentParams } = snapshotPopulation(baseCfg, pop, 0);
        expect(environmentParams).toHaveProperty('temperature');
        expect(environmentParams['temperature']).toBe(0.5);
    });

    it('resolves dynamic env params correctly', () => {
        const cfg: SimulationConfig = {
            ...baseCfg,
            dynamicEnv: {
                enabled:       true,
                shiftMode:     'abrupt',
                shiftInterval: 10,
                keyframes: [
                    { generation: 0,  params: { temperature: 0.1, foodAvailability: 0.5, predatorPressure: 0.3 } },
                    { generation: 10, params: { temperature: 0.9, foodAvailability: 0.5, predatorPressure: 0.3 } },
                ],
            },
        };
        const pop = createInitialPopulation(cfg);
        const { environmentParams } = snapshotPopulation(cfg, pop, 0);
        expect(environmentParams['temperature']).toBeCloseTo(0.1);
    });
});

// ─── tick ─────────────────────────────────────────────────────────────────────

describe('tick', () => {
    let population: OrganismPlain[];
    beforeEach(() => { population = createInitialPopulation(baseCfg); });

    it('increments the generation counter', () => {
        expect(tick(baseCfg, 0, population).generation).toBe(1);
        expect(tick(baseCfg, 7, population).generation).toBe(8);
    });

    it('maintains exact population size', () => {
        expect(tick(baseCfg, 0, population).population).toHaveLength(baseCfg.populationSize);
    });

    it('includes environmentParams in the result', () => {
        const result = tick(baseCfg, 0, population);
        expect(result.environmentParams).toHaveProperty('temperature');
    });

    it('shouldStop is false before maxGenerations', () => {
        expect(tick(baseCfg, 0, population).shouldStop).toBe(false);
    });

    it('shouldStop is true when maxGenerations is reached', () => {
        expect(tick({ ...baseCfg, maxGenerations: 1 }, 0, population).shouldStop).toBe(true);
    });

    it('shouldStop is true when targetFitness is reached', () => {
        const highFitPop: OrganismPlain[] = Array.from({ length: 10 }, (_, i) => ({
            id: `org-${i}`,
            genome: [1, 1, 1, 1],
            fitness: 0.99,
        }));
        const result = tick({ ...baseCfg, targetFitness: 0.9 }, 0, highFitPop);
        expect(result.shouldStop).toBe(true);
    });

    it('elites preserve ancestry (no self-reference)', () => {
        const result = tick(baseCfg, 0, population);
        const eliteIds = new Set(result.population.slice(0, baseCfg.elitismCount).map(o => o.id));
        result.population.slice(0, baseCfg.elitismCount).forEach(elite => {
            // parentAId must not equal the organism's own id
            expect(elite.parentAId).not.toBe(elite.id);
        });
    });

    it('best fitness is non-decreasing across generations (with elitism)', () => {
        let pop = createInitialPopulation(baseCfg);
        let prevMax = 0;
        for (let gen = 0; gen < 5; gen++) {
            const result = tick(baseCfg, gen, pop);
            // Allow tiny floating-point drift
            expect(result.stats.maxFitness).toBeGreaterThanOrEqual(prevMax - 1e-9);
            prevMax = result.stats.maxFitness;
            pop = result.population;
        }
    });

    it('applies dynamic env in gradual mode', () => {
        const cfg: SimulationConfig = {
            ...baseCfg,
            dynamicEnv: {
                enabled:       true,
                shiftMode:     'gradual',
                shiftInterval: 10,
                keyframes: [
                    { generation: 0,  params: { temperature: 0.0, foodAvailability: 0.5, predatorPressure: 0.3 } },
                    { generation: 10, params: { temperature: 1.0, foodAvailability: 0.5, predatorPressure: 0.3 } },
                ],
            },
        };
        const result = tick(cfg, 5, population);
        expect(result.environmentParams['temperature']).toBeCloseTo(0.5, 1);
    });
});
