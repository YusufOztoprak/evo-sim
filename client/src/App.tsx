import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import SimulationView from './pages/SimulationView';
import Science from './pages/Science';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/"               element={<Landing />} />
          <Route path="/dashboard"      element={<Dashboard />} />
          <Route path="/simulation/:id" element={<SimulationView />} />
          <Route path="/science"        element={<Science />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
