"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Settings, Gamepad2, Wallet, Gift, ChevronDown, ChevronUp } from "lucide-react";

type Mood = "happy" | "neutral" | "sad" | "excited" | "sleepy";
type MenuTab = "activities" | "settings" | "wallet" | null;

interface QGotchiCardProps {
    mode?: "passive" | "mild" | "active";
    onModeChange?: (mode: "passive" | "mild" | "active") => void;
}

const CHARACTERS = {
    queen: {
        name: "Queen Queef",
        image: "/characters/queen.png",
        title: "Ruler of Clean Puffs",
        dialogues: {
            happy: ["The markets are looking good, darling! 👑", "Another green day? I'm pleased!", "Keep stacking those gains!"],
            excited: ["TO THE MOON! 🚀", "WAGMI energy today!", "I sense a pump coming!"],
            sad: ["Even queens have red days... 😢", "This too shall pass...", "Diamond hands, my loyal subject!"],
            sleepy: ["*yawn* Wake me when we're green... 😴", "Zzz... hodl... zzz...", "Let me rest, the markets are boring."],
            neutral: ["Watching the charts... 📊", "Clean Puff Protocol active.", "Stay vigilant, my subject."],
        },
    },
};

const ACTIVITIES = [
    { id: "feed", icon: "🍕", name: "Feed", description: "+XP", cost: 0 },
    { id: "play", icon: "🎮", name: "Play", description: "Drops", cost: 0 },
    { id: "train", icon: "💪", name: "Train", description: "+50XP", cost: 10 },
    { id: "explore", icon: "🗺️", name: "Explore", description: "Airdrops", cost: 5 },
    { id: "clean", icon: "🌿", name: "Puff", description: "Eco", cost: 0 },
    { id: "rest", icon: "😴", name: "Rest", description: "Energy", cost: 0 },
];

