import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
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

export default function WorkerJobsScreen() {
    const navigation = useNavigation();
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('Tümü');
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);

    // Modal States
    const [modalVisible, setModalVisible] = useState(false);
    const [uploadModalVisible, setUploadModalVisible] = useState(false);

    const isAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER';

    useFocusEffect(
        useCallback(() => {
            fetchJobs();
        }, [isAdmin])
    );

    useEffect(() => {
        // Debounce search only when query changes
        const handler = setTimeout(() => {
            filterJobs();
        }, 300);

        return () => clearTimeout(handler);
    }, [searchQuery]);

    // Re-filter immediately when filter tab or jobs list changes
    useEffect(() => {
        filterJobs();
    }, [jobs, selectedFilter]);


    const fetchJobs = async () => {
        try {
            const data = isAdmin ? await jobService.getAllJobs() : await jobService.getMyJobs();
            setJobs(data);
        } catch (error) {
            console.error('Error fetching jobs:', error);
        }
    };

    const filterJobs = () => {
        let result = jobs;

        // Status Filter
        if (selectedFilter === 'Devam Eden') {
            result = result.filter(j => j.status === 'IN_PROGRESS');
        } else if (selectedFilter === 'Bekleyen') {
            result = result.filter(j => j.status === 'PENDING');
        } else if (selectedFilter === 'Tamamlanan') {
            result = result.filter(j => j.status === 'COMPLETED');
        }

        // Search Filter
        if (searchQuery) {
            const lower = searchQuery.toLowerCase();
            result = result.filter(j =>
                j.title.toLowerCase().includes(lower) ||
                j.customer?.company?.toLowerCase().includes(lower)
            );
        }

        // Sort: High priority first, then date
        result.sort((a, b) => {
            const priorityOrder = { URGENT: 3, HIGH: 2, MEDIUM: 1, LOW: 0 };
            const pDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
            if (pDiff !== 0) return pDiff;
            return new Date(a.scheduledDate) - new Date(b.scheduledDate);
        });

        setFilteredJobs(result);
    };

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

            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <MaterialIcons name="assignment" size={30} color={COLORS.neonGreen} />
                </View>
                {showSearch ? (
                    <TextInput
                        style={styles.searchInput}
                        placeholder="İş ara..."
                        placeholderTextColor={COLORS.textGray}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoFocus
                    />
                ) : (
                    <Text style={styles.headerTitle}>Görevler</Text>
                )}
                <TouchableOpacity
                    style={styles.searchButton}
                    onPress={() => { setShowSearch(!showSearch); if (showSearch) setSearchQuery(''); }}
                >
                    <MaterialIcons name={showSearch ? "close" : "search"} size={24} color={COLORS.neonGreen} />
                </TouchableOpacity>
            </View>

            <View style={styles.filterContainer}>
                <View style={styles.filterWrapper}>
                    {['Tümü', 'Devam Eden', 'Bekleyen', 'Tamamlanan'].map((filter) => (
                        <TouchableOpacity
                            key={filter}
                            style={[styles.filterTab, selectedFilter === filter && styles.filterTabActive]}
                            onPress={() => setSelectedFilter(filter)}
                        >
                            <Text style={[styles.filterText, selectedFilter === filter && styles.filterTextActive]}>{filter}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

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

            {/* Upload Modal (Refactored) */}
            <UploadJobModal
                visible={uploadModalVisible}
                onClose={() => setUploadModalVisible(false)}
            />

            {/* Create Job Modal */}
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
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: 'rgba(0,0,0,0.8)', borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder },
    headerLeft: { width: 40, alignItems: 'flex-start' },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.textLight, flex: 1, textAlign: 'center' },
    searchInput: { flex: 1, color: COLORS.textLight, fontSize: 16, paddingHorizontal: 12, height: 40, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8, marginHorizontal: 12 },
    searchButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    filterContainer: { padding: 16, paddingBottom: 12 },
    filterWrapper: { flexDirection: 'row', backgroundColor: COLORS.cardDark, borderRadius: 8, padding: 4 },
    filterTab: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: 6 },
    filterTabActive: { backgroundColor: COLORS.neonGreen },
    filterText: { fontSize: 13, fontWeight: '500', color: COLORS.textGray },
    filterTextActive: { color: COLORS.black },
    listContent: { padding: 16, paddingTop: 0, paddingBottom: 100 },
    fabContainer: { position: 'absolute', bottom: 24, right: 24, alignItems: 'center' },
    fab: { width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.neonGreen, alignItems: 'center', justifyContent: 'center', shadowColor: COLORS.neonGreen, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 10 },
    excelFab: { marginBottom: 16, backgroundColor: '#3b82f6' },
    emptyContainer: { padding: 20, alignItems: 'center' },
    emptyText: { color: COLORS.textGray },
});
