import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { NotificationProvider } from './contexts/NotificationContext'
import { AuthPortal } from './components/auth/AuthPortal'
import { Layout } from './components/layout/Layout'
import { Dashboard } from './components/dashboard/Dashboard'
import { HealthVisualization } from './components/visualization/HealthVisualization'
import { HospitalVisits } from './components/visits/HospitalVisits'
import { Prescriptions } from './components/prescriptions/Prescriptions'
import { Allergies } from './components/allergies/Allergies'
import { LabResults } from './components/lab-results/LabResults'
import { Insurance } from './components/insurance/Insurance'
import { Appointments } from './components/appointments/Appointments'
import { Profile } from './components/profile/Profile'
import { DoctorLayout } from './components/layout/DoctorLayout'
import { Consultations } from './components/doctor/Consultations'
import { DoctorDashboard } from './components/doctor/DoctorDashboard'
import { PatientList } from './components/doctor/PatientList'
import { PatientDetails } from './components/doctor/PatientDetails'
import { DoctorAI } from './components/doctor/DoctorAI'
import { PharmaLayout } from './components/layout/PharmaLayout'
import { ResearchLab } from './components/pharma/ResearchLab'
import { ResearcherDashboard } from './components/pharma/ResearcherDashboard'
import { ClinicalTrials } from './components/pharma/ClinicalTrials'
import { VideoCall } from './components/common/VideoCall'
import DoctorProfile from './components/profile/DoctorProfile'
import ResearcherProfile from './components/profile/ResearcherProfile'
import SplashScreen from './components/common/SplashScreen'

function BrandedLoader() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="absolute -inset-4 bg-blue-600/20 rounded-full blur-xl animate-pulse" />
        <img src="/assets/g-onelogo.png" alt="G-ONE" className="w-24 h-24 object-contain relative animate-bounce" />
      </div>
      <div className="flex gap-1.5 mt-2">
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
      </div>
    </div>
  )
}

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: ('patient' | 'doctor' | 'researcher')[] }) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return <BrandedLoader />
  }

  if (!user) {
    return <Navigate to="/" />
  }

  if (profile && allowedRoles && !allowedRoles.includes(profile.role)) {
    // Redirect to their appropriate dashboard if they try to access a restricted route
    if (profile.role === 'doctor') return <Navigate to="/doctor/dashboard" />
    if (profile.role === 'researcher') return <Navigate to="/pharma/dashboard" />
    return <Navigate to="/dashboard" />
  }

  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return <BrandedLoader />
  }

  if (user && profile) {
    if (profile.role === 'doctor') return <Navigate to="/doctor/dashboard" />
    if (profile.role === 'researcher') return <Navigate to="/pharma/dashboard" />
    return <Navigate to="/dashboard" />
  }

  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicRoute>
            <AuthPortal />
          </PublicRoute>
        }
      />
      {/* Redirect legacy routes to home */}
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/register" element={<Navigate to="/" replace />} />

      {/* Patient Routes */}
      <Route
        path="/*"
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="visualization" element={<HealthVisualization />} />
        <Route path="visits" element={<HospitalVisits />} />
        <Route path="prescriptions" element={<Prescriptions />} />
        <Route path="allergies" element={<Allergies />} />
        <Route path="lab-results" element={<LabResults />} />
        <Route path="insurance" element={<Insurance />} />
        <Route path="appointments" element={<Appointments />} />

        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Doctor Routes */}
      <Route
        path="/doctor/*"
        element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<DoctorDashboard />} />
        <Route path="consultations" element={<Consultations />} />
        <Route path="patients" element={<PatientList />} />
        <Route path="patients/:id" element={<PatientDetails />} />
        <Route path="ai-assistant" element={<DoctorAI />} />

        <Route path="profile" element={<DoctorProfile />} />
        <Route path="settings" element={<div className="p-4">Doctor Settings (Coming Soon)</div>} />
        <Route index element={<Navigate to="/doctor/dashboard" replace />} />
      </Route>

      {/* Pharma Routes */}
      <Route
        path="/pharma/*"
        element={
          <ProtectedRoute allowedRoles={['researcher']}>
            <PharmaLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<ResearcherDashboard />} />
        <Route path="clinical-trials" element={<ClinicalTrials />} />
        <Route path="ai-assistant" element={<ResearchLab />} />
        <Route path="profile" element={<ResearcherProfile />} />
        <Route path="pipeline" element={<Navigate to="/pharma/dashboard" />} /> {/* Redirect old route */}
        <Route index element={<Navigate to="/pharma/dashboard" replace />} />
      </Route>

      {/* Common Routes */}
      <Route path="/video-call/:appointmentId" element={<VideoCall />} />

    </Routes>
  )
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 2500)
    return () => clearTimeout(timer)
  }, [])

  if (showSplash) {
    return <SplashScreen />
  }

  return (
    <AuthProvider>
      <Router>
        <NotificationProvider>
          <AppRoutes />
        </NotificationProvider>
      </Router>
    </AuthProvider>
  )
}
