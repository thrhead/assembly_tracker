import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Platform,
    Modal
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '../../components/CustomDateTimePicker';
import { COLORS } from '../../constants/theme';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import customerService from '../../services/customer.service';
import teamService from '../../services/team.service';
import { useJobForm } from '../../hooks/useJobForm';
import { CHECKLIST_TEMPLATES } from '../../constants/templates';
import SelectionModal from '../../components/admin/SelectionModal';
import ChecklistManager from '../../components/admin/ChecklistManager';

export default function CreateJobScreen({ navigation }) {
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
    } = useJobForm();

    // UI State
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [showTeamModal, setShowTeamModal] = useState(false);
    const [showPriorityModal, setShowPriorityModal] = useState(false);
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

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Yeni İş Oluştur</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView style={styles.content}>
                    {/* Basic Info */}
                    <View style={styles.section}>
                        <CustomInput
                            label="İş Başlığı *"
                            value={formData.title}
                            onChangeText={(text) => setFormData({ ...formData, title: text })}
                            placeholder="Örn: Klima Montajı - A Blok"
                        />

                        <Text style={styles.label}>Müşteri *</Text>
                        <TouchableOpacity
                            style={styles.selector}
                            onPress={() => setShowCustomerModal(true)}
                        >
                            <Text style={[styles.selectorText, !formData.customerId && styles.placeholderText]}>
                                {getCustomerLabel()}
                            </Text>
                            <MaterialIcons name="arrow-drop-down" size={24} color={COLORS.slate400} />
                        </TouchableOpacity>

                        <Text style={styles.label}>Atanacak Ekip</Text>
                        <TouchableOpacity
                            style={styles.selector}
                            onPress={() => setShowTeamModal(true)}
                        >
                            <Text style={[styles.selectorText, !formData.teamId && styles.placeholderText]}>
                                {getTeamLabel()}
                            </Text>
                            <MaterialIcons name="arrow-drop-down" size={24} color={COLORS.slate400} />
                        </TouchableOpacity>

                        <Text style={styles.label}>Öncelik</Text>
                        <TouchableOpacity
                            style={styles.selector}
                            onPress={() => setShowPriorityModal(true)}
                        >
                            <Text style={styles.selectorText}>{formData.priority}</Text>
                            <MaterialIcons name="arrow-drop-down" size={24} color={COLORS.slate400} />
                        </TouchableOpacity>

                        <View style={styles.row}>
                            <View style={styles.col}>
                                <Text style={styles.label}>Başlangıç Tarihi</Text>
                                <TouchableOpacity
                                    style={styles.dateSelector}
                                    onPress={() => setShowStartDatePicker(true)}
                                >
                                    <Text style={styles.dateText}>
                                        {formData.scheduledDate.toLocaleDateString('tr-TR')}
                                    </Text>
                                    <Text style={styles.timeText}>
                                        {formData.scheduledDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.col}>
                                <Text style={styles.label}>Bitiş Tarihi</Text>
                                <TouchableOpacity
                                    style={styles.dateSelector}
                                    onPress={() => setShowEndDatePicker(true)}
                                >
                                    <Text style={styles.dateText}>
                                        {formData.scheduledEndDate.toLocaleDateString('tr-TR')}
                                    </Text>
                                    <Text style={styles.timeText}>
                                        {formData.scheduledEndDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <CustomInput
                            label="Konum / Adres"
                            value={formData.location}
                            onChangeText={(text) => setFormData({ ...formData, location: text })}
                            placeholder="Montaj yapılacak adres"
                            multiline
                        />

                        <CustomInput
                            label="Açıklama"
                            value={formData.description}
                            onChangeText={(text) => setFormData({ ...formData, description: text })}
                            placeholder="İş detayları..."
                            multiline
                            numberOfLines={3}
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
                    />

                    <View style={styles.footer}>
                        <CustomButton
                            title="İptal"
                            variant="outline"
                            onPress={() => navigation.goBack()}
                            style={{ flex: 1, marginRight: 8 }}
                        />
                        <CustomButton
                            title="Oluştur"
                            onPress={() => submitJob(() => navigation.goBack())}
                            loading={loading}
                            style={{ flex: 1 }}
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
            />

            <SelectionModal
                visible={showTeamModal}
                onClose={() => setShowTeamModal(false)}
                title="Ekip Seç"
                items={teams}
                onSelect={(item) => setFormData({ ...formData, teamId: item.id })}
                selectedId={formData.teamId}
                displayKey="name"
            />

            <SelectionModal
                visible={showPriorityModal}
                onClose={() => setShowPriorityModal(false)}
                title="Öncelik Seç"
                items={['LOW', 'MEDIUM', 'HIGH', 'URGENT']}
                onSelect={(item) => setFormData({ ...formData, priority: item })}
                selectedId={formData.priority}
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
            />

            {/* Date Pickers */}
            {(showStartDatePicker || showEndDatePicker) && (
                Platform.OS === 'web' ? (
                    <Modal
                        transparent={true}
                        visible={true}
                        onRequestClose={() => {
                            setShowStartDatePicker(false);
                            setShowEndDatePicker(false);
                        }}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>Tarih Seç</Text>
                                    <TouchableOpacity onPress={() => {
                                        setShowStartDatePicker(false);
                                        setShowEndDatePicker(false);
                                    }}>
                                        <MaterialIcons name="close" size={24} color={COLORS.slate400} />
                                    </TouchableOpacity>
                                </View>
                                <View style={{ padding: 20 }}>
                                    <input
                                        type="datetime-local"
                                        style={{
                                            padding: 10,
                                            fontSize: 16,
                                            border: `1px solid ${COLORS.slate800}`,
                                            borderRadius: 8,
                                            backgroundColor: COLORS.cardDark,
                                            color: COLORS.textLight,
                                            width: '100%'
                                        }}
                                        onChange={(e) => {
                                            const date = new Date(e.target.value);
                                            if (showStartDatePicker) {
                                                setFormData({ ...formData, scheduledDate: date });
                                                setShowStartDatePicker(false);
                                            } else {
                                                setFormData({ ...formData, scheduledEndDate: date });
                                                setShowEndDatePicker(false);
                                            }
                                        }}
                                    />
                                </View>
                            </View>
                        </View>
                    </Modal>
                ) : (
                    <DateTimePicker
                        value={showStartDatePicker ? formData.scheduledDate : formData.scheduledEndDate}
                        mode="datetime"
                        display="default"
                        onChange={(event, selectedDate) => {
                            if (showStartDatePicker) {
                                setShowStartDatePicker(false);
                                if (selectedDate) setFormData({ ...formData, scheduledDate: selectedDate });
                            } else {
                                setShowEndDatePicker(false);
                                if (selectedDate) setFormData({ ...formData, scheduledEndDate: selectedDate });
                            }
                        }}
                    />
                )
            )}
        </View>
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
        paddingTop: 20,
        backgroundColor: COLORS.cardDark,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.slate800,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    backButton: {
        padding: 8,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    section: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.slate400,
        marginBottom: 8,
        marginTop: 12,
    },
    selector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.cardDark,
        borderWidth: 1,
        borderColor: COLORS.slate800,
        borderRadius: 8,
        padding: 12,
        height: 48,
    },
    selectorText: {
        color: COLORS.textLight,
        fontSize: 14,
    },
    placeholderText: {
        color: COLORS.slate500,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    col: {
        flex: 1,
    },
    dateSelector: {
        backgroundColor: COLORS.cardDark,
        borderWidth: 1,
        borderColor: COLORS.slate800,
        borderRadius: 8,
        padding: 12,
    },
    dateText: {
        color: COLORS.textLight,
        fontSize: 14,
        fontWeight: '600',
    },
    timeText: {
        color: COLORS.slate400,
        fontSize: 12,
        marginTop: 2,
    },
    footer: {
        flexDirection: 'row',
        marginTop: 24,
    },
    // Modal Styles needed for DatePicker modal fallback
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.cardDark,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.slate800,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.white,
    },
});
