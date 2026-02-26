import React, { useState, useRef, useEffect } from 'react'
import { Bot, X, Send, Loader2, User, Maximize2, Minimize2, Stethoscope, FlaskConical } from 'lucide-react'
import { agentService } from '../../services/agentService'

interface Message {
    id: string
    role: 'user' | 'agent'
    content: string
    timestamp: Date
}

interface FloatingChatWidgetProps {
    mode?: 'patient' | 'doctor' | 'researcher'
}

// Converts **bold** and newlines into formatted JSX
function renderMessage(text: string) {
    return text.split('\n').map((line, i) => {
        const parts = line.split(/\*\*(.*?)\*\*/g)
        return (
            <span key={i}>
                {parts.map((part, j) =>
                    j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                )}
                <br />
            </span>
        )
    })
}

function getConfig(mode: 'patient' | 'doctor' | 'researcher') {
    switch (mode) {
        case 'doctor':
            return {
                icon: <Stethoscope className="h-5 w-5" />,
                fabIcon: <Stethoscope className="h-7 w-7" />,
                avatarIcon: <Stethoscope className="h-4 w-4 text-white" />,
                avatarBg: 'bg-blue-900',
                headerBg: 'bg-gradient-to-r from-blue-700 to-blue-900',
                fabBg: 'bg-gradient-to-br from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900',
                label: 'Clinical AI',
                labelColor: 'text-blue-700 bg-blue-50 border-blue-200',
                title: 'Clinical AI Assistant',
                placeholder: 'Ask a clinical question...',
                greeting: '👨‍⚕️ Hello Sir/Madam! I\'m your Clinical AI Assistant. I can help with diagnoses, drug dosages, red flags, clinical guidelines, and OPD triage. Try asking about "fever red flag", "nsaid contraindication", "sepsis", "centor" and more. How can I assist you today?',
                pingColor: 'bg-green-400',
            }
        case 'researcher':
            return {
                icon: <FlaskConical className="h-5 w-5" />,
                fabIcon: <FlaskConical className="h-7 w-7" />,
                avatarIcon: <FlaskConical className="h-4 w-4 text-white" />,
                avatarBg: 'bg-purple-900',
                headerBg: 'bg-gradient-to-r from-purple-700 to-indigo-900',
                fabBg: 'bg-gradient-to-br from-purple-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900',
                label: 'Research AI',
                labelColor: 'text-purple-300 bg-purple-900/60 border-purple-700',
                title: 'Research AI Assistant',
                placeholder: 'Ask a research question...',
                greeting: '🔬 Hello Sir/Madam! I\'m your Research AI Assistant. I can help with study design, bias, outcomes, drug safety research, and data analysis. Try asking about "cohort vs case control", "missing data research", "urti outcomes" and more. How can I help you today?',
                pingColor: 'bg-purple-400',
            }
        default:
            return {
                icon: <Bot className="h-5 w-5" />,
                fabIcon: <Bot className="h-8 w-8" />,
                avatarIcon: <Bot className="h-4 w-4 text-blue-600" />,
                avatarBg: 'bg-blue-100',
                headerBg: 'bg-blue-600',
                fabBg: 'bg-blue-600 hover:bg-blue-700',
                label: '',
                labelColor: '',
                title: 'Medical Assistant',
                placeholder: 'Ask a medical question...',
                greeting: '👋 Hello Sir/Madam! I\'m your Medical AI Assistant. How can I help you today? You can describe your symptoms, ask about a medical condition, or seek health guidance. For example, try asking about "fever", "chest pain", "diabetes", or any health concern you have.',
                pingColor: 'bg-green-400',
            }
    }
}

