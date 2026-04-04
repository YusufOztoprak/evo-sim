import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import SimulationView from './pages/SimulationView';
import Science from './pages/Science';
export default function App() {
    return (_jsxs("div", { className: "min-h-screen flex flex-col bg-bg", children: [_jsx(Navbar, {}), _jsx("main", { className: "flex-1", children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Landing, {}) }), _jsx(Route, { path: "/dashboard", element: _jsx(Dashboard, {}) }), _jsx(Route, { path: "/simulation/:id", element: _jsx(SimulationView, {}) }), _jsx(Route, { path: "/science", element: _jsx(Science, {}) })] }) }), _jsx(Footer, {})] }));
}
