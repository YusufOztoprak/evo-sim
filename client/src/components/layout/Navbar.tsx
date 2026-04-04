import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Dna, LayoutDashboard, FlaskConical, Github } from 'lucide-react';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/science',   label: 'Science',   icon: FlaskConical },
];

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0,   opacity: 1 }}
      className="sticky top-0 z-50 glass border-b border-border"
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center group-hover:border-primary/60 transition-colors">
            <Dna className="w-4 h-4 text-primary" />
          </div>
          <span className="font-bold text-lg tracking-tight">
            Evo<span className="text-primary">Sim</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {links.map(({ to, label, icon: Icon }) => {
            const active = pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-dim hover:text-text hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
          <a
            href="https://github.com/YusufOztoprak/evo-sim"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-dim hover:text-text hover:bg-white/5 transition-all"
          >
            <Github className="w-4 h-4" />
          </a>
        </div>
      </div>
    </motion.nav>
  );
}
