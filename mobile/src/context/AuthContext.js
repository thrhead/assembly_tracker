import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService from '../services/auth.service';
import { setAuthToken, clearAuthToken, registerLogoutCallback, getAuthToken } from '../services/api';

const AuthContext = createContext(null);

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
            // Create a timeout promise
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Auth check timeout')), 5000)
            );

            // Race between auth check and timeout
            await Promise.race([
                (async () => {
                    const savedUser = await AsyncStorage.getItem('user');
                    // getAuthToken will also set the api header if token exists
                    const token = await getAuthToken();

                    if (savedUser && token) {
                        setUser(JSON.parse(savedUser));
                    }
                })(),
                timeoutPromise
            ]);
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

            if (response.user && response.token) {
                // Save user data and token explicitly
                await AsyncStorage.setItem('user', JSON.stringify(response.user));
                await setAuthToken(response.token);
                setUser(response.user);

                return { success: true };
            } else if (response.user) {
                // Fallback if token is not in response root but handled by authService (though we prefer explicit)
                await AsyncStorage.setItem('user', JSON.stringify(response.user));
                setUser(response.user);
                return { success: true };
            } else {
                return { success: false, error: 'Login failed' };
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
