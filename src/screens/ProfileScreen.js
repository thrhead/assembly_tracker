import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import authService from '../services/auth.service';
import RoleBadge from '../components/RoleBadge';
import GlassCard from '../components/ui/GlassCard';
import { COLORS } from '../constants/theme';

export default function ProfileScreen({ navigation }) {
    const { user, logout } = useAuth();
    const { theme, isDark, toggleTheme } = useTheme();
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    const handlePasswordChange = async () => {
        if (newPassword !== confirmPassword) {
            Alert.alert('Hata', 'Yeni şifreler eşleşmiyor.');
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert('Hata', 'Yeni şifre en az 6 karakter olmalıdır.');
            return;
        }

        try {
            await authService.changePassword(oldPassword, newPassword);
            Alert.alert('Başarılı', 'Şifreniz başarıyla değiştirildi.');
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.error('Password change error:', error);
            Alert.alert('Hata', error.message || 'Şifre değiştirilemedi.');
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
            if (window.confirm('Çıkış yapmak istediğinize emin misiniz?')) {
                performLogout();
            }
        } else {
            Alert.alert(
                'Çıkış Yap',
                'Çıkmak istediğinize emin misiniz?',
                [
                    { text: 'İptal', style: 'cancel' },
                    {
                        text: 'Çıkış Yap',
                        style: 'destructive',
                        onPress: performLogout
                    }
                ]
            );
        }
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Şifre Değiştir</Text>
                <GlassCard style={styles.card} theme={theme}>
                    <View style={styles.inputGroup}>
                        <Text style={[styles.inputLabel, { color: theme.colors.subText }]}>Mevcut Şifre</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', color: theme.colors.text, borderColor: theme.colors.border }]}
                            placeholder="Mevcut şifrenizi girin"
                            placeholderTextColor={theme.colors.subText}
                            secureTextEntry
                            value={oldPassword}
                            onChangeText={setOldPassword}
                        />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={[styles.inputLabel, { color: theme.colors.subText }]}>Yeni Şifre</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', color: theme.colors.text, borderColor: theme.colors.border }]}
                            placeholder="Yeni şifrenizi girin"
                            placeholderTextColor={theme.colors.subText}
                            secureTextEntry
                            value={newPassword}
                            onChangeText={setNewPassword}
                        />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={[styles.inputLabel, { color: theme.colors.subText }]}>Yeni Şifre (Tekrar)</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', color: theme.colors.text, borderColor: theme.colors.border }]}
                            placeholder="Yeni şifrenizi tekrar girin"
                            placeholderTextColor={theme.colors.subText}
                            secureTextEntry
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                        />
                    </View>
                    <TouchableOpacity style={[styles.changePasswordButton, { backgroundColor: theme.colors.primary }]} onPress={handlePasswordChange}>
                        <Text style={styles.changePasswordButtonText}>Şifreyi Değiştir</Text>
                    </TouchableOpacity>
                </GlassCard>
            </View>

            {/* App Settings Section */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Uygulama Ayarları</Text>
                <GlassCard style={styles.card} theme={theme}>
                    <View style={styles.settingRow}>
                        <View style={styles.settingInfo}>
                            <Text style={[styles.settingTitle, { color: theme.colors.text }]}>Karanlık Mod (Dark Mode)</Text>
                            <Text style={[styles.settingDescription, { color: theme.colors.subText }]}>Uygulama temasını değiştir</Text>
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
                            <Text style={[styles.settingTitle, { color: theme.colors.text }]}>Bildirimler</Text>
                            <Text style={[styles.settingDescription, { color: theme.colors.subText }]}>Yakında aktif olacak</Text>
                        </View>
                        <Switch
                            value={notificationsEnabled}
                            onValueChange={setNotificationsEnabled}
                            disabled
                            trackColor={{ false: '#D1D5DB', true: '#86EFAC' }}
                            thumbColor={notificationsEnabled ? '#16A34A' : '#9CA3AF'}
                        />
                    </View>
                </GlassCard>
            </View>

            {/* About Section */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Hakkında</Text>
                <GlassCard style={styles.card} theme={theme}>
                    <View style={[styles.aboutRow, { borderBottomColor: theme.colors.border }]}>
                        <Text style={[styles.aboutLabel, { color: theme.colors.subText }]}>Versiyon</Text>
                        <Text style={[styles.aboutValue, { color: theme.colors.text }]}>1.0.0</Text>
                    </View>
                    <View style={styles.aboutRow}>
                        <Text style={[styles.aboutLabel, { color: theme.colors.subText }]}>Build</Text>
                        <Text style={[styles.aboutValue, { color: theme.colors.text }]}>100</Text>
                    </View>
                </GlassCard>
            </View>

            {/* Logout Button */}
            <View style={styles.section}>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutButtonText}>🚪 Çıkış Yap</Text>
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
