import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

const CustomDrawer = ({ visible, onClose, user, navItems, onNavigate, onLogout }) => {
    const { theme } = useTheme();

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <View style={[styles.drawerContainer, { backgroundColor: theme.colors.card, borderRightColor: theme.colors.cardBorder }]}>
                    <View style={[styles.drawerHeader, { borderBottomColor: theme.colors.cardBorder }]}>
                        <View style={styles.drawerAvatarContainer}>
                            <Text style={styles.drawerAvatarText}>
                                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                            </Text>
                        </View>
                        <Text style={styles.drawerName}>{user?.name || 'Admin'}</Text>
                        <Text style={styles.drawerRole}>Yönetici</Text>
                    </View>
                    <View style={styles.drawerItems}>
                        {navItems.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={styles.drawerItem}
                                onPress={() => onNavigate(item.route)}
                            >
                                <MaterialIcons name={item.icon} size={24} color={item.color} />
                                <Text style={styles.drawerItemText}>{item.title}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
                        <MaterialIcons name="logout" size={24} color={COLORS.red500} />
                        <Text style={styles.logoutText}>Çıkış Yap</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-start',
    },
    drawerContainer: {
        width: '70%',
        height: '100%',
        padding: 20,
        paddingTop: 50,
        borderRightWidth: 1,
    },
    drawerHeader: {
        alignItems: 'center',
        marginBottom: 30,
        borderBottomWidth: 1,
        paddingBottom: 20,
    },
    drawerAvatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.slate800,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    drawerAvatarText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    drawerName: {
        color: COLORS.textLight,
        fontSize: 18,
        fontWeight: 'bold',
    },
    drawerRole: {
        color: COLORS.primary,
        fontSize: 14,
    },
    drawerItems: {
        gap: 8,
    },
    drawerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        gap: 16,
    },
    drawerItemText: {
        color: COLORS.textLight,
        fontSize: 16,
        fontWeight: '500',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        marginTop: 'auto',
        gap: 16,
        borderTopWidth: 1,
        borderTopColor: COLORS.slate800,
        paddingTop: 20,
    },
    logoutText: {
        color: COLORS.red500,
        fontSize: 16,
        fontWeight: '600',
    },
});

export default CustomDrawer;
