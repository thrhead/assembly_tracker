import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useApprovals } from '../../hooks/useApprovals';
import ApprovalCard from '../../components/admin/ApprovalCard';
import { COLORS } from '../../constants/theme';

export default function ApprovalsScreen({ navigation }) {
    const {
        filteredApprovals,
        filter,
        setFilter,
        loading,
        refreshing,
        onRefresh,
        handleApprove,
        handleReject
    } = useApprovals();

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.filterContainer}>
                {['ALL', 'JOB', 'COST'].map(f => (
                    <TouchableOpacity
                        key={f}
                        style={[styles.filterButton, filter === f && styles.activeFilter]}
                        onPress={() => setFilter(f)}
                    >
                        <Text style={[styles.filterText, filter === f && styles.activeFilterText]}>
                            {f === 'ALL' ? 'Tümü' : f === 'JOB' ? 'İşler' : 'Masraflar'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <FlatList
                data={filteredApprovals}
                renderItem={({ item }) => (
                    <ApprovalCard
                        item={item}
                        onApprove={handleApprove}
                        onReject={handleReject}
                    />
                )}
                keyExtractor={item => `${item.type}-${item.id}`}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <MaterialIcons name="check-circle" size={64} color={COLORS.slate600} />
                        <Text style={styles.emptyText}>Bekleyen onay bulunmuyor</Text>
                    </View>
                }
            />
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
    filterContainer: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
    },
    filterButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: COLORS.cardDark,
        borderWidth: 1,
        borderColor: COLORS.slate800,
    },
    activeFilter: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    filterText: {
        color: COLORS.slate400,
        fontWeight: '500',
    },
    activeFilterText: {
        color: COLORS.black,
        fontWeight: 'bold',
    },
    listContent: {
        padding: 16,
        paddingTop: 0,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
        gap: 16,
    },
    emptyText: {
        color: COLORS.slate400,
        fontSize: 16,
    },
});
