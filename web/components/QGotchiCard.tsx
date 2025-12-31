"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

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

export default function QGotchiCard({ mode = "mild" }: QGotchiCardProps) {
    const [mood, setMood] = useState<Mood>("neutral");
    const [level, setLevel] = useState(1);
    const [xp, setXp] = useState(0);
    const [drops, setDrops] = useState(0);
    const [dialogue, setDialogue] = useState("");
    const [isAnimating, setIsAnimating] = useState(false);

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
            setDrops(d => d + 1);
            setXp(x => {
                const newXp = x + 10;
                if (newXp >= xpToNext) { setLevel(l => l + 1); return 0; }
                return newXp;
            });
            setIsAnimating(true);
            setTimeout(() => setIsAnimating(false), 500);
        }, 20000);
        return () => clearInterval(interval);
    }, [xpToNext]);

    const moodEmoji = { happy: "😊", excited: "🤩", sad: "😢", sleepy: "😴", neutral: "😐" }[mood];
    const moodColor = {
        happy: "from-green-500/20 to-emerald-500/20",
        excited: "from-yellow-500/20 to-orange-500/20",
        sad: "from-blue-500/20 to-indigo-500/20",
        sleepy: "from-purple-500/20 to-violet-500/20",
        neutral: "from-zinc-500/20 to-zinc-600/20",
    }[mood];

    return (
        <div className={`zone-card group relative h-52 rounded-xl bg-gradient-to-br ${moodColor} border border-white/10 p-4 overflow-hidden transition-all duration-500 hover:border-neon-purple/50 hover:shadow-xl hover:shadow-neon-purple/20`}>
            {/* Header Row */}
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    <span className="text-sm">🐣</span>
                    <span className="text-xs font-bold text-white">QGotchi</span>
                    <span className="text-[9px] bg-neon-purple/40 px-1 py-0.5 rounded">Lv.{level}</span>
                </div>
                <div className="text-lg">{moodEmoji}</div>
            </div>

            {/* Main Content: Character + Speech Bubble */}
            <div className="flex items-start gap-2 mb-2">
                {/* Character */}
                <div className={`relative w-14 h-14 flex-shrink-0 transition-transform ${isAnimating ? "scale-110" : ""}`}>
                    <Image
                        src={CHARACTER.image}
                        alt={CHARACTER.name}
                        fill
                        className={`object-contain drop-shadow-[0_0_8px_rgba(188,19,254,0.5)] ${mood === "excited" ? "animate-bounce" : ""}`}
                    />
                    {isAnimating && <span className="absolute -top-1 -right-1 text-xs animate-ping">💎</span>}
                </div>

                {/* Speech Bubble */}
                <div
                    className="relative flex-1 bg-white/90 text-zinc-800 rounded-lg px-2 py-1.5 text-[10px] leading-tight cursor-pointer shadow-md"
                    onClick={() => setDialogue(getDialogue(mood))}
                >
                    <div className="absolute left-[-6px] top-3 w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-r-[6px] border-r-white/90" />
                    <p className="font-medium">{dialogue}</p>
                    <span className="text-[7px] text-zinc-400 absolute bottom-0.5 right-1">tap▼</span>
                </div>
            </div>

            {/* XP Bar */}
            <div className="mb-2">
                <div className="flex justify-between text-[9px] text-white/50 mb-0.5">
                    <span>XP</span>
                    <span>{xp}/{xpToNext}</span>
                </div>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-neon-purple to-neon-blue transition-all" style={{ width: `${(xp / xpToNext) * 100}%` }} />
                </div>
            </div>

            {/* Stats Row */}
            <div className="flex justify-between text-[9px]">
                <div><span className="text-white/50">Drops</span> <span className="text-white font-bold">{drops}💎</span></div>
                <div><span className="text-white/50">Mode</span> <span className="text-white font-bold capitalize">{mode}</span></div>
                <div><span className="text-white/50">Chain</span> <span className="text-white font-bold">SOL◎</span></div>
            </div>

            {/* Bottom Badge */}
            <div className="absolute bottom-1 right-2 text-[8px] text-white/20">$SOLQUEEF • Clean Puff</div>
        </div>
    );
}
