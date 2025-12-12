import { useEffect, useState } from 'react'
import { Building2, Pill, AlertTriangle, FlaskConical, Shield, Calendar, TrendingUp, Clock, Activity } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { format } from 'date-fns'
import { Link } from 'react-router-dom'

interface DashboardStats {
  hospitalVisits: number
  activePrescriptions: number
  allergies: number
  recentLabResults: number
  activePolicies: number
  upcomingAppointments: number
}

interface RecentActivity {
  id: string
  type: string
  title: string
  date: string
  status?: string
}

export function Dashboard() {
  const { profile } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    hospitalVisits: 0,
    activePrescriptions: 0,
    allergies: 0,
    recentLabResults: 0,
    activePolicies: 0,
    upcomingAppointments: 0,
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Mock fetch
      setStats({
        hospitalVisits: 0,
        activePrescriptions: 0,
        allergies: 0,
        recentLabResults: 0,
        activePolicies: 0,
        upcomingAppointments: 0,
      })

      setRecentActivity([])

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }


  const statCards = [
    {
      name: 'Hospital Visits',
      count: stats.hospitalVisits,
      icon: Building2,
      color: 'bg-blue-500',
      href: '/visits',
    },
    {
      name: 'Active Prescriptions',
      count: stats.activePrescriptions,
      icon: Pill,
      color: 'bg-green-500',
      href: '/prescriptions',
    },
    {
      name: 'Known Allergies',
      count: stats.allergies,
      icon: AlertTriangle,
      color: 'bg-red-500',
      href: '/allergies',
    },
    {
      name: 'Recent Lab Results',
      count: stats.recentLabResults,
      icon: FlaskConical,
      color: 'bg-purple-500',
      href: '/lab-results',
    },
    {
      name: 'Active Policies',
      count: stats.activePolicies,
      icon: Shield,
      color: 'bg-indigo-500',
      href: '/insurance',
    },
    {
      name: 'Upcoming Appointments',
      count: stats.upcomingAppointments,
      icon: Calendar,
      color: 'bg-orange-500',
      href: '/appointments',
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
        <div className="flex items-center">
          <Activity className="h-12 w-12 text-blue-200" />
          <div className="ml-4">
            <h2 className="text-3xl font-bold">
              Welcome back, {profile?.full_name?.split(' ')[0]}!
            </h2>
            <p className="text-blue-100 mt-1">
              Here's your health summary for {format(new Date(), 'MMMM yyyy')}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <Link
            key={stat.name}
            to={stat.href}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>

          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    {activity.type === 'visit' ? (
                      <Building2 className="h-5 w-5 text-blue-500" />
                    ) : (
                      <FlaskConical className="h-5 w-5 text-purple-500" />
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(activity.date), 'MMM d, yyyy')}
                    </p>
                  </div>
                  {activity.status && (
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${activity.status === 'Normal'
                      ? 'bg-green-100 text-green-800'
                      : activity.status === 'Abnormal'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                      }`}>
                      {activity.status}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Quick Stats</h3>
            <Clock className="h-5 w-5 text-gray-400" />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">This Month</span>
              <span className="text-sm font-medium">
                {stats.recentLabResults} new results
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">Active Medications</span>
              <span className="text-sm font-medium">
                {stats.activePrescriptions} prescriptions
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">Coverage</span>
              <span className="text-sm font-medium">
                {stats.activePolicies} active policies
              </span>
            </div>
            <div className="pt-4 border-t">
              <Link
                to="/visualization"
                className="w-full bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 inline-block text-center"
              >
                View 3D Health Trends
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}