import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, Users, Settings, Share2, AlertTriangle, MonitorPlay } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

// Use Google's public STUN servers
const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
    ],
}

export function VideoCall() {
    const { appointmentId } = useParams()
    const { user } = useAuth()
    const navigate = useNavigate()

    // UI State
    const [isMuted, setIsMuted] = useState(false)
    const [isVideoOff, setIsVideoOff] = useState(false)
    const [showChat, setShowChat] = useState(false)
    const [currentTime, setCurrentTime] = useState(new Date())
    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')
    const [error, setError] = useState<string | null>(null)

    // WebRTC References
    const localVideoRef = useRef<HTMLVideoElement>(null)
    const remoteVideoRef = useRef<HTMLVideoElement>(null)
    const socketRef = useRef<WebSocket | null>(null)
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
    const localStreamRef = useRef<MediaStream | null>(null)

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    useEffect(() => {
        if (appointmentId && user) {
            setupWebRTC()
        }

        return () => {
            cleanup()
        }
    }, [appointmentId, user])

    const cleanup = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop())
        }
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close()
        }
        if (socketRef.current) {
            socketRef.current.close()
        }
    }

    const setupWebRTC = async () => {
        try {
            // 1. Get User Media
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            localStreamRef.current = stream

            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream
                localVideoRef.current.muted = true // Mute specific local video to avoid feedback
            }

            // 2. Initialize WebSocket
            // Use wss for secure, ws for local
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
            const wsUrl = `${protocol}//${window.location.hostname}:8000/ws/call/${appointmentId}/${user?.id}`

            socketRef.current = new WebSocket(wsUrl)

            socketRef.current.onopen = () => {
                console.log('WebSocket Connected')
                // Once connected, create peer connection
                createPeerConnection()
            }

            socketRef.current.onmessage = handleSignalingMessage

            socketRef.current.onerror = (err) => {
                console.error("WebSocket Error:", err)
                setError("Connection error. Please refresh.")
            }

        } catch (err) {
            console.error("Error accessing media devices:", err)
            setError("Could not access camera/microphone. Please check permissions.")
        }
    }

    const createPeerConnection = () => {
        try {
            const pc = new RTCPeerConnection(ICE_SERVERS)
            peerConnectionRef.current = pc

            // Add local tracks to peer connection
            localStreamRef.current?.getTracks().forEach(track => {
                pc.addTrack(track, localStreamRef.current!)
            })

            // Handle remote stream
            pc.ontrack = (event) => {
                console.log("Received remote track")
                if (remoteVideoRef.current && event.streams[0]) {
                    remoteVideoRef.current.srcObject = event.streams[0]
                    setConnectionStatus('connected')
                }
            }

            // Handle ICE candidates
            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    sendSignalingMessage({
                        type: 'candidate',
                        candidate: event.candidate
                    })
                }
            }

            pc.onconnectionstatechange = () => {
                console.log("Connection State:", pc.connectionState)
                if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
                    setConnectionStatus('disconnected')
                }
            }

            // If we are the initiator (simple logic: random or role based, 
            // for simplicity let's assume if we connect and nobody is there we wait, 
            // if we receive an offer we answer. 
            // But to trigger it, let's just send 'join' and if we get 'user-joined', we offer.)

            // Actually, for a simple 2-person call:
            // Let's send a "ready" signal. The other side receives it and initiates offer if they are already there.
            // Simplified: Just make an offer after a short delay or manual trigger? 
            // Best practice: "Polite Peer" pattern or User A always calls.
            // Let's make "Caller" create offer. 

            // For this implementation, let's assume whoever joins 2nd sends the offer?
            // Or simpler: We just blindly create an offer if we don't receive one in 1 second?

            // Revert to "Initiator" logic:
            // Send "join". If we receive "user-joined" (meaning someone else joined after us), WE create offer.
            // If we receive "offer" (someone was already there), we answer.

            // BUT: connectionManager broadcasts to OTHERS.
            // So if I join, other person gets 'user-joined'. They should Create Offer.
            // If I am alone, I get nothing.
            // If someone joins later, I get 'user-joined'. I create offer.

            // Wait for 'user-joined' event via WS (needs backend update to send it, currently it broadcasts raw text).
            // Backend sends: json.dumps({"type": "user-joined", "userId": user_id}) (commented out in backend plan, I should uncomment it? 
            // Wait, backend router code I wrote DOES NOT send join confirmation. I rely on "onopen" for now.

            // Strategy: Send "join" message manually upon open.
            sendSignalingMessage({ type: 'join' })

        } catch (err) {
            console.error("Error creating peer connection:", err)
        }
    }

    const handleSignalingMessage = async (event: MessageEvent) => {
        const message = JSON.parse(event.data)
        const pc = peerConnectionRef.current

        if (!pc) return

        try {
            switch (message.type) {
                case 'join':
                    // Someone else joined, so I will initiate the call
                    console.log('Peer joined, creating offer...')
                    const offer = await pc.createOffer()
                    await pc.setLocalDescription(offer)
                    sendSignalingMessage({ type: 'offer', sdp: offer })
                    break

                case 'offer':
                    console.log('Received offer, creating answer...')
                    await pc.setRemoteDescription(new RTCSessionDescription(message.sdp))
                    const answer = await pc.createAnswer()
                    await pc.setLocalDescription(answer)
                    sendSignalingMessage({ type: 'answer', sdp: answer })
                    break

                case 'answer':
                    console.log('Received answer')
                    await pc.setRemoteDescription(new RTCSessionDescription(message.sdp))
                    break

                case 'candidate':
                    if (message.candidate) {
                        await pc.addIceCandidate(new RTCIceCandidate(message.candidate))
                    }
                    break

                case 'user-left':
                    setConnectionStatus('disconnected')
                    alert("The other party has left the call.")
                    break
            }
        } catch (err) {
            console.error("Signaling Error:", err)
        }
    }

    const sendSignalingMessage = (message: any) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify(message))
        }
    }

    const toggleMute = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled
            })
            setIsMuted(!isMuted)
        }
    }

    const toggleVideo = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getVideoTracks().forEach(track => {
                track.enabled = !track.enabled
            })
            setIsVideoOff(!isVideoOff)
        }
    }

    const handleEndCall = () => {
        if (window.confirm('Are you sure you want to end the call?')) {
            cleanup()
            navigate(-1)
        }
    }

    return (
        <div className="h-screen bg-gray-900 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-gray-800 px-6 py-4 flex justify-between items-center shadow-md z-10">
                <div className="flex items-center gap-4">
                    <div className="bg-blue-600 p-2 rounded-lg">
                        <Video className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-white font-semibold text-lg">Consultation #{appointmentId?.slice(0, 8)}</h2>
                        <p className="text-gray-400 text-sm flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' :
                                    connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
                                }`}></span>
                            {connectionStatus === 'connected' ? 'Connected' : connectionStatus === 'connecting' ? 'Waiting for peer...' : 'Disconnected'} • {currentTime.toLocaleTimeString()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="bg-red-600 text-white p-3 text-center">
                    {error}
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex relative">
                {/* Video Grid */}
                <div className={`flex-1 p-4 grid gap-4 ${showChat ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>

                    {/* Remote Participant */}
                    <div className="relative bg-gray-800 rounded-2xl overflow-hidden shadow-lg border border-gray-700 aspect-video md:aspect-auto">
                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                        />
                        {connectionStatus !== 'connected' && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                                    <p className="text-gray-400">Waiting for other party...</p>
                                </div>
                            </div>
                        )}
                        <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-lg backdrop-blur-sm">
                            <p className="text-white text-sm font-medium">Remote Peer</p>
                        </div>
                    </div>

                    {/* Local Participant */}
                    <div className="relative bg-gray-800 rounded-2xl overflow-hidden shadow-lg border border-gray-700 aspect-video md:aspect-auto">
                        <video
                            ref={localVideoRef}
                            autoPlay
                            playsInline
                            muted
                            className={`w-full h-full object-cover transform scale-x-[-1] ${isVideoOff ? 'hidden' : ''}`}
                        />
                        {isVideoOff && (
                            <div className="w-full h-full flex items-center justify-center bg-gray-700">
                                <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                                    ME
                                </div>
                            </div>
                        )}
                        <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-lg backdrop-blur-sm">
                            <p className="text-white text-sm font-medium">You</p>
                        </div>
                        <div className="absolute top-4 right-4 bg-black/50 p-2 rounded-full backdrop-blur-sm">
                            {isMuted ? <MicOff className="w-4 h-4 text-red-500" /> : <Mic className="w-4 h-4 text-white" />}
                        </div>
                    </div>
                </div>

                {/* Chat Sidebar (Mock Only for now) */}
                {showChat && (
                    <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col hidden md:flex">
                        <div className="p-4 border-b border-gray-700">
                            <h3 className="text-white font-semibold">Chat</h3>
                        </div>
                        <div className="flex-1 p-4 flex items-center justify-center text-gray-500">
                            Chat feature coming soon...
                        </div>
                    </div>
                )}
            </div>

            {/* Controls Bar */}
            <div className="bg-gray-800 px-6 py-4 flex justify-center items-center gap-6 shadow-lg border-t border-gray-700">
                <button
                    onClick={toggleMute}
                    className={`p-4 rounded-full transition-all ${isMuted ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                >
                    {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>

                <button
                    onClick={toggleVideo}
                    className={`p-4 rounded-full transition-all ${isVideoOff ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                >
                    {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                </button>

                <button
                    onClick={handleEndCall}
                    className="p-4 bg-red-600 rounded-full text-white hover:bg-red-700 transition-all shadow-lg hover:shadow-red-900/20 px-8"
                >
                    <PhoneOff className="w-8 h-8" />
                </button>

                <button
                    onClick={() => setShowChat(!showChat)}
                    className={`p-4 rounded-full transition-all ${showChat ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-700 text-white hover:bg-gray-600'} hidden md:block`}
                >
                    <MessageSquare className="w-6 h-6" />
                </button>
            </div>
        </div>
    )
}
