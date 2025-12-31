"use client";

import { useState, useEffect, useRef } from "react";
import { animate } from "animejs";
import { Gamepad2, Settings, Wallet, X } from "lucide-react";

type Mood = "happy" | "neutral" | "sad" | "excited" | "sleepy";

interface QGotchiCardProps {
    mode?: "passive" | "mild" | "active";
}

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
    { id: "feed", icon: "🍕", name: "Feed", effect: "+XP" },
    { id: "play", icon: "🎮", name: "Play", effect: "+Drops" },
    { id: "train", icon: "💪", name: "Train", effect: "+50XP" },
    { id: "explore", icon: "🗺️", name: "Explore", effect: "Airdrop" },
    { id: "clean", icon: "🌿", name: "Puff", effect: "Eco" },
    { id: "rest", icon: "😴", name: "Rest", effect: "Energy" },
];

export default function QGotchiCard({ mode = "mild" }: QGotchiCardProps) {
    const [mood, setMood] = useState<Mood>("neutral");
    const [level, setLevel] = useState(1);
    const [xp, setXp] = useState(0);
    const [drops, setDrops] = useState(0);
    const [energy, setEnergy] = useState(100);
    const [dialogue, setDialogue] = useState("");
    const [isAnimating, setIsAnimating] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [currentMode, setCurrentMode] = useState(mode);

    const cardRef = useRef<HTMLDivElement>(null);
    const controlsRef = useRef<HTMLDivElement>(null);
    const xpToNext = level * 100;

    const getDialogue = (m: Mood) => {
        const lines = CHARACTER.dialogues[m];
        return lines[Math.floor(Math.random() * lines.length)];
    };

    useEffect(() => { setDialogue(getDialogue(mood)); }, [mood]);

    useEffect(() => {
        const interval = setInterval(() => {
            const moods: Mood[] = ["happy", "neutral", "sad", "excited", "sleepy"];
            setMood(moods[Math.floor(Math.random() * moods.length)]);
        }, 15000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            if (currentMode !== "passive") {
                setDrops(d => d + 1);
                setXp(x => {
                    const newXp = x + 10;
                    if (newXp >= xpToNext) { setLevel(l => l + 1); return 0; }
                    return newXp;
                });
                setIsAnimating(true);
                setTimeout(() => setIsAnimating(false), 500);
            }
        }, currentMode === "active" ? 10000 : 20000);
        return () => clearInterval(interval);
    }, [xpToNext, currentMode]);

    // Anime.js expansion animation
    const toggleExpand = () => {
        if (!cardRef.current) return;

        if (!isExpanded) {
            setIsExpanded(true);
            animate(cardRef.current, {
                height: [208, 380], // h-52 (208px) to expanded
                duration: 400,
                easing: "easeOutExpo",
            });
            if (controlsRef.current) {
                animate(controlsRef.current, {
                    opacity: [0, 1],
                    translateY: [20, 0],
                    duration: 300,
                    delay: 150,
                    easing: "easeOutExpo",
                });
            }
        } else {
            animate(cardRef.current, {
                height: [380, 208],
                duration: 300,
                easing: "easeInExpo",
            });
            if (controlsRef.current) {
                animate(controlsRef.current, {
                    opacity: [1, 0],
                    translateY: [0, 20],
                    duration: 200,
                    easing: "easeInExpo",
                });
            }
            setTimeout(() => setIsExpanded(false), 300);
        }
    };

    const handleActivity = (activityId: string) => {
        setIsAnimating(true);
        switch (activityId) {
            case "feed": setXp(x => Math.min(xpToNext, x + 20)); setMood("happy"); break;
            case "play": setDrops(d => d + Math.floor(Math.random() * 5) + 1); setMood("excited"); setEnergy(e => Math.max(0, e - 10)); break;
            case "train": setXp(x => Math.min(xpToNext, x + 50)); setEnergy(e => Math.max(0, e - 20)); break;
            case "explore": setDrops(d => d + Math.floor(Math.random() * 10) + 1); setEnergy(e => Math.max(0, e - 15)); break;
            case "clean": setXp(x => Math.min(xpToNext, x + 30)); setMood("happy"); break;
            case "rest": setEnergy(100); setMood("sleepy"); break;
        }
        setTimeout(() => setIsAnimating(false), 500);
    };

    const moodEmoji = { happy: "😊", excited: "🤩", sad: "😢", sleepy: "😴", neutral: "😐" }[mood];
    const moodGradient = {
        happy: "from-green-600/80 via-emerald-500/60 to-transparent",
        excited: "from-orange-600/80 via-yellow-500/60 to-transparent",
        sad: "from-blue-700/80 via-indigo-500/60 to-transparent",
        sleepy: "from-purple-700/80 via-violet-500/60 to-transparent",
        neutral: "from-zinc-800/90 via-zinc-700/70 to-transparent",
    }[mood];

    return (
        <div
            ref={cardRef}
            className="zone-card group relative h-52 rounded-xl border border-white/10 overflow-hidden transition-colors duration-500 hover:border-neon-purple/50 cursor-pointer"
            style={{
                backgroundImage: `url(${CHARACTER.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center top",
            }}
            onClick={() => !isExpanded && toggleExpand()}
        >
            {/* Gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-t ${moodGradient} transition-all duration-1000`} />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

            {/* Close button when expanded */}
            {isExpanded && (
                <button
                    onClick={(e) => { e.stopPropagation(); toggleExpand(); }}
                    className="absolute top-3 right-3 z-20 p-1.5 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                >
                    <X size={14} className="text-white" />
                </button>
            )}

            {/* Content */}
            <div className="relative z-10 h-full p-4 flex flex-col justify-between">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-sm">🐣</span>
                            <span className="text-sm font-bold text-white drop-shadow-lg">QGotchi</span>
                            <span className="text-[9px] bg-neon-purple/60 backdrop-blur px-1.5 py-0.5 rounded-full font-bold">Lv.{level}</span>
                        </div>
                        <p className="text-[10px] text-white/70">{CHARACTER.name}</p>
                    </div>
                    <div className="text-2xl drop-shadow-lg">{moodEmoji}</div>
                </div>

                {/* Speech Bubble */}
                <div
                    className="bg-white/95 backdrop-blur text-zinc-800 rounded-xl px-3 py-2 shadow-xl max-w-[70%] relative"
                    onClick={(e) => { e.stopPropagation(); setDialogue(getDialogue(mood)); }}
                >
                    <p className="text-xs font-medium leading-snug">{dialogue}</p>
                    <span className="text-[8px] text-zinc-400 absolute bottom-1 right-2">tap▼</span>
                    <div className="absolute -bottom-2 left-4 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-white/95" />
                </div>

                {/* Stats Bar */}
                <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
                    <div className="flex justify-between items-center text-[10px] mb-1.5">
                        <div className="flex items-center gap-3">
                            <span><span className="text-white/50">💎</span> <span className="text-white font-bold">{drops}</span></span>
                            <span><span className="text-white/50">⚡</span> <span className="text-white font-bold">{energy}%</span></span>
                        </div>
                        <span className="text-white/40 text-[9px]">{isExpanded ? "▲ collapse" : "▼ expand"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] text-white/50">XP</span>
                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className={`h-full bg-gradient-to-r from-neon-purple to-neon-blue transition-all duration-500 ${isAnimating ? "animate-pulse" : ""}`} style={{ width: `${(xp / xpToNext) * 100}%` }} />
                        </div>
                        <span className="text-[9px] text-white/50">{xp}/{xpToNext}</span>
                    </div>
                </div>

                {/* Expanded Controls Panel */}
                {isExpanded && (
                    <div ref={controlsRef} className="mt-3 space-y-3" style={{ opacity: 0 }}>
                        {/* Mode Selector */}
                        <div className="flex gap-2">
                            {(["passive", "mild", "active"] as const).map((m) => (
                                <button
                                    key={m}
                                    onClick={(e) => { e.stopPropagation(); setCurrentMode(m); }}
                                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${currentMode === m ? "bg-neon-purple text-white" : "bg-white/10 text-white/60 hover:bg-white/20"}`}
                                >
                                    {m === "passive" ? "🛋️" : m === "mild" ? "🚶" : "🔥"} {m}
                                </button>
                            ))}
                        </div>

                        {/* Activities Grid */}
                        <div className="grid grid-cols-6 gap-1.5">
                            {ACTIVITIES.map((a) => (
                                <button
                                    key={a.id}
                                    onClick={(e) => { e.stopPropagation(); handleActivity(a.id); }}
                                    disabled={a.id !== "rest" && energy < 10}
                                    className="flex flex-col items-center p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <span className="text-lg">{a.icon}</span>
                                    <span className="text-[8px] font-bold text-white">{a.name}</span>
                                </button>
                            ))}
                        </div>

                        {/* Quick Actions */}
                        <div className="flex gap-2">
                            <button className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gradient-to-r from-neon-purple to-neon-blue rounded-lg text-[10px] font-bold text-white hover:opacity-90">
                                <Wallet size={12} /> Connect Wallet
                            </button>
                            <button className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all">
                                <Settings size={14} className="text-white/70" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="absolute bottom-1 right-2 text-[8px] text-white/30 z-10">$SOLQUEEF</div>
        </div>
    );
}
