import { assignSpecies, clusterIntoSpecies, genomeDistance } from '../../src/engine/speciation';
import type { ISpecies } from '../../src/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeSpecies(id: string, genome: number[]): ISpecies {
    return {
        _id:                  id,
        simulationId:         'sim1',
        label:                id,
        representativeGenome: genome,
        memberCount:          1,
        firstSeenGeneration:  0,
        lastSeenGeneration:   0,
        isExtinct:            false,
        createdAt:            new Date(),
        updatedAt:            new Date(),
    };
}

// ─── genomeDistance ───────────────────────────────────────────────────────────

describe('genomeDistance', () => {
    it('is 0 for identical genomes', () => {
        expect(genomeDistance([0, 1, 0], [0, 1, 0])).toBe(0);
    });

    it('is 1 for fully opposite binary genomes', () => {
        expect(genomeDistance([0, 0, 0], [1, 1, 1])).toBeCloseTo(1);
    });

    it('is symmetric', () => {
        const a = [0.1, 0.5, 0.9];
        const b = [0.9, 0.3, 0.1];
        expect(genomeDistance(a, b)).toBeCloseTo(genomeDistance(b, a));
    });

    it('handles empty genomes without throwing', () => {
        expect(genomeDistance([], [])).toBe(0);
    });
});

// ─── assignSpecies ────────────────────────────────────────────────────────────

describe('assignSpecies', () => {
    const sp = [makeSpecies('sp1', [0.0, 0.0, 0.0])];

    it('assigns to a species within the threshold', () => {
        const result = assignSpecies([0.05, 0.05, 0.05], sp);
        expect(result.isNew).toBe(false);
        expect(result.speciesId).toBe('sp1');
    });

    it('returns isNew=true when genome is beyond the threshold', () => {
        const result = assignSpecies([1.0, 1.0, 1.0], sp);
        expect(result.isNew).toBe(true);
        expect(result.speciesId).toBeNull();
    });

    it('skips extinct species entirely', () => {
        const extinct = { ...sp[0], isExtinct: true };
        const result  = assignSpecies([0.05, 0.05, 0.05], [extinct]);
        expect(result.isNew).toBe(true);
    });

    it('returns isNew=true for an empty species list', () => {
        const result = assignSpecies([0.5, 0.5], []);
        expect(result.isNew).toBe(true);
    });

    it('assigns to the CLOSEST species, not just the first within threshold', () => {
        // Note: genomeDistance uses a binary-like heuristic when all values are 0 or 1,
        // so we use clearly non-binary values to exercise the Euclidean path.
        const sp1 = makeSpecies('far-ish', [0.3, 0.3]);
        const sp2 = makeSpecies('closest', [0.1, 0.1]);
        const result = assignSpecies([0.15, 0.15], [sp1, sp2]);
        expect(result.speciesId).toBe('closest');
    });
});

// ─── clusterIntoSpecies ───────────────────────────────────────────────────────

describe('clusterIntoSpecies', () => {
    it('groups identical genomes into one cluster', () => {
        const genomes = [[0, 0], [0, 0], [0, 0]];
        const clusters = clusterIntoSpecies(genomes);
        expect(clusters.size).toBe(1);
    });

    it('creates separate clusters for sufficiently different genomes', () => {
        const genomes = [[0, 0], [1, 1], [0, 0], [1, 1]];
        const clusters = clusterIntoSpecies(genomes, 0.3);
        expect(clusters.size).toBe(2);
    });

    it('assigns every organism to exactly one cluster', () => {
        const genomes = [[0.1, 0.2], [0.8, 0.9], [0.15, 0.25], [0.85, 0.95]];
        const clusters = clusterIntoSpecies(genomes);
        const total = [...clusters.values()].reduce((sum, arr) => sum + arr.length, 0);
        expect(total).toBe(genomes.length);
    });

    it('uses the first genome as the representative of its cluster', () => {
        const genomes = [[0.0, 0.0], [0.05, 0.05], [1.0, 1.0]];
        const clusters = clusterIntoSpecies(genomes, 0.3);
        // Representative index 0 should exist as a key
        expect(clusters.has(0)).toBe(true);
    });

    it('handles single genome', () => {
        const clusters = clusterIntoSpecies([[0.5, 0.5]]);
        expect(clusters.size).toBe(1);
        expect([...clusters.values()][0]).toEqual([0]);
    });
});
