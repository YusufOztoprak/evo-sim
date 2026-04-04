import { Schema, model, HydratedDocument } from 'mongoose';
import type { IOrganism } from '../types';

export type OrganismDocument = HydratedDocument<IOrganism>;

const OrganismSchema = new Schema<IOrganism>(
    {
        simulationId:      { type: String, ref: 'Simulation', required: true },
        generationId:      { type: String, ref: 'Generation', required: true },
        speciesId:         { type: String, ref: 'Species' },
        genome:            { type: [Number], required: true },
        fitness:           { type: Number, required: true, default: 0 },
        normalizedFitness: { type: Number },
        rank:              { type: Number },
        parentAId:         { type: String, ref: 'Organism' },
        parentBId:         { type: String, ref: 'Organism' },
        survived:          { type: Boolean, default: false },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

OrganismSchema.index({ generationId: 1, fitness: -1 });
OrganismSchema.index({ simulationId: 1, fitness: -1 });
OrganismSchema.index({ parentAId: 1 });
OrganismSchema.index({ speciesId: 1, generationId: 1 });

export const Organism = model<IOrganism>('Organism', OrganismSchema);