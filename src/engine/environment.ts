import type { DynamicEnvConfig, EnvKeyframe } from '../types';

// ─── Default environment parameters ──────────────────────────────────────────

export const DEFAULT_ENV_PARAMS: Record<string, number> = {
    temperature:       0.5,   // 0 = arctic, 1 = desert
    foodAvailability:  0.5,   // 0 = barren, 1 = abundant
    predatorPressure:  0.3,   // 0 = none,   1 = extreme
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Merge caller-supplied params over the defaults and clamp all values to [0, 1].
 * This ensures the survival fitness function always receives valid inputs.
 */
export function normalizeEnvParams(
    params: Record<string, number> = {},
): Record<string, number> {
    const merged: Record<string, number> = { ...DEFAULT_ENV_PARAMS };
    for (const [key, value] of Object.entries(params)) {
        merged[key] = Math.max(0, Math.min(1, value));
    }
    return merged;
}

/**
 * Validate that all required keys are present for the survival fitness function.
 * Returns an array of missing key names (empty = valid).
 */
export function validateEnvParams(params: Record<string, number>): string[] {
    return Object.keys(DEFAULT_ENV_PARAMS).filter((k) => !(k in params));
}

// ─── Dynamic environment ──────────────────────────────────────────────────────

/**
 * Generate a sequence of random environment keyframes spaced `shiftInterval`
 * generations apart.  The first keyframe always anchors to `baseParams` at
 * generation 0 so existing configs remain valid.
 *
 * Call this once before a simulation run and store the result in
 * `config.dynamicEnv.keyframes` so every tick is deterministic.
 */
export function generateEnvKeyframes(
    baseParams: Record<string, number>,
    maxGenerations: number,
    shiftInterval: number,
): EnvKeyframe[] {
    const keyframes: EnvKeyframe[] = [
        { generation: 0, params: normalizeEnvParams(baseParams) },
    ];

    for (let gen = shiftInterval; gen <= maxGenerations; gen += shiftInterval) {
        const params: Record<string, number> = {};
        for (const key of Object.keys(DEFAULT_ENV_PARAMS)) {
            params[key] = Math.random();
        }
        keyframes.push({ generation: gen, params: normalizeEnvParams(params) });
    }

    return keyframes;
}

/**
 * Resolve the effective environment parameters for a given generation.
 *
 * - Static (no dynamicEnv / disabled): returns normalised baseParams unchanged.
 * - Abrupt mode: snaps to the most-recent keyframe's params.
 * - Gradual mode: linearly interpolates between the surrounding keyframes.
 *
 * Pure function — no side effects, safe to call on every tick.
 */
export function resolveEnvParams(
    baseParams: Record<string, number>,
    dynamicEnv: DynamicEnvConfig | undefined,
    generation: number,
): Record<string, number> {
    if (!dynamicEnv?.enabled || !dynamicEnv.keyframes?.length) {
        return normalizeEnvParams(baseParams);
    }

    const keyframes = dynamicEnv.keyframes;

    // Find the last keyframe at or before the current generation
    let fromIdx = 0;
    for (let i = 1; i < keyframes.length; i++) {
        if (keyframes[i].generation <= generation) fromIdx = i;
        else break;
    }

    const fromFrame = keyframes[fromIdx];
    const toFrame   = keyframes[fromIdx + 1]; // undefined when past the last keyframe

    // Abrupt shift or no next keyframe — snap to fromFrame
    if (dynamicEnv.shiftMode === 'abrupt' || !toFrame) {
        return { ...fromFrame.params };
    }

    // Gradual — lerp between fromFrame → toFrame
    const span = toFrame.generation - fromFrame.generation;
    const t    = span > 0 ? (generation - fromFrame.generation) / span : 1;

    const result: Record<string, number> = {};
    for (const key of Object.keys(fromFrame.params)) {
        const a = fromFrame.params[key] ?? 0;
        const b = toFrame.params[key]   ?? a;
        result[key] = a + (b - a) * Math.max(0, Math.min(1, t));
    }
    return result;
}
