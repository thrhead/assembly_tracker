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
import { useTheme } from '../../context/ThemeContext';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import customerService from '../../services/customer.service';
import teamService from '../../services/team.service';
import { useJobForm } from '../../hooks/useJobForm';
import { CHECKLIST_TEMPLATES } from '../../constants/templates';
import SelectionModal from '../../components/admin/SelectionModal';
import ChecklistManager from '../../components/admin/ChecklistManager';

export default function CreateJobScreen({ navigation }) {
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
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Yeni İş Oluştur</Text>
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
                    {/* Basic Info */}
                    <View style={styles.section}>
                        <CustomInput
                            label="İş Başlığı *"
                            value={formData.title}
                            onChangeText={(text) => setFormData({ ...formData, title: text })}
                            placeholder="Örn: Klima Montajı - A Blok"
                            theme={theme}
                        />

                        <Text style={[styles.label, { color: theme.colors.subText }]}>Müşteri *</Text>
                        <TouchableOpacity
                            style={[styles.selector, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                            onPress={() => setShowCustomerModal(true)}
                        >
                            <Text style={[styles.selectorText, { color: !formData.customerId ? theme.colors.subText : theme.colors.text }]}>
                                {getCustomerLabel()}
                            </Text>
                            <MaterialIcons name="arrow-drop-down" size={24} color={theme.colors.subText} />
                        </TouchableOpacity>

                        <Text style={[styles.label, { color: theme.colors.subText }]}>Atanacak Ekip</Text>
                        <TouchableOpacity
                            style={[styles.selector, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                            onPress={() => setShowTeamModal(true)}
                        >
                            <Text style={[styles.selectorText, { color: !formData.teamId ? theme.colors.subText : theme.colors.text }]}>
                                {getTeamLabel()}
                            </Text>
                            <MaterialIcons name="arrow-drop-down" size={24} color={theme.colors.subText} />
                        </TouchableOpacity>

                        <Text style={[styles.label, { color: theme.colors.subText }]}>Öncelik</Text>
                        <TouchableOpacity
                            style={[styles.selector, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                            onPress={() => setShowPriorityModal(true)}
                        >
                            <Text style={[styles.selectorText, { color: theme.colors.text }]}>{formData.priority}</Text>
                            <MaterialIcons name="arrow-drop-down" size={24} color={theme.colors.subText} />
                        </TouchableOpacity>

                        <View style={styles.row}>
                            <View style={styles.col}>
                                <Text style={[styles.label, { color: theme.colors.subText }]}>Başlangıç Tarihi</Text>
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
                                <Text style={[styles.label, { color: theme.colors.subText }]}>Bitiş Tarihi</Text>
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

                        <CustomInput
                            label="Konum / Adres"
                            value={formData.location}
                            onChangeText={(text) => setFormData({ ...formData, location: text })}
                            placeholder="Montaj yapılacak adres"
                            multiline
                            theme={theme}
                        />

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
                            title="Oluştur"
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
                            <View style={[styles.modalContent, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                                <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
                                    <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Tarih Seç</Text>
                                    <TouchableOpacity onPress={() => {
                                        setShowStartDatePicker(false);
                                        setShowEndDatePicker(false);
                                    }}>
                                        <MaterialIcons name="close" size={24} color={theme.colors.subText} />
                                    </TouchableOpacity>
                                </View>
                                <View style={{ padding: 20 }}>
                                    <input
                                        type="datetime-local"
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
                        theme={theme}
                    />
                )
            )}
        </View>
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
        paddingTop: 20,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
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
        marginBottom: 8,
        marginTop: 12,
    },
    selector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        height: 48,
    },
    selectorText: {
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
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
    },
    dateText: {
        fontSize: 14,
        fontWeight: '600',
    },
    timeText: {
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
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
});
