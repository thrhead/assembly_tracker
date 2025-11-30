import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, TextInput, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import costService from '../../services/cost.service';
import jobService from '../../services/job.service';
import { COLORS } from '../../constants/theme';

export default function CostManagementScreen({ navigation }) {
    const [costs, setCosts] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [budgetStats, setBudgetStats] = useState({ used: 0, total: 0, remaining: 0 });

    const categories = [
        { id: 'ALL', label: 'Tümü', icon: 'tune' },
        { id: 'TRAVEL', label: 'Ulaşım', icon: 'directions-car' },
        { id: 'FOOD', label: 'Yemek', icon: 'restaurant' },
        { id: 'SUPPLIES', label: 'Malzeme', icon: 'store' },
        { id: 'TOOLS', label: 'Araçlar', icon: 'construction' },
    ];

    useEffect(() => {
        loadData();
    }, [selectedJob, selectedCategory]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [jobsData, costsData] = await Promise.all([
                jobService.getAll(),
                costService.getAll()
            ]);

            setJobs(jobsData);

            // Filter costs
            let filtered = costsData;
            if (selectedJob) {
                filtered = filtered.filter(c => c.jobId === selectedJob.id);
            }
            if (selectedCategory !== 'ALL') {
                filtered = filtered.filter(c => c.category === selectedCategory);
            }
            if (searchQuery.trim()) {
                filtered = filtered.filter(c =>
                    c.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    c.createdBy?.name?.toLowerCase().includes(searchQuery.toLowerCase())
                );
            }

            setCosts(filtered);

            // Calculate budget stats
            const totalUsed = costsData
                .filter(c => c.status === 'APPROVED')
                .reduce((sum, c) => sum + parseFloat(c.amount || 0), 0);
            const totalBudget = selectedJob?.budget || 20000;
            setBudgetStats({
                used: totalUsed,
                total: totalBudget,
                remaining: totalBudget - totalUsed
            });

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

    const getCategoryIcon = (category) => {
        const map = {
            'TRAVEL': 'directions-car',
            'FOOD': 'restaurant',
            'SUPPLIES': 'store',
            'TOOLS': 'construction',
            'OTHER': 'category'
        };
        return map[category] || 'receipt';
    };

    const getCategoryColor = (category) => {
        const map = {
            'TRAVEL': COLORS.blue500,
            'FOOD': COLORS.red500,
            'SUPPLIES': '#8B5CF6',
            'TOOLS': COLORS.amber500,
            'OTHER': COLORS.slate600
        };
        return map[category] || COLORS.slate600;
    };

    const getStatusColor = (status) => {
        const map = {
            'APPROVED': COLORS.green500,
            'REJECTED': COLORS.red500,
            'PENDING': COLORS.amber500
        };
        return map[status] || COLORS.slate600;
    };

    const getStatusLabel = (status) => {
        const map = {
            'APPROVED': 'Onaylandı',
            'REJECTED': 'Reddedildi',
            'PENDING': 'Bekliyor'
        };
        return map[status] || status;
    };

    const groupCostsByDate = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const groups = {
            today: [],
            yesterday: [],
            older: []
        };

        costs.forEach(cost => {
            const costDate = new Date(cost.date || cost.createdAt);
            costDate.setHours(0, 0, 0, 0);

            if (costDate.getTime() === today.getTime()) {
                groups.today.push(cost);
            } else if (costDate.getTime() === yesterday.getTime()) {
                groups.yesterday.push(cost);
            } else {
                groups.older.push(cost);
            }
        });

        return groups;
    };

    const renderCostItem = (item) => {
        const categoryColor = getCategoryColor(item.category);
        const statusColor = getStatusColor(item.status);

        return (
            <View key={item.id} style={styles.expenseCard}>
                <View style={[styles.categoryIcon, { backgroundColor: categoryColor + '40' }]}>
                    <MaterialIcons name={getCategoryIcon(item.category)} size={24} color={categoryColor} />
                </View>
                <View style={styles.expenseContent}>
                    <Text style={styles.expenseTitle}>{item.description || 'Masraf'}</Text>
                    <Text style={styles.expenseDate}>
                        {new Date(item.date || item.createdAt).toLocaleDateString('tr-TR')}
                    </Text>
                    <Text style={styles.expenseUser}>
                        {item.createdBy?.name || 'Bilinmeyen'}
                    </Text>
                </View>
                <View style={styles.expenseRight}>
                    <Text style={styles.expenseAmount}>₺{parseFloat(item.amount || 0).toFixed(2)}</Text>
                    <View style={styles.statusContainer}>
                        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                        <Text style={[styles.statusText, { color: statusColor }]}>{getStatusLabel(item.status)}</Text>
                    </View>
                </View>
            </View>
        );
    };

    const renderHeader = () => {
        const groupedCosts = groupCostsByDate();

        return (
            <>
                {/* Project Filter */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.projectFilter}>
                    <TouchableOpacity
                        style={[styles.projectChip, !selectedJob && styles.projectChipActive]}
                        onPress={() => setSelectedJob(null)}
                    >
                        <Text style={[styles.projectChipText, !selectedJob && styles.projectChipTextActive]}>
                            Tüm Projeler
                        </Text>
                        {!selectedJob && <MaterialIcons name="expand-more" size={20} color={COLORS.primary} />}
                    </TouchableOpacity>
                    {jobs.slice(0, 3).map(job => (
                        <TouchableOpacity
                            key={job.id}
                            style={[styles.projectChip, selectedJob?.id === job.id && styles.projectChipActive]}
                            onPress={() => setSelectedJob(job)}
                        >
                            <Text style={[styles.projectChipText, selectedJob?.id === job.id && styles.projectChipTextActive]}>
                                {job.title}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Budget Card */}
                <View style={styles.budgetCard}>
                    <View style={styles.budgetHeader}>
                        <Text style={styles.budgetLabel}>Toplam Kullanılan Bütçe</Text>
                        <Text style={styles.budgetAmount}>₺{budgetStats.used.toFixed(2)}</Text>
                    </View>
                    <View style={styles.progressBar}>
                        <View
                            style={[styles.progressFill, { width: `${Math.min((budgetStats.used / budgetStats.total) * 100, 100)}%` }]}
                        />
                    </View>
                    <View style={styles.budgetFooter}>
                        <Text style={styles.budgetSecondary}>₺{budgetStats.remaining.toFixed(2)} Kalan</Text>
                        <Text style={styles.budgetSecondary}>₺{budgetStats.total.toFixed(2)} Toplam</Text>
                    </View>
                </View>

                {/* Search */}
                <View style={styles.searchContainer}>
                    <MaterialIcons name="search" size={24} color={COLORS.slate400} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Masraf ara..."
                        placeholderTextColor={COLORS.slate400}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {/* Category Filter */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilter}>
                    {categories.map(cat => (
                        <TouchableOpacity
                            key={cat.id}
                            style={[styles.categoryChip, selectedCategory === cat.id && styles.categoryChipActive]}
                            onPress={() => setSelectedCategory(cat.id)}
                        >
                            <MaterialIcons
                                name={cat.icon}
                                size={20}
                                color={selectedCategory === cat.id ? COLORS.primary : COLORS.slate400}
                            />
                            <Text style={[styles.categoryChipText, selectedCategory === cat.id && styles.categoryChipTextActive]}>
                                {cat.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Today */}
                {groupedCosts.today.length > 0 && (
                    <>
                        <Text style={styles.dateHeader}>Bugün</Text>
                        {groupedCosts.today.map(renderCostItem)}
                    </>
                )}

                {/* Yesterday */}
                {groupedCosts.yesterday.length > 0 && (
                    <>
                        <Text style={styles.dateHeader}>Dün</Text>
                        {groupedCosts.yesterday.map(renderCostItem)}
                    </>
                )}

                {/* Older */}
                {groupedCosts.older.length > 0 && (
                    <>
                        <Text style={styles.dateHeader}>Daha Eski</Text>
                        {groupedCosts.older.map(renderCostItem)}
                    </>
                )}

                {costs.length === 0 && !loading && (
                    <View style={styles.emptyState}>
                        <MaterialIcons name="receipt-long" size={64} color={COLORS.slate600} />
                        <Text style={styles.emptyText}>Masraf bulunamadı</Text>
                    </View>
                )}
            </>
        );
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Yükleniyor...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialIcons name="arrow-back-ios" size={24} color={COLORS.textLight} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Proje Masrafları</Text>
                <View style={{ width: 48 }} />
            </View>

            <ScrollView
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
                }
            >
                {renderHeader()}
            </ScrollView>

            {/* FAB */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => Alert.alert('Yakında', 'Masraf ekleme özelliği yakında gelecek')}
                activeOpacity={0.8}
            >
                <MaterialIcons name="add" size={28} color={COLORS.black} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.backgroundDark,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.backgroundDark,
    },
    loadingText: {
        marginTop: 10,
        color: COLORS.slate400,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        paddingBottom: 12,
        backgroundColor: COLORS.backgroundDark,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.slate800,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textLight,
        flex: 1,
        textAlign: 'center',
    },
    scrollView: {
        flex: 1,
    },
    projectFilter: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    projectChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: COLORS.slate800,
        marginRight: 12,
    },
    projectChipActive: {
        backgroundColor: 'rgba(206, 254, 4, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(206, 254, 4, 0.4)',
    },
    projectChipText: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.slate400,
        marginRight: 4,
    },
    projectChipTextActive: {
        color: COLORS.primary,
    },
    budgetCard: {
        margin: 16,
        padding: 20,
        borderRadius: 12,
        backgroundColor: COLORS.cardDark,
        borderWidth: 1,
        borderColor: COLORS.slate800,
    },
    budgetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    budgetLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: COLORS.textLight,
    },
    budgetAmount: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.textLight,
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.slate700,
        overflow: 'hidden',
        marginBottom: 12,
    },
    progressFill: {
        height: '100%',
        backgroundColor: COLORS.primary,
    },
    budgetFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    budgetSecondary: {
        fontSize: 14,
        color: COLORS.slate400,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.slate800,
        marginHorizontal: 16,
        marginBottom: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
    },
    searchInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        color: COLORS.textLight,
    },
    categoryFilter: {
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: COLORS.slate800,
        marginRight: 12,
    },
    categoryChipActive: {
        backgroundColor: 'rgba(206, 254, 4, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(206, 254, 4, 0.4)',
    },
    categoryChipText: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.slate400,
        marginLeft: 8,
    },
    categoryChipTextActive: {
        color: COLORS.primary,
    },
    dateHeader: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.slate400,
        paddingHorizontal: 20,
        marginTop: 12,
        marginBottom: 12,
    },
    expenseCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.cardDark,
        borderWidth: 1,
        borderColor: COLORS.slate800,
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 12,
    },
    categoryIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    expenseContent: {
        flex: 1,
    },
    expenseTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: COLORS.textLight,
        marginBottom: 4,
    },
    expenseDate: {
        fontSize: 14,
        color: COLORS.slate400,
        marginBottom: 2,
    },
    expenseUser: {
        fontSize: 12,
        color: COLORS.slate500,
    },
    expenseRight: {
        alignItems: 'flex-end',
    },
    expenseAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textLight,
        marginBottom: 8,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '500',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 64,
    },
    emptyText: {
        fontSize: 16,
        color: COLORS.slate500,
        marginTop: 16,
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
});
