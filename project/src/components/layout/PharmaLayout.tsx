import { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, LogOut, Microscope, ShieldCheck, Wifi, Menu, X } from 'lucide-react'
import { FloatingChatWidget } from '../agents/FloatingChatWidget'
import { useAuth } from '../../contexts/AuthContext'


export function PharmaLayout() {
    const { signOut, profile } = useAuth()
    const location = useLocation()
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    const isActive = (path: string) => location.pathname === path

    return (
        <div className="flex h-screen bg-slate-950 text-slate-200">
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Pharma Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col overflow-hidden transition-transform duration-300 ease-in-out lg:translate-x-0 lg:relative
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Gradient Gloss */}
                <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 to-slate-950 pointer-events-none" />

                <div className="p-6 border-b border-slate-800 relative z-10 flex justify-between items-center">
                    <div className="flex items-center gap-3 text-purple-400">
                        <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                            <Microscope className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold leading-none tracking-tight text-white">G-ONE</h1>
                            <span className="text-[10px] text-purple-400/70 font-bold tracking-widest uppercase">Research Portal</span>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden text-slate-400 hover:text-slate-200"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-2 relative z-10 overflow-y-auto">
                    <div className="text-[10px] font-bold text-slate-500 mb-4 px-2 uppercase tracking-widest">R&D Console</div>

                    <Link
                        to="/pharma/dashboard"
                        onClick={() => setIsSidebarOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive('/pharma/dashboard')
                            ? 'bg-purple-600/10 text-purple-300 border border-purple-500/20 shadow-[0_0_15px_rgba(147,51,234,0.1)]'
                            : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
                            }`}
                    >
                        <LayoutDashboard className="h-4 w-4" />
                        Overview
                    </Link>

                    <Link
                        to="/pharma/clinical-trials"
                        onClick={() => setIsSidebarOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive('/pharma/clinical-trials')
                            ? 'bg-purple-600/10 text-purple-300 border border-purple-500/20 shadow-[0_0_15px_rgba(147,51,234,0.1)]'
                            : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
                            }`}
                    >
                        <Microscope className="h-4 w-4" />
                        Clinical Trials
                    </Link>




                </nav>

                <div className="p-4 border-t border-slate-800 relative z-10">
                    <Link
                        to="/pharma/profile"
                        onClick={() => setIsSidebarOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 mb-2 rounded-xl border transition-all duration-200 group/profile ${isActive('/pharma/profile')
                            ? 'bg-purple-600/20 border-purple-500/30'
                            : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600'
                            }`}
                    >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-lg group-hover/profile:scale-110 transition-transform">
                            RES
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{profile?.full_name || 'Researcher'}</p>
                            <p className="text-[10px] text-slate-400 truncate uppercase tracking-wider">Lead Scientist</p>
                        </div>
                    </Link>
                    <button
                        onClick={() => signOut()}
                        className="flex items-center gap-3 px-4 py-2 w-full text-xs font-medium text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden relative w-full">
                {/* Top Header */}
                <header className="h-16 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-4 lg:px-8 z-20 shrink-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-slate-200"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        <h2 className="text-sm font-semibold text-slate-200 tracking-wide uppercase truncate">
                            {isActive('/pharma/dashboard') && 'Global R&D Overview'}
                            {isActive('/pharma/clinical-trials') && 'Clinical Trials Management'}

                            {isActive('/pharma/profile') && 'Researcher Identity Profile'}

                        </h2>
                    </div>

                    <div className="flex items-center gap-6 hidden sm:flex">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-full border border-slate-700/50">
                            <Wifi className="h-3 w-3 text-green-400" />
                            <span className="text-xs text-slate-400 font-mono">NET_SECURE</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-full border border-slate-700/50">
                            <ShieldCheck className="h-3 w-3 text-purple-400" />
                            <span className="text-xs text-slate-400 font-mono">ENCRYPTED_AES256</span>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black p-4 md:p-8">
                    <Outlet />
                    <FloatingChatWidget mode="researcher" />
                </main>
            </div>
        </div>
    )
}
