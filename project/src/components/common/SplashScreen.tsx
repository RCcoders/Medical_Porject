import React, { useRef, useEffect } from 'react';

interface SplashScreenProps {
    onFinished?: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinished }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleEnd = () => {
            onFinished?.();
        };

        // Auto-dismiss if video fails to load
        const handleError = () => {
            onFinished?.();
        };

        video.addEventListener('ended', handleEnd);
        video.addEventListener('error', handleError);

        // Attempt autoplay
        video.play().catch(() => {
            // If autoplay blocked, dismiss immediately
            onFinished?.();
        });

        return () => {
            video.removeEventListener('ended', handleEnd);
            video.removeEventListener('error', handleError);
        };
    }, [onFinished]);

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                backgroundColor: '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <video
                ref={videoRef}
                src="/assets/healtcare.mp4"
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                }}
                muted
                playsInline
                autoPlay
                preload="auto"
            />

            {/* Logo overlay — centered on top of video */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none',
                }}
            >
                <img
                    src="/assets/g-onelogo.png"
                    alt="G-ONE Logo"
                    style={{
                        width: '200px',
                        height: '200px',
                        objectFit: 'contain',
                        filter: 'drop-shadow(0 0 24px rgba(37,99,235,0.7)) drop-shadow(0 0 8px rgba(0,0,0,0.8))',
                    }}
                />
            </div>
        </div>
    );
};

export default SplashScreen;
