import {
    computeStats,
    computeDiversity,
    mutate,
    crossover,
    swapMutate,
    select,
    initPopulation,
} from '../../src/engine/geneticAlgo';
import type { SimulationConfig, OrganismPlain } from '../../src/types';

// ─── Shared fixture ───────────────────────────────────────────────────────────

const baseCfg: SimulationConfig = {
    populationSize:    10,
    genomeLength:      4,
    genomeEncoding:    'real',
    genomeMin:         0,
    genomeMax:         1,
    mutationRate:      0.5,
    crossoverRate:     1.0,
    elitismCount:      1,
    selectionStrategy: 'tournament',
    crossoverStrategy: 'single_point',
    maxGenerations:    10,
    fitnessFunctionId: 'onemax',
    environmentParams: {},
};

// ─── computeStats ─────────────────────────────────────────────────────────────

describe('computeStats', () => {
    it('handles empty input gracefully', () => {
        expect(computeStats([])).toEqual({ avg: 0, max: 0, min: 0, variance: 0 });
    });

    it('computes avg, max, min correctly', () => {
        const { avg, max, min } = computeStats([1, 2, 3, 4, 5]);
        expect(avg).toBe(3);
        expect(max).toBe(5);
        expect(min).toBe(1);
    });

    it('variance is 0 for a uniform array', () => {
        expect(computeStats([7, 7, 7]).variance).toBe(0);
    });

    it('variance is positive for non-uniform array', () => {
        expect(computeStats([0, 1]).variance).toBeGreaterThan(0);
    });
});

// ─── computeDiversity ────────────────────────────────────────────────────────

describe('computeDiversity', () => {
    it('returns 0 for fewer than 2 genomes', () => {
        expect(computeDiversity([[0, 1]], 'binary')).toBe(0);
    });

    it('returns 0 for identical genomes', () => {
        expect(computeDiversity([[1, 0], [1, 0]], 'binary')).toBe(0);
    });

    it('is strictly higher for a diverse population', () => {
        const diverse = computeDiversity([[0, 0], [1, 1]], 'binary');
        const uniform = computeDiversity([[0, 0], [0, 0]], 'binary');
        expect(diverse).toBeGreaterThan(uniform);
    });

    it('returns a value in [0, 1]', () => {
        const score = computeDiversity([[0, 0, 1], [1, 1, 0], [0, 1, 1]], 'binary');
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(1);
    });
});

// ─── initPopulation ───────────────────────────────────────────────────────────

describe('initPopulation', () => {
    it('returns the correct population size', () => {
        expect(initPopulation(baseCfg)).toHaveLength(baseCfg.populationSize);
    });

    it('respects genome length', () => {
        initPopulation(baseCfg).forEach(g => expect(g).toHaveLength(baseCfg.genomeLength));
    });

    it('binary encoding only contains 0 and 1', () => {
        const cfg = { ...baseCfg, genomeEncoding: 'binary' as const };
        initPopulation(cfg).forEach(g => g.forEach(v => expect([0, 1]).toContain(v)));
    });

    it('real encoding values stay within [genomeMin, genomeMax]', () => {
        initPopulation(baseCfg).forEach(g =>
            g.forEach(v => {
                expect(v).toBeGreaterThanOrEqual(baseCfg.genomeMin);
                expect(v).toBeLessThanOrEqual(baseCfg.genomeMax);
            })
        );
    });

    it('permutation encoding is a valid permutation of 0..length-1', () => {
        const cfg = { ...baseCfg, genomeEncoding: 'permutation' as const };
        const genomes = initPopulation(cfg);
        const expected = Array.from({ length: cfg.genomeLength }, (_, i) => i).sort();
        genomes.forEach(g => expect([...g].sort((a, b) => a - b)).toEqual(expected));
    });
});

// ─── mutate ───────────────────────────────────────────────────────────────────

