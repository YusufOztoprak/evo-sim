import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Dna } from 'lucide-react';
import { Link } from 'react-router-dom';
export default function Footer() {
    return (_jsx("footer", { className: "border-t border-border bg-surface/50 mt-24", children: _jsxs("div", { className: "max-w-7xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4", children: [_jsxs("div", { className: "flex items-center gap-2 text-dim text-sm", children: [_jsx(Dna, { className: "w-4 h-4 text-primary" }), _jsx("span", { children: "EvoSim \u2014 Evolutionary Population Simulator" })] }), _jsxs("div", { className: "flex items-center gap-6 text-sm text-dim", children: [_jsx(Link, { to: "/science", className: "hover:text-primary transition-colors", children: "Science" }), _jsx(Link, { to: "/dashboard", className: "hover:text-primary transition-colors", children: "Dashboard" }), _jsx("a", { href: "https://github.com/YusufOztoprak/evo-sim", target: "_blank", rel: "noopener noreferrer", className: "hover:text-primary transition-colors", children: "GitHub" })] })] }) }));
}
