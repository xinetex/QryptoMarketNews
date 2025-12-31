
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, ArrowRight } from "lucide-react";

export default function LoginPage() {
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
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError("Invalid credentials");
            } else {
                router.push("/intelligence");
                router.refresh();
            }
        } catch (err) {
            setError("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0b0d17] flex items-center justify-center p-4">
            <div className="w-full max-w-md p-8 glass-card border-neon-purple/30 shadow-[0_0_50px_rgba(188,19,254,0.1)]">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple tracking-tighter mb-2">
                        Q-ACCESS
                    </h1>
                    <p className="text-zinc-500 text-sm uppercase tracking-widest">Identify Yourself</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-xs text-center">
                            {error}
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-xs text-zinc-400 uppercase font-bold tracking-wider ml-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-zinc-500" size={16} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 pl-10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-neon-purple focus:ring-1 focus:ring-neon-purple/50 transition-all font-mono text-sm"
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
                                className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 pl-10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-neon-purple focus:ring-1 focus:ring-neon-purple/50 transition-all font-mono text-sm"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-neon-purple hover:bg-neon-purple/80 text-white font-bold tracking-wide rounded-lg shadow-[0_0_20px_rgba(188,19,254,0.3)] transition-all flex items-center justify-center gap-2 mt-6 uppercase text-sm"
                    >
                        {loading ? "Authenticating..." : (
                            <>
                                Enter Dashboard <ArrowRight size={16} />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center text-xs text-zinc-500">
                    New Agent? <Link href="/auth/register" className="text-neon-blue hover:underline">Register Access</Link>
                </div>
            </div>
        </div>
    );
}
