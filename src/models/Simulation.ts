import { Schema, model, HydratedDocument } from 'mongoose';
import type { ISimulation, SimulationConfig } from '../types';

export type SimulationDocument = HydratedDocument<ISimulation>;

const SimulationConfigSchema = new Schema<SimulationConfig>(
    {
        populationSize:    { type: Number, required: true, min: 2, max: 100_000 },
        genomeLength:      { type: Number, required: true, min: 1, max: 10_000 },
        genomeEncoding:    { type: String, enum: ['binary', 'real', 'integer', 'permutation'], default: 'binary' },
        genomeMin:         { type: Number, default: 0 },
        genomeMax:         { type: Number, default: 1 },
        mutationRate:      { type: Number, required: true, min: 0, max: 1 },
        crossoverRate:     { type: Number, required: true, min: 0, max: 1 },
        elitismCount:      { type: Number, default: 2, min: 0 },
        selectionStrategy: { type: String, enum: ['tournament', 'roulette', 'rank', 'elitist'], default: 'tournament' },
        crossoverStrategy: { type: String, enum: ['single_point', 'two_point', 'uniform', 'arithmetic'], default: 'single_point' },
        maxGenerations:    { type: Number, required: true, min: 1 },
        targetFitness:     { type: Number },
        fitnessFunctionId: { type: String, required: true },
        environmentParams: { type: Map, of: Number, default: {} },
    },
    { _id: false }
);

const SimulationSchema = new Schema<ISimulation>(
    {
        name:              { type: String, required: true, trim: true, maxlength: 120 },
        description:       { type: String, trim: true, maxlength: 500 },
        status:            { type: String, enum: ['idle', 'running', 'paused', 'completed', 'error'], default: 'idle' },
        config:            { type: SimulationConfigSchema, required: true },
        currentGeneration: { type: Number, default: 0 },
        bestFitnessEver:   { type: Number, default: 0 },
        errorMessage:      { type: String },
    },
    { timestamps: true, optimisticConcurrency: true }
);

SimulationSchema.index({ status: 1, createdAt: -1 });
SimulationSchema.index({ name: 'text' });

export const Simulation = model<ISimulation>('Simulation', SimulationSchema);