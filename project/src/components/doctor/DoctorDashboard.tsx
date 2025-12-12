import { Users, Activity, Calendar, Clock, ArrowRight, UserPlus, FileText, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useState, useEffect } from 'react'
import { uploadDoctorDocuments } from '../../services/api'

interface HospitalData {
    Hospital: string
    State: string
    City: string
}

export function DoctorDashboard() {
    const { profile, refreshProfile } = useAuth() // Assuming refreshProfile exists or we reload
    console.log('DoctorDashboard rendering', { profile })
    const navigate = useNavigate()

    const [isUploading, setIsUploading] = useState(false)
    const [uploadError, setUploadError] = useState('')
    const [uploadSuccess, setUploadSuccess] = useState('')

    // Hospital Data State
    const [hospitalData, setHospitalData] = useState<HospitalData[]>([])
    const [states, setStates] = useState<string[]>([])
    const [cities, setCities] = useState<string[]>([])
    const [hospitals, setHospitals] = useState<string[]>([])
    const [selectedState, setSelectedState] = useState('')
    const [selectedCity, setSelectedCity] = useState('')
    const [selectedHospital, setSelectedHospital] = useState('')
    const [isOtherHospital, setIsOtherHospital] = useState(false)

    // Check if profile is complete
    const isProfileComplete = profile?.doctor_profile?.medical_degree_proof && profile?.doctor_profile?.hospital_name

    useEffect(() => {
        if (!isProfileComplete) {
            fetch('/assets/HospitalsInIndia.csv')
                .then(response => response.text())
                .then(text => {
                    const lines = text.split('\n')
                    const data: HospitalData[] = lines.slice(1).map(line => {
                        const columns = line.split(',')
                        if (columns.length < 3) return null
                        const clean = (str: string) => str ? str.replace(/^"|"$/g, '').trim() : ''
                        return {
                            Hospital: clean(columns[1]),
                            State: clean(columns[2]),
                            City: clean(columns[3]),
                        }
                    }).filter((item): item is HospitalData => item !== null && item.Hospital !== '')

                    setHospitalData(data)
                    const uniqueStates = Array.from(new Set(data.map(item => item.State))).sort()
                    setStates(uniqueStates)
                })
                .catch(console.error)
        }
    }, [isProfileComplete])

    useEffect(() => {
        if (selectedState) {
            const filteredCities = Array.from(new Set(
                hospitalData
                    .filter(item => item.State === selectedState)
                    .map(item => item.City)
            )).sort()
            setCities(filteredCities)
            setSelectedCity('')
            setSelectedHospital('')
        } else {
            setCities([])
        }
    }, [selectedState, hospitalData])

    useEffect(() => {
        if (selectedCity) {
            const filteredHospitals = Array.from(new Set(
                hospitalData
                    .filter(item => item.City === selectedCity)
                    .map(item => item.Hospital)
            )).sort()
            setHospitals(filteredHospitals)
            setSelectedHospital('')
        } else {
            setHospitals([])
        }
    }, [selectedCity, hospitalData])

    const handleFileUpload = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsUploading(true)
        setUploadError('')
        setUploadSuccess('')

        const formData = new FormData()
        const form = e.currentTarget

        const appendFile = (name: string) => {
            const input = form.elements.namedItem(name) as HTMLInputElement
            if (input.files && input.files[0]) {
                formData.append(name, input.files[0])
            }
        }

        appendFile('medical_degree_proof')
        appendFile('registration_cert')
        appendFile('identity_proof')
        appendFile('professional_photo')
        appendFile('other_certificates')

        if (!profile?.doctor_profile?.hospital_name) {
            formData.append('hospital_state', selectedState)
            formData.append('hospital_city', selectedCity)
            formData.append('hospital_name', selectedHospital)
        }

        try {
            await uploadDoctorDocuments(formData)
            setUploadSuccess('Documents uploaded successfully! Please wait for verification.')
            // Ideally refresh profile here
            await refreshProfile()
        } catch (error: any) {
            setUploadError(error.response?.data?.detail || 'Upload failed')
        } finally {
            setIsUploading(false)
        }
    }

    if (!isProfileComplete) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-8">
                        <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                            <AlertCircle className="h-8 w-8 text-yellow-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Complete Your Profile</h2>
                        <p className="text-gray-600 mt-2">Please upload the required documents to activate your account.</p>
                    </div>

                    <form onSubmit={handleFileUpload} className="space-y-6">
                        {uploadError && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-red-700 text-sm">{uploadError}</p>
                            </div>
                        )}
                        {uploadSuccess && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                <p className="text-green-700 text-sm">{uploadSuccess}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Medical Degree Proof</label>
                                <input type="file" name="medical_degree_proof" required className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Registration Certificate</label>
                                <input type="file" name="registration_cert" required className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Identity Proof (Aadhar/Passport)</label>
                                <input type="file" name="identity_proof" required className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Professional Photo</label>
                                <input type="file" name="professional_photo" required className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Other Certificates (Optional)</label>
                                <input type="file" name="other_certificates" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                            </div>
                        </div>

                        {!profile?.doctor_profile?.hospital_name && (
                            <div className="space-y-4 border-t border-gray-200 pt-4 mt-4">
                                <h3 className="text-lg font-medium text-gray-900">Hospital Affiliation</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                        <select value={selectedState} onChange={e => setSelectedState(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                            <option value="">Select State</option>
                                            {states.map((s, i) => <option key={i} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                        <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)} disabled={!selectedState} className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100">
                                            <option value="">Select City</option>
                                            {cities.map((c, i) => <option key={i} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Hospital</label>
                                        {!isOtherHospital ? (
                                            <select
                                                value={selectedHospital}
                                                onChange={e => {
                                                    if (e.target.value === 'Others') {
                                                        setIsOtherHospital(true)
                                                        setSelectedHospital('')
                                                    } else {
                                                        setSelectedHospital(e.target.value)
                                                    }
                                                }}
                                                disabled={!selectedCity}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
                                            >
                                                <option value="">Select Hospital</option>
                                                {hospitals.map((h, i) => <option key={i} value={h}>{h}</option>)}
                                                <option value="Others">Others</option>
                                            </select>
                                        ) : (
                                            <div className="flex gap-2">
                                                <input
                                                    value={selectedHospital}
                                                    onChange={e => setSelectedHospital(e.target.value)}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                                                    placeholder="Enter Hospital Name"
                                                />
                                                <button type="button" onClick={() => setIsOtherHospital(false)} className="text-blue-600 text-sm">List</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isUploading}
                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 disabled:opacity-50 font-medium text-lg shadow-lg shadow-blue-200 transition-all"
                        >
                            {isUploading ? 'Uploading...' : 'Submit Documents for Verification'}
                        </button>
                    </form>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Welcome, Dr. {profile?.full_name?.split(' ')[0] || 'Doctor'}</h1>
                    <p className="text-gray-500">Here's your daily practice overview.</p>
                </div>
                <div className="text-right text-sm text-gray-500">
                    <p>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
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
                        <button className="text-sm text-blue-600 font-medium hover:underline">View All</button>
                    </div>

                    <div className="space-y-4">
                        {[
                            { type: 'alert', patient: 'John Doe', desc: 'Heart rate spiked to 145 bpm', time: '10 min ago' },
                            { type: 'report', patient: 'Sarah Wilson', desc: 'Lab results available (Lipid Panel)', time: '45 min ago' },
                            { type: 'appointment', patient: 'Emma Thompson', desc: 'Check-up appointment confirmed', time: '1 hour ago' },
                            { type: 'system', patient: 'System', desc: 'Weekly analytics report generated', time: '2 hours ago' },
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer">
                                <div className={`mt-1 w-2 h-2 rounded-full ${item.type === 'alert' ? 'bg-red-500' :
                                    item.type === 'report' ? 'bg-yellow-500' :
                                        item.type === 'appointment' ? 'bg-blue-500' : 'bg-gray-400'
                                    }`} />
                                <div className="flex-1">
                                    <div className="flex justify-between">
                                        <h4 className="font-medium text-gray-900">{item.patient}</h4>
                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {item.time}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    )
}
