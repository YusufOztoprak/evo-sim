import { Types } from 'mongoose';
import { Simulation } from '../models/Simulation';
import type { ISimulation, SimulationConfig, SimulationStatus, PaginationQuery } from '../types';

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createSimulation(
    data: Pick<ISimulation, 'name' | 'description'> & { config: SimulationConfig }
): Promise<ISimulation> {
    const doc = await Simulation.create(data);
    return doc.toObject();
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function findSimulationById(id: string): Promise<ISimulation | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await Simulation.findById(id).lean();
    return doc as ISimulation | null;
}

export async function findSimulations(
    filter: { status?: SimulationStatus },
    pagination: PaginationQuery = {}
): Promise<{ data: ISimulation[]; total: number }> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 } as Record<string, 1 | -1>;

    const [data, total] = await Promise.all([
        Simulation.find(filter).sort(sort).skip(skip).limit(limit).lean(),
        Simulation.countDocuments(filter),
    ]);

    return { data: data as ISimulation[], total };
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateSimulationStatus(
    id: string,
    status: SimulationStatus,
    extra: Partial<Pick<ISimulation, 'errorMessage' | 'currentGeneration' | 'bestFitnessEver'>> = {}
): Promise<ISimulation | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await Simulation.findByIdAndUpdate(
        id,
        { $set: { status, ...extra } },
        { new: true, runValidators: true }
    ).lean();
    return doc as ISimulation | null;
}

export async function incrementGeneration(
    id: string,
    bestFitness: number
): Promise<ISimulation | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await Simulation.findByIdAndUpdate(
        id,
        {
            $inc: { currentGeneration: 1 },
            $max: { bestFitnessEver: bestFitness },   // only updates if new value is higher
        },
        { new: true }
    ).lean();
    return doc as ISimulation | null;
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteSimulation(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await Simulation.findByIdAndDelete(id);
    return result !== null;
}