import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput, RefreshControl, Alert } from 'react-native';
import teamService from '../../services/team.service';
import { useAuth } from '../../context/AuthContext';

export default function TeamListScreen({ navigation }) {
    const { user } = useAuth();
    const [members, setMembers] = useState([]);
    const [filteredMembers, setFilteredMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('ALL');
    const [myTeam, setMyTeam] = useState(null);

    const statusFilters = [
        { key: 'ALL', label: 'Tümü' },
        { key: 'active', label: 'Aktif' },
        { key: 'inactive', label: 'Pasif' },
    ];

    useEffect(() => {
        loadTeam();
    }, []);

    useEffect(() => {
        filterMembers();
    }, [searchQuery, selectedFilter, members]);

    const loadTeam = async () => {
        try {
            const teams = await teamService.getAll();

            // Find the team where the current user is a manager (lead) or a member
            // Ideally, the backend should filter this, but for now we filter here.
            // If user is ADMIN, they see all? But this screen is for Manager.
            // We'll assume Manager sees the team they lead.

            let targetTeam = teams.find(t => t.leadId === user.id);

            // If not leading any, maybe just a member?
            if (!targetTeam) {
                targetTeam = teams.find(t => t.members.some(m => m.userId === user.id));
            }

            // If still not found and there are teams, maybe just show the first one (fallback)
            if (!targetTeam && teams.length > 0) {
                // targetTeam = teams[0]; // Uncomment if fallback needed
            }

            if (targetTeam) {
                setMyTeam(targetTeam);
                setMembers(targetTeam.members || []);
            } else {
                setMembers([]);
            }
        } catch (error) {
            console.error('Error loading team:', error);
            Alert.alert('Hata', 'Ekip bilgileri yüklenemedi.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadTeam();
    };

    const filterMembers = () => {
        let filtered = members;

        // Status filter
        if (selectedFilter !== 'ALL') {
            const isActive = selectedFilter === 'active';
            filtered = filtered.filter(m => m.user.isActive === isActive);
        }

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(m =>
                m.user.name.toLowerCase().includes(query) ||
                m.user.email.toLowerCase().includes(query)
            );
        }

        setFilteredMembers(filtered);
    };

    const renderMember = ({ item }) => (
        <TouchableOpacity style={styles.memberCard}>
            <View style={styles.memberHeader}>
                <View style={[
                    styles.avatar,
                    { backgroundColor: item.user.isActive ? '#3B82F6' : '#9CA3AF' }
                ]}>
                    <Text style={styles.avatarText}>
                        {item.user.name ? item.user.name.charAt(0).toUpperCase() : 'U'}
                    </Text>
                </View>
                <View style={styles.memberInfo}>
                    <View style={styles.memberNameRow}>
                        <Text style={styles.memberName}>{item.user.name}</Text>
                        <View style={[
                            styles.statusBadge,
                            { backgroundColor: item.user.isActive ? '#D1FAE5' : '#F3F4F6' }
                        ]}>
                            <Text style={[
                                styles.statusText,
                                { color: item.user.isActive ? '#059669' : '#6B7280' }
                            ]}>
                                {item.user.isActive ? 'Aktif' : 'Pasif'}
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.memberEmail}>{item.user.email}</Text>
                    <Text style={styles.memberRole}>{item.user.role}</Text>
                </View>
            </View>

            {/* Stats are not available in this endpoint yet */}
            {/* 
            <View style={styles.statsContainer}>
                <View style={styles.stat}>
                    <Text style={styles.statValue}>-</Text>
                    <Text style={styles.statLabel}>Aktif İş</Text>
                </View>
                <View style={styles.stat}>
                    <Text style={styles.statValue}>-</Text>
                    <Text style={styles.statLabel}>Tamamlanan</Text>
                </View>
            </View>
            */}
        </TouchableOpacity>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyTitle}>Ekip üyesi bulunamadı</Text>
            <Text style={styles.emptyText}>
                {searchQuery ? 'Arama kriterlerinize uygun ekip üyesi bulunamadı.' : 'Henüz ekip üyesi eklenmemiş.'}
            </Text>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#F59E0B" />
                <Text style={styles.loadingText}>Ekip yükleniyor...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Ekip üyesi ara..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Text style={styles.clearIcon}>✕</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Status Filter Tabs */}
                <View style={styles.filtersContainer}>
                    {statusFilters.map((filter) => (
                        <TouchableOpacity
                            key={filter.key}
                            style={[
                                styles.filterChip,
                                selectedFilter === filter.key && styles.filterChipActive
                            ]}
                            onPress={() => setSelectedFilter(filter.key)}
                        >
                            <Text style={[
                                styles.filterChipText,
                                selectedFilter === filter.key && styles.filterChipTextActive
                            ]}>
                                {filter.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <FlatList
                data={filteredMembers}
                renderItem={renderMember}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={renderEmptyState}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#F59E0B']}
                        tintColor="#F59E0B"
                    />
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#010100',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: '#94a3b8',
    },
    headerContainer: {
        backgroundColor: '#1A1A1A',
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2d3748',
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    searchIcon: {
        fontSize: 16,
        marginRight: 8,
        color: '#94a3b8',
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#ffffff',
    },
    clearIcon: {
        fontSize: 18,
        color: '#94a3b8',
        padding: 4,
    },
    filtersContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 8,
        borderRadius: 20,
        backgroundColor: '#2d3748',
    },
    filterChipActive: {
        backgroundColor: '#F59E0B',
    },
    filterChipText: {
        fontSize: 14,
        color: '#94a3b8',
        fontWeight: '500',
    },
    filterChipTextActive: {
        color: '#fff',
    },
    listContainer: {
        padding: 16,
    },
    memberCard: {
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#333',
    },
    memberHeader: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    memberInfo: {
        flex: 1,
    },
    memberNameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    memberName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    memberEmail: {
        fontSize: 14,
        color: '#94a3b8',
    },
    memberRole: {
        fontSize: 12,
        color: '#94a3b8',
        marginTop: 2,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        borderTopWidth: 1,
        borderTopColor: '#333',
        paddingTop: 12,
    },
    stat: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#94a3b8',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: '#94a3b8',
        textAlign: 'center',
        paddingHorizontal: 32,
    },
});
