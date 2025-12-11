import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { formatDate } from '../../utils';

const JobInfoCard = ({ job }) => {
    if (!job) return null;

    return (
        <View style={styles.card}>
            <Text style={styles.jobTitle}>{job.title}</Text>
            <View style={styles.infoRow}>
                <MaterialIcons name="business" size={16} color={COLORS.textGray} />
                <Text style={styles.infoText}>Müşteri: {job.customer?.name || 'Müşteri'}</Text>
            </View>
            <View style={styles.infoRow}>
                <MaterialIcons name="description" size={16} color={COLORS.textGray} />
                <Text style={styles.description}>{job.description}</Text>
            </View>
            {job.startedAt && (
                <View style={styles.infoRow}>
                    <MaterialIcons name="play-circle-outline" size={16} color={COLORS.primary} />
                    <Text style={styles.infoText}>Başlangıç: {formatDate(job.startedAt)}</Text>
                </View>
            )}
            {job.completedDate && (
                <View style={styles.infoRow}>
                    <MaterialIcons name="check-circle-outline" size={16} color={COLORS.green500} />
                    <Text style={styles.infoText}>Bitiş: {formatDate(job.completedDate)}</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.cardDark,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
    },
    jobTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.textLight,
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoText: {
        color: COLORS.textGray,
        marginLeft: 8,
        fontSize: 14,
    },
    description: {
        color: COLORS.textGray,
        fontSize: 14,
        lineHeight: 20,
        marginTop: 8,
    },
});

export default JobInfoCard;
