import { useState, useEffect } from 'react'
import { Plus, Shield, FileText, DollarSign, Calendar, X, Building } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { getInsurancePolicies, getClaims, createInsurancePolicy, createClaim } from '../../services/api'
import { InsurancePolicy, Claim } from '../../types/database.types'
import { format } from 'date-fns'

interface InsuranceProvider {
  "Insurer": string
  "Net Earned Premium": number
  "Incurred Claims": number
  "Incurred Claims Ratio": number
  "Number of Network Providers": number
  // Add other keys as needed based on JSON structure
}

export function Insurance() {
  const { user } = useAuth()
  const [policies, setPolicies] = useState<InsurancePolicy[]>([])
  const [claims, setClaims] = useState<Claim[]>([])
  const [providers, setProviders] = useState<InsuranceProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'policies' | 'claims' | 'providers'>('policies')

  // Modal States
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false)
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)


  // Form Data
  const [policyForm, setPolicyForm] = useState({
    insurance_company: '',
    policy_number: '',
    policy_type: 'Health',
    coverage_start: '',
    coverage_end: '',
    premium_amount: '',
    deductible_amount: '',
    deductible_met: '0',
    coverage_details: '',
    is_active: true
  })

  const [claimForm, setClaimForm] = useState({
    claim_number: '',
    policy_id: '',
    submission_date: '',
    reason_for_claim: '',
    claim_amount: '',
    status: 'Submitted',
    notes: ''
  })

  useEffect(() => {
    if (user) {
      fetchInsuranceData()
    }
    fetchProviders()
  }, [user])

  const fetchInsuranceData = async () => {
    try {
      const [policiesData, claimsData] = await Promise.all([
        getInsurancePolicies(),
        getClaims()
      ])
      setPolicies(policiesData)
      setClaims(claimsData)
    } catch (error) {
      console.error('Error fetching insurance data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProviders = async () => {
    try {
      const response = await fetch('/assets/insurance.json')
      const data = await response.json()
      // Filter out empty or invalid entries if any
      const validProviders = data.filter((item: any) => item["Insurer"] && item["Insurer"] !== "Total")
      setProviders(validProviders)
    } catch (error) {
      console.error('Error fetching providers:', error)
    }
  }

  const handlePolicySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const policyData = {
        ...policyForm,
        premium_amount: parseFloat(policyForm.premium_amount),
        deductible_amount: parseFloat(policyForm.deductible_amount),
        deductible_met: parseFloat(policyForm.deductible_met),
        coverage_details: { summary: policyForm.coverage_details }
      }
      await createInsurancePolicy(policyData)
      await fetchInsuranceData()
      setIsPolicyModalOpen(false)
      resetPolicyForm()
    } catch (error) {
      console.error('Error creating policy:', error)
      alert('Failed to create policy. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetPolicyForm = () => {
    setPolicyForm({
      insurance_company: '',
      policy_number: '',
      policy_type: 'Health',
      coverage_start: '',
      coverage_end: '',
      premium_amount: '',
      deductible_amount: '',
      deductible_met: '0',
      coverage_details: '',
      is_active: true
    })
  }

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const claimData = {
        ...claimForm,
        claim_amount: parseFloat(claimForm.claim_amount)
      }
      await createClaim(claimData)
      await fetchInsuranceData()
      setIsClaimModalOpen(false)
      setClaimForm({
        claim_number: '',
        policy_id: '',
        submission_date: '',
        reason_for_claim: '',
        claim_amount: '',
        status: 'Submitted',
        notes: ''
      })
    } catch (error) {
      console.error('Error creating claim:', error)
      alert('Failed to create claim. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddPolicyFromProvider = (providerName: string) => {
    setPolicyForm(prev => ({ ...prev, insurance_company: providerName }))
    setIsPolicyModalOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800'
      case 'Denied': return 'bg-red-100 text-red-800'
      case 'Pending': return 'bg-yellow-100 text-yellow-800'
      case 'Submitted': return 'bg-blue-100 text-blue-800'
      case 'Under Review': return 'bg-purple-100 text-purple-800'
      case 'Rejected': return 'bg-red-100 text-red-800'
      case 'Pending Additional Info': return 'bg-orange-100 text-orange-800'
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
          <h1 className="text-2xl font-bold text-gray-900">Insurance & Claims</h1>
          <p className="text-gray-600 mt-1">Manage your insurance policies and track claims</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => { resetPolicyForm(); setIsPolicyModalOpen(true); }}
            className="bg-white text-blue-600 border border-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors duration-200 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Policy
          </button>
          <button
            onClick={() => setIsClaimModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Submit Claim
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('policies')}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors duration-200 ${activeTab === 'policies'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Active Policies
            </button>
            <button
              onClick={() => setActiveTab('claims')}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors duration-200 ${activeTab === 'claims'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Claims History
            </button>
            <button
              onClick={() => setActiveTab('providers')}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors duration-200 ${activeTab === 'providers'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Find Providers
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'policies' && (
            <div className="grid gap-6">
              {policies.length > 0 ? (
                policies.map((policy) => (
                  <div key={policy.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-4">
                          <Shield className="h-6 w-6 text-blue-600 mr-3" />
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{policy.insurance_company}</h3>
                            <p className="text-sm text-gray-600">{policy.policy_type} Plan</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                          <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Policy Number</p>
                            <p className="text-base font-medium text-gray-900">{policy.policy_number}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Premium</p>
                            <p className="text-base font-medium text-gray-900">${policy.premium_amount}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Coverage Period</p>
                            <p className="text-sm text-gray-900">
                              {format(new Date(policy.coverage_start), 'MMM d, yyyy')} -
                              {policy.coverage_end ? format(new Date(policy.coverage_end), 'MMM d, yyyy') : 'Present'}
                            </p>
                          </div>
                        </div>

                        {policy.coverage_details && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <p className="text-sm font-medium text-gray-900 mb-1">Coverage Details</p>
                            <p className="text-sm text-gray-600">
                              {(policy.coverage_details as any).summary || JSON.stringify(policy.coverage_details)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No active policies</h3>
                  <p className="text-gray-600 mb-4">Add your insurance policy to track coverage</p>
                  <button
                    onClick={() => setIsPolicyModalOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    Add Policy
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'claims' && (
            <div className="grid gap-4">
              {claims.length > 0 ? (
                claims.map((claim) => (
                  <div key={claim.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 text-blue-600 mr-3" />
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">Claim #{claim.claim_number}</h3>
                              <p className="text-sm text-gray-600">
                                {policies.find(p => p.id === claim.policy_id)?.insurance_company || 'Unknown Provider'}
                              </p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(claim.status)}`}>
                            {claim.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Submission Date</p>
                            <div className="flex items-center text-sm text-gray-900">
                              <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                              {format(new Date(claim.submission_date), 'MMM d, yyyy')}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Claim Amount</p>
                            <div className="flex items-center text-sm text-gray-900">
                              <DollarSign className="h-4 w-4 mr-1 text-gray-400" />
                              {claim.claim_amount.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Approved Amount</p>
                            <div className="flex items-center text-sm text-gray-900">
                              <DollarSign className="h-4 w-4 mr-1 text-gray-400" />
                              {claim.approved_amount ? claim.approved_amount.toLocaleString() : '-'}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <p className="text-sm font-medium text-gray-900 mb-1">Reason for Claim</p>
                          <p className="text-sm text-gray-600">{claim.reason_for_claim}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No claims found</h3>
                  <p className="text-gray-600 mb-4">Submit a new claim to track reimbursement</p>
                  <button
                    onClick={() => setIsClaimModalOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    Submit Claim
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'providers' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {providers.map((provider, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200 flex flex-col">
                  <div className="flex items-center mb-4">
                    <Building className="h-8 w-8 text-blue-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{provider["Insurer"]}</h3>
                  </div>

                  <div className="space-y-2 mb-6 flex-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Claims Ratio</span>
                      <span className={`font-medium ${provider["Incurred Claims Ratio"] > 100 ? 'text-red-600' : 'text-green-600'}`}>
                        {provider["Incurred Claims Ratio"]}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Network Providers</span>
                      <span className="font-medium text-gray-900">{provider["Number of Network Providers"] || 'N/A'}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddPolicyFromProvider(provider["Insurer"])}
                    className="w-full mt-auto bg-gray-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-700 border border-blue-200 transition-colors duration-200 flex items-center justify-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Policy
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Policy Modal */}
      {isPolicyModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white rounded-t-xl">
              <h2 className="text-xl font-bold text-gray-900">Add Insurance Policy</h2>
              <button
                onClick={() => setIsPolicyModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handlePolicySubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Company *</label>
                  <input
                    type="text"
                    required
                    value={policyForm.insurance_company}
                    onChange={(e) => setPolicyForm({ ...policyForm, insurance_company: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. Blue Cross Blue Shield"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Policy Number *</label>
                  <input
                    type="text"
                    required
                    value={policyForm.policy_number}
                    onChange={(e) => setPolicyForm({ ...policyForm, policy_number: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Policy Type *</label>
                  <select
                    required
                    value={policyForm.policy_type}
                    onChange={(e) => setPolicyForm({ ...policyForm, policy_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Health">Health</option>
                    <option value="Dental">Dental</option>
                    <option value="Vision">Vision</option>
                    <option value="Life">Life</option>
                    <option value="Disability">Disability</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Coverage Start *</label>
                  <input
                    type="date"
                    required
                    value={policyForm.coverage_start}
                    onChange={(e) => setPolicyForm({ ...policyForm, coverage_start: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Coverage End</label>
                  <input
                    type="date"
                    value={policyForm.coverage_end}
                    onChange={(e) => setPolicyForm({ ...policyForm, coverage_end: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Premium Amount ($) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={policyForm.premium_amount}
                    onChange={(e) => setPolicyForm({ ...policyForm, premium_amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deductible Amount ($) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={policyForm.deductible_amount}
                    onChange={(e) => setPolicyForm({ ...policyForm, deductible_amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Coverage Details</label>
                  <textarea
                    rows={3}
                    value={policyForm.coverage_details}
                    onChange={(e) => setPolicyForm({ ...policyForm, coverage_details: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Summary of benefits..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsPolicyModalOpen(false)}
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
                    'Save Policy'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Claim Modal */}
      {isClaimModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white rounded-t-xl">
              <h2 className="text-xl font-bold text-gray-900">Submit New Claim</h2>
              <button
                onClick={() => setIsClaimModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleClaimSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Claim Number *</label>
                  <input
                    type="text"
                    required
                    value={claimForm.claim_number}
                    onChange={(e) => setClaimForm({ ...claimForm, claim_number: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Policy *</label>
                  <select
                    required
                    value={claimForm.policy_id}
                    onChange={(e) => setClaimForm({ ...claimForm, policy_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Policy</option>
                    {policies.map(policy => (
                      <option key={policy.id} value={policy.id}>
                        {policy.insurance_company} - {policy.policy_number}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Submission Date *</label>
                  <input
                    type="date"
                    required
                    value={claimForm.submission_date}
                    onChange={(e) => setClaimForm({ ...claimForm, submission_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Claim Amount ($) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={claimForm.claim_amount}
                    onChange={(e) => setClaimForm({ ...claimForm, claim_amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                  <select
                    required
                    value={claimForm.status}
                    onChange={(e) => setClaimForm({ ...claimForm, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Submitted">Submitted</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Pending Additional Info">Pending Additional Info</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Claim *</label>
                  <textarea
                    required
                    rows={3}
                    value={claimForm.reason_for_claim}
                    onChange={(e) => setClaimForm({ ...claimForm, reason_for_claim: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Reason for claim..."
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    rows={2}
                    value={claimForm.notes}
                    onChange={(e) => setClaimForm({ ...claimForm, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Additional notes..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsClaimModalOpen(false)}
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
                      Submitting...
                    </>
                  ) : (
                    'Submit Claim'
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