import { Search, Filter, CheckCircle2, Clock, AlertCircle, Loader2, X, Calendar, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getClinicalTrials, createClinicalTrial } from '../../services/api'

interface ClinicalTrial {
    id: string;
    title: string;
    phase: string;
    status: string;
    region?: string;
    sites?: number;
}

export function ClinicalTrials() {
    const [trials, setTrials] = useState<ClinicalTrial[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [newTrial, setNewTrial] = useState({
        title: '',
        phase: 'Phase I',
        status: 'Active',
        start_date: new Date().toISOString().split('T')[0],
        end_date: ''
    })

    const fetchTrials = async () => {
        try {
            const data = await getClinicalTrials()
            setTrials(data)
        } catch (err) {
            console.error('Failed to fetch trials:', err)
            setError('Failed to load clinical trials.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTrials()
    }, [])

    const handleCreateTrial = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        setError(null)
        try {
            await createClinicalTrial(newTrial)
            await fetchTrials()
            setIsModalOpen(false)
            setNewTrial({
                title: '',
                phase: 'Phase I',
                status: 'Active',
                start_date: new Date().toISOString().split('T')[0],
                end_date: ''
            })
        } catch (err) {
            console.error('Failed to create trial:', err)
            setError('Failed to create new clinical trial. Please check your inputs.')
        } finally {
            setSubmitting(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Recruiting': return 'text-green-400 bg-green-400/10 border-green-400/20'
            case 'Active': return 'text-blue-400 bg-blue-400/10 border-blue-400/20'
            case 'Completed': return 'text-slate-400 bg-slate-400/10 border-slate-400/20'
            case 'Terminated': return 'text-rose-400 bg-rose-400/10 border-rose-400/20'
            default: return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
        }
    }

    const filteredTrials = trials.filter(trial =>
        trial.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trial.id.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-900/50 backdrop-blur-md p-4 md:p-6 rounded-2xl border border-slate-800 relative overflow-hidden group gap-4">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent pointer-events-none" />
                <div className="relative z-10">
                    <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Clinical Trials Registry</h1>
                    <p className="text-slate-400 text-xs md:text-sm">Global trial database for repurposing opportunities</p>
                </div>
                <div className="flex gap-3 relative z-10 w-full sm:w-auto">
                    <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:text-white transition-all hover:border-slate-600 text-sm">
                        <Filter className="h-4 w-4" /> Filters
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-all font-medium shadow-[0_0_15px_rgba(147,51,234,0.3)] hover:shadow-[0_0_20px_rgba(147,51,234,0.5)] active:scale-95 text-sm"
                    >
                        <Plus className="h-4 w-4" /> New Study
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 flex items-center gap-3 animate-shake">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <span className="text-sm">{error}</span>
                </div>
            )}

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-4 border-b border-slate-800 bg-slate-950/30">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search by molecule, condition, or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 text-slate-200 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:border-purple-500/50 placeholder-slate-600 transition-all text-sm"
                        />
                    </div>
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-950 text-slate-400 text-[10px] uppercase tracking-widest font-bold">
                                <th className="p-4 border-b border-slate-800">Trial ID</th>
                                <th className="p-4 border-b border-slate-800">Study Title</th>
                                <th className="p-4 border-b border-slate-800">Phase</th>
                                <th className="p-4 border-b border-slate-800">Region</th>
                                <th className="p-4 border-b border-slate-800">Sites</th>
                                <th className="p-4 border-b border-slate-800">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {filteredTrials.length > 0 ? filteredTrials.map((trial, index) => (
                                <tr key={trial.id} className="group hover:bg-purple-500/5 transition-colors">
                                    <td className="p-4 text-slate-500 font-mono text-sm group-hover:text-purple-400 transition-colors">#{index + 1}</td>
                                    <td className="p-4 text-white font-medium group-hover:text-purple-100 transition-colors">{trial.title}</td>
                                    <td className="p-4">
                                        <span className="px-2 py-0.5 rounded-md bg-slate-800/50 text-slate-300 text-[10px] font-bold border border-slate-700 uppercase tracking-tight">
                                            {trial.phase}
                                        </span>
                                    </td>
                                    <td className="p-4 text-slate-400 text-sm">{trial.region || 'Global'}</td>
                                    <td className="p-4 text-slate-400 text-sm">{trial.sites || 0}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1.5 w-fit uppercase tracking-wider ${getStatusColor(trial.status)}`}>
                                            {trial.status === 'Completed' ? <CheckCircle2 className="h-3 w-3" /> :
                                                trial.status === 'Recruiting' ? <Clock className="h-3 w-3" /> :
                                                    <AlertCircle className="h-3 w-3" />}
                                            {trial.status}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="p-4 bg-slate-800/50 rounded-full">
                                                <Search className="h-8 w-8 text-slate-600" />
                                            </div>
                                            <p className="text-slate-500 font-medium tracking-tight">No matching trials found in the registry.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-slate-800">
                    {filteredTrials.length > 0 ? filteredTrials.map((trial, index) => (
                        <div key={trial.id} className="p-4 space-y-3 bg-slate-900/50 active:bg-slate-800/50 transition-colors">
                            <div className="flex justify-between items-start">
                                <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">#{index + 1}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 uppercase tracking-wider ${getStatusColor(trial.status)}`}>
                                    {trial.status}
                                </span>
                            </div>
                            <h4 className="text-white font-medium text-sm leading-tight">{trial.title}</h4>
                            <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                <span className="flex items-center gap-1 px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300">
                                    {trial.phase}
                                </span>
                                <span>{trial.region || 'Global'}</span>
                                <span>{trial.sites || 0} Sites</span>
                            </div>
                        </div>
                    )) : (
                        <div className="p-12 text-center">
                            <p className="text-slate-500 text-sm">No matching trials found.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* New Study Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-gradient-to-br from-slate-900 to-slate-950">
                            <div>
                                <h2 className="text-2xl font-bold text-white tracking-tight">Initialize New Study</h2>
                                <p className="text-slate-400 text-sm mt-1">Configure clinical trial parameters and phases.</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleCreateTrial} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Study Title</label>
                                <input
                                    required
                                    type="text"
                                    value={newTrial.title}
                                    onChange={(e) => setNewTrial({ ...newTrial, title: e.target.value })}
                                    placeholder="e.g. Safety Assessment of Novel Antimicrobial Formulation"
                                    className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-purple-500/50 placeholder-slate-700 transition-all font-medium"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Target Phase</label>
                                    <select
                                        value={newTrial.phase}
                                        onChange={(e) => setNewTrial({ ...newTrial, phase: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-purple-500/50 transition-all font-medium appearance-none cursor-pointer"
                                    >
                                        <option value="Phase I">Phase I</option>
                                        <option value="Phase II">Phase II</option>
                                        <option value="Phase III">Phase III</option>
                                        <option value="Phase IV">Phase IV</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Operational Status</label>
                                    <select
                                        value={newTrial.status}
                                        onChange={(e) => setNewTrial({ ...newTrial, status: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-purple-500/50 transition-all font-medium appearance-none cursor-pointer"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Recruiting">Recruiting</option>
                                        <option value="Ongoing">Ongoing</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Terminated">Terminated</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Start Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                                        <input
                                            required
                                            type="date"
                                            value={newTrial.start_date}
                                            onChange={(e) => setNewTrial({ ...newTrial, start_date: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-800 text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-purple-500/50 transition-all font-medium"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">End Date (Target)</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                                        <input
                                            type="date"
                                            value={newTrial.end_date}
                                            onChange={(e) => setNewTrial({ ...newTrial, end_date: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-800 text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-purple-500/50 transition-all font-medium"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all font-bold tracking-tight active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button
                                    disabled={submitting}
                                    type="submit"
                                    className="flex-[2] px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl transition-all font-bold tracking-tight shadow-xl flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                                >
                                    {submitting ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <>Deploy Study</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
