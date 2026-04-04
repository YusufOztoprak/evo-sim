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
