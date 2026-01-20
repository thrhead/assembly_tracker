import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

const DashboardBottomNav = ({ navigation }) => {
    return (
        <View style={styles.bottomNav}>
            <TouchableOpacity style={styles.navItem} onPress={() => { }}>
                <MaterialIcons name="dashboard" size={24} color={COLORS.primary} />
                <Text style={[styles.navText, { color: COLORS.primary }]}>Panel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('TeamList')}>
                <MaterialIcons name="group" size={24} color={COLORS.slate400} />
                <Text style={styles.navText}>Ekip</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Jobs')}>
                <MaterialIcons name="list-alt" size={24} color={COLORS.slate400} />
                <Text style={styles.navText}>Görevler</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
                <MaterialIcons name="settings" size={24} color={COLORS.slate400} />
                <Text style={styles.navText}>Ayarlar</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    bottomNav: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: 'rgba(1, 1, 0, 0.95)',
        borderTopWidth: 1,
        borderTopColor: COLORS.slate800,
        paddingVertical: 8,
        paddingBottom: 20,
    },
    navItem: {
        alignItems: 'center',
        gap: 4,
        padding: 8,
    },
    navText: {
        fontSize: 10,
        fontWeight: '500',
        color: COLORS.slate400,
    },
});

export default DashboardBottomNav;
