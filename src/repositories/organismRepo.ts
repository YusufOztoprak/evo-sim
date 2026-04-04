import { Types } from 'mongoose';
import { Organism } from '../models/Organism';
import type { IOrganism, OrganismPlain } from '../types';

// ─── Create ───────────────────────────────────────────────────────────────────

// Bulk insert a full generation's population — much faster than individual saves
export async function insertOrganisms(
    simulationId: string,
    generationId: string,
    organisms: OrganismPlain[]
): Promise<void> {
    const docs = organisms.map((o) => ({
        simulationId,
        generationId,
        genome:    o.genome,
        fitness:   o.fitness,
        parentAId: o.parentAId,
        parentBId: o.parentBId,
        survived:  false,
    }));
    await Organism.insertMany(docs, { ordered: false });
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function findOrganismsByGeneration(
    generationId: string,
    opts: { limit?: number; sortByFitness?: boolean } = {}
): Promise<IOrganism[]> {
    if (!Types.ObjectId.isValid(generationId)) return [];

    const query = Organism.find({ generationId });
    if (opts.sortByFitness) query.sort({ fitness: -1 });
    if (opts.limit) query.limit(opts.limit);
    return query.lean() as Promise<IOrganism[]>;
}

export async function findTopOrganisms(
    simulationId: string,
    limit = 10
): Promise<IOrganism[]> {
    if (!Types.ObjectId.isValid(simulationId)) return [];
    return Organism
        .find({ simulationId })
        .sort({ fitness: -1 })
        .limit(limit)
        .lean() as Promise<IOrganism[]>;
}

export async function findOrganismById(id: string): Promise<IOrganism | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return Organism.findById(id).lean() as Promise<IOrganism | null>;
}

export async function findLineage(
    organismId: string,
    maxDepth = 10
): Promise<IOrganism[]> {
    const lineage: IOrganism[] = [];
    let currentId: string | undefined = organismId;
    let depth = 0;

    while (currentId && depth < maxDepth) {
        const org = await findOrganismById(currentId);
        if (!org) break;
        lineage.push(org);
        currentId = org.parentAId;
        depth++;
    }

    return lineage;
}

// ─── Aggregation ──────────────────────────────────────────────────────────────

export async function getGenomeDistribution(
    generationId: string
): Promise<Array<{ fitness: number; genome: number[] }>> {
    if (!Types.ObjectId.isValid(generationId)) return [];
    return Organism
        .find({ generationId })
        .select('fitness genome')
        .lean() as Promise<Array<{ fitness: number; genome: number[] }>>;
}