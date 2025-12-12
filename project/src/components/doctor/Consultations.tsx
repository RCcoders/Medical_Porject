import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Clock, User, FileText, Video, Phone, MoreVertical } from 'lucide-react'

interface Consultation {
    id: string
    patientName: string
    time: string
    type: 'Video' | 'Audio' | 'In-Person'
    reason: string
    status: 'Upcoming' | 'In-Progress' | 'Completed' | 'Cancelled'
    avatar?: string
    consultation_mode?: 'Online' | 'Offline'
}

import { useAuth } from '../../contexts/AuthContext'
import { getMyAppointments, updateAppointmentStatus } from '../../services/api'
import { format } from 'date-fns'

export function Consultations() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [consultations, setConsultations] = useState<Consultation[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user) {
            fetchConsultations()
        }
    }, [user])

    const fetchConsultations = async () => {
        try {
            const data = await getMyAppointments()
            // Map API data to Consultation interface
            const mappedData = data.map((app: any) => ({
                id: app.id,
                patientName: 'Patient', // We might need to fetch patient name if not in appointment
                time: format(new Date(app.appointment_date), 'h:mm a'),
                type: app.consultation_mode === 'Online' ? 'Video' : 'In-Person',
                reason: app.reason,
                status: app.status === 'Confirmed' ? 'Upcoming' : app.status,
                avatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&fit=crop', // Placeholder
                consultation_mode: app.consultation_mode
            }))
            setConsultations(mappedData)
        } catch (error) {
            console.error('Error fetching consultations:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            await updateAppointmentStatus(id, newStatus)
            fetchConsultations() // Refresh list
        } catch (error) {
            console.error('Error updating status:', error)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Upcoming': return 'bg-blue-100 text-blue-700'
            case 'In-Progress': return 'bg-green-100 text-green-700'
            case 'Completed': return 'bg-gray-100 text-gray-700'
            case 'Cancelled': return 'bg-red-100 text-red-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'Video': return <Video className="w-4 h-4" />
            case 'Audio': return <Phone className="w-4 h-4" />
            case 'In-Person': return <User className="w-4 h-4" />
            default: return <User className="w-4 h-4" />
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Patient Consultations</h1>
                    <p className="text-gray-500">Manage your daily appointments and patient interactions</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors">
                        Sync Calendar
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Today's Appointments</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">8</h3>
                        </div>
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <Calendar className="w-5 h-5" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Pending Reviews</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">3</h3>
                        </div>
                        <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600">
                            <FileText className="w-5 h-5" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Patients</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">142</h3>
                        </div>
                        <div className="p-2 bg-green-50 rounded-lg text-green-600">
                            <User className="w-5 h-5" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Average Wait Time</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">12m</h3>
                        </div>
                        <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                            <Clock className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Consultations List */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-900">Upcoming Consultations</h2>
                    <div className="flex gap-2">
                        <select className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option>All Types</option>
                            <option>Video</option>
                            <option>In-Person</option>
                        </select>
                        <select className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option>Today</option>
                            <option>Tomorrow</option>
                            <option>This Week</option>
                        </select>
                    </div>
                </div>

                <div className="divide-y divide-gray-100">
                    {consultations.map((consultation) => (
                        <div key={consultation.id} className="p-6 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <img
                                        src={consultation.avatar}
                                        alt={consultation.patientName}
                                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                                    />
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{consultation.patientName}</h3>
                                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                {consultation.time}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                {getTypeIcon(consultation.type)}
                                                {consultation.type}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="text-right hidden md:block">
                                        <p className="text-sm font-medium text-gray-900">{consultation.reason}</p>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${getStatusColor(consultation.status)}`}>
                                            {consultation.status}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {consultation.status === 'In-Progress' ? (
                                            <>
                                                <button
                                                    onClick={() => navigate(`/video-call/${consultation.id}`)}
                                                    className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm flex items-center gap-2"
                                                >
                                                    <Video className="w-4 h-4" />
                                                    Resume Call
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(consultation.id, 'Completed')}
                                                    className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors shadow-sm"
                                                >
                                                    Complete
                                                </button>
                                            </>
                                        ) : consultation.status === 'Upcoming' ? (
                                            <button
                                                onClick={() => {
                                                    if (consultation.type === 'Video') {
                                                        handleStatusUpdate(consultation.id, 'In-Progress')
                                                        navigate(`/video-call/${consultation.id}`)
                                                    } else {
                                                        // Handle offline consultation start
                                                        if (window.confirm('Start offline consultation? This will mark it as In-Progress.')) {
                                                            handleStatusUpdate(consultation.id, 'In-Progress')
                                                        }
                                                    }
                                                }}
                                                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                                            >
                                                Start Consultation
                                            </button>
                                        ) : (
                                            <button className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">
                                                View Details
                                            </button>
                                        )}

                                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                            <MoreVertical className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50 text-center">
                    <button className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline">
                        View All Appointments
                    </button>
                </div>
            </div>
        </div >
    )
}
