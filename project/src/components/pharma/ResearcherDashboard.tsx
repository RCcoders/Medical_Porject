import { Microscope, Beaker, Activity, AlertCircle, ArrowUpRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function ResearcherDashboard() {
    // const { profile } = useAuth() // Auth context available but unused
    const navigate = useNavigate()

    return (
        <div className="space-y-6 p-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Research Hub</h1>
                    <p className="text-slate-400 mt-1">Global drug development pipeline status.</p>
                </div>
                <div className="text-right">
                    <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-xs font-mono text-purple-300">
                        v2.4.0-BETA
                    </span>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-800 transition-all hover:border-purple-500/30 group">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Trials</p>
                            <h3 className="text-3xl font-bold text-white mt-2 group-hover:text-purple-400 transition-colors">14</h3>
                        </div>
                        <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                            <Microscope className="w-6 h-6 text-purple-400" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-xs">
                        <span className="text-green-400 font-medium flex items-center bg-green-400/10 px-2 py-1 rounded-lg">
                            +2 New Phase III
                        </span>
                    </div>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-800 transition-all hover:border-blue-500/30 group">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Pipeline Assets</p>
                            <h3 className="text-3xl font-bold text-white mt-2 group-hover:text-blue-400 transition-colors">42</h3>
                        </div>
                        <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                            <Beaker className="w-6 h-6 text-blue-400" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-xs">
                        <span className="text-slate-500">
                            Across 4 therapeutic areas
                        </span>
                    </div>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-800 transition-all hover:border-emerald-500/30 group cursor-pointer" onClick={() => navigate('/pharma/ai-assistant')}>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">RWE Queries</p>
                            <h3 className="text-3xl font-bold text-white mt-2 group-hover:text-emerald-400 transition-colors">156</h3>
                        </div>
                        <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                            <Activity className="w-6 h-6 text-emerald-400" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-xs">
                        <span className="text-emerald-400 font-medium flex items-center gap-1">
                            Ask AI Agent <ArrowUpRight className="w-3 h-3" />
                        </span>
                    </div>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-800 transition-all hover:border-amber-500/30 group">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Alerts</p>
                            <h3 className="text-3xl font-bold text-amber-500 mt-2">2</h3>
                        </div>
                        <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                            <AlertCircle className="w-6 h-6 text-amber-500" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-xs">
                        <span className="text-slate-500">
                            FDA submission review needed
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Quick Navigate */}
                <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800 p-6">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6">Quick Navigation</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => navigate('/pharma/clinical-trials')} className="p-4 bg-slate-800/30 hover:bg-purple-900/20 rounded-xl border border-slate-700 hover:border-purple-500/50 transition-all text-left group relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="bg-slate-900 w-10 h-10 rounded-lg flex items-center justify-center border border-slate-700 mb-3 group-hover:scale-110 group-hover:border-purple-500/50 transition-all relative z-10">
                                <Microscope className="w-5 h-5 text-purple-400" />
                            </div>
                            <h4 className="font-semibold text-white relative z-10">Clinical Trials</h4>
                            <p className="text-xs text-slate-500 mt-1 relative z-10">Manage phases</p>
                        </button>

                        <button onClick={() => navigate('/pharma/ai-assistant')} className="p-4 bg-slate-800/30 hover:bg-blue-900/20 rounded-xl border border-slate-700 hover:border-blue-500/50 transition-all text-left group relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="bg-slate-900 w-10 h-10 rounded-lg flex items-center justify-center border border-slate-700 mb-3 group-hover:scale-110 group-hover:border-blue-500/50 transition-all relative z-10">
                                <Activity className="w-5 h-5 text-blue-400" />
                            </div>
                            <h4 className="font-semibold text-white relative z-10">AI Assistant</h4>
                            <p className="text-xs text-slate-500 mt-1 relative z-10">Analyze Data</p>
                        </button>
                    </div>
                </div>

                {/* Pipeline Mini-Chart */}
                <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800 p-6 flex flex-col justify-center">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Pipeline Viz</h3>
                        <div className="flex gap-2">
                            <span className="block w-2 h-2 rounded-full bg-blue-500"></span>
                            <span className="block w-2 h-2 rounded-full bg-purple-500"></span>
                            <span className="block w-2 h-2 rounded-full bg-green-500"></span>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="relative group">
                            <div className="flex justify-between text-xs mb-2">
                                <span className="text-slate-400 font-mono">PHASE I</span>
                                <span className="font-bold text-white group-hover:text-purple-400 transition-colors">20%</span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                <div className="bg-gradient-to-r from-purple-600 to-purple-400 h-full rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]" style={{ width: '20%' }}></div>
                            </div>
                        </div>

                        <div className="relative group">
                            <div className="flex justify-between text-xs mb-2">
                                <span className="text-slate-400 font-mono">PHASE II</span>
                                <span className="font-bold text-white group-hover:text-blue-400 transition-colors">25%</span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                <div className="bg-gradient-to-r from-blue-600 to-blue-400 h-full rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: '25%' }}></div>
                            </div>
                        </div>

                        <div className="relative group">
                            <div className="flex justify-between text-xs mb-2">
                                <span className="text-slate-400 font-mono">PHASE III</span>
                                <span className="font-bold text-white group-hover:text-emerald-400 transition-colors">10%</span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                <div className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: '10%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
