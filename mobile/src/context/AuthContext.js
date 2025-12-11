import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService from '../services/auth.service';
import { setAuthToken, clearAuthToken, registerLogoutCallback, getAuthToken } from '../services/api';

const AuthContext = createContext(null);

// Utility function for timeout
const withTimeout = (promise, ms = 5000, errorMessage = 'Operation timed out') => {
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error(errorMessage)), ms);
    });

    return Promise.race([
        promise.then((res) => {
            clearTimeout(timeoutId);
            return res;
        }),
        timeoutPromise
    ]);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check for saved user on app start
    useEffect(() => {
        checkUser();

        // Register logout callback for 401 errors
        registerLogoutCallback(() => {
            console.log('401 Unauthorized - Logging out');
            setUser(null);
        });
    }, []);

    const checkUser = async () => {
        try {
            await withTimeout((async () => {
                const savedUser = await AsyncStorage.getItem('user');
                // getAuthToken will also set the api header if token exists
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

            // Call real API
            const response = await authService.login(email, password);

            if (response.user) {
                // Save user data and token explicitly
                await AsyncStorage.setItem('user', JSON.stringify(response.user));

                if (response.token) {
                    await setAuthToken(response.token);
                }

                setUser(response.user);
                return { success: true };
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: error.message || 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.'
            };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            // Call logout API
            await authService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear local data regardless of API call result
            await AsyncStorage.removeItem('user');
            await clearAuthToken();
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
