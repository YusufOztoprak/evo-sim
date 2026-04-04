import type { Genome, ISpecies } from '../types';

// ─── Distance ─────────────────────────────────────────────────────────────────

/**
 * Normalised distance between two genomes.
 * Binary / permutation: normalised Hamming.
 * Real / integer: normalised Euclidean (divided by sqrt(length) to keep [0,1] roughly).
 */
function genomeDistance(a: Genome, b: Genome): number {
    const len = Math.min(a.length, b.length);
    if (len === 0) return 0;

    // Detect encoding heuristically: if all values are 0 or 1 → treat as binary
    const isBinaryLike = a.every((g) => g === 0 || g === 1);
    if (isBinaryLike) {
        return a.reduce((acc: number, g, i) => acc + (g !== b[i] ? 1 : 0), 0) / len;
    }

    const sumSq = a.reduce((acc, g, i) => acc + (g - b[i]) ** 2, 0);
    return Math.sqrt(sumSq / len);
}

// ─── Assignment ───────────────────────────────────────────────────────────────

export interface SpeciesMatch {
    speciesId: string | null;
    /** true when no existing species was close enough — caller must create a new one */
    isNew: boolean;
}

/**
 * Assign a genome to the closest existing species whose representative is
 * within `threshold` distance.  Returns `isNew = true` if no match found.
 */
export function assignSpecies(
    genome: Genome,
    existingSpecies: ISpecies[],
    threshold = 0.3,
): SpeciesMatch {
    let bestMatch: ISpecies | null = null;
    let bestDist  = Infinity;

    for (const species of existingSpecies) {
        if (species.isExtinct) continue;
        const dist = genomeDistance(genome, species.representativeGenome);
        if (dist < threshold && dist < bestDist) {
            bestDist  = dist;
            bestMatch = species;
        }
    }

    return bestMatch
        ? { speciesId: bestMatch._id, isNew: false }
        : { speciesId: null,          isNew: true  };
}

// ─── Clustering ───────────────────────────────────────────────────────────────

/**
 * Group an array of genomes into clusters using a greedy nearest-representative
 * algorithm (O(n²) — fine for populations up to ~10 k).
 *
 * Returns a Map: representativeIndex → memberIndices.
 */
export function clusterIntoSpecies(
    genomes: Genome[],
    threshold = 0.3,
): Map<number, number[]> {
    const representatives: number[] = [];
    const clusters = new Map<number, number[]>();

    for (let i = 0; i < genomes.length; i++) {
        let assigned = false;
        for (const rep of representatives) {
            if (genomeDistance(genomes[i], genomes[rep]) < threshold) {
                clusters.get(rep)!.push(i);
                assigned = true;
                break;
            }
        }
        if (!assigned) {
            representatives.push(i);
            clusters.set(i, [i]);
        }
    }

    return clusters;
}
