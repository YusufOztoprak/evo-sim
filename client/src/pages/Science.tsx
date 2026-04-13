import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Dna, GitBranch, Shuffle, Target, BarChart3,
  ArrowRight, Zap, Globe, TrendingUp, FlaskConical
} from 'lucide-react';

const fade    = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.1 } } };

function Section({
  id, icon: Icon, color, title, children,
}: {
  id: string;
  icon: React.FC<{ className?: string }>;
  color: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      id={id}
      variants={fade}
      className="scroll-mt-24"
    >
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border mb-4 ${color}`}>
        <Icon className="w-3.5 h-3.5" />
        {title}
      </div>
      <div className="prose prose-invert max-w-none text-dim leading-relaxed">
        {children}
      </div>
    </motion.section>
  );
}

function Highlight({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-primary font-semibold not-italic">{children}</span>
  );
}

function Formula({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-5 flex justify-center">
      <div className="inline-block px-6 py-3 rounded-xl bg-bg border border-cyan/20 font-mono text-sm text-cyan tracking-wide shadow-[0_0_20px_rgba(6,182,212,0.08)]">
        {children}
      </div>
    </div>
  );
}

function Callout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="my-6 p-5 rounded-xl bg-primary/5 border border-primary/20">
      <p className="text-primary font-semibold text-sm mb-1">{title}</p>
      <p className="text-dim text-sm">{children}</p>
    </div>
  );
}

const toc = [
  { id: 'natural-selection', label: 'Natural Selection' },
  { id: 'genetic-algorithms', label: 'Genetic Algorithms' },
  { id: 'genome',             label: 'Genome Encoding' },
  { id: 'selection',          label: 'Selection Strategies' },
  { id: 'crossover',          label: 'Crossover' },
  { id: 'mutation',           label: 'Mutation' },
  { id: 'speciation',         label: 'Speciation' },
  { id: 'model-limitations',  label: 'Model Limitations' },
  { id: 'applications',       label: 'Real-world Applications' },
];

export default function Science() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 max-w-2xl"
      >
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-cyan/10 border border-cyan/20 text-cyan mb-4">
          <Dna className="w-3.5 h-3.5" />
          The Science Behind EvoSim
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
          Evolution, <span className="gradient-text">Explained.</span>
        </h1>
        <p className="text-dim text-lg leading-relaxed">
          From Darwin's natural selection to modern genetic algorithms — the biology and mathematics that power this simulator.
        </p>
      </motion.div>

      <div className="lg:grid lg:grid-cols-[240px_1fr] gap-12">
        {/* Table of contents */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-4">Contents</p>
            <nav className="space-y-1">
              {toc.map(({ id, label }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="block text-sm text-dim hover:text-primary transition-colors py-1 border-l-2 border-transparent hover:border-primary pl-3"
                >
                  {label}
                </a>
              ))}
            </nav>
            <div className="mt-8">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 text-xs text-primary hover:text-primary/80 transition-colors"
              >
                Try it yourself <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </aside>

        {/* Content */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="space-y-14"
        >

          <Section id="natural-selection" icon={Dna} color="text-primary border-primary/20 bg-primary/10" title="Natural Selection">
            <h2 className="text-2xl font-bold text-text mb-3">The Engine of Evolution</h2>
            <p>
              In 1859, Charles Darwin proposed that populations of organisms change over time
              through a process he called <Highlight>natural selection</Highlight>. The mechanism
              is elegantly simple: individuals vary in their traits, some traits help survival and
              reproduction more than others, and those advantageous traits are inherited by offspring.
            </p>
            <p className="mt-3">
              Over many generations, the frequency of beneficial traits increases in the population
              — the population <em>adapts</em> to its environment. This is evolution.
            </p>
            <Callout title="Key Insight">
              Natural selection doesn't "aim" at anything. It's a blind filter: organisms
              that happen to be better suited to current conditions simply leave more descendants.
              The appearance of design emerges from this simple process acting over time.
            </Callout>
            <p>
              In EvoSim, organisms have a <Highlight>fitness score</Highlight> computed by a
              fitness function. Higher fitness = more likely to reproduce. Lower fitness = more
              likely to be culled. Repeat for hundreds of generations and watch adaptation emerge.
            </p>
          </Section>

          <Section id="genetic-algorithms" icon={Zap} color="text-cyan border-cyan/20 bg-cyan/10" title="Genetic Algorithms">
            <h2 className="text-2xl font-bold text-text mb-3">Computation Inspired by Nature</h2>
            <p>
              <Highlight>Genetic Algorithms (GAs)</Highlight> are a class of optimisation
              algorithms that mimic biological evolution to search large solution spaces efficiently.
              Introduced by John Holland in the 1970s, GAs have become a cornerstone of
              computational intelligence.
            </p>
            <p className="mt-3">
              Instead of evaluating every possible solution (infeasible for complex problems),
              a GA maintains a <em>population</em> of candidate solutions and improves them
              iteratively through:
            </p>
            <ul className="mt-3 space-y-2 list-none">
              {[
                ['Selection',   'Choose fitter individuals as parents'],
                ['Crossover',   'Combine parent genomes to produce offspring'],
                ['Mutation',    'Randomly alter genes to maintain diversity'],
                ['Replacement', 'New generation replaces (part of) the old'],
              ].map(([term, def]) => (
                <li key={term} className="flex items-start gap-3">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-cyan flex-shrink-0" />
                  <span><span className="text-cyan font-semibold">{term}:</span> {def}</span>
                </li>
              ))}
            </ul>
            <Formula>
              {'Fitness(generation+1) ≥ Fitness(generation)  [on average, with elitism]'}
            </Formula>
            <p>
              The algorithm converges when the population reaches a fitness plateau
              or a <Highlight>target fitness</Highlight> is achieved. EvoSim supports both
              termination conditions.
            </p>
          </Section>

          <Section id="genome" icon={GitBranch} color="text-purple border-purple/20 bg-purple/10" title="Genome Encoding">
            <h2 className="text-2xl font-bold text-text mb-3">Representing Solutions as Genes</h2>
            <p>
              Every organism in EvoSim has a <Highlight>genome</Highlight> — an array of numbers
              that encodes a candidate solution. The encoding determines how genes are represented
              and which operators make sense.
            </p>
            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              {[
                {
                  name: 'Binary',
                  genes: '[1, 0, 1, 1, 0, 1, 0, 0]',
                  desc: 'Classic encoding. Each gene is 0 or 1. Used for combinatorial problems, feature selection, and the OneMax benchmark.',
                  color: 'border-primary/30 bg-primary/5',
                },
                {
                  name: 'Real-valued',
                  genes: '[0.72, 0.18, 0.95, 0.44]',
                  desc: 'Genes are floating-point numbers in [min, max]. Ideal for continuous optimisation: neural network weights, controller parameters.',
                  color: 'border-cyan/30 bg-cyan/5',
                },
                {
                  name: 'Integer',
                  genes: '[3, 7, 1, 9, 2, 5]',
                  desc: 'Like real-valued but rounded. Useful for discrete problems: scheduling, resource allocation.',
                  color: 'border-purple/30 bg-purple/5',
                },
                {
                  name: 'Permutation',
                  genes: '[2, 0, 3, 1, 4]',
                  desc: 'A shuffled sequence — each index appears exactly once. Models ordering problems like the Travelling Salesman Problem.',
                  color: 'border-primary/30 bg-primary/5',
                },
              ].map(({ name, genes, desc, color }) => (
                <div key={name} className={`p-4 rounded-xl border ${color}`}>
                  <p className="font-bold text-text mb-1">{name}</p>
                  <code className="text-xs text-cyan block mb-2">{genes}</code>
                  <p className="text-xs">{desc}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section id="selection" icon={Target} color="text-primary border-primary/20 bg-primary/10" title="Selection Strategies">
            <h2 className="text-2xl font-bold text-text mb-3">Who Gets to Reproduce?</h2>
            <p>
              Selection pressure determines how strongly fitness biases reproduction.
              Too high and you lose diversity (premature convergence). Too low and
              evolution stalls. EvoSim offers four strategies:
            </p>
            <div className="mt-6 space-y-4">
              {[
                {
                  name: 'Tournament Selection',
                  badge: 'Default',
                  desc: 'Pick k random individuals, select the fittest. Tunable selection pressure via tournament size k. Robust and widely used.',
                  formula: 'P(win) ≈ 1 − (1 − 1/N)^k',
                },
                {
                  name: 'Roulette Wheel',
                  badge: 'Proportional',
                  desc: 'Each organism gets a slice of a wheel proportional to its fitness. Fitter = bigger slice. Sensitive to fitness scale.',
                  formula: 'P(select_i) = fitness_i / Σ fitness',
                },
                {
                  name: 'Rank Selection',
                  badge: 'Rank-based',
                  desc: 'Sort by fitness, assign selection probability by rank. Reduces dominance of very fit individuals. More stable.',
                  formula: 'P(select_i) = (N − rank_i + 1) / Σ ranks',
                },
                {
                  name: 'Elitist Selection',
                  badge: 'Always best',
                  desc: 'Always select the current best organism. Extremely high pressure — fast convergence but very low diversity.',
                  formula: 'P(select_i) = 1 if fitness_i = max, else 0',
                },
              ].map(({ name, badge, desc, formula }) => (
                <div key={name} className="p-4 rounded-xl bg-surface border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-text">{name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">{badge}</span>
                  </div>
                  <p className="text-sm mb-2">{desc}</p>
                  <code className="text-xs text-cyan">{formula}</code>
                </div>
              ))}
            </div>
          </Section>

          <Section id="crossover" icon={GitBranch} color="text-cyan border-cyan/20 bg-cyan/10" title="Crossover">
            <h2 className="text-2xl font-bold text-text mb-3">Combining Parent Genomes</h2>
            <p>
              <Highlight>Crossover</Highlight> (recombination) is the primary source of
              genetic variation in EAs. Two parent genomes are combined to produce offspring
              that inherit traits from both parents — analogous to sexual reproduction.
            </p>
            <div className="mt-6 space-y-4">
              {[
                {
                  name: 'Single-point',
                  example: 'Parent A: [1 1 1 | 0 0 0]  →  Child: [1 1 1 0 1 1]',
                  desc: 'A random cut point splits both parents. Left of cut from parent A, right from parent B.',
                },
                {
                  name: 'Two-point',
                  example: 'A: [1 | 1 1 | 0]  +  B: [0 | 0 0 | 1]  →  [1 0 0 0]',
                  desc: 'Two cut points. Middle segment swapped. Better at preserving building blocks.',
                },
                {
                  name: 'Uniform',
                  example: 'Each gene independently from A or B with P=0.5',
                  desc: 'No positional bias. Maximum mixing. Risk of disrupting co-evolved genes.',
                },
                {
                  name: 'Arithmetic',
                  example: 'child_i = α·a_i + (1−α)·b_i',
                  desc: 'Blend parents with a random weight α. Only valid for real-valued encodings. Explores interior of the search space.',
                },
              ].map(({ name, example, desc }) => (
                <div key={name} className="p-4 rounded-xl bg-surface border border-border">
                  <p className="font-semibold text-text mb-1">{name}</p>
                  <code className="text-xs text-cyan block mb-2">{example}</code>
                  <p className="text-sm">{desc}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section id="mutation" icon={Shuffle} color="text-purple border-purple/20 bg-purple/10" title="Mutation">
            <h2 className="text-2xl font-bold text-text mb-3">Introducing Genetic Novelty</h2>
            <p>
              Without mutation, a GA can only recombine existing genetic material.
              <Highlight> Mutation</Highlight> introduces new alleles — it's the source of
              truly novel traits. A low mutation rate maintains stability; too high
              and the algorithm becomes a random search.
            </p>
            <Formula>
              {'P(mutate gene) = mutationRate  (applied independently per gene)'}
            </Formula>
            <p className="mt-3">EvoSim applies encoding-specific mutation:</p>
            <ul className="mt-3 space-y-2">
              <li className="flex items-start gap-3">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-purple flex-shrink-0" />
                <span><span className="text-purple font-semibold">Binary:</span> Bit-flip (0→1, 1→0)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-purple flex-shrink-0" />
                <span><span className="text-purple font-semibold">Real/Integer:</span> Gaussian perturbation — gene += N(0, σ), clamped to [min, max]</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-purple flex-shrink-0" />
                <span><span className="text-purple font-semibold">Permutation:</span> Swap mutation — two random positions exchanged, preserving validity</span>
              </li>
            </ul>
            <Callout title="Finding the sweet spot">
              Classic rule of thumb: mutationRate ≈ 1/genomeLength. For a 20-gene genome, 0.05 is a good starting point.
            </Callout>
          </Section>

          <Section id="speciation" icon={BarChart3} color="text-primary border-primary/20 bg-primary/10" title="Speciation">
            <h2 className="text-2xl font-bold text-text mb-3">Population Divergence</h2>
            <p>
              In nature, populations that become reproductively isolated can diverge into
              distinct <Highlight>species</Highlight>. EvoSim tracks species by measuring
              genome distance between organisms.
            </p>
            <p className="mt-3">
              Organisms are assigned to the nearest species whose <em>representative genome</em>
              is within a configurable distance threshold. If no species is close enough,
              a new species is created.
            </p>
            <Formula>
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
                <span>
                  <span className="text-purple text-xs uppercase tracking-widest mr-2">binary</span>
                  d(a,b) = Hamming(a,b) / len
                </span>
                <span className="text-muted hidden sm:block">|</span>
                <span>
                  <span className="text-purple text-xs uppercase tracking-widest mr-2">real</span>
                  d(a,b) ={' '}
                  <span className="inline-flex items-start gap-0.5">
                    <span className="text-lg leading-none">√</span>
                    <span className="border-t border-cyan px-0.5">
                      Σ(aᵢ − bᵢ)²
                    </span>
                  </span>
                  {' '}/ len
                </span>
              </div>
            </Formula>
            <p className="mt-3">
              Species that haven't been observed for two or more generations are marked
              <span className="text-red-400 font-semibold"> extinct</span>. The analytics
              dashboard tracks active vs. extinct species over time — a signal of population diversity.
            </p>
          </Section>

          <Section id="model-limitations" icon={FlaskConical} color="text-yellow-400 border-yellow-400/20 bg-yellow-400/10" title="Model Limitations">
            <h2 className="text-2xl font-bold text-text mb-3">What This Simulator Does — and Doesn't — Model</h2>
            <p>
              EvoSim is a <Highlight>genetic algorithm engine</Highlight>, not a biological simulator.
              The survival fitness function uses biological labels (speed, vision, camouflage, energy),
              but its design reflects the priorities of an optimisation benchmark, not evolutionary biology.
              Three specific simplifications are worth understanding:
            </p>

            <div className="mt-6 space-y-4">
              <div className="p-4 rounded-xl bg-surface border border-yellow-400/20">
                <div className="font-semibold text-text text-sm mb-1">No trait trade-offs</div>
                <p className="text-xs">
                  Traits contribute additively — a genome of [1, 1, 1, 1] is always the global optimum.
                  In real organisms, speed requires metabolic energy, large eyes consume neural resources,
                  and camouflage conflicts with mate-signalling pigmentation. There is no budget constraint
                  that makes it impossible to maximise all traits simultaneously.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-surface border border-yellow-400/20">
                <div className="font-semibold text-text text-sm mb-1">No frequency-dependent selection</div>
                <p className="text-xs">
                  A genome's fitness depends only on its own trait values and the environment — not on what
                  the rest of the population looks like. In real ecosystems, when camouflage becomes
                  ubiquitous, predators adapt and the advantage erodes. Common strategies become targets;
                  rare strategies gain an edge. This dynamic is absent here.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-surface border border-yellow-400/20">
                <div className="font-semibold text-text text-sm mb-1">Static fitness landscape by default</div>
                <p className="text-xs">
                  Unless <em>Dynamic Environment</em> is enabled, the optimal genome is fixed from
                  generation 0. The population performs hill-climbing toward a stationary target.
                  Real environments shift continuously — a trait that is advantageous today may be neutral
                  or harmful tomorrow. Enable dynamic environment mode to approximate a moving landscape.
                </p>
              </div>
            </div>

            <Callout title="Why this matters">
              These are design decisions, not bugs. GAs are mathematical optimisation tools first.
              Calling the variables "speed" and "camouflage" makes the output more interpretable,
              but the engine's job is to find high-fitness genomes — not to faithfully reproduce
              evolutionary dynamics. Adding a trait budget or frequency-dependent selection would
              change that balance, and remains an open direction for this project.
            </Callout>
          </Section>

          <Section id="applications" icon={Globe} color="text-cyan border-cyan/20 bg-cyan/10" title="Real-world Applications">
            <h2 className="text-2xl font-bold text-text mb-3">Where Genetic Algorithms Are Used</h2>
            <p>
              GAs are deployed wherever the search space is vast, discontinuous, or poorly
              understood:
            </p>
            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              {[
                { area: 'Neural Architecture Search', desc: 'Evolve neural network topologies for AutoML systems (e.g. NeuroEvolution of Augmenting Topologies — NEAT).' },
                { area: 'Antenna Design',             desc: 'NASA used GAs to evolve antennas for the Space Technology 5 mission. The shapes look alien but outperform hand-designed antennas.' },
                { area: 'Drug Discovery',             desc: 'Optimise molecular structures for binding affinity, navigating enormous chemical search spaces.' },
                { area: 'Game AI',                    desc: 'Evolve game-playing agents and procedurally generated content. Also used in Dota 2 bot training.' },
                { area: 'Scheduling & Logistics',     desc: 'Solve vehicle routing, job-shop scheduling, and timetabling problems — all NP-hard combinatorial problems.' },
                { area: 'Finance',                    desc: 'Optimise trading strategy parameters, portfolio weights, and risk models.' },
              ].map(({ area, desc }) => (
                <div key={area} className="p-4 rounded-xl bg-surface border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-cyan" />
                    <span className="font-semibold text-text text-sm">{area}</span>
                  </div>
                  <p className="text-xs">{desc}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* CTA */}
          <motion.div
            variants={fade}
            className="p-8 rounded-2xl bg-surface border border-primary/20 text-center glow-green"
          >
            <Dna className="w-10 h-10 text-primary mx-auto mb-4 animate-float" />
            <h3 className="text-2xl font-bold mb-2">See it in action</h3>
            <p className="text-dim mb-6 max-w-sm mx-auto text-sm">
              The best way to understand evolutionary algorithms is to run one.
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-bg font-bold text-sm hover:bg-primary/90 transition-all"
            >
              Open Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
}
