import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import authService from '../services/auth.service';
import RoleBadge from '../components/RoleBadge';

export default function ProfileScreen({ navigation }) {
    const { user, logout } = useAuth();
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
        Alert.alert(
            'Çıkış Yap',
            'Çıkmak istediğinize emin misiniz?',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Çıkış Yap',
                    style: 'destructive',
                    onPress: async () => await logout()
                }
            ]
        );
    };

    return (
        <ScrollView style={styles.container}>
            {/* User Info Section */}
            <View style={styles.section}>
                <View style={styles.profileHeader}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </Text>
                    </View>
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>{user?.name || 'Kullanıcı'}</Text>
                        <Text style={styles.userEmail}>{user?.email}</Text>
                        <RoleBadge role={user?.role} />
                    </View>
                </View>
            </View>

            {/* Password Change Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Şifre Değiştir</Text>
                <View style={styles.card}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Mevcut Şifre</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Mevcut şifrenizi girin"
                            secureTextEntry
                            value={oldPassword}
                            onChangeText={setOldPassword}
                        />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Yeni Şifre</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Yeni şifrenizi girin"
                            secureTextEntry
                            value={newPassword}
                            onChangeText={setNewPassword}
                        />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Yeni Şifre (Tekrar)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Yeni şifrenizi tekrar girin"
                            secureTextEntry
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                        />
                    </View>
                    <TouchableOpacity style={styles.changePasswordButton} onPress={handlePasswordChange}>
                        <Text style={styles.changePasswordButtonText}>Şifreyi Değiştir</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* App Settings Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Uygulama Ayarları</Text>
                <View style={styles.card}>
                    <View style={styles.settingRow}>
                        <View style={styles.settingInfo}>
                            <Text style={styles.settingTitle}>Bildirimler</Text>
                            <Text style={styles.settingDescription}>Yakında aktif olacak</Text>
                        </View>
                        <Switch
                            value={notificationsEnabled}
                            onValueChange={setNotificationsEnabled}
                            disabled
                            trackColor={{ false: '#D1D5DB', true: '#86EFAC' }}
                            thumbColor={notificationsEnabled ? '#16A34A' : '#9CA3AF'}
                        />
                    </View>
                </View>
            </View>

            {/* About Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Hakkında</Text>
                <View style={styles.card}>
                    <View style={styles.aboutRow}>
                        <Text style={styles.aboutLabel}>Versiyon</Text>
                        <Text style={styles.aboutValue}>1.0.0</Text>
                    </View>
                    <View style={styles.aboutRow}>
                        <Text style={styles.aboutLabel}>Build</Text>
                        <Text style={styles.aboutValue}>100</Text>
                    </View>
                </View>
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
        backgroundColor: '#010100',
    },
    section: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 12,
    },
    profileHeader: {
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#333',
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
        color: '#ffffff',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: '#94a3b8',
        marginBottom: 8,
    },
    card: {
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#333',
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#e2e8f0',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#2d3748',
        borderWidth: 1,
        borderColor: '#4b5563',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        color: '#ffffff',
    },
    changePasswordButton: {
        backgroundColor: '#3B82F6',
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
    },
    settingInfo: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
        marginBottom: 4,
    },
    settingDescription: {
        fontSize: 12,
        color: '#94a3b8',
    },
    aboutRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    aboutLabel: {
        fontSize: 14,
        color: '#94a3b8',
    },
    aboutValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#ffffff',
    },
    logoutButton: {
        backgroundColor: '#EF4444',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    logoutButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
