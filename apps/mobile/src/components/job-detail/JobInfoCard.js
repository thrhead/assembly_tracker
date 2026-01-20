import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { formatDate } from '../../utils';
import GlassCard from '../ui/GlassCard';

const JobInfoCard = ({ job }) => {
    const { theme } = useTheme();

    if (!job) return null;

    return (
        <GlassCard style={styles.card} theme={theme}>
            <Text style={[styles.jobTitle, { color: theme.colors.text }]}>{job.title}</Text>
            <View style={styles.infoRow}>
                <MaterialIcons name="business" size={16} color={theme.colors.subText} />
                <Text style={[styles.infoText, { color: theme.colors.subText }]}>Müşteri: {job.customer?.name || 'Müşteri'}</Text>
            </View>
            <View style={styles.infoRow}>
                <MaterialIcons name="description" size={16} color={theme.colors.subText} />
                <Text style={[styles.description, { color: theme.colors.subText }]}>{job.description}</Text>
            </View>
            {job.startedAt && (
                <View style={styles.infoRow}>
                    <MaterialIcons name="play-circle-outline" size={16} color={theme.colors.primary} />
                    <Text style={[styles.infoText, { color: theme.colors.subText }]}>Başlangıç: {formatDate(job.startedAt)}</Text>
                </View>
            )}
            {job.completedDate && (
                <View style={styles.infoRow}>
                    <MaterialIcons name="check-circle-outline" size={16} color={theme.colors.success} />
                    <Text style={[styles.infoText, { color: theme.colors.subText }]}>Bitiş: {formatDate(job.completedDate)}</Text>
                </View>
            )}
        </GlassCard>
    );
};

const styles = StyleSheet.create({
    card: {
        padding: 16,
        marginBottom: 16,
    },
    jobTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoText: {
        marginLeft: 8,
        fontSize: 14,
    },
    description: {
        fontSize: 14,
        lineHeight: 20,
        marginTop: 8,
    },
});

export default JobInfoCard;
