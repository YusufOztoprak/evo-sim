import type { SimulationConfig, Genome, OrganismPlain, SelectionStrategy, CrossoverStrategy, GenomeEncoding } from '../types';

// ─── Population initialisation ────────────────────────────────────────────────

export function initPopulation(config: SimulationConfig): Genome[] {
    const { populationSize, genomeLength, genomeEncoding, genomeMin, genomeMax } = config;

    return Array.from({ length: populationSize }, () => {
        if (genomeEncoding === 'binary') {
            return Array.from({ length: genomeLength }, () => Math.round(Math.random()));
        }

        if (genomeEncoding === 'permutation') {
            const arr = Array.from({ length: genomeLength }, (_, i) => i);
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
        }

        // real | integer
        return Array.from({ length: genomeLength }, () => {
            const val = genomeMin + Math.random() * (genomeMax - genomeMin);
            return genomeEncoding === 'integer' ? Math.round(val) : val;
        });
    });
}

// ─── Selection ────────────────────────────────────────────────────────────────

export function select(population: OrganismPlain[], strategy: SelectionStrategy): OrganismPlain {
    switch (strategy) {
        case 'tournament': return tournamentSelect(population, 3);
        case 'roulette':   return rouletteSelect(population);
        case 'rank':       return rankSelect(population);
        case 'elitist':    return population[0]; // population is pre-sorted desc
    }
}

function tournamentSelect(population: OrganismPlain[], k: number): OrganismPlain {
    let best = population[Math.floor(Math.random() * population.length)];
    for (let i = 1; i < k; i++) {
        const candidate = population[Math.floor(Math.random() * population.length)];
        if (candidate.fitness > best.fitness) best = candidate;
    }
    return best;
}

function rouletteSelect(population: OrganismPlain[]): OrganismPlain {
    const totalFitness = population.reduce((sum, o) => sum + Math.max(0, o.fitness), 0);
    if (totalFitness === 0) return population[Math.floor(Math.random() * population.length)];

    let r = Math.random() * totalFitness;
    for (const org of population) {
        r -= Math.max(0, org.fitness);
        if (r <= 0) return org;
    }
    return population[population.length - 1];
}

function rankSelect(population: OrganismPlain[]): OrganismPlain {
    // population is sorted desc — rank n (best) down to 1 (worst)
    const n = population.length;
    const totalWeight = (n * (n + 1)) / 2;
    let r = Math.random() * totalWeight;
    for (let i = 0; i < n; i++) {
        r -= (n - i);
        if (r <= 0) return population[i];
    }
    return population[n - 1];
}

// ─── Crossover ────────────────────────────────────────────────────────────────

export function crossover(
    genomeA: Genome,
    genomeB: Genome,
    strategy: CrossoverStrategy,
    rate: number,
): [Genome, Genome] {
    if (Math.random() > rate) return [[...genomeA], [...genomeB]];

    const len = genomeA.length;

    switch (strategy) {
        case 'single_point': {
            const pt = 1 + Math.floor(Math.random() * (len - 1));
            return [
                [...genomeA.slice(0, pt), ...genomeB.slice(pt)],
                [...genomeB.slice(0, pt), ...genomeA.slice(pt)],
            ];
        }

        case 'two_point': {
            let p1 = Math.floor(Math.random() * len);
            let p2 = Math.floor(Math.random() * len);
            if (p1 > p2) [p1, p2] = [p2, p1];
            return [
                [...genomeA.slice(0, p1), ...genomeB.slice(p1, p2), ...genomeA.slice(p2)],
                [...genomeB.slice(0, p1), ...genomeA.slice(p1, p2), ...genomeB.slice(p2)],
            ];
        }

        case 'uniform': {
            const childA: Genome = [];
            const childB: Genome = [];
            for (let i = 0; i < len; i++) {
                if (Math.random() < 0.5) {
                    childA.push(genomeA[i]); childB.push(genomeB[i]);
                } else {
                    childA.push(genomeB[i]); childB.push(genomeA[i]);
                }
            }
            return [childA, childB];
        }

        case 'arithmetic': {
            const α = Math.random();
            return [
                genomeA.map((g, i) =>  α * g + (1 - α) * genomeB[i]),
                genomeA.map((g, i) => (1 - α) * g + α  * genomeB[i]),
            ];
        }
    }
}

// ─── Mutation ─────────────────────────────────────────────────────────────────

/** Standard per-gene mutation for binary / real / integer encodings. */
export function mutate(genome: Genome, config: SimulationConfig): Genome {
    const { mutationRate, genomeEncoding, genomeMin, genomeMax } = config;
    return genome.map((gene) => {
        if (Math.random() > mutationRate) return gene;
        if (genomeEncoding === 'binary') return gene === 0 ? 1 : 0;
        // Gaussian-ish perturbation, 10 % of range
        const noise   = (Math.random() - 0.5) * (genomeMax - genomeMin) * 0.1;
        const clamped = Math.max(genomeMin, Math.min(genomeMax, gene + noise));
        return genomeEncoding === 'integer' ? Math.round(clamped) : clamped;
    });
}

/** Swap mutation for permutation genomes — preserves validity. */
export function swapMutate(genome: Genome, mutationRate: number): Genome {
    const g = [...genome];
    for (let i = 0; i < g.length; i++) {
        if (Math.random() < mutationRate) {
            const j = Math.floor(Math.random() * g.length);
            [g[i], g[j]] = [g[j], g[i]];
        }
    }
    return g;
}

// ─── Statistics ───────────────────────────────────────────────────────────────

export function computeStats(
    fitnesses: number[],
): { avg: number; max: number; min: number; variance: number } {
    const n = fitnesses.length;
    if (n === 0) return { avg: 0, max: 0, min: 0, variance: 0 };

    const max = Math.max(...fitnesses);
    const min = Math.min(...fitnesses);
    const avg = fitnesses.reduce((s, f) => s + f, 0) / n;
    const variance = fitnesses.reduce((s, f) => s + (f - avg) ** 2, 0) / n;
    return { avg, max, min, variance };
}

// ─── Diversity ────────────────────────────────────────────────────────────────

/**
 * Returns a normalised [0, 1] diversity score.
 * Samples up to 50 organisms to keep runtime O(1) for large populations.
 */
export function computeDiversity(genomes: Genome[], encoding: GenomeEncoding): number {
    const n = genomes.length;
    if (n < 2 || genomes[0].length === 0) return 0;

    const sample = n > 50
        ? Array.from({ length: 50 }, () => genomes[Math.floor(Math.random() * n)])
        : genomes;

    let totalDist = 0;
    let pairs     = 0;
    for (let i = 0; i < sample.length; i++) {
        for (let j = i + 1; j < sample.length; j++) {
            totalDist += pairDistance(sample[i], sample[j], encoding);
            pairs++;
        }
    }

    const avgDist   = pairs > 0 ? totalDist / pairs : 0;
    const genomeLen = genomes[0].length;
    // Normalise against genome length (Hamming max = length; Euclidean max ≈ length)
    return Math.min(1, avgDist / genomeLen);
}

function pairDistance(a: Genome, b: Genome, encoding: GenomeEncoding): number {
    if (encoding === 'binary' || encoding === 'permutation') {
        return a.reduce((sum, g, i) => sum + (g !== b[i] ? 1 : 0), 0);
    }
    return Math.sqrt(a.reduce((sum, g, i) => sum + (g - b[i]) ** 2, 0));
}
