import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    StatusBar,
    ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useWorkerExpenses } from '../../hooks/useWorkerExpenses';
import { ProjectFilter, CategoryFilter } from '../../components/worker/expense/ExpenseFilter';
import { ExpenseList } from '../../components/worker/expense/ExpenseList';
import { ExpenseSummary } from '../../components/worker/expense/ExpenseSummary';
import { CreateExpenseModal } from '../../components/worker/expense/CreateExpenseModal';
// import { COLORS } from '../../constants/theme'; // Removed legacy import
import { useTheme } from '../../context/ThemeContext';

export default function ExpenseManagementScreen({ navigation, route }) {
    const { theme, isDark } = useTheme();
    const {
        projects,
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
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} />

            {/* Header */}
            <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                    <MaterialIcons name="arrow-back-ios" size={20} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Proje Masrafları</Text>
                <TouchableOpacity style={styles.iconButton}>
                    <MaterialIcons name="more-vert" size={24} color={theme.colors.text} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.contentContainer}>
                {/* Project Filter */}
                <ProjectFilter
                    projects={projects}
                    selectedProject={selectedProject}
                    onSelect={setSelectedProject}
                    theme={theme}
                />

                {/* Budget Card */}
                <ExpenseSummary totalAmount={totalAmount} theme={theme} />

                {/* Search */}
                <View style={styles.searchContainer}>
                    <View style={[styles.searchBar, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1 }]}>
                        <View style={styles.searchIconContainer}>
                            <MaterialIcons name="search" size={24} color={theme.colors.subText} />
                        </View>
                        <TextInput
                            style={[styles.searchInput, { color: theme.colors.text }]}
                            placeholder="Masraf ara"
                            placeholderTextColor={theme.colors.subText}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </View>

                {/* Category Filter */}
                <CategoryFilter
                    selectedCategory={selectedCategory}
                    onSelect={setSelectedCategory}
                    theme={theme}
                />

                {/* Expenses List */}
                <ExpenseList
                    groupedExpenses={groupedExpenses}
                    filteredExpensesCount={filteredExpenses.length}
                    theme={theme}
                />

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* FAB */}
            <TouchableOpacity
                style={[styles.fab, { backgroundColor: theme.colors.primary, shadowColor: theme.colors.primary }]}
                onPress={() => setModalVisible(true)}
            >
                <MaterialIcons name="add" size={32} color={theme.colors.textInverse} />
            </TouchableOpacity>

            {/* Create Expense Modal */}
            <CreateExpenseModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSubmit={createExpense}
                projects={projects}
                defaultJobId={selectedProject?.id}
                theme={theme}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
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
        borderRadius: 12,
        height: 48,
    },
    searchIconContainer: {
        paddingLeft: 16,
        paddingRight: 8,
    },
    searchInput: {
        flex: 1,
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
        justifyContent: 'center',
        alignItems: 'center',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
});
