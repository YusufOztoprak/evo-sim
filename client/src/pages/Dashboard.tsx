import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Plus, Play, Trash2, ChevronRight, Dna,
  CheckCircle, Clock, AlertCircle, Loader2, PauseCircle
} from 'lucide-react';
import {
  fetchSimulations, createSimulation, deleteSimulation, fetchFitnessFunctions,
} from '../api/client';
import CreateSimulationModal from '../components/simulation/CreateSimulationModal';
import type { ISimulation, SimulationConfig } from '../types';

const statusMeta: Record<string, { label: string; color: string; icon: React.FC<{ className?: string }> }> = {
  idle:      { label: 'Idle',      color: 'text-dim    border-border    bg-border/30',       icon: Clock },
  running:   { label: 'Running',   color: 'text-cyan   border-cyan/30   bg-cyan/10',         icon: Loader2 },
  paused:    { label: 'Paused',    color: 'text-purple border-purple/30 bg-purple/10',       icon: PauseCircle },
  completed: { label: 'Completed', color: 'text-primary border-primary/30 bg-primary/10',   icon: CheckCircle },
  error:     { label: 'Error',     color: 'text-red-400 border-red-400/30 bg-red-400/10',   icon: AlertCircle },
};

const fade    = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.06 } } };

export default function Dashboard() {
  const [showModal, setShowModal] = useState(false);
  const qc = useQueryClient();

  const { data: simsData, isLoading } = useQuery({
    queryKey: ['simulations'],
    queryFn:  () => fetchSimulations(1, 50),
    refetchInterval: 5000,
  });

  const { data: fns = [] } = useQuery({
    queryKey: ['fitness-functions'],
    queryFn:  fetchFitnessFunctions,
    staleTime: Infinity,
  });

  const createMutation = useMutation({
    mutationFn: createSimulation,
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['simulations'] }); setShowModal(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSimulation,
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['simulations'] }),
  });

  const sims = simsData?.data ?? [];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-10"
      >
        <div>
          <h1 className="text-3xl font-extrabold">Dashboard</h1>
          <p className="text-dim mt-1">
            {sims.length} simulation{sims.length !== 1 ? 's' : ''} · {simsData?.total ?? 0} total
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-bg font-semibold text-sm hover:bg-primary/90 transition-all glow-green"
        >
          <Plus className="w-4 h-4" />
          New Simulation
        </button>
      </motion.div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : sims.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-32 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
            <Dna className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold mb-2">No simulations yet</h2>
          <p className="text-dim mb-6 max-w-sm">Create your first simulation to start exploring evolutionary algorithms.</p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-bg font-semibold text-sm hover:bg-primary/90 transition-all"
          >
            <Plus className="w-4 h-4" /> Create First Simulation
          </button>
        </motion.div>
      ) : (
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {sims.map((sim) => (
            <SimCard
              key={sim._id}
              sim={sim}
              onDelete={() => deleteMutation.mutate(sim._id)}
            />
          ))}
        </motion.div>
      )}

      {showModal && (
        <CreateSimulationModal
          fitnessFunctions={fns}
          onClose={() => setShowModal(false)}
          onCreate={(data) => createMutation.mutate(data)}
          loading={createMutation.isPending}
        />
      )}
    </div>
  );
}

function SimCard({ sim, onDelete }: { sim: ISimulation; onDelete: () => void }) {
  const meta = statusMeta[sim.status] ?? statusMeta.idle;
  const Icon = meta.icon;

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
      className="group relative p-5 rounded-2xl bg-surface border border-border hover:border-primary/30 transition-all"
    >
      {/* Status badge */}
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${meta.color} mb-4`}>
        <Icon className={`w-3 h-3 ${sim.status === 'running' ? 'animate-spin' : ''}`} />
        {meta.label}
      </div>

      <h3 className="font-semibold text-text mb-1 truncate pr-8">{sim.name}</h3>
      {sim.description && (
        <p className="text-dim text-xs truncate mb-3">{sim.description}</p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-border">
        <Stat label="Best Fitness" value={sim.bestFitnessEver.toFixed(4)} />
        <Stat label="Generation"   value={sim.currentGeneration.toString()} />
        <Stat label="Population"   value={sim.config.populationSize.toLocaleString()} />
        <Stat label="Fitness Fn"   value={sim.config.fitnessFunctionId} mono />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-4">
        <Link
          to={`/simulation/${sim._id}`}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
        >
          <Play className="w-3 h-3" /> View
          <ChevronRight className="w-3 h-3 ml-auto" />
        </Link>
        <button
          onClick={(e) => { e.preventDefault(); onDelete(); }}
          className="p-2 rounded-lg border border-border text-muted hover:text-red-400 hover:border-red-400/30 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

function Stat({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-xs text-muted mb-0.5">{label}</div>
      <div className={`text-sm font-medium text-text truncate ${mono ? 'font-mono' : ''}`}>{value}</div>
    </div>
  );
}
