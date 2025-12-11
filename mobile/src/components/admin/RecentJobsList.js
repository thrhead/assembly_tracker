import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

const RecentJobsList = ({ jobs, onJobPress, onViewAll }) => {
    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Son İşler</Text>
                <TouchableOpacity onPress={onViewAll}>
                    <Text style={styles.seeAllText}>Tümünü Gör</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.recentList}>
                {jobs.length === 0 ? (
                    <Text style={{ color: '#aaa', fontStyle: 'italic', padding: 8 }}>Henüz iş bulunmuyor.</Text>
                ) : (
                    jobs.map((job) => (
                        <TouchableOpacity
                            key={job.id}
                            style={styles.recentItem}
                            onPress={() => onJobPress(job.id)}
                        >
                            <View style={[styles.recentIcon, { backgroundColor: job.status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(204, 255, 4, 0.1)' }]}>
                                <MaterialIcons name="work" size={20} color={job.status === 'COMPLETED' ? COLORS.green500 : COLORS.primary} />
                            </View>
                            <View style={styles.recentInfo}>
                                <Text style={styles.recentTitle} numberOfLines={1}>
                                    {job.customer?.company ? `${job.customer.company} - ` : ''}{job.title}
                                </Text>
                                <Text style={styles.recentSubtitle}>
                                    {job.status} • {new Date(job.createdAt).toLocaleDateString('tr-TR')}
                                </Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={20} color={COLORS.slate600} />
                        </TouchableOpacity>
                    ))
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    section: {
        padding: 16,
        paddingTop: 4,
        gap: 12,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.textLight,
        marginBottom: 8,
    },
    seeAllText: {
        color: COLORS.primary,
        fontSize: 12,
        fontWeight: '600',
    },
    recentList: {
        gap: 8,
    },
    recentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.cardDark,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.slate800,
    },
    recentIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(204, 255, 4, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    recentInfo: {
        flex: 1,
    },
    recentTitle: {
        color: COLORS.textLight,
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2,
    },
    recentSubtitle: {
        color: COLORS.slate400,
        fontSize: 12,
    },
});

export default RecentJobsList;
