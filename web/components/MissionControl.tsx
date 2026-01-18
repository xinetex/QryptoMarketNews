'use client';

import { motion } from 'framer-motion';

interface Mission {
    id: string;
    label: string;
    icon: string;
    description?: string;
}

interface MissionControlProps {
    missions: Mission[];
    currentMission: string;
    onMissionChange: (id: string) => void;
}

export default function MissionControl({ missions, currentMission, onMissionChange }: MissionControlProps) {
    return (
        <div className="relative z-10">
            <div className="flex items-center gap-2 p-1 bg-gray-900/80 backdrop-blur-md rounded-full border border-gray-800 shadow-xl overflow-x-auto no-scrollbar">
                {missions.map((mission) => {
                    const isActive = currentMission === mission.id;
                    return (
                        <button
                            key={mission.id}
                            onClick={() => onMissionChange(mission.id)}
                            className={`relative px-4 py-2 rounded-full flex items-center gap-2 transition-all duration-300 outline-none whitespace-nowrap group ${isActive ? 'text-white' : 'text-gray-400 hover:text-gray-200'
                                }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="active-pill"
                                    className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full shadow-lg shadow-purple-900/50"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                            <span className="relative z-10 text-lg">{mission.icon}</span>
                            <span className="relative z-10 font-medium text-sm">{mission.label}</span>

                            {/* Hover Details Tooltip (optional future enhancement) */}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
