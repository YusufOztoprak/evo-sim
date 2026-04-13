import {
    normalizeEnvParams,
    validateEnvParams,
    generateEnvKeyframes,
    resolveEnvParams,
    DEFAULT_ENV_PARAMS,
} from '../../src/engine/environment';

// ─── normalizeEnvParams ───────────────────────────────────────────────────────

describe('normalizeEnvParams', () => {
    it('fills all missing keys from defaults', () => {
        expect(normalizeEnvParams({})).toEqual(DEFAULT_ENV_PARAMS);
    });

    it('clamps values above 1 down to 1', () => {
        const result = normalizeEnvParams({ temperature: 5 });
        expect(result.temperature).toBe(1);
    });

    it('clamps values below 0 up to 0', () => {
        const result = normalizeEnvParams({ foodAvailability: -3 });
        expect(result.foodAvailability).toBe(0);
    });

    it('preserves valid values unchanged', () => {
        const result = normalizeEnvParams({ temperature: 0.7 });
        expect(result.temperature).toBe(0.7);
    });

    it('merges caller values over defaults', () => {
        const result = normalizeEnvParams({ temperature: 0.9 });
        expect(result.predatorPressure).toBe(DEFAULT_ENV_PARAMS['predatorPressure']);
    });
});

// ─── validateEnvParams ────────────────────────────────────────────────────────

describe('validateEnvParams', () => {
    it('returns empty array for a complete set', () => {
        const full = { temperature: 0.5, foodAvailability: 0.5, predatorPressure: 0.3 };
        expect(validateEnvParams(full)).toHaveLength(0);
    });

    it('returns missing keys', () => {
        const missing = validateEnvParams({ temperature: 0.5 });
        expect(missing).toContain('foodAvailability');
        expect(missing).toContain('predatorPressure');
    });
});

// ─── generateEnvKeyframes ─────────────────────────────────────────────────────

describe('generateEnvKeyframes', () => {
    it('first keyframe is always generation 0 with base params', () => {
        const base = { temperature: 0.8, foodAvailability: 0.2, predatorPressure: 0.5 };
        const frames = generateEnvKeyframes(base, 100, 20);
        expect(frames[0].generation).toBe(0);
        expect(frames[0].params['temperature']).toBe(0.8);
    });

    it('produces keyframes at every shiftInterval', () => {
        const frames = generateEnvKeyframes({}, 60, 20);
        expect(frames.map(f => f.generation)).toEqual([0, 20, 40, 60]);
    });

    it('includes the final generation when it falls exactly on an interval', () => {
        const frames = generateEnvKeyframes({}, 40, 20);
        expect(frames.at(-1)?.generation).toBe(40);
    });

    it('does not exceed maxGenerations', () => {
        const frames = generateEnvKeyframes({}, 50, 30);
        expect(frames.every(f => f.generation <= 50)).toBe(true);
    });

    it('all generated params are clamped to [0,1]', () => {
        const frames = generateEnvKeyframes({}, 100, 10);
        for (const f of frames) {
            for (const v of Object.values(f.params)) {
                expect(v).toBeGreaterThanOrEqual(0);
                expect(v).toBeLessThanOrEqual(1);
            }
        }
    });
});

// ─── resolveEnvParams ─────────────────────────────────────────────────────────

describe('resolveEnvParams', () => {
    const base = { temperature: 0.5, foodAvailability: 0.5, predatorPressure: 0.3 };

    const twoFrames = {
        enabled:       true  as const,
        shiftMode:     'gradual' as const,
        shiftInterval: 10,
        keyframes: [
            { generation: 0,  params: { temperature: 0.0, foodAvailability: 0.5, predatorPressure: 0.3 } },
            { generation: 10, params: { temperature: 1.0, foodAvailability: 0.5, predatorPressure: 0.3 } },
        ],
    };

    it('returns normalised base when dynamicEnv is undefined', () => {
        const result = resolveEnvParams(base, undefined, 50);
        expect(result['temperature']).toBe(0.5);
    });

    it('returns normalised base when dynamicEnv is disabled', () => {
        const result = resolveEnvParams(base, { enabled: false, shiftMode: 'abrupt', shiftInterval: 10 }, 50);
        expect(result['temperature']).toBe(0.5);
    });

    it('returns normalised base when keyframes array is empty', () => {
        const result = resolveEnvParams(base, { enabled: true, shiftMode: 'abrupt', shiftInterval: 10, keyframes: [] }, 10);
        expect(result['temperature']).toBe(0.5);
    });

    describe('abrupt mode', () => {
        const cfg = { ...twoFrames, shiftMode: 'abrupt' as const };

        it('snaps to generation-0 params before first shift', () => {
            expect(resolveEnvParams(base, cfg, 5)['temperature']).toBe(0.0);
        });

        it('snaps to generation-10 params at and after shift', () => {
            expect(resolveEnvParams(base, cfg, 10)['temperature']).toBe(1.0);
            expect(resolveEnvParams(base, cfg, 99)['temperature']).toBe(1.0);
        });
    });

    describe('gradual mode', () => {
        it('returns start value at generation 0', () => {
            expect(resolveEnvParams(base, twoFrames, 0)['temperature']).toBeCloseTo(0.0);
        });

        it('interpolates linearly at midpoint', () => {
            expect(resolveEnvParams(base, twoFrames, 5)['temperature']).toBeCloseTo(0.5);
        });

        it('returns end value at last keyframe generation', () => {
            expect(resolveEnvParams(base, twoFrames, 10)['temperature']).toBeCloseTo(1.0);
        });

        it('holds last keyframe value past the end', () => {
            expect(resolveEnvParams(base, twoFrames, 100)['temperature']).toBeCloseTo(1.0);
        });
    });
});
