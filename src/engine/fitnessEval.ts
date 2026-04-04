import type { FitnessFunction, Genome } from '../types';

// ─── Registry ─────────────────────────────────────────────────────────────────

const registry = new Map<string, FitnessFunction>();

// ─── Built-in functions ───────────────────────────────────────────────────────

/**
 * OneMax — maximise the count of 1-bits.
 * Classic benchmark for binary encodings.
 */
registry.set('onemax', {
    id:          'onemax',
    label:       'OneMax',
    description: 'Maximise the count of 1-bits in a binary genome.',
    evaluate(genome: Genome): number {
        return genome.reduce((sum, g) => sum + (g === 1 ? 1 : 0), 0);
    },
});

/**
 * SumMax — maximise the sum of all gene values.
 * Works with real and integer encodings.
 */
registry.set('summax', {
    id:          'summax',
    label:       'Sum Maximisation',
    description: 'Maximise the sum of all gene values.',
    evaluate(genome: Genome): number {
        return genome.reduce((sum, g) => sum + g, 0);
    },
});

/**
 * Sphere — minimise Σ(xᵢ²).
 * Negated so that higher fitness = closer to origin.
 */
registry.set('sphere', {
    id:          'sphere',
    label:       'Sphere (minimisation)',
    description: 'Minimise Σ(xᵢ²). Fitness = −Σ(xᵢ²); optimum is 0.',
    evaluate(genome: Genome): number {
        return -genome.reduce((sum, g) => sum + g * g, 0);
    },
});

/**
 * Survival — biologically inspired fitness.
 * Genome layout: [speed, vision, camouflage, energy, ...extras ignored]
 * Environment params: temperature (0–1), foodAvailability (0–1), predatorPressure (0–1)
 *
 * Design rationale:
 *   - Temperature stress is buffered by the energy gene.
 *   - Food scarcity is offset by energy reserves.
 *   - Predator pressure is reduced by camouflage (60 %) and speed (40 %).
 *   - Vision provides a flat foraging bonus.
 */
registry.set('survival', {
    id:          'survival',
    label:       'Survival Fitness',
    description: 'Organism traits (speed, vision, camouflage, energy) evaluated against environment pressure.',
    evaluate(genome: Genome, params: Record<string, number>): number {
        const speed      = clamp01(genome[0] ?? 0.5);
        const vision     = clamp01(genome[1] ?? 0.5);
        const camouflage = clamp01(genome[2] ?? 0.5);
        const energy     = clamp01(genome[3] ?? 0.5);

        const temperature      = clamp01(params['temperature']      ?? 0.5);
        const foodAvailability = clamp01(params['foodAvailability'] ?? 0.5);
        const predatorPressure = clamp01(params['predatorPressure'] ?? 0.3);

        // Thermal tolerance: divergence from optimal 0.5 costs energy
        const tempFit  = 1 - Math.abs(temperature - 0.5) * 2 * (1 - energy);

        // Foraging: high energy reserves compensate for scarce food
        const foodFit  = foodAvailability + energy * (1 - foodAvailability);

        // Predator evasion: camouflage is primary, speed is secondary
        const predFit  = 1 - predatorPressure * (1 - 0.6 * camouflage - 0.4 * speed);

        const visionBonus = 0.1 * vision;

        return Math.max(0, tempFit * 0.3 + foodFit * 0.3 + predFit * 0.3 + visionBonus);
    },
});

function clamp01(v: number): number {
    return Math.max(0, Math.min(1, v));
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function getFitnessFunction(id: string): FitnessFunction {
    const fn = registry.get(id);
    if (!fn) {
        throw new Error(
            `Unknown fitness function: "${id}". Available: ${[...registry.keys()].join(', ')}`
        );
    }
    return fn;
}

export function listFitnessFunctions(): FitnessFunction[] {
    return [...registry.values()];
}

/** Register a custom fitness function at runtime (e.g. from tests or plugins). */
export function registerFitnessFunction(fn: FitnessFunction): void {
    registry.set(fn.id, fn);
}
