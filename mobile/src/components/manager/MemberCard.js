import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/theme';

const MemberCard = ({ item }) => {
    return (
        <View style={styles.memberCard}>
            <View style={styles.memberHeader}>
                <View style={[
                    styles.avatar,
                    { backgroundColor: item.user.isActive ? COLORS.primary : COLORS.slate400 }
                ]}>
                    <Text style={styles.avatarText}>
                        {item.user.name ? item.user.name.charAt(0).toUpperCase() : 'U'}
                    </Text>
                </View>
                <View style={styles.memberInfo}>
                    <View style={styles.memberNameRow}>
                        <Text style={styles.memberName}>{item.user.name}</Text>
                        <View style={[
                            styles.statusBadge,
                            { backgroundColor: item.user.isActive ? 'rgba(204, 255, 4, 0.2)' : COLORS.slate700 }
                        ]}>
                            <Text style={[
                                styles.statusText,
                                { color: item.user.isActive ? COLORS.primary : COLORS.slate400 }
                            ]}>
                                {item.user.isActive ? 'Aktif' : 'Pasif'}
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.memberEmail}>{item.user.email}</Text>
                    <Text style={styles.memberRole}>{item.user.role}</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    memberCard: {
        backgroundColor: COLORS.cardDark,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.slate800,
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
        color: COLORS.black,
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

export default MemberCard;
