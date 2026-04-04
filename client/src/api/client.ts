import axios from 'axios';
import type {
  ISimulation, IGeneration, IOrganism,
  FitnessPoint, FitnessFunction, SimulationConfig, ApiResponse,
} from '../types';

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  timeout: 300_000, // 5 min — simulations can take time
});

// ─── Simulations ──────────────────────────────────────────────────────────────

export async function createSimulation(
  data: { name: string; description?: string; config: SimulationConfig }
): Promise<ISimulation> {
  const res = await http.post<ApiResponse<ISimulation>>('/simulations', data);
  return res.data.data!;
}

export async function fetchSimulations(page = 1, limit = 20): Promise<{
  data: ISimulation[];
  total: number;
  totalPages: number;
}> {
  const res = await http.get<ApiResponse<ISimulation[]>>('/simulations', {
    params: { page, limit, sortBy: 'createdAt', sortOrder: 'desc' },
  });
  return {
    data:       res.data.data ?? [],
    total:      res.data.meta?.total ?? 0,
    totalPages: res.data.meta?.totalPages ?? 1,
  };
}

export async function fetchSimulation(id: string): Promise<ISimulation> {
  const res = await http.get<ApiResponse<ISimulation>>(`/simulations/${id}`);
  return res.data.data!;
}

export async function startSimulation(id: string): Promise<ISimulation> {
  const res = await http.post<ApiResponse<ISimulation>>(`/simulations/${id}/start`);
  return res.data.data!;
}

export async function stopSimulation(id: string): Promise<ISimulation> {
  const res = await http.post<ApiResponse<ISimulation>>(`/simulations/${id}/stop`);
  return res.data.data!;
}

export async function deleteSimulation(id: string): Promise<void> {
  await http.delete(`/simulations/${id}`);
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export async function fetchFitnessHistory(id: string): Promise<FitnessPoint[]> {
  const res = await http.get<ApiResponse<FitnessPoint[]>>(
    `/analytics/simulations/${id}/fitness-history`
  );
  return res.data.data ?? [];
}

export async function fetchSummary(id: string): Promise<{
  simulation:     ISimulation;
  topOrganisms:   IOrganism[];
  speciesCount:   number;
  extinctSpecies: number;
  activeSpecies:  number;
}> {
  const res = await http.get(`/analytics/simulations/${id}/summary`);
  return res.data.data;
}

export async function fetchFitnessFunctions(): Promise<FitnessFunction[]> {
  const res = await http.get<ApiResponse<FitnessFunction[]>>('/analytics/fitness-functions');
  return res.data.data ?? [];
}

// ─── Generations ──────────────────────────────────────────────────────────────

export async function fetchGenerations(simulationId: string, limit = 100): Promise<IGeneration[]> {
  const res = await http.get<ApiResponse<IGeneration[]>>(
    `/simulations/${simulationId}/generations`,
    { params: { limit } }
  );
  return res.data.data ?? [];
}

export async function fetchTopOrganisms(simulationId: string, limit = 10): Promise<IOrganism[]> {
  const res = await http.get<ApiResponse<IOrganism[]>>(
    `/simulations/${simulationId}/top-organisms`,
    { params: { limit } }
  );
  return res.data.data ?? [];
}
