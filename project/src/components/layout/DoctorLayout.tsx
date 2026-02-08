import { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { Activity, Users, Settings, LogOut, HeartPulse, LayoutDashboard, Bot, Menu, X } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export function DoctorLayout() {
    const { signOut, user, profile } = useAuth()
    const location = useLocation()
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    console.log('DoctorLayout rendering', { user, path: location.pathname })

    const isActive = (path: string) => location.pathname === path

    return (
        <div className="flex h-screen bg-slate-50">
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Clinical Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-blue-700">
                        <HeartPulse className="h-8 w-8" />
                        <div>
                            <h1 className="text-xl font-bold leading-none">MediWatch</h1>
                            <span className="text-xs text-slate-500 font-medium tracking-wider">CLINICIAN VIEW</span>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden text-slate-400 hover:text-slate-600"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <div className="text-xs font-semibold text-slate-400 mb-4 px-2">TRIAGE & MONITORING</div>

                    <Link
                        to="/doctor/dashboard"
                        onClick={() => setIsSidebarOpen(false)}
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
                        onClick={() => setIsSidebarOpen(false)}
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
                        onClick={() => setIsSidebarOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive('/doctor/patients')
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                    >
                        <Users className="h-5 w-5" />
                        All Patients
                    </Link>

                    <Link
                        to="/doctor/ai-assistant"
                        onClick={() => setIsSidebarOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive('/doctor/ai-assistant')
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                    >
                        <Bot className="h-5 w-5" />
                        AI Assistant
                    </Link>



                    <div className="text-xs font-semibold text-slate-400 mt-8 mb-4 px-2">ADMIN</div>
                    <Link
                        to="/doctor/settings"
                        onClick={() => setIsSidebarOpen(false)}
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
                    <Link
                        to="/doctor/profile"
                        onClick={() => setIsSidebarOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 mb-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                    >
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                            DR
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">Dr. {profile?.full_name || 'User'}</p>
                            <p className="text-xs text-slate-500 truncate">{profile?.doctor_profile?.specialty || 'Doctor'}</p>
                        </div>
                    </Link>
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
            <div className="flex-1 flex flex-col overflow-hidden w-full">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 shrink-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        <h2 className="text-lg font-semibold text-slate-800 truncate">
                            {isActive('/doctor/dashboard') && 'Practice Overview'}
                            {isActive('/doctor/consultations') && 'Patient Consultations'}
                            {isActive('/doctor/patients') && 'Patient Registry'}
                            {isActive('/doctor/ai-assistant') && 'Clinical AI Assistant'}
                            {isActive('/doctor/settings') && 'Settings'}
                            {isActive('/doctor/profile') && 'Doctor Profile'}
                        </h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="flex h-3 w-3 relative">
                            <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        <span className="text-sm text-slate-500 hidden sm:inline">System Connected</span>
                    </div>
                </header>
                <main className="flex-1 overflow-auto p-4 lg:p-8 relative">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
