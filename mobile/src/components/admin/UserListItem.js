import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

const UserListItem = ({ item, onEdit, onDelete }) => {
    return (
        <View style={styles.userCard}>
            <View style={styles.userIcon}>
                <Text style={styles.userIconText}>{item.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.name}</Text>
                <Text style={styles.userEmail}>{item.email}</Text>
                <View style={styles.roleContainer}>
                    <Text style={styles.userRole}>{item.role}</Text>
                </View>
            </View>
            <View style={styles.actionButtons}>
                <TouchableOpacity onPress={() => onEdit(item)} style={styles.actionButton}>
                    <MaterialIcons name="edit" size={20} color={COLORS.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onDelete(item)} style={styles.actionButton}>
                    <MaterialIcons name="delete" size={20} color={COLORS.red500} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.cardDark,
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.slate800,
    },
    userIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.slate800,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        borderWidth: 1,
        borderColor: COLORS.slate700,
    },
    userIconText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textLight,
        marginBottom: 2,
    },
    userEmail: {
        fontSize: 12,
        color: COLORS.slate400,
        marginBottom: 4,
    },
    roleContainer: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(204, 255, 4, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    userRole: {
        fontSize: 10,
        fontWeight: '600',
        color: COLORS.primary,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        padding: 8,
    },
});

export default UserListItem;
