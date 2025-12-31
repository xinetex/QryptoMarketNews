
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, User, ArrowRight } from "lucide-react";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            if (res.ok) {
                router.push("/auth/login?registered=true");
            } else {
                const data = await res.json();
                setError(data.error || "Registration failed");
            }
        } catch (err) {
            setError("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0b0d17] flex items-center justify-center p-4">
            <div className="w-full max-w-md p-8 glass-card border-neon-blue/30 shadow-[0_0_50px_rgba(0,243,255,0.1)]">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple tracking-tighter mb-2">
                        NEW AGENT
                    </h1>
                    <p className="text-zinc-500 text-sm uppercase tracking-widest">Request Credentials</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-xs text-center">
                            {error}
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-xs text-zinc-400 uppercase font-bold tracking-wider ml-1">Codename</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 text-zinc-500" size={16} />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 pl-10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue/50 transition-all font-mono text-sm"
                                placeholder="Agent Taco"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs text-zinc-400 uppercase font-bold tracking-wider ml-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-zinc-500" size={16} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 pl-10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue/50 transition-all font-mono text-sm"
                                placeholder="agent@qchannel.tv"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs text-zinc-400 uppercase font-bold tracking-wider ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-zinc-500" size={16} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 pl-10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue/50 transition-all font-mono text-sm"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-neon-blue hover:bg-neon-blue/80 text-black font-bold tracking-wide rounded-lg shadow-[0_0_20px_rgba(0,243,255,0.3)] transition-all flex items-center justify-center gap-2 mt-6 uppercase text-sm"
                    >
                        {loading ? "Processing..." : (
                            <>
                                Create Identity <ArrowRight size={16} />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center text-xs text-zinc-500">
                    Already have access? <Link href="/auth/login" className="text-neon-purple hover:underline">Login Here</Link>
                </div>
            </div>
        </div>
    );
}
