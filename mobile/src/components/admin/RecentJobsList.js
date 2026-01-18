import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

const RecentJobsList = ({ jobs = [], onJobPress, onViewAll }) => {
    const { theme, isDark } = useTheme();
    const jobsList = Array.isArray(jobs) ? jobs : [];

    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Son İşler</Text>
                <TouchableOpacity onPress={onViewAll}>
                    <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>Tümü</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.recentList}>
                {jobsList.length === 0 ? (
                    <Text style={{ color: theme.colors.subText, fontStyle: 'italic', padding: 8 }}>Henüz iş bulunmuyor.</Text>
                ) : (
                    jobsList.map((job) => (
                        <TouchableOpacity
                            key={job.id}
                            style={[styles.recentItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}
                            onPress={() => onJobPress(job.id)}
                        >
                            <View style={[styles.recentIcon, { backgroundColor: isDark ? 'rgba(204, 255, 4, 0.1)' : 'rgba(45, 91, 255, 0.1)' }]}>
                                <MaterialIcons name="work" size={20} color={theme.colors.primary} />
                            </View>
                            <View style={styles.recentInfo}>
                                <Text style={[styles.recentTitle, { color: theme.colors.text }]} numberOfLines={1}>
                                    {job.customer?.company ? `${job.customer.company} - ` : ''}{job.title}
                                </Text>
                                <Text style={[styles.recentSubtitle, { color: theme.colors.subText }]}>
                                    {job.status} • {new Date(job.createdAt).toLocaleDateString('tr-TR')}
                                </Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={20} color={theme.colors.subText} />
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
        marginBottom: 8,
    },
    seeAllText: {
        fontSize: 12,
        fontWeight: '600',
    },
    recentList: {
        gap: 8,
    },
    recentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
    recentIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    recentInfo: {
        flex: 1,
    },
    recentTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2,
    },
    recentSubtitle: {
        fontSize: 12,
    },
});

export default RecentJobsList;
