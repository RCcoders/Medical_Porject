import React, { useState, useEffect, useRef } from 'react'
import { Send, Bot, User, Loader2 } from 'lucide-react'
import { agentService } from '../../services/agentService'

interface Message {
    id: string
    role: 'user' | 'agent'
    content: string
    timestamp: Date
}

export function AgentChat() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'agent',
            content: '👋 Hello Sir/Madam! I am your Medical AI Assistant. How can I help you today? Feel free to describe your symptoms, ask about a medical condition, or seek health guidance — for example, try asking about "fever", "diabetes", "chest pain", or any concern you have.',
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

        try {
            const response = await agentService.query(userMsg.content)

            const agentMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'agent',
                content: response,
                timestamp: new Date()
            }
            setMessages(prev => [...prev, agentMsg])
        } catch (error) {
            const samples = [
                'What are the symptoms of diabetes?',
                'I have a fever and sore throat',
                'What causes high blood pressure?',
                'I feel dizzy and nauseous',
                'What is asthma and how is it treated?',
            ]
            const sample = samples[Math.floor(Math.random() * samples.length)]
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'agent',
                content: `👋 Hello Sir/Madam! I'm having a little trouble finding an answer for that right now.\n\nCould you try rephrasing your question with more specific keywords?\n\n💡 *Try asking:* "${sample}"\n\nFeel free to ask a different question and I'll do my best to help!`,
                timestamp: new Date()
            }
            setMessages(prev => [...prev, errorMsg])
        } finally {
            setIsThinking(false)
        }
    }

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-50">
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {messages.map(msg => (
                    <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm
                        ${msg.role === 'agent' ? 'bg-blue-100' : 'bg-gray-200'}`}>
                            {msg.role === 'agent' ? <Bot className="h-5 w-5 text-blue-600" /> : <User className="h-5 w-5 text-gray-600" />}
                        </div>
                        <div className={`flex flex-col max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                            <div className={`p-4 rounded-2xl text-sm shadow-sm
                            ${msg.role === 'user'
                                    ? 'bg-blue-600 text-white rounded-tr-none'
                                    : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'}`}>
                                <div className="whitespace-pre-wrap">
                                    {msg.content}
                                </div>
                            </div>
                            <span className="text-xs text-gray-400 mt-1 mx-1">
                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}

                {isThinking && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                            <Bot className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-2 text-gray-500 text-sm">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Thinking...
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-gray-200">
                <form onSubmit={handleSend} className="max-w-4xl mx-auto relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask a medical question..."
                        className="w-full bg-gray-100 text-gray-900 rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
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
    )
}
