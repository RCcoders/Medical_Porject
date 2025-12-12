import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Mail, Lock, User, UserPlus, Stethoscope, FlaskConical, Phone, CreditCard } from 'lucide-react'
import { useEffect } from 'react'

import { Link } from 'react-router-dom'

interface RegisterFormData {
  fullName: string
  email: string
  password: string
  confirmPassword: string
  role: 'patient' | 'doctor' | 'researcher'
  phone: string
  aadharCard: string
  hospitalName: string
  hospitalState: string
  hospitalCity: string
  agreeToTerms: boolean
}

interface HospitalData {
  Hospital: string
  State: string
  City: string
}

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')


  // Multi-step state
  const [step, setStep] = useState<'register' | 'success'>('register')

  // Hospital Data State
  const [hospitalData, setHospitalData] = useState<HospitalData[]>([])
  const [states, setStates] = useState<string[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [hospitals, setHospitals] = useState<string[]>([])
  const [isOtherHospital, setIsOtherHospital] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<RegisterFormData>({
    defaultValues: {
      role: 'patient'
    }
  })

  const password = watch('password')
  const selectedRole = watch('role')
  const selectedState = watch('hospitalState')
  const selectedCity = watch('hospitalCity')


  // Fetch Hospital Data
  useEffect(() => {
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
  })

  // Update cities when state changes
  useEffect(() => {
    if (selectedState) {
      const filteredCities = Array.from(new Set(
        hospitalData
          .filter(item => item.State === selectedState)
          .map(item => item.City)
      )).sort()
      setCities(filteredCities)
      setValue('hospitalCity', '')
      setValue('hospitalName', '')
    } else {
      setCities([])
    }
  }, [selectedState]) // Note: This should be useEffect, but using useState for simplicity in replacement block if needed, but better to use useEffect. 
  // Wait, I can use useEffect. I will correct this in the actual code.

  // Update hospitals when city changes
  useEffect(() => {
    if (selectedCity) {
      const filteredHospitals = Array.from(new Set(
        hospitalData
          .filter(item => item.City === selectedCity)
          .map(item => item.Hospital)
      )).sort()
      setHospitals(filteredHospitals)
      setValue('hospitalName', '')
    } else {
      setHospitals([])
    }
  }, [selectedCity])

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      // Pass extra data to signUp (which calls register API)
      // Note: We need to update AuthContext or call API directly. 
      // Assuming signUp in AuthContext handles this or we modify it.
      // For now, let's assume we call API directly here or AuthContext is updated.
      // Actually, let's call the API directly for registration to handle new fields, 
      // then use AuthContext for login if needed.
      // But wait, useAuth().signUp might be using Firebase or Supabase? 
      // No, it uses our backend API (from previous context).

      // Let's assume we need to pass these fields. 
      // Since I can't see AuthContext, I will assume it takes additional args or I should call api.register directly.
      // Let's call api.register directly for now to be safe and explicit.

      const { register: registerApi } = require('../../services/api') // Dynamic import to avoid circular dependency if any, or just import at top

      await registerApi({
        email: data.email,
        password: data.password,
        full_name: data.fullName,
        role: data.role,
        phone: data.phone,
        aadhar_card_number: data.aadharCard,
        hospital_name: isOtherHospital ? data.hospitalName : data.hospitalName,
        hospital_state: data.hospitalState,
        hospital_city: data.hospitalCity
      })

      setStep('success')
    } catch (error: any) {
      setErrorMessage(error.response?.data?.detail || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }



  // ... Render logic ...
  // Since this is a huge replacement, I will provide the FULL content in the replacement chunk.

  return (
    <div className={`min-h-screen bg-gradient-to-br flex items-center justify-center p-4 
      ${selectedRole === 'patient' ? 'from-green-50 to-green-100' :
        selectedRole === 'doctor' ? 'from-blue-50 to-blue-100' :
          'from-purple-50 to-purple-100'}`}>
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">

        {step === 'register' && (
          <>
            <div className="text-center mb-8">
              {/* Header Icons */}
              <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4
                ${selectedRole === 'patient' ? 'bg-green-600' :
                  selectedRole === 'doctor' ? 'bg-blue-600' :
                    'bg-purple-600'}`}>
                {selectedRole === 'patient' && <UserPlus className="h-6 w-6 text-white" />}
                {selectedRole === 'doctor' && <Stethoscope className="h-6 w-6 text-white" />}
                {selectedRole === 'researcher' && <FlaskConical className="h-6 w-6 text-white" />}
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
              <p className="text-gray-600 mt-2">Join as a {selectedRole}</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm">{errorMessage}</p>
                </div>
              )}

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">I am a...</label>
                <select
                  {...register('role')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                  <option value="researcher">Researcher</option>
                </select>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    {...register('fullName', { required: 'Full name is required' })}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your full name"
                  />
                </div>
                {errors.fullName && <p className="text-red-600 text-sm mt-1">{errors.fullName.message}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    {...register('email', {
                      required: 'Email is required',
                      pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' }
                    })}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    {...register('phone', { required: 'Phone number is required' })}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your phone number"
                  />
                </div>
                {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>}
              </div>

              {/* Aadhar Card */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Aadhar Card Number</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    {...register('aadharCard', { required: 'Aadhar card is required' })}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your Aadhar number"
                  />
                </div>
                {errors.aadharCard && <p className="text-red-600 text-sm mt-1">{errors.aadharCard.message}</p>}
              </div>

              {/* Hospital Selection (For Doctor or Patient) */}
              {(selectedRole === 'doctor' || selectedRole === 'patient') && (
                <div className="space-y-4 border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-medium text-gray-900">Hospital Details</h3>

                  {/* State */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <select
                      {...register('hospitalState')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select State</option>
                      {states.map((state, i) => <option key={i} value={state}>{state}</option>)}
                    </select>
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <select
                      {...register('hospitalCity')}
                      disabled={!selectedState}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    >
                      <option value="">Select City</option>
                      {cities.map((city, i) => <option key={i} value={city}>{city}</option>)}
                    </select>
                  </div>

                  {/* Hospital */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hospital</label>
                    {!isOtherHospital ? (
                      <select
                        {...register('hospitalName')}
                        disabled={!selectedCity}
                        onChange={(e) => {
                          if (e.target.value === 'Others') {
                            setIsOtherHospital(true)
                            setValue('hospitalName', '')
                          } else {
                            setValue('hospitalName', e.target.value)
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      >
                        <option value="">Select Hospital</option>
                        {hospitals.map((h, i) => <option key={i} value={h}>{h}</option>)}
                        <option value="Others">Others</option>
                      </select>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          {...register('hospitalName', { required: isOtherHospital })}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter Hospital Name"
                        />
                        <button
                          type="button"
                          onClick={() => setIsOtherHospital(false)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Select from list
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Min 8 chars' } })}
                    type={showPassword ? 'text' : 'password'}
                    className="pl-10 pr-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter password"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    {...register('confirmPassword', {
                      required: 'Confirm password',
                      validate: v => v === password || 'Passwords do not match'
                    })}
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="pl-10 pr-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Confirm password"
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-600 text-sm mt-1">{errors.confirmPassword.message}</p>}
              </div>

              {/* Terms */}
              <div className="flex items-center">
                <input
                  {...register('agreeToTerms', { required: 'Must agree to terms' })}
                  type="checkbox"
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">
                  I agree to the <Link to="/terms" className="text-green-600">Terms</Link> and <Link to="/privacy" className="text-green-600">Privacy Policy</Link>
                </label>
              </div>
              {errors.agreeToTerms && <p className="text-red-600 text-sm mt-1">{errors.agreeToTerms.message}</p>}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account? <Link to="/login" className="text-green-600 font-medium">Sign in</Link>
              </p>
            </div>
          </>
        )}



        {step === 'success' && (
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <UserPlus className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Created!</h2>
            <p className="text-gray-600 mb-6">Your account has been created successfully. You can now log in.</p>

            <Link
              to="/login"
              className="block w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 text-center"
            >
              Go to Login
            </Link>
          </div>
        )}

      </div>
    </div>
  )
}