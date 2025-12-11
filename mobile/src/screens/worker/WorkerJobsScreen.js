import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    SafeAreaView,
    StatusBar,
    Alert
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import { useAuth } from '../../context/AuthContext';
import jobService from '../../services/job.service';
import { COLORS } from '../../constants/theme';
import JobListItem from '../../components/JobListItem';
import CreateJobModal from '../../components/modals/CreateJobModal';
import UploadJobModal from '../../components/modals/UploadJobModal';
import { useJobFiltering } from '../../hooks/useJobFiltering';
import JobFilterTabs from '../../components/worker/JobFilterTabs';
import JobSearchHeader from '../../components/worker/JobSearchHeader';

export default function WorkerJobsScreen() {
    const navigation = useNavigation();
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    // Modal States
    const [modalVisible, setModalVisible] = useState(false);
    const [uploadModalVisible, setUploadModalVisible] = useState(false);

    const isAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER';

    // Fetch jobs
    const fetchJobs = useCallback(async () => {
        try {
            const data = isAdmin ? await jobService.getAllJobs() : await jobService.getMyJobs();
            setJobs(data);
        } catch (error) {
            console.error('Error fetching jobs:', error);
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
        await fetchJobs();
        setRefreshing(false);
    };

    const renderItem = useCallback(({ item }) => (
        <JobListItem
            item={item}
            onPress={(job) => navigation.navigate('JobDetail', { jobId: job.id })}
        />
    ), [navigation]);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.backgroundDark} />

            <JobSearchHeader
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
            />

            <JobFilterTabs
                selectedFilter={selectedFilter}
                onSelectFilter={setSelectedFilter}
            />

            <FlatList
                style={{ flex: 1 }}
                data={filteredJobs}
                renderItem={renderItem}
                keyExtractor={item => item.id?.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.neonGreen} />}
                initialNumToRender={10}
                windowSize={5}
                maxToRenderPerBatch={10}
                removeClippedSubviews={true}
                ListEmptyComponent={<View style={styles.emptyContainer}><Text style={styles.emptyText}>Görev bulunamadı.</Text></View>}
            />

            {isAdmin && (
                <View style={styles.fabContainer}>
                    <TouchableOpacity style={[styles.fab, styles.excelFab]} onPress={() => setUploadModalVisible(true)}>
                        <MaterialCommunityIcons name="file-excel-box" size={28} color={COLORS.white} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
                        <MaterialIcons name="add" size={30} color={COLORS.black} />
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
    container: { flex: 1, backgroundColor: COLORS.backgroundDark },
    listContent: { padding: 16, paddingTop: 0, paddingBottom: 100 },
    fabContainer: { position: 'absolute', bottom: 24, right: 24, alignItems: 'center' },
    fab: { width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.neonGreen, alignItems: 'center', justifyContent: 'center', shadowColor: COLORS.neonGreen, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 10 },
    excelFab: { marginBottom: 16, backgroundColor: '#3b82f6' },
    emptyContainer: { padding: 20, alignItems: 'center' },
    emptyText: { color: COLORS.textGray },
});
