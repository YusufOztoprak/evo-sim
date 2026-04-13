import { Types } from 'mongoose';
import { Generation } from '../models/Generation';
import type { IGeneration, GenerationStats } from '../types';

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createGeneration(
    simulationId: string,
    generationNumber: number,
    populationSize: number,
    stats: GenerationStats,
    environmentParams?: Record<string, number>,
    speciesCount?: number,
): Promise<IGeneration> {
    const doc = await Generation.create({
        simulationId,
        generationNumber,
        populationSize,
        ...stats,
        ...(environmentParams  && { environmentParams }),
        ...(speciesCount !== undefined && { speciesCount }),
    });
    return doc.toObject();
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function findGenerationsBySimulation(
    simulationId: string,
    opts: { from?: number; to?: number; limit?: number } = {}
): Promise<IGeneration[]> {
    if (!Types.ObjectId.isValid(simulationId)) return [];

    const filter: Record<string, unknown> = { simulationId };
    if (opts.from !== undefined || opts.to !== undefined) {
        filter['generationNumber'] = {
            ...(opts.from !== undefined && { $gte: opts.from }),
            ...(opts.to   !== undefined && { $lte: opts.to }),
        };
    }

    return Generation
        .find(filter)
        .sort({ generationNumber: 1 })
        .limit(opts.limit ?? 1_000)
        .lean() as Promise<IGeneration[]>;
}

export async function findLatestGeneration(simulationId: string): Promise<IGeneration | null> {
    if (!Types.ObjectId.isValid(simulationId)) return null;
    return Generation
        .findOne({ simulationId })
        .sort({ generationNumber: -1 })
        .lean() as Promise<IGeneration | null>;
}

// ─── Aggregation ──────────────────────────────────────────────────────────────

export async function getFitnessHistory(
    simulationId: string
): Promise<Array<{
    generation:         number;
    avg:                number;
    max:                number;
    min:                number;
    environmentParams?: Record<string, number>;
}>> {
    if (!Types.ObjectId.isValid(simulationId)) return [];

    return Generation.aggregate([
        { $match: { simulationId } },
        { $sort:  { generationNumber: 1 } },
        { $project: {
            _id:               0,
            generation:        '$generationNumber',
            avg:               '$avgFitness',
            max:               '$maxFitness',
            min:               '$minFitness',
            environmentParams: 1,
        }},
    ]);
}