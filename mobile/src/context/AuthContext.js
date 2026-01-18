import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService from '../services/auth.service';
import { setAuthToken, clearAuthToken, registerLogoutCallback, getAuthToken } from '../services/api';
import { withTimeout } from '../utils/async-helper';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkUser();

        registerLogoutCallback(() => {
            console.log('401 Unauthorized - Logging out');
            setUser(null);
        });
    }, []);

    const checkUser = async () => {
        try {
            await withTimeout((async () => {
                const savedUser = await AsyncStorage.getItem('user');
                const token = await getAuthToken();

                if (savedUser && token) {
                    setUser(JSON.parse(savedUser));
                }
            })(), 5000, 'Auth check timeout');
        } catch (error) {
            console.error('Error checking user:', error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            setLoading(true);
            const response = await authService.login(email, password);

            if (response.user && response.token) {
                await AsyncStorage.setItem('user', JSON.stringify(response.user));
                await setAuthToken(response.token);
                setUser(response.user);
                return { success: true };
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: error.message || 'Giriş yapılamadı.'
            };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            // 1. Set user to null immediately to update UI
            setUser(null);

            // 2. Clear local storage immediately
            await AsyncStorage.removeItem('user');

            // 3. Notify server (Fire and forget - don't await to avoid blocking)
            // We use a separate async function to handle the server call to avoid blocking the UI flow
            // caused by potential network timeouts.
            authService.logout().catch(err => console.log('Server logout failed (non-critical):', err));

            // 4. Clear token last (after firing server request, though authService.logout internally clears it too)
            await clearAuthToken();
        } catch (error) {
            console.error('Local logout error:', error);
            // Ensure state is cleared even if something above fails
            setUser(null);
        }
    };

    const value = {
        user,
        login,
        logout,
        loading,
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
