import type {
    SimulationConfig,
    OrganismPlain,
    TickResult,
    GenerationStats,
} from '../types';
import {
    initPopulation,
    select,
    crossover,
    mutate,
    swapMutate,
    computeStats,
    computeDiversity,
} from './geneticAlgo';
import { getFitnessFunction } from './fitnessEval';

// ─── Single generation tick ───────────────────────────────────────────────────

export function tick(
    config: SimulationConfig,
    currentGeneration: number,
    population: OrganismPlain[]
): TickResult {
    const startMs = Date.now();
    const fitnessFn = getFitnessFunction(config.fitnessFunctionId);

    // 1. Evaluate fitness for every organism
    const evaluated = population.map((org) => ({
        ...org,
        fitness: fitnessFn.evaluate(org.genome, config.environmentParams),
    }));

    // 2. Sort descending by fitness (required by rank & elitist selection)
    evaluated.sort((a, b) => b.fitness - a.fitness);

    // 3. Elitism — carry top N forward unchanged
    const elites = evaluated.slice(0, config.elitismCount).map((o) => ({
        ...o,
        parentAId: o.id,
        parentBId: undefined,
    }));

    // 4. Fill the rest of the next generation via selection + crossover + mutation
    const offspring: OrganismPlain[] = [];
    while (elites.length + offspring.length < config.populationSize) {
        const parentA = select(evaluated, config.selectionStrategy);
        const parentB = select(evaluated, config.selectionStrategy);

        const [childGenomeA, childGenomeB] = crossover(
            parentA.genome,
            parentB.genome,
            config.crossoverStrategy,
            config.crossoverRate
        );

        const mutatedA = config.genomeEncoding === 'permutation'
            ? swapMutate(childGenomeA, config.mutationRate)
            : mutate(childGenomeA, config);

        offspring.push({
            id:        crypto.randomUUID(),
            genome:    mutatedA,
            fitness:   0, // will be evaluated next tick
            parentAId: parentA.id,
            parentBId: parentB.id,
        });

        // Add second child if still room
        if (elites.length + offspring.length < config.populationSize) {
            const mutatedB = config.genomeEncoding === 'permutation'
                ? swapMutate(childGenomeB, config.mutationRate)
                : mutate(childGenomeB, config);

            offspring.push({
                id:        crypto.randomUUID(),
                genome:    mutatedB,
                fitness:   0,
                parentAId: parentA.id,
                parentBId: parentB.id,
            });
        }
    }

    const nextPopulation = [...elites, ...offspring];

    // 5. Compute generation statistics from the evaluated (current) population
    const fitnesses = evaluated.map((o) => o.fitness);
    const { avg, max, min, variance } = computeStats(fitnesses);
    const diversityScore = computeDiversity(
        evaluated.map((o) => o.genome),
        config.genomeEncoding
    );

    const stats: GenerationStats = {
        avgFitness:      avg,
        maxFitness:      max,
        minFitness:      min,
        fitnessVariance: variance,
        diversityScore,
        elapsedMs:       Date.now() - startMs,
    };

    // 6. Check termination conditions
    const shouldStop =
        currentGeneration + 1 >= config.maxGenerations ||
        (config.targetFitness !== undefined && max >= config.targetFitness);

    return {
        generation: currentGeneration + 1,
        population: nextPopulation,
        stats,
        shouldStop,
    };
}

// ─── Bootstrap first generation ──────────────────────────────────────────────

export function createInitialPopulation(config: SimulationConfig): OrganismPlain[] {
    const genomes = initPopulation(config);
    const fitnessFn = getFitnessFunction(config.fitnessFunctionId);
    return genomes.map((genome) => ({
        id:      crypto.randomUUID(),
        genome,
        fitness: fitnessFn.evaluate(genome, config.environmentParams),
    }));
}