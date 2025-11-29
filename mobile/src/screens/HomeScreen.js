import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function HomeScreen({ navigation }) {
    const { user, logout } = useAuth();

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Hoşgeldiniz!</Text>
            <Text style={styles.subtext}>Kullanıcı: {user?.email || 'Bilinmiyor'}</Text>
            <Text style={styles.subtext}>Rol: {user?.role || 'Bilinmiyor'}</Text>

            <View style={styles.buttonContainer}>
                <Button
                    title="İşlerim"
                    onPress={() => navigation.navigate('WorkerJobs')}
                    color="#16A34A"
                />
            </View>

            <Button
                title="Çıkış Yap"
                onPress={logout}
                color="red"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#010100',
        padding: 20,
    },
    text: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#ffffff',
    },
    subtext: {
        fontSize: 16,
        color: '#94a3b8',
        marginBottom: 20,
    },
    buttonContainer: {
        width: '100%',
        marginBottom: 10,
    },
});
