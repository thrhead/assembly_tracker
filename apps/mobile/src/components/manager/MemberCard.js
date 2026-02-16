import React, { memo } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/theme';

const MemberCard = ({ item, theme }) => {
    return (
        <View style={[styles.memberCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <View style={styles.memberHeader}>
                <View style={[
                    styles.avatar,
                    { backgroundColor: item.user.isActive ? theme.colors.primary : theme.colors.disabled }
                ]}>
                    <Text style={[styles.avatarText, { color: theme.colors.textInverse }]}>
                        {item.user.name ? item.user.name.charAt(0).toUpperCase() : 'U'}
                    </Text>
                </View>
                <View style={styles.memberInfo}>
                    <View style={styles.memberNameRow}>
                        <Text style={[styles.memberName, { color: theme.colors.text }]}>{item.user.name}</Text>
                        <View style={[
                            styles.statusBadge,
                            { backgroundColor: item.user.isActive ? theme.colors.primary + '20' : theme.colors.surface }
                        ]}>
                            <Text style={[
                                styles.statusText,
                                { color: item.user.isActive ? theme.colors.primary : theme.colors.subText }
                            ]}>
                                {item.user.isActive ? 'Aktif' : 'Pasif'}
                            </Text>
                        </View>
                    </View>
                    <Text style={[styles.memberEmail, { color: theme.colors.subText }]}>{item.user.email}</Text>
                    <Text style={[styles.memberRole, { color: theme.colors.subText }]}>{item.user.role}</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    memberCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
    },
    memberHeader: {
        flexDirection: 'row',
        marginBottom: 0,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    memberInfo: {
        flex: 1,
    },
    memberNameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    memberName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textLight,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    memberEmail: {
        fontSize: 14,
        color: COLORS.slate400,
    },
    memberRole: {
        fontSize: 12,
        color: COLORS.slate400,
        marginTop: 2,
    },
});

export default memo(MemberCard);
