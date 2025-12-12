import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/theme';
import CustomInput from './CustomInput';
import CustomButton from './CustomButton';
import { API_BASE_URL } from '../services/api';

const LoginForm = ({ onBack, onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Hata', 'Lütfen e-posta ve şifre giriniz.');
            return;
        }

        setLoading(true);
        const result = await login(email, password);
        setLoading(false);

        if (result.success) {
            if (onLoginSuccess) onLoginSuccess();
        } else {
            console.error('Login Failed:', result);
            Alert.alert(
                'Giriş Hatası',
                `${result.error || 'Bir hata oluştu'}`
            );
        }
    };

    return (
        <View style={styles.loginFormContainer}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
                <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
                <Text style={{ color: COLORS.primary, marginLeft: 5 }}>Geri</Text>
            </TouchableOpacity>

            <Text style={styles.loginTitle}>Giriş Yap</Text>
            {__DEV__ && (
                <Text style={styles.debugText}>API: {API_BASE_URL}</Text>
            )}

            <CustomInput
                placeholder="E-posta"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
            />

            <CustomInput
                placeholder="Şifre"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                rightIcon={showPassword ? 'visibility' : 'visibility-off'}
                onRightIconPress={() => setShowPassword(!showPassword)}
                editable={!loading}
            />

            <CustomButton
                title="Giriş Yap"
                onPress={handleLogin}
                loading={loading}
                style={{ marginTop: 10 }}
            />

            {__DEV__ && (
                <View style={styles.hintContainer}>
                    <Text style={styles.hint}>Admin: admin@montaj.com / admin123</Text>
                    <Text style={styles.hint}>Worker: worker@montaj.com / worker123</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    loginFormContainer: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    backButton: {
        position: 'absolute',
        top: 20,
        left: 20,
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 10,
    },
    loginTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 30,
        textAlign: 'center',
    },
    debugText: {
        color: 'gray',
        textAlign: 'center',
        fontSize: 10,
        marginBottom: 10
    },
    hintContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    hint: {
        textAlign: 'center',
        color: COLORS.slate500,
        fontSize: 12,
    },
});

export default LoginForm;
