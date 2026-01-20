import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Alert, ScrollView, FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS } from '../../constants/theme';
import jobService from '../../services/job.service';
import templateService from '../../services/template.service';
import customerService from '../../services/customer.service';
import teamService from '../../services/team.service';

export default function CreateJobModal({ visible, onClose, onSuccess }) {
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

    const [templates, setTemplates] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [teams, setTeams] = useState([]);

    // Selection Modal State
    const [selectionModalVisible, setSelectionModalVisible] = useState(false);
    const [selectionItems, setSelectionItems] = useState([]);
    const [selectionTitle, setSelectionTitle] = useState('');
    const [selectionTarget, setSelectionTarget] = useState('');

    // Date Picker State
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [dateTarget, setDateTarget] = useState('start');

    // Fetch data only when modal is visible and data is empty
    useEffect(() => {
        if (visible) {
            fetchDependencies();
        }
    }, [visible]);

    const fetchDependencies = async () => {
        // Load data lazily if not already loaded, or rely on passing props if prefered.
        // For independence, we fetch here or use a cache context.
        // Given the original code fetched lazily on open, we'll keep that pattern or similar.
        // To avoid redundant network calls, you might want to move this up or use React Query.
        // For this refactor, we will implement lazy loading on selection open to match original behavior closely but cleaner.
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
            resetForm();
            onSuccess();
        } catch (error) {
            Alert.alert('Hata', 'İş oluşturulurken bir hata oluştu.');
            console.error(error);
        }
    };

    const openSelection = async (target) => {
        setSelectionTarget(target);
        setSelectionModalVisible(true);

        if (target === 'customer') {
            setSelectionTitle('Müşteri Seç');
            if (customers.length === 0) {
                try {
                    const custData = await customerService.getAll();
                    if (Array.isArray(custData)) setCustomers(custData);
                    setSelectionItems(custData.map(c => ({
                        id: c.id,
                        label: c.company || c.companyName,
                        sub: c.user?.name || c.contactPerson
                    })));
                } catch (e) { Alert.alert('Hata', 'Müşteri listesi yüklenemedi.'); }
            } else {
                setSelectionItems(customers.map(c => ({
                    id: c.id,
                    label: c.company || c.companyName,
                    sub: c.user?.name || c.contactPerson
                })));
            }

        } else if (target === 'team') {
            setSelectionTitle('Ekip Seç');
            if (teams.length === 0) {
                try {
                    const teamData = await teamService.getAll();
                    if (Array.isArray(teamData)) setTeams(teamData);
                    const options = [{ id: null, label: 'Henüz Atama Yapma' }, ...teamData.map(t => ({ id: t.id, label: t.name }))];
                    setSelectionItems(options);
                } catch (e) { Alert.alert('Hata', 'Ekip listesi yüklenemedi.'); }
            } else {
                const options = [{ id: null, label: 'Henüz Atama Yapma' }, ...teams.map(t => ({ id: t.id, label: t.name }))];
                setSelectionItems(options);
            }

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
            if (templates.length === 0) {
                try {
                    const tmplData = await templateService.getAll();
                    if (Array.isArray(tmplData)) setTemplates(tmplData);
                    setSelectionItems(tmplData.map(t => ({ id: t.id, label: t.name, sub: t.description })));
                } catch (e) { console.error(e); }
            } else {
                setSelectionItems(templates.map(t => ({ id: t.id, label: t.name, sub: t.description })));
            }
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

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
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
                                <TouchableOpacity style={styles.selectorButton} onPress={() => { setDateTarget('start'); setShowDatePicker(true); }}>
                                    <Text style={styles.selectorButtonText}>{formData.scheduledDate.toLocaleDateString()}</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.label}>Bitiş</Text>
                                <TouchableOpacity style={styles.selectorButton} onPress={() => { setDateTarget('end'); setShowDatePicker(true); }}>
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
                        <TouchableOpacity style={styles.cancelButton} onPress={() => { onClose(); resetForm(); }}>
                            <Text style={styles.cancelButtonText}>İptal</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.saveButton} onPress={handleCreateJob}>
                            <Text style={styles.saveButtonText}>Oluştur</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Internal Selection Modal */}
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
                                keyExtractor={item => item.id?.toString() || Math.random().toString()}
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

                {showDatePicker && (
                    <DateTimePicker
                        value={dateTarget === 'start' ? formData.scheduledDate : formData.scheduledEndDate}
                        mode="date"
                        is24Hour={true}
                        display="default"
                        onChange={onDateChange}
                    />
                )}
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
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
    selectionItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#333' },
    selectionItemText: { color: '#fff', fontSize: 16 },
    selectionItemSub: { color: '#888', fontSize: 12, marginTop: 4 }
});
