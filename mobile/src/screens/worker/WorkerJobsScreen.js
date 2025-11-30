import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    RefreshControl,
    StatusBar,
    SafeAreaView,
    Modal,
    Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import jobService from '../../services/job.service';

const COLORS = {
    primary: "#CCFF04",
    backgroundLight: "#f8f8f5",
    backgroundDark: "#010100",
    cardDark: "#111827", // gray-900
    cardBorder: "#1f2937", // gray-800
    textLight: "#f8fafc", // slate-50
    textGray: "#94a3b8", // slate-400
    red500: "#ef4444",
    red900: "#7f1d1d",
    orange500: "#f97316",
    blue500: "#3b82f6",
    blue900: "#1e3a8a",
    neonGreen: "#39ff14",
    black: "#000000",
};

export default function WorkerJobsScreen({ navigation, route }) {
    const { user } = useAuth();

    useEffect(() => {
        if (route.params?.openCreate && isAdmin) {
            setModalVisible(true);
            // Reset params to avoid reopening on focus
            navigation.setParams({ openCreate: undefined });
        }
    }, [route.params]);

    useEffect(() => {
        loadJobs();
    }, []);

    useEffect(() => {
        filterJobs();
    }, [searchQuery, selectedFilter, jobs]);

    const loadJobs = async () => {
        try {
            setLoading(true);
            let data;
            if (isAdmin) {
                data = await jobService.getAllJobs();
            } else {
                data = await jobService.getMyJobs();
            }
            setJobs(data);
        } catch (error) {
            console.error('Error loading jobs:', error);
            // Fallback to mock data if API fails (for demo continuity)
            // setJobs(mockJobs); 
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadJobs();
    };

    const filterJobs = () => {
        let filtered = jobs;

        if (selectedFilter !== 'Tümü') {
            if (selectedFilter === 'Devam Eden') {
                filtered = filtered.filter(j => j.status === 'IN_PROGRESS');
            } else if (selectedFilter === 'Bekleyen') {
                filtered = filtered.filter(j => j.status === 'PENDING');
            } else if (selectedFilter === 'Tamamlanan') {
                filtered = filtered.filter(j => j.status === 'COMPLETED');
            }
        }

        if (searchQuery) {
            filtered = filtered.filter(j => j.title.toLowerCase().includes(searchQuery.toLowerCase()));
        }

        setFilteredJobs(filtered);
    };

    const handleCreateJob = async () => {
        if (!formData.title) {
            Alert.alert('Hata', 'İş başlığı zorunludur.');
            return;
        }
        try {
            await jobService.create(formData);
            Alert.alert('Başarılı', 'Yeni iş oluşturuldu.');
            setModalVisible(false);
            loadJobs();
        } catch (error) {
            console.error('Create job error:', error);
            Alert.alert('Hata', 'İş oluşturulamadı.');
        }
    };

    const renderPriorityDot = (priority) => {
        let color = COLORS.blue500;
        if (priority === 'HIGH') color = COLORS.red500;
        if (priority === 'MEDIUM') color = COLORS.orange500;
        return <View style={[styles.priorityDot, { backgroundColor: color }]} />;
    };

    const renderStatusBadge = (status) => {
        if (status === 'IN_PROGRESS') {
            return (
                <View style={[styles.badge, { backgroundColor: 'rgba(57, 255, 20, 0.1)' }]}>
                    <Text style={[styles.badgeText, { color: COLORS.neonGreen }]}>Devam Ediyor</Text>
                </View>
            );
        }
        if (status === 'PENDING') {
            return (
                <View style={[styles.badge, { backgroundColor: 'rgba(30, 58, 138, 0.5)' }]}>
                    <Text style={[styles.badgeText, { color: '#60a5fa' }]}>Bekliyor</Text>
                </View>
            );
        }
        if (status === 'COMPLETED') {
            return (
                <View style={[styles.badge, { backgroundColor: 'rgba(57, 255, 20, 0.1)' }]}>
                    <Text style={[styles.badgeText, { color: 'rgba(57, 255, 20, 0.8)' }]}>Tamamlandı</Text>
                </View>
            );
        }
        return null;
    };

    const renderItem = ({ item }) => (
        <View style={[
            styles.card,
            item.status === 'IN_PROGRESS' && styles.cardActive,
            item.status === 'COMPLETED' && styles.cardCompleted
        ]}>
            <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                    <Text style={[styles.cardTitle, item.status === 'COMPLETED' && styles.textStrike]}>{item.title}</Text>
                    <View style={styles.headerRight}>
                        {item.status !== 'COMPLETED' && renderPriorityDot(item.priority)}
                        {renderStatusBadge(item.status)}
                    </View>
                </View>

                <View style={styles.cardFooter}>
                    <View style={styles.footerInfo}>
                        <View style={styles.infoRow}>
                            <MaterialIcons name="event" size={16} color={COLORS.neonGreen} />
                            <Text style={styles.infoText}>{item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'Tarih Yok'}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <MaterialIcons name="person" size={16} color={COLORS.neonGreen} />
                            <Text style={styles.infoText}>Atanan: {item.assignee?.name || 'Atanmamış'}</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.detailsButton}
                        onPress={() => navigation.navigate('JobDetail', { jobId: item.id })}
                    >
                        <Text style={styles.detailsButtonText}>Detaylar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.backgroundDark} />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <MaterialIcons name="assignment" size={30} color={COLORS.neonGreen} />
                </View>
                <Text style={styles.headerTitle}>Görevler</Text>
                <TouchableOpacity style={styles.searchButton}>
                    <MaterialIcons name="search" size={24} color={COLORS.neonGreen} />
                </TouchableOpacity>
            </View>

            {/* Filters */}
            <View style={styles.filterContainer}>
                <View style={styles.filterWrapper}>
                    {['Tümü', 'Devam Eden', 'Bekleyen', 'Tamamlanan'].map((filter) => (
                        <TouchableOpacity
                            key={filter}
                            style={[
                                styles.filterTab,
                                selectedFilter === filter && styles.filterTabActive
                            ]}
                            onPress={() => setSelectedFilter(filter)}
                        >
                            <Text style={[
                                styles.filterText,
                                selectedFilter === filter && styles.filterTextActive
                            ]}>
                                {filter}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Task List */}
            <FlatList
                data={filteredJobs}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.neonGreen} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Görev bulunamadı.</Text>
                    </View>
                }
            />

            {/* FAB for Admin */}
            {isAdmin && (
                <View style={styles.fabContainer}>
                    <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
                        <MaterialIcons name="add" size={30} color={COLORS.black} />
                    </TouchableOpacity>
                </View>
            )}

            {/* Create Job Modal */}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Yeni İş Oluştur</Text>

                        <Text style={styles.label}>İş Başlığı</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.title}
                            onChangeText={(text) => setFormData({ ...formData, title: text })}
                            placeholder="Klima Montajı"
                            placeholderTextColor="#666"
                        />

                        <Text style={styles.label}>Açıklama</Text>
                        <TextInput
                            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                            value={formData.description}
                            onChangeText={(text) => setFormData({ ...formData, description: text })}
                            placeholder="İş detayları..."
                            placeholderTextColor="#666"
                            multiline
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                                <Text style={styles.cancelButtonText}>İptal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveButton} onPress={handleCreateJob}>
                                <Text style={styles.saveButtonText}>Oluştur</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.backgroundDark,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: 'rgba(0,0,0,0.8)',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.cardBorder,
    },
    headerLeft: {
        width: 40,
        alignItems: 'flex-start',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.textLight,
    },
    searchButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterContainer: {
        padding: 16,
        paddingBottom: 12,
    },
    filterWrapper: {
        flexDirection: 'row',
        backgroundColor: COLORS.cardDark,
        borderRadius: 8,
        padding: 4,
    },
    filterTab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        borderRadius: 6,
    },
    filterTabActive: {
        backgroundColor: COLORS.neonGreen,
    },
    filterText: {
        fontSize: 13,
        fontWeight: '500',
        color: COLORS.textGray,
    },
    filterTextActive: {
        color: COLORS.black,
    },
    listContent: {
        padding: 16,
        paddingTop: 0,
        paddingBottom: 100,
    },
    card: {
        backgroundColor: COLORS.cardDark,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
        marginBottom: 16,
        overflow: 'hidden',
    },
    cardActive: {
        borderColor: 'rgba(57, 255, 20, 0.5)',
        shadowColor: COLORS.neonGreen,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 5,
    },
    cardCompleted: {
        opacity: 0.6,
    },
    cardContent: {
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.textLight,
        flex: 1,
        marginRight: 8,
        lineHeight: 24,
    },
    textStrike: {
        textDecorationLine: 'line-through',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    priorityDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '500',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    footerInfo: {
        gap: 4,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    infoText: {
        fontSize: 14,
        color: COLORS.textGray,
    },
    detailsButton: {
        backgroundColor: COLORS.neonGreen,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        minWidth: 84,
        alignItems: 'center',
    },
    detailsButtonText: {
        color: COLORS.black,
        fontSize: 14,
        fontWeight: '500',
    },
    fabContainer: {
        position: 'absolute',
        bottom: 24,
        right: 24,
    },
    fab: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.neonGreen,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: COLORS.neonGreen,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    emptyContainer: {
        padding: 20,
        alignItems: 'center',
    },
    emptyText: {
        color: COLORS.textGray,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#1A1A1A',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#333',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 20,
        textAlign: 'center',
    },
    label: {
        color: '#e2e8f0',
        marginBottom: 8,
        fontWeight: '600',
    },
    input: {
        backgroundColor: '#2d3748',
        borderRadius: 8,
        padding: 12,
        color: '#ffffff',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#4b5563',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 10,
    },
    cancelButton: {
        flex: 1,
        padding: 14,
        borderRadius: 8,
        backgroundColor: '#334155',
        alignItems: 'center',
    },
    saveButton: {
        flex: 1,
        padding: 14,
        borderRadius: 8,
        backgroundColor: '#CCFF04',
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#e2e8f0',
        fontWeight: '600',
    },
    saveButtonText: {
        color: '#000000',
        fontWeight: 'bold',
    },
});
