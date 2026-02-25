
import { useState, useEffect } from 'react'
import { Plus, Search, Filter, Calendar, MapPin, User, X, Trash2, RefreshCw, Video } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { createAppointment, getMyAppointments, updateAppointment, getDoctors, updateAppointmentStatus } from '../../services/api'
import { Appointment } from '../../types/database.types'
import { format } from 'date-fns'

interface HospitalData {
  Hospital: string
  State: string
  City: string
  LocalAddress: string
  Pincode: string
}

export function Appointments() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [doctors, setDoctors] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Location Data
  const [hospitalData, setHospitalData] = useState<HospitalData[]>([])
  const [states, setStates] = useState<string[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [hospitals, setHospitals] = useState<string[]>([])

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    doctor_name: '',
    specialty: '',
    hospital_clinic: '',
    location: '', // This will store "City, State"
    state: '', // Temporary for form selection
    city: '',  // Temporary for form selection
    appointment_date: '',
    appointment_time: '',
    appointment_type: 'Routine',
    reason: '',
    status: 'Confirmed',
    notes: '',
    consultation_mode: 'Offline' // Default to Offline
  })

  useEffect(() => {
    if (user) {
      fetchAppointments()
    }
    fetchHospitalData()
  }, [user])

  const fetchAppointments = async () => {
    try {
      const data = await getMyAppointments()
      setAppointments(data)
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchHospitalData = async () => {
    try {
      const response = await fetch('/assets/HospitalsInIndia.csv')
      const text = await response.text()
      const lines = text.split('\n')

      // Parse CSV (Skip header)
      const data: HospitalData[] = lines.slice(1).map(line => {
        // Handle potential commas in quotes (simple regex split might be needed if complex, but assuming simple for now)
        // Using a simple split for this specific CSV structure based on inspection
        const columns = line.split(',')
        if (columns.length < 3) return null

        // Clean up quotes if present
        const clean = (str: string) => str ? str.replace(/^"|"$/g, '').trim() : ''

        return {
          Hospital: clean(columns[1]), // Index 1 is Hospital based on inspection
          State: clean(columns[2]),    // Index 2 is State
          City: clean(columns[3]),     // Index 3 is City
          LocalAddress: clean(columns[4]),
          Pincode: clean(columns[5])
        }
      }).filter((item): item is HospitalData => item !== null && item.Hospital !== '')

      setHospitalData(data)

      // Extract unique states
      const uniqueStates = Array.from(new Set(data.map(item => item.State))).sort()
      setStates(uniqueStates)
    } catch (error) {
      console.error('Error fetching hospital data:', error)
    }
  }

  // Update cities when state changes
  useEffect(() => {
    if (formData.state) {
      const filteredCities = Array.from(new Set(
        hospitalData
          .filter(item => item.State === formData.state)
          .map(item => item.City)
      )).sort()
      setCities(filteredCities)

      // Only reset city if it's not valid for the new state
      if (formData.city && !filteredCities.includes(formData.city)) {
        setFormData(prev => ({ ...prev, city: '', hospital_clinic: '' }))
      }
    } else {
      setCities([])
      setFormData(prev => ({ ...prev, city: '', hospital_clinic: '' }))
    }
  }, [formData.state, hospitalData]) // eslint-disable-line react-hooks/exhaustive-deps

  // Update hospitals when city changes
  useEffect(() => {
    if (formData.city) {
      const filteredHospitals = Array.from(new Set(
        hospitalData
          .filter(item => item.State === formData.state && item.City === formData.city)
          .map(item => item.Hospital)
      )).sort()
      setHospitals(filteredHospitals)

      // Only reset hospital if it's not valid for the new city
      if (formData.hospital_clinic && !filteredHospitals.includes(formData.hospital_clinic)) {
        setFormData(prev => ({ ...prev, hospital_clinic: '' }))
      }
    } else {
      setHospitals([])
      setFormData(prev => ({ ...prev, hospital_clinic: '' }))
    }
  }, [formData.city, hospitalData, formData.state]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (formData.hospital_clinic) {
      fetchDoctors(formData.hospital_clinic)
    } else {
      setDoctors([])
    }
  }, [formData.hospital_clinic])

  const fetchDoctors = async (hospitalName: string) => {
    try {
      const data = await getDoctors(hospitalName)
      setDoctors(data)
    } catch (error) {
      console.error('Error fetching doctors:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCancel = async (id: string) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await updateAppointmentStatus(id, 'Cancelled')
        setAppointments(prev => prev.map(app =>
          app.id === id ? { ...app, status: 'Cancelled' } : app
        ))
      } catch (error) {
        console.error('Error cancelling appointment:', error)
        alert('Failed to cancel appointment.')
      }
    }
  }

  const handleReschedule = (appointment: Appointment) => {
    setEditingId(appointment.id)
    const date = new Date(appointment.appointment_date)
    const locationParts = appointment.location ? appointment.location.split(', ') : ['', '']
    setFormData({
      doctor_name: appointment.doctor_name,
      specialty: appointment.specialty || '',
      hospital_clinic: appointment.hospital_clinic,
      location: appointment.location || '',
      state: locationParts[1] || '',
      city: locationParts[0] || '',
      appointment_date: format(date, 'yyyy-MM-dd'),
      appointment_time: format(date, 'HH:mm'), // This might need adjustment if using slots
      appointment_type: appointment.appointment_type,
      reason: appointment.reason,
      status: appointment.status,
      notes: appointment.notes || '',
      consultation_mode: appointment.consultation_mode || 'Offline'
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (!user || !user.id) {
      alert("User ID not found. Please log in again.");
      setIsSubmitting(false);
      return;
    }

    try {
      if (!formData.appointment_date || !formData.appointment_time) {
        alert("Please select both Date and Time.");
        setIsSubmitting(false);
        return;
      }
      const dateTime = new Date(`${formData.appointment_date}T${formData.appointment_time}`)

      const appointmentData = {
        user_id: user.id,
        doctor_name: formData.doctor_name,
        specialty: formData.specialty || null,
        hospital_clinic: formData.hospital_clinic,
        location: `${formData.city}, ${formData.state} `,
        appointment_date: dateTime.toISOString(),
        appointment_type: formData.appointment_type,
        reason: formData.reason,
        status: editingId ? formData.status : 'Confirmed', // Keep existing status if editing, else default to Confirmed
        notes: formData.notes || null,
        consultation_mode: formData.consultation_mode
      }

      if (editingId) {
        await updateAppointment(editingId, appointmentData)
      } else {
        await createAppointment(appointmentData)
      }

      await fetchAppointments()
      setIsModalOpen(false)
      setEditingId(null)

      // Reset form
      setFormData({
        doctor_name: '',
        specialty: '',
        hospital_clinic: '',
        location: '',
        state: '',
        city: '',
        appointment_date: '',
        appointment_time: '',
        appointment_type: 'Routine',
        reason: '',
        status: 'Confirmed',
        notes: '',
        consultation_mode: 'Offline'
      })
    } catch (error) {
      console.error('Error saving appointment:', error)
      alert('Failed to save appointment.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.doctor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.hospital_clinic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.reason.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter = filterStatus === 'all' || appointment.status === filterStatus

    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'bg-blue-100 text-blue-800'
      case 'Confirmed': return 'bg-green-100 text-green-800'
      case 'Completed': return 'bg-gray-100 text-gray-800'
      case 'Cancelled': return 'bg-red-100 text-red-800'
      case 'Rescheduled': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getAppointmentTypeColor = (type: string) => {
    switch (type) {
      case 'Emergency': return 'bg-red-100 text-red-800'
      case 'Procedure': return 'bg-purple-100 text-purple-800'
      case 'Follow-up': return 'bg-orange-100 text-orange-800'
      default: return 'bg-blue-100 text-blue-800'
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600 mt-1">Manage your medical appointments</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Schedule Appointment
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by doctor, clinic, or reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Rescheduled">Rescheduled</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4">
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((appointment) => (
              <div key={appointment.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {format(new Date(appointment.appointment_date), 'MMM d, yyyy')} at {format(new Date(appointment.appointment_date), 'h:mm a')}
                      </h3>
                      <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status || 'Scheduled')}`}>
                        {appointment.status || 'Scheduled'}
                      </span>
                    </div>

                    <div className="mb-3 flex gap-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getAppointmentTypeColor(appointment.appointment_type)}`}>
                        {appointment.appointment_type}
                      </span>
                      {appointment.consultation_mode === 'Online' && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">
                          <Video className="w-3 h-3 mr-1" />
                          Online
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Doctor</p>
                          <p className="text-sm text-gray-600">
                            Dr. {appointment.doctor_name}
                            {appointment.specialty && ` (${appointment.specialty})`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Location</p>
                          <p className="text-sm text-gray-600">{appointment.hospital_clinic} ({appointment.location})</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-900 mb-1">Reason for Visit</p>
                      <p className="text-sm text-gray-600">{appointment.reason}</p>
                    </div>

                    {appointment.notes && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-900 mb-1">Notes</p>
                        <p className="text-sm text-gray-600">{appointment.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    <button
                      onClick={() => handleReschedule(appointment)}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                      title="Reschedule Appointment"
                    >
                      <RefreshCw className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleCancel(appointment.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      title="Cancel Appointment"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                    {appointment.consultation_mode === 'Online' && (
                      <button
                        onClick={() => navigate(`/video-call/${appointment.id}`)}
                        className="text-gray-400 hover:text-green-600 transition-colors"
                        title="Join Video Call"
                      >
                        <Video className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || filterStatus !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Start by scheduling your first appointment'
                }
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Schedule First Appointment
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Schedule Appointment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-xl w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white rounded-t-xl sm:rounded-t-xl">
              <h2 className="text-xl font-bold text-gray-900">{editingId ? 'Reschedule Appointment' : 'Schedule Appointment'}</h2>
              <button
                onClick={() => {
                  setIsModalOpen(false)
                  setEditingId(null)
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select State</option>
                    {states.map((state, index) => (
                      <option key={index} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    disabled={!formData.state}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="">Select City</option>
                    {cities.map((city, index) => (
                      <option key={index} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hospital/Clinic *</label>
                  <select
                    name="hospital_clinic"
                    required
                    value={formData.hospital_clinic}
                    onChange={handleInputChange}
                    disabled={!formData.city}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="">Select Hospital</option>
                    {hospitals.map((hospital, index) => (
                      <option key={index} value={hospital}>{hospital}</option>
                    ))}
                  </select>
                </div>

                {/* Doctor Name — only shown after hospital is selected */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Doctor Name *</label>
                  {!formData.hospital_clinic ? (
                    <div className="w-full px-3 py-2 border border-dashed border-gray-300 rounded-lg bg-gray-50 text-gray-400 text-sm">
                      ℹ️ Please select State, City and Hospital first
                    </div>
                  ) : (
                    <select
                      name="doctor_name"
                      required
                      value={formData.doctor_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Doctor</option>
                      {doctors.map((doctor, index) => (
                        <option key={index} value={doctor.full_name}>
                          {doctor.full_name} ({doctor.doctor_profile?.specialization || 'General'})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
                  <input
                    type="text"
                    name="specialty"
                    value={formData.specialty}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. Cardiology"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input
                    type="date"
                    name="appointment_date"
                    required
                    value={formData.appointment_date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time Slot *</label>
                  <select
                    name="appointment_time"
                    required
                    value={formData.appointment_time}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Time Slot</option>
                    <option value="08:00">🌅 Morning — 8:00 AM - 9:00 AM</option>
                    <option value="14:30">☀️ Afternoon — 2:30 PM - 3:30 PM</option>
                    <option value="20:00">🌙 Night — 8:00 PM - 9:00 PM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select
                    name="appointment_type"
                    required
                    value={formData.appointment_type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Routine">Routine</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Consultation">Consultation</option>
                    <option value="Procedure">Procedure</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Mode *</label>
                  <select
                    name="consultation_mode"
                    required
                    value={formData.consultation_mode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Offline">In-Person (Offline)</option>
                    <option value="Online">Video Call (Online)</option>
                  </select>
                </div>



                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Visit *</label>
                  <textarea
                    name="reason"
                    required
                    rows={3}
                    value={formData.reason}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Brief description of symptoms or purpose..."
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    name="notes"
                    rows={2}
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Additional notes..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false)
                    setEditingId(null)
                  }}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Scheduling...
                    </>
                  ) : (
                    'Save Appointment'
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