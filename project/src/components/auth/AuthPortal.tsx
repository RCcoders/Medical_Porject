import { useState, useEffect } from 'react'
import { Heart, Stethoscope, Mail, Phone, CreditCard, User, Eye, EyeOff, ArrowRight, UserPlus, ArrowLeft, Microscope, MapPin } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

type UserRole = 'patient' | 'doctor' | 'researcher'
type LoginMethod = 'email' | 'phone' | 'aadhaar'
type AuthMode = 'login' | 'register'
type ViewState = 'role-selection' | 'auth-form'

export function AuthPortal() {
    const { signIn, signUp } = useAuth()

    // State
    const [view, setView] = useState<ViewState>('role-selection')
    const [authMode, setAuthMode] = useState<AuthMode>('login')
    const [selectedRole, setSelectedRole] = useState<UserRole>('patient')
    const [loginMethod, setLoginMethod] = useState<LoginMethod>('email')

    // Form State
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [hospitalName, setHospitalName] = useState('')
    const [hospitalState, setHospitalState] = useState('')
    const [hospitalCity, setHospitalCity] = useState('')

    // Hospital Data States
    const [hospitalData, setHospitalData] = useState<Record<string, Record<string, string[]>>>({})
    const [availableStates, setAvailableStates] = useState<string[]>([])
    const [availableCities, setAvailableCities] = useState<string[]>([])
    const [availableHospitals, setAvailableHospitals] = useState<string[]>([])

    useEffect(() => {
        const fetchHospitalData = async () => {
            try {
                const response = await fetch('/assets/HospitalsInIndia.csv');
                const text = await response.text();
                const lines = text.split('\n');
                const data: Record<string, Record<string, string[]>> = {};

                // Skip header row (index 0)
                for (let i = 1; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (!line) continue;

                    // Simple CSV parsing (handling quotes if necessary, but assuming simple structure for now based on file view)
                    // The file has quotes around some fields. We need a regex to split correctly.
                    // The file has quotes around some fields. We need a regex to split correctly.
                    // Fallback to simple split if regex fails or for simple lines
                    const parts = line.split(',').map(p => p.trim().replace(/^"|"$/g, ''));

                    // Expected format: ID, Hospital, State, City, LocalAddress, Pincode
                    // Index: 0, 1, 2, 3, 4, 5
                    if (parts.length >= 4) {
                        const hospital = parts[1];
                        const state = parts[2];
                        const city = parts[3];

                        if (state && city && hospital) {
                            if (!data[state]) data[state] = {};
                            if (!data[state][city]) data[state][city] = [];
                            data[state][city].push(hospital);
                        }
                    }
                }

                setHospitalData(data);
                setAvailableStates(Object.keys(data).sort());
            } catch (error) {
                console.error('Error loading hospital data:', error);
            }
        };

        fetchHospitalData();
    }, []);

    const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newState = e.target.value;
        setHospitalState(newState);
        setHospitalCity('');
        setHospitalName('');
        setAvailableCities(newState ? Object.keys(hospitalData[newState] || {}).sort() : []);
        setAvailableHospitals([]);
    };

    const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newCity = e.target.value;
        setHospitalCity(newCity);
        setHospitalName('');
        setAvailableHospitals(newCity && hospitalState ? (hospitalData[hospitalState][newCity] || []).sort() : []);
    };

    const handleRoleSelect = (role: UserRole) => {
        setSelectedRole(role)
        setView('auth-form')
        setError('')
        setSuccess('')
    }

    const handleBack = () => {
        setView('role-selection')
        setError('')
        setSuccess('')
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        setIsLoading(true)

        try {
            if (authMode === 'login') {
                const { error: signInError } = await signIn(email, password, false, selectedRole)
                if (signInError) throw signInError
            } else {
                const { error: signUpError } = await signUp(email, password, fullName, selectedRole, {
                    hospitalName,
                    hospitalState,
                    hospitalCity
                })
                if (signUpError) throw signUpError
                setSuccess('Account created! Please check your email.')
            }
        } catch (err: any) {
            console.error(err)
            setError(err.message || 'An error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    const getRoleIcon = (role: UserRole) => {
        switch (role) {
            case 'patient': return <Heart className="w-12 h-12 text-green-600" />
            case 'doctor': return <Stethoscope className="w-12 h-12 text-blue-600" />
            case 'researcher': return <Microscope className="w-12 h-12 text-purple-600" />
        }
    }

    const getRoleColor = (role: UserRole) => {
        switch (role) {
            case 'patient': return 'bg-green-50 border-green-200 hover:bg-green-100 text-green-800'
            case 'doctor': return 'bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-800'
            case 'researcher': return 'bg-purple-50 border-purple-200 hover:bg-purple-100 text-purple-800'
        }
    }

    const getRoleTitle = (role: UserRole) => {
        switch (role) {
            case 'patient': return 'Patient'
            case 'doctor': return 'Doctor'
            case 'researcher': return 'Researcher'
        }
    }

    const getRoleDescription = (role: UserRole) => {
        switch (role) {
            case 'patient': return 'Access your health records and consult doctors.'
            case 'doctor': return 'Manage patients and provide consultations.'
            case 'researcher': return 'Conduct clinical trials and research.'
        }
    }

    if (view === 'role-selection') {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans">
                <div className="w-full max-w-4xl">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to G-ONE</h1>
                        <p className="text-xl text-gray-600">Please select your role to continue</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {(['patient', 'doctor', 'researcher'] as UserRole[]).map((role) => (
                            <button
                                key={role}
                                onClick={() => handleRoleSelect(role)}
                                className={`flex flex-col items-center p-8 rounded-3xl border-2 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl ${getRoleColor(role)}`}
                            >
                                <div className="bg-white p-6 rounded-full shadow-md mb-6">
                                    {getRoleIcon(role)}
                                </div>
                                <h2 className="text-2xl font-bold mb-3">{getRoleTitle(role)}</h2>
                                <p className="text-center text-sm opacity-80">{getRoleDescription(role)}</p>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-6 md:p-8 transition-all duration-300 relative">

                <button
                    onClick={handleBack}
                    className="absolute top-8 left-8 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-block p-3 rounded-full bg-gray-50 mb-4">
                        {getRoleIcon(selectedRole)}
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Portal
                    </h1>
                    <p className="text-gray-500 mt-2">Sign in or create an account</p>
                </div>

                {/* Auth Toggle */}
                <div className="flex bg-gray-100 p-1 rounded-xl mb-8">
                    <button
                        onClick={() => setAuthMode('login')}
                        className={`flex-1 flex items-center justify-center py-2.5 rounded-lg text-sm font-semibold transition-all ${authMode === 'login' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Login
                    </button>
                    <button
                        onClick={() => setAuthMode('register')}
                        className={`flex-1 flex items-center justify-center py-2.5 rounded-lg text-sm font-semibold transition-all ${authMode === 'register' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Register
                    </button>
                </div>

                {/* Login Method Selection (Only for Login) */}
                {authMode === 'login' && (
                    <div className="mb-6">
                        <h3 className="text-gray-700 font-semibold mb-3">Choose Login Method</h3>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                onClick={() => setLoginMethod('email')}
                                className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${loginMethod === 'email' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                    }`}
                            >
                                <Mail className="w-5 h-5 mb-1" />
                                <span className="text-xs">Email</span>
                            </button>
                            <button
                                onClick={() => setLoginMethod('phone')}
                                className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${loginMethod === 'phone' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                    }`}
                            >
                                <Phone className="w-5 h-5 mb-1" />
                                <span className="text-xs">Phone</span>
                            </button>
                            <button
                                onClick={() => setLoginMethod('aadhaar')}
                                className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${loginMethod === 'aadhaar' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                    }`}
                            >
                                <CreditCard className="w-5 h-5 mb-1" />
                                <span className="text-xs">Aadhaar</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                            {success}
                        </div>
                    )}

                    {authMode === 'register' && (
                        <div>
                            <label className="block text-gray-700 text-sm font-semibold mb-2">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="Enter your full name"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {authMode === 'register' && selectedRole === 'doctor' && (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-700 text-sm font-semibold mb-2">State</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <select
                                            value={hospitalState}
                                            onChange={handleStateChange}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white"
                                            required
                                        >
                                            <option value="">Select State</option>
                                            {availableStates.map(state => (
                                                <option key={state} value={state}>{state}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-semibold mb-2">City</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <select
                                            value={hospitalCity}
                                            onChange={handleCityChange}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white"
                                            required
                                            disabled={!hospitalState}
                                        >
                                            <option value="">Select City</option>
                                            {availableCities.map(city => (
                                                <option key={city} value={city}>{city}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-semibold mb-2">Hospital Name</label>
                                <div className="relative">
                                    <Stethoscope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <select
                                        value={hospitalName}
                                        onChange={(e) => setHospitalName(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white"
                                        required
                                        disabled={!hospitalCity}
                                    >
                                        <option value="">Select Hospital</option>
                                        {availableHospitals.map((hospital, index) => (
                                            <option key={index} value={hospital}>{hospital}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-2">
                            {loginMethod === 'email' ? 'Email Address' :
                                loginMethod === 'phone' ? 'Phone Number' : 'Aadhar Number'}
                        </label>
                        <div className="relative">
                            <input
                                type={loginMethod === 'email' ? 'email' : 'text'}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-4 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-700"
                                placeholder={
                                    loginMethod === 'email' ? 'Enter your email address' :
                                        loginMethod === 'phone' ? 'Enter your phone number' : 'Enter your 12-digit Aadhar number'
                                }
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-semibold mb-2">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-4 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-700"
                                placeholder="Enter your password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full text-white font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform active:scale-[0.98] ${isLoading ? 'opacity-70 cursor-not-allowed' : ''
                            } bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700`}
                        style={{
                            background: selectedRole === 'patient' ? 'linear-gradient(to right, #16a34a, #15803d)' :
                                selectedRole === 'doctor' ? 'linear-gradient(to right, #2563eb, #1d4ed8)' :
                                    'linear-gradient(to right, #9333ea, #7e22ce)'
                        }}
                    >
                        {isLoading ? 'Processing...' : (authMode === 'login' ? 'Sign In' : 'Create Account')}
                    </button>
                </form>
            </div>
        </div>
    )
}
