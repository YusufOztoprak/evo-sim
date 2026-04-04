import { Schema, model, HydratedDocument } from 'mongoose';
import type { ISpecies } from '../types';

export type SpeciesDocument = HydratedDocument<ISpecies>;

const SpeciesSchema = new Schema<ISpecies>(
    {
        simulationId:         { type: String, ref: 'Simulation', required: true },
        label:                { type: String, required: true },
        representativeGenome: { type: [Number], required: true },
        memberCount:          { type: Number, default: 0 },
        firstSeenGeneration:  { type: Number, required: true },
        lastSeenGeneration:   { type: Number, required: true },
        isExtinct:            { type: Boolean, default: false },
    },
    { timestamps: true }
);

SpeciesSchema.index({ simulationId: 1, isExtinct: 1 });
SpeciesSchema.index({ simulationId: 1, memberCount: -1 });

export const Species = model<ISpecies>('Species', SpeciesSchema);