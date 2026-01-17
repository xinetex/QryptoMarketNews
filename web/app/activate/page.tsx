"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ActivatePage() {
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (code.length < 6) return;

        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/activate/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code }),
            });

            const data = await res.json();

            if (res.ok) {
                // Success
                router.push("/remote");
            } else {
                setError(data.error || "Activation failed");
            }
        } catch (err) {
            setError("Network error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-slate-900 rounded-2xl p-8 border border-slate-800 shadow-xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                        Prophet TV
                    </h1>
                    <p className="text-slate-400 mt-2">Enter the code on your TV screen</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            placeholder="A B C 1 2 3"
                            className="w-full bg-black border border-slate-700 rounded-xl p-4 text-center text-3xl tracking-widest font-mono focus:border-purple-500 focus:ring-2 focus:ring-purple-500 outline-none uppercase transition-all"
                            maxLength={6}
                        />
                    </div>

                    {error && (
                        <div className="text-red-400 text-center text-sm font-medium animate-pulse">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || code.length < 6}
                        className={`w-full py-4 rounded-xl font-bold text-lg transition-all transform ${loading || code.length < 6
                                ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                                : "bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-purple-900/20"
                            }`}
                    >
                        {loading ? "Connecting..." : "Connect TV"}
                    </button>
                </form>

                <div className="mt-8 text-center text-xs text-slate-600">
                    Make sure your phone is connected to the internet.
                </div>
            </div>
        </div>
    );
}
