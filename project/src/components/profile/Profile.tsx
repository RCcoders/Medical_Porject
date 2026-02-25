import { useState, useEffect } from 'react'
import { User, Heart, Users, Save, Edit, MapPin, Shield } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useForm } from 'react-hook-form'
import { getMyPatientProfile, updateMyPatientProfile } from '../../services/api'

interface PatientProfileForm {
  // Personal
  date_of_birth: string
  gender: string
  marital_status: string
  occupation: string
  nationality: string
  languages: string

  // Contact
  phone: string
  alternate_phone: string
  address_line1: string
  address_line2: string
  city: string
  state: string
  pincode: string
  country: string

  // Guardian
  guardian_name: string
  guardian_relationship: string
  guardian_phone: string
  guardian_email: string
  guardian_address: string

  // Emergency Contact
  emergency_contact_name: string
  emergency_contact_phone: string
  emergency_relationship: string

  // Health
  blood_type: string
  height_cm: string
  weight_kg: string
  known_conditions: string
  known_allergies: string
  current_medications: string
  smoking_status: string
  alcohol_use: string
  exercise_frequency: string

  // Identity / Insurance
  aadhar_card_number: string
  pan_number: string
  insurance_provider: string
  insurance_policy_no: string
}

const inputClass = (editing: boolean) =>
  `w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${editing ? 'bg-white' : 'bg-gray-50 text-gray-500'
  }`

const SectionHeading = ({ icon: Icon, title }: { icon: any; title: string }) => (
  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center border-b pb-2">
    <Icon className="h-5 w-5 mr-2 text-blue-600" />
    {title}
  </h3>
)

