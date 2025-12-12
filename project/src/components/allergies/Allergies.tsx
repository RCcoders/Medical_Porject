import { useState, useEffect } from 'react'
import { Plus, Search, Filter, AlertTriangle, Calendar, FileText, X } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { getAllergies, createAllergy } from '../../services/api'
import { Allergy } from '../../types/database.types'
import { format } from 'date-fns'

export function Allergies() {
  const { user } = useAuth()
  const [allergies, setAllergies] = useState<Allergy[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    allergen_name: '',
    allergen_type: 'Food',
    severity: 'Mild',
    reaction_symptoms: '',
    first_observed: '',
    last_reaction: '',
    treatment_protocol: ''
  })

  useEffect(() => {
    if (user) {
      fetchAllergies()
    }
  }, [user])

  const fetchAllergies = async () => {
    try {
      const data = await getAllergies()
      setAllergies(data)
    } catch (error) {
      console.error('Error fetching allergies:', error)
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
      const allergyData = {
        ...formData,
        last_reaction: formData.last_reaction || undefined
      }

      await createAllergy(allergyData)
      await fetchAllergies()
      setIsModalOpen(false)
      // Reset form
      setFormData({
        allergen_name: '',
        allergen_type: 'Food',
        severity: 'Mild',
        reaction_symptoms: '',
        first_observed: '',
        last_reaction: '',
        treatment_protocol: ''
      })
    } catch (error) {
      console.error('Error creating allergy:', error)
      alert('Failed to create allergy. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredAllergies = allergies.filter(allergy => {
    const matchesSearch = allergy.allergen_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      allergy.reaction_symptoms.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter = filterType === 'all' || allergy.allergen_type === filterType

    return matchesSearch && matchesFilter
  })

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Mild': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Moderate': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'Severe': return 'bg-red-100 text-red-800 border-red-200'
      case 'Life-threatening': return 'bg-red-200 text-red-900 border-red-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
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
          <h1 className="text-2xl font-bold text-gray-900">Allergies</h1>
          <p className="text-gray-600 mt-1">Manage your allergy information</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Allergy
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by allergen name or symptoms..."
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
              <option value="Food">Food</option>
              <option value="Drug">Drug</option>
              <option value="Environmental">Environmental</option>
              <option value="Contact">Contact</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4">
          {filteredAllergies.length > 0 ? (
            filteredAllergies.map((allergy) => (
              <div key={allergy.id} className={`border-2 rounded-lg p-6 hover:shadow-md transition-shadow duration-200 ${getSeverityColor(allergy.severity)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <AlertTriangle className="h-5 w-5 text-current mr-2" />
                      <h3 className="text-lg font-semibold text-current">{allergy.allergen_name}</h3>
                      <span className="ml-3 px-2 py-1 text-xs font-medium rounded-full bg-white bg-opacity-50">
                        {allergy.allergen_type}
                      </span>
                    </div>

                    <div className="mb-4">
                      <span className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-white bg-opacity-75">
                        {allergy.severity} Severity
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="text-sm font-medium text-current mb-1">Reaction Symptoms</p>
                        <p className="text-sm text-current opacity-90">{allergy.reaction_symptoms}</p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-current mb-1">First Observed</p>
                        <p className="text-sm text-current opacity-90">
                          {format(new Date(allergy.first_observed), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>

                    {allergy.treatment_protocol && (
                      <div className="mt-4 p-3 bg-white bg-opacity-50 rounded-lg">
                        <div className="flex items-start">
                          <FileText className="h-4 w-4 text-current mr-2 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-current">Treatment Protocol</p>
                            <p className="text-sm text-current opacity-90">{allergy.treatment_protocol}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {allergy.last_reaction && (
                      <div className="mt-4">
                        <div className="flex items-center text-sm text-current opacity-90">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>Last reaction: {format(new Date(allergy.last_reaction), 'MMM d, yyyy')}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No allergies found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || filterType !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Start by adding your allergy information'
                }
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Add First Allergy
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Allergy Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white rounded-t-xl">
              <h2 className="text-xl font-bold text-gray-900">Add New Allergy</h2>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Allergen Name *</label>
                  <input
                    type="text"
                    name="allergen_name"
                    required
                    value={formData.allergen_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. Peanuts, Penicillin"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Allergen Type *</label>
                  <select
                    name="allergen_type"
                    required
                    value={formData.allergen_type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Food">Food</option>
                    <option value="Drug">Drug</option>
                    <option value="Environmental">Environmental</option>
                    <option value="Contact">Contact</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Severity *</label>
                  <select
                    name="severity"
                    required
                    value={formData.severity}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Mild">Mild</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Severe">Severe</option>
                    <option value="Life-threatening">Life-threatening</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reaction Symptoms *</label>
                  <input
                    type="text"
                    name="reaction_symptoms"
                    required
                    value={formData.reaction_symptoms}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. Hives, Swelling, Difficulty breathing"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Observed *</label>
                  <input
                    type="date"
                    name="first_observed"
                    required
                    value={formData.first_observed}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Reaction</label>
                  <input
                    type="date"
                    name="last_reaction"
                    value={formData.last_reaction}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Treatment Protocol</label>
                  <textarea
                    name="treatment_protocol"
                    rows={3}
                    value={formData.treatment_protocol}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. Use EpiPen, Take Antihistamines"
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
                    'Save Allergy'
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