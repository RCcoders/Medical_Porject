import { Shield, Send, Bot, User as UserIcon, Loader2, Sparkles, Globe, Database, Terminal } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { queryAgents } from '../../services/api'

interface Message {
    id: string;
    type: 'user' | 'agent';
    content: string;
    timestamp: Date;
    status: 'sending' | 'sent' | 'error';
}

export function ResearchLab() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            type: 'agent',
            content: "Neural link established. Ready for pharmaceutical research analysis. What is your query?",
            timestamp: new Date(),
            status: 'sent'
        }
    ])
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, isTyping])

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || isTyping) return

        const userMessage: Message = {
            id: Date.now().toString(),
            type: 'user',
            content: input,
            timestamp: new Date(),
            status: 'sent'
        }

        setMessages(prev => [...prev, userMessage])
        setInput('')
        setIsTyping(true)

        try {
            const data = await queryAgents(input)
            const agentMessage: Message = {
                id: (Date.now() + 1).toString(),
                type: 'agent',
                content: data.response,
                timestamp: new Date(),
                status: 'sent'
            }
            setMessages(prev => [...prev, agentMessage])
        } catch (err) {
            console.error('Agent query failed:', err)
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                type: 'agent',
                content: "Error: Failed to communicate with research agents. Please check connection.",
                timestamp: new Date(),
                status: 'error'
            }
            setMessages(prev => [...prev, errorMessage])
        } finally {
            setIsTyping(false)
        }
    }

    return (
        <div className="flex h-[calc(100vh-8rem)] gap-6 p-6">
            {/* Left Sidebar - Terminal Style Metrics */}
            <div className="w-80 flex flex-col gap-4">
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 font-mono text-xs space-y-4 shadow-2xl backdrop-blur-md">
                    <div className="flex items-center gap-2 text-emerald-400">
                        <Terminal className="w-4 h-4" />
                        <span className="font-bold">SYSTEM_LOG</span>
                    </div>
                    <div className="space-y-1.5 text-slate-400">
                        <p className="flex justify-between"><span>[STATUS]</span> <span className="text-emerald-500">READY</span></p>
                        <p className="flex justify-between"><span>[CORE]</span> <span className="text-blue-500">PHARMA_v4</span></p>
                        <p className="flex justify-between"><span>[NET]</span> <span className="text-purple-500">SECURE</span></p>
                        <p className="flex justify-between"><span>[DATABASE]</span> <span className="text-amber-500">CONNECTED</span></p>
                    </div>
                    <div className="pt-2 border-t border-slate-800">
                        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 w-3/4 animate-pulse"></div>
                        </div>
                        <p className="mt-2 text-[10px] text-slate-500">NEURAL_LOAD: 72%</p>
                    </div>
                </div>

                <div className="flex-1 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-2xl backdrop-blur-md">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Quick Analysis</h3>
                    <div className="space-y-3">
                        {['Metformin Repurposing', 'Alzheimer\'s Pipeline', 'FDA Compliance'].map((item) => (
                            <button key={item}
                                onClick={() => setInput(item)}
                                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-left text-sm text-slate-300 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all group">
                                <span className="group-hover:text-purple-400">{item}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-slate-900/50 border border-slate-800 rounded-3xl shadow-2xl relative overflow-hidden backdrop-blur-sm">
                {/* Chat Header */}
                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                                <Bot className="w-6 h-6 text-white" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full"></div>
                        </div>
                        <div>
                            <h2 className="text-white font-bold tracking-tight">AI Research Agent</h2>
                            <p className="text-xs text-slate-400 flex items-center gap-1">
                                <Shield className="w-3 h-3 text-blue-400" />
                                ENCRYPTED_AES256_LINK
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-500">
                            LATENCY: 24ms
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
                    {messages.map((message) => (
                        <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex gap-4 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg ${message.type === 'user' ? 'bg-blue-600' : 'bg-purple-600'
                                    }`}>
                                    {message.type === 'user' ? <UserIcon className="w-5 h-5 text-white" /> : <Sparkles className="w-5 h-5 text-white" />}
                                </div>
                                <div className={`p-4 rounded-2xl ${message.type === 'user'
                                    ? 'bg-blue-600 text-white rounded-tr-none shadow-blue-500/10'
                                    : 'bg-slate-800/80 text-slate-100 rounded-tl-none border border-slate-700 shadow-xl'
                                    }`}>
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                                    <span className="text-[10px] opacity-50 mt-2 block font-mono">
                                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        {message.status === 'error' && <span className="text-red-400 ml-2">ERROR</span>}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="flex gap-4">
                                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center animate-pulse">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <div className="bg-slate-800/80 p-4 rounded-2xl rounded-tl-none border border-slate-700 shadow-xl flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                                    <span className="text-sm text-slate-400 font-mono italic">THINKING...</span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-6 bg-slate-900/80 border-t border-slate-800">
                    <form onSubmit={handleSendMessage} className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-2xl blur-xl group-focus-within:opacity-100 opacity-0 transition-opacity"></div>
                        <div className="relative flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-2xl p-2 focus-within:border-purple-500/50 transition-all shadow-inner">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Consult research agent..."
                                className="flex-1 bg-transparent border-none text-white pl-4 py-2 focus:ring-0 placeholder-slate-600 text-sm"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isTyping}
                                className="bg-gradient-to-tr from-purple-600 to-blue-600 text-white p-2.5 rounded-xl hover:shadow-lg hover:shadow-purple-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </form>
                    <div className="mt-4 flex items-center justify-center gap-6 text-[10px] uppercase tracking-[0.2em] font-bold text-slate-600">
                        <span className="flex items-center gap-1.5"><Globe className="w-3 h-3 text-purple-500" /> GLOBAL_DATA_INDEX</span>
                        <span className="flex items-center gap-1.5"><Database className="w-3 h-3 text-blue-500" /> VIRTUAL_KNOWLEDGE_BASE</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
