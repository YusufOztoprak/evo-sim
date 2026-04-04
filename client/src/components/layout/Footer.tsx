import { Dna } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface/50 mt-24">
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-dim text-sm">
          <Dna className="w-4 h-4 text-primary" />
          <span>EvoSim — Evolutionary Population Simulator</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-dim">
          <Link to="/science" className="hover:text-primary transition-colors">Science</Link>
          <Link to="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
          <a
            href="https://github.com/YusufOztoprak/evo-sim"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
