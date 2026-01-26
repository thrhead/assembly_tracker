'use client'

import React, { useState, useEffect, use } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Linking,
    Platform,
    Modal,
    Image,
    TextInput,
    StatusBar,
    KeyboardAvoidingView,
    TouchableWithoutFeedback,
    Keyboard,
    FlatList,
    Share
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import jobService from '../../services/job.service';
import costService from '../../services/cost.service';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getValidImageUrl } from '../../utils';
import JobInfoCard from '../../components/job-detail/JobInfoCard';
import CostSection from '../../components/job-detail/CostSection';
import VoiceRecorder from '../../components/common/VoiceRecorder';
import SuccessModal from '../../components/SuccessModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import { WebInput } from '../../components/common/WebInput';
import GlassCard from '../../components/ui/GlassCard';
import SignaturePad from '../../components/SignaturePad';
import { COLORS } from '../../constants/theme';
import { SocketProvider } from '../../context/SocketContext';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../../config';

const AppModal = ({ visible, children, ...props }) => {
    if (Platform.OS === 'web') {
        if (!visible) return null;
        return (
            <View style={[StyleSheet.absoluteFill, { zIndex: 9999 }]}>
                {children}
            </View>
        );
    }
    return (
        <Modal visible={visible} {...props}>
            {children}
        </Modal>
    );
};

const PageWrapper = ({ children }) => {
    return (
        <View style={{ flex: 1 }}>
            {children}
        </View>
    );
};

