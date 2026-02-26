import { useRef, useState, useEffect } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Video as VideoIcon, VideoOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { updateAppointmentStatus, getAppointmentDetails } from '../../services/api';

interface VideoConsultationProps {
    appointmentId: string;
    roomId: string;
    onClose: () => void;
    isDoctor?: boolean;
}

const STUN_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
    ],
};

export function VideoConsultation({ appointmentId, roomId, onClose, isDoctor = false }: VideoConsultationProps) {
    const { profile } = useAuth();
    const { sendMessage } = useNotification();
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const socket = useRef<WebSocket | null>(null);

    useEffect(() => {
        const startCall = async () => {
            try {
                // 1. Get Media with Fallback
                let stream: MediaStream;
                try {
                    stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                } catch (err) {
                    console.warn('Camera failed, trying audio only:', err);
                    stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
                    setIsVideoOff(true);
                }

                setLocalStream(stream);
                if (localVideoRef.current) localVideoRef.current.srcObject = stream;

                // 2. Setup WebSocket
                // Use relative protocol and host for production (Render) support
                const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
                const host = import.meta.env.VITE_API_URL
                    ? import.meta.env.VITE_API_URL.replace(/^https?:\/\//, '')
                    : `${window.location.hostname}:8000`;

                const wsUrl = `${protocol}//${host}/ws/call/${roomId}/${profile?.id}`;
                socket.current = new WebSocket(wsUrl);

                socket.current.onopen = async () => {
                    console.log('WebSocket connected');
                    if (isDoctor) {
                        // Doctor initiates by creating offer
                        createOffer();

                        // Also notify the patient via Notification WebSocket
                        try {
                            const appointment = await getAppointmentDetails(appointmentId);
                            if (appointment && appointment.patient_id) {
                                sendMessage({
                                    type: 'CALL_INITIATED',
                                    appointment_id: appointmentId,
                                    doctor_name: profile?.full_name || 'Doctor',
                                    patient_id: appointment.patient_id,
                                    room_id: roomId
                                });
                            }
                        } catch (err) {
                            console.error('Error sending call notification:', err);
                        }
                    }
                };

                socket.current.onmessage = async (event) => {
                    const data = JSON.parse(event.data);
                    handleSignalingData(data);
                };

                // 3. Setup Peer Connection
                peerConnection.current = new RTCPeerConnection(STUN_SERVERS);

                stream.getTracks().forEach(track => {
                    peerConnection.current?.addTrack(track, stream);
                });

                peerConnection.current.ontrack = (event) => {
                    setRemoteStream(event.streams[0]);
                    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
                };

                peerConnection.current.onicecandidate = (event) => {
                    if (event.candidate) {
                        sendSignalingData({ type: 'candidate', candidate: event.candidate });
                    }
                };

            } catch (error) {
                console.error('Error starting video call:', error);
            }
        };

        startCall();

        return () => {
            localStream?.getTracks().forEach(track => track.stop());
            peerConnection.current?.close();
            socket.current?.close();
        };
    }, []);

    const sendSignalingData = (data: any) => {
        if (socket.current?.readyState === WebSocket.OPEN) {
            socket.current.send(JSON.stringify(data));
        }
    };

    const handleSignalingData = async (data: any) => {
        switch (data.type) {
            case 'offer':
                await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(data.offer));
                const answer = await peerConnection.current?.createAnswer();
                await peerConnection.current?.setLocalDescription(answer);
                sendSignalingData({ type: 'answer', answer });
                break;
            case 'answer':
                await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(data.answer));
                break;
            case 'candidate':
                await peerConnection.current?.addIceCandidate(new RTCIceCandidate(data.candidate));
                break;
            case 'CALL_ENDED':
                handleEndCall(false);
                break;
        }
    };

    const createOffer = async () => {
        const offer = await peerConnection.current?.createOffer();
        await peerConnection.current?.setLocalDescription(offer);
        sendSignalingData({ type: 'offer', offer });
    };

    const toggleMute = () => {
        if (localStream) {
            localStream.getAudioTracks()[0].enabled = isMuted;
            setIsMuted(!isMuted);
        }
    };

    const toggleVideo = () => {
        if (localStream) {
            localStream.getVideoTracks()[0].enabled = isVideoOff;
            setIsVideoOff(!isVideoOff);
        }
    };

    const handleEndCall = async (initiatedByUser: boolean = true) => {
        if (initiatedByUser) {
            sendSignalingData({ type: 'CALL_ENDED' });
        }

        if (isDoctor) {
            await updateAppointmentStatus(appointmentId, 'completed');
        }

        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black z-[100] flex flex-col group">
            {/* Remote Video (Full Screen) */}
            <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-gray-900">
                {remoteStream ? (
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="text-white text-center">
                        <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                            <VideoIcon className="w-10 h-10 text-white" />
                        </div>
                        <p className="text-xl font-medium">Waiting for patient to join...</p>
                        <p className="text-gray-400 mt-2">Appointment ID: {appointmentId}</p>
                    </div>
                )}

                {/* Local Video (PiP) */}
                <div className="absolute top-6 right-6 w-48 aspect-video bg-gray-800 rounded-xl border-2 border-white/20 overflow-hidden shadow-2xl transition-all hover:scale-105">
                    <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/50 rounded text-[10px] text-white">
                        You
                    </div>
                </div>

                {/* Overlay Controls */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button
                        onClick={toggleMute}
                        className={`p-4 rounded-2xl transition-colors ${isMuted ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}
                    >
                        {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                    </button>

                    <button
                        onClick={toggleVideo}
                        className={`p-4 rounded-2xl transition-colors ${isVideoOff ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}
                    >
                        {isVideoOff ? <VideoOff className="w-6 h-6" /> : <VideoIcon className="w-6 h-6" />}
                    </button>

                    <button
                        onClick={() => handleEndCall(true)}
                        className="p-4 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-colors shadow-lg shadow-red-900/40"
                    >
                        <PhoneOff className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* In-Call Info Header */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start pointer-events-none group-hover:opacity-100 opacity-0 transition-opacity">
                <div className="flex items-center gap-4 pointer-events-auto">
                    <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg">
                        <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-white font-bold tracking-tight">Consultation Ongoing</h2>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-gray-400 text-xs font-medium">Secured Connection</span>
                        </div>
                    </div>
                </div>

                <div className="pointer-events-auto">
                    <button
                        onClick={() => handleEndCall(true)}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-bold rounded-xl border border-white/10 transition-colors"
                    >
                        Leave Room
                    </button>
                </div>
            </div>
        </div>
    );
}
