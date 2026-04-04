import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Dna, Zap, BarChart3, Globe,
  ChevronRight, FlaskConical, GitBranch, Shuffle
} from 'lucide-react';
import EvolutionCanvas from '../components/EvolutionCanvas';

const features = [
  {
    icon: Dna,
    title: 'Natural Selection',
    desc: 'Organisms with higher fitness survive and reproduce. Watch populations adapt across generations in real time.',
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/20',
  },
  {
    icon: GitBranch,
    title: 'Genetic Crossover',
    desc: 'Four crossover strategies — single-point, two-point, uniform, arithmetic — recombine parent genomes.',
    color: 'text-cyan',
    bg: 'bg-cyan/10',
    border: 'border-cyan/20',
  },
  {
    icon: Shuffle,
    title: 'Mutation & Diversity',
    desc: 'Per-gene mutation prevents stagnation. Diversity scores track population spread across the fitness landscape.',
    color: 'text-purple',
    bg: 'bg-purple/10',
    border: 'border-purple/20',
  },
  {
    icon: BarChart3,
    title: 'Real-time Analytics',
    desc: 'Live fitness charts, species counts, ancestor lineage tracing, and genome distribution visualisations.',
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/20',
  },
  {
    icon: Globe,
    title: 'Environment Pressure',
    desc: 'Temperature, food availability, and predator pressure shape which traits are advantageous in each run.',
    color: 'text-cyan',
    bg: 'bg-cyan/10',
    border: 'border-cyan/20',
  },
  {
    icon: Zap,
    title: 'Multiple Encodings',
    desc: 'Binary, real-valued, integer, and permutation genome encodings cover classic and applied GA problems.',
    color: 'text-purple',
    bg: 'bg-purple/10',
    border: 'border-purple/20',
  },
];

const steps = [
  { n: '01', title: 'Configure',   desc: 'Set population size, genome encoding, selection strategy, and environmental pressure.' },
  { n: '02', title: 'Evolve',      desc: 'The engine runs the generation loop — selection, crossover, mutation — and persists every generation.' },
  { n: '03', title: 'Analyse',     desc: 'Explore fitness curves, top organisms, species diversity, and ancestor lineage in the dashboard.' },
];

const fade  = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.1 } } };

export default function Landing() {
  return (
    <div className="overflow-hidden">

      {/* ── Hero ── */}
      <section className="relative min-h-[92vh] flex items-center">
        {/* Background canvas */}
        <div className="absolute inset-0 opacity-60">
          <EvolutionCanvas className="w-full h-full" />
        </div>

        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-bg/60 to-bg pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="max-w-3xl"
          >
            <motion.div variants={fade} className="flex items-center gap-2 mb-6">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 border border-primary/20 text-primary">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Open Source · Production Ready
              </span>
            </motion.div>

            <motion.h1 variants={fade} className="text-5xl sm:text-7xl font-extrabold leading-tight tracking-tight mb-6">
              Simulate{' '}
              <span className="gradient-text text-glow">Evolution.</span>
              <br />
              Understand Life.
            </motion.h1>

            <motion.p variants={fade} className="text-lg sm:text-xl text-dim leading-relaxed mb-10 max-w-2xl">
              A full-stack evolutionary algorithm engine. Create populations, apply natural selection,
              watch species emerge, and analyse adaptation across thousands of generations — all persisted in real time.
            </motion.p>

            <motion.div variants={fade} className="flex flex-wrap gap-4">
              <Link
                to="/dashboard"
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-bg font-semibold text-sm hover:bg-primary/90 transition-all glow-green"
              >
                Start Simulating
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/science"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-border text-text font-semibold text-sm hover:bg-white/10 hover:border-primary/30 transition-all"
              >
                <FlaskConical className="w-4 h-4 text-cyan" />
                Explore the Science
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-bg to-transparent" />
      </section>

      {/* ── Stats bar ── */}
      <section className="border-y border-border bg-surface/50">
        <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {[
            { val: '4',       label: 'Genome Encodings' },
            { val: '4',       label: 'Selection Strategies' },
            { val: '100K',    label: 'Max Population' },
            { val: '∞',       label: 'Simulations' },
          ].map(({ val, label }) => (
            <div key={label}>
              <div className="text-3xl font-extrabold gradient-text">{val}</div>
              <div className="text-sm text-dim mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
        >
          <motion.div variants={fade} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything evolution needs
            </h2>
            <p className="text-dim max-w-xl mx-auto">
              From genome initialisation to speciation — every mechanism of evolutionary computation, implemented and exposed via REST API.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, desc, color, bg, border }) => (
              <motion.div
                key={title}
                variants={fade}
                className={`p-6 rounded-2xl bg-surface border ${border} hover:border-opacity-50 transition-all group`}
              >
                <div className={`w-10 h-10 rounded-xl ${bg} border ${border} flex items-center justify-center mb-4`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <h3 className="font-semibold text-text mb-2">{title}</h3>
                <p className="text-dim text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-surface/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
          >
            <motion.div variants={fade} className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">How it works</h2>
              <p className="text-dim max-w-xl mx-auto">Three steps from configuration to insight.</p>
            </motion.div>

            <div className="grid sm:grid-cols-3 gap-8">
              {steps.map(({ n, title, desc }) => (
                <motion.div key={n} variants={fade} className="relative">
                  <div className="text-6xl font-extrabold text-primary/10 mb-4 font-mono">{n}</div>
                  <h3 className="text-xl font-bold mb-2">{title}</h3>
                  <p className="text-dim text-sm leading-relaxed">{desc}</p>
                  {n !== '03' && (
                    <ChevronRight className="hidden sm:block absolute -right-4 top-8 text-primary/30 w-6 h-6" />
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-7xl mx-auto px-6 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden border border-primary/20 bg-surface p-12 glow-green"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-cyan/5 pointer-events-none" />
          <div className="relative z-10">
            <Dna className="w-12 h-12 text-primary mx-auto mb-6 animate-float" />
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
              Ready to evolve?
            </h2>
            <p className="text-dim mb-8 max-w-md mx-auto">
              Create your first simulation in under a minute. Watch natural selection happen in real time.
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-bg font-bold hover:bg-primary/90 transition-all glow-green"
            >
              Open Dashboard <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
