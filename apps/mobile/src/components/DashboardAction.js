import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

const DashboardAction = ({ icon, label, onPress, isActive = true, disabled = false, comingSoon = false }) => {
    const { t } = useTranslation();
    const { theme } = useTheme();

    return (
        <TouchableOpacity
            style={[
                styles.container,
                { backgroundColor: theme.colors.card },
                isActive ? styles.active : styles.inactive,
                disabled && styles.disabled
            ]}
            onPress={onPress}
            disabled={disabled}
            activeOpacity={0.7}
        >
            {typeof icon === 'string' ? <Text style={styles.icon}>{icon}</Text> : icon}
            <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>
            {comingSoon && <Text style={styles.comingSoon}>{t('jobs.comingSoon')}</Text>}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginRight: 8,
        borderWidth: 1,
    },
    active: {
        borderColor: COLORS.slate700,
    },
    inactive: {
        borderColor: '#333',
    },
    disabled: {
        opacity: 0.6,
    },
    icon: {
        fontSize: 32,
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.white,
        marginBottom: 4,
        textAlign: 'center',
    },
    comingSoon: {
        fontSize: 10,
        color: COLORS.amber500,
        fontWeight: '600',
    },
});

export default DashboardAction;
