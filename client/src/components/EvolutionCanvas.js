import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef } from 'react';
function lerpColor(t) {
    // 0 = dim purple (low fitness), 1 = bright green (high fitness)
    const r = Math.round(80 + t * (0 - 80));
    const g = Math.round(40 + t * (255 - 40));
    const b = Math.round(120 + t * (136 - 120));
    return `rgb(${r},${g},${b})`;
}
export default function EvolutionCanvas({ className = '' }) {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        let raf;
        const particles = [];
        const MAX = 120;
        let generation = 0;
        let genTimer = 0;
        function resize() {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        }
        resize();
        window.addEventListener('resize', resize);
        function spawn() {
            const avgFitness = generation / 200; // fitness increases over generations
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.8,
                vy: (Math.random() - 0.5) * 0.8,
                fitness: Math.min(1, Math.random() * 0.4 + avgFitness),
                size: 2 + Math.random() * 3,
                life: 0,
                maxLife: 180 + Math.random() * 120,
            });
        }
        for (let i = 0; i < 60; i++)
            spawn();
        function draw() {
            const w = canvas.width;
            const h = canvas.height;
            ctx.fillStyle = 'rgba(8,8,16,0.15)';
            ctx.fillRect(0, 0, w, h);
            genTimer++;
            if (genTimer > 120) {
                generation++;
                genTimer = 0;
                // Kill weakest, spawn new (fitter) ones — natural selection
                particles.sort((a, b) => a.fitness - b.fitness);
                const kill = Math.floor(particles.length * 0.2);
                particles.splice(0, kill);
                for (let i = 0; i < kill + 2; i++)
                    spawn();
            }
            while (particles.length < MAX)
                spawn();
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.life++;
                // Wrap around edges
                if (p.x < 0)
                    p.x = w;
                if (p.x > w)
                    p.x = 0;
                if (p.y < 0)
                    p.y = h;
                if (p.y > h)
                    p.y = 0;
                const alpha = Math.sin((p.life / p.maxLife) * Math.PI);
                if (p.life >= p.maxLife) {
                    particles.splice(i, 1);
                    continue;
                }
                // Draw connection lines to nearest neighbors
                for (let j = i - 1; j >= 0; j--) {
                    const q = particles[j];
                    const dx = p.x - q.x;
                    const dy = p.y - q.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 80) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(0,255,136,${0.06 * (1 - dist / 80) * alpha})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(q.x, q.y);
                        ctx.stroke();
                    }
                }
                // Draw particle
                const color = lerpColor(p.fitness);
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
                ctx.fillStyle = color.replace('rgb', 'rgba').replace(')', `,${alpha * 0.9})`);
                ctx.fill();
                // Glow for high fitness
                if (p.fitness > 0.7) {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size * 3 * alpha, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(0,255,136,${0.04 * alpha * p.fitness})`;
                    ctx.fill();
                }
            }
            raf = requestAnimationFrame(draw);
        }
        draw();
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', resize);
        };
    }, []);
    return (_jsx("canvas", { ref: canvasRef, className: className, style: { width: '100%', height: '100%' } }));
}
