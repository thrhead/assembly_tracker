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
    Modal,
    ScrollView,
    Alert,
    Linking
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../services/api';
import jobService from '../../services/job.service';
import templateService from '../../services/template.service';
import customerService from '../../services/customer.service';
import teamService from '../../services/team.service';
import { COLORS } from '../../constants/theme';

export default function WorkerJobsScreen() {
    const navigation = useNavigation();
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('Tümü');
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [templates, setTemplates] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [teams, setTeams] = useState([]);

    // Modal States
    const [modalVisible, setModalVisible] = useState(false);
    const [uploadModalVisible, setUploadModalVisible] = useState(false);
    const [selectionModalVisible, setSelectionModalVisible] = useState(false);
    const [selectionItems, setSelectionItems] = useState([]);
    const [selectionTitle, setSelectionTitle] = useState('');
    const [selectionTarget, setSelectionTarget] = useState(''); // 'customer', 'priority', 'template'

    // Form Data
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        customerId: '',
        customerName: '',
        teamId: null,
        teamName: '',
        priority: 'MEDIUM',
        scheduledDate: new Date(),
        scheduledEndDate: new Date(),
        location: '',
        templateId: null,
        templateName: '',
        steps: []
    });

    // Date Picker State
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [datePickerMode, setDatePickerMode] = useState('date');
    const [dateTarget, setDateTarget] = useState('start'); // 'start' or 'end'

    const isAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER';

    useFocusEffect(
        useCallback(() => {
            fetchJobs();
            if (isAdmin) {
                fetchTemplatesAndCustomers();
            }
        }, [isAdmin])
    );

    useEffect(() => {
        filterJobs();
    }, [jobs, selectedFilter, searchQuery]);

    const fetchJobs = async () => {
        try {
            const data = isAdmin ? await jobService.getAllJobs() : await jobService.getMyJobs();
            setJobs(data);
        } catch (error) {
            console.error('Error fetching jobs:', error);
        }
    };

    const fetchTemplatesAndCustomers = async () => {
        try {
            const [customersResult, teamsResult, templatesResult] = await Promise.allSettled([
                customerService.getAll(),
                teamService.getAll(),
                templateService.getAll()
            ]);

            // Handle Customers
            if (customersResult.status === 'fulfilled') {
                const custData = customersResult.value;
                console.log('WorkerJobs: Fetched customers:', custData?.length);
                if (Array.isArray(custData)) {
                    setCustomers(custData);
                }
            } else {
                console.error('Error fetching customers:', customersResult.reason);
            }

            // Handle Teams
            if (teamsResult.status === 'fulfilled') {
                const teamData = teamsResult.value;
                console.log('WorkerJobs: Fetched teams:', teamData?.length);
                if (Array.isArray(teamData)) {
                    setTeams(teamData);
                } else {
                    console.error('Teams data is not an array:', teamData);
                    setTeams([]);
                }
            } else {
                console.error('Error fetching teams:', teamsResult.reason);
            }

            // Handle Templates
            if (templatesResult.status === 'fulfilled') {
                const tmplData = templatesResult.value;
                console.log('WorkerJobs: Fetched templates:', tmplData?.length);
                if (Array.isArray(tmplData)) {
                    setTemplates(tmplData);
                } else {
                    console.error('Templates data is not an array:', tmplData);
                    setTemplates([]);
                }
            } else {
                console.error('Error fetching templates:', templatesResult.reason);
            }

        } catch (error) {
            console.error('Error in fetchTemplatesAndCustomers:', error);
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

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            customerId: '',
            customerName: '',
            teamId: null,
            teamName: '',
            priority: 'MEDIUM',
            scheduledDate: new Date(),
            scheduledEndDate: new Date(),
            location: '',
            templateId: null,
            templateName: '',
            steps: []
        });
    };

    const handleCreateJob = async () => {
        if (!formData.title || !formData.customerId) {
            Alert.alert('Hata', 'Lütfen başlık ve müşteri seçin.');
            return;
        }

        try {
            await jobService.create(formData);
            setModalVisible(false);
            resetForm();
            onRefresh();
            Alert.alert('Başarılı', 'İş oluşturuldu.');
        } catch (error) {
            Alert.alert('Hata', 'İş oluşturulurken bir hata oluştu.');
            console.error(error);
        }
    };

    const handlePickDocument = async (type) => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                copyToCacheDirectory: true
            });

            if (result.assets && result.assets.length > 0) {
                const file = result.assets[0];
                Alert.alert('Bilgi', 'Excel yükleme özelliği backend ile bağlanacak.');
                setUploadModalVisible(false);
            }
        } catch (err) {
            console.error('Document picker error:', err);
        }
    };

    const openSelection = async (target) => {
        setSelectionTarget(target);
        setSelectionModalVisible(true);

        if (target === 'customer') {
            setSelectionTitle('Müşteri Seç');
            let currentCustomers = customers;
            if (customers.length === 0) {
                try {
                    const custData = await customerService.getAll();
                    if (Array.isArray(custData)) {
                        setCustomers(custData);
                        currentCustomers = custData;
                    }
                } catch (e) {
                    console.error('Lazy fetch customers failed', e);
                    Alert.alert('Hata', 'Müşteri listesi yüklenemedi.');
                }
            }
            setSelectionItems(currentCustomers.map(c => ({
                id: c.id,
                label: c.company || c.companyName,
                sub: c.user?.name || c.contactPerson
            })));

        } else if (target === 'team') {
            setSelectionTitle('Ekip Seç');
            let currentTeams = teams;
            console.log('WorkerJobs: Opening team selection. Current teams count:', teams.length);

            if (teams.length === 0) {
                try {
                    console.log('WorkerJobs: Teams empty, fetching...');
                    const teamData = await teamService.getAll();
                    console.log('WorkerJobs: Lazy fetched teams:', teamData?.length);
                    if (Array.isArray(teamData)) {
                        setTeams(teamData);
                        currentTeams = teamData;
                    }
                } catch (e) {
                    console.error('Lazy fetch teams failed', e);
                    Alert.alert('Hata', 'Ekip listesi yüklenemedi.');
                }
            }

            // Map teams for selection
            const mappedTeams = currentTeams.map(t => ({ id: t.id, label: t.name }));
            // console.log('WorkerJobs: Mapped teams:', JSON.stringify(mappedTeams));

            // Add "No Assignment" option
            const options = [{ id: null, label: 'Henüz Atama Yapma' }, ...mappedTeams];
            setSelectionItems(options);

        } else if (target === 'priority') {
            setSelectionTitle('Öncelik Seç');
            setSelectionItems([
                { id: 'LOW', label: 'Düşük' },
                { id: 'MEDIUM', label: 'Orta' },
                { id: 'HIGH', label: 'Yüksek' },
                { id: 'URGENT', label: 'Acil' }
            ]);
        } else if (target === 'template') {
            setSelectionTitle('Şablon Seç');
            let currentTemplates = templates;
            if (templates.length === 0) {
                try {
                    const tmplData = await templateService.getAll();
                    if (Array.isArray(tmplData)) {
                        setTemplates(tmplData);
                        currentTemplates = tmplData;
                    }
                } catch (e) {
                    console.error('Lazy fetch templates failed', e);
                }
            }
            setSelectionItems(currentTemplates.map(t => ({ id: t.id, label: t.name, sub: t.description })));
        }
    };

    const handleSelect = (item) => {
        if (selectionTarget === 'customer') {
            setFormData(prev => ({ ...prev, customerId: item.id, customerName: item.label }));
        } else if (selectionTarget === 'team') {
            setFormData(prev => ({ ...prev, teamId: item.id, teamName: item.label }));
        } else if (selectionTarget === 'priority') {
            setFormData(prev => ({ ...prev, priority: item.id }));
        } else if (selectionTarget === 'template') {
            const template = templates.find(t => t.id === item.id);
            if (template) {
                const steps = template.steps.map(s => ({
                    title: s.title,
                    description: s.description,
                    subSteps: s.subSteps?.map(sub => ({ title: sub.title })) || []
                }));
                setFormData(prev => ({
                    ...prev,
                    templateId: item.id,
                    templateName: item.label,
                    steps: steps
                }));
            }
        }
        setSelectionModalVisible(false);
    };

    // --- Date Logic ---
    const openDatePicker = (target, mode) => {
        setDateTarget(target);
        setDatePickerMode(mode);
        setShowDatePicker(true);
    };

    const onDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            if (dateTarget === 'start') {
                setFormData(prev => ({ ...prev, scheduledDate: selectedDate }));
            } else {
                setFormData(prev => ({ ...prev, scheduledEndDate: selectedDate }));
            }
        }
    };

    // --- Renderers ---
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
                            <Text style={styles.infoText}>{item.scheduledDate ? new Date(item.scheduledDate).toLocaleDateString() : 'Tarih Yok'}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <MaterialIcons name="person" size={16} color={COLORS.neonGreen} />
                            <Text style={styles.infoText}>
                                Atanan: {item.assignments?.[0]?.team?.name || item.assignments?.[0]?.worker?.name || item.assignee?.name || 'Atanmamış'}
                            </Text>
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
                ListEmptyComponent={<View style={styles.emptyContainer}><Text style={styles.emptyText}>Görev bulunamadı.</Text></View>}
            />

            {isAdmin && (
                <View style={styles.fabContainer}>
                    <TouchableOpacity style={[styles.fab, { marginBottom: 16, backgroundColor: '#3b82f6' }]} onPress={() => setUploadModalVisible(true)}>
                        <MaterialCommunityIcons name="file-excel-box" size={28} color={COLORS.white} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
                        <MaterialIcons name="add" size={30} color={COLORS.black} />
                    </TouchableOpacity>
                </View>
            )}

            {/* Upload Modal */}
            <Modal
                visible={uploadModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setUploadModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { width: '80%' }]}>
                        <Text style={styles.modalTitle}>Excel Yükleme</Text>
                        <TouchableOpacity style={[styles.selectorButton, { marginBottom: 12, justifyContent: 'center' }]} onPress={() => handlePickDocument('job')}>
                            <MaterialIcons name="file-upload" size={24} color={COLORS.neonGreen} style={{ marginRight: 10 }} />
                            <Text style={styles.selectorButtonText}>Toplu İş Yükle (Excel)</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.selectorButton, { marginBottom: 12, justifyContent: 'center' }]} onPress={() => handlePickDocument('template')}>
                            <MaterialIcons name="file-upload" size={24} color={COLORS.blue500} style={{ marginRight: 10 }} />
                            <Text style={styles.selectorButtonText}>Şablon Yükle (Excel)</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.selectorButton, { justifyContent: 'center', borderColor: COLORS.textGray }]}
                            onPress={() => {
                                const url = `${API_BASE_URL}/api/admin/templates/sample`;
                                Linking.openURL(url).catch(err => {
                                    console.error("Couldn't load page", err);
                                    Alert.alert('Hata', 'Şablon indirme linki açılamadı.');
                                });
                            }}
                        >
                            <MaterialIcons name="file-download" size={24} color={COLORS.textLight} style={{ marginRight: 10 }} />
                            <Text style={styles.selectorButtonText}>Örnek Şablon İndir</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.cancelButton, { marginTop: 20 }]} onPress={() => setUploadModalVisible(false)}>
                            <Text style={styles.cancelButtonText}>İptal</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>


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
                        <ScrollView style={{ maxHeight: 500 }}>
                            <Text style={styles.label}>İş Şablonu (Opsiyonel)</Text>
                            <TouchableOpacity style={styles.selectorButton} onPress={() => openSelection('template')}>
                                <Text style={styles.selectorButtonText}>{formData.templateName || 'Şablon Seç'}</Text>
                                <MaterialIcons name="arrow-drop-down" size={24} color="#aaa" />
                            </TouchableOpacity>

                            <Text style={styles.label}>İş Başlığı *</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.title}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
                                placeholder="Örn: Klima Montajı"
                                placeholderTextColor="#666"
                            />

                            <Text style={styles.label}>Müşteri *</Text>
                            <TouchableOpacity style={styles.selectorButton} onPress={() => openSelection('customer')}>
                                <Text style={styles.selectorButtonText}>{formData.customerName || 'Müşteri Seç'}</Text>
                                <MaterialIcons name="arrow-drop-down" size={24} color="#aaa" />
                            </TouchableOpacity>

                            <Text style={styles.label}>Atanacak Ekip (Opsiyonel)</Text>
                            <TouchableOpacity style={styles.selectorButton} onPress={() => openSelection('team')}>
                                <Text style={styles.selectorButtonText}>{formData.teamName || 'Ekip Seç'}</Text>
                                <MaterialIcons name="arrow-drop-down" size={24} color="#aaa" />
                            </TouchableOpacity>

                            <Text style={styles.label}>Öncelik</Text>
                            <TouchableOpacity style={styles.selectorButton} onPress={() => openSelection('priority')}>
                                <Text style={styles.selectorButtonText}>
                                    {formData.priority === 'LOW' ? 'Düşük' :
                                        formData.priority === 'MEDIUM' ? 'Orta' :
                                            formData.priority === 'HIGH' ? 'Yüksek' : 'Acil'}
                                </Text>
                                <MaterialIcons name="arrow-drop-down" size={24} color="#aaa" />
                            </TouchableOpacity>

                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.label}>Başlangıç</Text>
                                    <TouchableOpacity style={styles.selectorButton} onPress={() => openDatePicker('start', 'date')}>
                                        <Text style={styles.selectorButtonText}>{formData.scheduledDate.toLocaleDateString()}</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.label}>Bitiş</Text>
                                    <TouchableOpacity style={styles.selectorButton} onPress={() => openDatePicker('end', 'date')}>
                                        <Text style={styles.selectorButtonText}>{formData.scheduledEndDate.toLocaleDateString()}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <Text style={styles.label}>Konum</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.location}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
                                placeholder="Adres..."
                                placeholderTextColor="#666"
                            />

                            <Text style={styles.label}>Açıklama</Text>
                            <TextInput
                                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                                value={formData.description}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                                placeholder="İş detayları..."
                                placeholderTextColor="#666"
                                multiline
                            />
                        </ScrollView>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => { setModalVisible(false); resetForm(); }}>
                                <Text style={styles.cancelButtonText}>İptal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveButton} onPress={handleCreateJob}>
                                <Text style={styles.saveButtonText}>Oluştur</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Selection Modal */}
            <Modal
                visible={selectionModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setSelectionModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { maxHeight: '80%' }]}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginBottom: 15 }}>
                            <Text style={styles.modalTitle}>{selectionTitle}</Text>
                            <TouchableOpacity onPress={() => setSelectionModalVisible(false)}>
                                <MaterialIcons name="close" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={selectionItems}
                            keyExtractor={item => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={styles.selectionItem} onPress={() => handleSelect(item)}>
                                    <Text style={styles.selectionItemText}>{item.label}</Text>
                                    {item.sub && <Text style={styles.selectionItemSub}>{item.sub}</Text>}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>

            {
                showDatePicker && (
                    <DateTimePicker
                        value={dateTarget === 'start' ? formData.scheduledDate : formData.scheduledEndDate}
                        mode={datePickerMode}
                        is24Hour={true}
                        display="default"
                        onChange={onDateChange}
                    />
                )
            }
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
    card: { backgroundColor: COLORS.cardDark, borderRadius: 12, borderWidth: 1, borderColor: COLORS.cardBorder, marginBottom: 16, overflow: 'hidden' },
    cardActive: { borderColor: 'rgba(57, 255, 20, 0.5)', shadowColor: COLORS.neonGreen, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 5 },
    cardCompleted: { opacity: 0.6 },
    cardContent: { padding: 16 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    cardTitle: { fontSize: 18, fontWeight: '600', color: COLORS.textLight, flex: 1, marginRight: 8, lineHeight: 24 },
    textStrike: { textDecorationLine: 'line-through' },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    priorityDot: { width: 12, height: 12, borderRadius: 6 },
    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    badgeText: { fontSize: 12, fontWeight: '500' },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
    footerInfo: { gap: 4 },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    infoText: { fontSize: 14, color: COLORS.textGray },
    detailsButton: { backgroundColor: COLORS.neonGreen, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, minWidth: 84, alignItems: 'center' },
    detailsButtonText: { color: COLORS.black, fontSize: 14, fontWeight: '500' },
    fabContainer: { position: 'absolute', bottom: 24, right: 24, alignItems: 'center' },
    fab: { width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.neonGreen, alignItems: 'center', justifyContent: 'center', shadowColor: COLORS.neonGreen, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 10 },
    emptyContainer: { padding: 20, alignItems: 'center' },
    emptyText: { color: COLORS.textGray },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: '#1A1A1A', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#333' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#ffffff', marginBottom: 20, textAlign: 'center' },
    label: { color: '#e2e8f0', marginBottom: 6, fontWeight: '600', fontSize: 14, marginTop: 10 },
    input: { backgroundColor: '#2d3748', borderRadius: 8, padding: 12, color: '#ffffff', borderWidth: 1, borderColor: '#4b5563' },
    selectorButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#2d3748', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#4b5563' },
    selectorButtonText: { color: '#ffffff' },
    modalButtons: { flexDirection: 'row', gap: 12, marginTop: 20 },
    cancelButton: { flex: 1, padding: 14, borderRadius: 8, backgroundColor: '#334155', alignItems: 'center' },
    saveButton: { flex: 1, padding: 14, borderRadius: 8, backgroundColor: '#CCFF04', alignItems: 'center' },
    cancelButtonText: { color: '#e2e8f0', fontWeight: '600' },
    saveButtonText: { color: '#000000', fontWeight: 'bold' },

    // Selection Modal Styles
    selectionItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#333' },
    selectionItemText: { color: '#fff', fontSize: 16 },
    selectionItemSub: { color: '#888', fontSize: 12, marginTop: 4 }
});