export default function JobDetailScreen({ route, navigation }) {
    const { jobId } = route.params;
    const { user } = useAuth();
    const { theme, isDark } = useTheme();
    const { t, i18n } = useTranslation();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [successModalVisible, setSuccessModalVisible] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [confirmationModalVisible, setConfirmationModalVisible] = useState(false);
    const [signatureModalVisible, setSignatureModalVisible] = useState(false);

    // Cost State
    const [costModalVisible, setCostModalVisible] = useState(false);
    const [receiptImage, setReceiptImage] = useState(null);
    const [costAmount, setCostAmount] = useState('');
    const [costCategory, setCostCategory] = useState('Yemek');
    const [costDescription, setCostDescription] = useState('');
    const [costDate, setCostDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [submittingCost, setSubmittingCost] = useState(false);

    // Rejection State
    const [rejectionModalVisible, setRejectionModalVisible] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [selectedStepId, setSelectedStepId] = useState(null);
    const [selectedSubstepId, setSelectedSubstepId] = useState(null);

    const COST_CATEGORIES = ['Yemek', 'Yol', 'Yakıt', 'Konaklama', 'Malzeme', 'Diğer'];

    const formatDate = (dateString) => {
        if (!dateString) return null;
        return new Date(dateString).toLocaleString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    useEffect(() => {
        loadJobDetails();
    }, [jobId]);

    const openImageModal = (image) => {
        setSelectedImage(image);
        setModalVisible(true);
    };

    const handleDeletePhoto = (photo) => {
        Alert.alert(
            t('common.delete'),
            t('common.confirmDelete'), // Make sure this key exists or use readable text
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.delete'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await jobService.deletePhoto(jobId, photo.stepId, photo.id);
                            setModalVisible(false);
                            setSuccessMessage(t('common.success'));
                            setSuccessModalVisible(true);
                            loadJobDetails();
                        } catch (error) {
                            console.error('Error deleting photo:', error);
                            Alert.alert(t('common.error'), "Fotoğraf silinemedi.");
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const renderPhotoItem = React.useCallback(({ item }) => (
        <TouchableOpacity onPress={() => openImageModal(item)}>
            <Image source={{ uri: getValidImageUrl(item.url || item) }} style={styles.thumbnail} />
        </TouchableOpacity>
    ), [theme]);

    const loadJobDetails = async () => {
        try {
            setLoading(true);
            const data = await jobService.getJobById(jobId);

            if (data.id) {
                setJob(data);
            } else if (data.job) {
                setJob(data.job);
            } else {
                Alert.alert(t('common.error'), t('alerts.jobNotFound'));
                navigation.goBack();
            }
        } catch (error) {
            console.error('Error loading job details:', error);
            Alert.alert(t('common.error'), t('alerts.detailsLoadError'));
        } finally {
            setLoading(false);
        }
    };

    const handleSubstepToggle = async (stepId, substepId, currentStatus) => {
        try {
            // Eğer tamamlanmaya çalışılıyorsa (yani şu an tamamlanmamışsa) ZORUNLU fotoğraf kontrolü yap
            if (!currentStatus) {
                const step = job.steps.find(s => s.id === stepId);
                const substep = step?.subSteps.find(ss => ss.id === substepId);


                console.log('[Mobile] Checking photos for substep:', {
                    substepId,
                    hasPhotosArray: !!substep?.photos,
                    photoCount: substep?.photos?.length
                });


                const hasPhotos = substep?.photos && Array.isArray(substep.photos) && substep.photos.length > 0;

                console.log('[Mobile] Substup Toggle Check:', {
                    substepId,
                    hasPhotos,
                    photosRaw: substep?.photos,
                    photoCount: substep?.photos?.length
                });

                if (!hasPhotos) {
                    Alert.alert(
                        t('common.warning'),
                        "Bu alt iş emrini tamamlamak için ÖNCE fotoğraf yüklemelisiniz. Lütfen yandaki kamera ikonuna tıklayarak fotoğraf ekleyin."
                    );
                    return;
                }
            }

            const isCompleted = !currentStatus;
            await jobService.toggleSubstep(jobId, stepId, substepId, isCompleted);
            loadJobDetails();
        } catch (error) {
            console.error('[MOBILE] Error toggling substep:', error);
            Alert.alert(t('common.error'), t('alerts.processError'));
        }
    };

    const handleToggleStep = async (stepId, currentStatus) => {
        try {
            // Eğer tamamlanmaya çalışılıyorsa (yani şu an tamamlanmamışsa) fotoğraf kontrolü yap
            if (!currentStatus) {
                const step = job.steps.find(s => s.id === stepId);


                // Kullanıcı isteği üzerine ana adım başlığında fotoğraf yükleme kaldırıldı.
                // Artık sadece alt iş emirlerinde (sub-steps) fotoğraf zorunlu.
                // Dolayısıyla ana adımı tamamlarken doğrudan fotoğraf kontrolü yapmıyoruz,
                // çünkü alt adımlar tamamlanmadan ana adım tamamlanamıyor ve alt adımlar kendi fotoğrafını zorunlu kılıyor.

                /* 
                // ESKİ KOD:
                if (step && (!step.photos || step.photos.length === 0)) {
                    Alert.alert(
                        t('common.warning'), 
                        "Bu adımı tamamlamak için en az bir fotoğraf eklemelisiniz."
                    );
                    return;
                }
                */
            }

            const isCompleted = !currentStatus;
            await jobService.toggleStep(jobId, stepId, isCompleted);
            loadJobDetails();
        } catch (error) {
            console.error('[MOBILE] Error toggling step:', error);
            Alert.alert(t('common.error'), t('alerts.processError'));
        }
    };

    const pickImage = async (stepId, substepId, source) => {
        try {

            // Safe access to MediaType enum (supports both v16+ and older versions)
            const mediaTypes = ImagePicker.MediaType
                ? ImagePicker.MediaType.Images
                : (ImagePicker.MediaTypeOptions ? ImagePicker.MediaTypeOptions.Images : 'Images');

            let result;
            if (source === 'camera') {
                const { status } = await ImagePicker.requestCameraPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert(t('alerts.permissionRequired'), t('alerts.cameraPermissionDesc'));
                    return;
                }
                result = await ImagePicker.launchCameraAsync({
                    mediaTypes: mediaTypes,
                    allowsEditing: true,
                    aspect: [4, 3],
                    quality: 0.3,
                    base64: true, // Request Base64
                });
            } else {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert(t('alerts.permissionRequired'), t('alerts.galleryPermissionDesc'));
                    return;
                }
                result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: mediaTypes,
                    allowsEditing: true,
                    aspect: [4, 3],
                    quality: 0.3,
                    base64: true, // Request Base64
                });
            }

            if (!result.canceled) {
                const uri = result.assets[0].uri;
                const base64 = result.assets[0].base64;
                uploadPhoto(stepId, substepId, uri, base64);
            }
        } catch (error) {
            console.error("ImagePicker error:", error);
            Alert.alert(t('common.error'), t('alerts.photoSelectError'));
        }
    };

    const uploadPhoto = async (stepId, substepId, uri, base64) => {
        try {
            setUploading(true);
            const formData = new FormData();
            const filename = uri.split('/').pop();
            const match = /\.(\w+)$/.exec(filename);
            let type = match ? `image/${match[1]}` : `image/jpeg`;

            // Fix common mime type issues
            if (type === 'image/jpg') type = 'image/jpeg';

            formData.append('photo', { uri, name: filename, type });

            await jobService.uploadPhotos(jobId, stepId, formData, substepId, base64);

            setSuccessMessage(t('alerts.photoUploadSuccess'));
            setSuccessModalVisible(true);

            console.log('[Mobile] Photo Upload Success. Refreshing job details...');
            await loadJobDetails(); // Wait for reload
            console.log('[Mobile] Job details refreshed.');
        } catch (error) {
            console.error('Error uploading photo:', error);
            Alert.alert(t('common.error'), t('alerts.photoUploadError'));
        } finally {
            setUploading(false);
        }
    };

    const uploadAudio = async (stepId, substepId, uri) => {
        try {
            setUploading(true);
            const formData = new FormData();
            const filename = uri.split('/').pop();
            const type = 'audio/m4a';

            formData.append('audio', { uri, name: filename, type });

            await jobService.uploadAudio(jobId, stepId, formData, substepId);

            setSuccessMessage(t('alerts.audioUploadSuccess'));
            setSuccessModalVisible(true);
            loadJobDetails();
        } catch (error) {
            console.error('Error uploading audio:', error);
            Alert.alert(t('common.error'), t('alerts.audioUploadError'));
        } finally {
            setUploading(false);
        }
    };

    const handleApproveStep = async (stepId) => {
        try {
            setLoading(true);
            await jobService.approveStep(stepId);
            Alert.alert(t('common.success'), t('alerts.stepApproveSuccess'));
            loadJobDetails();
        } catch (error) {
            console.error('Error approving step:', error);
            Alert.alert(t('common.error'), t('alerts.stepApproveError'));
        } finally {
            setLoading(false);
        }
    };

    const handleRejectStep = async () => {
        if (!rejectionReason) {
            Alert.alert(t('common.warning'), t('alerts.rejectionReasonRequired'));
            return;
        }

        try {
            setLoading(true);
            await jobService.rejectStep(selectedStepId, rejectionReason);
            Alert.alert(t('common.success'), t('alerts.stepRejectSuccess'));
            setRejectionModalVisible(false);
            setRejectionReason('');
            setSelectedStepId(null);
            loadJobDetails();
        } catch (error) {
            console.error('Error rejecting step:', error);
            Alert.alert(t('common.error'), t('alerts.stepRejectError'));
        } finally {
            setLoading(false);
        }
    };

    const handleApproveSubstep = async (substepId) => {
        try {
            setLoading(true);
            await jobService.approveSubstep(substepId);
            Alert.alert(t('common.success'), t('alerts.stepApproveSuccess'));
            loadJobDetails();
        } catch (error) {
            console.error('Error approving substep:', error);
            Alert.alert(t('common.error'), t('alerts.stepApproveError'));
        } finally {
            setLoading(false);
        }
    };

    const handleRejectSubstep = async () => {
        if (!rejectionReason) {
            Alert.alert(t('common.warning'), t('alerts.rejectionReasonRequired'));
            return;
        }

        try {
            setLoading(true);
            await jobService.rejectSubstep(selectedSubstepId, rejectionReason);
            Alert.alert(t('common.success'), t('alerts.stepRejectSuccess'));
            setRejectionModalVisible(false);
            setRejectionReason('');
            setSelectedSubstepId(null);
            loadJobDetails();
        } catch (error) {
            console.error('Error rejecting substep:', error);
            Alert.alert(t('common.error'), t('alerts.stepRejectError'));
        } finally {
            setLoading(false);
        }
    };

    const handleRejectJob = async () => {
        if (!rejectionReason) {
            Alert.alert(t('common.warning'), t('alerts.rejectionReasonRequired'));
            return;
        }

        try {
            setLoading(true);
            await jobService.rejectJob(jobId, rejectionReason);
            Alert.alert(t('common.success'), t('alerts.stepRejectSuccess'));
            setRejectionModalVisible(false);
            setRejectionReason('');
            loadJobDetails();
        } catch (error) {
            console.error('Error rejecting job:', error);
            Alert.alert(t('common.error'), t('alerts.stepRejectError'));
        } finally {
            setLoading(false);
        }
    };

    const openRejectionModal = (stepId) => {
        setSelectedStepId(stepId);
        setRejectionModalVisible(true);
    };

    const openSubstepRejectionModal = (substepId) => {
        setSelectedSubstepId(substepId);
        setRejectionModalVisible(true);
    };

    const handleStartJob = async () => {
        try {
            setLoading(true);
            await jobService.startJob(jobId);
            Alert.alert(t('common.success'), t('alerts.jobStartSuccess'));
            loadJobDetails();
        } catch (error) {
            console.error('Error starting job:', error);
            Alert.alert(t('common.error'), t('alerts.jobStartError'));
        } finally {
            setLoading(false);
        }
    };

    const handleStartStep = async (stepId) => {
        try {
            setLoading(true);
            await jobService.startStep(jobId, stepId);
            loadJobDetails();
        } catch (error) {
            console.error('Error starting step:', error);
            Alert.alert(t('common.error'), t('alerts.processError'));
        } finally {
            setLoading(false);
        }
    };

    const handleStartSubstep = async (stepId, substepId) => {
        try {
            setLoading(true);
            await jobService.startSubstep(jobId, stepId, substepId);
            loadJobDetails();
        } catch (error) {
            console.error('Error starting substep:', error);
            Alert.alert(t('common.error'), t('alerts.processError'));
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptJob = async () => {
        Alert.alert(
            t('common.confirm'),
            t('alerts.completeJobConfirm'),
            [
                { text: t('common.cancel'), style: "cancel" },
                {
                    text: t('common.confirm'),
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await jobService.acceptJob(jobId);
                            Alert.alert(t('common.success'), t('alerts.stepApproveSuccess'));
                            loadJobDetails();
                        } catch (error) {
                            console.error('Error accepting job:', error);
                            Alert.alert(t('common.error'), t('alerts.processError'));
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const handleCreateCost = async () => {
        try {
            setSubmittingCost(true);

            let data;

            if (receiptImage) {
                data = new FormData();
                data.append('jobId', job.id);
                data.append('amount', costAmount);
                data.append('category', costCategory);
                data.append('description', costDescription);
                data.append('date', costDate.toISOString());
                data.append('currency', 'TRY');

                const filename = receiptImage.split('/').pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image`;

                if (Platform.OS === 'web') {
                    const response = await fetch(receiptImage);
                    const blob = await response.blob();
                    data.append('receipt', blob, filename);
                } else {
                    data.append('receipt', { uri: receiptImage, name: filename, type });
                }
            } else {
                data = {
                    jobId: job.id,
                    amount: parseFloat(costAmount),
                    category: costCategory,
                    description: costDescription,
                    date: costDate.toISOString(),
                    currency: 'TRY'
                };
            }

            await costService.create(data);

            setSuccessMessage(t('common.success'));
            setSuccessModalVisible(true);
            setCostModalVisible(false);
            setCostAmount('');
            setCostDescription('');
            setCostCategory('Yemek');
            setCostDate(new Date());
            setReceiptImage(null);
            loadJobDetails();
        } catch (error) {
            console.error('Error creating cost:', error);
            Alert.alert(t('common.error'), t('alerts.processError'));
        } finally {
            setSubmittingCost(false);
        }
    };

    const [completing, setCompleting] = useState(false);

    const handleCompleteJob = async () => {
        console.log('[Mobile] handleCompleteJob triggered');
        
        if (!job || !job.steps) {
            console.error('[Mobile] Job or steps missing:', job);
            return;
        }

        const allStepsCompleted = job.steps.length === 0 || job.steps.every(step => step.isCompleted);
        console.log('[Mobile] All steps completed:', allStepsCompleted);

        if (!allStepsCompleted) {
            Alert.alert(t('common.warning'), t('alerts.photoRequired') || "Lütfen tüm adımları tamamlayın.");
            return;
        }

        // Make signature optional
        console.log('[Mobile] Showing optional signature alert');
        Alert.alert(
            t('common.confirm'),
            "İşi bitirmek üzeresiniz. Müşteri imzası almak ister misiniz?",
            [
                {
                    text: "İmzasız Bitir",
                    onPress: () => {
                        console.log('[Mobile] Selected: Finish without signature');
                        setJob(prev => ({ ...prev, signature: null, signatureCoords: null }));
                        setConfirmationModalVisible(true);
                    }
                },
                {
                    text: "İmza Al",
                    onPress: () => {
                        console.log('[Mobile] Selected: Take signature');
                        setSignatureModalVisible(true);
                    }
                },
                {
                    text: t('common.cancel'),
                    style: "cancel"
                }
            ]
        );
    };

    const handleConfirmComplete = async () => {
        try {
            setCompleting(true);
            setConfirmationModalVisible(false);

            await jobService.completeJob(
                jobId,
                job.signature || null,
                job.signatureCoords || null
            );

            setSuccessMessage("İş başarıyla bitirildi ve admin onayına gönderildi.");
            setSuccessModalVisible(true);
            loadJobDetails();
        } catch (error) {
            console.error('Error completing job:', error);
            Alert.alert(t('common.error'), "İş tamamlanırken bir hata oluştu.");
        } finally {
            setCompleting(false);
        }
    };

    const handleSaveSignature = async (signatureBase64) => {
        setSignatureModalVisible(false);
        setConfirmationModalVisible(true);

        let location = null;
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                const currentPosition = await Location.getCurrentPositionAsync({});
                location = {
                    latitude: currentPosition.coords.latitude,
                    longitude: currentPosition.coords.longitude
                };
            }
        } catch (error) {
            console.error('Error getting location for signature:', error);
        }

        // Store signature and coordinates to be sent with completion
        setJob(prev => ({
            ...prev,
            signature: signatureBase64,
            signatureCoords: location
        }));
    };

    const handleExportProforma = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('userToken'); // Assuming user is logged in
            const response = await axios.get(`${API_URL}/api/v1/jobs/${jobId}/proforma`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = response.data;
            const itemsText = data.items.map(i => `- ${i.description}: ₺${i.price}`).join('\n');
            const total = data.items.reduce((sum, i) => sum + i.price, 0);

            const shareMessage = `
PROFORMA FATURA (#${data.id.slice(-6).toUpperCase()})
--------------------------------
Müşteri: ${data.customer.company}
İş: ${data.title}
Tarih: ${new Date().toLocaleDateString('tr-TR')}

HİZMETLER:
${itemsText}

GENEL TOPLAM: ₺${(total * 1.2).toLocaleString('tr-TR')} (KDV Dahil)
--------------------------------
Assembly Tracker Ltd. Şti.
            `;

            await Share.share({
                message: shareMessage,
                title: 'Proforma Fatura'
            });
        } catch (error) {
            console.error('Proforma export error:', error);
            Alert.alert(t('common.error'), 'Dosya paylaşılamadı.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (!job) {
        return (
            <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
                <Text style={{ color: theme.colors.text }}>{t('alerts.jobNotFound')}</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} />
            <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={24} color={theme.colors.primary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{t('worker.jobDetails')}</Text>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                    {['ADMIN', 'MANAGER'].includes(user?.role?.toUpperCase()) && (
                        <TouchableOpacity onPress={handleExportProforma} style={styles.chatButton}>
                            <MaterialIcons name="description" size={24} color={theme.colors.primary} />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Chat', { jobId: job.id, jobTitle: job.title })}
                        style={styles.chatButton}
                    >
                        <MaterialIcons name="chat" size={24} color={theme.colors.primary} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={{ flex: 1, minHeight: 0 }}>
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={[styles.contentContainer, { flexGrow: 1 }]}
                >
                    <JobInfoCard job={job} />

                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('navigation.teams')}</Text>
                    {job.assignments && job.assignments.length > 0 ? (
                        job.assignments.map((assignment, index) => (
                            <GlassCard key={index} style={styles.card} theme={theme}>
                                <View style={styles.infoRow}>
                                    <MaterialIcons name="group" size={20} color={theme.colors.primary} />
                                    <View style={{ marginLeft: 8 }}>
                                        {assignment.team ? (
                                            <>
                                                <Text style={[styles.infoText, { fontWeight: 'bold', color: theme.colors.text }]}>{assignment.team.name}</Text>
                                                {assignment.team.members && assignment.team.members.length > 0 && (
                                                    <Text style={[styles.infoText, { fontSize: 12, color: theme.colors.subText, marginTop: 4 }]}>
                                                        {assignment.team.members.map(m => m.user?.name).filter(Boolean).join(', ')}
                                                    </Text>
                                                )}
                                            </>
                                        ) : (
                                            <Text style={[styles.infoText, { color: theme.colors.text }]}>{assignment.worker?.name}</Text>
                                        )}
                                    </View>
                                </View>
                            </GlassCard>
                        ))
                    ) : (
                        <GlassCard style={styles.card} theme={theme}>
                            <Text style={[styles.infoText, { color: theme.colors.subText }]}>{t('recentJobs.noJobs')}</Text>
                        </GlassCard>
                    )}

                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('worker.steps')}</Text>
                    {job.steps && job.steps.map((step, index) => {
                        const isLocked = index > 0 && !job.steps[index - 1].isCompleted;

                        return (
                            <GlassCard key={step.id} style={[styles.stepCard, isLocked && styles.lockedCard]} theme={theme}>
                                <View style={styles.stepHeader}>
                                    <TouchableOpacity
                                        style={[styles.checkbox, step.isCompleted && styles.checkedBox]}
                                        onPress={() => handleToggleStep(step.id, step.isCompleted)}
                                        disabled={isLocked}
                                    >
                                        {step.isCompleted && <MaterialIcons name="check" size={16} color="#FFFFFF" />}
                                    </TouchableOpacity>
                                    <View style={{ flex: 1 }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Text style={[styles.stepTitle, step.isCompleted && styles.completedText, { color: theme.colors.text }]}>
                                                {step.title || step.name}
                                            </Text>
                                        </View>
                                        {step.startedAt && (
                                            <Text style={[styles.dateText, { color: theme.colors.subText }]}>
                                                {t('worker.started')}: {formatDate(step.startedAt)}
                                            </Text>
                                        )}
                                        {step.completedAt && (
                                            <View>
                                                <Text style={[styles.dateText, { color: theme.colors.subText }]}>
                                                    {t('worker.finished')}: {formatDate(step.completedAt)}
                                                </Text>
                                                {(step.latitude && step.longitude) && (
                                                    <View style={styles.metadataTag}>
                                                        <MaterialIcons name="location-pin" size={12} color={theme.colors.subText} />
                                                        <Text style={[styles.metadataText, { color: theme.colors.subText }]}>
                                                            {step.latitude.toFixed(4)}, {step.longitude.toFixed(4)}
                                                        </Text>
                                                    </View>
                                                )}
                                            </View>
                                        )}

                                        {step.photos && step.photos.length > 0 && (
                                            <FlatList
                                                data={step.photos}
                                                renderItem={renderPhotoItem}
                                                keyExtractor={(p, i) => i.toString()}
                                                horizontal
                                                showsHorizontalScrollIndicator={false}
                                                style={{ marginTop: 8 }}
                                            />
                                        )}
                                    </View>
                                </View>

                                {step.approvalStatus === 'REJECTED' && step.rejectionReason && (
                                    <Text style={[styles.rejectionReasonText, { color: theme.colors.error }]}>{t('worker.rejectionReason')}: {step.rejectionReason}</Text>
                                )}

                                {!isLocked && step.subSteps && (
                                    <View style={styles.substepsContainer}>
                                        {step.subSteps.map((substep, subIndex) => {
                                            const isSubstepLocked = subIndex > 0 && !step.subSteps[subIndex - 1].isCompleted;
                                            return (
                                                <GlassCard key={substep.id} style={[styles.substepWrapper, isSubstepLocked && styles.lockedCard]} theme={theme}>
                                                    <View style={styles.substepRow}>
                                                        <TouchableOpacity
                                                            style={[styles.checkbox, { width: 20, height: 20 }, substep.isCompleted && styles.checkedBox]}
                                                            onPress={() => handleSubstepToggle(step.id, substep.id, substep.isCompleted)}
                                                            disabled={isSubstepLocked}
                                                        >
                                                            {substep.isCompleted && <MaterialIcons name="check" size={14} color="#FFFFFF" />}
                                                        </TouchableOpacity>
                                                        <View style={styles.substepInfo}>
                                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <Text style={[styles.substepTitle, substep.isCompleted && styles.completedText, { color: theme.colors.text, flex: 1 }]}>
                                                                    {substep.title}
                                                                </Text>

                                                                {/* Alt adım için fotoğraf yükleme butonu */}
                                                                {!isSubstepLocked && !substep.isCompleted && (
                                                                    <TouchableOpacity
                                                                        onPress={() => pickImage(step.id, substep.id, 'camera')}
                                                                        style={[styles.actionButton, { padding: 4, marginLeft: 8 }]}
                                                                    >
                                                                        <MaterialIcons name="add-a-photo" size={18} color={theme.colors.primary} />
                                                                    </TouchableOpacity>
                                                                )}
                                                            </View>
                                                            <Text style={[styles.substepText, substep.isCompleted && styles.completedText, { color: theme.colors.text }]}>
                                                                {substep.title || substep.name}
                                                            </Text>
                                                        </View>
                                                        {substep.photos && substep.photos.length > 0 && (
                                                            <FlatList
                                                                data={substep.photos}
                                                                renderItem={renderPhotoItem}
                                                                keyExtractor={(p, i) => i.toString()}
                                                                horizontal
                                                                showsHorizontalScrollIndicator={false}
                                                            />
                                                        )}
                                                    </View>
                                                </GlassCard>
                                            );
                                        })}
                                    </View>
                                )}
                            </GlassCard>
                        );
                    })}

                    {job.signatureUrl && (
                        <GlassCard style={styles.card} theme={theme}>
                            <Text style={[styles.sectionTitle, { color: theme.colors.text, marginTop: 0 }]}>{t('common.confirm')}</Text>
                            <View style={styles.signatureDisplayContainer}>
                                <Image
                                    source={{ uri: job.signatureUrl }}
                                    style={styles.signatureImage}
                                    resizeMode="contain"
                                />
                            </View>
                            <View style={styles.signatureMeta}>
                                <View style={styles.metaRow}>
                                    <MaterialIcons name="access-time" size={14} color={theme.colors.subText} />
                                    <Text style={[styles.metaText, { color: theme.colors.subText }]}>
                                        {job.completedDate ? formatDate(job.completedDate) : formatDate(new Date())}
                                    </Text>
                                </View>
                                {(job.signatureLatitude && job.signatureLongitude) && (
                                    <View style={styles.metaRow}>
                                        <MaterialIcons name="location-on" size={14} color={theme.colors.subText} />
                                        <Text style={[styles.metaText, { color: theme.colors.subText }]}>
                                            {job.signatureLatitude.toFixed(6)}, {job.signatureLongitude.toFixed(6)}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </GlassCard>
                    )}

                    <View style={{ height: 100 }} />
                </ScrollView>
            </View>

            <View style={[styles.footerContainer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
                {!['ADMIN', 'MANAGER'].includes(user?.role?.toUpperCase()) ? (
                    job.status === 'PENDING' ? (
                        <TouchableOpacity
                            style={[styles.mainCompleteButton, { backgroundColor: theme.colors.primary }]}
                            onPress={handleStartJob}
                        >
                            <Text style={[styles.mainCompleteButtonText, { color: theme.colors.textInverse }]}>{t('worker.startJob')}</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={[
                                styles.mainCompleteButton, 
                                (job.status === 'COMPLETED' || job.status === 'PENDING_APPROVAL' || completing) && styles.disabledButton, 
                                { backgroundColor: (job.status === 'COMPLETED' || job.status === 'PENDING_APPROVAL' || completing) ? theme.colors.border : theme.colors.primary }
                            ]}
                            onPress={handleCompleteJob}
                            disabled={job.status === 'COMPLETED' || job.status === 'PENDING_APPROVAL' || completing}
                        >
                            {completing ? (
                                <ActivityIndicator color={theme.colors.textInverse} />
                            ) : (
                                <Text style={[styles.mainCompleteButtonText, { color: theme.colors.textInverse }]}>
                                    {job.status === 'COMPLETED' ? t('common.success') : 
                                     job.status === 'PENDING_APPROVAL' ? "Onay Bekliyor" : 
                                     t('worker.completeJob')}
                                </Text>
                            )}
                        </TouchableOpacity>
                    )
                ) : (
                    <View style={{ width: '100%' }}>
                        <View style={[styles.acceptanceStatusContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                            <Text style={[styles.acceptanceStatusLabel, { color: theme.colors.text }]}>{t('common.status')}:</Text>
                            <Text style={[
                                styles.acceptanceStatusValue,
                                job.acceptanceStatus === 'ACCEPTED' ? { color: theme.colors.success } :
                                    job.acceptanceStatus === 'REJECTED' ? { color: theme.colors.error } : { color: theme.colors.warning }
                            ]}>
                                {job.acceptanceStatus === 'ACCEPTED' ? t('common.confirm') :
                                    job.acceptanceStatus === 'REJECTED' ? t('common.error') : t('common.loading')}
                            </Text>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                            <TouchableOpacity
                                style={[styles.mainCompleteButton, styles.rejectButton, { flex: 1, padding: 12, backgroundColor: theme.colors.error }]}
                                onPress={() => setRejectionModalVisible(true)}
                            >
                                <Text style={[styles.mainCompleteButtonText, { color: theme.colors.textInverse }]}>{t('common.delete')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.mainCompleteButton, styles.acceptJobButton, { flex: 1, padding: 12, backgroundColor: theme.colors.success }]}
                                onPress={handleAcceptJob}
                            >
                                <Text style={[styles.mainCompleteButtonText, { color: theme.colors.textInverse }]}>{t('common.confirm')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>

            <AppModal visible={modalVisible} transparent={true} onRequestClose={() => setModalVisible(false)}>
                <View style={[styles.modalContainer, { backgroundColor: 'black' }]}>
                    <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                        <MaterialIcons name="close" size={30} color="#fff" />
                    </TouchableOpacity>

                    {selectedImage && (
                        <Image
                            source={{ uri: getValidImageUrl(selectedImage.url || selectedImage) }}
                            style={{ width: '100%', height: '80%' }}
                            resizeMode="contain"
                        />
                    )}

                    <View style={styles.modalButtons}>
                        {selectedImage?.id && (
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: theme.colors.error, marginTop: 20, flexDirection: 'row', justifyContent: 'center' }]}
                                onPress={() => handleDeletePhoto(selectedImage)}
                            >
                                <MaterialIcons name="delete" size={24} color="#fff" />
                                <Text style={{ color: '#fff', marginLeft: 8, fontWeight: 'bold' }}>{t('common.delete')}</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </AppModal>

            <AppModal visible={rejectionModalVisible} transparent={true} animationType="slide" onRequestClose={() => setRejectionModalVisible(false)}>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalContainer}>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={[styles.formCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{t('common.delete')}</Text>
                            <Text style={[styles.inputLabel, { color: theme.colors.subText }]}>{t('worker.rejectionReason')}</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
                                value={rejectionReason}
                                onChangeText={setRejectionReason}
                                multiline
                                numberOfLines={3}
                                placeholder={t('alerts.rejectionReasonRequired')}
                                placeholderTextColor={theme.colors.subText}
                            />
                            <View style={styles.modalButtons}>
                                <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setRejectionModalVisible(false)}>
                                    <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.modalButton, styles.submitButton, { backgroundColor: theme.colors.error }]} onPress={handleRejectJob}>
                                    <Text style={[styles.submitButtonText, { color: theme.colors.textInverse }]}>{t('common.delete')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </AppModal>

            <SuccessModal visible={successModalVisible} message={successMessage} onClose={() => setSuccessModalVisible(false)} />

            <ConfirmationModal
                visible={confirmationModalVisible}
                title="İşi Bitir"
                message="Tüm adımların tamamlandığını ve işin bittiğini onaylıyor musunuz? Bu işlem geri alınamaz."
                onConfirm={handleConfirmComplete}
                onCancel={() => setConfirmationModalVisible(false)}
                confirmText="Evet, Bitir"
                cancelText="Vazgeç"
                theme={theme}
            />

            <SignaturePad
                visible={signatureModalVisible}
                theme={theme}
                onSave={handleSaveSignature}
                onCancel={() => setSignatureModalVisible(false)}
            />
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1 },
    headerTitle: { fontSize: 20, fontWeight: 'bold' },
    chatButton: { padding: 4 },
    contentContainer: { padding: 16 },
    card: { borderRadius: 12, padding: 16, marginBottom: 16 },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    infoText: { marginLeft: 8, fontSize: 14 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, marginTop: 8 },
    stepCard: { borderRadius: 12, padding: 16, marginBottom: 16 },
    lockedCard: { opacity: 0.5 },
    stepHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: COLORS.primary, marginRight: 12, justifyContent: 'center', alignItems: 'center' },
    checkedBox: { backgroundColor: COLORS.primary },
    stepTitle: { fontSize: 16, fontWeight: '600' },
    completedText: { color: COLORS.primary },
    substepsContainer: { marginTop: 12, paddingLeft: 12, borderLeftWidth: 1, borderLeftColor: COLORS.cardBorder },
    substepWrapper: { marginBottom: 16 },
    substepRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    substepInfo: { flex: 1 },
    substepText: { fontSize: 15, marginBottom: 4 },
    footerContainer: { padding: 16, paddingBottom: Platform.OS === 'ios' ? 32 : 16, borderTopWidth: 1 },
    mainCompleteButton: { height: 54, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    mainCompleteButtonText: { fontSize: 16, fontWeight: 'bold' },
    modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    formCard: { borderRadius: 16, padding: 20, borderWidth: 1 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    inputLabel: { marginBottom: 8, fontSize: 14 },
    input: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 16 },
    modalButtons: { flexDirection: 'row', gap: 12, marginTop: 8 },
    modalButton: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center' },
    cancelButton: { backgroundColor: '#e2e8f0' },
    cancelButtonText: { color: '#475569', fontWeight: '600' },
    submitButton: { backgroundColor: COLORS.primary },
    submitButtonText: { fontWeight: 'bold' },
    thumbnail: { width: 60, height: 60, borderRadius: 8, marginRight: 8, borderWidth: 1, borderColor: '#e2e8f0' },
    rejectionReasonText: { fontSize: 12, marginTop: 8, padding: 8, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 4 },
    acceptanceStatusContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, padding: 12, borderRadius: 8, borderWidth: 1 },
    acceptanceStatusLabel: { fontWeight: '600' },
    acceptanceStatusValue: { fontWeight: 'bold', fontSize: 14 },
    dateText: { fontSize: 12, marginTop: 2 },
});