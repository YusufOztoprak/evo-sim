import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, } from 'recharts';
import { ArrowLeft, Play, Square, Loader2, CheckCircle, AlertCircle, TrendingUp, Users, Dna, Activity, Clock, } from 'lucide-react';
import { fetchSimulation, startSimulation, stopSimulation, fetchFitnessHistory, fetchTopOrganisms, } from '../api/client';
const statusColor = {
    idle: 'text-dim',
    running: 'text-cyan',
    paused: 'text-purple',
    completed: 'text-primary',
    error: 'text-red-400',
};
export default function SimulationView() {
    const { id } = useParams();
    const qc = useQueryClient();
    const [isStarting, setIsStarting] = useState(false);
    const startReqRef = useRef(false);
    // Poll simulation status every 2s while running
    const { data: sim } = useQuery({
        queryKey: ['simulation', id],
        queryFn: () => fetchSimulation(id),
        refetchInterval: (query) => {
            const status = query.state.data?.status;
            return status === 'running' ? 2000 : false;
        },
        enabled: !!id,
    });
    // Poll fitness history while running
    const { data: history = [] } = useQuery({
        queryKey: ['fitness-history', id],
        queryFn: () => fetchFitnessHistory(id),
        refetchInterval: sim?.status === 'running' ? 3000 : false,
        enabled: !!id,
    });
    const { data: topOrganisms = [] } = useQuery({
        queryKey: ['top-organisms', id],
        queryFn: () => fetchTopOrganisms(id, 10),
        enabled: !!id && sim?.status === 'completed',
    });
    // When sim completes, refresh everything once
    useEffect(() => {
        if (sim?.status === 'completed') {
            qc.invalidateQueries({ queryKey: ['top-organisms', id] });
            qc.invalidateQueries({ queryKey: ['fitness-history', id] });
            setIsStarting(false);
        }
    }, [sim?.status]);
    async function handleStart() {
        if (!id || startReqRef.current)
            return;
        startReqRef.current = true;
        setIsStarting(true);
        try {
            // Fire-and-forget — backend runs synchronously; we poll status separately
            startSimulation(id).then(() => {
                qc.invalidateQueries({ queryKey: ['simulation', id] });
                qc.invalidateQueries({ queryKey: ['fitness-history', id] });
                qc.invalidateQueries({ queryKey: ['top-organisms', id] });
                setIsStarting(false);
                startReqRef.current = false;
            }).catch(() => {
                setIsStarting(false);
                startReqRef.current = false;
            });
            // Give backend a moment to flip status to 'running'
            await new Promise((r) => setTimeout(r, 800));
            qc.invalidateQueries({ queryKey: ['simulation', id] });
        }
        catch {
            setIsStarting(false);
            startReqRef.current = false;
        }
    }
    async function handleStop() {
        if (!id)
            return;
        await stopSimulation(id);
        qc.invalidateQueries({ queryKey: ['simulation', id] });
    }
    if (!sim) {
        return (_jsx("div", { className: "flex items-center justify-center min-h-[60vh]", children: _jsx(Loader2, { className: "w-8 h-8 text-primary animate-spin" }) }));
    }
    const isRunning = sim.status === 'running' || isStarting;
    const canStart = sim.status === 'idle' || sim.status === 'paused';
    const canStop = sim.status === 'running';
    const progress = sim.config.maxGenerations > 0
        ? Math.round((sim.currentGeneration / sim.config.maxGenerations) * 100)
        : 0;
    return (_jsxs("div", { className: "max-w-7xl mx-auto px-6 py-10", children: [_jsxs(Link, { to: "/dashboard", className: "inline-flex items-center gap-1.5 text-dim hover:text-text text-sm mb-8 transition-colors", children: [_jsx(ArrowLeft, { className: "w-4 h-4" }), " Dashboard"] }), _jsxs(motion.div, { initial: { opacity: 0, y: -16 }, animate: { opacity: 1, y: 0 }, className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-3 mb-1", children: [_jsx("h1", { className: "text-2xl sm:text-3xl font-extrabold", children: sim.name }), _jsxs("span", { className: `text-sm font-medium ${statusColor[sim.status]}`, children: [isRunning && _jsx(Loader2, { className: "inline w-3.5 h-3.5 animate-spin mr-1" }), sim.status] })] }), sim.description && _jsx("p", { className: "text-dim text-sm", children: sim.description })] }), _jsxs("div", { className: "flex items-center gap-3", children: [canStart && (_jsxs("button", { onClick: handleStart, disabled: isStarting, className: "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-bg font-semibold text-sm hover:bg-primary/90 disabled:opacity-60 transition-all glow-green", children: [isStarting ? _jsx(Loader2, { className: "w-4 h-4 animate-spin" }) : _jsx(Play, { className: "w-4 h-4" }), isStarting ? 'Starting…' : 'Start'] })), canStop && (_jsxs("button", { onClick: handleStop, className: "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface border border-red-400/30 text-red-400 font-semibold text-sm hover:bg-red-400/10 transition-all", children: [_jsx(Square, { className: "w-4 h-4" }), " Stop"] }))] })] }), sim.status !== 'idle' && (_jsxs("div", { className: "mb-8", children: [_jsxs("div", { className: "flex items-center justify-between text-xs text-dim mb-1.5", children: [_jsxs("span", { children: ["Generation ", sim.currentGeneration, " / ", sim.config.maxGenerations] }), _jsxs("span", { children: [progress, "%"] })] }), _jsx("div", { className: "h-1.5 bg-border rounded-full overflow-hidden", children: _jsx(motion.div, { className: "h-full bg-gradient-to-r from-primary to-cyan rounded-full", initial: { width: 0 }, animate: { width: `${progress}%` }, transition: { duration: 0.5 } }) })] })), _jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8", children: [_jsx(StatCard, { icon: TrendingUp, label: "Best Fitness", value: sim.bestFitnessEver.toFixed(6), color: "text-primary" }), _jsx(StatCard, { icon: Activity, label: "Generation", value: `${sim.currentGeneration}`, color: "text-cyan" }), _jsx(StatCard, { icon: Users, label: "Population", value: sim.config.populationSize.toLocaleString(), color: "text-purple" }), _jsx(StatCard, { icon: Dna, label: "Fitness Fn", value: sim.config.fitnessFunctionId, color: "text-primary", mono: true })] }), history.length > 0 && (_jsxs(motion.div, { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, className: "p-6 rounded-2xl bg-surface border border-border mb-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { children: [_jsx("h2", { className: "font-bold text-lg", children: "Fitness Over Generations" }), _jsxs("p", { className: "text-dim text-sm", children: [history.length, " generations recorded"] })] }), isRunning && (_jsxs("span", { className: "inline-flex items-center gap-1.5 text-xs text-cyan", children: [_jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" }), "Live"] }))] }), _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(AreaChart, { data: history, margin: { top: 5, right: 20, bottom: 5, left: 0 }, children: [_jsxs("defs", { children: [_jsxs("linearGradient", { id: "maxGrad", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "5%", stopColor: "#00ff88", stopOpacity: 0.15 }), _jsx("stop", { offset: "95%", stopColor: "#00ff88", stopOpacity: 0 })] }), _jsxs("linearGradient", { id: "avgGrad", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "5%", stopColor: "#06b6d4", stopOpacity: 0.1 }), _jsx("stop", { offset: "95%", stopColor: "#06b6d4", stopOpacity: 0 })] })] }), _jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#1a1a2e" }), _jsx(XAxis, { dataKey: "generation", stroke: "#4a4a6a", tick: { fontSize: 11 }, tickLine: false }), _jsx(YAxis, { stroke: "#4a4a6a", tick: { fontSize: 11 }, tickLine: false, width: 60 }), _jsx(Tooltip, { contentStyle: { background: '#0f0f1a', border: '1px solid #1a1a2e', borderRadius: 8 }, labelStyle: { color: '#e2e8f0', fontSize: 12 }, itemStyle: { fontSize: 12 } }), _jsx(Legend, { wrapperStyle: { fontSize: 12, color: '#94a3b8' } }), _jsx(Area, { type: "monotone", dataKey: "max", stroke: "#00ff88", fill: "url(#maxGrad)", strokeWidth: 2, dot: false, name: "Max" }), _jsx(Area, { type: "monotone", dataKey: "avg", stroke: "#06b6d4", fill: "url(#avgGrad)", strokeWidth: 2, dot: false, name: "Avg" }), _jsx(Line, { type: "monotone", dataKey: "min", stroke: "#7c3aed", strokeWidth: 1.5, dot: false, name: "Min", strokeDasharray: "4 4" })] }) })] })), _jsxs("div", { className: "grid lg:grid-cols-2 gap-6", children: [_jsxs("div", { className: "p-6 rounded-2xl bg-surface border border-border", children: [_jsx("h2", { className: "font-bold mb-4", children: "Configuration" }), _jsx("dl", { className: "space-y-2.5", children: [
                                    ['Encoding', sim.config.genomeEncoding],
                                    ['Genome Length', sim.config.genomeLength],
                                    ['Selection', sim.config.selectionStrategy],
                                    ['Crossover', sim.config.crossoverStrategy],
                                    ['Mutation Rate', sim.config.mutationRate],
                                    ['Crossover Rate', sim.config.crossoverRate],
                                    ['Elitism', sim.config.elitismCount],
                                    ['Target Fitness', sim.config.targetFitness ?? '—'],
                                ].map(([k, v]) => (_jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsx("dt", { className: "text-dim", children: k }), _jsx("dd", { className: "font-mono text-text", children: String(v) })] }, String(k)))) })] }), topOrganisms.length > 0 && (_jsxs("div", { className: "p-6 rounded-2xl bg-surface border border-border", children: [_jsx("h2", { className: "font-bold mb-4", children: "Top Organisms" }), _jsx("div", { className: "space-y-2", children: topOrganisms.slice(0, 8).map((org, i) => (_jsx(OrganismRow, { org: org, rank: i + 1 }, org._id))) })] })), topOrganisms.length === 0 && sim.status !== 'completed' && (_jsxs("div", { className: "p-6 rounded-2xl bg-surface border border-border flex flex-col items-center justify-center text-center py-12", children: [_jsx(Clock, { className: "w-8 h-8 text-muted mb-3" }), _jsx("p", { className: "text-dim text-sm", children: canStart ? 'Start the simulation to see top organisms.' : 'Organism data will appear here.' })] }))] }), sim.status === 'error' && sim.errorMessage && (_jsxs("div", { className: "mt-6 p-4 rounded-xl bg-red-400/10 border border-red-400/20 flex items-start gap-3", children: [_jsx(AlertCircle, { className: "w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-red-400", children: "Simulation Error" }), _jsx("p", { className: "text-xs text-red-400/70 mt-1", children: sim.errorMessage })] })] })), sim.status === 'completed' && (_jsxs("div", { className: "mt-6 p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-3", children: [_jsx(CheckCircle, { className: "w-5 h-5 text-primary flex-shrink-0" }), _jsxs("p", { className: "text-sm text-primary font-medium", children: ["Simulation complete \u2014 ", sim.currentGeneration, " generations, best fitness: ", sim.bestFitnessEver.toFixed(6)] })] }))] }));
}
function StatCard({ icon: Icon, label, value, color, mono = false, }) {
    return (_jsxs(motion.div, { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, className: "p-4 rounded-2xl bg-surface border border-border", children: [_jsxs("div", { className: `flex items-center gap-2 mb-2 ${color}`, children: [_jsx(Icon, { className: "w-4 h-4" }), _jsx("span", { className: "text-xs font-medium text-dim", children: label })] }), _jsx("div", { className: `text-xl font-bold truncate ${mono ? 'font-mono text-base' : ''}`, children: value })] }));
}
function OrganismRow({ org, rank }) {
    const pct = Math.min(100, org.fitness * 100);
    return (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "text-xs text-muted w-5 font-mono text-right", children: rank }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center justify-between text-xs mb-1", children: [_jsxs("span", { className: "font-mono text-dim truncate max-w-[140px]", children: ["[", org.genome.slice(0, 6).map(g => g.toFixed ? g.toFixed(1) : g).join(', '), org.genome.length > 6 ? '…' : '', "]"] }), _jsx("span", { className: "text-primary font-semibold", children: org.fitness.toFixed(5) })] }), _jsx("div", { className: "h-1 bg-border rounded-full overflow-hidden", children: _jsx("div", { className: "h-full bg-gradient-to-r from-primary to-cyan rounded-full", style: { width: `${pct}%` } }) })] })] }));
}
