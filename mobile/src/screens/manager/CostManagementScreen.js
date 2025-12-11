import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, TextInput, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useCostManagement } from '../../hooks/useCostManagement';
import BudgetCard from '../../components/manager/BudgetCard';
import ProjectFilter from '../../components/manager/ProjectFilter';
import CategoryFilter from '../../components/manager/CategoryFilter';
import ExpenseList from '../../components/manager/ExpenseList';

export default function CostManagementScreen({ navigation }) {
    const {
        jobs,
        filteredCosts,
        budgetStats,
        loading,
        refreshing,
        selectedJob,
        setSelectedJob,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        onRefresh
    } = useCostManagement();

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
                <ProjectFilter
                    jobs={jobs}
                    selectedJob={selectedJob}
                    onSelect={setSelectedJob}
                />

                <BudgetCard stats={budgetStats} />

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

                <CategoryFilter
                    selectedCategory={selectedCategory}
                    onSelect={setSelectedCategory}
                />

                <ExpenseList costs={filteredCosts} />
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
