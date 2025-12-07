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
import jobService from '../../services/job.service';

const CHECKLIST_TEMPLATES = {
    'klima': {
        label: 'Klima Montajı',
        steps: [
            {
                title: 'Dış ünite yer tespiti ve montajı',
                description: 'Duvar veya zemin konsolu ile sabitleme',
                subSteps: [
                    { title: 'Montaj yerinin belirlenmesi' },
                    { title: 'Konsol sabitlenmesi' },
                    { title: 'Ünitenin konsolda dengelenmesi' }
                ]
            },
            {
                title: 'İç ünite yer tespiti ve montajı',
                description: 'Terazi kontrolü ve montaj plakası sabitleme',
                subSteps: [
                    { title: 'Montaj plakası seviye kontrolü' },
                    { title: 'Plakanın duvara sabitlenmesi' },
                    { title: 'İç ünitenin plakaya takılması' }
                ]
            },
            {
                title: 'Bakır boru hattı çekilmesi',
                description: 'İzolasyon ve boru bükümü',
                subSteps: [
                    { title: 'Boru uzunluğunun ölçülmesi' },
                    { title: 'Boruların bükülmesi' },
                    { title: 'İzolasyon montajı' }
                ]
            },
            {
                title: 'Drenaj hattı çekilmesi',
                description: 'Eğim kontrolü ve su testi',
                subSteps: [
                    { title: 'Drenaj borusunun eğim kontrolü' },
                    { title: 'Su testi yapılması' }
                ]
            },
            {
                title: 'Elektrik bağlantılarının yapılması',
                description: 'İç ve dış ünite arası sinyal kablosu',
                subSteps: [
                    { title: 'Kablo çekilmesi' },
                    { title: 'Bağlantıların yapılması' },
                    { title: 'İzolasyon kontrolü' }
                ]
            },
            {
                title: 'Vakumlama işlemi',
                description: 'Sistemdeki nem ve havanın alınması',
                subSteps: [
                    { title: 'Vakum pompası bağlantısı' },
                    { title: '15-20 dk vakum çekilmesi' },
                    { title: 'Basınç kontrolü' }
                ]
            },
            {
                title: 'Gaz açımı ve kaçak kontrolü',
                description: 'Köpük veya dedektör ile kontrol',
                subSteps: [
                    { title: 'Gaz vanalarının açılması' },
                    { title: 'Bağlantılarda kaçak kontrolü' }
                ]
            },
            {
                title: 'Performans testi',
                description: 'Isıtma ve soğutma modlarında test',
                subSteps: [
                    { title: 'Soğutma modu testi' },
                    { title: 'Isıtma modu testi' },
                    { title: 'Basınç değerlerinin kontrolü' }
                ]
            },
            {
                title: 'Müşteri bilgilendirme ve teslim',
                description: 'Kumanda kullanımı ve garanti bilgisi',
                subSteps: [
                    { title: 'Kumanda kullanım eğitimi' },
                    { title: 'Garanti belgelerinin teslimi' },
                    { title: 'Bakım tavsiyelerinin verilmesi' }
                ]
            }
        ]
    },
    'silo': {
        label: 'Silo Montajı',
        steps: [
            {
                title: 'Zemin beton kontrolü',
                description: 'Terazi, mukavemet ve ankraj yerleşimi kontrolü',
                subSteps: [
                    { title: 'Zemin düzlük kontrolü' },
                    { title: 'Beton mukavemet testi' },
                    { title: 'Ankraj noktalarının işaretlenmesi' }
                ]
            },
            {
                title: 'Silo gövde panellerinin montajı',
                description: 'İlk ring montajı ve yükseltme',
                subSteps: [
                    { title: 'İlk ring panellerinin yerleştirilmesi' },
                    { title: 'Dikey seviye kontrolü' },
                    { title: 'Üst ringlerin sırayla montajı' }
                ]
            },
            {
                title: 'Cıvata tork kontrolleri',
                description: 'Tüm birleşim noktalarının torklanması',
                subSteps: [
                    { title: 'Tork değerlerinin belirlenmesi' },
                    { title: 'Cıvataların sıkılması' },
                    { title: 'Kontrol sıkımı' }
                ]
            },
            {
                title: 'Sızdırmazlık kontrolü',
                description: 'Panel birleşim yerlerine mastik uygulaması',
                subSteps: [
                    { title: 'Birleşim yerlerinin temizlenmesi' },
                    { title: 'Mastik uygulaması' }
                ]
            },
            {
                title: 'Çatı panellerinin montajı',
                description: 'Çatı konstrüksiyonu ve kaplama',
                subSteps: [
                    { title: 'Çatı demirlerin montajı' },
                    { title: 'Çatı panellerinin yerleştirilmesi' },
                    { title: 'Su yalıtımı kontrolü' }
                ]
            },
            {
                title: 'Havalandırma bacalarının montajı',
                description: 'Fan ve baca montajı',
                subSteps: [
                    { title: 'Baca deliklerinin açılması' },
                    { title: 'Fan montajı' },
                    { title: 'Elektrik bağlantıları' }
                ]
            },
            {
                title: 'Merdiven ve platform montajı',
                description: 'Güvenlik kafesi ve korkuluklar',
                subSteps: [
                    { title: 'Merdiven montajı' },
                    { title: 'Platform döşenmesi' },
                    { title: 'Güvenlik korkuluklarının takılması' }
                ]
            },
            {
                title: 'Alt konik montajı',
                description: 'Varsa alt konik ve boşaltma ağzı',
                subSteps: [
                    { title: 'Konik panellerinin montajı' },
                    { title: 'Boşaltma kapağı takılması' }
                ]
            },
            {
                title: 'Yükleme/Boşaltma sistemi testi',
                description: 'Helezon ve elevatör kontrolleri',
                subSteps: [
                    { title: 'Helezon dönüş testi' },
                    { title: 'Elevatör çalışma testi' },
                    { title: 'Emniyet sistemleri kontrolü' }
                ]
            }
        ]
    }
};

