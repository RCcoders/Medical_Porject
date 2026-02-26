import { useState, useEffect } from 'react'
import { Search, Filter, Pill, User, AlertCircle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { getPrescriptions } from '../../services/api'
import { Prescription } from '../../types/database.types'
import { format } from 'date-fns'

export function Prescriptions() {
  const { user } = useAuth()
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    if (user) {
      fetchPrescriptions()
    }
  }, [user])

  const fetchPrescriptions = async () => {
    try {
      const data = await getPrescriptions()
      setPrescriptions(data)
    } catch (error) {
      console.error('Error fetching prescriptions:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = prescription.drug_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prescription.prescribing_doctor.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter = filterStatus === 'all' || prescription.status === filterStatus

    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800'
      case 'Completed': return 'bg-gray-100 text-gray-800'
      case 'Discontinued': return 'bg-red-100 text-red-800'
      case 'Needs_Refill': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
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
          <h1 className="text-2xl font-bold text-gray-900">Prescriptions</h1>
          <p className="text-gray-600 mt-1">Track your medications and prescriptions</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by drug name or doctor..."
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
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Discontinued">Discontinued</option>
              <option value="Needs_Refill">Needs Refill</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4">
          {filteredPrescriptions.length > 0 ? (
            filteredPrescriptions.map((prescription) => (
              <div key={prescription.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <Pill className="h-5 w-5 text-blue-600 mr-2" />
                      <h3 className="text-lg font-semibold text-gray-900">{prescription.drug_name}</h3>
                      <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(prescription.status || 'Active')}`}>
                        {prescription.status?.replace('_', ' ') || 'Active'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Dosage & Frequency</p>
                        <p className="text-sm text-gray-600">{prescription.dosage} - {prescription.frequency}</p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-900">Duration</p>
                        <p className="text-sm text-gray-600">
                          {format(new Date(prescription.start_date), 'MMM d, yyyy')}
                          {prescription.end_date && ` - ${format(new Date(prescription.end_date), 'MMM d, yyyy')}`}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-900">Refills Remaining</p>
                        <p className="text-sm text-gray-600">{prescription.refills_remaining || 0}</p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="h-4 w-4 mr-2" />
                        <span>Prescribed by {prescription.prescribing_doctor.startsWith('Dr.') || prescription.prescribing_doctor.startsWith('Dr ') ? prescription.prescribing_doctor : `Dr. ${prescription.prescribing_doctor}`}</span>
                      </div>
                    </div>

                    {prescription.side_effects && (
                      <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                        <div className="flex items-start">
                          <AlertCircle className="h-4 w-4 text-yellow-600 mr-2 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-yellow-800">Side Effects</p>
                            <p className="text-sm text-yellow-700">{prescription.side_effects}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No prescriptions found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || filterStatus !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Prescriptions will appear here once added by your doctor'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}