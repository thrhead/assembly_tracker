import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    StatusBar,
    Alert,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import jobService from '../../services/job.service';
import JobListItem from '../../components/JobListItem';
import CreateJobModal from '../../components/modals/CreateJobModal';
import UploadJobModal from '../../components/modals/UploadJobModal';
import { useJobFiltering } from '../../hooks/useJobFiltering';
import JobFilterTabs from '../../components/worker/JobFilterTabs';
import JobSearchHeader from '../../components/worker/JobSearchHeader';

export default function WorkerJobsScreen() {
    const navigation = useNavigation();
    const { user } = useAuth();
    const { theme, isDark } = useTheme();

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Modal States
    const [modalVisible, setModalVisible] = useState(false);
    const [uploadModalVisible, setUploadModalVisible] = useState(false);

    const isAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER';

    // Fetch jobs
    const fetchJobs = useCallback(async () => {
        try {
            setLoading(true);
            const data = isAdmin ? await jobService.getAllJobs() : await jobService.getMyJobs();
            setJobs(data);
        } catch (error) {
            console.error('Error fetching jobs:', error);
            Alert.alert('Hata', 'Görevler yüklenirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    }, [isAdmin]);

    useFocusEffect(
        useCallback(() => {
            fetchJobs();
        }, [fetchJobs])
    );

    // Filtering Hook
    const {
        filteredJobs,
        selectedFilter,
        setSelectedFilter,
        searchQuery,
        setSearchQuery
    } = useJobFiltering(jobs);

    const onRefresh = async () => {
        setRefreshing(true);
        // Do not set global loading true on refresh to keep list visible
        try {
            const data = isAdmin ? await jobService.getAllJobs() : await jobService.getMyJobs();
            setJobs(data);
        } catch (error) {
            console.error('Error refreshing jobs:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const renderItem = useCallback(({ item }) => (
        <JobListItem
            item={item}
            onPress={(job) => navigation.navigate('JobDetail', { jobId: job.id })}
        />
    ), [navigation]);

    if (loading && !refreshing && jobs.length === 0) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background, minHeight: 0 }]}>
                <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} />
                <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }]}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background, minHeight: 0 }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} />

            <JobSearchHeader
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                theme={theme}
            />

            <JobFilterTabs
                selectedFilter={selectedFilter}
                onSelectFilter={setSelectedFilter}
                theme={theme}
            />

            <FlatList
                style={{ flex: 1 }}
                data={filteredJobs}
                renderItem={renderItem}
                keyExtractor={item => item.id?.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
                initialNumToRender={10}
                windowSize={5}
                maxToRenderPerBatch={10}
                removeClippedSubviews={Platform.OS === 'android'}
                ListEmptyComponent={<View style={styles.emptyContainer}><Text style={[styles.emptyText, { color: theme.colors.subText }]}>Görev bulunamadı.</Text></View>}
            />

            {isAdmin && (
                <View style={styles.fabContainer}>
                    <TouchableOpacity style={[styles.fab, { backgroundColor: '#3b82f6', marginBottom: 16 }]} onPress={() => setUploadModalVisible(true)}>
                        <MaterialCommunityIcons name="file-excel-box" size={28} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.fab, { backgroundColor: theme.colors.primary, shadowColor: theme.colors.primary }]} onPress={() => setModalVisible(true)}>
                        <MaterialIcons name="add" size={30} color={theme.colors.textInverse || '#fff'} />
                    </TouchableOpacity>
                </View>
            )}

            <UploadJobModal
                visible={uploadModalVisible}
                onClose={() => setUploadModalVisible(false)}
            />

            <CreateJobModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSuccess={() => {
                    setModalVisible(false);
                    onRefresh();
                    Alert.alert('Başarılı', 'İş oluşturuldu.');
                }}
            />

        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    listContent: { padding: 16, paddingTop: 0, paddingBottom: 100, flexGrow: 1 },
    fabContainer: { position: 'absolute', bottom: 24, right: 24, alignItems: 'center' },
    fab: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 10 },
    excelFab: { marginBottom: 16, backgroundColor: '#3b82f6' },
    emptyContainer: { padding: 20, alignItems: 'center' },
    emptyText: { fontWeight: '600' },
});
