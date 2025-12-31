"use client";

import { useState, useEffect, useRef } from "react";
import { animate } from "animejs";
import { X } from "lucide-react";

type Mood = "happy" | "neutral" | "sad" | "excited" | "sleepy";

const CHARACTER = {
    name: "Queen Queef",
    image: "/characters/queen.png",
    dialogues: {
        happy: ["Markets looking good! 👑", "Stack those gains!", "I'm pleased!"],
        excited: ["TO THE MOON! 🚀", "WAGMI!", "Pump incoming!"],
        sad: ["Red days happen... 😢", "Diamond hands!", "HODL strong!"],
        sleepy: ["*yawn* zzz... 😴", "Wake me when green...", "Let me rest..."],
        neutral: ["Watching charts... 📊", "Clean Puff active.", "Stay vigilant."],
    },
};

const ACTIVITIES = [
    { id: "feed", icon: "🍕", name: "Feed" },
    { id: "play", icon: "🎮", name: "Play" },
    { id: "train", icon: "💪", name: "Train" },
    { id: "explore", icon: "🗺️", name: "Explore" },
    { id: "clean", icon: "🌿", name: "Puff" },
    { id: "rest", icon: "😴", name: "Rest" },
];

export default function QGotchiCard() {
    const [mood, setMood] = useState<Mood>("neutral");
    const [level, setLevel] = useState(1);
    const [xp, setXp] = useState(0);
    const [drops, setDrops] = useState(0);
    const [energy, setEnergy] = useState(100);
    const [dialogue, setDialogue] = useState("");
    const [isExpanded, setIsExpanded] = useState(false);
    const [currentMode, setCurrentMode] = useState<"passive" | "mild" | "active">("mild");

    const cardRef = useRef<HTMLDivElement>(null);
    const xpToNext = level * 100;

    const getDialogue = (m: Mood) => CHARACTER.dialogues[m][Math.floor(Math.random() * CHARACTER.dialogues[m].length)];

    useEffect(() => { setDialogue(getDialogue(mood)); }, [mood]);

    useEffect(() => {
        const interval = setInterval(() => {
            setMood(["happy", "neutral", "sad", "excited", "sleepy"][Math.floor(Math.random() * 5)] as Mood);
        }, 15000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setDrops(d => d + 1);
            setXp(x => { const n = x + 10; if (n >= xpToNext) { setLevel(l => l + 1); return 0; } return n; });
        }, 20000);
        return () => clearInterval(interval);
    }, [xpToNext]);

    const toggleExpand = () => {
        if (!cardRef.current) return;
        const expanded = !isExpanded;
        setIsExpanded(expanded);
        animate(cardRef.current, {
            height: expanded ? [208, 420] : [420, 208],
            duration: 400,
            easing: expanded ? "easeOutExpo" : "easeInExpo",
        });
    };

    const handleActivity = (id: string) => {
        switch (id) {
            case "feed": setXp(x => Math.min(xpToNext, x + 20)); setMood("happy"); break;
            case "play": setDrops(d => d + Math.floor(Math.random() * 5) + 1); setMood("excited"); setEnergy(e => Math.max(0, e - 10)); break;
            case "train": setXp(x => Math.min(xpToNext, x + 50)); setEnergy(e => Math.max(0, e - 20)); break;
            case "explore": setDrops(d => d + Math.floor(Math.random() * 10) + 1); setEnergy(e => Math.max(0, e - 15)); break;
            case "clean": setXp(x => Math.min(xpToNext, x + 30)); setMood("happy"); break;
            case "rest": setEnergy(100); setMood("sleepy"); break;
        }
    };

    const moodEmoji = { happy: "😊", excited: "🤩", sad: "😢", sleepy: "😴", neutral: "😐" }[mood];
    const moodGradient = {
        happy: "from-green-600/80 via-emerald-500/50 to-transparent",
        excited: "from-orange-600/80 via-yellow-500/50 to-transparent",
        sad: "from-blue-700/80 via-indigo-500/50 to-transparent",
        sleepy: "from-purple-700/80 via-violet-500/50 to-transparent",
        neutral: "from-zinc-800/90 via-zinc-700/60 to-transparent",
    }[mood];

    return (
        <div
            ref={cardRef}
            className="zone-card relative h-52 rounded-xl border border-white/10 overflow-hidden cursor-pointer hover:border-neon-purple/50"
            style={{ backgroundImage: `url(${CHARACTER.image})`, backgroundSize: "cover", backgroundPosition: "center top" }}
            onClick={() => !isExpanded && toggleExpand()}
        >
            {/* Overlays */}
            <div className={`absolute inset-0 bg-gradient-to-t ${moodGradient} transition-all duration-1000`} />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />

            {/* Close button */}
            {isExpanded && (
                <button onClick={(e) => { e.stopPropagation(); toggleExpand(); }} className="absolute top-2 right-2 z-30 p-1 bg-black/60 hover:bg-black/80 rounded-full">
                    <X size={14} className="text-white" />
                </button>
            )}

            {/* All Content */}
            <div className="relative z-20 h-full p-3 flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-sm">🐣</span>
                            <span className="text-sm font-bold text-white">QGotchi</span>
                            <span className="text-[9px] bg-neon-purple/60 px-1.5 py-0.5 rounded-full font-bold">Lv.{level}</span>
                        </div>
                        <p className="text-[10px] text-white/60">{CHARACTER.name}</p>
                    </div>
                    <div className="text-xl">{moodEmoji}</div>
                </div>

                {/* Speech Bubble */}
                <div
                    className="bg-white/95 text-zinc-800 rounded-lg px-2 py-1.5 max-w-[65%] relative mb-2"
                    onClick={(e) => { e.stopPropagation(); setDialogue(getDialogue(mood)); }}
                >
                    <p className="text-[10px] font-medium">{dialogue}</p>
                    <div className="absolute -bottom-1.5 left-3 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white/95" />
                </div>

                {/* Spacer to push stats to bottom when collapsed */}
                <div className="flex-1" />

                {/* Stats */}
                <div className="bg-black/60 backdrop-blur-sm rounded-lg p-2 mb-2">
                    <div className="flex justify-between text-[9px] mb-1">
                        <span>💎 <span className="text-white font-bold">{drops}</span></span>
                        <span>⚡ <span className="text-white font-bold">{energy}%</span></span>
                        <span className="text-white/40">{isExpanded ? "▲" : "▼ tap"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-[8px] text-white/50">XP</span>
                        <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-neon-purple to-neon-blue" style={{ width: `${(xp / xpToNext) * 100}%` }} />
                        </div>
                        <span className="text-[8px] text-white/50">{xp}/{xpToNext}</span>
                    </div>
                </div>

                {/* EXPANDED CONTROLS */}
                {isExpanded && (
                    <div className="space-y-2 animate-fadeIn">
                        {/* Mode Selector */}
                        <div className="flex gap-1">
                            {(["passive", "mild", "active"] as const).map((m) => (
                                <button
                                    key={m}
                                    onClick={(e) => { e.stopPropagation(); setCurrentMode(m); }}
                                    className={`flex-1 py-1.5 rounded text-[10px] font-bold transition-all ${currentMode === m ? "bg-neon-purple text-white" : "bg-white/10 text-white/60 hover:bg-white/20"}`}
                                >
                                    {m === "passive" ? "🛋️ Passive" : m === "mild" ? "🚶 Mild" : "🔥 Active"}
                                </button>
                            ))}
                        </div>

                        {/* Activities */}
                        <div className="grid grid-cols-6 gap-1">
                            {ACTIVITIES.map((a) => (
                                <button
                                    key={a.id}
                                    onClick={(e) => { e.stopPropagation(); handleActivity(a.id); }}
                                    disabled={a.id !== "rest" && energy < 10}
                                    className="flex flex-col items-center p-1.5 rounded bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    <span className="text-base">{a.icon}</span>
                                    <span className="text-[7px] font-bold text-white">{a.name}</span>
                                </button>
                            ))}
                        </div>

                        {/* Wallet Button */}
                        <button
                            onClick={(e) => e.stopPropagation()}
                            className="w-full py-2 bg-gradient-to-r from-neon-purple to-neon-blue rounded-lg text-[10px] font-bold text-white hover:opacity-90 transition-opacity"
                        >
                            💳 Connect Solana Wallet
                        </button>
                    </div>
                )}
            </div>

            <div className="absolute bottom-1 right-2 text-[7px] text-white/20 z-20">$SOLQUEEF</div>
        </div>
    );
}
