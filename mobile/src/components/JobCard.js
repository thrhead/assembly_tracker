import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

const { width } = Dimensions.get('window');

const JobCard = ({ job, onPress }) => {
    const isInProgress = job.status === 'In Progress';

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.header}>
                <View style={[
                    styles.statusBadge,
                    isInProgress ? styles.statusInProgress : styles.statusPending
                ]}>
                    <Text style={[
                        styles.statusText,
                        isInProgress ? styles.textInProgress : styles.textPending
                    ]}>
                        {isInProgress ? 'Devam Ediyor' : 'Bekliyor'}
                    </Text>
                </View>
                <MaterialIcons name="more-horiz" size={20} color={COLORS.slate500} />
            </View>

            <Text style={styles.title} numberOfLines={2}>{job.title}</Text>

            <View style={styles.infoContainer}>
                <View style={styles.infoRow}>
                    <MaterialIcons name="location-on" size={16} color={COLORS.slate500} />
                    <Text style={styles.infoText}>{job.location}</Text>
                </View>
                {job.time && (
                    <View style={styles.infoRow}>
                        <MaterialIcons name="access-time" size={16} color={COLORS.slate500} />
                        <Text style={styles.infoText}>{job.time}</Text>
                    </View>
                )}
            </View>

            <View style={styles.progressContainer}>
                <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${job.progress || 0}%` }]} />
                </View>
                <Text style={styles.progressText}>{job.progress || 0}%</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        width: width * 0.7,
        backgroundColor: COLORS.cardDark,
        borderRadius: 16,
        padding: 16,
        marginRight: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusInProgress: {
        backgroundColor: 'rgba(204, 255, 4, 0.1)',
    },
    statusPending: {
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    textInProgress: {
        color: COLORS.primary,
    },
    textPending: {
        color: COLORS.amber500,
    },
    title: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
        height: 44, // Fixed height for 2 lines
    },
    infoContainer: {
        gap: 8,
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    infoText: {
        color: COLORS.slate400,
        fontSize: 14,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 'auto',
    },
    progressBarBg: {
        flex: 1,
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 3,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: COLORS.primary,
        borderRadius: 3,
    },
    progressText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: '600',
    },
});

export default JobCard;
