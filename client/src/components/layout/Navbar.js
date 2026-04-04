import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Dna, LayoutDashboard, FlaskConical, Github } from 'lucide-react';
const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/science', label: 'Science', icon: FlaskConical },
];
export default function Navbar() {
    const { pathname } = useLocation();
    return (_jsx(motion.nav, { initial: { y: -20, opacity: 0 }, animate: { y: 0, opacity: 1 }, className: "sticky top-0 z-50 glass border-b border-border", children: _jsxs("div", { className: "max-w-7xl mx-auto px-6 h-16 flex items-center justify-between", children: [_jsxs(Link, { to: "/", className: "flex items-center gap-2 group", children: [_jsx("div", { className: "w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center group-hover:border-primary/60 transition-colors", children: _jsx(Dna, { className: "w-4 h-4 text-primary" }) }), _jsxs("span", { className: "font-bold text-lg tracking-tight", children: ["Evo", _jsx("span", { className: "text-primary", children: "Sim" })] })] }), _jsxs("div", { className: "flex items-center gap-1", children: [links.map(({ to, label, icon: Icon }) => {
                            const active = pathname.startsWith(to);
                            return (_jsxs(Link, { to: to, className: `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${active
                                    ? 'bg-primary/10 text-primary border border-primary/20'
                                    : 'text-dim hover:text-text hover:bg-white/5'}`, children: [_jsx(Icon, { className: "w-4 h-4" }), label] }, to));
                        }), _jsx("a", { href: "https://github.com/YusufOztoprak/evo-sim", target: "_blank", rel: "noopener noreferrer", className: "ml-2 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-dim hover:text-text hover:bg-white/5 transition-all", children: _jsx(Github, { className: "w-4 h-4" }) })] })] }) }));
}