export default function QGotchiCard({ mode = "mild", onModeChange }: QGotchiCardProps) {
    const [mood, setMood] = useState<Mood>("neutral");
    const [level, setLevel] = useState(1);
    const [xp, setXp] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [dropsCollected, setDropsCollected] = useState(0);
    const [currentMode, setCurrentMode] = useState(mode);
    const [menuOpen, setMenuOpen] = useState<MenuTab>(null);
    const [energy, setEnergy] = useState(100);
    const [currentDialogue, setCurrentDialogue] = useState("");
    const [showDialogue, setShowDialogue] = useState(true);

    const character = CHARACTERS.queen;
    const xpToNextLevel = level * 100;

    // Get random dialogue based on mood
    const getDialogue = (m: Mood) => {
        const dialogues = character.dialogues[m];
        return dialogues[Math.floor(Math.random() * dialogues.length)];
    };

    // Update dialogue when mood changes
    useEffect(() => {
        setCurrentDialogue(getDialogue(mood));
    }, [mood]);

    // Simulate mood changes
    useEffect(() => {
        const moodInterval = setInterval(() => {
            const moods: Mood[] = ["happy", "neutral", "sad", "excited", "sleepy"];
            setMood(moods[Math.floor(Math.random() * moods.length)]);
        }, currentMode === "active" ? 8000 : currentMode === "mild" ? 20000 : 40000);
        return () => clearInterval(moodInterval);
    }, [currentMode]);

    // Auto-collect drops
    useEffect(() => {
        const dropInterval = setInterval(() => {
            if (currentMode !== "passive" || Math.random() > 0.8) {
                const dropAmount = currentMode === "active" ? 3 : 1;
                setDropsCollected(prev => prev + dropAmount);
                setXp(prev => {
                    const newXp = prev + dropAmount * 10;
                    if (newXp >= xpToNextLevel) {
                        setLevel(l => l + 1);
                        return newXp - xpToNextLevel;
                    }
                    return newXp;
                });
                setIsAnimating(true);
                setTimeout(() => setIsAnimating(false), 500);
            }
        }, currentMode === "active" ? 10000 : 30000);
        return () => clearInterval(dropInterval);
    }, [currentMode, xpToNextLevel]);

    // Energy recovery
    useEffect(() => {
        const energyInterval = setInterval(() => {
            setEnergy(prev => Math.min(100, prev + (currentMode === "passive" ? 5 : 1)));
        }, 10000);
        return () => clearInterval(energyInterval);
    }, [currentMode]);

    const handleModeChange = (newMode: "passive" | "mild" | "active") => {
        setCurrentMode(newMode);
        onModeChange?.(newMode);
    };

    const handleActivity = (activityId: string) => {
        const activity = ACTIVITIES.find(a => a.id === activityId);
        if (!activity || (activity.cost > dropsCollected) || (activityId !== "rest" && energy < 10)) return;

        setDropsCollected(prev => prev - activity.cost);
        setIsAnimating(true);

        switch (activityId) {
            case "feed": setXp(prev => Math.min(xpToNextLevel, prev + 20)); setMood("happy"); break;
            case "play": setDropsCollected(prev => prev + Math.floor(Math.random() * 5) + 1); setMood("excited"); setEnergy(prev => Math.max(0, prev - 10)); break;
            case "train": setXp(prev => Math.min(xpToNextLevel, prev + 50)); setEnergy(prev => Math.max(0, prev - 20)); break;
            case "explore": setDropsCollected(prev => prev + Math.floor(Math.random() * 10) + 1); setEnergy(prev => Math.max(0, prev - 15)); break;
            case "clean": setXp(prev => Math.min(xpToNextLevel, prev + 30)); setMood("happy"); break;
            case "rest": setEnergy(100); setMood("sleepy"); break;
        }
        setTimeout(() => setIsAnimating(false), 500);
    };

    const getMoodEmoji = () => {
        const emojis = { happy: "😊", excited: "🤩", sad: "😢", sleepy: "😴", neutral: "😐" };
        return emojis[mood];
    };

    const getMoodColor = () => {
        const colors = {
            happy: "from-green-500/20 to-emerald-500/20",
            excited: "from-yellow-500/20 to-orange-500/20",
            sad: "from-blue-500/20 to-indigo-500/20",
            sleepy: "from-purple-500/20 to-violet-500/20",
            neutral: "from-zinc-500/20 to-zinc-600/20",
        };
        return colors[mood];
    };

    return (
        <div className={`zone-card group relative rounded-xl bg-gradient-to-br ${getMoodColor()} border border-white/10 p-4 overflow-hidden transition-all duration-500 hover:border-neon-purple/50 hover:shadow-xl hover:shadow-neon-purple/20`}>
            {/* Header */}
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                        🐣 QGotchi
                        <span className="text-[10px] bg-neon-purple/30 px-1.5 py-0.5 rounded-full">Lv.{level}</span>
                    </h3>
                    <p className="text-[10px] text-white/50">Clean Puff Protocol</p>
                </div>
                <div className="text-xl">{getMoodEmoji()}</div>
            </div>

            {/* Speech Bubble - Video Game Style */}
            {showDialogue && (
                <div
                    className="relative bg-white/95 text-zinc-800 rounded-xl px-3 py-2 mb-3 text-xs font-medium cursor-pointer shadow-lg"
                    onClick={() => setCurrentDialogue(getDialogue(mood))}
                >
                    <div className="absolute -bottom-2 left-6 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-white/95" />
                    <p className="leading-relaxed">{currentDialogue}</p>
                    <span className="absolute bottom-1 right-2 text-[8px] text-zinc-400 animate-pulse">tap ▼</span>
                </div>
            )}

            {/* Character */}
            <div className={`relative w-16 h-16 mx-auto mb-2 transition-transform duration-300 ${isAnimating ? "scale-110" : ""} ${mood === "sleepy" ? "opacity-70" : ""}`}>
                <Image
                    src={character.image}
                    alt={character.name}
                    fill
                    className={`object-contain drop-shadow-[0_0_12px_rgba(188,19,254,0.5)] ${mood === "excited" ? "animate-bounce" : ""}`}
                />
                {isAnimating && <div className="absolute -top-1 -right-1 text-sm animate-ping">💎</div>}
            </div>

            {/* Name */}
            <div className="text-center mb-2">
                <p className="text-xs font-bold text-white">{character.name}</p>
            </div>

            {/* Bars */}
            <div className="space-y-1.5 mb-2">
                <div>
                    <div className="flex justify-between text-[10px] text-white/50 mb-0.5">
                        <span>XP</span><span>{xp}/{xpToNextLevel}</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-neon-purple to-neon-blue transition-all duration-500" style={{ width: `${(xp / xpToNextLevel) * 100}%` }} />
                    </div>
                </div>
                <div>
                    <div className="flex justify-between text-[10px] text-white/50 mb-0.5">
                        <span>⚡ Energy</span><span>{energy}%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-500 ${energy > 50 ? "bg-green-500" : energy > 20 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${energy}%` }} />
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="flex justify-between text-[10px] mb-2">
                <div className="text-center"><p className="text-white/50">Drops</p><p className="text-white font-bold">{dropsCollected}💎</p></div>
                <div className="text-center"><p className="text-white/50">Mode</p><p className="text-white font-bold capitalize">{currentMode}</p></div>
                <div className="text-center"><p className="text-white/50">Chain</p><p className="text-white font-bold">SOL◎</p></div>
            </div>

            {/* Mode Buttons */}
            <div className="flex gap-1 mb-2">
                {(["passive", "mild", "active"] as const).map((m) => (
                    <button
                        key={m}
                        onClick={() => handleModeChange(m)}
                        className={`flex-1 py-1 rounded text-[10px] font-bold transition-all ${currentMode === m ? "bg-neon-purple text-white" : "bg-white/5 text-white/50 hover:bg-white/10"}`}
                    >
                        {m === "passive" ? "🛋️" : m === "mild" ? "🚶" : "🔥"}
                    </button>
                ))}
            </div>

            {/* Menu Tabs */}
            <div className="flex gap-1 border-t border-white/10 pt-2">
                {[
                    { id: "activities" as const, icon: Gamepad2, label: "Play" },
                    { id: "settings" as const, icon: Settings, label: "Set" },
                    { id: "wallet" as const, icon: Wallet, label: "$" },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setMenuOpen(menuOpen === tab.id ? null : tab.id)}
                        className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-[10px] font-medium transition-all ${menuOpen === tab.id ? "bg-neon-purple/30 text-neon-purple" : "bg-white/5 text-white/60 hover:bg-white/10"}`}
                    >
                        <tab.icon size={12} /> {tab.label}
                    </button>
                ))}
            </div>

            {/* Menu Content */}
            {menuOpen && (
                <div className="mt-2 p-2 bg-black/30 rounded-lg border border-white/5">
                    {menuOpen === "activities" && (
                        <div className="grid grid-cols-3 gap-1.5">
                            {ACTIVITIES.map((a) => (
                                <button
                                    key={a.id}
                                    onClick={() => handleActivity(a.id)}
                                    disabled={a.cost > dropsCollected || (a.id !== "rest" && energy < 10)}
                                    className="flex flex-col items-center p-1.5 rounded bg-white/5 hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <span className="text-base">{a.icon}</span>
                                    <span className="text-[9px] font-bold text-white">{a.name}</span>
                                    {a.cost > 0 && <span className="text-[8px] text-white/50">{a.cost}💎</span>}
                                </button>
                            ))}
                        </div>
                    )}
                    {menuOpen === "settings" && (
                        <div className="space-y-2 text-[10px]">
                            <div className="flex justify-between"><span className="text-white/70">Character</span><span className="text-neon-purple">{character.name}</span></div>
                            <button className="w-full py-1.5 bg-white/5 hover:bg-white/10 rounded text-white/70">🔄 Change (Soon)</button>
                        </div>
                    )}
                    {menuOpen === "wallet" && (
                        <div className="text-center space-y-2">
                            <Gift className="w-6 h-6 mx-auto text-neon-purple" />
                            <p className="text-[10px] text-white/70">Connect for real drops!</p>
                            <button className="w-full py-1.5 bg-gradient-to-r from-neon-purple to-neon-blue rounded text-[10px] font-bold text-white">Connect Wallet</button>
                        </div>
                    )}
                </div>
            )}

            <div className="absolute bottom-1 right-2 text-[9px] text-white/20">$SOLQUEEF</div>
        </div>
    );
}
