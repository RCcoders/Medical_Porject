import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add interceptor to add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Add response interceptor for global error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("API Error:", error.response?.data?.detail || error.message);
        if (error.response?.status === 401 && !error.config.url?.includes('/auth/login')) {
            localStorage.removeItem('token');
            sessionStorage.removeItem('token');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

export const login = async (formData: FormData | URLSearchParams) => {
    try {
        const response = await api.post('/auth/login', formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        // Typical response: { access_token: "...", token_type: "bearer" }
        const data = response.data;
        if (data?.access_token) {
            localStorage.setItem('token', data.access_token);
            // optionally set default header immediately
            api.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`;
        }

        return data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};


export const register = async (userData: any) => {
    try {
        const response = await api.post('/auth/register', userData);
        return response.data;
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
};

export const getCurrentUser = async () => {
    try {
        const response = await api.get('/auth/me');
        return response.data;
    } catch (error) {
        console.error('Error fetching current user:', error);
        throw error;
    }
};

export const getUser = async (userId: string) => {
    try {
        const response = await api.get(`/users/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user:', error);
        throw error;
    }
};

export const getPatients = async () => {
    try {
        const response = await api.get('/patients/');
        return response.data;
    } catch (error) {
        console.error('Error fetching patients:', error);
        throw error;
    }
};

export const deletePatient = async (id: string) => {
    try {
        const response = await api.delete(`/patients/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting patient:', error);
        throw error;
    }
};

export const createPatient = async (patientData: any) => {
    try {
        const response = await api.post('/users/', { ...patientData, role: 'patient' });
        return response.data;
    } catch (error) {
        console.error('Error creating patient:', error);
        throw error;
    }
};

export const getDoctors = async (hospitalName?: string) => {
    try {
        const params = hospitalName ? { hospital_name: hospitalName } : {};
        const response = await api.get('/doctors/', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching doctors:', error);
        throw error;
    }
};

// -------------------------
// PATIENT DATA API
// -------------------------

export const getHospitalVisits = async () => {
    try {
        const response = await api.get('/patient-data/visits');
        return response.data;
    } catch (error) {
        console.error('Error fetching hospital visits:', error);
        throw error;
    }
};

export const createHospitalVisit = async (visitData: any) => {
    try {
        const response = await api.post('/patient-data/visits', visitData);
        return response.data;
    } catch (error) {
        console.error('Error creating hospital visit:', error);
        throw error;
    }
};

export const getPrescriptions = async () => {
    try {
        const response = await api.get('/patient-data/prescriptions');
        return response.data;
    } catch (error) {
        console.error('Error fetching prescriptions:', error);
        throw error;
    }
};

export const createPrescription = async (prescriptionData: any) => {
    try {
        const response = await api.post('/patient-data/prescriptions', prescriptionData);
        return response.data;
    } catch (error) {
        console.error('Error creating prescription:', error);
        throw error;
    }
};

export const getAllergies = async () => {
    try {
        const response = await api.get('/patient-data/allergies');
        return response.data;
    } catch (error) {
        console.error('Error fetching allergies:', error);
        throw error;
    }
};

export const createAllergy = async (allergyData: any) => {
    try {
        const response = await api.post('/patient-data/allergies', allergyData);
        return response.data;
    } catch (error) {
        console.error('Error creating allergy:', error);
        throw error;
    }
};

export const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
        const response = await api.post('/patient-data/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
};

export const getLabResults = async () => {
    try {
        const response = await api.get('/patient-data/lab-results');
        return response.data;
    } catch (error) {
        console.error('Error fetching lab results:', error);
        throw error;
    }
};

export const createLabResult = async (resultData: any) => {
    try {
        const response = await api.post('/patient-data/lab-results', resultData);
        return response.data;
    } catch (error) {
        console.error('Error creating lab result:', error);
        throw error;
    }
};

export const getInsurancePolicies = async () => {
    try {
        const response = await api.get('/patient-data/insurance');
        return response.data;
    } catch (error) {
        console.error('Error fetching insurance policies:', error);
        throw error;
    }
};

export const createInsurancePolicy = async (policyData: any) => {
    try {
        const response = await api.post('/patient-data/insurance', policyData);
        return response.data;
    } catch (error) {
        console.error('Error creating insurance policy:', error);
        throw error;
    }
};

export const getClaims = async () => {
    try {
        const response = await api.get('/patient-data/claims');
        return response.data;
    } catch (error) {
        console.error('Error fetching claims:', error);
        throw error;
    }
};

export const createClaim = async (claimData: any) => {
    try {
        const response = await api.post('/patient-data/claims', claimData);
        return response.data;
    } catch (error) {
        console.error('Error creating claim:', error);
        throw error;
    }
};

export const getMyAppointments = async () => {
    try {
        const response = await api.get('/patient-data/appointments');
        return response.data;
    } catch (error) {
        console.error('Error fetching my appointments:', error);
        throw error;
    }
};

export const createAppointment = async (appointmentData: any) => {
    try {
        const response = await api.post('/patient-data/appointments', appointmentData);
        return response.data;
    } catch (error) {
        console.error('Error creating appointment:', error);
        throw error;
    }
};

export const deleteAppointment = async (id: string) => {
    try {
        const response = await api.delete(`/patient-data/appointments/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting appointment:', error);
        throw error;
    }
};

export const updateAppointmentStatus = async (appointmentId: string, status: string) => {
    try {
        const response = await api.patch(`/appointments/${appointmentId}/status?status=${status}`);
        return response.data;
    } catch (error) {
        console.error('Error updating appointment status:', error);
        throw error;
    }
};

export const updateAppointment = async (id: string, appointmentData: any) => {
    try {
        const response = await api.put(`/patient-data/appointments/${id}`, appointmentData);
        return response.data;
    } catch (error) {
        console.error('Error updating appointment:', error);
        throw error;
    }
};

export const verifyOtp = async (email: string, otp: string) => {
    try {
        const response = await api.post('/auth/verify-otp', { email, otp });
        return response.data;
    } catch (error) {
        console.error('OTP verification error:', error);
        throw error;
    }
};

export const uploadDoctorDocuments = async (formData: FormData) => {
    try {
        const response = await api.put('/doctors/me/documents', formData, {
            // DO NOT set Content-Type here
            onUploadProgress: (e) => {
                const p = Math.round((e.loaded * 100) / (e.total ?? 1));
                console.log('upload progress', p);
            }
        });
        return response.data;
    } catch (error) {
        console.error('Document upload error:', error);
        throw error;
    }
};

export const getPatientLabResults = async (patientId: string) => {
    try {
        const response = await api.get(`/patient-data/${patientId}/lab-results`);
        return response.data;
    } catch (error) {
        console.error('Error fetching patient lab results:', error);
        throw error;
    }
};

export const getPatientPrescriptions = async (patientId: string) => {
    try {
        const response = await api.get(`/patient-data/${patientId}/prescriptions`);
        return response.data;
    } catch (error) {
        console.error('Error fetching patient prescriptions:', error);
        throw error;
    }
};

export const getPatientVisits = async (patientId: string) => {
    try {
        const response = await api.get(`/patient-data/${patientId}/visits`);
        return response.data;
    } catch (error) {
        console.error('Error fetching patient visits:', error);
        throw error;
    }
};

export const getPatientAllergies = async (patientId: string) => {
    try {
        const response = await api.get(`/patient-data/${patientId}/allergies`);
        return response.data;
    } catch (error) {
        console.error('Error fetching patient allergies:', error);
        throw error;
    }
};
export const updateDoctorProfile = async (profileData: any) => {
    try {
        const response = await api.put('/doctors/me', profileData);
        return response.data;
    } catch (error) {
        console.error('Error updating doctor profile:', error);
        throw error;
    }
};

export const updateResearcherProfile = async (profileData: any) => {
    try {
        const response = await api.put('/researchers/me', profileData);
        return response.data;
    } catch (error) {
        console.error('Error updating researcher profile:', error);
        throw error;
    }
};

export const uploadResearcherDocuments = async (formData: FormData) => {
    try {
        const response = await api.put('/researchers/me/documents', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
        return response.data;
    } catch (error) {
        console.error('Document upload error:', error);
        throw error;
    }
};

export const getResearcherDashboardStats = async () => {
    try {
        const response = await api.get('/researchers/me/dashboard-stats');
        return response.data;
    } catch (error) {
        console.error('Error fetching researcher stats:', error);
        throw error;
    }
};

export const getClinicalTrials = async () => {
    try {
        const response = await api.get('/researchers/me/trials');
        return response.data;
    } catch (error) {
        console.error('Error fetching clinical trials:', error);
        throw error;
    }
};

export const createClinicalTrial = async (trialData: any) => {
    try {
        const response = await api.post('/researchers/me/trials', trialData);
        return response.data;
    } catch (error) {
        console.error('Error creating clinical trial:', error);
        throw error;
    }
};

export const queryAgents = async (query: string) => {
    try {
        const response = await api.post('/agents/query', { query });
        return response.data;
    } catch (error) {
        console.error('Error querying agents:', error);
        throw error;
    }
};

export const getDoctorRecentActivity = async () => {
    try {
        const response = await api.get('/doctors/me/recent-activity');
        return response.data;
    } catch (error) {
        console.error('Error fetching doctor activity:', error);
        throw error;
    }
};

export const getDoctorDashboardStats = async () => {
    try {
        const response = await api.get('/doctors/me/dashboard-stats');
        return response.data;
    } catch (error) {
        console.error('Error fetching doctor stats:', error);
        throw error;
    }
};

export const createCall = async (callData: any) => {
    try {
        const response = await api.post('/appointments/calls', callData);
        return response.data;
    } catch (error) {
        console.error('Error creating call:', error);
        throw error;
    }
};

export const getNotifications = async (userId: string) => {
    try {
        const response = await api.get(`/notifications/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching notifications:', error);
        throw error;
    }
};

export const markNotificationRead = async (notificationId: string) => {
    try {
        const response = await api.patch(`/notifications/${notificationId}/read`);
        return response.data;
    } catch (error) {
        console.error('Error marking notification read:', error);
        throw error;
    }
};

export const markAllNotificationsRead = async (userId: string) => {
    try {
        const response = await api.patch(`/notifications/read-all/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error marking all notifications read:', error);
        throw error;
    }
};
