import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Platform } from 'react-native';
import { useSocket } from '../context/SocketContext';
import { Ionicons } from '@expo/vector-icons';
import { ToastService } from '../services/ToastService';

const ToastNotification = () => {
    const { socket } = useSocket();
    const [notification, setNotification] = useState(null);
    const slideAnim = useRef(new Animated.Value(-100)).current;
    const timerRef = useRef(null);

    const handleNewNotification = (data) => {
        // Clear existing timer if any
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        setNotification(data);

        // Slide down
        Animated.spring(slideAnim, {
            toValue: Platform.OS === 'ios' ? 50 : 20, // Adjust for status bar
            useNativeDriver: true,
            speed: 12,
            bounciness: 8,
        }).start();

        // Auto dismiss after 4 seconds
        timerRef.current = setTimeout(() => {
            dismiss();
        }, 4000);
    };

    useEffect(() => {
        // Listen to Socket events
        if (socket) {
            socket.on('notification:new', handleNewNotification);
        }

        // Listen to Local Toast Service events
        const unsubscribeToast = ToastService.subscribe(handleNewNotification);

        return () => {
            if (socket) {
                socket.off('notification:new', handleNewNotification);
            }
            unsubscribeToast();
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [socket]);

    const dismiss = () => {
        Animated.timing(slideAnim, {
            toValue: -100,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setNotification(null);
        });
    };

    if (!notification) return null;

    const getIcon = (type) => {
        switch (type) {
            case 'success': return 'checkmark-circle';
            case 'error': return 'alert-circle';
            case 'warning': return 'warning';
            default: return 'notifications';
        }
    };

    const getColor = (type) => {
        switch (type) {
            case 'success': return '#10B981'; // green-500
            case 'error': return '#EF4444'; // red-500
            case 'warning': return '#F59E0B'; // amber-500
            default: return '#3B82F6'; // blue-500
        }
    };

    return (
        <Animated.View
            style={[
                styles.container,
                { transform: [{ translateY: slideAnim }] }
            ]}
        >
            <TouchableOpacity
                style={styles.content}
                onPress={dismiss}
                activeOpacity={0.9}
            >
                <View style={[styles.iconContainer, { backgroundColor: getColor(notification.type) }]}>
                    <Ionicons name={getIcon(notification.type)} size={24} color="white" />
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.title} numberOfLines={1}>{notification.title}</Text>
                    <Text style={styles.message} numberOfLines={2}>{notification.message}</Text>
                </View>
                <TouchableOpacity onPress={dismiss} style={styles.closeButton}>
                    <Ionicons name="close" size={20} color="#9CA3AF" />
                </TouchableOpacity>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 20,
        right: 20,
        zIndex: 9999,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    content: {
        backgroundColor: 'white',
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 14,
        color: '#111827',
        marginBottom: 2,
    },
    message: {
        fontSize: 12,
        color: '#4B5563',
    },
    closeButton: {
        padding: 4,
        marginLeft: 8,
    },
});

export default ToastNotification;
