import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Platform,
    Modal,
    KeyboardAvoidingView
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '../../components/CustomDateTimePicker';
import { COLORS } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import customerService from '../../services/customer.service';
import teamService from '../../services/team.service';
import { useJobForm } from '../../hooks/useJobForm';
import { CHECKLIST_TEMPLATES } from '../../constants/templates';
import SelectionModal from '../../components/admin/SelectionModal';
import ChecklistManager from '../../components/admin/ChecklistManager';

export default function EditJobScreen({ route, navigation }) {
    const { job } = route.params;
    const { theme, isDark } = useTheme();
    const [customers, setCustomers] = useState([]);
    const [teams, setTeams] = useState([]);

    const {
        formData,
        setFormData,
        steps,
        loading,
        addStep,
        removeStep,
        updateStep,
        addSubStep,
        removeSubStep,
        updateSubStep,
        moveStep,
        loadTemplate,
        submitJob
    } = useJobForm(job);

    // UI State
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [showActualStartDatePicker, setShowActualStartDatePicker] = useState(false);
    const [showActualEndDatePicker, setShowActualEndDatePicker] = useState(false);
    
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [showTeamModal, setShowTeamModal] = useState(false);
    const [showPriorityModal, setShowPriorityModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showAcceptanceStatusModal, setShowAcceptanceStatusModal] = useState(false);
    const [showTemplateModal, setShowTemplateModal] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [customersData, teamsData] = await Promise.all([
                customerService.getAll(),
                teamService.getAll()
            ]);
            setCustomers(customersData);
            setTeams(teamsData);
        } catch (error) {
            console.error('Error loading data:', error);
            Alert.alert('Hata', 'Veriler yüklenemedi');
        }
    };

    const getCustomerLabel = () => {
        const customer = customers.find(c => c.id === formData.customerId);
        return customer ? `${customer.company || customer.companyName} (${customer.user?.name || customer.contactPerson})` : 'Müşteri Seçiniz';
    };

    const getTeamLabel = () => {
        const team = teams.find(t => t.id === formData.teamId);
        return team ? team.name : 'Ekip Seçiniz (Opsiyonel)';
    };

    const getStatusLabel = (status) => {
        const labels = {
            'PENDING': 'Beklemede',
            'IN_PROGRESS': 'Devam Ediyor',
            'COMPLETED': 'Tamamlandı',
            'CANCELLED': 'İptal Edildi'
        };
        return labels[status] || status;
    };

    const getAcceptanceLabel = (status) => {
        const labels = {
            'PENDING': 'Onay Bekliyor',
            'ACCEPTED': 'Kabul Edildi',
            'REJECTED': 'Reddedildi'
        };
        return labels[status] || status;
    };

    const renderDatePicker = (show, setShow, dateValue, field) => {
        if (!show) return null;

        if (Platform.OS === 'web') {
            return (
                <Modal transparent={true} visible={true} onRequestClose={() => setShow(false)}>
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalContent, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                            <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
                                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Tarih Seç</Text>
                                <TouchableOpacity onPress={() => setShow(false)}>
                                    <MaterialIcons name="close" size={24} color={theme.colors.subText} />
                                </TouchableOpacity>
                            </View>
                            <View style={{ padding: 20 }}>
                                <input
                                    type="datetime-local"
                                    defaultValue={dateValue ? new Date(dateValue).toISOString().slice(0, 16) : ''}
                                    style={{
                                        padding: 10,
                                        fontSize: 16,
                                        border: `1px solid ${theme.colors.border}`,
                                        borderRadius: 8,
                                        backgroundColor: theme.colors.surface,
                                        color: theme.colors.text,
                                        width: '100%'
                                    }}
                                    onChange={(e) => {
                                        const date = e.target.value ? new Date(e.target.value) : null;
                                        setFormData({ ...formData, [field]: date });
                                        setShow(false);
                                    }}
                                />
                            </View>
                        </View>
                    </View>
                </Modal>
            );
        }

        return (
            <DateTimePicker
                value={dateValue || new Date()}
                mode="datetime"
                display="default"
                onChange={(event, selectedDate) => {
                    setShow(false);
                    if (selectedDate) {
                        setFormData({ ...formData, [field]: selectedDate });
                    }
                }}
            />
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>İşi Düzenle</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView 
                    style={{ flex: 1 }}
                    contentContainerStyle={[styles.content, { flexGrow: 1 }]}
                >
                    <View style={styles.section}>
                        <CustomInput
                            label="İş Başlığı *"
                            value={formData.title}
                            onChangeText={(text) => setFormData({ ...formData, title: text })}
                            placeholder="Örn: Klima Montajı - A Blok"
                            theme={theme}
                        />

                        <View style={styles.row}>
                            <View style={styles.col}>
                                <Text style={[styles.label, { color: theme.colors.subText }]}>Müşteri *</Text>
                                <TouchableOpacity
                                    style={[styles.selector, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                                    onPress={() => setShowCustomerModal(true)}
                                >
                                    <Text numberOfLines={1} style={[styles.selectorText, { color: theme.colors.text }]}>{getCustomerLabel()}</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.col}>
                                <Text style={[styles.label, { color: theme.colors.subText }]}>Atanacak Ekip</Text>
                                <TouchableOpacity
                                    style={[styles.selector, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                                    onPress={() => setShowTeamModal(true)}
                                >
                                    <Text numberOfLines={1} style={[styles.selectorText, { color: theme.colors.text }]}>{getTeamLabel()}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.row}>
                            <View style={styles.col}>
                                <Text style={[styles.label, { color: theme.colors.subText }]}>İş Durumu</Text>
                                <TouchableOpacity
                                    style={[styles.selector, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                                    onPress={() => setShowStatusModal(true)}
                                >
                                    <Text style={[styles.selectorText, { color: theme.colors.text }]}>{getStatusLabel(formData.status)}</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.col}>
                                <Text style={[styles.label, { color: theme.colors.subText }]}>Kabul Durumu</Text>
                                <TouchableOpacity
                                    style={[styles.selector, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                                    onPress={() => setShowAcceptanceStatusModal(true)}
                                >
                                    <Text style={[styles.selectorText, { color: theme.colors.text }]}>{getAcceptanceLabel(formData.acceptanceStatus)}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.row}>
                             <View style={styles.col}>
                                <Text style={[styles.label, { color: theme.colors.subText }]}>Öncelik</Text>
                                <TouchableOpacity
                                    style={[styles.selector, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                                    onPress={() => setShowPriorityModal(true)}
                                >
                                    <Text style={[styles.selectorText, { color: theme.colors.text }]}>{formData.priority}</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.col}>
                                <CustomInput
                                    label="Konum"
                                    value={formData.location}
                                    onChangeText={(text) => setFormData({ ...formData, location: text })}
                                    theme={theme}
                                />
                            </View>
                        </View>

                        <Text style={[styles.sectionSubtitle, { color: theme.colors.primary }]}>Planlanan Tarihler</Text>
                        <View style={styles.row}>
                            <View style={styles.col}>
                                <Text style={[styles.label, { color: theme.colors.subText }]}>Başlangıç</Text>
                                <TouchableOpacity
                                    style={[styles.dateSelector, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                                    onPress={() => setShowStartDatePicker(true)}
                                >
                                    <Text style={[styles.dateText, { color: theme.colors.text }]}>
                                        {formData.scheduledDate.toLocaleDateString('tr-TR')}
                                    </Text>
                                    <Text style={[styles.timeText, { color: theme.colors.subText }]}>
                                        {formData.scheduledDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.col}>
                                <Text style={[styles.label, { color: theme.colors.subText }]}>Bitiş</Text>
                                <TouchableOpacity
                                    style={[styles.dateSelector, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                                    onPress={() => setShowEndDatePicker(true)}
                                >
                                    <Text style={[styles.dateText, { color: theme.colors.text }]}>
                                        {formData.scheduledEndDate.toLocaleDateString('tr-TR')}
                                    </Text>
                                    <Text style={[styles.timeText, { color: theme.colors.subText }]}>
                                        {formData.scheduledEndDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <Text style={[styles.sectionSubtitle, { color: theme.colors.primary, marginTop: 12 }]}>Gerçekleşen Tarihler</Text>
                        <View style={styles.row}>
                            <View style={styles.col}>
                                <Text style={[styles.label, { color: theme.colors.subText }]}>Gerçek Başlangıç</Text>
                                <TouchableOpacity
                                    style={[styles.dateSelector, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                                    onPress={() => setShowActualStartDatePicker(true)}
                                >
                                    <Text style={[styles.dateText, { color: formData.startedAt ? theme.colors.text : theme.colors.subText }]}>
                                        {formData.startedAt ? formData.startedAt.toLocaleDateString('tr-TR') : 'Belirtilmemiş'}
                                    </Text>
                                    {formData.startedAt && (
                                        <Text style={[styles.timeText, { color: theme.colors.subText }]}>
                                            {formData.startedAt.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                            <View style={styles.col}>
                                <Text style={[styles.label, { color: theme.colors.subText }]}>Gerçek Bitiş</Text>
                                <TouchableOpacity
                                    style={[styles.dateSelector, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                                    onPress={() => setShowActualEndDatePicker(true)}
                                >
                                    <Text style={[styles.dateText, { color: formData.completedDate ? theme.colors.text : theme.colors.subText }]}>
                                        {formData.completedDate ? formData.completedDate.toLocaleDateString('tr-TR') : 'Belirtilmemiş'}
                                    </Text>
                                    {formData.completedDate && (
                                        <Text style={[styles.timeText, { color: theme.colors.subText }]}>
                                            {formData.completedDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>

                        <CustomInput
                            label="Açıklama"
                            value={formData.description}
                            onChangeText={(text) => setFormData({ ...formData, description: text })}
                            placeholder="İş detayları..."
                            multiline
                            numberOfLines={3}
                            theme={theme}
                        />
                    </View>

                    {/* Checklist Section */}
                    <ChecklistManager
                        steps={steps}
                        onAddStep={addStep}
                        onRemoveStep={removeStep}
                        onUpdateStep={updateStep}
                        onMoveStep={moveStep}
                        onAddSubStep={addSubStep}
                        onRemoveSubStep={removeSubStep}
                        onUpdateSubStep={updateSubStep}
                        onOpenTemplateModal={() => setShowTemplateModal(true)}
                        theme={theme}
                    />

                    <View style={styles.footer}>
                        <CustomButton
                            title="İptal"
                            variant="outline"
                            onPress={() => navigation.goBack()}
                            style={{ flex: 1, marginRight: 8, borderColor: theme.colors.border }}
                            textStyle={{ color: theme.colors.text }}
                        />
                        <CustomButton
                            title="Güncelle"
                            onPress={() => submitJob(() => navigation.goBack())}
                            loading={loading}
                            style={{ flex: 1, backgroundColor: theme.colors.primary }}
                            textStyle={{ color: theme.colors.textInverse }}
                        />
                    </View>
                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Modals */}
            <SelectionModal
                visible={showCustomerModal}
                onClose={() => setShowCustomerModal(false)}
                title="Müşteri Seç"
                items={customers}
                onSelect={(item) => setFormData({ ...formData, customerId: item.id })}
                selectedId={formData.customerId}
                displayKey="complex_customer"
                theme={theme}
            />

            <SelectionModal
                visible={showTeamModal}
                onClose={() => setShowTeamModal(false)}
                title="Ekip Seç"
                items={teams}
                onSelect={(item) => setFormData({ ...formData, teamId: item.id })}
                selectedId={formData.teamId}
                displayKey="name"
                theme={theme}
            />

            <SelectionModal
                visible={showPriorityModal}
                onClose={() => setShowPriorityModal(false)}
                title="Öncelik Seç"
                items={['LOW', 'MEDIUM', 'HIGH', 'URGENT']}
                onSelect={(item) => setFormData({ ...formData, priority: item })}
                selectedId={formData.priority}
                theme={theme}
            />

            <SelectionModal
                visible={showStatusModal}
                onClose={() => setShowStatusModal(false)}
                title="İş Durumu Seç"
                items={[
                    { id: 'PENDING', name: 'Beklemede' },
                    { id: 'IN_PROGRESS', name: 'Devam Ediyor' },
                    { id: 'COMPLETED', name: 'Tamamlandı' },
                    { id: 'CANCELLED', name: 'İptal Edildi' }
                ]}
                onSelect={(item) => setFormData({ ...formData, status: item.id })}
                selectedId={formData.status}
                displayKey="name"
                theme={theme}
            />

            <SelectionModal
                visible={showAcceptanceStatusModal}
                onClose={() => setShowAcceptanceStatusModal(false)}
                title="Kabul Durumu Seç"
                items={[
                    { id: 'PENDING', name: 'Onay Bekliyor' },
                    { id: 'ACCEPTED', name: 'Kabul Edildi' },
                    { id: 'REJECTED', name: 'Reddedildi' }
                ]}
                onSelect={(item) => setFormData({ ...formData, acceptanceStatus: item.id })}
                selectedId={formData.acceptanceStatus}
                displayKey="name"
                theme={theme}
            />

            <SelectionModal
                visible={showTemplateModal}
                onClose={() => setShowTemplateModal(false)}
                title="Şablon Seç"
                items={Object.keys(CHECKLIST_TEMPLATES).map(key => ({ key, ...CHECKLIST_TEMPLATES[key] }))}
                onSelect={(item) => {
                    loadTemplate(item.key);
                    setShowTemplateModal(false);
                }}
                displayKey="label"
                theme={theme}
            />

            {/* Date Pickers */}
            {renderDatePicker(showStartDatePicker, setShowStartDatePicker, formData.scheduledDate, 'scheduledDate')}
            {renderDatePicker(showEndDatePicker, setShowEndDatePicker, formData.scheduledEndDate, 'scheduledEndDate')}
            {renderDatePicker(showActualStartDatePicker, setShowActualStartDatePicker, formData.startedAt, 'startedAt')}
            {renderDatePicker(showActualEndDatePicker, setShowActualEndDatePicker, formData.completedDate, 'completedDate')}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'ios' ? 0 : 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
    },
    backButton: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    content: { padding: 16 },
    section: { marginBottom: 24 },
    sectionSubtitle: { fontSize: 14, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8 },
    label: { fontSize: 14, marginBottom: 8, fontWeight: '500' },
    selector: {
        height: 48,
        borderRadius: 8,
        borderWidth: 1,
        paddingHorizontal: 12,
        justifyContent: 'center',
        marginBottom: 16
    },
    selectorText: { fontSize: 15 },
    dateSelector: {
        height: 56,
        borderRadius: 8,
        borderWidth: 1,
        paddingHorizontal: 12,
        justifyContent: 'center',
        marginBottom: 16
    },
    dateText: { fontSize: 15, fontWeight: '500' },
    timeText: { fontSize: 12 },
    row: { flexDirection: 'row', gap: 12, marginBottom: 4 },
    col: { flex: 1 },
    footer: { flexDirection: 'row', marginTop: 20 },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    modalContent: {
        width: '100%',
        maxWidth: 400,
        borderRadius: 12,
        borderWidth: 1,
        overflow: 'hidden'
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1
    },
    modalTitle: { fontSize: 18, fontWeight: 'bold' }
});
