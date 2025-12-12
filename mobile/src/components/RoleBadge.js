import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getRoleBadgeColor, getRoleText } from '../utils/role-helper';

const RoleBadge = ({ role }) => {
    return (
        <View style={[styles.roleBadge, { backgroundColor: getRoleBadgeColor(role) }]}>
            <Text style={styles.roleText}>{getRoleText(role)}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    roleBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    roleText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
});

export default RoleBadge;
