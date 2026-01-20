import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const JobCard = ({ job, onPress, style }) => {
    const { theme, isDark } = useTheme();
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
                        { backgroundColor: isDark ? 'rgba(204, 255, 4, 0.1)' : 'rgba(45, 91, 255, 0.1)' } :
                        { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.1)' }
                ]}>
                    <Text style={[
                        styles.statusText,
                        isInProgress ?
                            { color: theme.colors.primary } :
                            { color: theme.colors.tertiary }
                    ]}>
                        {isInProgress ? 'Devam Ediyor' : 'Bekliyor'}
                    </Text>
                </View>
                <MaterialIcons name="more-horiz" size={20} color={theme.colors.subText} />
            </View>

            <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={2}>{job.title}</Text>

            <View style={styles.infoContainer}>
                <View style={styles.infoRow}>
                    <MaterialIcons name="location-on" size={16} color={theme.colors.subText} />
                    <Text style={[styles.infoText, { color: theme.colors.subText }]}>{job.location}</Text>
                </View>
                {job.time && (
                    <View style={styles.infoRow}>
                        <MaterialIcons name="access-time" size={16} color={theme.colors.subText} />
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
        padding: 20,
        marginRight: 16,
        borderWidth: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
        height: 44, // Fixed height for 2 lines
    },
    infoContainer: {
        gap: 8,
        marginBottom: 20,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    infoText: {
        fontSize: 13,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
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
