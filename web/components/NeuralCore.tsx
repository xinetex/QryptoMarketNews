
"use client";

import { useEffect, useRef } from "react";

export default function NeuralCore({ active }: { active: boolean }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = 400;
        canvas.height = 400;

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const particles: any[] = [];

        // Creae particles
        for (let i = 0; i < 50; i++) {
            particles.push({
                x: centerX,
                y: centerY,
                angle: Math.random() * Math.PI * 2,
                radius: Math.random() * 100 + 50,
                size: Math.random() * 2 + 1,
                speed: Math.random() * 0.02 + 0.005,
            });
        }

        const animate = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Core Glow
            const gradient = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, 150);
            gradient.addColorStop(0, active ? "rgba(188, 19, 254, 0.4)" : "rgba(188, 19, 254, 0.1)");
            gradient.addColorStop(1, "rgba(0,0,0,0)");
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw Brain Nodes
            particles.forEach((p, i) => {
                // Update position
                p.angle += active ? p.speed * 4 : p.speed;
                const x = centerX + Math.cos(p.angle) * p.radius;
                const y = centerY + Math.sin(p.angle) * (p.radius * 0.8); // Flatten slightly

                // Draw Particle
                ctx.beginPath();
                ctx.arc(x, y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = active ? "#00f3ff" : "#5b21b6";
                ctx.fill();

                // Connect to center if active
                if (active && Math.random() > 0.9) {
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(centerX, centerY);
                    ctx.strokeStyle = `rgba(0, 243, 255, ${Math.random() * 0.5})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }

                // Connect neighbors
                particles.forEach((p2, j) => {
                    if (i !== j) {
                        const dx = x - (centerX + Math.cos(p2.angle) * p2.radius);
                        const dy = y - (centerY + Math.sin(p2.angle) * (p2.radius * 0.8));
                        const dist = Math.sqrt(dx * dx + dy * dy);

                        if (dist < 40) {
                            ctx.beginPath();
                            ctx.moveTo(x, y);
                            ctx.lineTo(
                                centerX + Math.cos(p2.angle) * p2.radius,
                                centerY + Math.sin(p2.angle) * (p2.radius * 0.8)
                            );
                            ctx.strokeStyle = active ? `rgba(0, 243, 255, ${1 - dist / 40})` : `rgba(91, 33, 182, ${0.1})`;
                            ctx.lineWidth = 0.5;
                            ctx.stroke();
                        }
                    }
                });
            });

            requestAnimationFrame(animate);
        };

        const animationId = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationId);
    }, [active]);

    return (
        <div className="relative flex items-center justify-center w-[400px] h-[400px]">
            <canvas ref={canvasRef} className="absolute inset-0" />
            <div className={`absolute inset-0 bg-neon-purple/5 blur-3xl rounded-full transition-opacity duration-1000 ${active ? 'opacity-100' : 'opacity-20'}`} />
        </div>
    );
}
