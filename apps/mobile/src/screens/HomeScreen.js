import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import GlassCard from '../components/ui/GlassCard';

export default function HomeScreen({ navigation }) {
    const { user, logout } = useAuth();
    const { theme } = useTheme();

    return (
        <View style={{ flex: 1 }}>
            <LinearGradient
                colors={theme.gradients.primary}
                style={StyleSheet.absoluteFill}
            />
            <View style={styles.container}>
                <GlassCard style={styles.content}>
                    <Text style={[styles.text, { color: theme.colors.text }]}>Hoşgeldiniz!</Text>
                    <Text style={[styles.subtext, { color: theme.colors.subText }]}>Kullanıcı: {user?.email || 'Bilinmiyor'}</Text>
                    <Text style={[styles.subtext, { color: theme.colors.subText }]}>Rol: {user?.role || 'Bilinmiyor'}</Text>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: theme.colors.success }]}
                            onPress={() => navigation.navigate('WorkerJobs')}
                        >
                            <MaterialIcons name="work" size={20} color={theme.colors.textInverse} />
                            <Text style={[styles.buttonText, { color: theme.colors.textInverse }]}>İşlerim</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: theme.colors.error || 'red', marginTop: 12 }]}
                        onPress={logout}
                    >
                        <MaterialIcons name="logout" size={20} color={theme.colors.textInverse} />
                        <Text style={[styles.buttonText, { color: theme.colors.textInverse }]}>Çıkış Yap</Text>
                    </TouchableOpacity>
                </GlassCard>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    content: {
        padding: 24,
        alignItems: 'center',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subtext: {
        fontSize: 16,
        marginBottom: 8,
    },
    buttonContainer: {
        width: '100%',
        marginTop: 20,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        width: '100%',
        gap: 8,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
