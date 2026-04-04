import axios from 'axios';
const http = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
    timeout: 300000, // 5 min — simulations can take time
});
// ─── Simulations ──────────────────────────────────────────────────────────────
export async function createSimulation(data) {
    const res = await http.post('/simulations', data);
    return res.data.data;
}
export async function fetchSimulations(page = 1, limit = 20) {
    const res = await http.get('/simulations', {
        params: { page, limit, sortBy: 'createdAt', sortOrder: 'desc' },
    });
    return {
        data: res.data.data ?? [],
        total: res.data.meta?.total ?? 0,
        totalPages: res.data.meta?.totalPages ?? 1,
    };
}
export async function fetchSimulation(id) {
    const res = await http.get(`/simulations/${id}`);
    return res.data.data;
}
export async function startSimulation(id) {
    const res = await http.post(`/simulations/${id}/start`);
    return res.data.data;
}
export async function stopSimulation(id) {
    const res = await http.post(`/simulations/${id}/stop`);
    return res.data.data;
}
export async function deleteSimulation(id) {
    await http.delete(`/simulations/${id}`);
}
// ─── Analytics ────────────────────────────────────────────────────────────────
export async function fetchFitnessHistory(id) {
    const res = await http.get(`/analytics/simulations/${id}/fitness-history`);
    return res.data.data ?? [];
}
export async function fetchSummary(id) {
    const res = await http.get(`/analytics/simulations/${id}/summary`);
    return res.data.data;
}
export async function fetchFitnessFunctions() {
    const res = await http.get('/analytics/fitness-functions');
    return res.data.data ?? [];
}
// ─── Generations ──────────────────────────────────────────────────────────────
export async function fetchGenerations(simulationId, limit = 100) {
    const res = await http.get(`/simulations/${simulationId}/generations`, { params: { limit } });
    return res.data.data ?? [];
}
export async function fetchTopOrganisms(simulationId, limit = 10) {
    const res = await http.get(`/simulations/${simulationId}/top-organisms`, { params: { limit } });
    return res.data.data ?? [];
}
