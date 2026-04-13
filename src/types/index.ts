// No Mongoose imports here. Plain interfaces use only native TypeScript types.
// Models cast to ObjectId at the schema level — keeping these interfaces
// usable by the engine, tests, and API layer without pulling in Mongoose.

// ─── Genome ───────────────────────────────────────────────────────────────────

export type GenomeEncoding = 'binary' | 'real' | 'integer' | 'permutation';
export type Genome = number[];

// ─── Shared string-enum types ─────────────────────────────────────────────────

export type SimulationStatus   = 'idle' | 'running' | 'paused' | 'completed' | 'error';
export type SelectionStrategy  = 'tournament' | 'roulette' | 'rank' | 'elitist';
export type CrossoverStrategy  = 'single_point' | 'two_point' | 'uniform' | 'arithmetic';

// ─── Dynamic environment ──────────────────────────────────────────────────────

/** A single waypoint in a dynamic environment timeline. */
export interface EnvKeyframe {
    /** Generation at which this target environment becomes the "from" state. */
    generation: number;
    params:     Record<string, number>;
}

/**
 * Configuration for shifting environment parameters over time.
 * If `enabled` is false (or omitted) the static `environmentParams` are used.
 */
export interface DynamicEnvConfig {
    enabled:       boolean;
    /** 'abrupt' snaps instantly; 'gradual' lerps between keyframes. */
    shiftMode:     'gradual' | 'abrupt';
    /** Auto-generate a new random keyframe every N generations (ignored when keyframes are explicit). */
    shiftInterval: number;
    /**
     * Explicit waypoints, sorted ascending by generation.
     * Populated automatically at simulation-start when omitted.
     */
    keyframes?:    EnvKeyframe[];
}

// ─── Simulation ───────────────────────────────────────────────────────────────

export interface SimulationConfig {
    populationSize:    number;
    genomeLength:      number;
    genomeEncoding:    GenomeEncoding;
    genomeMin:         number;
    genomeMax:         number;
    mutationRate:      number;
    crossoverRate:     number;
    elitismCount:      number;
    selectionStrategy: SelectionStrategy;
    crossoverStrategy: CrossoverStrategy;
    maxGenerations:    number;
    targetFitness?:    number;
    fitnessFunctionId: string;
    environmentParams: Record<string, number>;
    /** Omit or set `enabled: false` to keep static environment behaviour. */
    dynamicEnv?:       DynamicEnvConfig;
}

export interface ISimulation {
    _id:               string;   // serialised as string; schema stores ObjectId
    name:              string;
    description?:      string;
    status:            SimulationStatus;
    config:            SimulationConfig;
    currentGeneration: number;
    bestFitnessEver:   number;
    errorMessage?:     string;
    createdAt:         Date;
    updatedAt:         Date;
}

// ─── Organism ─────────────────────────────────────────────────────────────────

export interface IOrganism {
    _id:               string;
    simulationId:      string;
    generationId:      string;
    speciesId?:        string;
    genome:            Genome;
    fitness:           number;
    normalizedFitness?: number;
    rank?:             number;
    parentAId?:        string;
    parentBId?:        string;
    survived:          boolean;
    createdAt:         Date;
}

// ─── Generation ───────────────────────────────────────────────────────────────

export interface IGeneration {
    _id:               string;
    simulationId:      string;
    generationNumber:  number;
    populationSize:    number;
    avgFitness:        number;
    maxFitness:        number;
    minFitness:        number;
    fitnessVariance:   number;
    diversityScore:    number;
    speciesCount:      number;
    elapsedMs:         number;
    /** Environment parameters in effect during this generation (for timeline visualisation). */
    environmentParams?: Record<string, number>;
    createdAt:         Date;
}

// ─── Species ──────────────────────────────────────────────────────────────────

export interface ISpecies {
    _id:                  string;
    simulationId:         string;
    label:                string;
    representativeGenome: Genome;
    memberCount:          number;
    firstSeenGeneration:  number;
    lastSeenGeneration:   number;
    isExtinct:            boolean;
    createdAt:            Date;
    updatedAt:            Date;
}

// ─── Engine I/O (pure — no DB types) ─────────────────────────────────────────

export interface OrganismPlain {
    id:         string;
    genome:     Genome;
    fitness:    number;
    speciesId?: string;
    parentAId?: string;
    parentBId?: string;
}

export interface TickResult {
    generation:        number;
    population:        OrganismPlain[];
    stats:             GenerationStats;
    shouldStop:        boolean;
    /** Resolved environment params actually used during this tick (after any dynamic shift). */
    environmentParams: Record<string, number>;
}

export interface GenerationStats {
    avgFitness:      number;
    maxFitness:      number;
    minFitness:      number;
    fitnessVariance: number;
    diversityScore:  number;
    elapsedMs:       number;
}

// ─── Fitness ──────────────────────────────────────────────────────────────────

export interface FitnessFunction {
    id:          string;
    label:       string;
    description: string;
    evaluate(genome: Genome, params: Record<string, number>): number;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export interface PaginationQuery {
    page?:      number;
    limit?:     number;
    sortBy?:    string;
    sortOrder?: 'asc' | 'desc';
}

export interface ApiResponse<T> {
    success: boolean;
    data?:   T;
    error?:  string;
    meta?: {
        page:       number;
        limit:      number;
        total:      number;
        totalPages: number;
    };
}