import { useState, useEffect, useRef } from 'react'
import { Send, Bot, User, Loader2 } from 'lucide-react'
import { agentService } from '../../services/agentService'

interface Message {
    id: string
    role: 'user' | 'agent'
    content: string
    timestamp: Date
}

const SAMPLE_QUESTIONS = [
    {
        question: "How does target validation reduce drug discovery risk?",
        answer: "Target validation confirms that modulating a biological target produces a therapeutic effect without unacceptable toxicity. It reduces late-stage failure by ensuring disease relevance before costly development."
    },
    {
        question: "What are the key differences between small molecules and biologics?",
        answer: "Small molecules are chemically synthesized, orally bioavailable, and can cross cell membranes, while biologics are larger, protein-based, require injection, and have high target specificity but complex manufacturing."
    },
    {
        question: "How does structure-based drug design work?",
        answer: "It uses 3D structural data of biological targets to design molecules that fit precisely into binding sites, improving potency and selectivity through computational modeling."
    },
    {
        question: "What role does ADMET profiling play in early drug development?",
        answer: "ADMET profiling predicts absorption, distribution, metabolism, excretion, and toxicity to identify candidates likely to fail due to poor pharmacokinetics or safety issues."
    },
    {
        question: "Why are prodrugs developed?",
        answer: "Prodrugs improve bioavailability, stability, or targeting by converting into the active drug inside the body, overcoming formulation or permeability challenges."
    },
    {
        question: "What is the importance of in vitro assays before animal studies?",
        answer: "In vitro assays screen toxicity, potency, and mechanism of action efficiently, reducing animal use and identifying unsafe compounds early."
    },
    {
        question: "How does PK/PD modeling guide dose selection?",
        answer: "PK/PD models relate drug concentration to biological effect, enabling prediction of effective and safe dosing regimens."
    },
    {
        question: "What is off-target toxicity and how is it identified?",
        answer: "Off-target toxicity occurs when a drug interacts with unintended proteins. It’s identified using in silico screening, in vitro panels, and safety pharmacology studies."
    },
    {
        question: "Why are animal disease models imperfect predictors of human response?",
        answer: "Species differences in metabolism, genetics, and disease pathways limit direct translation, leading to efficacy or safety mismatches in humans."
    },
    {
        question: "What is the significance of NOAEL in toxicology studies?",
        answer: "NOAEL (No Observed Adverse Effect Level) defines the highest dose without harmful effects and guides safe starting doses in human trials."
    },
    {
        question: "How does Phase I differ from Phase II clinical trials?",
        answer: "Phase I focuses on safety and pharmacokinetics in healthy volunteers, while Phase II evaluates efficacy and dose optimization in patients."
    },
    {
        question: "Why are biomarkers important in clinical trials?",
        answer: "Biomarkers enable patient stratification, monitor drug response, and improve trial efficiency by identifying responders early."
    },
    {
        question: "What causes high attrition rates in Phase III trials?",
        answer: "Insufficient efficacy, unforeseen safety issues, and suboptimal trial design are common causes of late-stage failure."
    },
    {
        question: "How does adaptive trial design improve success rates?",
        answer: "Adaptive designs allow protocol modifications based on interim data, improving efficiency, reducing cost, and increasing the probability of success."
    },
    {
        question: "What is the role of real-world evidence in drug development?",
        answer: "Real-world evidence complements trial data by providing insights into long-term safety, effectiveness, and population-level outcomes."
    },
    {
        question: "What is the purpose of IND submission?",
        answer: "An Investigational New Drug (IND) application allows initiation of human trials by demonstrating sufficient preclinical safety and manufacturing quality."
    },
    {
        question: "How does AI assist in pharmacovigilance?",
        answer: "AI analyzes adverse event reports, social media, and EHR data to detect safety signals faster and with higher sensitivity than manual methods."
    },
    {
        question: "Why is data integrity critical in pharmaceutical research?",
        answer: "Data integrity ensures regulatory compliance, reproducibility, and trust in trial outcomes, preventing costly delays or rejections."
    },
    {
        question: "How can AI reduce drug development timelines?",
        answer: "AI accelerates target discovery, predicts toxicity, optimizes trial design, and automates data analysis, significantly reducing time and cost."
    },
    {
        question: "What ethical considerations arise when using AI in pharma research?",
        answer: "Bias mitigation, data privacy, transparency, and explainability are critical to ensure patient safety and regulatory acceptance."
    }
]

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

        try {
            // Add minimum delay of 2 seconds
            const [response] = await Promise.all([
                agentService.query(userMsg.content),
                new Promise(resolve => setTimeout(resolve, 2000))
            ])

            const agentMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'agent',
                content: response,
                timestamp: new Date()
            }
            setMessages(prev => [...prev, agentMsg])
        } catch (error) {
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'agent',
                content: "System Error: Unable to reach agent swarm. Please verify backend connection.",
                timestamp: new Date()
            }
            setMessages(prev => [...prev, errorMsg])
        } finally {
            setIsThinking(false)
        }
    }

    const handleSampleClick = async (question: string, answer: string) => {
        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: question,
            timestamp: new Date()
        }
        setMessages(prev => [...prev, userMsg])
        setIsThinking(true)

        // Simulate thinking delay for samples
        await new Promise(resolve => setTimeout(resolve, 1500))

        const agentMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: 'agent',
            content: answer,
            timestamp: new Date()
        }

        setMessages(prev => [...prev, agentMsg])
        setIsThinking(false)
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
                    {/* Sample Questions */}
                    <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-none">
                        {SAMPLE_QUESTIONS.map((q, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSampleClick(q.question, q.answer)}
                                className="whitespace-nowrap px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-400 hover:bg-purple-600/20 hover:text-purple-300 hover:border-purple-500/30 transition-all"
                            >
                                {q.question}
                            </button>
                        ))}
                    </div>

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
