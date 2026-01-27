import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { CircleDot, Clock, MoreHorizontal, MapPin } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const JobCard = ({ job, onPress, style }) => {
    const { theme, isDark, SPACING } = useTheme();
    const isInProgress = job.status === 'In Progress' || job.status === 'IN_PROGRESS';

    return (
        <TouchableOpacity
            style={[
                styles.card,
                {
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.cardBorder
                },
                style
            ]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.header}>
                <View style={[
                    styles.statusBadge,
                    isInProgress ?
                        { backgroundColor: theme.colors.primaryBg } :
                        { backgroundColor: theme.colors.warningBg }
                ]}>
                    {isInProgress ? (
                        <CircleDot
                            size={12}
                            color={theme.colors.primary}
                            style={{ marginRight: 4 }}
                        />
                    ) : (
                        <Clock
                            size={12}
                            color={theme.colors.tertiary}
                            style={{ marginRight: 4 }}
                        />
                    )}
                    <Text style={[
                        styles.statusText,
                        isInProgress ?
                            { color: theme.colors.primary } :
                            { color: theme.colors.tertiary }
                    ]}>
                        {isInProgress ? 'Devam Ediyor' : 'Bekliyor'}
                    </Text>
                </View>
                <MoreHorizontal size={20} color={theme.colors.subText} />
            </View>

            <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={2}>{job.title}</Text>

            <View style={styles.infoContainer}>
                <View style={styles.infoRow}>
                    <MapPin size={16} color={theme.colors.subText} />
                    <Text style={[styles.infoText, { color: theme.colors.subText }]}>{job.location}</Text>
                </View>
                {job.time && (
                    <View style={styles.infoRow}>
                        <Clock size={16} color={theme.colors.subText} />
                        <Text style={[styles.infoText, { color: theme.colors.subText }]}>{job.time}</Text>
                    </View>
                )}
            </View>

            <View style={styles.progressContainer}>
                <View style={[styles.progressBarBg, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                    <View style={[styles.progressBarFill, { width: `${job.progress || 0}%`, backgroundColor: theme.colors.primary }]} />
                </View>
                <Text style={[styles.progressText, { color: theme.colors.text }]}>{job.progress || 0}%</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        width: width * 0.7,
        borderRadius: 22, // Modern Rounded
        padding: SPACING.ml, // Was 20
        marginRight: SPACING.m, // Was 16
        borderWidth: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.m, // Was 16
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.sm, // Standardized to 12 (was 10)
        paddingVertical: SPACING.xs, // Was 4
        borderRadius: 8,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: SPACING.sm, // Was 12
        height: 44, // Fixed height for 2 lines
    },
    infoContainer: {
        gap: SPACING.s, // Was 8
        marginBottom: SPACING.ml, // Was 20
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.s, // Was 8
    },
    infoText: {
        fontSize: 13,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm, // Was 12
        marginTop: 'auto',
    },
    progressBarBg: {
        flex: 1,
        height: 6,
        borderRadius: 3,
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    progressText: {
        fontSize: 12,
        fontWeight: '600',
    },
});

export default JobCard;
