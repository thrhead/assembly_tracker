import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    StatusBar,
    SafeAreaView,
    Dimensions,
    Modal,
    Alert,
    Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import costService from '../../services/cost.service';
import jobService from '../../services/job.service';

const { width } = Dimensions.get('window');

// Using the app's existing color palette but adapting for the specific design requested
// Using the specific colors from the provided HTML
const COLORS = {
    primary: "#9fff00", // neon-green from HTML
    backgroundDark: "#010100", // User requested always #010100
    cardDark: "#0f172a", // slate-900
    cardBorder: "#1e293b", // slate-800
    textLight: "#f1f5f9", // slate-100
    textGray: "#94a3b8", // slate-400
    textDark: "#000000",
    white: "#ffffff",
    red400: "#f87171",
    red900: "#7f1d1d",
    green400: "#4ade80",
    green900: "#14532d",
    blue400: "#60a5fa",
    blue900: "#1e3a8a",
    orange400: "#fb923c",
    purple400: "#c084fc",
    purple900: "#581c87",
};

export default function ExpenseManagementScreen({ navigation, route }) {
    const [projects, setProjects] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('Tümü');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    // Create Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        category: 'Yemek',
        description: '',
        category: 'Yemek',
        description: '',
        jobId: '',
        date: new Date()
    });
    const [showDatePicker, setShowDatePicker] = useState(false);

    useEffect(() => {
        loadData();
        if (route.params?.openCreate) {
            setModalVisible(true);
            navigation.setParams({ openCreate: undefined });
        }
    }, [route.params]);

    const loadData = async () => {
        try {
            setLoading(true);
            const myJobs = await jobService.getMyJobs();
            const myCosts = await costService.getMyCosts();

            setProjects(myJobs || []);
            setExpenses(myCosts || []);

            if (myJobs && myJobs.length > 0) {
                setSelectedProject(myJobs[0]);
                setFormData(prev => ({ ...prev, jobId: myJobs[0].id }));
            }
        } catch (error) {
            console.error('Error loading jobs:', error);
            Alert.alert('Hata', 'Projeler yüklenirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateExpense = async () => {
        if (!formData.title || !formData.amount) {
            Alert.alert('Hata', 'Lütfen başlık ve tutar giriniz.');
            return;
        }

        try {
            await costService.create({
                ...formData,
                amount: parseFloat(formData.amount),
                ...formData,
                amount: parseFloat(formData.amount),
                date: formData.date.toISOString()
            });
            Alert.alert('Başarılı', 'Masraf başarıyla eklendi.');
            setModalVisible(false);
            setFormData({ title: '', amount: '', category: 'Yemek', description: '', jobId: '', date: new Date() });
            loadData();
        } catch (error) {
            console.error('Create expense error:', error);
            Alert.alert('Hata', 'Masraf eklenirken bir hata oluştu.');
        }
    };

    const handleProjectSelect = (project) => {
        setSelectedProject(project);
        setFormData(prev => ({ ...prev, jobId: project.id }));
    };
    const categories = [
        { id: 'Tümü', icon: 'tune', label: 'Tümü' },
        { id: 'Seyahat', icon: 'directions-car', label: 'Seyahat' },
        { id: 'Yol', icon: 'commute', label: 'Yol' },
        { id: 'Yemek', icon: 'restaurant', label: 'Yemek' },
        { id: 'Malzeme', icon: 'storefront', label: 'Malzeme' },
        { id: 'Konaklama', icon: 'hotel', label: 'Konaklama' },
        { id: 'Yakıt', icon: 'local-gas-station', label: 'Yakıt' },
        { id: 'Diğer', icon: 'more-horiz', label: 'Diğer' },
    ];

    const filteredExpenses = expenses.filter(expense => {
        const matchesProject = selectedProject ? expense.jobId === selectedProject.id : true;
        const matchesCategory = selectedCategory === 'Tümü' ? true : expense.category === selectedCategory;
        const matchesSearch = searchQuery ? (expense.description?.toLowerCase().includes(searchQuery.toLowerCase()) || expense.category?.toLowerCase().includes(searchQuery.toLowerCase())) : true;
        return matchesProject && matchesCategory && matchesSearch;
    });

    const groupExpensesByDate = (expenses) => {
        const groups = {
            'Bugün': [],
            'Dün': [],
            'Geçen Hafta': [],
            'Geçen Ay': [],
            'Daha Eski': []
        };

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const lastWeek = new Date(today);
        lastWeek.setDate(lastWeek.getDate() - 7);
        const lastMonth = new Date(today);
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        expenses.forEach(expense => {
            const date = new Date(expense.date);
            const expenseDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

            if (expenseDate.getTime() === today.getTime()) {
                groups['Bugün'].push(expense);
            } else if (expenseDate.getTime() === yesterday.getTime()) {
                groups['Dün'].push(expense);
            } else if (expenseDate > lastWeek) {
                groups['Geçen Hafta'].push(expense);
            } else if (expenseDate > lastMonth) {
                groups['Geçen Ay'].push(expense);
            } else {
                groups['Daha Eski'].push(expense);
            }
        });

        return groups;
    };

    const groupedExpenses = groupExpensesByDate(filteredExpenses);

    const getStatusColor = (status) => {
        switch (status) {
            case 'APPROVED': return COLORS.green400;
            case 'PENDING': return COLORS.orange400;
            case 'REJECTED': return COLORS.red400;
            default: return COLORS.textGray;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'APPROVED': return 'Onaylandı';
            case 'PENDING': return 'Bekliyor';
            case 'REJECTED': return 'Reddedildi';
            default: return '';
        }
    };

    const getIconColor = (colorName) => {
        switch (colorName) {
            case 'red': return COLORS.red400;
            case 'blue': return COLORS.blue400;
            case 'purple': return COLORS.purple400;
            default: return COLORS.textGray;
        }
    };

    const getIconBgColor = (category) => {
        // Simple mapping based on category or just random/fixed colors
        return 'rgba(148, 163, 184, 0.1)';
    };

    const getCategoryIcon = (category) => {
        const cat = categories.find(c => c.id === category);
        return cat ? cat.icon : 'attach-money';
    };

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
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.projectFilterContainer}>
                    {projects.map((project, index) => (
                        <TouchableOpacity
                            key={project.id || index}
                            style={[
                                styles.projectChip,
                                selectedProject?.id === project.id ? styles.projectChipSelected : styles.projectChipUnselected
                            ]}
                            onPress={() => handleProjectSelect(project)}
                        >
                            <Text style={[
                                styles.projectChipText,
                                selectedProject?.id === project.id ? styles.projectChipTextSelected : styles.projectChipTextUnselected
                            ]}>
                                {project.title}
                            </Text>
                            {selectedProject?.id === project.id && (
                                <MaterialIcons name="expand-more" size={20} color={COLORS.primary} />
                            )}
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Budget Card */}
                <View style={styles.budgetCard}>
                    <View style={styles.budgetHeader}>
                        <Text style={styles.budgetTitle}>Kullanılan Toplam Bütçe</Text>
                        <Text style={styles.budgetAmount}>₺13,000</Text>
                    </View>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: '65%' }]} />
                    </View>
                    <View style={styles.budgetFooter}>
                        <Text style={styles.budgetFooterText}>₺7,000 Kalan</Text>
                        <Text style={styles.budgetFooterText}>₺20,000 Toplam</Text>
                    </View>
                </View>

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
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilterContainer}>
                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat.id}
                            style={[
                                styles.categoryChip,
                                selectedCategory === cat.id ? styles.categoryChipSelected : styles.categoryChipUnselected
                            ]}
                            onPress={() => setSelectedCategory(cat.id)}
                        >
                            <MaterialIcons
                                name={cat.icon}
                                size={20}
                                color={selectedCategory === cat.id ? COLORS.primary : COLORS.textGray}
                            />
                            <Text style={[
                                styles.categoryChipText,
                                selectedCategory === cat.id ? styles.categoryChipTextSelected : styles.categoryChipTextUnselected
                            ]}>
                                {cat.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Expenses List */}
                <View style={styles.expensesList}>
                    {Object.entries(groupedExpenses).map(([groupName, groupExpenses]) => (
                        groupExpenses.length > 0 && (
                            <View key={groupName}>
                                <Text style={styles.dateHeader}>{groupName}</Text>
                                {groupExpenses.map((expense) => (
                                    <View key={expense.id} style={styles.expenseCard}>
                                        <View style={[styles.expenseIconCircle, { backgroundColor: getIconBgColor(expense.category) }]}>
                                            <MaterialIcons name={getCategoryIcon(expense.category)} size={24} color={COLORS.textLight} />
                                        </View>
                                        <View style={styles.expenseInfo}>
                                            <Text style={styles.expenseTitle}>{expense.description || expense.category}</Text>
                                            <Text style={styles.expenseDate}>{new Date(expense.date).toLocaleDateString('tr-TR')}</Text>
                                            {expense.job?.title && <Text style={{ fontSize: 12, color: COLORS.textGray }}>{expense.job.title}</Text>}
                                        </View>
                                        <View style={styles.expenseAmountContainer}>
                                            <Text style={styles.expenseAmount}>₺{expense.amount}</Text>
                                            <View style={styles.statusContainer}>
                                                <View style={[styles.statusDot, { backgroundColor: getStatusColor(expense.status) }]} />
                                                <Text style={[styles.statusText, { color: getStatusColor(expense.status) }]}>
                                                    {getStatusText(expense.status)}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )
                    ))}
                    {filteredExpenses.length === 0 && (
                        <Text style={{ color: COLORS.textGray, textAlign: 'center', marginTop: 20 }}>Masraf bulunamadı.</Text>
                    )}
                </View>

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
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Yeni Masraf Ekle</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <MaterialIcons name="close" size={24} color={COLORS.textGray} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView>
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Başlık</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Örn: Öğle Yemeği"
                                    placeholderTextColor={COLORS.textGray}
                                    value={formData.title}
                                    onChangeText={(text) => setFormData({ ...formData, title: text })}
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Tarih</Text>
                                <TouchableOpacity
                                    style={styles.dateSelector}
                                    onPress={() => setShowDatePicker(true)}
                                >
                                    <MaterialIcons name="event" size={24} color={COLORS.textGray} />
                                    <Text style={styles.dateText}>
                                        {formData.date.toLocaleDateString('tr-TR')}
                                    </Text>
                                </TouchableOpacity>
                                {showDatePicker && (
                                    <DateTimePicker
                                        value={formData.date}
                                        mode="date"
                                        display="default"
                                        onChange={(event, selectedDate) => {
                                            setShowDatePicker(Platform.OS === 'ios');
                                            if (selectedDate) {
                                                setFormData({ ...formData, date: selectedDate });
                                            }
                                        }}
                                    />
                                )}
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Tutar (₺)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="0.00"
                                    placeholderTextColor={COLORS.textGray}
                                    keyboardType="numeric"
                                    value={formData.amount}
                                    onChangeText={(text) => setFormData({ ...formData, amount: text })}
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Kategori</Text>
                                <View style={styles.categorySelector}>
                                    {categories.filter(c => c.id !== 'Tümü').map((cat) => (
                                        <TouchableOpacity
                                            key={cat.id}
                                            style={[
                                                styles.categoryOption,
                                                formData.category === cat.id && styles.categoryOptionSelected
                                            ]}
                                            onPress={() => setFormData({ ...formData, category: cat.id })}
                                        >
                                            <MaterialIcons
                                                name={cat.icon}
                                                size={20}
                                                color={formData.category === cat.id ? COLORS.backgroundDark : COLORS.textGray}
                                            />
                                            <Text style={[
                                                styles.categoryOptionText,
                                                formData.category === cat.id && styles.categoryOptionTextSelected
                                            ]}>{cat.label}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Açıklama</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Masraf detayı..."
                                    placeholderTextColor={COLORS.textGray}
                                    multiline
                                    numberOfLines={3}
                                    value={formData.description}
                                    onChangeText={(text) => setFormData({ ...formData, description: text })}
                                />
                            </View>

                            <TouchableOpacity
                                style={styles.submitButton}
                                onPress={handleCreateExpense}
                            >
                                <Text style={styles.submitButtonText}>Kaydet</Text>
                            </TouchableOpacity>
                        </ScrollView>
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
    projectFilterContainer: {
        padding: 16,
        flexDirection: 'row',
    },
    projectChip: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 40,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginRight: 12,
        borderWidth: 1,
    },
    projectChipSelected: {
        backgroundColor: 'rgba(204, 255, 4, 0.1)', // primary with opacity
        borderColor: 'rgba(204, 255, 4, 0.4)',
    },
    projectChipUnselected: {
        backgroundColor: COLORS.cardBorder, // slate-800
        borderColor: COLORS.cardBorder,
    },
    projectChipText: {
        fontSize: 14,
        fontWeight: '500',
        marginRight: 4,
    },
    projectChipTextSelected: {
        color: COLORS.primary,
    },
    projectChipTextUnselected: {
        color: COLORS.textGray,
    },
    budgetCard: {
        margin: 16,
        marginTop: 0,
        padding: 20,
        backgroundColor: COLORS.cardDark, // slate-900
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
    },
    budgetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    budgetTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: COLORS.textLight,
    },
    budgetAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textLight,
    },
    progressBarBg: {
        height: 8,
        backgroundColor: COLORS.cardBorder, // slate-700 equivalent
        borderRadius: 4,
        marginBottom: 12,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: COLORS.primary,
        borderRadius: 4,
    },
    budgetFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    budgetFooterText: {
        fontSize: 14,
        color: COLORS.textGray,
    },
    searchContainer: {
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.cardBorder, // slate-800
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
    categoryFilterContainer: {
        paddingHorizontal: 16,
        marginBottom: 16,
        flexDirection: 'row',
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 36,
        paddingHorizontal: 12,
        borderRadius: 18,
        marginRight: 12,
    },
    categoryChipSelected: {
        backgroundColor: 'rgba(204, 255, 4, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(204, 255, 4, 0.4)',
    },
    categoryChipUnselected: {
        backgroundColor: COLORS.cardBorder,
    },
    categoryChipText: {
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 8,
    },
    categoryChipTextSelected: {
        color: COLORS.primary,
    },
    categoryChipTextUnselected: {
        color: COLORS.textGray,
    },
    expensesList: {
        paddingHorizontal: 16,
    },
    dateHeader: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.textGray,
        marginBottom: 12,
        marginLeft: 4,
    },
    expenseCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.cardDark,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
        marginBottom: 12,
    },
    expenseIconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    expenseInfo: {
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
        color: COLORS.textGray,
    },
    expenseAmountContainer: {
        alignItems: 'flex-end',
    },
    expenseAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textLight,
        marginBottom: 4,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 4,
    },
    statusText: {
        fontSize: 12,
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.cardDark,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '80%',
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.textLight,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.textGray,
        marginBottom: 8,
    },
    input: {
        backgroundColor: COLORS.cardBorder,
        borderRadius: 12,
        padding: 16,
        color: COLORS.textLight,
        fontSize: 16,
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    categorySelector: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    categoryOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: COLORS.cardBorder,
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
        gap: 8,
    },
    categoryOptionSelected: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    categoryOptionText: {
        color: COLORS.textGray,
        fontWeight: '500',
    },
    categoryOptionTextSelected: {
        color: COLORS.backgroundDark,
        fontWeight: 'bold',
    },
    submitButton: {
        backgroundColor: COLORS.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 24,
    },
    submitButtonText: {
        color: COLORS.backgroundDark,
        fontSize: 16,
        fontWeight: 'bold',
    },
});
