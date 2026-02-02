import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { API_BASE_URL } from '../services/api';
import { Platform } from 'react-native';

const SocketContext = createContext({
    socket: null,
    isConnected: false,
    unreadCount: 0,
    notifications: [],
    markAsRead: () => { },
    markAllAsRead: () => { },
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState([]);

    // Ref to keep track of socket instance to prevent multiple connections
    const socketRef = useRef(null);

    console.log('[SocketContext] Render. Auth:', isAuthenticated, 'User:', user?.id);

    useEffect(() => {
        console.log('[SocketContext] Effect triggered. Auth:', isAuthenticated, 'User:', user?.id);
        if (!isAuthenticated || !user) {
            if (socketRef.current) {
                console.log('[Socket] Disconnecting due to logout');
                socketRef.current.disconnect();
                socketRef.current = null;
                setSocket(null);
                setIsConnected(false);
            }
            return;
        }

        if (socketRef.current && socketRef.current.connected) {
            console.log('[Socket] Already connected');
            return;
        }

        console.log('[Socket] Initializing connection to:', API_BASE_URL);

        // Initialize socket
        const socketInstance = io(API_BASE_URL, {
            path: '/api/socket',
            transports: ['websocket'], // Force websocket
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            forceNew: true, // Force new connection
        });

        socketRef.current = socketInstance;
        setSocket(socketInstance);

        socketInstance.on('connect', () => {
            console.log('[Socket] Connected:', socketInstance.id);
            setIsConnected(true);

            // Join user room
            if (user.id) {
                console.log('[Socket] Joining user room:', user.id);
                socketInstance.emit('join:user', user.id);
            }

            // Fetch initial unread count
            fetchUnreadCount();
        });

        socketInstance.on('connect_error', (error) => {
            console.error('[Socket] Connection error:', error.message);
            setIsConnected(false);
        });

        // Listen for new notifications
        console.log('[Socket] Registering notification:new listener');
        socketInstance.on('notification:new', (notification) => {
            console.log('[Socket] 🔔 New notification received:', notification);
            setUnreadCount(prev => prev + 1);
            setNotifications(prev => [notification, ...prev]);

            // Show alert for notification
            if (Platform.OS !== 'web') {
                const { Alert } = require('react-native');
                Alert.alert(notification.title, notification.message);
            }
        });

        // Listen for job completion
        socketInstance.on('job:completed', (data) => {
            console.log('[Socket] ✅ Job completed:', data);
            if (Platform.OS !== 'web') {
                const { Alert } = require('react-native');
                Alert.alert('İş Tamamlandı', `${data.title} işi ${data.completedBy} tarafından tamamlandı.`);
            }
        });

        // Listen for photo upload
        socketInstance.on('photo:uploaded', (data) => {
            console.log('[Socket] 📸 Photo uploaded:', data);
            if (Platform.OS !== 'web') {
                const { Alert } = require('react-native');
                Alert.alert('Fotoğraf Yüklendi', `${data.uploadedBy} yeni bir fotoğraf yükledi.`);
            }
        });

        return () => {
            if (socketRef.current) {
                console.log('[Socket] Cleaning up connection');
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [isAuthenticated, user]);

    const fetchUnreadCount = async () => {
        try {
            // We can use the existing axios instance which has the auth token
            const response = await fetch(`${API_BASE_URL}/api/notifications`, {
                headers: {
                    'Authorization': `Bearer ${await require('../services/api').getAuthToken()}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                // Filter unread
                const unread = data.filter(n => !n.isRead).length;
                setUnreadCount(unread);
                setNotifications(data);
            }
        } catch (error) {
            console.error('[Socket] Error fetching notifications:', error);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            // Optimistic update
            setUnreadCount(prev => Math.max(0, prev - 1));
            setNotifications(prev => prev.map(n =>
                n.id === notificationId ? { ...n, isRead: true } : n
            ));

            // Call API
            const api = require('../services/api').default;
            await api.patch('/api/notifications/mark-read', { notificationId });
        } catch (error) {
            console.error('[Socket] Error marking as read:', error);
            // Revert on error if needed, but for now we keep it simple
        }
    };

    const markAllAsRead = async () => {
        try {
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));

            const api = require('../services/api').default;
            await api.patch('/api/notifications/mark-read', {});
        } catch (error) {
            console.error('[Socket] Error marking all as read:', error);
        }
    };

    const joinJobRoom = (jobId) => {
        if (socketRef.current && socketRef.current.connected) {
            console.log('[Socket] Joining job room:', jobId);
            socketRef.current.emit('join:job', jobId);
        }
    };

    const leaveJobRoom = (jobId) => {
        if (socketRef.current && socketRef.current.connected) {
            console.log('[Socket] Leaving job room:', jobId);
            socketRef.current.emit('leave:job', jobId);
        }
    };

    return (
        <SocketContext.Provider value={{
            socket,
            isConnected,
            unreadCount,
            notifications,
            markAsRead,
            markAllAsRead,
            joinJobRoom,
            leaveJobRoom
        }}>
            {children}
        </SocketContext.Provider>
    );
};
