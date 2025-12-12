import { useState, useEffect } from 'react'
import { Plus, Search, Filter, FileText, Activity, User, Calendar, X } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { getLabResults, createLabResult } from '../../services/api'
import { LabResult } from '../../types/database.types'
import { format } from 'date-fns'

export function LabResults() {
  const { user } = useAuth()
  const [results, setResults] = useState<LabResult[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    test_name: '',
    test_date: '',
    test_category: 'Blood Work',
    result_value: '',
    result_unit: '',
    reference_range: '',
    status: 'Normal',
    ordering_doctor: '',
    notes: ''
  })

  useEffect(() => {
    if (user) {
      fetchLabResults()
    }
  }, [user])

  const fetchLabResults = async () => {
    try {
      const data = await getLabResults()
      setResults(data)
    } catch (error) {
      console.error('Error fetching lab results:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await createLabResult(formData)
      await fetchLabResults()
      setIsModalOpen(false)
      // Reset form
      setFormData({
        test_name: '',
        test_date: '',
        test_category: 'Blood Work',
        result_value: '',
        result_unit: '',
        reference_range: '',
        status: 'Normal',
        ordering_doctor: '',
        notes: ''
      })
    } catch (error) {
      console.error('Error creating lab result:', error)
      alert('Failed to create lab result. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredResults = results.filter(result => {
    const matchesSearch = result.test_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.ordering_doctor.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter = filterCategory === 'all' || result.test_category === filterCategory

    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Normal': return 'bg-green-100 text-green-800'
      case 'Abnormal': return 'bg-red-100 text-red-800'
      case 'Critical': return 'bg-red-200 text-red-900'
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
          <h1 className="text-2xl font-bold text-gray-900">Lab Results</h1>
          <p className="text-gray-600 mt-1">View and track your laboratory test results</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Lab Result
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by test name or doctor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">All Categories</option>
              <option value="Blood Work">Blood Work</option>
              <option value="Urinalysis">Urinalysis</option>
              <option value="Imaging">Imaging</option>
              <option value="Pathology">Pathology</option>
              <option value="Microbiology">Microbiology</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4">
          {filteredResults.length > 0 ? (
            filteredResults.map((result) => (
              <div key={result.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <Activity className="h-5 w-5 text-blue-600 mr-2" />
                      <h3 className="text-lg font-semibold text-gray-900">{result.test_name}</h3>
                      <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(result.status)}`}>
                        {result.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Result</p>
                        <p className="text-lg font-bold text-gray-900">
                          {result.result_value} <span className="text-sm font-normal text-gray-600">{result.result_unit}</span>
                        </p>
                        <p className="text-xs text-gray-500">Ref: {result.reference_range}</p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-900">Date</p>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <Calendar className="h-4 w-4 mr-2" />
                          {format(new Date(result.test_date), 'MMM d, yyyy')}
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-900">Ordered By</p>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <User className="h-4 w-4 mr-2" />
                          Dr. {result.ordering_doctor}
                        </div>
                      </div>
                    </div>

                    {result.notes && (
                      <div className="mt-4 flex items-start text-sm text-gray-600">
                        <FileText className="h-4 w-4 mr-2 mt-0.5" />
                        <p>{result.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No lab results found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || filterCategory !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Start by adding your first lab result'
                }
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Add First Lab Result
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Lab Result Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white rounded-t-xl">
              <h2 className="text-xl font-bold text-gray-900">Add New Lab Result</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Test Name *</label>
                  <input
                    type="text"
                    name="test_name"
                    required
                    value={formData.test_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. Complete Blood Count"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Test Date *</label>
                  <input
                    type="date"
                    name="test_date"
                    required
                    value={formData.test_date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    name="test_category"
                    required
                    value={formData.test_category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Blood Work">Blood Work</option>
                    <option value="Urinalysis">Urinalysis</option>
                    <option value="Imaging">Imaging</option>
                    <option value="Pathology">Pathology</option>
                    <option value="Microbiology">Microbiology</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Result Value *</label>
                  <input
                    type="text"
                    name="result_value"
                    required
                    value={formData.result_value}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. 14.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
                  <input
                    type="text"
                    name="result_unit"
                    required
                    value={formData.result_unit}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. g/dL"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reference Range</label>
                  <input
                    type="text"
                    name="reference_range"
                    value={formData.reference_range}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. 13.5 - 17.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                  <select
                    name="status"
                    required
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Abnormal">Abnormal</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ordering Doctor *</label>
                  <input
                    type="text"
                    name="ordering_doctor"
                    required
                    value={formData.ordering_doctor}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Dr. Name"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    name="notes"
                    rows={3}
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
                  onClick={() => setIsModalOpen(false)}
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
                      Saving...
                    </>
                  ) : (
                    'Save Result'
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