export default function CreateJobScreen({ navigation }) {
    const [loading, setLoading] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [teams, setTeams] = useState([]);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        customerId: '',
        teamId: '',
        priority: 'MEDIUM',
        location: '',
        scheduledDate: new Date(),
        scheduledEndDate: new Date(new Date().getTime() + 2 * 60 * 60 * 1000), // +2 hours
    });

    // Checklist State
    const [steps, setSteps] = useState([]);

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

    const handleCreate = async () => {
        if (!formData.title || !formData.customerId) {
            Alert.alert('Hata', 'Lütfen başlık ve müşteri seçiniz');
            return;
        }

        setLoading(true);
        try {
            const validSteps = steps.filter(step => step.title.trim() !== '')
                .map(step => ({
                    ...step,
                    subSteps: step.subSteps?.filter(sub => sub.title.trim() !== '')
                }));

            const jobData = {
                ...formData,
                teamId: formData.teamId || undefined, // Send undefined if empty
                location: formData.location || undefined, // Send undefined if empty
                description: formData.description || undefined, // Send undefined if empty
                scheduledDate: formData.scheduledDate.toISOString(),
                scheduledEndDate: formData.scheduledEndDate.toISOString(),
                steps: validSteps.length > 0 ? validSteps : null
            };

            console.log('Sending job data:', JSON.stringify(jobData, null, 2));

            await jobService.create(jobData);
            Alert.alert('Başarılı', 'İş başarıyla oluşturuldu', [
                { text: 'Tamam', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error('Create job error:', error);
            const errorMessage = error.response?.data?.error || error.message || 'İş oluşturulurken bir hata oluştu';
            Alert.alert('Hata', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Checklist Functions
    const addStep = () => {
        setSteps([...steps, { title: '', description: '', subSteps: [] }]);
    };

    const removeStep = (index) => {
        const newSteps = [...steps];
        newSteps.splice(index, 1);
        setSteps(newSteps);
    };

    const updateStep = (index, field, value) => {
        const newSteps = [...steps];
        newSteps[index][field] = value;
        setSteps(newSteps);
    };

    const addSubStep = (stepIndex) => {
        const newSteps = [...steps];
        if (!newSteps[stepIndex].subSteps) newSteps[stepIndex].subSteps = [];
        newSteps[stepIndex].subSteps.push({ title: '' });
        setSteps(newSteps);
    };

    const updateSubStep = (stepIndex, subStepIndex, value) => {
        const newSteps = [...steps];
        newSteps[stepIndex].subSteps[subStepIndex].title = value;
        setSteps(newSteps);
    };

    const removeSubStep = (stepIndex, subStepIndex) => {
        const newSteps = [...steps];
        newSteps[stepIndex].subSteps.splice(subStepIndex, 1);
        setSteps(newSteps);
    };

    const moveStep = (index, direction) => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === steps.length - 1) return;

        const newSteps = [...steps];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
        setSteps(newSteps);
    };

    const loadTemplate = (key) => {
        const template = CHECKLIST_TEMPLATES[key];
        if (template) {
            setSteps(JSON.parse(JSON.stringify(template.steps))); // Deep copy
            setShowTemplateModal(false);
        }
    };

    // Selection Modals
    const renderSelectionModal = (visible, onClose, title, items, onSelect, displayKey = 'name') => (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{title}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <MaterialIcons name="close" size={24} color={COLORS.slate400} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={styles.modalList}>
                        {items.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.modalItem}
                                onPress={() => {
                                    onSelect(item);
                                    onClose();
                                }}
                            >
                                <Text style={styles.modalItemText}>
                                    {displayKey === 'complex_customer'
                                        ? `${item.company || item.companyName} (${item.user?.name || item.contactPerson})`
                                        : item[displayKey] || item}
                                </Text>
                                {displayKey === 'complex_customer' && formData.customerId === item.id && (
                                    <MaterialIcons name="check" size={20} color={COLORS.primary} />
                                )}
                                {displayKey === 'name' && formData.teamId === item.id && (
                                    <MaterialIcons name="check" size={20} color={COLORS.primary} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );

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
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Kontrol Listesi</Text>
                        <View style={styles.sectionActions}>
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => setShowTemplateModal(true)}
                            >
                                <MaterialIcons name="file-copy" size={20} color={COLORS.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={addStep}
                            >
                                <MaterialIcons name="add-circle" size={20} color={COLORS.primary} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {steps.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>Adım eklenmedi</Text>
                        </View>
                    ) : (
                        steps.map((step, index) => (
                            <View key={index} style={styles.stepCard}>
                                <View style={styles.stepHeader}>
                                    <Text style={styles.stepIndex}>{index + 1}.</Text>
                                    <View style={{ flex: 1 }}>
                                        <CustomInput
                                            value={step.title}
                                            onChangeText={(text) => updateStep(index, 'title', text)}
                                            placeholder="Adım başlığı"
                                            style={{ marginBottom: 8 }}
                                        />
                                        <CustomInput
                                            value={step.description}
                                            onChangeText={(text) => updateStep(index, 'description', text)}
                                            placeholder="Açıklama (Opsiyonel)"
                                            multiline
                                        />
                                    </View>
                                    <View style={styles.stepActions}>
                                        <TouchableOpacity
                                            onPress={() => moveStep(index, 'up')}
                                            disabled={index === 0}
                                            style={[styles.iconButton, index === 0 && styles.disabledIcon]}
                                        >
                                            <MaterialIcons name="keyboard-arrow-up" size={20} color={COLORS.slate400} />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => moveStep(index, 'down')}
                                            disabled={index === steps.length - 1}
                                            style={[styles.iconButton, index === steps.length - 1 && styles.disabledIcon]}
                                        >
                                            <MaterialIcons name="keyboard-arrow-down" size={20} color={COLORS.slate400} />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => removeStep(index)}
                                            style={styles.iconButton}
                                        >
                                            <MaterialIcons name="close" size={20} color={COLORS.red500} />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Substeps */}
                                <View style={styles.subStepsContainer}>
                                    {step.subSteps?.map((subStep, subIndex) => (
                                        <View key={subIndex} style={styles.subStepRow}>
                                            <MaterialIcons name="subdirectory-arrow-right" size={16} color={COLORS.slate500} />
                                            <View style={{ flex: 1, marginLeft: 8 }}>
                                                <CustomInput
                                                    value={subStep.title}
                                                    onChangeText={(text) => updateSubStep(index, subIndex, text)}
                                                    placeholder="Alt görev"
                                                    style={{ height: 40 }}
                                                />
                                            </View>
                                            <TouchableOpacity
                                                onPress={() => removeSubStep(index, subIndex)}
                                                style={styles.removeSubButton}
                                            >
                                                <MaterialIcons name="close" size={16} color={COLORS.red500} />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                    <TouchableOpacity
                                        style={styles.addSubStepButton}
                                        onPress={() => addSubStep(index)}
                                    >
                                        <MaterialIcons name="add" size={16} color={COLORS.blue500} />
                                        <Text style={styles.addSubStepText}>Alt Görev Ekle</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    )}
                </View>

                <View style={styles.footer}>
                    <CustomButton
                        title="İptal"
                        variant="outline"
                        onPress={() => navigation.goBack()}
                        style={{ flex: 1, marginRight: 8 }}
                    />
                    <CustomButton
                        title="Oluştur"
                        onPress={handleCreate}
                        loading={loading}
                        style={{ flex: 1 }}
                    />
                </View>
                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Modals */}
            {renderSelectionModal(
                showCustomerModal,
                () => setShowCustomerModal(false),
                'Müşteri Seç',
                customers,
                (item) => setFormData({ ...formData, customerId: item.id }),
                'complex_customer'
            )}

            {renderSelectionModal(
                showTeamModal,
                () => setShowTeamModal(false),
                'Ekip Seç',
                teams,
                (item) => setFormData({ ...formData, teamId: item.id }),
                'name'
            )}

            {renderSelectionModal(
                showPriorityModal,
                () => setShowPriorityModal(false),
                'Öncelik Seç',
                ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
                (item) => setFormData({ ...formData, priority: item }),
                null
            )}

            {renderSelectionModal(
                showTemplateModal,
                () => setShowTemplateModal(false),
                'Şablon Seç',
                Object.keys(CHECKLIST_TEMPLATES).map(key => ({ key, ...CHECKLIST_TEMPLATES[key] })),
                (item) => loadTemplate(item.key),
                'label'
            )}

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
                                    {/* Web Date Input */}
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
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    sectionActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        padding: 8,
        backgroundColor: COLORS.cardDark,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.slate800,
    },
    emptyState: {
        padding: 20,
        backgroundColor: COLORS.cardDark,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.slate800,
        borderStyle: 'dashed',
    },
    emptyText: {
        color: COLORS.slate500,
    },
    stepCard: {
        backgroundColor: COLORS.cardDark,
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.slate800,
    },
    stepHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    stepIndex: {
        color: COLORS.slate400,
        marginRight: 8,
        marginTop: 12,
        fontWeight: 'bold',
    },
    stepActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        padding: 4,
        marginLeft: 4,
    },
    disabledIcon: {
        opacity: 0.3,
    },
    subStepsContainer: {
        marginTop: 12,
        paddingLeft: 24,
        borderLeftWidth: 1,
        borderLeftColor: COLORS.slate800,
    },
    subStepRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    removeSubButton: {
        padding: 4,
    },
    addSubStepButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        marginTop: 4,
    },
    addSubStepText: {
        color: COLORS.blue500,
        fontSize: 12,
        marginLeft: 4,
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        marginTop: 24,
    },
    // Modal Styles
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
    modalList: {
        padding: 16,
    },
    modalItem: {
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.slate800,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    modalItemText: {
        color: COLORS.textLight,
        fontSize: 16,
    },
});
