import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Dna, GitBranch, Shuffle, Target, BarChart3, ArrowRight, Zap, Globe, TrendingUp } from 'lucide-react';
const fade = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.1 } } };
function Section({ id, icon: Icon, color, title, children, }) {
    return (_jsxs(motion.section, { id: id, variants: fade, className: "scroll-mt-24", children: [_jsxs("div", { className: `inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border mb-4 ${color}`, children: [_jsx(Icon, { className: "w-3.5 h-3.5" }), title] }), _jsx("div", { className: "prose prose-invert max-w-none text-dim leading-relaxed", children: children })] }));
}
function Highlight({ children }) {
    return (_jsx("span", { className: "text-primary font-semibold not-italic", children: children }));
}
function Formula({ children }) {
    return (_jsx("div", { className: "my-5 flex justify-center", children: _jsx("div", { className: "inline-block px-6 py-3 rounded-xl bg-bg border border-cyan/20 font-mono text-sm text-cyan tracking-wide shadow-[0_0_20px_rgba(6,182,212,0.08)]", children: children }) }));
}
function Callout({ title, children }) {
    return (_jsxs("div", { className: "my-6 p-5 rounded-xl bg-primary/5 border border-primary/20", children: [_jsx("p", { className: "text-primary font-semibold text-sm mb-1", children: title }), _jsx("p", { className: "text-dim text-sm", children: children })] }));
}
const toc = [
    { id: 'natural-selection', label: 'Natural Selection' },
    { id: 'genetic-algorithms', label: 'Genetic Algorithms' },
    { id: 'genome', label: 'Genome Encoding' },
    { id: 'selection', label: 'Selection Strategies' },
    { id: 'crossover', label: 'Crossover' },
    { id: 'mutation', label: 'Mutation' },
    { id: 'speciation', label: 'Speciation' },
    { id: 'applications', label: 'Real-world Applications' },
];
export default function Science() {
    return (_jsxs("div", { className: "max-w-7xl mx-auto px-6 py-12", children: [_jsxs(motion.div, { initial: { opacity: 0, y: -16 }, animate: { opacity: 1, y: 0 }, className: "mb-12 max-w-2xl", children: [_jsxs("span", { className: "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-cyan/10 border border-cyan/20 text-cyan mb-4", children: [_jsx(Dna, { className: "w-3.5 h-3.5" }), "The Science Behind EvoSim"] }), _jsxs("h1", { className: "text-4xl sm:text-5xl font-extrabold mb-4", children: ["Evolution, ", _jsx("span", { className: "gradient-text", children: "Explained." })] }), _jsx("p", { className: "text-dim text-lg leading-relaxed", children: "From Darwin's natural selection to modern genetic algorithms \u2014 the biology and mathematics that power this simulator." })] }), _jsxs("div", { className: "lg:grid lg:grid-cols-[240px_1fr] gap-12", children: [_jsx("aside", { className: "hidden lg:block", children: _jsxs("div", { className: "sticky top-24", children: [_jsx("p", { className: "text-xs font-semibold text-muted uppercase tracking-widest mb-4", children: "Contents" }), _jsx("nav", { className: "space-y-1", children: toc.map(({ id, label }) => (_jsx("a", { href: `#${id}`, className: "block text-sm text-dim hover:text-primary transition-colors py-1 border-l-2 border-transparent hover:border-primary pl-3", children: label }, id))) }), _jsx("div", { className: "mt-8", children: _jsxs(Link, { to: "/dashboard", className: "inline-flex items-center gap-2 text-xs text-primary hover:text-primary/80 transition-colors", children: ["Try it yourself ", _jsx(ArrowRight, { className: "w-3 h-3" })] }) })] }) }), _jsxs(motion.div, { variants: stagger, initial: "hidden", animate: "show", className: "space-y-14", children: [_jsxs(Section, { id: "natural-selection", icon: Dna, color: "text-primary border-primary/20 bg-primary/10", title: "Natural Selection", children: [_jsx("h2", { className: "text-2xl font-bold text-text mb-3", children: "The Engine of Evolution" }), _jsxs("p", { children: ["In 1859, Charles Darwin proposed that populations of organisms change over time through a process he called ", _jsx(Highlight, { children: "natural selection" }), ". The mechanism is elegantly simple: individuals vary in their traits, some traits help survival and reproduction more than others, and those advantageous traits are inherited by offspring."] }), _jsxs("p", { className: "mt-3", children: ["Over many generations, the frequency of beneficial traits increases in the population \u2014 the population ", _jsx("em", { children: "adapts" }), " to its environment. This is evolution."] }), _jsx(Callout, { title: "Key Insight", children: "Natural selection doesn't \"aim\" at anything. It's a blind filter: organisms that happen to be better suited to current conditions simply leave more descendants. The appearance of design emerges from this simple process acting over time." }), _jsxs("p", { children: ["In EvoSim, organisms have a ", _jsx(Highlight, { children: "fitness score" }), " computed by a fitness function. Higher fitness = more likely to reproduce. Lower fitness = more likely to be culled. Repeat for hundreds of generations and watch adaptation emerge."] })] }), _jsxs(Section, { id: "genetic-algorithms", icon: Zap, color: "text-cyan border-cyan/20 bg-cyan/10", title: "Genetic Algorithms", children: [_jsx("h2", { className: "text-2xl font-bold text-text mb-3", children: "Computation Inspired by Nature" }), _jsxs("p", { children: [_jsx(Highlight, { children: "Genetic Algorithms (GAs)" }), " are a class of optimisation algorithms that mimic biological evolution to search large solution spaces efficiently. Introduced by John Holland in the 1970s, GAs have become a cornerstone of computational intelligence."] }), _jsxs("p", { className: "mt-3", children: ["Instead of evaluating every possible solution (infeasible for complex problems), a GA maintains a ", _jsx("em", { children: "population" }), " of candidate solutions and improves them iteratively through:"] }), _jsx("ul", { className: "mt-3 space-y-2 list-none", children: [
                                            ['Selection', 'Choose fitter individuals as parents'],
                                            ['Crossover', 'Combine parent genomes to produce offspring'],
                                            ['Mutation', 'Randomly alter genes to maintain diversity'],
                                            ['Replacement', 'New generation replaces (part of) the old'],
                                        ].map(([term, def]) => (_jsxs("li", { className: "flex items-start gap-3", children: [_jsx("span", { className: "mt-1 w-1.5 h-1.5 rounded-full bg-cyan flex-shrink-0" }), _jsxs("span", { children: [_jsxs("span", { className: "text-cyan font-semibold", children: [term, ":"] }), " ", def] })] }, term))) }), _jsx(Formula, { children: 'Fitness(generation+1) ≥ Fitness(generation)  [on average, with elitism]' }), _jsxs("p", { children: ["The algorithm converges when the population reaches a fitness plateau or a ", _jsx(Highlight, { children: "target fitness" }), " is achieved. EvoSim supports both termination conditions."] })] }), _jsxs(Section, { id: "genome", icon: GitBranch, color: "text-purple border-purple/20 bg-purple/10", title: "Genome Encoding", children: [_jsx("h2", { className: "text-2xl font-bold text-text mb-3", children: "Representing Solutions as Genes" }), _jsxs("p", { children: ["Every organism in EvoSim has a ", _jsx(Highlight, { children: "genome" }), " \u2014 an array of numbers that encodes a candidate solution. The encoding determines how genes are represented and which operators make sense."] }), _jsx("div", { className: "mt-6 grid sm:grid-cols-2 gap-4", children: [
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
                                        ].map(({ name, genes, desc, color }) => (_jsxs("div", { className: `p-4 rounded-xl border ${color}`, children: [_jsx("p", { className: "font-bold text-text mb-1", children: name }), _jsx("code", { className: "text-xs text-cyan block mb-2", children: genes }), _jsx("p", { className: "text-xs", children: desc })] }, name))) })] }), _jsxs(Section, { id: "selection", icon: Target, color: "text-primary border-primary/20 bg-primary/10", title: "Selection Strategies", children: [_jsx("h2", { className: "text-2xl font-bold text-text mb-3", children: "Who Gets to Reproduce?" }), _jsx("p", { children: "Selection pressure determines how strongly fitness biases reproduction. Too high and you lose diversity (premature convergence). Too low and evolution stalls. EvoSim offers four strategies:" }), _jsx("div", { className: "mt-6 space-y-4", children: [
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
                                        ].map(({ name, badge, desc, formula }) => (_jsxs("div", { className: "p-4 rounded-xl bg-surface border border-border", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx("span", { className: "font-semibold text-text", children: name }), _jsx("span", { className: "text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20", children: badge })] }), _jsx("p", { className: "text-sm mb-2", children: desc }), _jsx("code", { className: "text-xs text-cyan", children: formula })] }, name))) })] }), _jsxs(Section, { id: "crossover", icon: GitBranch, color: "text-cyan border-cyan/20 bg-cyan/10", title: "Crossover", children: [_jsx("h2", { className: "text-2xl font-bold text-text mb-3", children: "Combining Parent Genomes" }), _jsxs("p", { children: [_jsx(Highlight, { children: "Crossover" }), " (recombination) is the primary source of genetic variation in EAs. Two parent genomes are combined to produce offspring that inherit traits from both parents \u2014 analogous to sexual reproduction."] }), _jsx("div", { className: "mt-6 space-y-4", children: [
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
                                        ].map(({ name, example, desc }) => (_jsxs("div", { className: "p-4 rounded-xl bg-surface border border-border", children: [_jsx("p", { className: "font-semibold text-text mb-1", children: name }), _jsx("code", { className: "text-xs text-cyan block mb-2", children: example }), _jsx("p", { className: "text-sm", children: desc })] }, name))) })] }), _jsxs(Section, { id: "mutation", icon: Shuffle, color: "text-purple border-purple/20 bg-purple/10", title: "Mutation", children: [_jsx("h2", { className: "text-2xl font-bold text-text mb-3", children: "Introducing Genetic Novelty" }), _jsxs("p", { children: ["Without mutation, a GA can only recombine existing genetic material.", _jsx(Highlight, { children: " Mutation" }), " introduces new alleles \u2014 it's the source of truly novel traits. A low mutation rate maintains stability; too high and the algorithm becomes a random search."] }), _jsx(Formula, { children: 'P(mutate gene) = mutationRate  (applied independently per gene)' }), _jsx("p", { className: "mt-3", children: "EvoSim applies encoding-specific mutation:" }), _jsxs("ul", { className: "mt-3 space-y-2", children: [_jsxs("li", { className: "flex items-start gap-3", children: [_jsx("span", { className: "mt-1 w-1.5 h-1.5 rounded-full bg-purple flex-shrink-0" }), _jsxs("span", { children: [_jsx("span", { className: "text-purple font-semibold", children: "Binary:" }), " Bit-flip (0\u21921, 1\u21920)"] })] }), _jsxs("li", { className: "flex items-start gap-3", children: [_jsx("span", { className: "mt-1 w-1.5 h-1.5 rounded-full bg-purple flex-shrink-0" }), _jsxs("span", { children: [_jsx("span", { className: "text-purple font-semibold", children: "Real/Integer:" }), " Gaussian perturbation \u2014 gene += N(0, \u03C3), clamped to [min, max]"] })] }), _jsxs("li", { className: "flex items-start gap-3", children: [_jsx("span", { className: "mt-1 w-1.5 h-1.5 rounded-full bg-purple flex-shrink-0" }), _jsxs("span", { children: [_jsx("span", { className: "text-purple font-semibold", children: "Permutation:" }), " Swap mutation \u2014 two random positions exchanged, preserving validity"] })] })] }), _jsx(Callout, { title: "Finding the sweet spot", children: "Classic rule of thumb: mutationRate \u2248 1/genomeLength. For a 20-gene genome, 0.05 is a good starting point." })] }), _jsxs(Section, { id: "speciation", icon: BarChart3, color: "text-primary border-primary/20 bg-primary/10", title: "Speciation", children: [_jsx("h2", { className: "text-2xl font-bold text-text mb-3", children: "Population Divergence" }), _jsxs("p", { children: ["In nature, populations that become reproductively isolated can diverge into distinct ", _jsx(Highlight, { children: "species" }), ". EvoSim tracks species by measuring genome distance between organisms."] }), _jsxs("p", { className: "mt-3", children: ["Organisms are assigned to the nearest species whose ", _jsx("em", { children: "representative genome" }), "is within a configurable distance threshold. If no species is close enough, a new species is created."] }), _jsx(Formula, { children: _jsxs("div", { className: "flex flex-col sm:flex-row items-center gap-4 sm:gap-8", children: [_jsxs("span", { children: [_jsx("span", { className: "text-purple text-xs uppercase tracking-widest mr-2", children: "binary" }), "d(a,b) = Hamming(a,b) / len"] }), _jsx("span", { className: "text-muted hidden sm:block", children: "|" }), _jsxs("span", { children: [_jsx("span", { className: "text-purple text-xs uppercase tracking-widest mr-2", children: "real" }), "d(a,b) =", ' ', _jsxs("span", { className: "inline-flex items-start gap-0.5", children: [_jsx("span", { className: "text-lg leading-none", children: "\u221A" }), _jsx("span", { className: "border-t border-cyan px-0.5", children: "\u03A3(a\u1D62 \u2212 b\u1D62)\u00B2" })] }), ' ', "/ len"] })] }) }), _jsxs("p", { className: "mt-3", children: ["Species that haven't been observed for two or more generations are marked", _jsx("span", { className: "text-red-400 font-semibold", children: " extinct" }), ". The analytics dashboard tracks active vs. extinct species over time \u2014 a signal of population diversity."] })] }), _jsxs(Section, { id: "applications", icon: Globe, color: "text-cyan border-cyan/20 bg-cyan/10", title: "Real-world Applications", children: [_jsx("h2", { className: "text-2xl font-bold text-text mb-3", children: "Where Genetic Algorithms Are Used" }), _jsx("p", { children: "GAs are deployed wherever the search space is vast, discontinuous, or poorly understood:" }), _jsx("div", { className: "mt-6 grid sm:grid-cols-2 gap-4", children: [
                                            { area: 'Neural Architecture Search', desc: 'Evolve neural network topologies for AutoML systems (e.g. NeuroEvolution of Augmenting Topologies — NEAT).' },
                                            { area: 'Antenna Design', desc: 'NASA used GAs to evolve antennas for the Space Technology 5 mission. The shapes look alien but outperform hand-designed antennas.' },
                                            { area: 'Drug Discovery', desc: 'Optimise molecular structures for binding affinity, navigating enormous chemical search spaces.' },
                                            { area: 'Game AI', desc: 'Evolve game-playing agents and procedurally generated content. Also used in Dota 2 bot training.' },
                                            { area: 'Scheduling & Logistics', desc: 'Solve vehicle routing, job-shop scheduling, and timetabling problems — all NP-hard combinatorial problems.' },
                                            { area: 'Finance', desc: 'Optimise trading strategy parameters, portfolio weights, and risk models.' },
                                        ].map(({ area, desc }) => (_jsxs("div", { className: "p-4 rounded-xl bg-surface border border-border", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(TrendingUp, { className: "w-4 h-4 text-cyan" }), _jsx("span", { className: "font-semibold text-text text-sm", children: area })] }), _jsx("p", { className: "text-xs", children: desc })] }, area))) })] }), _jsxs(motion.div, { variants: fade, className: "p-8 rounded-2xl bg-surface border border-primary/20 text-center glow-green", children: [_jsx(Dna, { className: "w-10 h-10 text-primary mx-auto mb-4 animate-float" }), _jsx("h3", { className: "text-2xl font-bold mb-2", children: "See it in action" }), _jsx("p", { className: "text-dim mb-6 max-w-sm mx-auto text-sm", children: "The best way to understand evolutionary algorithms is to run one." }), _jsxs(Link, { to: "/dashboard", className: "inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-bg font-bold text-sm hover:bg-primary/90 transition-all", children: ["Open Dashboard ", _jsx(ArrowRight, { className: "w-4 h-4" })] })] })] })] })] }));
}
