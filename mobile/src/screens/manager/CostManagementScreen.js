import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, TextInput, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useCostManagement } from '../../hooks/useCostManagement';
import BudgetCard from '../../components/manager/BudgetCard';
import ProjectFilter from '../../components/manager/ProjectFilter';
import CategoryFilter from '../../components/manager/CategoryFilter';
import ExpenseList from '../../components/manager/ExpenseList';
import DateFilter from '../../components/manager/DateFilter';
import UserFilter from '../../components/manager/UserFilter';

export default function CostManagementScreen({ navigation }) {
    const { theme, isDark } = useTheme();
    const {
        jobs,
        users,
        filteredCosts,
        budgetStats,
        loading,
        refreshing,
        selectedJob,
        setSelectedJob,
        selectedUserId,
        setSelectedUserId,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        onRefresh
    } = useCostManagement();

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
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Proje Masrafları</Text>
                <View style={{ width: 48 }} />
            </View>

            <ScrollView
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
                }
            >
                <ProjectFilter
                    jobs={jobs}
                    selectedJob={selectedJob}
                    onSelect={setSelectedJob}
                    theme={theme}
                />

                <DateFilter
                    startDate={startDate}
                    endDate={endDate}
                    onStartDateChange={setStartDate}
                    onEndDateChange={setEndDate}
                    theme={theme}
                />

                <UserFilter
                    users={users}
                    selectedUserId={selectedUserId}
                    onSelect={setSelectedUserId}
                    theme={theme}
                />

                <BudgetCard stats={budgetStats} theme={theme} />

                {/* Search */}
                <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                    <MaterialIcons name="search" size={24} color={theme.colors.subText} />
                    <TextInput
                        style={[styles.searchInput, { color: theme.colors.text }]}
                        placeholder="Masraf ara..."
                        placeholderTextColor={theme.colors.subText}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                <CategoryFilter
                    selectedCategory={selectedCategory}
                    onSelect={setSelectedCategory}
                    theme={theme}
                />

                <ExpenseList costs={filteredCosts} theme={theme} />
            </ScrollView>

            {/* FAB */}
            <TouchableOpacity
                style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                onPress={() => Alert.alert('Yakında', 'Masraf ekleme özelliği yakında gelecek')}
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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginBottom: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
    searchInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
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
