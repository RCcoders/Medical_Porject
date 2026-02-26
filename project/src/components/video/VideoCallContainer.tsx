import { useParams, useNavigate } from 'react-router-dom';
import { VideoConsultation } from './VideoConsultation';
import { useAuth } from '../../contexts/AuthContext';
import { useEffect } from 'react';

export function VideoCallContainer() {
    const { appointmentId } = useParams<{ appointmentId: string }>();
    const { profile } = useAuth();
    const navigate = useNavigate();

    const isDoctor = profile?.role === 'doctor';
    const roomId = appointmentId || 'default-room';

    useEffect(() => {
        if (isDoctor && appointmentId && profile) {
            // Notify the patient via NotificationContext
            // We need the patient_id from the appointment, but for now we rely on the backend 
            // to have the appointment context or we pass it if we had it.
            // Since we don't have the patient_id immediately here without an API call,
            // we'll modify VideoConsultation to handle the notification if possible, 
            // or fetch it here.

            // For now, let's assume the backend handles the mapping or we provide it.
            // A better way is to have the Consultation list pass the patient_id.
            // But if they refresh, we lose it.
        }
    }, [isDoctor, appointmentId, profile]);

    if (!appointmentId || !profile) {
        return (
            <div className="h-screen bg-gray-900 flex items-center justify-center text-white">
                <p>Loading session...</p>
            </div>
        );
    }

    return (
        <VideoConsultation
            appointmentId={appointmentId}
            roomId={roomId}
            isDoctor={isDoctor}
            onClose={() => navigate(-1)}
        />
    );
}
