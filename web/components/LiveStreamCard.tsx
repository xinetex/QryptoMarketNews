"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Radio, AlertCircle } from "lucide-react";

interface LiveStreamCardProps {
    streamUrl?: string;
    title?: string;
    description?: string;
    isLive?: boolean;
}

export default function LiveStreamCard({
    streamUrl,
    title = "QChannel Live",
    description = "Live crypto market coverage",
    isLive = false,
}: LiveStreamCardProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (videoRef.current && streamUrl) {
            videoRef.current.src = streamUrl;
            videoRef.current.load();
        }
    }, [streamUrl]);

    const togglePlay = () => {
        if (!videoRef.current) return;

        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play().catch(err => {
                setError("Unable to play stream");
                console.error("Playback error:", err);
            });
        }
        setIsPlaying(!isPlaying);
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const handleFullscreen = () => {
        if (videoRef.current) {
            videoRef.current.requestFullscreen();
        }
    };

    return (
        <div className="relative aspect-video bg-zinc-900 rounded-xl overflow-hidden border border-white/10 group">
            {/* Video Element */}
            {streamUrl ? (
                <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    muted={isMuted}
                    playsInline
                    onError={() => setError("Stream unavailable")}
                    onPlaying={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                />
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900/50 to-purple-900/50">
                    <Radio size={48} className="text-indigo-400 mb-4 animate-pulse" />
                    <p className="text-zinc-400 text-sm">No stream connected</p>
                    <p className="text-zinc-600 text-xs mt-2">Configure OBS to stream here</p>
                </div>
            )}

            {/* Error Overlay */}
            {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
                    <AlertCircle size={32} className="text-red-500 mb-2" />
                    <p className="text-red-400 text-sm">{error}</p>
                </div>
            )}

            {/* Live Badge */}
            {isLive && (
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-600 px-2 py-1 rounded text-xs font-bold">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    LIVE
                </div>
            )}

            {/* Title Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <h3 className="text-white font-bold">{title}</h3>
                <p className="text-zinc-400 text-xs">{description}</p>
            </div>

            {/* Controls (shown on hover) */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-3">
                    <button
                        onClick={togglePlay}
                        className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                    >
                        {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                    </button>
                    <button
                        onClick={toggleMute}
                        className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                    >
                        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>
                    <button
                        onClick={handleFullscreen}
                        className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                    >
                        <Maximize size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
