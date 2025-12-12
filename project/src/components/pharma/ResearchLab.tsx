import { useState, useEffect, useRef } from 'react'
import { Send, Bot, User, Loader2 } from 'lucide-react'

interface Message {
    id: string
    role: 'user' | 'agent'
    content: string
    timestamp: Date
}

export function ResearchLab() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'agent',
            content: 'I am the AIPIP Research Assistant. I am ready to connect to your backend agent swarm. How can I assist your drug repurposing research today?',
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
        scrollToBottom()
    }, [messages])

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

        // Placeholder for Real Backend Integration
        // TODO: Connect this to your actual Python/Node.js Agent Swarm
        setTimeout(() => {
            const agentMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'agent',
                content: "This is a placeholder response. To enable real-time agentic research, please connect the `ResearchLab` component to your backend service endpoints.",
                timestamp: new Date()
            }
            setIsThinking(false)
            setMessages(prev => [...prev, agentMsg])
        }, 1500)
    }

    return (
        <div className="flex h-full bg-slate-950">
            {/* Chat Interface (Left) */}
            <div className="w-[450px] border-r border-slate-800 flex flex-col bg-slate-900/50 backdrop-blur relative">
                {/* Agent Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-purple-900/5 to-transparent pointer-events-none" />

                <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-700 relative z-10">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-lg border border-white/10
                        ${msg.role === 'agent' ? 'bg-slate-800' : 'bg-slate-700'}`}>
                                {msg.role === 'agent' ? <Bot className="h-5 w-5 text-purple-400" /> : <User className="h-5 w-5 text-slate-300" />}
                            </div>
                            <div className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-md backdrop-blur-sm
                            ${msg.role === 'user'
                                        ? 'bg-purple-600 text-white rounded-tr-none'
                                        : 'bg-slate-800/80 text-slate-200 border border-slate-700 rounded-tl-none'}`}>
                                    <div className="markdown-prose whitespace-pre-wrap">
                                        {msg.content}
                                    </div>
                                </div>
                                <span className="text-[10px] text-slate-600 mt-1 ml-1">
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    ))}

                    {/* Live Thinking Indicator */}
                    {isThinking && (
                        <div className="flex gap-3 animate-pulse">
                            <div className="w-8 h-8 rounded-full bg-purple-600/20 border border-purple-500/50 flex items-center justify-center shrink-0">
                                <Loader2 className="h-4 w-4 text-purple-400 animate-spin" />
                            </div>
                            <div className="space-y-2 bg-slate-800/50 p-3 rounded-lg border border-purple-500/20 max-w-[80%]">
                                <div className="text-xs text-purple-300 font-mono flex items-center gap-2">
                                    <Bot className="h-3 w-3" />
                                    <span className="font-bold">System:</span>
                                    Processing Request...
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t border-slate-800 bg-slate-900/80 backdrop-blur-md relative z-20">
                    <form onSubmit={handleSend} className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Connect to backend to start..."
                            className="relative w-full bg-slate-950 text-slate-200 rounded-xl pl-4 pr-12 py-4 text-sm focus:outline-none focus:ring-0 placeholder-slate-500 shadow-inner"
                            disabled={isThinking}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isThinking}
                            className="absolute right-2 top-2 p-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-purple-500/25"
                        >
                            <Send className="h-4 w-4" />
                        </button>
                    </form>
                </div>
            </div>

            {/* Insight Workspace (Right) - Static Placeholder */}
            <div className="flex-1 bg-slate-950 p-8 overflow-y-auto relative">
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

                <div className="h-full flex flex-col items-center justify-center text-slate-500 relative z-10">
                    <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mb-6 border border-slate-800 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                        <Bot className="h-10 w-10 text-slate-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-400 mb-2">Workspace Ready</h3>
                    <p className="max-w-md text-center text-sm">Waiting for agent swarm execution results.</p>
                </div>
            </div>
        </div>
    )
}
