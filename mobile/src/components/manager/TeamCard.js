import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

const TeamCard = ({ item, onEdit, onDelete, isAdmin }) => {
    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.teamIcon}>
                    <MaterialIcons name="groups" size={24} color={COLORS.black} />
                </View>
                <View style={styles.teamInfo}>
                    <Text style={styles.teamName}>{item.name}</Text>
                    {item.description && (
                        <Text style={styles.teamDescription}>{item.description}</Text>
                    )}
                </View>
                {isAdmin && (
                    <View style={{ flexDirection: 'row' }}>
                        <TouchableOpacity
                            onPress={() => onEdit(item)}
                            style={styles.editIcon}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <MaterialIcons name="edit" size={20} color={COLORS.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => onDelete(item)}
                            style={[styles.editIcon, { marginLeft: 8 }]}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <MaterialIcons name="delete" size={20} color={COLORS.error || '#FF4444'} />
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <View style={styles.teamSection}>
                <Text style={styles.sectionTitle}>Ekip Lideri:</Text>
                <Text style={styles.sectionText}>
                    {item.lead?.name || 'Atanmamış'}
                </Text>
            </View>

            <View style={styles.teamSection}>
                <Text style={styles.sectionTitle}>Ekip Üyeleri ({item.members?.length || 0}):</Text>
                {item.members && item.members.length > 0 ? (
                    <View style={styles.membersList}>
                        {item.members.map((member) => (
                            <Text key={member.id} style={styles.memberItem}>
                                • {member.user.name} ({member.user.role === 'WORKER' ? 'İşçi' : 'Ekip Lideri'})
                            </Text>
                        ))}
                    </View>
                ) : (
                    <Text style={styles.emptyMembersText}>Henüz üye eklenmemiş</Text>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.cardDark,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.slate800,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    teamIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    teamInfo: {
        flex: 1,
    },
    teamName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textLight,
        marginBottom: 4,
    },
    teamDescription: {
        fontSize: 13,
        color: COLORS.slate400,
        fontStyle: 'italic',
    },
    teamSection: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: COLORS.slate800,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.primary,
        marginBottom: 6,
    },
    sectionText: {
        fontSize: 14,
        color: COLORS.textLight,
    },
    membersList: {
        marginTop: 4,
    },
    memberItem: {
        fontSize: 14,
        color: COLORS.textLight,
        marginBottom: 4,
        paddingLeft: 8,
    },
    emptyMembersText: {
        fontSize: 14,
        color: COLORS.slate400,
        fontStyle: 'italic',
    },
    editIcon: {
        padding: 8,
    },
});

export default TeamCard;
