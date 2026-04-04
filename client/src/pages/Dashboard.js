import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Play, Trash2, ChevronRight, Dna, CheckCircle, Clock, AlertCircle, Loader2, PauseCircle } from 'lucide-react';
import { fetchSimulations, createSimulation, deleteSimulation, fetchFitnessFunctions, } from '../api/client';
import CreateSimulationModal from '../components/simulation/CreateSimulationModal';
const statusMeta = {
    idle: { label: 'Idle', color: 'text-dim    border-border    bg-border/30', icon: Clock },
    running: { label: 'Running', color: 'text-cyan   border-cyan/30   bg-cyan/10', icon: Loader2 },
    paused: { label: 'Paused', color: 'text-purple border-purple/30 bg-purple/10', icon: PauseCircle },
    completed: { label: 'Completed', color: 'text-primary border-primary/30 bg-primary/10', icon: CheckCircle },
    error: { label: 'Error', color: 'text-red-400 border-red-400/30 bg-red-400/10', icon: AlertCircle },
};
const fade = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.06 } } };
export default function Dashboard() {
    const [showModal, setShowModal] = useState(false);
    const qc = useQueryClient();
    const { data: simsData, isLoading } = useQuery({
        queryKey: ['simulations'],
        queryFn: () => fetchSimulations(1, 50),
        refetchInterval: 5000,
    });
    const { data: fns = [] } = useQuery({
        queryKey: ['fitness-functions'],
        queryFn: fetchFitnessFunctions,
        staleTime: Infinity,
    });
    const createMutation = useMutation({
        mutationFn: createSimulation,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['simulations'] }); setShowModal(false); },
    });
    const deleteMutation = useMutation({
        mutationFn: deleteSimulation,
        onSuccess: () => qc.invalidateQueries({ queryKey: ['simulations'] }),
    });
    const sims = simsData?.data ?? [];
    return (_jsxs("div", { className: "max-w-7xl mx-auto px-6 py-12", children: [_jsxs(motion.div, { initial: { opacity: 0, y: -16 }, animate: { opacity: 1, y: 0 }, className: "flex items-center justify-between mb-10", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-extrabold", children: "Dashboard" }), _jsxs("p", { className: "text-dim mt-1", children: [sims.length, " simulation", sims.length !== 1 ? 's' : '', " \u00B7 ", simsData?.total ?? 0, " total"] })] }), _jsxs("button", { onClick: () => setShowModal(true), className: "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-bg font-semibold text-sm hover:bg-primary/90 transition-all glow-green", children: [_jsx(Plus, { className: "w-4 h-4" }), "New Simulation"] })] }), isLoading ? (_jsx("div", { className: "flex items-center justify-center py-32", children: _jsx(Loader2, { className: "w-8 h-8 text-primary animate-spin" }) })) : sims.length === 0 ? (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, className: "flex flex-col items-center justify-center py-32 text-center", children: [_jsx("div", { className: "w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4", children: _jsx(Dna, { className: "w-8 h-8 text-primary" }) }), _jsx("h2", { className: "text-xl font-bold mb-2", children: "No simulations yet" }), _jsx("p", { className: "text-dim mb-6 max-w-sm", children: "Create your first simulation to start exploring evolutionary algorithms." }), _jsxs("button", { onClick: () => setShowModal(true), className: "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-bg font-semibold text-sm hover:bg-primary/90 transition-all", children: [_jsx(Plus, { className: "w-4 h-4" }), " Create First Simulation"] })] })) : (_jsx(motion.div, { variants: stagger, initial: "hidden", animate: "show", className: "grid sm:grid-cols-2 lg:grid-cols-3 gap-5", children: sims.map((sim) => (_jsx(SimCard, { sim: sim, onDelete: () => deleteMutation.mutate(sim._id) }, sim._id))) })), showModal && (_jsx(CreateSimulationModal, { fitnessFunctions: fns, onClose: () => setShowModal(false), onCreate: (data) => createMutation.mutate(data), loading: createMutation.isPending }))] }));
}
function SimCard({ sim, onDelete }) {
    const meta = statusMeta[sim.status] ?? statusMeta.idle;
    const Icon = meta.icon;
    return (_jsxs(motion.div, { variants: { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }, className: "group relative p-5 rounded-2xl bg-surface border border-border hover:border-primary/30 transition-all", children: [_jsxs("div", { className: `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${meta.color} mb-4`, children: [_jsx(Icon, { className: `w-3 h-3 ${sim.status === 'running' ? 'animate-spin' : ''}` }), meta.label] }), _jsx("h3", { className: "font-semibold text-text mb-1 truncate pr-8", children: sim.name }), sim.description && (_jsx("p", { className: "text-dim text-xs truncate mb-3", children: sim.description })), _jsxs("div", { className: "grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-border", children: [_jsx(Stat, { label: "Best Fitness", value: sim.bestFitnessEver.toFixed(4) }), _jsx(Stat, { label: "Generation", value: sim.currentGeneration.toString() }), _jsx(Stat, { label: "Population", value: sim.config.populationSize.toLocaleString() }), _jsx(Stat, { label: "Fitness Fn", value: sim.config.fitnessFunctionId, mono: true })] }), _jsxs("div", { className: "flex items-center gap-2 mt-4", children: [_jsxs(Link, { to: `/simulation/${sim._id}`, className: "flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-medium hover:bg-primary/20 transition-colors", children: [_jsx(Play, { className: "w-3 h-3" }), " View", _jsx(ChevronRight, { className: "w-3 h-3 ml-auto" })] }), _jsx("button", { onClick: (e) => { e.preventDefault(); onDelete(); }, className: "p-2 rounded-lg border border-border text-muted hover:text-red-400 hover:border-red-400/30 transition-colors", children: _jsx(Trash2, { className: "w-3.5 h-3.5" }) })] })] }));
}
function Stat({ label, value, mono = false }) {
    return (_jsxs("div", { children: [_jsx("div", { className: "text-xs text-muted mb-0.5", children: label }), _jsx("div", { className: `text-sm font-medium text-text truncate ${mono ? 'font-mono' : ''}`, children: value })] }));
}
