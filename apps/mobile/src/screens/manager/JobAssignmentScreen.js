import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import jobService from '../../services/job.service';
// import { COLORS } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import StatsSummary from '../../components/manager/StatsSummary';
import JobReportList from '../../components/manager/JobReportList';

export default function JobAssignmentScreen({ navigation }) {
    const { theme, isDark } = useTheme();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const jobsData = await jobService.getAll();
            setJobs(jobsData);
        } catch (error) {
            console.error('Error loading data:', error);
            Alert.alert('Hata', 'Veriler yüklenemedi');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const stats = useMemo(() => {
        const total = jobs.length;
        const active = jobs.filter(j => j.status === 'IN_PROGRESS').length;
        const completed = jobs.filter(j => j.status === 'COMPLETED').length;
        const pending = jobs.filter(j => j.status === 'PENDING').length;

        const totalRevenue = jobs
            .filter(j => j.status === 'COMPLETED')
            .reduce((sum, j) => sum + (j.price || 0), 0);

        return { total, active, completed, pending, totalRevenue };
    }, [jobs]);

    if (loading) {
        return (
            <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={[styles.loadingText, { color: theme.colors.subText }]}>Yükleniyor...</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialIcons name="arrow-back-ios" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>İş Analizi & Raporlar</Text>
                <View style={{ width: 48 }} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
                }
            >
                <StatsSummary stats={stats} theme={theme} />

                <JobReportList
                    jobs={jobs}
                    onJobPress={(id) => navigation.navigate('JobDetail', { jobId: id })}
                    theme={theme}
                />
            </ScrollView>

            {/* FAB */}
            <TouchableOpacity
                style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                onPress={() => navigation.navigate('CreateJob')}
                activeOpacity={0.8}
            >
                <MaterialIcons name="add" size={28} color={theme.colors.textInverse} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
    },
    scrollView: {
        flex: 1,
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
});
