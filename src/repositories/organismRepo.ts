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
        _id:        new Types.ObjectId(o.id),
        simulationId,
        generationId,
        genome:     o.genome,
        fitness:    o.fitness,
        speciesId:  o.speciesId,
        parentAId:  o.parentAId ? new Types.ObjectId(o.parentAId) : undefined,
        parentBId:  o.parentBId ? new Types.ObjectId(o.parentBId) : undefined,
        survived:   false,
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
    if (!Types.ObjectId.isValid(organismId)) return [];

    // Single aggregation pipeline — no N+1
    const rows = await Organism.aggregate([
        { $match: { _id: new Types.ObjectId(organismId) } },
        {
            $graphLookup: {
                from:             'organisms',
                startWith:        '$parentAId',
                connectFromField: 'parentAId',
                connectToField:   '_id',
                as:               '_ancestors',
                maxDepth:         maxDepth - 1,
                depthField:       '_depth',
            },
        },
    ]);

    if (!rows.length) return [];

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _ancestors, ...root } = rows[0];
    const ancestors: Array<Record<string, unknown>> = rows[0]._ancestors ?? [];
    ancestors.sort((a, b) => (a._depth as number) - (b._depth as number));

    return [root, ...ancestors].map(({ _ancestors: _a, _depth: _d, ...doc }) => doc as unknown as IOrganism);
}

// ─── Aggregation ──────────────────────────────────────────────────────────────

export async function getGenomeDistribution(
    generationId: string
): Promise<Array<{ fitness: number; genome: number[] }>> {
    if (!Types.ObjectId.isValid(generationId)) return [];
    return Organism
        .find({ generationId })
        .select('fitness genome')
        .limit(500)
        .lean() as Promise<Array<{ fitness: number; genome: number[] }>>;
}