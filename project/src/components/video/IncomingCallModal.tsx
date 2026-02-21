import { useEffect } from 'react';
import { Phone, X, Video, User } from 'lucide-react';

interface IncomingCallModalProps {
    doctorName: string;
    onAccept: () => void;
    onDecline: () => void;
}

export function IncomingCallModal({ doctorName, onAccept, onDecline }: IncomingCallModalProps) {

    useEffect(() => {
        // ringtone.loop = true;
        // ringtone.play().catch(() => {});
        return () => {
            // ringtone.pause();
        };
    }, []);

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div
                className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300"
                style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)'
                }}
            >
                <div className="p-8 text-center">
                    <div className="relative inline-block mb-6">
                        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
                            <User className="w-12 h-12 text-blue-600" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                            <Video className="w-4 h-4 text-white" />
                        </div>
                    </div>

                    <h2 className="text-2xl font-black text-gray-900 mb-1">Incoming Call</h2>
                    <p className="text-blue-600 font-bold tracking-tight uppercase text-xs mb-4">Video Consultation Request</p>

                    <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100/50 mb-8">
                        <p className="text-sm font-medium text-gray-500 mb-1">Doctor</p>
                        <p className="text-xl font-bold text-gray-900">{doctorName}</p>
                    </div>

                    <div className="flex items-center justify-center gap-6">
                        <button
                            onClick={onDecline}
                            className="group flex flex-col items-center gap-2"
                        >
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center transition-all hover:bg-red-600 hover:text-white hover:scale-110 shadow-lg shadow-red-100 hover:shadow-red-200">
                                <X className="w-8 h-8" />
                            </div>
                            <span className="text-xs font-bold text-gray-400 group-hover:text-red-600 transition-colors uppercase tracking-widest">Decline</span>
                        </button>

                        <button
                            onClick={onAccept}
                            className="group flex flex-col items-center gap-2"
                        >
                            <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center transition-all hover:bg-green-600 hover:scale-110 shadow-lg shadow-green-200 hover:shadow-green-300 animate-bounce">
                                <Phone className="w-8 h-8 fill-current" />
                            </div>
                            <span className="text-xs font-bold text-green-600 uppercase tracking-widest">Accept</span>
                        </button>
                    </div>
                </div>

                <div className="bg-blue-600 h-1.5 w-full">
                    <div className="bg-white/30 h-full w-1/3 animate-shimmer" />
                </div>
            </div>
        </div>
    );
}
