import { useState, useEffect } from 'react'
import { Search, Filter, Calendar, MapPin, User, FileText, DollarSign, Building2 } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { getHospitalVisits } from '../../services/api'
import { HospitalVisit } from '../../types/database.types'
import { format } from 'date-fns'

export function HospitalVisits() {
  const { user } = useAuth()
  const [visits, setVisits] = useState<HospitalVisit[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')

  useEffect(() => {
    if (user) {
      fetchVisits()
    }
  }, [user])

  const fetchVisits = async () => {
    try {
      const data = await getHospitalVisits()
      setVisits(data)
    } catch (error) {
      console.error('Error fetching visits:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredVisits = visits.filter(visit => {
    const matchesSearch = visit.hospital_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      visit.primary_doctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      visit.diagnosis.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter = filterType === 'all' || visit.visit_type === filterType

    return matchesSearch && matchesFilter
  })

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
          <h1 className="text-2xl font-bold text-gray-900">Hospital Visits</h1>
          <p className="text-gray-600 mt-1">Manage your hospital visit records</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search visits by hospital, doctor, or diagnosis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">All Types</option>
              <option value="Emergency">Emergency</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Follow-up">Follow-up</option>
              <option value="Surgery">Surgery</option>
              <option value="Consultation">Consultation</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4">
          {filteredVisits.length > 0 ? (
            filteredVisits.map((visit) => (
              <div key={visit.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <Building2 className="h-5 w-5 text-blue-600 mr-2" />
                      <h3 className="text-lg font-semibold text-gray-900">{visit.hospital_name}</h3>
                      <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${visit.visit_type === 'Emergency' ? 'bg-red-100 text-red-800' :
                        visit.visit_type === 'Surgery' ? 'bg-purple-100 text-purple-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                        {visit.visit_type}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>
                          {format(new Date(visit.admission_date), 'MMM d, yyyy')}
                          {visit.discharge_date && ` - ${format(new Date(visit.discharge_date), 'MMM d, yyyy')}`}
                        </span>
                      </div>

                      <div className="flex items-center text-sm text-gray-600">
                        <User className="h-4 w-4 mr-2" />
                        <span>Dr. {visit.primary_doctor}</span>
                      </div>

                      {visit.hospital_address && (
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span>{visit.hospital_address}</span>
                        </div>
                      )}

                      {visit.cost && (
                        <div className="flex items-center text-sm text-gray-600">
                          <DollarSign className="h-4 w-4 mr-2" />
                          <span>${visit.cost.toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4">
                      <div className="flex items-start">
                        <FileText className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Diagnosis</p>
                          <p className="text-sm text-gray-600">{visit.diagnosis}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hospital visits found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || filterType !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Hospital visits will appear here automatically after your appointments'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}