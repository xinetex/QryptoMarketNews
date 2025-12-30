"use client";

import { useRef, useState, useEffect } from "react";
import { Volume2, VolumeX, Play, Pause, Maximize, Minimize } from "lucide-react";

interface VideoBackgroundProps {
    src?: string;
    poster?: string;
    className?: string;
    showControls?: boolean;
}

// Default ambient video URLs (royalty-free space/tech videos)
const DEFAULT_VIDEOS = [
    "https://cdn.pixabay.com/video/2020/05/25/40130-424930877_large.mp4", // Abstract tech
    "https://cdn.pixabay.com/video/2021/06/22/78797-568629544_large.mp4", // Space nebula
];

export default function VideoBackground({
    src,
    poster,
    className = "",
    showControls = true,
}: VideoBackgroundProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

    const videoSrc = src || DEFAULT_VIDEOS[currentVideoIndex];

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.play().catch(() => {
                // Autoplay was prevented, that's okay
            });
        }
    }, []);

    const handlePlayPause = () => {
        if (!videoRef.current) return;
        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleMuteToggle = () => {
        if (!videoRef.current) return;
        videoRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    const handleFullscreen = () => {
        if (!videoRef.current) return;
        if (!isFullscreen) {
            videoRef.current.requestFullscreen?.();
        } else {
            document.exitFullscreen?.();
        }
        setIsFullscreen(!isFullscreen);
    };

    const handleError = () => {
        setHasError(true);
        // Try next video
        if (currentVideoIndex < DEFAULT_VIDEOS.length - 1) {
            setCurrentVideoIndex(prev => prev + 1);
            setHasError(false);
        }
    };

    if (hasError && currentVideoIndex >= DEFAULT_VIDEOS.length - 1) {
        // Fallback to animated gradient
        return (
            <div className={`absolute inset-0 gradient-animate ${className}`}>
                <div className="absolute inset-0 bg-gradient-to-t from-deep-space via-transparent to-deep-space/70" />
            </div>
        );
    }

    return (
        <div className={`absolute inset-0 overflow-hidden ${className}`}>
            {/* Video Element */}
            <video
                ref={videoRef}
                src={videoSrc}
                poster={poster}
                autoPlay
                loop
                muted={isMuted}
                playsInline
                onError={handleError}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ filter: "brightness(0.4) saturate(1.2)" }}
            />

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-deep-space via-transparent to-deep-space/70" />
            <div className="absolute inset-0 bg-gradient-to-r from-deep-space/50 via-transparent to-deep-space/50" />

            {/* Video Controls */}
            {showControls && (
                <div className="absolute bottom-24 right-8 z-30 flex items-center gap-2 opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <button
                        onClick={handlePlayPause}
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors"
                        title={isPlaying ? "Pause" : "Play"}
                    >
                        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                    <button
                        onClick={handleMuteToggle}
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors"
                        title={isMuted ? "Unmute" : "Mute"}
                    >
                        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>
                    <button
                        onClick={handleFullscreen}
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors"
                        title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                    >
                        {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                    </button>
                </div>
            )}
        </div>
    );
}
