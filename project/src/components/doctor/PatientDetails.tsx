import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getUser, getPatientLabResults, getPatientPrescriptions, createLabResult, createPrescription, uploadFile } from '../../services/api'
import { HealthVisualization } from '../visualization/HealthVisualization'
import { Plus, ArrowLeft, FileText, Download } from 'lucide-react'

export function PatientDetails() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [patient, setPatient] = useState<any>(null)
    const [activeTab, setActiveTab] = useState('overview')
    const [labResults, setLabResults] = useState<any[]>([])
    const [prescriptions, setPrescriptions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showLabModal, setShowLabModal] = useState(false)
    const [showPrescriptionModal, setShowPrescriptionModal] = useState(false)

    // Form states
    const [labFile, setLabFile] = useState<File | null>(null)
    const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)

    const [newLabResult, setNewLabResult] = useState({
        test_name: '',
        test_category: 'Blood',
        result_value: '',
        result_unit: '',
        reference_range: '',
        status: 'Final',
        test_date: new Date().toISOString().split('T')[0],
        ordering_doctor: 'Dr. Smith', // Should be dynamic
        lab_facility: '',
        notes: '',
        document_url: ''
    })

    const [newPrescription, setNewPrescription] = useState({
        drug_name: '',
        dosage: '',
        frequency: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        refills_remaining: 0,
        side_effects: '',
        special_instructions: '',
        prescribing_doctor: 'Dr. Smith', // Should be dynamic
        pharmacy: '',
        status: 'Active',
        document_url: ''
    })

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return
            try {
                const [userRes, labRes, presRes] = await Promise.all([
                    getUser(id),
                    getPatientLabResults(id),
                    getPatientPrescriptions(id)
                ])
                setPatient(userRes)
                setLabResults(labRes)
                setPrescriptions(presRes)
            } catch (error) {
                console.error('Error fetching patient details:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [id])

    const handleAddLabResult = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!id) return

        try {
            setUploading(true)
            let docUrl = ''
            if (labFile) {
                const uploadRes = await uploadFile(labFile)
                docUrl = uploadRes.url
            }

            await createLabResult({ ...newLabResult, user_id: id, document_url: docUrl })
            setShowLabModal(false)
            setLabFile(null)
            setNewLabResult(prev => ({ ...prev, document_url: '' }))

            // Refresh data
            const res = await getPatientLabResults(id)
            setLabResults(res)
        } catch (error) {
            console.error('Error creating lab result:', error)
        } finally {
            setUploading(false)
        }
    }

    const handleAddPrescription = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!id) return

        try {
            setUploading(true)
            let docUrl = ''
            if (prescriptionFile) {
                const uploadRes = await uploadFile(prescriptionFile)
                docUrl = uploadRes.url
            }

            await createPrescription({ ...newPrescription, user_id: id, document_url: docUrl })
            setShowPrescriptionModal(false)
            setPrescriptionFile(null)
            setNewPrescription(prev => ({ ...prev, document_url: '' }))

            // Refresh data
            const res = await getPatientPrescriptions(id)
            setPrescriptions(res)
        } catch (error) {
            console.error('Error creating prescription:', error)
        } finally {
            setUploading(false)
        }
    }

    const getDownloadLink = (url: string) => {
        if (!url) return null
        // Ensure URL is absolute if it's relative
        const fullUrl = url.startsWith('http') ? url : `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${url}`
        return fullUrl
    }

    if (loading) return <div>Loading...</div>
    if (!patient) return <div>Patient not found</div>

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/doctor/patients')} className="p-2 hover:bg-gray-100 rounded-lg">
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{patient.full_name}</h1>
                    <p className="text-gray-500">Patient ID: #{patient.id.slice(0, 8)}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'overview' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Overview & 3D Viz
                </button>
                <button
                    onClick={() => setActiveTab('lab-results')}
                    className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'lab-results' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Lab Results
                </button>
                <button
                    onClick={() => setActiveTab('prescriptions')}
                    className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'prescriptions' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Prescriptions
                </button>
            </div>

            {/* Content */}
            <div className="mt-6">
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        <HealthVisualization patientId={id} />
                        {/* Add more overview stats here if needed */}
                    </div>
                )}

                {activeTab === 'lab-results' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold">Lab Results</h3>
                            <button onClick={() => setShowLabModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                                <Plus className="w-4 h-4" /> Add Result
                            </button>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Test Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Document</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {labResults.map((result: any) => (
                                        <tr key={result.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{result.test_name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.result_value} {result.result_unit}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.test_date}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.ordering_doctor}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {result.document_url && (
                                                    <a
                                                        href={getDownloadLink(result.document_url)!}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                                    >
                                                        <FileText className="w-4 h-4" /> View
                                                    </a>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'prescriptions' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold">Prescriptions</h3>
                            <button onClick={() => setShowPrescriptionModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                                <Plus className="w-4 h-4" /> Add Prescription
                            </button>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Drug Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dosage</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Frequency</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Document</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {prescriptions.map((pres: any) => (
                                        <tr key={pres.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{pres.drug_name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pres.dosage}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pres.frequency}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pres.start_date}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {pres.document_url && (
                                                    <a
                                                        href={getDownloadLink(pres.document_url)!}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                                    >
                                                        <FileText className="w-4 h-4" /> View
                                                    </a>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            {showLabModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">Add Lab Result</h2>
                        <form onSubmit={handleAddLabResult} className="space-y-4">
                            <input placeholder="Test Name" className="w-full p-2 border rounded" value={newLabResult.test_name} onChange={e => setNewLabResult({ ...newLabResult, test_name: e.target.value })} required />
                            <input placeholder="Result Value" className="w-full p-2 border rounded" value={newLabResult.result_value} onChange={e => setNewLabResult({ ...newLabResult, result_value: e.target.value })} required />
                            <input placeholder="Unit" className="w-full p-2 border rounded" value={newLabResult.result_unit} onChange={e => setNewLabResult({ ...newLabResult, result_unit: e.target.value })} />
                            <input placeholder="Reference Range" className="w-full p-2 border rounded" value={newLabResult.reference_range} onChange={e => setNewLabResult({ ...newLabResult, reference_range: e.target.value })} />
                            <input type="date" className="w-full p-2 border rounded" value={newLabResult.test_date} onChange={e => setNewLabResult({ ...newLabResult, test_date: e.target.value })} required />

                            {/* File Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Report (PDF)</label>
                                <input
                                    type="file"
                                    accept=".pdf,image/*"
                                    className="w-full p-2 border rounded"
                                    onChange={(e) => setLabFile(e.target.files ? e.target.files[0] : null)}
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setShowLabModal(false)} className="px-4 py-2 border rounded">Cancel</button>
                                <button type="submit" disabled={uploading} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">
                                    {uploading ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showPrescriptionModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">Add Prescription</h2>
                        <form onSubmit={handleAddPrescription} className="space-y-4">
                            <input placeholder="Drug Name" className="w-full p-2 border rounded" value={newPrescription.drug_name} onChange={e => setNewPrescription({ ...newPrescription, drug_name: e.target.value })} required />
                            <input placeholder="Dosage" className="w-full p-2 border rounded" value={newPrescription.dosage} onChange={e => setNewPrescription({ ...newPrescription, dosage: e.target.value })} required />
                            <input placeholder="Frequency" className="w-full p-2 border rounded" value={newPrescription.frequency} onChange={e => setNewPrescription({ ...newPrescription, frequency: e.target.value })} required />
                            <input type="date" placeholder="Start Date" className="w-full p-2 border rounded" value={newPrescription.start_date} onChange={e => setNewPrescription({ ...newPrescription, start_date: e.target.value })} required />
                            <input type="number" placeholder="Refills" className="w-full p-2 border rounded" value={newPrescription.refills_remaining} onChange={e => setNewPrescription({ ...newPrescription, refills_remaining: parseInt(e.target.value) })} />

                            {/* File Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Prescription (PDF)</label>
                                <input
                                    type="file"
                                    accept=".pdf,image/*"
                                    className="w-full p-2 border rounded"
                                    onChange={(e) => setPrescriptionFile(e.target.files ? e.target.files[0] : null)}
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setShowPrescriptionModal(false)} className="px-4 py-2 border rounded">Cancel</button>
                                <button type="submit" disabled={uploading} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">
                                    {uploading ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
