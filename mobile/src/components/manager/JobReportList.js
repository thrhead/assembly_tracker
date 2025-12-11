import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { getStatusColor, getStatusLabel, getPriorityColor } from '../../utils/status-helper';

const JobReportList = ({ jobs, onJobPress }) => {
    return (
        <View>
            <View style={styles.listHeader}>
                <Text style={styles.sectionTitle}>Detaylı İşler</Text>
                <Text style={styles.jobCount}>{jobs.length} İş</Text>
            </View>

            {jobs.map((job) => (
                <TouchableOpacity
                    key={job.id}
                    style={styles.jobCard}
                    onPress={() => onJobPress(job.id)}
                >
                    <View style={styles.jobCardContent}>
                        <View style={styles.jobLeft}>
                            <Text style={styles.jobTitle}>{job.title}</Text>
                            <Text style={styles.jobCustomer}>{job.customer?.company || 'Müşteri Bilinmiyor'}</Text>
                            <View style={styles.jobMeta}>
                                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(job.status) + '20' }]}>
                                    <Text style={[styles.statusText, { color: getStatusColor(job.status) }]}>
                                        {getStatusLabel(job.status)}
                                    </Text>
                                </View>
                                {job.priority && (
                                    <View style={[styles.priorityBadge, { borderColor: getPriorityColor(job.priority) }]}>
                                        <Text style={[styles.priorityText, { color: getPriorityColor(job.priority) }]}>
                                            {job.priority}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>
                        <MaterialIcons name="chevron-right" size={24} color={COLORS.slate500} />
                    </View>
                </TouchableOpacity>
            ))}

            {jobs.length === 0 && (
                <View style={styles.emptyState}>
                    <MaterialIcons name="work-outline" size={64} color={COLORS.slate600} />
                    <Text style={styles.emptyText}>Henüz iş eklenmemiş</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textLight,
    },
    jobCount: {
        fontSize: 14,
        color: COLORS.slate400,
    },
    jobCard: {
        backgroundColor: COLORS.cardDark,
        borderWidth: 1,
        borderColor: COLORS.slate800,
        borderRadius: 12,
        marginHorizontal: 16,
        marginBottom: 12,
        padding: 16,
    },
    jobCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    jobLeft: {
        flex: 1,
    },
    jobTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textLight,
        marginBottom: 4,
    },
    jobCustomer: {
        fontSize: 14,
        color: COLORS.slate400,
        marginBottom: 8,
    },
    jobMeta: {
        flexDirection: 'row',
        gap: 8,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    priorityBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
    },
    priorityText: {
        fontSize: 12,
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 64,
    },
    emptyText: {
        fontSize: 16,
        color: COLORS.slate500,
        marginTop: 16,
    },
});

export default JobReportList;
