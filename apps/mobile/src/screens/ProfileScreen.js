import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, Alert, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useAlert } from '../context/AlertContext';
import authService from '../services/auth.service';
import notificationService from '../services/notification.service';
import RoleBadge from '../components/RoleBadge';
import GlassCard from '../components/ui/GlassCard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/theme';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function ProfileScreen({ navigation }) {
    const { t } = useTranslation();
    const { user, logout } = useAuth();
    const { theme, isDark, toggleTheme } = useTheme();
    const { showAlert } = useAlert();
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    useEffect(() => {
        const loadNotificationSetting = async () => {
            const saved = await AsyncStorage.getItem('notifications_enabled');
            if (saved !== null) {
                setNotificationsEnabled(JSON.parse(saved));
            }
        };
        loadNotificationSetting();
    }, []);

    const toggleNotifications = async (value) => {
        setNotificationsEnabled(value);
        await AsyncStorage.setItem('notifications_enabled', JSON.stringify(value));

        if (value) {
            // Register
            const token = await notificationService.registerForPushNotificationsAsync();
            if (token) {
                await notificationService.sendPushTokenToBackend(token, user.id);
            }
        } else {
            // Unregister (Delete from backend)
            try {
                // notificationService should ideally handle this
                console.log('Disabling notifications...');
            } catch (e) {
                console.log('Error deleting token:', e);
            }
        }
    };

    const handlePasswordChange = async () => {
        if (newPassword !== confirmPassword) {
            showAlert(t('common.error'), t('profile.passwordMismatch'), [], 'error');
            return;
        }

        if (newPassword.length < 6) {
            showAlert(t('common.error'), t('profile.passwordTooShort'), [], 'error');
            return;
        }

        try {
            await authService.changePassword(oldPassword, newPassword);
            showAlert(t('common.success'), t('profile.passwordSuccess'), [], 'success');
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.error('Password change error:', error);
            showAlert(t('common.error'), error.message || t('common.error'), [], 'error');
        }
    };

    const handleLogout = async () => {
        const performLogout = async () => {
            try {
                await logout();
            } catch (error) {
                console.error('Logout error:', error);
            }
        };

        if (Platform.OS === 'web') {
            showAlert(
                t('profile.logoutConfirmTitle'),
                t('profile.logoutConfirmDesc'),
                [
                    { text: t('common.cancel'), style: 'cancel' },
                    {
                        text: t('navigation.logout'),
                        style: 'destructive',
                        onPress: performLogout
                    }
                ],
                'question'
            );
        } else {
            showAlert(
                t('profile.logoutConfirmTitle'),
                t('profile.logoutConfirmDesc'),
                [
                    { text: t('common.cancel'), style: 'cancel' },
                    {
                        text: t('navigation.logout'),
                        style: 'destructive',
                        onPress: performLogout
                    }
                ],
                'question'
            );
        }
    };

    return (
        <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={[{ backgroundColor: theme.colors.background, flexGrow: 1, paddingBottom: 40 }]}
        >
            {/* User Info Section */}
            <View style={styles.section}>
                <GlassCard style={styles.profileHeader} theme={theme}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </Text>
                    </View>
                    <View style={styles.userInfo}>
                        <Text style={[styles.userName, { color: theme.colors.text }]}>{user?.name || 'Kullanıcı'}</Text>
                        <Text style={[styles.userEmail, { color: theme.colors.subText }]}>{user?.email}</Text>
                        <RoleBadge role={user?.role} />
                    </View>
                </GlassCard>
            </View>

            {/* Password Change Section */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('profile.changePassword')}</Text>
                <GlassCard style={styles.card} theme={theme}>
                    <View style={styles.inputGroup}>
                        <Text style={[styles.inputLabel, { color: theme.colors.subText }]}>{t('profile.currentPassword')}</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', color: theme.colors.text, borderColor: theme.colors.border }]} placeholder={t('profile.currentPasswordPlaceholder')}
                            placeholderTextColor={theme.colors.subText}
                            secureTextEntry
                            value={oldPassword}
                            onChangeText={setOldPassword}
                        />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={[styles.inputLabel, { color: theme.colors.subText }]}>{t('profile.newPassword')}</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', color: theme.colors.text, borderColor: theme.colors.border }]} placeholder={t('profile.newPasswordPlaceholder')}
                            placeholderTextColor={theme.colors.subText}
                            secureTextEntry
                            value={newPassword}
                            onChangeText={setNewPassword}
                        />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={[styles.inputLabel, { color: theme.colors.subText }]}>{t('profile.confirmPassword')}</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', color: theme.colors.text, borderColor: theme.colors.border }]} placeholder={t('profile.confirmPasswordPlaceholder')}
                            placeholderTextColor={theme.colors.subText}
                            secureTextEntry
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                        />
                    </View>
                    <TouchableOpacity style={[styles.changePasswordButton, { backgroundColor: theme.colors.primary }]} onPress={handlePasswordChange}>
                        <Text style={styles.changePasswordButtonText}>{t('profile.updatePassword')}</Text>
                    </TouchableOpacity>
                </GlassCard>
            </View>

            {/* Language Switcher */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('settings.language')}</Text>
                <GlassCard style={styles.card} theme={theme}>
                    <LanguageSwitcher />
                </GlassCard>
            </View>

            {/* App Settings Section */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('profile.appSettings')}</Text>
                <GlassCard style={styles.card} theme={theme}>
                    <View style={styles.settingRow}>
                        <View style={styles.settingInfo}>
                            <Text style={[styles.settingTitle, { color: theme.colors.text }]}>{t('profile.darkMode')}</Text>
                            <Text style={[styles.settingDescription, { color: theme.colors.subText }]}>{t('profile.darkModeDesc')}</Text>
                        </View>
                        <Switch
                            value={isDark}
                            onValueChange={toggleTheme}
                            trackColor={{ false: '#D1D5DB', true: theme.colors.primary }}
                            thumbColor={'#fff'}
                        />
                    </View>

                    <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

                    <View style={styles.settingRow}>
                        <View style={styles.settingInfo}>
                            <Text style={[styles.settingTitle, { color: theme.colors.text }]}>{t('profile.notifications')}</Text>
                            <Text style={[styles.settingDescription, { color: theme.colors.subText }]}>{t('profile.notificationsDesc')}</Text>
                        </View>
                        <Switch
                            value={notificationsEnabled}
                            onValueChange={toggleNotifications}
                            trackColor={{ false: '#D1D5DB', true: theme.colors.primary }}
                            thumbColor={'#fff'}
                        />
                    </View>
                </GlassCard>
            </View>

            {/* About Section */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('profile.about')}</Text>
                <GlassCard style={styles.card} theme={theme}>
                    <View style={[styles.aboutRow, { borderBottomColor: theme.colors.border }]}>
                        <Text style={[styles.aboutLabel, { color: theme.colors.subText }]}>{t('profile.version')}</Text>
                        <Text style={[styles.aboutValue, { color: theme.colors.text }]}>1.0.0</Text>
                    </View>
                    <View style={styles.aboutRow}>
                        <Text style={[styles.aboutLabel, { color: theme.colors.subText }]}>{t('profile.build')}</Text>
                        <Text style={[styles.aboutValue, { color: theme.colors.text }]}>100</Text>
                    </View>
                </GlassCard>
            </View>

            {/* Logout Button */}
            <View style={styles.section}>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutButtonText}>🚪 {t('navigation.logout')}</Text>
                </TouchableOpacity>
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    section: {
        padding: 16,
        paddingBottom: 0,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        marginLeft: 4,
    },
    profileHeader: {
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#3B82F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        marginBottom: 8,
    },
    card: {
        padding: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
    },
    changePasswordButton: {
        borderRadius: 8,
        padding: 14,
        alignItems: 'center',
        marginTop: 8,
    },
    changePasswordButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    settingInfo: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    settingDescription: {
        fontSize: 12,
    },
    divider: {
        height: 1,
        marginVertical: 12,
    },
    aboutRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    aboutLabel: {
        fontSize: 14,
    },
    aboutValue: {
        fontSize: 14,
        fontWeight: '600',
    },
    logoutButton: {
        backgroundColor: '#EF4444',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 16,
    },
    logoutButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
