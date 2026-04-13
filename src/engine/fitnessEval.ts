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
 * Survival — biologically inspired fitness with trait trade-offs.
 * Genome layout: [speed, vision, camouflage, energy, ...extras ignored]
 * Environment params: temperature (0–1), foodAvailability (0–1), predatorPressure (0–1)
 *
 * Trade-off model (life-history theory):
 *   - Total trait investment is capped at TRAIT_BUDGET (default 2.5 out of 4.0 max).
 *     Excess investment is taxed proportionally, so [1,1,1,1] is sub-optimal.
 *   - Speed and energy compete directly: locomotion is metabolically expensive.
 *     High speed reduces effective energy by SPEED_ENERGY_COST * speed.
 *   - Vision and camouflage trade against each other: bright eyes break crypsis.
 *     Effective camouflage = camouflage * (1 − VISION_CAMO_CONFLICT * vision).
 */
const TRAIT_BUDGET          = 2.5;  // "affordable" total investment
const BUDGET_PENALTY_SCALE  = 0.4;  // how sharply over-investment is punished
const SPEED_ENERGY_COST     = 0.35; // fraction of speed subtracted from effective energy
const VISION_CAMO_CONFLICT  = 0.3;  // fraction of vision that degrades camouflage

registry.set('survival', {
    id:          'survival',
    label:       'Survival Fitness',
    description: 'Organism traits (speed, vision, camouflage, energy) evaluated against environment pressure, with trade-off penalties for over-investment.',
    evaluate(genome: Genome, params: Record<string, number> = {}): number {
        const speed      = clamp01(genome[0] ?? 0.5);
        const vision     = clamp01(genome[1] ?? 0.5);
        const camouflage = clamp01(genome[2] ?? 0.5);
        const energy     = clamp01(genome[3] ?? 0.5);

        const temperature      = clamp01(params['temperature']      ?? 0.5);
        const foodAvailability = clamp01(params['foodAvailability'] ?? 0.5);
        const predatorPressure = clamp01(params['predatorPressure'] ?? 0.3);

        // ── Trade-off 1: locomotion costs metabolic energy ────────────────────
        const effectiveEnergy = clamp01(energy - SPEED_ENERGY_COST * speed);

        // ── Trade-off 2: high vision breaks camouflage (reflective eyes) ──────
        const effectiveCamo = clamp01(camouflage * (1 - VISION_CAMO_CONFLICT * vision));

        // ── Budget penalty: total investment above TRAIT_BUDGET is taxed ──────
        const totalInvestment = speed + vision + camouflage + energy;
        const excess          = Math.max(0, totalInvestment - TRAIT_BUDGET);
        const budgetPenalty   = 1 - BUDGET_PENALTY_SCALE * (excess / (4 - TRAIT_BUDGET));

        // ── Environmental pressures ───────────────────────────────────────────
        // Thermal tolerance: divergence from optimal 0.5 costs effective energy
        const tempFit  = 1 - Math.abs(temperature - 0.5) * 2 * (1 - effectiveEnergy);

        // Foraging: effective energy reserves compensate for scarce food
        const foodFit  = foodAvailability + effectiveEnergy * (1 - foodAvailability);

        // Predator evasion: effective camouflage is primary, speed is secondary
        const predFit  = 1 - predatorPressure * (1 - 0.6 * effectiveCamo - 0.4 * speed);

        const visionBonus = 0.1 * vision;

        return Math.max(0, (tempFit * 0.3 + foodFit * 0.3 + predFit * 0.3 + visionBonus) * budgetPenalty);
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
