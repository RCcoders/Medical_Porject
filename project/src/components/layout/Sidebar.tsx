import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Heart, Home, Building2, Pill, AlertTriangle, FlaskConical, Shield, Calendar, BarChart3, Settings, User, LogOut } from 'lucide-react'
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

export function Sidebar() {
  const location = useLocation()
  const { signOut, profile } = useAuth()

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center px-6 py-4 border-b">
          <Heart className="h-8 w-8 text-blue-600" />
          <span className="ml-3 text-xl font-bold text-gray-900">Health Ledger</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <li key={item.name}>
                  <NavLink
                    to={item.href}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
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
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                {profile?.full_name || 'User'}
              </p>
              <p className="text-xs text-gray-500">{profile?.email}</p>
            </div>
          </div>
          
          <div className="space-y-1">
            <NavLink
              to="/profile"
              className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-200"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </NavLink>
            <button
              onClick={signOut}
              className="w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-200"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}