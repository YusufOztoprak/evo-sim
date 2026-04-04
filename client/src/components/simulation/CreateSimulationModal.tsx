import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, Info } from 'lucide-react';
import type { FitnessFunction, SimulationConfig } from '../../types';

interface Props {
  fitnessFunctions: FitnessFunction[];
  onClose:  () => void;
  onCreate: (data: { name: string; description?: string; config: SimulationConfig }) => void;
  loading:  boolean;
}

const DEFAULTS: SimulationConfig = {
  populationSize:    100,
  genomeLength:      10,
  genomeEncoding:    'binary',
  genomeMin:         0,
  genomeMax:         1,
  mutationRate:      0.01,
  crossoverRate:     0.8,
  elitismCount:      2,
  selectionStrategy: 'tournament',
  crossoverStrategy: 'single_point',
  maxGenerations:    50,
  fitnessFunctionId: 'onemax',
  environmentParams: { temperature: 0.5, foodAvailability: 0.5, predatorPressure: 0.3 },
};

function Field({
  label, hint, children,
}: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1 mb-1.5">
        <label className="text-sm font-medium text-text">{label}</label>
        {hint && (
          <span title={hint}>
            <Info className="w-3 h-3 text-muted cursor-help" />
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

const inputCls = 'w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary/50 transition-colors';
const selectCls = inputCls + ' appearance-none cursor-pointer';

export default function CreateSimulationModal({ fitnessFunctions, onClose, onCreate, loading }: Props) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [cfg, setCfg]   = useState<SimulationConfig>(DEFAULTS);

  const set = <K extends keyof SimulationConfig>(k: K, v: SimulationConfig[K]) =>
    setCfg((prev) => ({ ...prev, [k]: v }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate({ name: name.trim(), description: desc.trim() || undefined, config: cfg });
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1,    opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-surface border border-border rounded-2xl shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="font-bold text-lg">New Simulation</h2>
            <button onClick={onClose} className="text-dim hover:text-text transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic info */}
            <div className="space-y-4">
              <Field label="Name">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Survival Test #1"
                  className={inputCls}
                  required
                />
              </Field>
              <Field label="Description (optional)">
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="What are you testing?"
                  rows={2}
                  className={inputCls + ' resize-none'}
                />
              </Field>
            </div>

            <div className="border-t border-border" />

            {/* Fitness function */}
            <Field label="Fitness Function" hint="Determines how organism fitness is scored">
              <div className="relative">
                <select value={cfg.fitnessFunctionId} onChange={(e) => set('fitnessFunctionId', e.target.value)} className={selectCls}>
                  {fitnessFunctions.map((f) => (
                    <option key={f.id} value={f.id}>{f.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-muted pointer-events-none" />
              </div>
              {fitnessFunctions.find(f => f.id === cfg.fitnessFunctionId) && (
                <p className="text-xs text-dim mt-1.5">
                  {fitnessFunctions.find(f => f.id === cfg.fitnessFunctionId)?.description}
                </p>
              )}
            </Field>

            {/* Population */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Population Size" hint="Number of organisms per generation">
                <input type="number" min={2} max={100000} value={cfg.populationSize}
                  onChange={(e) => set('populationSize', Number(e.target.value))} className={inputCls} />
              </Field>
              <Field label="Genome Length" hint="Number of genes per organism">
                <input type="number" min={1} max={10000} value={cfg.genomeLength}
                  onChange={(e) => set('genomeLength', Number(e.target.value))} className={inputCls} />
              </Field>
              <Field label="Max Generations">
                <input type="number" min={1} value={cfg.maxGenerations}
                  onChange={(e) => set('maxGenerations', Number(e.target.value))} className={inputCls} />
              </Field>
              <Field label="Elitism Count" hint="Top N organisms that always survive">
                <input type="number" min={0} value={cfg.elitismCount}
                  onChange={(e) => set('elitismCount', Number(e.target.value))} className={inputCls} />
              </Field>
            </div>

            {/* Encoding */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Genome Encoding">
                <div className="relative">
                  <select value={cfg.genomeEncoding} onChange={(e) => set('genomeEncoding', e.target.value as SimulationConfig['genomeEncoding'])} className={selectCls}>
                    <option value="binary">Binary</option>
                    <option value="real">Real-valued</option>
                    <option value="integer">Integer</option>
                    <option value="permutation">Permutation</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-muted pointer-events-none" />
                </div>
              </Field>
              {cfg.genomeEncoding !== 'binary' && cfg.genomeEncoding !== 'permutation' && (
                <>
                  <Field label="Gene Min">
                    <input type="number" value={cfg.genomeMin} onChange={(e) => set('genomeMin', Number(e.target.value))} className={inputCls} />
                  </Field>
                  <Field label="Gene Max">
                    <input type="number" value={cfg.genomeMax} onChange={(e) => set('genomeMax', Number(e.target.value))} className={inputCls} />
                  </Field>
                </>
              )}
            </div>

            {/* Rates */}
            <div className="grid grid-cols-2 gap-4">
              <Field label={`Mutation Rate: ${cfg.mutationRate}`} hint="Probability of each gene mutating">
                <input type="range" min={0} max={1} step={0.001} value={cfg.mutationRate}
                  onChange={(e) => set('mutationRate', Number(e.target.value))}
                  className="w-full accent-primary" />
              </Field>
              <Field label={`Crossover Rate: ${cfg.crossoverRate}`} hint="Probability of crossover occurring">
                <input type="range" min={0} max={1} step={0.01} value={cfg.crossoverRate}
                  onChange={(e) => set('crossoverRate', Number(e.target.value))}
                  className="w-full accent-primary" />
              </Field>
            </div>

            {/* Strategies */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Selection Strategy">
                <div className="relative">
                  <select value={cfg.selectionStrategy} onChange={(e) => set('selectionStrategy', e.target.value as SimulationConfig['selectionStrategy'])} className={selectCls}>
                    <option value="tournament">Tournament</option>
                    <option value="roulette">Roulette Wheel</option>
                    <option value="rank">Rank</option>
                    <option value="elitist">Elitist</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-muted pointer-events-none" />
                </div>
              </Field>
              <Field label="Crossover Strategy">
                <div className="relative">
                  <select value={cfg.crossoverStrategy} onChange={(e) => set('crossoverStrategy', e.target.value as SimulationConfig['crossoverStrategy'])} className={selectCls}>
                    <option value="single_point">Single Point</option>
                    <option value="two_point">Two Point</option>
                    <option value="uniform">Uniform</option>
                    <option value="arithmetic">Arithmetic</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-muted pointer-events-none" />
                </div>
              </Field>
            </div>

            {/* Environment (survival only) */}
            {cfg.fitnessFunctionId === 'survival' && (
              <>
                <div className="border-t border-border" />
                <div>
                  <p className="text-sm font-medium text-text mb-3">Environment Parameters</p>
                  <div className="space-y-3">
                    {[
                      { key: 'temperature',      label: 'Temperature',       hint: '0=arctic, 1=desert' },
                      { key: 'foodAvailability', label: 'Food Availability', hint: '0=barren, 1=abundant' },
                      { key: 'predatorPressure', label: 'Predator Pressure', hint: '0=none, 1=extreme' },
                    ].map(({ key, label, hint }) => (
                      <Field key={key} label={`${label}: ${(cfg.environmentParams[key] ?? 0.5).toFixed(2)}`} hint={hint}>
                        <input type="range" min={0} max={1} step={0.01}
                          value={cfg.environmentParams[key] ?? 0.5}
                          onChange={(e) => set('environmentParams', { ...cfg.environmentParams, [key]: Number(e.target.value) })}
                          className="w-full accent-primary" />
                      </Field>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-dim hover:text-text hover:border-primary/30 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={loading || !name.trim()}
                className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-bg font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors glow-green">
                {loading ? 'Creating…' : 'Create Simulation'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
