import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, Users, Settings, Share2 } from 'lucide-react'

export function VideoCall() {
    const { appointmentId } = useParams()
    const navigate = useNavigate()
    const [isMuted, setIsMuted] = useState(false)
    const [isVideoOff, setIsVideoOff] = useState(false)
    const [showChat, setShowChat] = useState(false)
    const [currentTime, setCurrentTime] = useState(new Date())

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    const handleEndCall = () => {
        if (window.confirm('Are you sure you want to end the call?')) {
            navigate(-1) // Go back to previous page
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
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            Connected • {currentTime.toLocaleTimeString()}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors">
                        <Users className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors">
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex relative">
                {/* Video Grid */}
                <div className={`flex-1 p-4 grid gap-4 ${showChat ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>

                    {/* Remote Participant (Doctor/Patient) */}
                    <div className="relative bg-gray-800 rounded-2xl overflow-hidden shadow-lg border border-gray-700">
                        <img
                            src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
                            alt="Remote Participant"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-lg backdrop-blur-sm">
                            <p className="text-white text-sm font-medium">Dr. Sarah Wilson</p>
                        </div>
                        <div className="absolute top-4 right-4 bg-black/50 p-2 rounded-full backdrop-blur-sm">
                            <Mic className="w-4 h-4 text-white" />
                        </div>
                    </div>

                    {/* Local Participant (You) */}
                    <div className="relative bg-gray-800 rounded-2xl overflow-hidden shadow-lg border border-gray-700">
                        {isVideoOff ? (
                            <div className="w-full h-full flex items-center justify-center bg-gray-700">
                                <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                                    ME
                                </div>
                            </div>
                        ) : (
                            <img
                                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
                                alt="Local Participant"
                                className="w-full h-full object-cover transform scale-x-[-1]"
                            />
                        )}
                        <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-lg backdrop-blur-sm">
                            <p className="text-white text-sm font-medium">You</p>
                        </div>
                        <div className="absolute top-4 right-4 bg-black/50 p-2 rounded-full backdrop-blur-sm">
                            {isMuted ? <MicOff className="w-4 h-4 text-red-500" /> : <Mic className="w-4 h-4 text-white" />}
                        </div>
                    </div>
                </div>

                {/* Chat Sidebar */}
                {showChat && (
                    <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
                        <div className="p-4 border-b border-gray-700">
                            <h3 className="text-white font-semibold">Chat</h3>
                        </div>
                        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                            <div className="bg-gray-700 p-3 rounded-lg rounded-tl-none self-start max-w-[85%]">
                                <p className="text-gray-300 text-sm">Hello! How are you feeling today?</p>
                                <span className="text-xs text-gray-500 mt-1 block">10:00 AM</span>
                            </div>
                            <div className="bg-blue-600 p-3 rounded-lg rounded-tr-none self-end max-w-[85%] ml-auto">
                                <p className="text-white text-sm">I'm doing better, thanks doctor.</p>
                                <span className="text-xs text-blue-200 mt-1 block">10:01 AM</span>
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-700">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    className="flex-1 bg-gray-700 border-none rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                                />
                                <button className="p-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition-colors">
                                    <Share2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Controls Bar */}
            <div className="bg-gray-800 px-6 py-4 flex justify-center items-center gap-6 shadow-lg border-t border-gray-700">
                <button
                    onClick={() => setIsMuted(!isMuted)}
                    className={`p-4 rounded-full transition-all ${isMuted ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                >
                    {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>

                <button
                    onClick={() => setIsVideoOff(!isVideoOff)}
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
                    className={`p-4 rounded-full transition-all ${showChat ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                >
                    <MessageSquare className="w-6 h-6" />
                </button>
            </div>
        </div>
    )
}
