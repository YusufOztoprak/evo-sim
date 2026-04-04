import { Schema, model, HydratedDocument } from 'mongoose';
import type { IGeneration } from '../types';

export type GenerationDocument = HydratedDocument<IGeneration>;

const GenerationSchema = new Schema<IGeneration>(
    {
        simulationId:     { type: String, ref: 'Simulation', required: true },
        generationNumber: { type: Number, required: true },
        populationSize:   { type: Number, required: true },
        avgFitness:       { type: Number, required: true },
        maxFitness:       { type: Number, required: true },
        minFitness:       { type: Number, required: true },
        fitnessVariance:  { type: Number, required: true },
        diversityScore:   { type: Number, required: true, min: 0, max: 1 },
        speciesCount:     { type: Number, default: 1 },
        elapsedMs:        { type: Number, required: true },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

GenerationSchema.index({ simulationId: 1, generationNumber: 1 }, { unique: true });
GenerationSchema.index({ simulationId: 1, maxFitness: -1 });

export const Generation = model<IGeneration>('Generation', GenerationSchema);