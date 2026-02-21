import React from 'react';

const SplashScreen: React.FC = () => {
    return (
        <div className={`fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950`}>
            {/* Background radial glow */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[80px] animate-pulse delay-700" />
            </div>

            <div className="relative flex flex-col items-center gap-8">
                {/* Animated Logo Container */}
                <div className="relative group">
                    {/* Logo outer ring */}
                    <div className="absolute -inset-4 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-full opacity-20 group-hover:opacity-40 blur-xl animate-[spin_8s_linear_infinite]" />

                    <div className="relative bg-slate-900/80 backdrop-blur-xl p-8 rounded-full border border-slate-800 shadow-2xl animate-[scaleIn_0.8s_ease-out_forwards]">
                        <img
                            src="/assets/g-onelogo.png"
                            alt="G-ONE Logo"
                            className="w-56 h-56 object-contain filter drop-shadow-[0_0_15px_rgba(37,99,235,0.5)]"
                        />
                    </div>
                </div>

                {/* Brand Text */}
                <div className="text-center space-y-2 opacity-0 animate-[fadeIn_0.5s_ease-out_0.6s_forwards]">
                    <h1 className="text-4xl font-black tracking-[0.2em] text-white">
                        G-ONE
                    </h1>
                    <div className="h-0.5 w-12 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full" />
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.4em]">
                        Precision Intelligence
                    </p>
                </div>

                {/* Modern Loader */}
                <div className="mt-4 flex gap-1 opacity-0 animate-[fadeIn_0.5s_ease-out_1s_forwards]">
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"
                            style={{ animationDelay: `${i * 0.15}s` }}
                        />
                    ))}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes scaleIn {
          0% { transform: scale(0.85); opacity: 0; filter: blur(10px); }
          100% { transform: scale(1); opacity: 1; filter: blur(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
        </div>
    );
};

export default SplashScreen;
