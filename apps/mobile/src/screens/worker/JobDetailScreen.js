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
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
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
import { CreateExpenseModal } from '../../components/worker/expense/CreateExpenseModal';
import SignaturePad from '../../components/SignaturePad';
import { COLORS, Z_INDEX } from '../../constants/theme';
import { SocketProvider } from '../../context/SocketContext';
import { useTranslation } from 'react-i18next';
import { useAlert } from '../../context/AlertContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../../config';

const AppModal = ({ visible, children, ...props }) => {
    if (Platform.OS === 'web') {
        if (!visible) return null;
        return (
            <View style={[StyleSheet.absoluteFill, { zIndex: Z_INDEX.modal }]}>
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

// Force update for mobile split - 2026-01-29
export default function JobDetailScreen({ route, navigation }) {
    const { jobId } = route.params;
    const { user } = useAuth();
    const { theme, isDark } = useTheme();
    const { t, i18n } = useTranslation();
    const { showAlert } = useAlert();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [successModalVisible, setSuccessModalVisible] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [confirmationModalVisible, setConfirmationModalVisible] = useState(false);
    const [signatureModalVisible, setSignatureModalVisible] = useState(false);
    const [choiceModalVisible, setChoiceModalVisible] = useState(false);

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
    const [rejectionType, setRejectionType] = useState('JOB'); // 'JOB', 'STEP', 'SUBSTEP'
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

    useFocusEffect(
        React.useCallback(() => {
            loadJobDetails();
        }, [jobId])
    );

    const openImageModal = (image) => {
        setSelectedImage(image);
        setModalVisible(true);
    };

    const handleDeletePhoto = (photo) => {
        showAlert(
            t('common.delete'),
            t('common.confirmDelete'),
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
                            showAlert(t('common.error'), "Fotoğraf silinemedi.", [], 'error');
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
            <Image
                source={{ uri: getValidImageUrl(item.url || item) }}
                style={styles.thumbnail}
                accessibilityLabel="Job photo"
            />
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
                showAlert(t('common.error'), t('alerts.jobNotFound'), [], 'error');
                navigation.goBack();
            }
        } catch (error) {
            console.error('Error loading job details:', error);
            showAlert(t('common.error'), t('alerts.detailsLoadError'), [], 'error');
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

                const hasPhotos = substep?.photos && Array.isArray(substep.photos) && substep.photos.length > 0;

                if (!hasPhotos) {
                    showAlert(
                        t('common.warning'),
                        "bu iş emrini kapatabilmeniz için öncelikle en az 1 adet fotoğraf yüklemeniz gerekmektedir",
                        [],
                        'warning'
                    );
                    return;
                }
            }

            const isCompleted = !currentStatus;
            await jobService.toggleSubstep(jobId, stepId, substepId, isCompleted, job.updatedAt);
            loadJobDetails();
        } catch (error) {
            console.error('[MOBILE] Error toggling substep:', error);
            showAlert(t('common.error'), t('alerts.processError'), [], 'error');
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
            await jobService.toggleStep(jobId, stepId, isCompleted, job.updatedAt);
            loadJobDetails();
        } catch (error) {
            console.error('[MOBILE] Error toggling step:', error);
            showAlert(t('common.error'), t('alerts.processError'), [], 'error');
        }
    };

    const optimizeImage = async (uri) => {
        try {
            // Seviye 1/Boyut Azaltma: Resmi 1200px genişliğe sığdır ve %70 kaliteyle sıkıştır
            const result = await ImageManipulator.manipulateAsync(
                uri,
                [{ resize: { width: 1200 } }],
                { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
            );
            return result;
        } catch (error) {
            console.error("Image optimization error:", error);
            return null;
        }
    };

    const pickImage = async (stepId, substepId, source) => {
        try {

            // Safe access to MediaTypeOptions (modern Expo ImagePicker usage)
            const mediaTypes = ImagePicker.MediaTypeOptions ? ImagePicker.MediaTypeOptions.Images : 'Images';


            let result;
            if (source === 'camera') {
                const { status } = await ImagePicker.requestCameraPermissionsAsync();
                if (status !== 'granted') {
                    showAlert(t('alerts.permissionRequired'), t('alerts.cameraPermissionDesc'), [], 'warning');
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
                    showAlert(t('alerts.permissionRequired'), t('alerts.galleryPermissionDesc'), [], 'warning');
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
                setUploading(true);
                const optimized = await optimizeImage(result.assets[0].uri);
                if (optimized) {
                    uploadPhoto(stepId, substepId, optimized.uri, optimized.base64);
                } else {
                    // Fallback to original if optimization fails
                    uploadPhoto(stepId, substepId, result.assets[0].uri, result.assets[0].base64);
                }
            }
        } catch (error) {
            console.error("ImagePicker error:", error);
            showAlert(t('common.error'), t('alerts.photoSelectError'), [], 'error');
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
            showAlert(t('common.error'), t('alerts.photoUploadError'), [], 'error');
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
            showAlert(t('common.error'), t('alerts.audioUploadError'), [], 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleApproveStep = async (stepId) => {
        try {
            setLoading(true);
            await jobService.approveStep(stepId);
            showAlert(t('common.success'), t('alerts.stepApproveSuccess'), [], 'success');
            loadJobDetails();
        } catch (error) {
            console.error('Error approving step:', error);
            showAlert(t('common.error'), t('alerts.stepApproveError'), [], 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleRejectStep = async () => {
        if (!rejectionReason) {
            showAlert(t('common.warning'), t('alerts.rejectionReasonRequired'), [], 'warning');
            return;
        }

        try {
            setLoading(true);
            await jobService.rejectStep(selectedStepId, rejectionReason);
            showAlert(t('common.success'), t('alerts.stepRejectSuccess'), [], 'success');
            setRejectionModalVisible(false);
            setRejectionReason('');
            setSelectedStepId(null);
            loadJobDetails();
        } catch (error) {
            console.error('Error rejecting step:', error);
            showAlert(t('common.error'), t('alerts.stepRejectError'), [], 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleApproveSubstep = async (substepId) => {
        try {
            setLoading(true);
            await jobService.approveSubstep(substepId);
            showAlert(t('common.success'), t('alerts.stepApproveSuccess'), [], 'success');
            loadJobDetails();
        } catch (error) {
            console.error('Error approving step:', error);
            showAlert(t('common.error'), t('alerts.processError'), [], 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleRejectSubstep = async () => {
        if (!rejectionReason) {
            showAlert(t('common.warning'), t('alerts.rejectionReasonRequired'), [], 'warning');
            return;
        }

        try {
            setLoading(true);
            await jobService.rejectSubstep(selectedSubstepId, rejectionReason);
            showAlert(t('common.success'), t('alerts.stepRejectSuccess'), [], 'success');
            setRejectionModalVisible(false);
            setRejectionReason('');
            setSelectedSubstepId(null);
            loadJobDetails();
        } catch (error) {
            console.error('Error rejecting substep:', error);
            showAlert(t('common.error'), t('alerts.stepRejectError'), [], 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleRejectJob = async () => {
        if (!rejectionReason) {
            showAlert(t('common.warning'), t('alerts.rejectionReasonRequired'), [], 'warning');
            return;
        }

        try {
            setLoading(true);
            await jobService.rejectJob(jobId, rejectionReason);
            showAlert(t('common.success'), t('alerts.stepRejectSuccess'), [], 'success');
            setRejectionReason('');
            setModalVisible(false);
            loadJobDetails();
        } catch (error) {
            console.error('Error rejecting step:', error);
            showAlert(t('common.error'), t('alerts.processError'), [], 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteJob = async () => {
        showAlert(
            t('common.delete'),
            t('common.confirmDelete') || "Bu işi tamamen silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.",
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.delete'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await jobService.deleteJob(jobId);
                            navigation.goBack();
                        } catch (error) {
                            console.error('Error deleting job:', error);
                            showAlert(t('common.error'), "İş silinemedi.", [], 'error');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ],
            'question'
        );
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
            console.log('[Mobile] Starting job:', jobId, 'Last Updated:', job.updatedAt);
            // Fallback to current time if updatedAt is missing to avoid "clientVersion" missing issues,
            // though this might bypass strict conflict checks, it ensures the action proceeds.
            await jobService.startJob(jobId, job.updatedAt || new Date().toISOString());
            showAlert(t('common.success'), t('alerts.jobStartSuccess'), [], 'success');
            loadJobDetails();
        } catch (error) {
            console.error('Error starting job:', error);
            if (error.status === 409) {
                console.warn('[Mobile] Conflict detected on start.');
                showAlert(
                    t('common.warning'),
                    t('alerts.jobDataStale'),
                    [],
                    'warning'
                );
                loadJobDetails();
            } else {
                const errorMessage = error.message || t('alerts.jobStartError');
                console.error('[Mobile] Start Job Failed:', errorMessage);
                showAlert(t('common.error'), errorMessage, [], 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleStartStep = async (stepId) => {
        try {
            setLoading(true);
            await jobService.startStep(jobId, stepId, job.updatedAt);
            loadJobDetails();
        } catch (error) {
            console.error('Error starting step:', error);
            showAlert(t('common.error'), t('alerts.processError'), [], 'error');
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
            showAlert(t('common.error'), t('alerts.processError'), [], 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptJob = async () => {
        showAlert(
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
                            showAlert(t('common.success'), t('alerts.stepApproveSuccess'), [], 'success');
                            loadJobDetails();
                        } catch (error) {
                            console.error('Error accepting job:', error);
                            showAlert(t('common.error'), t('alerts.processError'), [], 'error');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ],
            'question'
        );
    };

    const createExpense = async (formData, receiptImage, audioUri) => {
        try {
            setSubmittingCost(true);
            const finalDescription = formData.description
                ? `${formData.title} - ${formData.description}`
                : formData.title;

            const data = new FormData();
            data.append('jobId', formData.jobId);
            data.append('amount', parseFloat(formData.amount).toString());
            data.append('currency', 'TRY');
            data.append('category', formData.category);
            data.append('description', finalDescription);
            data.append('date', formData.date.toISOString());

            if (receiptImage) {
                const filename = receiptImage.split('/').pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : 'image/jpeg';

                if (Platform.OS === 'web') {
                    const response = await fetch(receiptImage);
                    const blob = await response.blob();
                    data.append('receipt', blob, filename);
                } else {
                    data.append('receipt', { uri: receiptImage, name: filename, type });
                }
            }

            if (audioUri) {
                const filename = audioUri.split('/').pop();
                const type = 'audio/m4a';
                if (Platform.OS === 'web') {
                    const response = await fetch(audioUri);
                    const blob = await response.blob();
                    data.append('audio', blob, filename);
                } else {
                    data.append('audio', { uri: audioUri, name: filename, type });
                }
            }

            await costService.create(data);

            setSuccessMessage(t('common.success'));
            setSuccessModalVisible(true);
            setCostModalVisible(false);
            loadJobDetails();
            return true;
        } catch (error) {
            console.error('Error creating cost:', error);
            showAlert(t('common.error'), t('alerts.processError'), [], 'error');
            return false;
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

        // Tüm ana adımların ve bağlı tüm alt adımların (sub-steps) tamamlanmış olması gerekir
        const allStepsCompleted = job.steps.length > 0 && job.steps.every(step => {
            const anaAdimTamam = step.isCompleted;
            const altAdimlarTamam = !step.subSteps || step.subSteps.length === 0 || step.subSteps.every(ss => ss.isCompleted);
            return anaAdimTamam && altAdimlarTamam;
        });

        console.log('[Mobile] All steps and sub-steps completed:', allStepsCompleted);

        if (!allStepsCompleted) {
            showAlert(
                t('common.warning'),
                "bu montajı tamamlayarak kapatmak için tüm alt iş emirlerini tamamlamanız gerekiyor",
                [],
                'warning'
            );
            return;
        }

        // Use custom modal instead of Alert.alert for web compatibility
        setChoiceModalVisible(true);
    };

    const handleConfirmComplete = async () => {
        try {
            setCompleting(true);
            setConfirmationModalVisible(false);

            await jobService.completeJob(
                jobId,
                job.signature || null,
                job.signatureCoords || null,
                job.updatedAt
            );

            setSuccessMessage("İş başarıyla bitirildi ve admin onayına gönderildi.");
            setSuccessModalVisible(true);
            loadJobDetails();
        } catch (error) {
            console.error('Error completing job:', error);
            showAlert(t('common.error'), "İş tamamlanırken bir hata oluştu.", [], 'error');
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
            showAlert(t('common.error'), 'Dosya paylaşılamadı.', [], 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            // Fallback for PWA refresh where history is lost
            const role = user?.role?.toUpperCase();
            if (role === 'ADMIN') navigation.navigate('AdminDashboard');
            else if (role === 'MANAGER') navigation.navigate('ManagerDashboard');
            else navigation.navigate('WorkerDashboard');
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} />
            <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={24} color={theme.colors.primary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{t('worker.jobDetails')}</Text>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                    {job && ['ADMIN', 'MANAGER'].includes(user?.role?.toUpperCase()) && (
                        <>
                            {user?.role?.toUpperCase() === 'ADMIN' && (
                                <TouchableOpacity
                                    onPress={handleDeleteJob}
                                    style={styles.chatButton}
                                >
                                    <MaterialIcons name="delete" size={24} color={theme.colors.error} />
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity
                                onPress={() => navigation.navigate('EditJob', { job })}
                                style={styles.chatButton}
                            >
                                <MaterialIcons name="edit" size={24} color={theme.colors.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleExportProforma} style={styles.chatButton}>
                                <MaterialIcons name="description" size={24} color={theme.colors.primary} />
                            </TouchableOpacity>
                        </>
                    )}
                    {job && (
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Chat', { jobId: job.id, jobTitle: job.title })}
                            style={styles.chatButton}
                        >
                            <MaterialIcons name="chat" size={24} color={theme.colors.primary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {loading ? (
                <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : !job ? (
                <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
                    <Text style={{ color: theme.colors.text }}>{t('alerts.jobNotFound')}</Text>
                </View>
            ) : (
                <>
                    <View style={{ flex: 1, minHeight: 0 }}>
                        <ScrollView
                            style={{ flex: 1 }}
                            contentContainerStyle={[styles.contentContainer, { flexGrow: 1 }]}
                        >
                            {/* Job Approval Card (Manager/Admin only) */}
                            {['ADMIN', 'MANAGER'].includes(user?.role?.toUpperCase()) &&
                                job.status === 'PENDING_APPROVAL' && (
                                    <GlassCard style={[styles.card, { borderColor: theme.colors.warning, backgroundColor: theme.colors.warningBg }]} theme={theme}>
                                        <View style={styles.infoRow}>
                                            <MaterialIcons name="error-outline" size={24} color={theme.colors.tertiary} />
                                            <Text style={[styles.sectionTitle, { color: theme.colors.text, marginTop: 0, marginLeft: 8 }]}>Onay Bekliyor</Text>
                                        </View>
                                        <Text style={[styles.infoText, { color: theme.colors.subText, marginLeft: 0, marginBottom: 16 }]}>
                                            Bu iş tamamlandı olarak işaretlendi ve yönetici onayını bekliyor. Lütfen detayları inceleyip karar verin.
                                        </Text>
                                        <View style={{ flexDirection: 'row', gap: 12 }}>
                                            <TouchableOpacity
                                                style={[styles.managerButton, { backgroundColor: theme.colors.error, paddingVertical: 12 }]}
                                                onPress={() => {
                                                    setRejectionType('JOB');
                                                    setRejectionModalVisible(true);
                                                }}
                                            >
                                                <MaterialIcons name="close" size={20} color="#fff" />
                                                <Text style={styles.managerButtonText}>Reddet</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[styles.managerButton, { backgroundColor: theme.colors.success, paddingVertical: 12 }]}
                                                onPress={handleAcceptJob}
                                            >
                                                <MaterialIcons name="check" size={20} color="#fff" />
                                                <Text style={styles.managerButtonText}>Onayla</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </GlassCard>
                                )}

                            <JobInfoCard job={job} />

                            <CostSection
                                job={job}
                                canAdd={['WORKER', 'TEAM_LEAD'].includes(user?.role?.toUpperCase())}
                                onAddPress={() => setCostModalVisible(true)}
                            />

                            {/* Yeni: İş Sorumlusu / Lider Bölümü */}
                            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>İş Sorumlusu</Text>
                            <GlassCard style={styles.card} theme={theme}>
                                <View style={styles.infoRow}>
                                    <View style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: theme.colors.warningBg || 'rgba(245, 158, 11, 0.1)', alignItems: 'center', justifyContent: 'center' }}>
                                        <MaterialIcons name="stars" size={24} color={theme.colors.tertiary} />
                                    </View>
                                    <View style={{ marginLeft: 12 }}>
                                        <Text style={[styles.infoText, { fontWeight: 'bold', fontSize: 16, color: theme.colors.text }]}>
                                            {job.jobLead?.name || 'Atanmamış'}
                                        </Text>
                                        <Text style={[styles.infoText, { fontSize: 12, color: theme.colors.tertiary, fontWeight: 'bold', textTransform: 'uppercase' }]}>Ana Sorumlu</Text>
                                    </View>
                                </View>
                            </GlassCard>

                            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('navigation.teams')}</Text>
                            {job.assignments && job.assignments.length > 0 ? (
                                job.assignments.map((assignment, index) => (
                                    <GlassCard key={index} style={styles.card} theme={theme}>
                                        <View style={styles.infoRow}>
                                            <MaterialIcons name="group" size={20} color={theme.colors.primary} />
                                            <View style={{ marginLeft: 8, flex: 1 }}>
                                                {assignment.team ? (
                                                    <>
                                                        <Text style={[styles.infoText, { fontWeight: 'bold', color: theme.colors.text }]}>{assignment.team.name}</Text>

                                                        {/* Çalışanlar Gösterimi - Lider Hariç */}
                                                        {assignment.team.members && assignment.team.members.length > 0 && (
                                                            <View style={{ marginTop: 8 }}>
                                                                <Text style={{ fontSize: 10, fontWeight: 'bold', color: theme.colors.subText, textTransform: 'uppercase', marginBottom: 4 }}>Ekip Üyeleri</Text>
                                                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
                                                                    {assignment.team.members
                                                                        .filter(m => m.user.id !== job.jobLead?.id)
                                                                        .map((member, mIdx) => (
                                                                            <View key={mIdx} style={{ backgroundColor: theme.colors.surface, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border, flexDirection: 'row', alignItems: 'center' }}>
                                                                                <MaterialIcons name="person-outline" size={12} color={theme.colors.subText} />
                                                                                <Text style={{ fontSize: 12, color: theme.colors.text, marginLeft: 4 }}>{member.user.name}</Text>
                                                                            </View>
                                                                        ))
                                                                    }
                                                                    {assignment.team.members.filter(m => m.user.id !== job.jobLead?.id).length === 0 && (
                                                                        <Text style={{ fontSize: 12, color: theme.colors.subText, italic: true }}>Başka üye bulunmuyor.</Text>
                                                                    )}
                                                                </View>
                                                            </View>
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
                                                disabled={isLocked || user?.role?.toUpperCase() === 'ADMIN'}
                                            >
                                                {step.isCompleted && <MaterialIcons name="check" size={16} color="#FFFFFF" />}
                                            </TouchableOpacity>
                                            <View style={{ flex: 1 }}>
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Text style={[styles.stepTitle, step.isCompleted && styles.completedText, { color: theme.colors.text }]}>
                                                        {step.title || step.name}
                                                    </Text>
                                                    {step.isCompleted && (
                                                        <View style={[
                                                            styles.badge,
                                                            step.approvalStatus === 'APPROVED' ? { backgroundColor: theme.colors.success } :
                                                                step.approvalStatus === 'REJECTED' ? { backgroundColor: theme.colors.error } :
                                                                    { backgroundColor: theme.colors.warning }
                                                        ]}>
                                                            <Text style={styles.badgeText}>
                                                                {step.approvalStatus === 'APPROVED' ? 'ONAYLANDI' :
                                                                    step.approvalStatus === 'REJECTED' ? 'REDDEDİLDİ' : 'ONAY BEKLİYOR'}
                                                            </Text>
                                                        </View>
                                                    )}
                                                </View>
                                                {step.startedAt && (<Text style={[styles.dateText, { color: theme.colors.subText }]}>
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

                                        {/* Manager Actions for Step */}
                                        {['ADMIN', 'MANAGER'].includes(user?.role?.toUpperCase()) && step.isCompleted && step.approvalStatus === 'PENDING' && (
                                            <View style={styles.managerActionRow}>
                                                <TouchableOpacity
                                                    style={[styles.managerButton, { backgroundColor: theme.colors.error }]}
                                                    onPress={() => {
                                                        setSelectedStepId(step.id);
                                                        setRejectionType('STEP');
                                                        setRejectionModalVisible(true);
                                                    }}
                                                >
                                                    <MaterialIcons name="close" size={16} color="#fff" />
                                                    <Text style={styles.managerButtonText}>Reddet</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={[styles.managerButton, { backgroundColor: theme.colors.success }]}
                                                    onPress={() => handleApproveStep(step.id)}
                                                >
                                                    <MaterialIcons name="check" size={16} color="#fff" />
                                                    <Text style={styles.managerButtonText}>Onayla</Text>
                                                </TouchableOpacity>
                                            </View>
                                        )}

                                        {!isLocked && step.subSteps && (<View style={styles.substepsContainer}>
                                            {step.subSteps.map((substep, subIndex) => {
                                                const isSubstepLocked = subIndex > 0 && !step.subSteps[subIndex - 1].isCompleted;
                                                return (
                                                    <GlassCard key={substep.id} style={[styles.substepWrapper, isSubstepLocked && styles.lockedCard]} theme={theme}>
                                                        <View style={styles.substepRow}>
                                                            <TouchableOpacity
                                                                style={[styles.checkbox, { width: 20, height: 20 }, substep.isCompleted && styles.checkedBox]}
                                                                onPress={() => handleSubstepToggle(step.id, substep.id, substep.isCompleted)}
                                                                disabled={isSubstepLocked || user?.role?.toUpperCase() === 'ADMIN'}
                                                            >
                                                                {substep.isCompleted && <MaterialIcons name="check" size={14} color="#FFFFFF" />}
                                                            </TouchableOpacity>
                                                            <View style={styles.substepInfo}>
                                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                    <Text style={[styles.substepTitle, substep.isCompleted && styles.completedText, { color: theme.colors.text, flex: 1 }]}>
                                                                        {substep.title}
                                                                    </Text>
                                                                    {substep.isCompleted && (
                                                                        <View style={[
                                                                            styles.badge,
                                                                            { paddingHorizontal: 6, paddingVertical: 2 },
                                                                            substep.approvalStatus === 'APPROVED' ? { backgroundColor: theme.colors.success } :
                                                                                substep.approvalStatus === 'REJECTED' ? { backgroundColor: theme.colors.error } :
                                                                                    { backgroundColor: theme.colors.warning }
                                                                        ]}>
                                                                            <Text style={[styles.badgeText, { fontSize: 10 }]}>
                                                                                {substep.approvalStatus === 'APPROVED' ? 'ONAYLI' :
                                                                                    substep.approvalStatus === 'REJECTED' ? 'RED' : 'BEKLİYOR'}
                                                                            </Text>
                                                                        </View>
                                                                    )}

                                                                    {/* Alt adım için fotoğraf yükleme butonu - Sadece saha personeli için */}                                                                        {!isSubstepLocked && !substep.isCompleted && user?.role?.toUpperCase() !== 'ADMIN' && (
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

                                                            {substep.approvalStatus === 'REJECTED' && substep.rejectionReason && (
                                                                <Text style={[styles.rejectionReasonText, { color: theme.colors.error, marginTop: 4 }]}>
                                                                    {t('worker.rejectionReason')}: {substep.rejectionReason}
                                                                </Text>
                                                            )}

                                                            {/* Manager Actions for Substep */}
                                                            {['ADMIN', 'MANAGER'].includes(user?.role?.toUpperCase()) && substep.isCompleted && substep.approvalStatus === 'PENDING' && (
                                                                <View style={[styles.managerActionRow, { marginTop: 8 }]}>
                                                                    <TouchableOpacity
                                                                        style={[styles.managerButton, { backgroundColor: theme.colors.error, padding: 6 }]}
                                                                        onPress={() => {
                                                                            setSelectedSubstepId(substep.id);
                                                                            setRejectionType('SUBSTEP');
                                                                            setRejectionModalVisible(true);
                                                                        }}
                                                                    >
                                                                        <MaterialIcons name="close" size={14} color="#fff" />
                                                                        <Text style={[styles.managerButtonText, { fontSize: 11 }]}>Reddet</Text>
                                                                    </TouchableOpacity>
                                                                    <TouchableOpacity
                                                                        style={[styles.managerButton, { backgroundColor: theme.colors.success, padding: 6 }]}
                                                                        onPress={() => handleApproveSubstep(substep.id)}
                                                                    >
                                                                        <MaterialIcons name="check" size={14} color="#fff" />
                                                                        <Text style={[styles.managerButtonText, { fontSize: 11 }]}>Onayla</Text>
                                                                    </TouchableOpacity>
                                                                </View>
                                                            )}
                                                        </View>
                                                    </GlassCard>);
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
                                    <Text style={[styles.acceptanceStatusLabel, { color: theme.colors.text }]}>Montaj Onay Durumu:</Text>
                                    <Text style={[
                                        styles.acceptanceStatusValue,
                                        job.acceptanceStatus === 'ACCEPTED' ? { color: theme.colors.success } :
                                            (job.status === 'PENDING_APPROVAL') ? { color: theme.colors.warning } :
                                                job.acceptanceStatus === 'REJECTED' ? { color: theme.colors.error } : { color: theme.colors.subText }
                                    ]}>
                                        {job.acceptanceStatus === 'ACCEPTED' ? 'ONAYLANMIŞ' :
                                            job.acceptanceStatus === 'REJECTED' ? 'REDDEDİLMİŞ' :
                                                job.status === 'PENDING_APPROVAL' ? 'ONAY BEKLİYOR' : 'MONTAJ DEVAM EDİYOR'}
                                    </Text>
                                </View>
                                {job.acceptanceStatus === 'PENDING' && (job.status === 'COMPLETED' || job.status === 'PENDING_APPROVAL') && (
                                    <View style={{ flexDirection: 'row', gap: 8 }}>
                                        <TouchableOpacity
                                            style={[styles.mainCompleteButton, styles.rejectButton, { flex: 1, padding: 12, backgroundColor: theme.colors.error }]}
                                            onPress={() => {
                                                setRejectionType('JOB');
                                                setRejectionModalVisible(true);
                                            }}
                                        >
                                            <Text style={[styles.mainCompleteButtonText, { color: theme.colors.textInverse }]}>Reddet</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.mainCompleteButton, styles.acceptJobButton, { flex: 1, padding: 12, backgroundColor: theme.colors.success }]}
                                            onPress={handleAcceptJob}
                                        >
                                            <Text style={[styles.mainCompleteButtonText, { color: theme.colors.textInverse }]}>Kabul Et</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        )}
                    </View>
                </>
            )}

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
                            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                                {rejectionType === 'JOB' ? 'İşi Reddet' :
                                    rejectionType === 'STEP' ? 'Adımı Reddet' : 'Alt Adımı Reddet'}
                            </Text>
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
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.submitButton, { backgroundColor: theme.colors.error }]}
                                    onPress={() => {
                                        if (rejectionType === 'STEP') handleRejectStep();
                                        else if (rejectionType === 'SUBSTEP') handleRejectSubstep();
                                        else handleRejectJob();
                                    }}
                                >
                                    <Text style={[styles.submitButtonText, { color: theme.colors.textInverse }]}>Reddet ve Geri Gönder</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </AppModal>

            <SuccessModal visible={successModalVisible} message={successMessage} onClose={() => setSuccessModalVisible(false)} />

            <AppModal visible={choiceModalVisible} transparent={true} animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={[styles.formCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                        <Text style={[styles.modalTitle, { color: theme.colors.text }]}>İşi Bitir</Text>
                        <Text style={{ color: theme.colors.subText, textAlign: 'center', marginBottom: 24, fontSize: 16 }}>
                            Müşteri imzası almak ister misiniz?
                        </Text>
                        <View style={{ gap: 12 }}>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: theme.colors.primary, paddingVertical: 16 }]}
                                onPress={() => {
                                    setChoiceModalVisible(false);
                                    setSignatureModalVisible(true);
                                }}
                            >
                                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>İmza Al</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: theme.colors.secondary, paddingVertical: 16 }]}
                                onPress={() => {
                                    setChoiceModalVisible(false);
                                    setJob(prev => ({ ...prev, signature: null, signatureCoords: null }));
                                    setConfirmationModalVisible(true);
                                }}
                            >
                                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>İmzasız Bitir</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton, { paddingVertical: 16 }]}
                                onPress={() => setChoiceModalVisible(false)}
                            >
                                <Text style={[styles.cancelButtonText, { fontSize: 16 }]}>Vazgeç</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </AppModal>

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

            <CreateExpenseModal
                visible={costModalVisible}
                onClose={() => setCostModalVisible(false)}
                onSubmit={createExpense}
                projects={null}
                defaultJobId={jobId}
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
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        marginLeft: 8,
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    managerActionRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 12,
    },
    managerButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
        borderRadius: 6,
        gap: 4,
    },
    managerButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
});