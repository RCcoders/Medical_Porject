import React, { useRef, useEffect, useState } from 'react';

interface SplashScreenProps {
    onFinished?: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinished }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [fading, setFading] = useState(false);
    const [paused, setPaused] = useState(false);
    const [progress, setProgress] = useState(0);

    const dismiss = () => {
        setFading(true);
        setTimeout(() => onFinished?.(), 600); // wait for fade-out
    };

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleEnd = () => dismiss();
        const handleError = () => onFinished?.();

        const handleTimeUpdate = () => {
            if (video.duration) {
                setProgress((video.currentTime / video.duration) * 100);
            }
        };

        video.addEventListener('ended', handleEnd);
        video.addEventListener('error', handleError);
        video.addEventListener('timeupdate', handleTimeUpdate);

        video.play().catch(() => {
            // Autoplay blocked — show paused state so user can click to play
            setPaused(true);
        });

        return () => {
            video.removeEventListener('ended', handleEnd);
            video.removeEventListener('error', handleError);
            video.removeEventListener('timeupdate', handleTimeUpdate);
        };
    }, []);

    const handleClickToPlay = () => {
        videoRef.current?.play().then(() => setPaused(false));
    };

    return (
        <div
            onClick={paused ? handleClickToPlay : undefined}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                backgroundColor: '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: fading ? 0 : 1,
                transition: 'opacity 0.6s ease',
                cursor: paused ? 'pointer' : 'default',
            }}
        >
            {/* Full-screen video */}
            <video
                ref={videoRef}
                src="/assets/healtcare.mp4"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                muted
                playsInline
                preload="auto"
            />

            {/* Gradient overlay — bottom fade for logo/UI legibility */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, transparent 40%, rgba(0,0,0,0.6) 100%)',
                pointerEvents: 'none',
            }} />

            {/* Logo — center */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
                textAlign: 'center',
            }}>
                <img
                    src="/assets/g-onelogo.png"
                    alt="G-ONE"
                    style={{
                        width: '140px',
                        height: '140px',
                        objectFit: 'contain',
                        filter: 'drop-shadow(0 0 32px rgba(37,99,235,0.8)) drop-shadow(0 0 12px rgba(0,0,0,0.9))',
                        animation: 'splashPulse 2s ease-in-out infinite',
                    }}
                />
                <p style={{
                    color: 'rgba(255,255,255,0.85)',
                    fontSize: '18px',
                    fontWeight: 600,
                    marginTop: '12px',
                    letterSpacing: '0.12em',
                    textShadow: '0 2px 12px rgba(0,0,0,0.8)',
                    fontFamily: 'system-ui, sans-serif',
                }}>G-ONE MEDICAL</p>
            </div>

            {/* Click-to-play hint */}
            {paused && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'rgba(0,0,0,0.7)',
                    borderRadius: '50%',
                    width: '80px',
                    height: '80px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid rgba(255,255,255,0.4)',
                    backdropFilter: 'blur(8px)',
                }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                </div>
            )}

            {/* Bottom bar: progress + skip */}
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '20px 28px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
            }}>
                {/* Progress bar */}
                <div style={{
                    flex: 1,
                    height: '3px',
                    background: 'rgba(255,255,255,0.2)',
                    borderRadius: '2px',
                    overflow: 'hidden',
                }}>
                    <div style={{
                        height: '100%',
                        width: `${progress}%`,
                        background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
                        borderRadius: '2px',
                        transition: 'width 0.3s linear',
                    }} />
                </div>

                {/* Skip button */}
                <button
                    onClick={(e) => { e.stopPropagation(); dismiss(); }}
                    style={{
                        background: 'rgba(255,255,255,0.12)',
                        border: '1px solid rgba(255,255,255,0.25)',
                        color: 'rgba(255,255,255,0.85)',
                        padding: '6px 16px',
                        borderRadius: '20px',
                        fontSize: '13px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        backdropFilter: 'blur(8px)',
                        letterSpacing: '0.04em',
                        transition: 'background 0.2s',
                        fontFamily: 'system-ui, sans-serif',
                        whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.22)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
                >
                    Skip ›
                </button>
            </div>

            <style>{`
                @keyframes splashPulse {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.06); opacity: 0.9; }
                }
            `}</style>
        </div>
    );
};

export default SplashScreen;
