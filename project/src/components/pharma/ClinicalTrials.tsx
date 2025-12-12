import { Search, Filter, Beaker, CheckCircle2, Clock, AlertCircle } from 'lucide-react'

export function ClinicalTrials() {
    const trials = [
        { id: 'NCT0005', title: 'Phase III Trial of Metformin for Anti-Aging', phase: 'Phase III', status: 'Recruiting', sites: 12, region: 'Pan-India' },
        { id: 'NCT0008', title: 'Semaglutide Repurposing for Cardiovascular', phase: 'Phase II', status: 'Active', sites: 8, region: 'North America' },
        { id: 'NCT0012', title: 'Generic Bioequivalence Study: Atorvastatin', phase: 'Phase I', status: 'Completed', sites: 4, region: 'Europe' },
        { id: 'NCT0015', title: 'Novel Delivery Mechanism for Insulin', phase: 'Pre-Clinical', status: 'Planning', sites: 0, region: 'India' },
        { id: 'NCT0021', title: 'Long-term Safety of Repurposed Aspirin', phase: 'Phase IV', status: 'Active', sites: 25, region: 'Global' },
    ]

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Recruiting': return 'text-green-400 bg-green-400/10 border-green-400/20'
            case 'Active': return 'text-blue-400 bg-blue-400/10 border-blue-400/20'
            case 'Completed': return 'text-slate-400 bg-slate-400/10 border-slate-400/20'
            default: return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl border border-slate-800">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Clinical Trials Registry</h1>
                    <p className="text-slate-400 text-sm">Global trial database for repurposing opportunities</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors">
                        <Filter className="h-4 w-4" /> Filters
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors font-medium">
                        <Beaker className="h-4 w-4" /> New Study
                    </button>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search by molecule, condition, or ID..."
                            className="w-full bg-slate-950 border border-slate-800 text-slate-200 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:border-purple-500/50 placeholder-slate-600"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-950 text-slate-400 text-xs uppercase tracking-wider">
                                <th className="p-4 font-medium border-b border-slate-800">Trial ID</th>
                                <th className="p-4 font-medium border-b border-slate-800">Study Title</th>
                                <th className="p-4 font-medium border-b border-slate-800">Phase</th>
                                <th className="p-4 font-medium border-b border-slate-800">Region</th>
                                <th className="p-4 font-medium border-b border-slate-800">Sites</th>
                                <th className="p-4 font-medium border-b border-slate-800">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {trials.map((trial) => (
                                <tr key={trial.id} className="group hover:bg-slate-800/30 transition-colors">
                                    <td className="p-4 text-slate-400 font-mono text-sm">{trial.id}</td>
                                    <td className="p-4 text-white font-medium">{trial.title}</td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 rounded-md bg-slate-800 text-slate-300 text-xs border border-slate-700">
                                            {trial.phase}
                                        </span>
                                    </td>
                                    <td className="p-4 text-slate-400 text-sm">{trial.region}</td>
                                    <td className="p-4 text-slate-400 text-sm">{trial.sites}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 w-fit ${getStatusColor(trial.status)}`}>
                                            {trial.status === 'Completed' ? <CheckCircle2 className="h-3 w-3" /> :
                                                trial.status === 'Recruiting' ? <Clock className="h-3 w-3" /> :
                                                    <AlertCircle className="h-3 w-3" />}
                                            {trial.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
