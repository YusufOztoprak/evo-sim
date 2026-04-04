export type SimulationStatus   = 'idle' | 'running' | 'paused' | 'completed' | 'error';
export type SelectionStrategy  = 'tournament' | 'roulette' | 'rank' | 'elitist';
export type CrossoverStrategy  = 'single_point' | 'two_point' | 'uniform' | 'arithmetic';
export type GenomeEncoding     = 'binary' | 'real' | 'integer' | 'permutation';

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
}

export interface ISimulation {
  _id:               string;
  name:              string;
  description?:      string;
  status:            SimulationStatus;
  config:            SimulationConfig;
  currentGeneration: number;
  bestFitnessEver:   number;
  errorMessage?:     string;
  createdAt:         string;
  updatedAt:         string;
}

export interface IGeneration {
  _id:              string;
  simulationId:     string;
  generationNumber: number;
  populationSize:   number;
  avgFitness:       number;
  maxFitness:       number;
  minFitness:       number;
  fitnessVariance:  number;
  diversityScore:   number;
  speciesCount:     number;
  elapsedMs:        number;
  createdAt:        string;
}

export interface IOrganism {
  _id:               string;
  simulationId:      string;
  generationId:      string;
  genome:            number[];
  fitness:           number;
  normalizedFitness?: number;
  parentAId?:        string;
  parentBId?:        string;
  survived:          boolean;
  createdAt:         string;
}

export interface FitnessPoint {
  generation: number;
  avg:        number;
  max:        number;
  min:        number;
}

export interface FitnessFunction {
  id:          string;
  label:       string;
  description: string;
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