describe('mutate', () => {
    it('preserves genome length', () => {
        const result = mutate([0.2, 0.5, 0.8, 0.1], { ...baseCfg, mutationRate: 1.0 });
        expect(result).toHaveLength(4);
    });

    it('flips every binary gene when mutationRate=1', () => {
        const cfg = { ...baseCfg, genomeEncoding: 'binary' as const, mutationRate: 1.0 };
        expect(mutate([0, 0, 0, 0], cfg)).toEqual([1, 1, 1, 1]);
        expect(mutate([1, 1, 1, 1], cfg)).toEqual([0, 0, 0, 0]);
    });

    it('never modifies genes when mutationRate=0', () => {
        const genome = [0.3, 0.6, 0.1, 0.9];
        expect(mutate(genome, { ...baseCfg, mutationRate: 0 })).toEqual(genome);
    });

    it('keeps real values within [genomeMin, genomeMax]', () => {
        const genome = Array.from({ length: 20 }, () => Math.random());
        const result = mutate(genome, { ...baseCfg, mutationRate: 1.0 });
        result.forEach(v => {
            expect(v).toBeGreaterThanOrEqual(baseCfg.genomeMin);
            expect(v).toBeLessThanOrEqual(baseCfg.genomeMax);
        });
    });
});

// ─── crossover ────────────────────────────────────────────────────────────────

describe('crossover', () => {
    const a = [0, 0, 0, 0, 0];
    const b = [1, 1, 1, 1, 1];

    it('returns unchanged copies when rate is 0', () => {
        const [ca, cb] = crossover(a, b, 'single_point', 0);
        expect(ca).toEqual(a);
        expect(cb).toEqual(b);
    });

    it('preserves genome length for every strategy', () => {
        for (const strategy of ['single_point', 'two_point', 'uniform', 'arithmetic'] as const) {
            const [ca, cb] = crossover(a, b, strategy, 1.0);
            expect(ca).toHaveLength(a.length);
            expect(cb).toHaveLength(b.length);
        }
    });

    it('single-point children together contain all values from both parents', () => {
        const [ca, cb] = crossover([0, 0, 0], [1, 1, 1], 'single_point', 1.0);
        // Each position is from one parent or the other
        ca.forEach((v, i) => expect(v + cb[i]).toBe(1));
    });
});

// ─── swapMutate ───────────────────────────────────────────────────────────────

describe('swapMutate', () => {
    it('preserves all gene values (just reorders)', () => {
        const genome = [0, 1, 2, 3, 4];
        const result = swapMutate(genome, 1.0);
        expect([...result].sort((a, b) => a - b)).toEqual(genome);
    });

    it('never mutates when rate is 0', () => {
        const genome = [0, 1, 2, 3];
        expect(swapMutate(genome, 0)).toEqual(genome);
    });
});

// ─── select ───────────────────────────────────────────────────────────────────

describe('select', () => {
    const pop: OrganismPlain[] = [
        { id: 'a', genome: [], fitness: 10 },
        { id: 'b', genome: [], fitness: 5  },
        { id: 'c', genome: [], fitness: 1  },
    ];

    it('elitist always returns the top organism', () => {
        for (let i = 0; i < 20; i++) {
            expect(select(pop, 'elitist').id).toBe('a');
        }
    });

    it('does not throw for any strategy', () => {
        for (const strategy of ['tournament', 'roulette', 'rank', 'elitist'] as const) {
            expect(() => select(pop, strategy)).not.toThrow();
        }
    });

    it('returns a member of the population', () => {
        const ids = pop.map(o => o.id);
        for (const strategy of ['tournament', 'roulette', 'rank'] as const) {
            expect(ids).toContain(select(pop, strategy).id);
        }
    });

    it('roulette falls back gracefully when total fitness is 0', () => {
        const zeroPop: OrganismPlain[] = [
            { id: 'x', genome: [], fitness: 0 },
            { id: 'y', genome: [], fitness: 0 },
        ];
        expect(() => select(zeroPop, 'roulette')).not.toThrow();
    });
});
