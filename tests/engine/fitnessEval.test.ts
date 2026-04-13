import { getFitnessFunction, listFitnessFunctions, registerFitnessFunction } from '../../src/engine/fitnessEval';

// ─── Registry ─────────────────────────────────────────────────────────────────

describe('getFitnessFunction', () => {
    it('throws for an unknown id', () => {
        expect(() => getFitnessFunction('does-not-exist')).toThrow(/Unknown fitness function/);
    });

    it('returns the function for every built-in id', () => {
        for (const fn of listFitnessFunctions()) {
            expect(() => getFitnessFunction(fn.id)).not.toThrow();
        }
    });

    it('round-trips a custom-registered function', () => {
        registerFitnessFunction({ id: 'test-constant', label: 'Test', description: '', evaluate: () => 42 });
        expect(getFitnessFunction('test-constant').evaluate([], {})).toBe(42);
    });
});

describe('listFitnessFunctions', () => {
    it('includes at least the 4 built-ins', () => {
        const ids = listFitnessFunctions().map(f => f.id);
        expect(ids).toContain('onemax');
        expect(ids).toContain('summax');
        expect(ids).toContain('sphere');
        expect(ids).toContain('survival');
    });
});

// ─── onemax ───────────────────────────────────────────────────────────────────

describe('onemax', () => {
    const fn = getFitnessFunction('onemax');

    it('returns 0 for all-zeros genome', () => {
        expect(fn.evaluate([0, 0, 0, 0], {})).toBe(0);
    });

    it('returns genome length for all-ones genome', () => {
        expect(fn.evaluate([1, 1, 1, 1], {})).toBe(4);
    });
});

// ─── summax ───────────────────────────────────────────────────────────────────

describe('summax', () => {
    const fn = getFitnessFunction('summax');

    it('sums all gene values', () => {
        expect(fn.evaluate([1, 2, 3], {})).toBe(6);
    });
});

// ─── sphere ───────────────────────────────────────────────────────────────────

describe('sphere', () => {
    const fn = getFitnessFunction('sphere');

    it('returns 0 for zero genome (optimum)', () => {
        expect(fn.evaluate([0, 0, 0], {})).toBeCloseTo(0);
    });

    it('is more negative further from origin', () => {
        const close = fn.evaluate([0.1, 0.1], {});
        const far   = fn.evaluate([1.0, 1.0], {});
        expect(close).toBeGreaterThan(far);
    });
});

// ─── survival ─────────────────────────────────────────────────────────────────

describe('survival', () => {
    const fn  = getFitnessFunction('survival');
    const env = { temperature: 0.5, foodAvailability: 0.5, predatorPressure: 0.3 };

    it('returns a value in [0, 1] for typical inputs', () => {
        const score = fn.evaluate([0.5, 0.5, 0.5, 0.5], env);
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(1);
    });

    it('does not throw for an empty genome (uses defaults)', () => {
        expect(() => fn.evaluate([], env)).not.toThrow();
        expect(fn.evaluate([], env)).toBeGreaterThanOrEqual(0);
    });

    it('high camouflage outperforms low camouflage under high predator pressure', () => {
        const highCam = fn.evaluate([0.5, 0.5, 1.0, 0.5], { ...env, predatorPressure: 1.0 });
        const lowCam  = fn.evaluate([0.5, 0.5, 0.0, 0.5], { ...env, predatorPressure: 1.0 });
        expect(highCam).toBeGreaterThan(lowCam);
    });

    it('high energy buffers extreme temperature stress', () => {
        const highEnergy = fn.evaluate([0.5, 0.5, 0.5, 1.0], { ...env, temperature: 0.0 });
        const lowEnergy  = fn.evaluate([0.5, 0.5, 0.5, 0.0], { ...env, temperature: 0.0 });
        expect(highEnergy).toBeGreaterThan(lowEnergy);
    });

    it('high energy compensates for scarce food', () => {
        const highEnergy = fn.evaluate([0.5, 0.5, 0.5, 1.0], { ...env, foodAvailability: 0.0 });
        const lowEnergy  = fn.evaluate([0.5, 0.5, 0.5, 0.0], { ...env, foodAvailability: 0.0 });
        expect(highEnergy).toBeGreaterThan(lowEnergy);
    });

    it('vision gene adds a flat bonus', () => {
        const highVision = fn.evaluate([0.5, 1.0, 0.5, 0.5], env);
        const lowVision  = fn.evaluate([0.5, 0.0, 0.5, 0.5], env);
        expect(highVision).toBeGreaterThan(lowVision);
    });

    // ── Trade-off tests ───────────────────────────────────────────────────────

    it('all-max genome [1,1,1,1] is NOT the global optimum (budget penalty)', () => {
        const allMax     = fn.evaluate([1.0, 1.0, 1.0, 1.0], env);
        const balanced   = fn.evaluate([0.6, 0.6, 0.6, 0.7], env); // total = 2.5, at budget
        expect(balanced).toBeGreaterThan(allMax);
    });

    it('high speed reduces effective energy under food scarcity', () => {
        // Same total investment, but fast organism burns more energy
        const fastHungry = fn.evaluate([1.0, 0.0, 0.0, 0.5], { ...env, foodAvailability: 0.0 });
        const slowHungry = fn.evaluate([0.0, 0.0, 0.0, 0.5], { ...env, foodAvailability: 0.0 });
        expect(slowHungry).toBeGreaterThan(fastHungry);
    });

    it('high vision degrades camouflage effectiveness under predator pressure', () => {
        // Same camouflage gene value, but high-vision organism is more visible
        const highVisHighCam = fn.evaluate([0.5, 1.0, 1.0, 0.5], { ...env, predatorPressure: 1.0 });
        const noVisHighCam   = fn.evaluate([0.5, 0.0, 1.0, 0.5], { ...env, predatorPressure: 1.0 });
        expect(noVisHighCam).toBeGreaterThan(highVisHighCam);
    });
});
