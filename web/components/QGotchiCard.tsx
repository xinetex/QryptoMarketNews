"use client";

import { useState, useEffect } from "react";

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
    const moodGradient = {
        happy: "from-green-600/80 via-emerald-500/60 to-transparent",
        excited: "from-orange-600/80 via-yellow-500/60 to-transparent",
        sad: "from-blue-700/80 via-indigo-500/60 to-transparent",
        sleepy: "from-purple-700/80 via-violet-500/60 to-transparent",
        neutral: "from-zinc-800/90 via-zinc-700/70 to-transparent",
    }[mood];

    return (
        <div
            className="zone-card group relative h-52 rounded-xl border border-white/10 overflow-hidden transition-all duration-500 hover:border-neon-purple/50 hover:shadow-xl hover:shadow-neon-purple/20"
            style={{
                backgroundImage: `url(${CHARACTER.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center top",
            }}
        >
            {/* Mood-based gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-t ${moodGradient} transition-all duration-1000`} />

            {/* Dark overlay on left for text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

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
                    className="bg-white/95 backdrop-blur text-zinc-800 rounded-xl px-3 py-2 cursor-pointer shadow-xl max-w-[70%] relative"
                    onClick={() => setDialogue(getDialogue(mood))}
                >
                    <p className="text-xs font-medium leading-snug">{dialogue}</p>
                    <span className="text-[8px] text-zinc-400 absolute bottom-1 right-2">tap▼</span>
                    {/* Speech bubble tail */}
                    <div className="absolute -bottom-2 left-4 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-white/95" />
                </div>

                {/* Bottom Stats Bar */}
                <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
                    <div className="flex justify-between items-center text-[10px] mb-1.5">
                        <div className="flex items-center gap-3">
                            <span><span className="text-white/50">💎</span> <span className="text-white font-bold">{drops}</span></span>
                            <span><span className="text-white/50">Mode:</span> <span className="text-neon-purple font-bold capitalize">{mode}</span></span>
                        </div>
                        <span className="text-white/40">SOL ◎</span>
                    </div>
                    {/* XP Bar */}
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] text-white/50">XP</span>
                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className={`h-full bg-gradient-to-r from-neon-purple to-neon-blue transition-all duration-500 ${isAnimating ? "animate-pulse" : ""}`}
                                style={{ width: `${(xp / xpToNext) * 100}%` }}
                            />
                        </div>
                        <span className="text-[9px] text-white/50">{xp}/{xpToNext}</span>
                    </div>
                </div>
            </div>

            {/* Bottom corner branding */}
            <div className="absolute bottom-1 right-2 text-[8px] text-white/30 z-10">$SOLQUEEF</div>
        </div>
    );
}
