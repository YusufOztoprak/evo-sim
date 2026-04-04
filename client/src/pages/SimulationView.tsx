import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, AreaChart, Area, Line, ComposedChart,
} from 'recharts';
import {
  ArrowLeft, Play, Square, Loader2, CheckCircle, AlertCircle,
  TrendingUp, Users, Dna, Activity, Clock, Wifi,
} from 'lucide-react';
import {
  fetchSimulation, startSimulation, stopSimulation,
  fetchFitnessHistory, fetchTopOrganisms,
} from '../api/client';
import type { ISimulation, IOrganism } from '../types';

const statusColor: Record<string, string> = {
  idle:      'text-dim',
  running:   'text-cyan',
  paused:    'text-purple',
  completed: 'text-primary',
  error:     'text-red-400',
};

export default function SimulationView() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [isStarting, setIsStarting] = useState(false);
  const [loadingTooLong, setLoadingTooLong] = useState(false);
  const startReqRef = useRef(false);

  const { data: sim, isError, isLoading } = useQuery({
    queryKey: ['simulation', id],
    queryFn:  () => fetchSimulation(id!),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'running' ? 2000 : false;
    },
    enabled: !!id,
    retry: 3,
  });

  const { data: rawHistory = [] } = useQuery({
    queryKey: ['fitness-history', id],
    queryFn:  () => fetchFitnessHistory(id!),
    refetchInterval: sim?.status === 'running' ? 3000 : false,
    enabled: !!id,
  });

  // Memoize chart data — prevents recharts re-render on unrelated state changes
  const history = useMemo(() => rawHistory, [rawHistory.length]);

  const { data: topOrganisms = [] } = useQuery({
    queryKey: ['top-organisms', id],
    queryFn:  () => fetchTopOrganisms(id!, 10),
    enabled: !!id && sim?.status === 'completed',
  });

  // Show "warming up" message after 5s of loading
  useEffect(() => {
    if (!isLoading) return;
    const t = setTimeout(() => setLoadingTooLong(true), 5000);
    return () => clearTimeout(t);
  }, [isLoading]);

  useEffect(() => {
    if (sim?.status === 'completed') {
      qc.invalidateQueries({ queryKey: ['top-organisms', id] });
      qc.invalidateQueries({ queryKey: ['fitness-history', id] });
      setIsStarting(false);
    }
  }, [sim?.status]);

  async function handleStart() {
    if (!id || startReqRef.current) return;
    startReqRef.current = true;
    setIsStarting(true);
    startSimulation(id)
      .then(() => {
        qc.invalidateQueries({ queryKey: ['simulation', id] });
        qc.invalidateQueries({ queryKey: ['fitness-history', id] });
        qc.invalidateQueries({ queryKey: ['top-organisms', id] });
      })
      .catch(() => {})
      .finally(() => {
        setIsStarting(false);
        startReqRef.current = false;
      });
    // Give backend a moment to flip status to 'running'
    setTimeout(() => qc.invalidateQueries({ queryKey: ['simulation', id] }), 1200);
  }

  async function handleStop() {
    if (!id) return;
    await stopSimulation(id);
    qc.invalidateQueries({ queryKey: ['simulation', id] });
  }

  // ── Loading state ─────────────────────────────────────────────────────────
  if (isLoading || (!sim && !isError)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        {loadingTooLong && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan/10 border border-cyan/20 text-cyan text-sm"
          >
            <Wifi className="w-4 h-4" />
            Server is warming up — this takes ~15 seconds on first load
          </motion.div>
        )}
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (isError || !sim) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <h2 className="text-xl font-bold">Failed to load simulation</h2>
        <p className="text-dim text-sm max-w-sm">
          The server may be unavailable or this simulation doesn't exist.
        </p>
        <Link to="/dashboard"
          className="px-4 py-2 rounded-xl bg-surface border border-border text-sm hover:border-primary/30 transition-colors">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  const isRunning = sim.status === 'running' || isStarting;
  const canStart  = sim.status === 'idle' || sim.status === 'paused';
  const canStop   = sim.status === 'running';
  const progress  = sim.config.maxGenerations > 0
    ? Math.round((sim.currentGeneration / sim.config.maxGenerations) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Back */}
      <Link to="/dashboard"
        className="inline-flex items-center gap-1.5 text-dim hover:text-text text-sm mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Dashboard
      </Link>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
      >
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold">{sim.name}</h1>
            <span className={`text-sm font-medium ${statusColor[sim.status]}`}>
              {isRunning && <Loader2 className="inline w-3.5 h-3.5 animate-spin mr-1" />}
              {sim.status}
            </span>
          </div>
          {sim.description && <p className="text-dim text-sm">{sim.description}</p>}
        </div>

        <div className="flex items-center gap-3">
          {canStart && (
            <button onClick={handleStart} disabled={isStarting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-bg font-semibold text-sm hover:bg-primary/90 disabled:opacity-60 transition-all glow-green">
              {isStarting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {isStarting ? 'Running…' : 'Start'}
            </button>
          )}
          {canStop && (
            <button onClick={handleStop}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface border border-red-400/30 text-red-400 font-semibold text-sm hover:bg-red-400/10 transition-all">
              <Square className="w-4 h-4" /> Stop
            </button>
          )}
        </div>
      </motion.div>

      {/* Progress bar */}
      {sim.status !== 'idle' && (
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs text-dim mb-1.5">
            <span>Generation {sim.currentGeneration} / {sim.config.maxGenerations}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 bg-border rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-cyan rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={TrendingUp} label="Best Fitness"  value={sim.bestFitnessEver.toFixed(6)} color="text-primary" />
        <StatCard icon={Activity}   label="Generation"    value={`${sim.currentGeneration}`}     color="text-cyan"    />
        <StatCard icon={Users}      label="Population"    value={sim.config.populationSize.toLocaleString()} color="text-purple" />
        <StatCard icon={Dna}        label="Fitness Fn"    value={sim.config.fitnessFunctionId}   color="text-primary" mono />
      </div>

      {/* Fitness chart */}
      {history.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-surface border border-border mb-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold text-lg">Fitness Over Generations</h2>
              <p className="text-dim text-sm">{history.length} generations recorded</p>
            </div>
            {isRunning && (
              <span className="inline-flex items-center gap-1.5 text-xs text-cyan">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
                Live
              </span>
            )}
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={history} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <defs>
                <linearGradient id="maxGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#00ff88" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#00ff88" stopOpacity={0}    />
                </linearGradient>
                <linearGradient id="avgGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#06b6d4" stopOpacity={0.1}  />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2e" />
              <XAxis dataKey="generation" stroke="#4a4a6a" tick={{ fontSize: 11 }} tickLine={false} />
              <YAxis stroke="#4a4a6a" tick={{ fontSize: 11 }} tickLine={false} width={65} />
              <Tooltip
                contentStyle={{ background: '#0f0f1a', border: '1px solid #1a1a2e', borderRadius: 8 }}
                labelStyle={{ color: '#e2e8f0', fontSize: 12 }}
                itemStyle={{ fontSize: 12 }}
                formatter={(v: number) => v.toFixed(4)}
              />
              <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
              <Area type="monotone" dataKey="max" stroke="#00ff88" fill="url(#maxGrad)" strokeWidth={2} dot={false} name="Max" />
              <Area type="monotone" dataKey="avg" stroke="#06b6d4" fill="url(#avgGrad)" strokeWidth={2} dot={false} name="Avg" />
              <Line type="monotone" dataKey="min" stroke="#7c3aed" strokeWidth={1.5} dot={false} name="Min" strokeDasharray="4 4" />
            </ComposedChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Config + Top organisms */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-surface border border-border">
          <h2 className="font-bold mb-4">Configuration</h2>
          <dl className="space-y-2.5">
            {([
              ['Encoding',       sim.config.genomeEncoding],
              ['Genome Length',  sim.config.genomeLength],
              ['Selection',      sim.config.selectionStrategy],
              ['Crossover',      sim.config.crossoverStrategy],
              ['Mutation Rate',  sim.config.mutationRate],
              ['Crossover Rate', sim.config.crossoverRate],
              ['Elitism',        sim.config.elitismCount],
              ['Target Fitness', sim.config.targetFitness ?? '—'],
            ] as [string, string | number][]).map(([k, v]) => (
              <div key={k} className="flex items-center justify-between text-sm">
                <dt className="text-dim">{k}</dt>
                <dd className="font-mono text-text">{String(v)}</dd>
              </div>
            ))}
          </dl>
        </div>

        {topOrganisms.length > 0 ? (
          <div className="p-6 rounded-2xl bg-surface border border-border">
            <h2 className="font-bold mb-4">Top Organisms</h2>
            <div className="space-y-3">
              {topOrganisms.slice(0, 8).map((org, i) => (
                <OrganismRow
                  key={org._id}
                  org={org}
                  rank={i + 1}
                  maxFitness={topOrganisms[0]?.fitness ?? 1}
                  minFitness={topOrganisms[topOrganisms.length - 1]?.fitness ?? 0}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-surface border border-border flex flex-col items-center justify-center text-center py-12">
            <Clock className="w-8 h-8 text-muted mb-3" />
            <p className="text-dim text-sm">
              {canStart
                ? 'Start the simulation to see top organisms.'
                : isRunning
                ? 'Organisms will appear when the simulation completes.'
                : 'No organism data yet.'}
            </p>
          </div>
        )}
      </div>

      {/* Status banners */}
      {sim.status === 'error' && sim.errorMessage && (
        <div className="mt-6 p-4 rounded-xl bg-red-400/10 border border-red-400/20 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-400">Simulation Error</p>
            <p className="text-xs text-red-400/70 mt-1 font-mono">{sim.errorMessage}</p>
          </div>
        </div>
      )}

      {sim.status === 'completed' && (
        <div className="mt-6 p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
          <p className="text-sm text-primary font-medium">
            Simulation complete — {sim.currentGeneration} generations · best fitness: {sim.bestFitnessEver.toFixed(6)}
          </p>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, mono = false }: {
  icon: React.FC<{ className?: string }>;
  label: string; value: string; color: string; mono?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-4 rounded-2xl bg-surface border border-border"
    >
      <div className={`flex items-center gap-2 mb-2 ${color}`}>
        <Icon className="w-4 h-4" />
        <span className="text-xs font-medium text-dim">{label}</span>
      </div>
      <div className={`text-xl font-bold truncate ${mono ? 'font-mono text-base' : ''}`}>{value}</div>
    </motion.div>
  );
}

function OrganismRow({ org, rank, maxFitness, minFitness }: {
  org: IOrganism; rank: number; maxFitness: number; minFitness: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const range = maxFitness - minFitness;
  const pct   = range === 0 ? 100 : Math.round(((org.fitness - minFitness) / range) * 100);
  const preview = org.genome.slice(0, 5).map(g => Number(g).toFixed(2)).join(', ');
  const full    = org.genome.map(g => Number(g).toFixed(2)).join(', ');

  return (
    <div className="flex items-start gap-3">
      <span className="text-xs text-muted w-5 font-mono text-right mt-1">{rank}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between text-xs mb-1 gap-2">
          <button
            onClick={() => setExpanded(v => !v)}
            className={`font-mono text-dim text-left hover:text-cyan transition-colors ${expanded ? 'break-all whitespace-normal' : 'truncate'}`}
          >
            [{expanded ? full : preview}{!expanded && org.genome.length > 5 ? '…' : ''}]
          </button>
          <span className="text-primary font-semibold flex-shrink-0">{org.fitness.toFixed(5)}</span>
        </div>
        <div className="h-1 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-cyan rounded-full transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