export function FloatingChatWidget({ mode = 'patient' }: FloatingChatWidgetProps) {
    const cfg = getConfig(mode)
    const [isOpen, setIsOpen] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false)

    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'agent',
            content: cfg.greeting,
            timestamp: new Date()
        }
    ])
    const [input, setInput] = useState('')
    const [isThinking, setIsThinking] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        if (isOpen) scrollToBottom()
    }, [messages, isOpen])

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim()) return

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date()
        }
        setMessages(prev => [...prev, userMsg])
        setInput('')
        setIsThinking(true)

        try {
            const response = await agentService.query(userMsg.content, mode)
            const agentMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'agent',
                content: response,
                timestamp: new Date()
            }
            setMessages(prev => [...prev, agentMsg])
        } catch {
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'agent',
                content: "I'm sorry, I encountered an error processing your request. Please try again later.",
                timestamp: new Date()
            }
            setMessages(prev => [...prev, errorMsg])
        } finally {
            setIsThinking(false)
        }
    }

    return (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div
                    className={`bg-white rounded-2xl shadow-2xl border border-gray-200 mb-4 flex flex-col transition-all duration-300 ease-in-out overflow-hidden
                    ${isExpanded
                            ? 'w-[calc(100vw-2rem)] sm:w-[800px] h-[80vh] sm:h-[600px]'
                            : 'w-[calc(100vw-2rem)] sm:w-[400px] h-[75vh] sm:h-[500px]'
                        }`}
                >
                    {/* Header */}
                    <div className={`${cfg.headerBg} p-4 flex items-center justify-between text-white shrink-0`}>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                {cfg.icon}
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm">{cfg.title}</h3>
                                <div className="flex items-center gap-1.5">
                                    <span className={`w-2 h-2 rounded-full ${cfg.pingColor} animate-pulse`} />
                                    <span className="text-xs text-white/70">Online</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                                title={isExpanded ? "Minimize" : "Maximize"}
                            >
                                {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messages.map(msg => (
                            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm
                                ${msg.role === 'agent' ? cfg.avatarBg : 'bg-gray-200'}`}>
                                    {msg.role === 'agent' ? cfg.avatarIcon : <User className="h-4 w-4 text-gray-600" />}
                                </div>
                                <div className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div className={`p-3 rounded-2xl text-sm shadow-sm
                                    ${msg.role === 'user'
                                            ? 'bg-blue-600 text-white rounded-tr-none'
                                            : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'}`}>
                                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                            {msg.role === 'agent' ? renderMessage(msg.content) : msg.content}
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-gray-400 mt-1 mx-1">
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {isThinking && (
                            <div className="flex gap-3">
                                <div className={`w-8 h-8 rounded-full ${cfg.avatarBg} flex items-center justify-center shrink-0`}>
                                    {cfg.avatarIcon}
                                </div>
                                <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-200 shadow-sm">
                                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                        Analyzing...
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 bg-white border-t border-gray-200 shrink-0">
                        <form onSubmit={handleSend} className="relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={cfg.placeholder}
                                className="w-full bg-gray-100 text-gray-900 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                disabled={isThinking}
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isThinking}
                                className="absolute right-2 top-2 p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send className="h-4 w-4" />
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Toggle FAB Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                title={cfg.title}
                className={`relative w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 text-white
                    ${isOpen ? 'bg-gray-200' : cfg.fabBg}`}
            >
                {isOpen ? (
                    <X className="h-6 w-6 text-gray-600" />
                ) : (
                    <>
                        {cfg.fabIcon}
                        <span className="absolute -top-1 -right-1">
                            <span className="relative flex h-3 w-3">
                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${cfg.pingColor} opacity-75`} />
                                <span className={`relative inline-flex rounded-full h-3 w-3 ${cfg.pingColor}`} />
                            </span>
                        </span>
                    </>
                )}
            </button>

            {/* Tooltip label when closed */}
            {!isOpen && cfg.label && (
                <span className={`mt-1 text-[10px] font-semibold border rounded-full px-2 py-0.5 shadow-sm ${cfg.labelColor}`}>
                    {cfg.label}
                </span>
            )}
        </div>
    )
}
