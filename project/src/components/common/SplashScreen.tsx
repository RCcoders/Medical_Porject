import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
    onFinished?: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinished }) => {
    const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in');
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Phase: fade in (0.6s) → hold with progress (2.4s) → fade out (0.6s) = 3.6s total
        const t1 = setTimeout(() => setPhase('hold'), 600);
        const t2 = setTimeout(() => setPhase('out'), 3000);
        const t3 = setTimeout(() => onFinished?.(), 3600);

        // Animate progress bar over 2.4s hold phase
        let start: number | null = null;
        let raf: number;
        const animateProgress = (ts: number) => {
            if (!start) start = ts;
            const elapsed = ts - start;
            const pct = Math.min((elapsed / 2400) * 100, 100);
            setProgress(pct);
            if (pct < 100) raf = requestAnimationFrame(animateProgress);
        };
        const t4 = setTimeout(() => { raf = requestAnimationFrame(animateProgress); }, 600);

        return () => {
            clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4);
            cancelAnimationFrame(raf);
        };
    }, []);

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'radial-gradient(ellipse at 60% 40%, #0f2a5e 0%, #060d1f 55%, #000510 100%)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            opacity: phase === 'out' ? 0 : 1,
            transition: phase === 'in' ? 'opacity 0.6s ease' : phase === 'out' ? 'opacity 0.6s ease' : 'none',
            overflow: 'hidden',
        }}>
            {/* Animated background orbs */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
                <div style={orb('#3b82f6', 420, '15%', '20%', '18s')} />
                <div style={orb('#6366f1', 320, '70%', '60%', '22s')} />
                <div style={orb('#0ea5e9', 260, '40%', '80%', '16s')} />
                <div style={orb('#1d4ed8', 180, '80%', '15%', '20s')} />
                {/* Grid lines */}
                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.05 }}>
                    <defs>
                        <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#60a5fa" strokeWidth="0.5" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
            </div>

            {/* Cross/plus decorations */}
            {[...Array(6)].map((_, i) => (
                <div key={i} style={{
                    position: 'absolute',
                    left: `${[10, 85, 25, 75, 50, 5][i]}%`,
                    top: `${[15, 25, 75, 80, 45, 55][i]}%`,
                    color: 'rgba(96,165,250,0.2)',
                    fontSize: `${[28, 20, 24, 18, 32, 16][i]}px`,
                    animation: `floatBob ${[4, 5, 3.5, 4.5, 3, 5.5][i]}s ease-in-out infinite`,
                    animationDelay: `${i * 0.4}s`,
                    fontWeight: 300,
                }}>✚</div>
            ))}

            {/* Main logo circle */}
            <div style={{
                position: 'relative',
                width: '160px', height: '160px',
                marginBottom: '32px',
                animation: 'logoScale 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards',
            }}>
                {/* Rotating ring */}
                <div style={{
                    position: 'absolute', inset: '-12px',
                    borderRadius: '50%',
                    border: '2px solid transparent',
                    borderTopColor: '#3b82f6',
                    borderRightColor: '#6366f1',
                    animation: 'spinRing 3s linear infinite',
                }} />
                {/* Outer glow ring */}
                <div style={{
                    position: 'absolute', inset: '-4px',
                    borderRadius: '50%',
                    border: '1px solid rgba(96,165,250,0.3)',
                    animation: 'pulse 2s ease-in-out infinite',
                }} />
                {/* Logo background */}
                <div style={{
                    width: '100%', height: '100%',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(59,130,246,0.2) 0%, rgba(99,102,241,0.2) 100%)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(96,165,250,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 60px rgba(59,130,246,0.3), 0 0 120px rgba(59,130,246,0.1)',
                }}>
                    <img
                        src="/assets/g-onelogo.png"
                        alt="G-ONE"
                        style={{
                            width: '90px', height: '90px',
                            objectFit: 'contain',
                            filter: 'drop-shadow(0 0 16px rgba(96,165,250,0.8))',
                        }}
                    />
                </div>
            </div>

            {/* Brand name */}
            <div style={{
                textAlign: 'center', marginBottom: '8px',
                animation: 'fadeUp 0.7s 0.3s both ease-out',
            }}>
                <h1 style={{
                    color: '#fff',
                    fontSize: '28px',
                    fontWeight: 700,
                    letterSpacing: '0.2em',
                    margin: 0,
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    textShadow: '0 0 30px rgba(96,165,250,0.6)',
                }}>G-ONE MEDICAL</h1>
                <p style={{
                    color: 'rgba(148,163,184,0.8)',
                    fontSize: '13px',
                    letterSpacing: '0.3em',
                    margin: '6px 0 0',
                    fontFamily: 'system-ui, sans-serif',
                    textTransform: 'uppercase',
                }}>Healthcare Platform</p>
            </div>

            {/* Tagline dots */}
            <div style={{
                display: 'flex', gap: '6px', marginBottom: '48px', marginTop: '16px',
                animation: 'fadeUp 0.7s 0.5s both ease-out',
            }}>
                {['#3b82f6', '#6366f1', '#0ea5e9'].map((c, i) => (
                    <div key={i} style={{
                        width: '6px', height: '6px', borderRadius: '50%',
                        background: c,
                        animation: `dotBounce 1.2s ${i * 0.15}s ease-in-out infinite`,
                    }} />
                ))}
            </div>

            {/* Progress bar */}
            <div style={{
                position: 'absolute', bottom: '40px', left: '50%',
                transform: 'translateX(-50%)',
                width: '200px',
                animation: 'fadeUp 0.7s 0.6s both ease-out',
            }}>
                <div style={{
                    fontSize: '11px', color: 'rgba(148,163,184,0.6)',
                    textAlign: 'center', marginBottom: '8px',
                    letterSpacing: '0.12em',
                    fontFamily: 'system-ui, sans-serif',
                }}>INITIALIZING…</div>
                <div style={{
                    height: '3px', background: 'rgba(255,255,255,0.1)',
                    borderRadius: '2px', overflow: 'hidden',
                }}>
                    <div style={{
                        height: '100%', width: `${progress}%`,
                        background: 'linear-gradient(90deg, #3b82f6, #6366f1, #0ea5e9)',
                        borderRadius: '2px',
                        boxShadow: '0 0 8px rgba(99,102,241,0.8)',
                        transition: 'width 0.1s linear',
                    }} />
                </div>
            </div>

            <style>{`
                @keyframes spinRing {
                    to { transform: rotate(360deg); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 0.7; transform: scale(1.04); }
                }
                @keyframes logoScale {
                    from { transform: scale(0.6); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes floatBob {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-12px); }
                }
                @keyframes dotBounce {
                    0%, 100% { transform: translateY(0); opacity: 0.5; }
                    50% { transform: translateY(-6px); opacity: 1; }
                }
                @keyframes orbFloat {
                    0%, 100% { transform: translate(0, 0); }
                    33% { transform: translate(30px, -20px); }
                    66% { transform: translate(-20px, 15px); }
                }
            `}</style>
        </div>
    );
};

function orb(color: string, size: number, left: string, top: string, duration: string): React.CSSProperties {
    return {
        position: 'absolute',
        left, top,
        width: `${size}px`, height: `${size}px`,
        borderRadius: '50%',
        background: color,
        filter: `blur(${size * 0.45}px)`,
        opacity: 0.15,
        animation: `orbFloat ${duration} ease-in-out infinite`,
        transform: 'translate(-50%, -50%)',
    };
}

export default SplashScreen;
