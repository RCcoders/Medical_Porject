import { Outlet, Link, useLocation } from 'react-router-dom'
import { Activity, Users, Settings, LogOut, HeartPulse, LayoutDashboard } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export function DoctorLayout() {
    const { signOut, user } = useAuth()
    const location = useLocation()
    console.log('DoctorLayout rendering', { user, path: location.pathname })

    const isActive = (path: string) => location.pathname === path

    return (
        <div className="flex h-screen bg-slate-50">
            {/* Clinical Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
                <div className="p-6 border-b border-slate-200">
                    <div className="flex items-center gap-2 text-blue-700">
                        <HeartPulse className="h-8 w-8" />
                        <div>
                            <h1 className="text-xl font-bold leading-none">MediWatch</h1>
                            <span className="text-xs text-slate-500 font-medium tracking-wider">CLINICIAN VIEW</span>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <div className="text-xs font-semibold text-slate-400 mb-4 px-2">TRIAGE & MONITORING</div>

                    <Link
                        to="/doctor/dashboard"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive('/doctor/dashboard')
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                    >
                        <LayoutDashboard className="h-5 w-5" />
                        Dashboard
                    </Link>

                    <Link
                        to="/doctor/consultations"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive('/doctor/consultations')
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                    >
                        <Activity className="h-5 w-5" />
                        Patient Consultations
                    </Link>

                    <Link
                        to="/doctor/patients"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive('/doctor/patients')
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                    >
                        <Users className="h-5 w-5" />
                        All Patients
                    </Link>

                    <div className="text-xs font-semibold text-slate-400 mt-8 mb-4 px-2">ADMIN</div>
                    <Link
                        to="/doctor/settings"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive('/doctor/settings')
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                    >
                        <Settings className="h-5 w-5" />
                        Settings
                    </Link>
                </nav>

                <div className="p-4 border-t border-slate-200">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                            DR
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">Dr. {user?.displayName || 'Smith'}</p>
                            <p className="text-xs text-slate-500 truncate">Cardiology</p>
                        </div>
                    </div>
                    <button
                        onClick={() => signOut()}
                        className="flex items-center gap-3 px-4 py-2 w-full text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut className="h-5 w-5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
                    <h2 className="text-lg font-semibold text-slate-800">
                        {isActive('/doctor/dashboard') && 'Practice Overview'}
                        {isActive('/doctor/consultations') && 'Patient Consultations'}
                        {isActive('/doctor/patients') && 'Patient Registry'}
                        {isActive('/doctor/settings') && 'Settings'}
                    </h2>
                    <div className="flex items-center gap-4">
                        <span className="flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        <span className="text-sm text-slate-500">System Connected</span>
                    </div>
                </header>
                <main className="flex-1 overflow-auto p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
