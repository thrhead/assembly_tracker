import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme, COLORS, SHADOWS, RADIUS, SPACING } from '../constants/theme';

const THEME_STORAGE_KEY = '@app_theme';

// Create Context
const ThemeContext = createContext(null);

// Provider Component
export const ThemeProvider = ({ children }) => {
    const [themeId, setThemeId] = useState('light'); // default to light
    const [isLoading, setIsLoading] = useState(true);

    // Load saved theme on mount
    useEffect(() => {
        const loadTheme = async () => {
            try {
                const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
                if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
                    setThemeId(savedTheme);
                }
            } catch (e) {
                console.warn('Failed to load theme preference');
            } finally {
                setIsLoading(false);
            }
        };
        loadTheme();
    }, []);

    // Toggle theme function
    const toggleTheme = async () => {
        const newTheme = themeId === 'light' ? 'dark' : 'light';
        setThemeId(newTheme);
        try {
            await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
        } catch (e) {
            console.warn('Failed to save theme preference');
        }
    };

    // Set specific theme
    const setTheme = async (newThemeId) => {
        if (newThemeId === 'light' || newThemeId === 'dark') {
            setThemeId(newThemeId);
            try {
                await AsyncStorage.setItem(THEME_STORAGE_KEY, newThemeId);
            } catch (e) {
                console.warn('Failed to save theme preference');
            }
        }
    };

    // Get current theme object
    const theme = useMemo(() => {
        return themeId === 'dark' ? darkTheme : lightTheme;
    }, [themeId]);

    // Context value
    const value = useMemo(() => ({
        theme,
        themeId,
        isDark: themeId === 'dark',
        isLight: themeId === 'light',
        toggleTheme,
        setTheme,
        isLoading,
        // Expose shared constants
        COLORS,
        SHADOWS,
        RADIUS,
        SPACING,
    }), [theme, themeId, isLoading]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

// Custom Hook
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export default ThemeContext;
