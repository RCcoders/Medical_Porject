import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { IncomingCallModal } from '../components/video/IncomingCallModal';
import { useNavigate } from 'react-router-dom';
import { getNotifications, markNotificationRead } from '../services/api';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    is_read: boolean;
    created_at: string;
    link?: string;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    sendMessage: (message: any) => void;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    fetchNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const { profile } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [incomingCall, setIncomingCall] = useState<{ appointmentId: string, doctorName: string, roomId: string } | null>(null);
    const socket = useRef<WebSocket | null>(null);
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        if (!profile?.id) return;
        try {
            const data = await getNotifications(profile.id);
            setNotifications(data);
            setUnreadCount(data.filter((n: Notification) => !n.is_read).length);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    useEffect(() => {
        if (!profile?.id) return;

        fetchNotifications();

        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const wsBase = apiUrl.replace(/^http/, 'ws');
        const wsUrl = `${wsBase}/ws/notifications/${profile.id}`;
        socket.current = new WebSocket(wsUrl);

        socket.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'CALL_INITIATED') {
                setIncomingCall({
                    appointmentId: data.appointment_id,
                    doctorName: data.doctor_name,
                    roomId: data.room_id
                });
            } else if (data.type === 'GENERAL_NOTIFICATION') {
                const newNotif = data.notification;
                setNotifications(prev => [newNotif, ...prev]);
                setUnreadCount(prev => prev + 1);
            }
        };

        socket.current.onclose = () => {
            console.log('Notification socket closed');
        };

        return () => {
            socket.current?.close();
        };
    }, [profile?.id]);

    const sendMessage = (message: any) => {
        if (socket.current?.readyState === WebSocket.OPEN) {
            socket.current.send(JSON.stringify(message));
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await markNotificationRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        if (!profile?.id) return;
        try {
            const { markAllNotificationsRead } = await import('../services/api');
            await markAllNotificationsRead(profile.id);
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const handleAccept = () => {
        if (incomingCall) {
            navigate(`/video-call/${incomingCall.appointmentId}`);
            setIncomingCall(null);
        }
    };

    const handleDecline = () => {
        setIncomingCall(null);
    };

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            sendMessage,
            markAsRead,
            markAllAsRead,
            fetchNotifications
        }}>
            {children}
            {incomingCall && (
                <IncomingCallModal
                    doctorName={incomingCall.doctorName}
                    onAccept={handleAccept}
                    onDecline={handleDecline}
                />
            )}
        </NotificationContext.Provider>
    );
}

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};
