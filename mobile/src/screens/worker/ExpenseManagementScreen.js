import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    StatusBar,
    SafeAreaView,
    ScrollView
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useWorkerExpenses } from '../../hooks/useWorkerExpenses';
import { ProjectFilter, CategoryFilter } from '../../components/worker/expense/ExpenseFilter';
import { ExpenseList } from '../../components/worker/expense/ExpenseList';
import { ExpenseSummary } from '../../components/worker/expense/ExpenseSummary';
import { CreateExpenseModal } from '../../components/worker/expense/CreateExpenseModal';
import { COLORS } from '../../constants/theme';

export default function ExpenseManagementScreen({ navigation, route }) {
    const {
        projects,
        // expenses, // Not directly used in render, filteredExpenses is used
        // loading, // Could add a loader
        selectedProject,
        selectedCategory,
        searchQuery,
        filteredExpenses,
        groupedExpenses,
        setSelectedProject,
        setSelectedCategory,
        setSearchQuery,
        loadData,
        createExpense
    } = useWorkerExpenses();

    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        loadData();
        if (route.params?.openCreate) {
            setModalVisible(true);
            navigation.setParams({ openCreate: undefined });
        }
    }, [route.params, loadData, navigation]);

    const totalAmount = filteredExpenses.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.backgroundDark} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                    <MaterialIcons name="arrow-back-ios" size={20} color={COLORS.textLight} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Proje Masrafları</Text>
                <TouchableOpacity style={styles.iconButton}>
                    <MaterialIcons name="more-vert" size={24} color={COLORS.textLight} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.contentContainer}>
                {/* Project Filter */}
                <ProjectFilter
                    projects={projects}
                    selectedProject={selectedProject}
                    onSelect={setSelectedProject}
                />

                {/* Budget Card */}
                <ExpenseSummary totalAmount={totalAmount} />

                {/* Search */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchBar}>
                        <View style={styles.searchIconContainer}>
                            <MaterialIcons name="search" size={24} color={COLORS.textGray} />
                        </View>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Masraf ara"
                            placeholderTextColor={COLORS.textGray}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </View>

                {/* Category Filter */}
                <CategoryFilter
                    selectedCategory={selectedCategory}
                    onSelect={setSelectedCategory}
                />

                {/* Expenses List */}
                <ExpenseList
                    groupedExpenses={groupedExpenses}
                    filteredExpensesCount={filteredExpenses.length}
                />

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* FAB */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => setModalVisible(true)}
            >
                <MaterialIcons name="add" size={32} color={COLORS.backgroundDark} />
            </TouchableOpacity>

            {/* Create Expense Modal */}
            <CreateExpenseModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSubmit={createExpense}
                projects={projects}
                defaultJobId={selectedProject?.id}
            />
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
        borderBottomWidth: 1,
        borderBottomColor: COLORS.cardBorder,
    },
    iconButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textLight,
        flex: 1,
        textAlign: 'center',
    },
    contentContainer: {
        paddingBottom: 24,
    },
    searchContainer: {
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.cardBorder,
        borderRadius: 12,
        height: 48,
    },
    searchIconContainer: {
        paddingLeft: 16,
        paddingRight: 8,
    },
    searchInput: {
        flex: 1,
        color: COLORS.textLight,
        fontSize: 16,
        height: '100%',
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
});