const Field = ({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    {children}
  </div>
)

export function Profile() {
  const { profile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const { register, handleSubmit, reset } = useForm<PatientProfileForm>({
    defaultValues: {},
  })

  // Load existing patient profile on mount
  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMyPatientProfile()
        reset({
          date_of_birth: data.date_of_birth || '',
          gender: data.gender || '',
          marital_status: data.marital_status || '',
          occupation: data.occupation || '',
          nationality: data.nationality || '',
          languages: data.languages || '',
          phone: data.phone || '',
          alternate_phone: data.alternate_phone || '',
          address_line1: data.address_line1 || '',
          address_line2: data.address_line2 || '',
          city: data.city || '',
          state: data.state || '',
          pincode: data.pincode || '',
          country: data.country || 'India',
          guardian_name: data.guardian_name || '',
          guardian_relationship: data.guardian_relationship || '',
          guardian_phone: data.guardian_phone || '',
          guardian_email: data.guardian_email || '',
          guardian_address: data.guardian_address || '',
          emergency_contact_name: data.emergency_contact_name || '',
          emergency_contact_phone: data.emergency_contact_phone || '',
          emergency_relationship: data.emergency_relationship || '',
          blood_type: data.blood_type || '',
          height_cm: data.height_cm?.toString() || '',
          weight_kg: data.weight_kg?.toString() || '',
          known_conditions: data.known_conditions || '',
          known_allergies: data.known_allergies || '',
          current_medications: data.current_medications || '',
          smoking_status: data.smoking_status || '',
          alcohol_use: data.alcohol_use || '',
          exercise_frequency: data.exercise_frequency || '',
          aadhar_card_number: data.aadhar_card_number || '',
          pan_number: data.pan_number || '',
          insurance_provider: data.insurance_provider || '',
          insurance_policy_no: data.insurance_policy_no || '',
        })
      } catch (err) {
        console.error('Failed to load patient profile:', err)
      } finally {
        setIsFetching(false)
      }
    }
    load()
  }, [reset])

  const onSubmit = async (data: PatientProfileForm) => {
    setIsLoading(true)
    setMessage(null)
    try {
      // Convert numeric strings to numbers before sending
      const payload: Record<string, unknown> = {
        ...data,
        height_cm: data.height_cm ? parseFloat(data.height_cm) : null,
        weight_kg: data.weight_kg ? parseFloat(data.weight_kg) : null,
      }
      await updateMyPatientProfile(payload)
      setMessage({ type: 'success', text: 'Profile saved successfully!' })
      setIsEditing(false)
    } catch {
      setMessage({ type: 'error', text: 'Failed to save profile. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setMessage(null)
  }

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-1">
            {profile?.full_name} · {profile?.email}
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </button>
        )}
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg border ${message.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-700'
            : 'bg-red-50 border-red-200 text-red-700'
            }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

        {/* ── 1. Personal Information ── */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <SectionHeading icon={User} title="Personal Information" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Field label="Date of Birth">
              <input {...register('date_of_birth')} type="date" disabled={!isEditing} className={inputClass(isEditing)} />
            </Field>
            <Field label="Gender">
              <select {...register('gender')} disabled={!isEditing} className={inputClass(isEditing)}>
                <option value="">Select gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
                <option>Prefer not to say</option>
              </select>
            </Field>
            <Field label="Marital Status">
              <select {...register('marital_status')} disabled={!isEditing} className={inputClass(isEditing)}>
                <option value="">Select status</option>
                <option>Single</option>
                <option>Married</option>
                <option>Divorced</option>
                <option>Widowed</option>
              </select>
            </Field>
            <Field label="Occupation">
              <input {...register('occupation')} type="text" disabled={!isEditing} className={inputClass(isEditing)} placeholder="e.g. Software Engineer" />
            </Field>
            <Field label="Nationality">
              <input {...register('nationality')} type="text" disabled={!isEditing} className={inputClass(isEditing)} placeholder="e.g. Indian" />
            </Field>
            <Field label="Languages Known">
              <input {...register('languages')} type="text" disabled={!isEditing} className={inputClass(isEditing)} placeholder="e.g. Hindi, English" />
            </Field>
          </div>
        </div>

        {/* ── 2. Contact Details ── */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <SectionHeading icon={MapPin} title="Contact Details" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Phone Number">
              <input {...register('phone')} type="tel" disabled={!isEditing} className={inputClass(isEditing)} placeholder="+91 XXXXX XXXXX" />
            </Field>
            <Field label="Alternate Phone">
              <input {...register('alternate_phone')} type="tel" disabled={!isEditing} className={inputClass(isEditing)} />
            </Field>
            <Field label="Address Line 1">
              <input {...register('address_line1')} type="text" disabled={!isEditing} className={inputClass(isEditing)} placeholder="House / Flat No, Street" />
            </Field>
            <Field label="Address Line 2">
              <input {...register('address_line2')} type="text" disabled={!isEditing} className={inputClass(isEditing)} placeholder="Area, Landmark" />
            </Field>
            <Field label="City">
              <input {...register('city')} type="text" disabled={!isEditing} className={inputClass(isEditing)} />
            </Field>
            <Field label="State">
              <input {...register('state')} type="text" disabled={!isEditing} className={inputClass(isEditing)} />
            </Field>
            <Field label="Pincode">
              <input {...register('pincode')} type="text" disabled={!isEditing} className={inputClass(isEditing)} maxLength={7} />
            </Field>
            <Field label="Country">
              <input {...register('country')} type="text" disabled={!isEditing} className={inputClass(isEditing)} placeholder="India" />
            </Field>
          </div>
        </div>

        {/* ── 3. Guardian Contact ── */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <SectionHeading icon={Users} title="Guardian Contact" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Guardian Name">
              <input {...register('guardian_name')} type="text" disabled={!isEditing} className={inputClass(isEditing)} />
            </Field>
            <Field label="Relationship">
              <select {...register('guardian_relationship')} disabled={!isEditing} className={inputClass(isEditing)}>
                <option value="">Select relationship</option>
                <option>Father</option>
                <option>Mother</option>
                <option>Spouse</option>
                <option>Sibling</option>
                <option>Child</option>
                <option>Other</option>
              </select>
            </Field>
            <Field label="Guardian Phone">
              <input {...register('guardian_phone')} type="tel" disabled={!isEditing} className={inputClass(isEditing)} />
            </Field>
            <Field label="Guardian Email">
              <input {...register('guardian_email')} type="email" disabled={!isEditing} className={inputClass(isEditing)} />
            </Field>
            <div className="md:col-span-2">
              <Field label="Guardian Address">
                <input {...register('guardian_address')} type="text" disabled={!isEditing} className={inputClass(isEditing)} />
              </Field>
            </div>
          </div>
        </div>

        {/* ── 4. Emergency Contact ── */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <SectionHeading icon={Users} title="Emergency Contact" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Field label="Contact Name">
              <input {...register('emergency_contact_name')} type="text" disabled={!isEditing} className={inputClass(isEditing)} />
            </Field>
            <Field label="Contact Phone">
              <input {...register('emergency_contact_phone')} type="tel" disabled={!isEditing} className={inputClass(isEditing)} />
            </Field>
            <Field label="Relationship">
              <select {...register('emergency_relationship')} disabled={!isEditing} className={inputClass(isEditing)}>
                <option value="">Select relationship</option>
                <option>Father</option>
                <option>Mother</option>
                <option>Spouse</option>
                <option>Sibling</option>
                <option>Friend</option>
                <option>Other</option>
              </select>
            </Field>
          </div>
        </div>

        {/* ── 5. Health Information ── */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <SectionHeading icon={Heart} title="Health Information" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Field label="Blood Type">
              <select {...register('blood_type')} disabled={!isEditing} className={inputClass(isEditing)}>
                <option value="">Select blood type</option>
                {bloodTypes.map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Height (cm)">
              <input {...register('height_cm')} type="number" step="0.1" min="1" max="300" disabled={!isEditing} className={inputClass(isEditing)} />
            </Field>
            <Field label="Weight (kg)">
              <input {...register('weight_kg')} type="number" step="0.1" min="1" max="500" disabled={!isEditing} className={inputClass(isEditing)} />
            </Field>
            <Field label="Smoking Status">
              <select {...register('smoking_status')} disabled={!isEditing} className={inputClass(isEditing)}>
                <option value="">Select</option>
                <option>Never</option>
                <option>Former</option>
                <option>Current</option>
              </select>
            </Field>
            <Field label="Alcohol Use">
              <select {...register('alcohol_use')} disabled={!isEditing} className={inputClass(isEditing)}>
                <option value="">Select</option>
                <option>None</option>
                <option>Occasional</option>
                <option>Moderate</option>
                <option>Heavy</option>
              </select>
            </Field>
            <Field label="Exercise Frequency">
              <select {...register('exercise_frequency')} disabled={!isEditing} className={inputClass(isEditing)}>
                <option value="">Select</option>
                <option>None</option>
                <option>Light</option>
                <option>Moderate</option>
                <option>Active</option>
              </select>
            </Field>
            <div className="md:col-span-3">
              <Field label="Known Conditions (comma-separated)">
                <input {...register('known_conditions')} type="text" disabled={!isEditing} className={inputClass(isEditing)} placeholder="e.g. Diabetes, Hypertension" />
              </Field>
            </div>
            <div className="md:col-span-3">
              <Field label="Known Allergies (comma-separated)">
                <input {...register('known_allergies')} type="text" disabled={!isEditing} className={inputClass(isEditing)} placeholder="e.g. Penicillin, Peanuts" />
              </Field>
            </div>
            <div className="md:col-span-3">
              <Field label="Current Medications (comma-separated)">
                <input {...register('current_medications')} type="text" disabled={!isEditing} className={inputClass(isEditing)} placeholder="e.g. Metformin 500mg, Aspirin 75mg" />
              </Field>
            </div>
          </div>
        </div>

        {/* ── 6. Identity & Insurance ── */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <SectionHeading icon={Shield} title="Identity & Insurance" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Aadhar Card Number">
              <input {...register('aadhar_card_number')} type="text" disabled={!isEditing} className={inputClass(isEditing)} maxLength={12} placeholder="12-digit Aadhar number" />
            </Field>
            <Field label="PAN Number">
              <input {...register('pan_number')} type="text" disabled={!isEditing} className={inputClass(isEditing)} maxLength={10} placeholder="ABCDE1234F" />
            </Field>
            <Field label="Insurance Provider">
              <input {...register('insurance_provider')} type="text" disabled={!isEditing} className={inputClass(isEditing)} placeholder="e.g. Star Health, HDFC Ergo" />
            </Field>
            <Field label="Insurance Policy Number">
              <input {...register('insurance_policy_no')} type="text" disabled={!isEditing} className={inputClass(isEditing)} />
            </Field>
          </div>
        </div>

        {/* ── Actions ── */}
        {isEditing && (
          <div className="flex items-center justify-end space-x-4 pt-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-5 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        )}
      </form>
    </div>
  )
}