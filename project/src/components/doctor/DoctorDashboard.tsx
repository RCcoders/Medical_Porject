import { useEffect, useState } from 'react'
import { Users, Activity, Calendar, Clock, ArrowRight, UserPlus, FileText, Building, Award, Stethoscope } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { getDoctorRecentActivity } from '../../services/api'
import { formatDistanceToNow } from 'date-fns'

export function DoctorDashboard() {
    const { profile, refreshProfile } = useAuth()
    const navigate = useNavigate()
    const [recentActivity, setRecentActivity] = useState<any[]>([])

    // Refresh profile on mount to get latest data (e.g. license updates)
    useEffect(() => {
        refreshProfile()
        loadActivity()
    }, [])

    const loadActivity = async () => {
        try {
            const data = await getDoctorRecentActivity()
            setRecentActivity(data)
        } catch (error) {
            console.error("Failed to load activity", error)
        }
    }

    return (
        <div className="space-y-6">
            {/* Doctor Info Card */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-lg p-6 text-white">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
                        <div className="text-3xl font-bold text-white">
                            {profile?.full_name?.split(' ').map(n => n[0]).join('') || 'DR'}
                        </div>
                    </div>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold mb-2">Dr. {profile?.full_name || 'Doctor'}</h1>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-blue-100">
                            <div className="flex items-center gap-2">
                                <Building className="w-4 h-4" />
                                <span>{profile?.doctor_profile?.hospital_name || 'No Hospital Affiliation'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Stethoscope className="w-4 h-4" />
                                <span>{profile?.doctor_profile?.specialty || 'General Practice'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Award className="w-4 h-4" />
                                <span>{profile?.doctor_profile?.years_of_experience || 0} Years Exp.</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                <span>License: {profile?.doctor_profile?.license_number || 'Pending'}</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-right hidden md:block">
                        <p className="text-sm opacity-80">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Patients</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-2">1,248</h3>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-xl">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                        <span className="text-green-600 font-medium flex items-center">
                            +12% <span className="text-gray-400 ml-1">vs last month</span>
                        </span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Critical Alerts</p>
                            <h3 className="text-3xl font-bold text-red-600 mt-2">3</h3>
                        </div>
                        <div className="bg-red-50 p-3 rounded-xl">
                            <Activity className="w-6 h-6 text-red-600" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                        <span className="text-gray-500">
                            Needs immediate attention
                        </span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Appointments</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-2">12</h3>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-xl">
                            <Calendar className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                        <span className="text-blue-600 font-medium cursor-pointer hover:underline" onClick={() => navigate('/doctor/consultations')}>
                            View schedule
                        </span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Pending Reports</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-2">8</h3>
                        </div>
                        <div className="bg-yellow-50 p-3 rounded-xl">
                            <FileText className="w-6 h-6 text-yellow-600" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                        <span className="text-gray-500">
                            From lab results
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Quick Actions & Navigation */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        <button onClick={() => navigate('/doctor/consultations')} className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="bg-white p-2 rounded-lg shadow-sm group-hover:shadow text-blue-600">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <span className="font-medium">Patient Consultations</span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                        </button>

                        <button onClick={() => navigate('/doctor/patients')} className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-purple-50 hover:text-purple-700 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="bg-white p-2 rounded-lg shadow-sm group-hover:shadow text-purple-600">
                                    <Users className="w-5 h-5" />
                                </div>
                                <span className="font-medium">Patient Directory</span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600" />
                        </button>

                        <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-green-50 hover:text-green-700 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="bg-white p-2 rounded-lg shadow-sm group-hover:shadow text-green-600">
                                    <UserPlus className="w-5 h-5" />
                                </div>
                                <span className="font-medium">Register New Patient</span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-green-600" />
                        </button>
                    </div>
                </div>

                {/* Recent Activity Feed */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                        <button onClick={loadActivity} className="text-sm text-blue-600 font-medium hover:underline">Refresh</button>
                    </div>

                    <div className="space-y-4">
                        {recentActivity.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No recent activity found.</p>
                        ) : (
                            recentActivity.map((item, idx) => (
                                <div key={idx} className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer">
                                    <div className={`mt-1 w-2 h-2 rounded-full ${item.type === 'alert' ? 'bg-red-500' :
                                        item.type === 'report' ? 'bg-yellow-500' :
                                            item.type === 'appointment' ? 'bg-blue-500' : 'bg-gray-400'
                                        }`} />
                                    <div className="flex-1">
                                        <div className="flex justify-between">
                                            <h4 className="font-medium text-gray-900">{item.patient}</h4>
                                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> {formatDistanceToNow(new Date(item.time), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500">{item.desc}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    )
}
