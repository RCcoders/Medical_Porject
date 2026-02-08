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
        question: "What is the guideline-recommended first-line therapy for HFrEF in 2024?",
        answer: "Foundational quadruple therapy: ARNI (or ACEi/ARB), beta-blocker, MRA, and SGLT2 inhibitor, initiated early at low doses and uptitrated as tolerated (ACC/AHA/ESC guidance)."
    },
    {
        question: "Can I prescribe an SGLT2 inhibitor in a non-diabetic heart failure patient?",
        answer: "Yes. Dapagliflozin and empagliflozin reduce HF hospitalization and mortality in HFrEF and HFpEF independent of diabetes status."
    },
    {
        question: "What antihypertensive is preferred in a patient with CAD and LV dysfunction?",
        answer: "Beta-blockers and ACE inhibitors/ARNI are preferred due to mortality benefit; add CCBs cautiously if angina persists (avoid non-DHP CCBs in HFrEF)."
    },
    {
        question: "How should statin intensity be selected in secondary prevention?",
        answer: "Use high-intensity statins (atorvastatin 40–80 mg or rosuvastatin 20–40 mg) aiming for ≥50% LDL-C reduction; add ezetimibe/PCSK9 if targets aren’t met."
    },
    {
        question: "What anticoagulant is preferred in atrial fibrillation with normal renal function?",
        answer: "DOACs (apixaban, rivaroxaban, dabigatran, edoxaban) are preferred over warfarin unless contraindicated (e.g., mechanical valves)."
    },
    {
        question: "How should I adjust HF medications in CKD stage 3?",
        answer: "Start low, titrate slowly; monitor potassium and eGFR closely. SGLT2 inhibitors are generally safe down to guideline-specified eGFR thresholds."
    },
    {
        question: "What drug interactions should I watch for with amiodarone?",
        answer: "Increased levels of warfarin, digoxin, and statins (especially simvastatin); monitor INR, digoxin levels, and consider statin dose limits."
    },
    {
        question: "When is ivabradine indicated in heart failure?",
        answer: "In sinus rhythm, LVEF ≤35%, HR ≥70 bpm despite maximally tolerated beta-blocker, to reduce HF hospitalizations."
    },
    {
        question: "Which biomarkers are most useful for HF prognosis today?",
        answer: "NT-proBNP/BNP for diagnosis and prognosis; hs-troponin for risk stratification; consider ST2 and galectin-3 as adjuncts."
    },
    {
        question: "When should coronary CT angiography be preferred over stress testing?",
        answer: "In low–intermediate risk chest pain with unclear diagnosis; CCTA provides high negative predictive value for CAD."
    },
    {
        question: "How can AI assist in ECG interpretation for arrhythmias?",
        answer: "AI can detect subtle AF, VT risk, LV dysfunction patterns, and reduce interpretation variability—used as decision support, not replacement."
    },
    {
        question: "What’s new in interventional cardiology for complex CAD?",
        answer: "Advances include IVUS/OCT-guided PCI, drug-coated balloons, physiology-guided revascularization (FFR/iFR), and improved CTO techniques."
    },
    {
        question: "What are current indications for TAVR over SAVR?",
        answer: "TAVR is preferred in older patients and those with intermediate to high surgical risk; expanding use in selected low-risk patients."
    },
    {
        question: "Are there newer lipid-lowering therapies beyond PCSK9 inhibitors?",
        answer: "Yes—inclisiran (siRNA) provides durable LDL-C reduction with twice-yearly dosing after loading."
    },
    {
        question: "What’s the role of renal denervation in resistant hypertension?",
        answer: "Emerging evidence supports modest BP reduction in carefully selected patients; availability and guideline adoption vary."
    },
    {
        question: "How is AI used in echocardiography today?",
        answer: "AI automates EF measurement, strain analysis,, chamber quantification, improving speed and reproducibility."
    },
    {
        question: "What’s new in HFpEF management?",
        answer: "SGLT2 inhibitors now show benefit; focus on comorbidity management, diuretics for congestion, and phenotype-guided therapy."
    },
    {
        question: "Can AI recommend exact drug doses for my patient?",
        answer: "AI can suggest guideline-based ranges, but final dosing must consider patient-specific factors and clinician judgment."
    },
    {
        question: "How reliable is AI for clinical decision-making?",
        answer: "AI is best used as clinical decision support, augmenting—not replacing—expert judgment and guidelines."
    },
    {
        question: "How should AI outputs be documented in clinical practice?",
        answer: "Document AI as a supporting tool, note clinician validation, and reference guidelines and patient context."
    }
]

export function DoctorAI() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'agent',
            content: 'I am your Clinical Decision Support Assistant. I can help with guidelines, drug interactions, and latest research. How can I assist you today?',
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
                content: "System Error: Unable to reach clinical agent swarm. Please verify backend connection.",
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
        <div className="flex h-full bg-slate-50">
            {/* Chat Interface (Left) */}
            <div className="w-[450px] border-r border-slate-200 flex flex-col bg-white relative">

                <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 relative z-10">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-slate-100
                        ${msg.role === 'agent' ? 'bg-blue-50' : 'bg-slate-100'}`}>
                                {msg.role === 'agent' ? <Bot className="h-5 w-5 text-blue-600" /> : <User className="h-5 w-5 text-slate-500" />}
                            </div>
                            <div className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm
                            ${msg.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-tr-none'
                                        : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'}`}>
                                    <div className="markdown-prose whitespace-pre-wrap">
                                        {msg.content}
                                    </div>
                                </div>
                                <span className="text-[10px] text-slate-400 mt-1 ml-1">
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    ))}

                    {/* Live Thinking Indicator */}
                    {isThinking && (
                        <div className="flex gap-3 animate-pulse">
                            <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                                <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                            </div>
                            <div className="space-y-2 bg-white p-3 rounded-lg border border-blue-100 max-w-[80%]">
                                <div className="text-xs text-blue-600 font-mono flex items-center gap-2">
                                    <Bot className="h-3 w-3" />
                                    <span className="font-bold">System:</span>
                                    Analyzing Clinical Data...
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t border-slate-200 bg-white relative z-20">
                    {/* Sample Questions */}
                    <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-none">
                        {SAMPLE_QUESTIONS.map((q, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSampleClick(q.question, q.answer)}
                                className="whitespace-nowrap px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all"
                            >
                                {q.question}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSend} className="relative group">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about guidelines, interactions, or diagnosis..."
                            className="relative w-full bg-slate-50 text-slate-900 rounded-xl pl-4 pr-12 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 placeholder-slate-400 border border-slate-200"
                            disabled={isThinking}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isThinking}
                            className="absolute right-2 top-2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                            <Send className="h-4 w-4" />
                        </button>
                    </form>
                </div>
            </div>

            {/* Insight Workspace (Right) - Static Placeholder */}
            <div className="flex-1 bg-slate-50 p-8 overflow-y-auto relative">
                <div className="h-full flex flex-col items-center justify-center text-slate-400 relative z-10">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 border border-slate-200 shadow-sm">
                        <Bot className="h-10 w-10 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-600 mb-2">Clinical Decision Support</h3>
                    <p className="max-w-md text-center text-sm">
                        AI-powered insights for evidence-based medicine.
                        <br />
                        Always verify with clinical judgment.
                    </p>
                </div>
            </div>
        </div>
    )
}
