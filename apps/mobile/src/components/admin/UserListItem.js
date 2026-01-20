import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

const UserListItem = ({ item, onEdit, onDelete, theme }) => {
    // Fallback if theme prop isn't passed
    const cardBg = theme ? theme.colors.card : COLORS.cardDark;
    const borderColor = theme ? theme.colors.border : COLORS.slate800;
    const textMain = theme ? theme.colors.text : COLORS.textLight;
    const textSub = theme ? theme.colors.subText : COLORS.slate400;
    const primary = theme ? theme.colors.primary : COLORS.primary;

    return (
        <View style={[styles.userCard, { backgroundColor: cardBg, borderColor: borderColor }]}>
            <View style={[styles.userIcon, { backgroundColor: theme ? theme.colors.background : COLORS.slate800, borderColor: borderColor }]}>
                <Text style={[styles.userIconText, { color: primary }]}>{item.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: textMain }]}>{item.name}</Text>
                <Text style={[styles.userEmail, { color: textSub }]}>{item.email}</Text>
                <View style={[styles.roleContainer, { backgroundColor: primary + '15' }]}>
                    <Text style={[styles.userRole, { color: primary }]}>{item.role}</Text>
                </View>
            </View>
            <View style={styles.actionButtons}>
                <TouchableOpacity onPress={() => onEdit(item)} style={styles.actionButton}>
                    <MaterialIcons name="edit" size={20} color={primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onDelete(item)} style={styles.actionButton}>
                    <MaterialIcons name="delete" size={20} color={theme ? theme.colors.error : COLORS.red500} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
    },
    userIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        borderWidth: 1,
    },
    userIconText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    userEmail: {
        fontSize: 12,
        marginBottom: 4,
    },
    roleContainer: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    userRole: {
        fontSize: 10,
        fontWeight: '600',
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
