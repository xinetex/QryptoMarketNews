"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function RemotePage() {
    const [status, setStatus] = useState("Connected");

    const sendCommand = async (key: string) => {
        // Haptic feedback
        if (navigator.vibrate) navigator.vibrate(50);

        try {
            await fetch('/api/roku/remote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key })
            });
        } catch (e) {
            setStatus("Connection Failed");
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 select-none overflow-hidden">
            <h1 className="text-2xl font-bold mb-8 tracking-widest text-[#bc13fe]">PROPHET REMOTE</h1>

            <div className="bg-[#111] p-8 rounded-[40px] shadow-2xl border border-[#333] w-full max-w-sm flex flex-col gap-8">

                {/* D-PAD */}
                <div className="relative w-64 h-64 mx-auto bg-[#1a1a1a] rounded-full shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] flex items-center justify-center">
                    {/* Up */}
                    <RemoteBtn
                        onClick={() => sendCommand('Up')}
                        className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-20 rounded-t-2xl active:bg-[#bc13fe]"
                        icon="▲"
                    />
                    {/* Down */}
                    <RemoteBtn
                        onClick={() => sendCommand('Down')}
                        className="absolute bottom-2 left-1/2 -translate-x-1/2 w-20 h-20 rounded-b-2xl active:bg-[#bc13fe]"
                        icon="▼"
                    />
                    {/* Left */}
                    <RemoteBtn
                        onClick={() => sendCommand('Left')}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-20 h-20 rounded-l-2xl active:bg-[#bc13fe]"
                        icon="◀"
                    />
                    {/* Right */}
                    <RemoteBtn
                        onClick={() => sendCommand('Right')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-20 h-20 rounded-r-2xl active:bg-[#bc13fe]"
                        icon="▶"
                    />
                    {/* OK */}
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => sendCommand('Select')}
                        className="w-20 h-20 bg-[#222] rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.8)] z-10 font-bold border border-[#444] text-[#bc13fe]"
                    >
                        OK
                    </motion.button>
                </div>

                {/* Main Controls */}
                <div className="grid grid-cols-3 gap-6 px-4">
                    <ControlBtn label="Back" icon="↩" onClick={() => sendCommand('Back')} />
                    <ControlBtn label="Home" icon="🏠" onClick={() => sendCommand('Home')} />
                    <ControlBtn label="Replay" icon="↺" onClick={() => sendCommand('InstantReplay')} />
                </div>

                {/* Playback */}
                <div className="grid grid-cols-3 gap-6 px-4 mt-2">
                    <ControlBtn label="Rev" icon="⏪" onClick={() => sendCommand('Rev')} />
                    <ControlBtn label="Play" icon="⏯" onClick={() => sendCommand('Play')} />
                    <ControlBtn label="Fwd" icon="⏩" onClick={() => sendCommand('Fwd')} />
                </div>
            </div>

            <div className="mt-8 text-[#666] text-sm flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${status === 'Connected' ? 'bg-green-500' : 'bg-red-500'}`} />
                {status}
            </div>
        </div>
    );
}

function RemoteBtn({ onClick, className, icon }: any) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center justify-center text-2xl text-gray-400 hover:text-white transition-colors ${className}`}
        >
            {icon}
        </button>
    );
}

function ControlBtn({ label, icon, onClick }: any) {
    return (
        <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onClick}
            className="flex flex-col items-center gap-2"
        >
            <div className="w-16 h-16 bg-[#222] rounded-2xl flex items-center justify-center text-xl shadow-lg border border-[#333] active:bg-[#bc13fe] active:border-transparent active:text-white transition-all">
                {icon}
            </div>
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</span>
        </motion.button>
    );
}
