import { NavLink, useLocation } from 'react-router-dom'
import { Heart, Home, Building2, Pill, AlertTriangle, FlaskConical, Shield, Calendar, BarChart3, Settings, User, LogOut, X } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Hospital Visits', href: '/visits', icon: Building2 },
  { name: 'Prescriptions', href: '/prescriptions', icon: Pill },
  { name: 'Allergies', href: '/allergies', icon: AlertTriangle },
  { name: 'Lab Results', href: '/lab-results', icon: FlaskConical },
  { name: 'Insurance', href: '/insurance', icon: Shield },
  { name: 'Appointments', href: '/appointments', icon: Calendar },
  { name: '3D Visualization', href: '/visualization', icon: BarChart3 },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation()
  const { signOut, profile } = useAuth()

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-teal-600" />
              <span className="ml-3 text-xl font-bold text-gray-900">Health Ledger</span>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <li key={item.name}>
                    <NavLink
                      to={item.href}
                      onClick={() => onClose()} // Close sidebar on mobile when link clicked
                      className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${isActive
                        ? 'bg-teal-50 text-teal-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-gray-50'
                        }`}
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      {item.name}
                    </NavLink>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* User menu */}
          <div className="border-t p-4">
            <div className="flex items-center mb-3">
              <div className="flex-shrink-0">
                <User className="h-8 w-8 text-gray-400" />
              </div>
              <div className="ml-3 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {profile?.full_name || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">{profile?.email}</p>
              </div>
            </div>

            <div className="space-y-1">
              <NavLink
                to="/profile"
                onClick={() => onClose()}
                className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-200"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </NavLink>
              <button
                onClick={() => {
                  signOut()
                  onClose()
                }}
                className="w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-200"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}