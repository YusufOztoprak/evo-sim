import { Types } from 'mongoose';
import { Species } from '../models/Species';
import type { ISpecies, Genome } from '../types';

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createSpecies(
  simulationId: string,
  representativeGenome: Genome,
  firstSeenGeneration: number
): Promise<ISpecies> {
  const count = await Species.countDocuments({ simulationId });
  const doc = await Species.create({
    simulationId,
    label: `species-${count + 1}`,
    representativeGenome,
    memberCount: 1,
    firstSeenGeneration,
    lastSeenGeneration: firstSeenGeneration,
    isExtinct: false,
  });
  return doc.toObject();
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function findActiveSpecies(simulationId: string): Promise<ISpecies[]> {
  if (!Types.ObjectId.isValid(simulationId)) return [];
  return Species
    .find({ simulationId, isExtinct: false })
    .sort({ memberCount: -1 })
    .lean() as Promise<ISpecies[]>;
}

export async function findAllSpecies(simulationId: string): Promise<ISpecies[]> {
  if (!Types.ObjectId.isValid(simulationId)) return [];
  return Species
    .find({ simulationId })
    .sort({ firstSeenGeneration: 1 })
    .lean() as Promise<ISpecies[]>;
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateSpeciesStats(
  speciesId: string,
  memberCount: number,
  lastSeenGeneration: number
): Promise<void> {
  if (!Types.ObjectId.isValid(speciesId)) return;
  await Species.findByIdAndUpdate(speciesId, {
    $set: {
      memberCount,
      lastSeenGeneration,
      isExtinct: memberCount === 0,
    },
  });
}

export async function markExtinctSpecies(
  simulationId: string,
  currentGeneration: number,
  activeSpeciesIds: string[]
): Promise<void> {
  await Species.updateMany(
    {
      simulationId,
      isExtinct: false,
      _id: { $nin: activeSpeciesIds.map((id) => new Types.ObjectId(id)) },
    },
    { $set: { isExtinct: true, lastSeenGeneration: currentGeneration - 1 } }
  );
}
