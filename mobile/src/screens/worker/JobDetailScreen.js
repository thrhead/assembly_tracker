import React, { useState, useEffect } from 'react';
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
    Keyboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import jobService from '../../services/job.service';
import costService from '../../services/cost.service';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import JobInfoCard from '../../components/job-detail/JobInfoCard';
import CostSection from '../../components/job-detail/CostSection';
import SuccessModal from '../../components/SuccessModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import { WebInput } from '../../components/common/WebInput';
import GlassCard from '../../components/ui/GlassCard';
import { COLORS } from '../../constants/theme'; // Re-imported for StyleSheet fallback

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
    if (Platform.OS === 'web') {
        return (
            <View style={{ flex: 1 }}>
                {children}
            </View>
        );
    }
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
        >
            {children}
        </KeyboardAvoidingView>
    );
};

export default function JobDetailScreen({ route, navigation }) {
    const { jobId } = route.params;
    const { user } = useAuth();
    const { theme, isDark } = useTheme(); // Use Theme
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    // ... states
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [successModalVisible, setSuccessModalVisible] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [confirmationModalVisible, setConfirmationModalVisible] = useState(false);

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
        return new Date(dateString).toLocaleString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    useEffect(() => {
        loadJobDetails();
    }, [jobId]);

    const loadJobDetails = async () => {
        try {
            setLoading(true);
            const data = await jobService.getJobById(jobId);

            if (data.id) {
                setJob(data);
            } else if (data.job) {
                setJob(data.job);
            } else {
                Alert.alert('Hata', 'İş bulunamadı');
                navigation.goBack();
            }
        } catch (error) {
            console.error('Error loading job details:', error);
            Alert.alert('Hata', 'İş detayları yüklenemedi');
        } finally {
            setLoading(false);
        }
    };



    const handleSubstepToggle = async (stepId, substepId, currentStatus) => {
        try {
            const isCompleted = !currentStatus;
            await jobService.toggleSubstep(jobId, stepId, substepId, isCompleted);
            loadJobDetails();
        } catch (error) {
            console.error('[MOBILE] Error toggling substep:', error);
            Alert.alert('Hata', 'İşlem gerçekleştirilemedi');
        }
    };

    const handleToggleStep = async (stepId, currentStatus) => {
        try {
            const isCompleted = !currentStatus;
            await jobService.toggleStep(jobId, stepId, isCompleted);
            loadJobDetails();
        } catch (error) {
            console.error('[MOBILE] Error toggling step:', error);
            Alert.alert('Hata', 'İşlem gerçekleştirilemedi');
        }
    };

    const pickImage = async (stepId, substepId, source) => {
        try {
            let result;
            if (source === 'camera') {
                const { status } = await ImagePicker.requestCameraPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('İzin Gerekli', 'Kamera erişim izni vermeniz gerekiyor.');
                    return;
                }
                result = await ImagePicker.launchCameraAsync({
                    mediaTypes: 'Images',
                    allowsEditing: true,
                    aspect: [4, 3],
                    quality: 0.5,
                });
            } else {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('İzin Gerekli', 'Galeri erişim izni vermeniz gerekiyor.');
                    return;
                }
                result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: 'Images',
                    allowsEditing: true,
                    aspect: [4, 3],
                    quality: 0.5,
                });
            }

            if (!result.canceled) {
                const uri = result.assets[0].uri;
                uploadPhoto(stepId, substepId, uri);
            }
        } catch (error) {
            console.error("ImagePicker error:", error);
            Alert.alert('Hata', 'Fotoğraf seçilirken bir hata oluştu.');
        }
    };

    const uploadPhoto = async (stepId, substepId, uri) => {
        try {
            setUploading(true);
            const formData = new FormData();
            const filename = uri.split('/').pop();
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image`;

            formData.append('photo', { uri, name: filename, type });

            await jobService.uploadPhotos(jobId, stepId, formData, substepId);

            setSuccessMessage('Fotoğraf başarıyla yüklendi');
            setSuccessModalVisible(true);
            loadJobDetails();
        } catch (error) {
            console.error('Error uploading photo:', error);
            Alert.alert('Hata', 'Fotoğraf yüklenemedi');
        } finally {
            setUploading(false);
        }
    };

    const handleApproveStep = async (stepId) => {
        try {
            setLoading(true);
            await jobService.approveStep(stepId);
            Alert.alert('Başarılı', 'İş adımı onaylandı.');
            loadJobDetails();
        } catch (error) {
            console.error('Error approving step:', error);
            Alert.alert('Hata', 'Onaylama işlemi başarısız oldu.');
        } finally {
            setLoading(false);
        }
    };

    const handleRejectStep = async () => {
        if (!rejectionReason) {
            Alert.alert('Uyarı', 'Lütfen bir red sebebi giriniz.');
            return;
        }

        try {
            setLoading(true);
            await jobService.rejectStep(selectedStepId, rejectionReason);
            Alert.alert('Başarılı', 'İş adımı reddedildi.');
            setRejectionModalVisible(false);
            setRejectionReason('');
            setSelectedStepId(null);
            loadJobDetails();
        } catch (error) {
            console.error('Error rejecting step:', error);
            Alert.alert('Hata', 'Reddetme işlemi başarısız oldu.');
        } finally {
            setLoading(false);
        }
    };

    const handleApproveSubstep = async (substepId) => {
        try {
            setLoading(true);
            await jobService.approveSubstep(substepId);
            Alert.alert('Başarılı', 'Alt görev onaylandı.');
            loadJobDetails();
        } catch (error) {
            console.error('Error approving substep:', error);
            Alert.alert('Hata', 'Onaylama işlemi başarısız oldu.');
        } finally {
            setLoading(false);
        }
    };

    const handleRejectSubstep = async () => {
        if (!rejectionReason) {
            Alert.alert('Uyarı', 'Lütfen bir red sebebi giriniz.');
            return;
        }

        try {
            setLoading(true);
            await jobService.rejectSubstep(selectedSubstepId, rejectionReason);
            Alert.alert('Başarılı', 'Alt görev reddedildi.');
            setRejectionModalVisible(false);
            setRejectionReason('');
            setSelectedSubstepId(null);
            loadJobDetails();
        } catch (error) {
            console.error('Error rejecting substep:', error);
            Alert.alert('Hata', 'Reddetme işlemi başarısız oldu.');
        } finally {
            setLoading(false);
        }
    };

    const handleRejectJob = async () => {
        if (!rejectionReason) {
            Alert.alert('Uyarı', 'Lütfen bir red sebebi giriniz.');
            return;
        }

        try {
            setLoading(true);
            await jobService.rejectJob(jobId, rejectionReason);
            Alert.alert('Başarılı', 'İş reddedildi.');
            setRejectionModalVisible(false);
            setRejectionReason('');
            loadJobDetails();
        } catch (error) {
            console.error('Error rejecting job:', error);
            Alert.alert('Hata', 'İş reddedilemedi.');
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
            Alert.alert('Başarılı', 'İş başlatıldı.');
            loadJobDetails();
        } catch (error) {
            console.error('Error starting job:', error);
            Alert.alert('Hata', 'İş başlatılamadı.');
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
            Alert.alert('Hata', 'Adım başlatılamadı.');
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
            Alert.alert('Hata', 'Alt adım başlatılamadı.');
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptJob = async () => {
        Alert.alert(
            "Montajı Kabul Et",
            "Bu montajı ve tüm yapılan işleri onaylıyor musunuz?",
            [
                { text: "İptal", style: "cancel" },
                {
                    text: "Kabul Et",
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await jobService.acceptJob(jobId);
                            Alert.alert("Başarılı", "Montaj başarıyla kabul edildi.");
                            loadJobDetails();
                        } catch (error) {
                            console.error('Error accepting job:', error);
                            Alert.alert('Hata', 'Montaj kabul edilirken bir hata oluştu.');
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

                // Expo Web fix for FormData file
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

            // Alert.alert('Başarılı', 'Masraf eklendi ve onaya gönderildi.');
            setSuccessMessage('Masraf eklendi ve onaya gönderildi');
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
            Alert.alert('Hata', 'Masraf eklenirken bir hata oluştu.');
        } finally {
            setSubmittingCost(false);
        }
    };

    const [completing, setCompleting] = useState(false);

    const handleCompleteJob = async () => {
        const allStepsCompleted = job.steps.every(step => step.isCompleted);

        if (!allStepsCompleted) {
            Alert.alert("Uyarı", "İşi tamamlamak için tüm adımları bitirmelisiniz.");
            return;
        }

        setConfirmationModalVisible(true);
    };

    const confirmCompleteJob = async () => {
        setConfirmationModalVisible(false);
        try {
            setCompleting(true);
            const result = await jobService.completeJob(jobId);
            setSuccessMessage('İş tamamlandı ve onaya gönderildi');
            setSuccessModalVisible(true);
            setTimeout(() => {
                setSuccessModalVisible(false);
                navigation.goBack();
            }, 2000);
        } catch (error) {
            console.error('Error completing job:', error);
            Alert.alert('Hata', error.message || 'İş tamamlanırken bir hata oluştu');
        } finally {
            setCompleting(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (!job) {
        return (
            <View style={styles.centerContainer}>
                <Text style={{ color: theme.colors.text }}>İş bulunamadı.</Text>
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
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>İş Detayı</Text>
                <View style={{ width: 24 }} />
            </View>

            <PageWrapper>
                <ScrollView style={styles.contentContainer}>
                    {/* Job Info Card */}
                    <JobInfoCard job={job} />


                    {/* Assignments Section */}
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Ekip ve Atamalar</Text>
                    {job.assignments && job.assignments.length > 0 ? (
                        job.assignments.map((assignment, index) => (
                            <GlassCard key={index} style={styles.card}>
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
                        <GlassCard style={styles.card}>
                            <Text style={[styles.infoText, { color: theme.colors.subText }]}>Atama bulunamadı.</Text>
                        </GlassCard>
                    )}

                    {/* Steps Section */}
                    <Text style={styles.sectionTitle}>İş Adımları</Text>
                    {job.steps && job.steps.map((step, index) => {
                        const isLocked = index > 0 && !job.steps[index - 1].isCompleted;

                        return (
                            <GlassCard key={step.id} style={[styles.stepCard, isLocked && styles.lockedCard]} theme={theme}>
                                <View style={styles.stepHeader}>
                                    <View style={[styles.checkbox, step.isCompleted && styles.checkedBox]}>
                                        {step.isCompleted && <MaterialIcons name="check" size={16} color="#FFFFFF" />}
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.stepTitle, step.isCompleted && styles.completedText, { color: theme.colors.text }]}>
                                            {step.title || step.name}
                                        </Text>
                                        {step.startedAt && (
                                            <Text style={[styles.dateText, { color: theme.colors.subText }]}>
                                                Başladı: {formatDate(step.startedAt)}
                                            </Text>
                                        )}
                                        {step.completedAt && (
                                            <Text style={[styles.dateText, { color: theme.colors.subText }]}>
                                                Bitti: {formatDate(step.completedAt)}
                                            </Text>
                                        )}
                                        {(step.approvalStatus && step.approvalStatus !== 'PENDING') &&
                                            (!step.subSteps || step.subSteps.every(s => s.isCompleted && s.approvalStatus === 'APPROVED')) && (
                                                <View style={[
                                                    styles.statusBadge,
                                                    step.approvalStatus === 'APPROVED' ? styles.badgeApproved : styles.badgeRejected
                                                ]}>
                                                    <Text style={styles.statusBadgeText}>
                                                        {step.approvalStatus === 'APPROVED' ? 'ONAYLANDI' : 'REDDEDİLDİ'}
                                                    </Text>
                                                </View>
                                            )}
                                    </View>
                                    {isLocked && <MaterialIcons name="lock" size={20} color={theme.colors.subText} />}
                                </View>

                                {step.approvalStatus === 'REJECTED' && step.rejectionReason && (
                                    <Text style={[styles.rejectionReasonText, { color: theme.colors.error }]}>Red Sebebi: {step.rejectionReason}</Text>
                                )}

                                {['ADMIN', 'MANAGER'].includes(user?.role?.toUpperCase()) && (step.isCompleted || step.approvalStatus !== 'PENDING') && (
                                    <View style={styles.managerActions}>
                                        <TouchableOpacity
                                            style={[styles.actionButton, styles.rejectButton]}
                                            onPress={() => openRejectionModal(step.id)}
                                        >
                                            <Text style={styles.actionButtonText}>Reddet</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.actionButton, styles.approveButton]}
                                            onPress={() => handleApproveStep(step.id)}
                                        >
                                            <Text style={styles.actionButtonText}>Onayla</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}

                                {!isLocked && step.subSteps && (
                                    <View style={styles.substepsContainer}>
                                        {step.subSteps.map((substep, subIndex) => {
                                            const substepPhotos = substep.photos || [];
                                            const photoCount = substepPhotos.length;
                                            const isSubstepLocked = subIndex > 0 && !step.subSteps[subIndex - 1].isCompleted;
                                            const canComplete = photoCount >= 1 && substep.startedAt;
                                            const canUpload = photoCount < 3 && substep.startedAt;

                                            return (
                                                <GlassCard key={substep.id} style={[styles.substepWrapper, isSubstepLocked && styles.lockedCard]} theme={theme}>
                                                    <View style={styles.substepRow}>
                                                        <View style={styles.substepInfo}>
                                                            <Text style={[styles.substepText, substep.isCompleted && styles.completedText, { color: theme.colors.text }]}>
                                                                {substep.title || substep.name}
                                                            </Text>
                                                            {substep.startedAt && (
                                                                <Text style={[styles.dateText, { color: theme.colors.subText }]}>
                                                                    Başladı: {formatDate(substep.startedAt)}
                                                                </Text>
                                                            )}
                                                            {substep.completedAt && (
                                                                <Text style={[styles.dateText, { color: theme.colors.subText }]}>
                                                                    Bitti: {formatDate(substep.completedAt)}
                                                                </Text>
                                                            )}
                                                            {substep.approvalStatus && (
                                                                <View style={[
                                                                    styles.statusBadge,
                                                                    styles.smallBadge,
                                                                    substep.approvalStatus === 'APPROVED' ? styles.badgeApproved :
                                                                        substep.approvalStatus === 'REJECTED' ? styles.badgeRejected :
                                                                            styles.badgePending
                                                                ]}>
                                                                    <Text style={styles.statusBadgeText}>
                                                                        {substep.approvalStatus === 'APPROVED' ? 'ONAYLANDI' :
                                                                            substep.approvalStatus === 'REJECTED' ? 'REDDEDİLDİ' : 'ONAY BEKLİYOR'}
                                                                    </Text>
                                                                </View>
                                                            )}
                                                            {isSubstepLocked && <Text style={[styles.lockedText, { color: theme.colors.subText }]}>(Önceki adımı tamamlayın)</Text>}
                                                        </View>

                                                        {!['ADMIN', 'MANAGER'].includes(user?.role?.toUpperCase()) && (
                                                            <View style={styles.actionButtons}>
                                                                {!substep.isCompleted ? (
                                                                    !substep.startedAt ? (
                                                                        <TouchableOpacity
                                                                            style={[styles.startButton, isSubstepLocked && styles.disabledButton]}
                                                                            onPress={() => handleStartSubstep(step.id, substep.id)}
                                                                            disabled={isSubstepLocked}
                                                                        >
                                                                            <Text style={styles.btnText}>Başla</Text>
                                                                        </TouchableOpacity>
                                                                    ) : (
                                                                        <TouchableOpacity
                                                                            style={[styles.completeButton, (!canComplete || isSubstepLocked) && styles.disabledButton]}
                                                                            onPress={() => {
                                                                                if (!substep.startedAt) {
                                                                                    Alert.alert('Uyarı', 'Önce işe başlamalısınız.');
                                                                                    return;
                                                                                }
                                                                                if (photoCount < 1) {
                                                                                    Alert.alert('Uyarı', 'Tamamlamak için en az 1 fotoğraf yüklemelisiniz.');
                                                                                    return;
                                                                                }
                                                                                handleSubstepToggle(step.id, substep.id, false);
                                                                            }}
                                                                            disabled={!canComplete || isSubstepLocked}
                                                                        >
                                                                            <Text style={styles.btnText}>Tamamla</Text>
                                                                        </TouchableOpacity>
                                                                    )
                                                                ) : (
                                                                    <TouchableOpacity
                                                                        style={styles.undoButton}
                                                                        onPress={() => handleSubstepToggle(step.id, substep.id, true)}
                                                                    >
                                                                        <Text style={styles.btnText}>Geri Al</Text>
                                                                    </TouchableOpacity>
                                                                )}
                                                            </View>
                                                        )}

                                                        {['ADMIN', 'MANAGER'].includes(user?.role?.toUpperCase()) && (substep.isCompleted || substep.approvalStatus !== 'PENDING') && (
                                                            <View style={styles.substepManagerActions}>
                                                                <TouchableOpacity
                                                                    style={[styles.miniActionButton, styles.rejectButton]}
                                                                    onPress={() => openSubstepRejectionModal(substep.id)}
                                                                >
                                                                    <MaterialIcons name="close" size={16} color={theme.colors.textInverse || '#fff'} />
                                                                </TouchableOpacity>
                                                                <TouchableOpacity
                                                                    style={[styles.miniActionButton, styles.approveButton]}
                                                                    onPress={() => handleApproveSubstep(substep.id)}
                                                                >
                                                                    <MaterialIcons name="check" size={16} color={theme.colors.textInverse || '#fff'} />
                                                                </TouchableOpacity>
                                                            </View>
                                                        )}
                                                    </View>

                                                    {!isSubstepLocked && !substep.isCompleted && !['ADMIN', 'MANAGER'].includes(user?.role?.toUpperCase()) && (
                                                        <View style={styles.stepPhotoContainer}>
                                                            <Text style={[styles.photoCountText, { color: theme.colors.subText }]}>
                                                                Fotoğraflar ({photoCount}/3)
                                                            </Text>
                                                            {canUpload ? (
                                                                <View style={styles.photoButtonsContainer}>
                                                                    <TouchableOpacity
                                                                        style={styles.photoIconBtn}
                                                                        onPress={() => pickImage(step.id, substep.id, 'camera')}
                                                                    >
                                                                        <MaterialIcons name="camera-alt" size={20} color={theme.colors.primary} />
                                                                    </TouchableOpacity>
                                                                    <TouchableOpacity
                                                                        style={styles.photoIconBtn}
                                                                        onPress={() => pickImage(step.id, substep.id, 'gallery')}
                                                                    >
                                                                        <MaterialIcons name="photo-library" size={20} color={theme.colors.primary} />
                                                                    </TouchableOpacity>
                                                                </View>
                                                            ) : (
                                                                !substep.startedAt && <Text style={[styles.lockedText, { color: theme.colors.subText }]}>Fotoğraf yüklemek için başlayın</Text>
                                                            )}
                                                        </View>
                                                    )}

                                                    {substepPhotos.length > 0 && (
                                                        <ScrollView horizontal style={styles.thumbnailsContainer} showsHorizontalScrollIndicator={false}>
                                                            {substepPhotos.map((photo, pIndex) => (
                                                                <TouchableOpacity key={pIndex} onPress={() => openImageModal(photo.url || photo)}>
                                                                    <Image source={{ uri: photo.url || photo }} style={styles.thumbnail} />
                                                                </TouchableOpacity>
                                                            ))}
                                                        </ScrollView>
                                                    )}
                                                </GlassCard>
                                            );
                                        })}
                                    </View>
                                )}

                                {(!step.subSteps || step.subSteps.length === 0) && !['ADMIN', 'MANAGER'].includes(user?.role?.toUpperCase()) && (
                                    <View style={{ marginTop: 12 }}>
                                        <View style={styles.actionButtons}>
                                            {!step.isCompleted ? (
                                                !step.startedAt ? (
                                                    <TouchableOpacity
                                                        style={[styles.startButton, isLocked && styles.disabledButton]}
                                                        onPress={() => handleStartStep(step.id)}
                                                        disabled={isLocked}
                                                    >
                                                        <Text style={styles.btnText}>Başla</Text>
                                                    </TouchableOpacity>
                                                ) : (
                                                    <TouchableOpacity
                                                        style={[styles.completeButton, ((step.photos?.length || 0) < 1 || isLocked) && styles.disabledButton]}
                                                        onPress={() => {
                                                            if (!step.startedAt) {
                                                                Alert.alert('Uyarı', 'Önce işe başlamalısınız.');
                                                                return;
                                                            }
                                                            if ((step.photos?.length || 0) < 1) {
                                                                Alert.alert('Uyarı', 'Tamamlamak için en az 1 fotoğraf yüklemelisiniz.');
                                                                return;
                                                            }
                                                            handleToggleStep(step.id, false);
                                                        }}
                                                        disabled={(step.photos?.length || 0) < 1 || isLocked}
                                                    >
                                                        <Text style={styles.btnText}>Tamamla</Text>
                                                    </TouchableOpacity>
                                                )
                                            ) : (
                                                <TouchableOpacity
                                                    style={styles.undoButton}
                                                    onPress={() => handleToggleStep(step.id, true)}
                                                >
                                                    <Text style={styles.btnText}>Geri Al</Text>
                                                </TouchableOpacity>
                                            )}
                                        </View>

                                        {!step.isCompleted && (
                                            <View style={styles.stepPhotoContainer}>
                                                <Text style={[styles.photoCountText, { color: theme.colors.subText }]}>
                                                    Fotoğraflar ({step.photos?.length || 0}/3)
                                                </Text>
                                                {step.startedAt && (step.photos?.length || 0) < 3 ? (
                                                    <View style={styles.photoButtonsContainer}>
                                                        <TouchableOpacity
                                                            style={styles.photoIconBtn}
                                                            onPress={() => pickImage(step.id, null, 'camera')}
                                                        >
                                                            <MaterialIcons name="camera-alt" size={20} color={theme.colors.primary} />
                                                        </TouchableOpacity>
                                                        <TouchableOpacity
                                                            style={styles.photoIconBtn}
                                                            onPress={() => pickImage(step.id, null, 'gallery')}
                                                        >
                                                            <MaterialIcons name="photo-library" size={20} color={theme.colors.primary} />
                                                        </TouchableOpacity>
                                                    </View>
                                                ) : (
                                                    !step.startedAt && <Text style={[styles.lockedText, { color: theme.colors.subText }]}>Fotoğraf yüklemek için başlayın</Text>
                                                )}
                                            </View>
                                        )}

                                        {step.photos && step.photos.length > 0 && (
                                            <ScrollView horizontal style={styles.thumbnailsContainer} showsHorizontalScrollIndicator={false}>
                                                {step.photos.map((photo, pIndex) => (
                                                    <TouchableOpacity key={pIndex} onPress={() => openImageModal(photo.url || photo)}>
                                                        <Image source={{ uri: photo.url || photo }} style={styles.thumbnail} />
                                                    </TouchableOpacity>
                                                ))}
                                            </ScrollView>
                                        )}
                                    </View>
                                )}
                            </GlassCard>
                        );

                    })}

                    {/* Costs Section */}
                    <CostSection
                        job={job}
                        canAdd={!['ADMIN', 'MANAGER'].includes(user?.role?.toUpperCase())}
                        onAddPress={() => setCostModalVisible(true)}
                    />

                    <View style={{ height: 100 }} />
                </ScrollView>
            </PageWrapper>

            {/* Footer Actions */}
            <View style={[styles.footer, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
                {!['ADMIN', 'MANAGER'].includes(user?.role?.toUpperCase()) ? (
                    job.status === 'PENDING' ? (
                        <TouchableOpacity
                            style={[styles.mainCompleteButton, { backgroundColor: theme.colors.primary }]}
                            onPress={handleStartJob}
                        >
                            <Text style={[styles.mainCompleteButtonText, { color: theme.colors.textInverse }]}>İşi Başlat</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={[styles.mainCompleteButton, (job.status === 'COMPLETED' || completing) && styles.disabledButton, { backgroundColor: (job.status === 'COMPLETED' || completing) ? theme.colors.disabled : theme.colors.primary }]}
                            onPress={() => {
                                console.log('[MOBILE] Complete Job button pressed');
                                handleCompleteJob();
                            }}
                            disabled={job.status === 'COMPLETED' || completing}
                        >
                            {completing ? (
                                <ActivityIndicator color={theme.colors.textInverse} />
                            ) : (
                                <Text style={[styles.mainCompleteButtonText, { color: theme.colors.textInverse }]}>
                                    {job.status === 'COMPLETED' ? "İş Tamamlandı" : "İşi Tamamla"}
                                </Text>
                            )}
                        </TouchableOpacity>
                    )
                ) : (
                    <View style={{ width: '100%', flexDirection: 'row', gap: 12 }}>
                        <View style={{ flex: 1 }}>
                            <View style={styles.acceptanceStatusContainer}>
                                <Text style={[styles.acceptanceStatusLabel, { color: theme.colors.text }]}>Durum:</Text>
                                <Text style={[
                                    styles.acceptanceStatusValue,
                                    job.acceptanceStatus === 'ACCEPTED' ? { color: theme.colors.success } :
                                        job.acceptanceStatus === 'REJECTED' ? { color: theme.colors.error } : { color: theme.colors.warning }
                                ]}>
                                    {job.acceptanceStatus === 'ACCEPTED' ? 'KABUL' :
                                        job.acceptanceStatus === 'REJECTED' ? 'RED' : 'BEKLİYOR'}
                                </Text>
                            </View>
                            <View style={{ flexDirection: 'row', gap: 8 }}>
                                <TouchableOpacity
                                    style={[styles.mainCompleteButton, styles.rejectButton, { flex: 1, padding: 12, backgroundColor: theme.colors.error }]}
                                    onPress={() => {
                                        setSelectedStepId(null);
                                        setSelectedSubstepId(null);
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
                        </View>
                    </View>
                )}
            </View>

            <AppModal visible={modalVisible} transparent={true} onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalContainer}>
                    <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                        <MaterialIcons name="close" size={30} color={COLORS.white} />
                    </TouchableOpacity>
                    {selectedImage && (
                        <Image source={{ uri: selectedImage }} style={styles.fullImage} resizeMode="contain" />
                    )}
                </View>
            </AppModal>

            <AppModal visible={costModalVisible} transparent={true} animationType="slide" onRequestClose={() => setCostModalVisible(false)}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.modalContainer}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.formCard}>
                            <Text style={styles.modalTitle}>Masraf Ekle</Text>
                            <Text style={styles.inputLabel}>Tarih</Text>
                            <TouchableOpacity
                                style={styles.dateSelector}
                                onPress={() => setShowDatePicker(true)}
                            >
                                <MaterialIcons name="event" size={24} color={COLORS.textGray} />
                                <Text style={styles.dateText}>
                                    {costDate.toLocaleDateString('tr-TR')}
                                </Text>
                            </TouchableOpacity>
                            {showDatePicker && (
                                <DateTimePicker
                                    value={costDate}
                                    mode="date"
                                    display="default"
                                    onChange={(event, selectedDate) => {
                                        setShowDatePicker(Platform.OS === 'ios');
                                        if (selectedDate) {
                                            setCostDate(selectedDate);
                                        }
                                    }}
                                />
                            )}

                            <Text style={styles.inputLabel}>Tutar (TL)</Text>
                            <WebInput
                                style={styles.input}
                                value={costAmount}
                                onChangeText={setCostAmount}
                                inputMode="decimal"
                                placeholder="0.00"
                            />
                            <Text style={styles.inputLabel}>Kategori</Text>
                            <View style={styles.categoryContainer}>
                                {COST_CATEGORIES.map(cat => (
                                    <TouchableOpacity
                                        key={cat}
                                        style={[styles.categoryChip, costCategory === cat && styles.categoryChipSelected]}
                                        onPress={() => setCostCategory(cat)}
                                    >
                                        <Text style={[styles.categoryText, costCategory === cat && styles.categoryTextSelected]}>{cat}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <Text style={styles.inputLabel}>Açıklama</Text>
                            <WebInput
                                style={[styles.input, styles.textArea]}
                                value={costDescription}
                                onChangeText={setCostDescription}
                                inputMode="text"
                                multiline
                                numberOfLines={3}
                                placeholder="Masraf detayları..."
                            />

                            <Text style={styles.inputLabel}>Fiş/Fatura Fotoğrafı</Text>
                            <TouchableOpacity
                                style={styles.imageUploadButton}
                                onPress={async () => {
                                    const result = await ImagePicker.launchImageLibraryAsync({
                                        mediaTypes: ImagePicker.MediaTypeOptions.Images,
                                        allowsEditing: true,
                                        aspect: [4, 3],
                                        quality: 0.5,
                                    });

                                    if (!result.canceled) {
                                        setReceiptImage(result.assets[0].uri);
                                    }
                                }}
                            >
                                {receiptImage ? (
                                    <Image source={{ uri: receiptImage }} style={styles.previewImage} />
                                ) : (
                                    <View style={styles.uploadPlaceholder}>
                                        <MaterialIcons name="add-a-photo" size={32} color={COLORS.textGray} />
                                        <Text style={styles.uploadText}>Fotoğraf Ekle</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                            {receiptImage && (
                                <TouchableOpacity
                                    style={styles.removeImageButton}
                                    onPress={() => setReceiptImage(null)}
                                >
                                    <Text style={styles.removeImageText}>Fotoğrafı Kaldır</Text>
                                </TouchableOpacity>
                            )}

                            <View style={styles.modalButtons}>
                                <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setCostModalVisible(false)}>
                                    <Text style={styles.cancelButtonText}>İptal</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.modalButton, styles.submitButton]} onPress={handleCreateCost} disabled={submittingCost}>
                                    {submittingCost ? <ActivityIndicator color={COLORS.black} /> : <Text style={styles.submitButtonText}>Kaydet</Text>}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </AppModal>

            <AppModal visible={rejectionModalVisible} transparent={true} animationType="slide" onRequestClose={() => setRejectionModalVisible(false)}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.modalContainer}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.formCard}>
                            <Text style={styles.modalTitle}>
                                {selectedSubstepId ? 'Alt Görevi Reddet' : selectedStepId ? 'İş Adımını Reddet' : 'İşi Reddet'}
                            </Text>
                            <Text style={styles.inputLabel}>Red Sebebi</Text>
                            <WebInput
                                style={[styles.input, styles.textArea]}
                                value={rejectionReason}
                                onChangeText={setRejectionReason}
                                inputMode="text"
                                multiline
                                numberOfLines={3}
                                placeholder="Lütfen red sebebini belirtin..."
                            />
                            <View style={styles.modalButtons}>
                                <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setRejectionModalVisible(false)}>
                                    <Text style={styles.cancelButtonText}>İptal</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.modalButton, styles.rejectButton]} onPress={selectedSubstepId ? handleRejectSubstep : selectedStepId ? handleRejectStep : handleRejectJob}>
                                    <Text style={styles.actionButtonText}>Reddet</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </AppModal>

            {
                uploading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={styles.loadingText}>Yükleniyor...</Text>
                    </View>
                )
            }
            <ConfirmationModal
                visible={confirmationModalVisible}
                title="İşi Tamamla"
                message="İşi tamamlamak istediğinize emin misiniz? Bu işlem geri alınamaz."
                onConfirm={confirmCompleteJob}
                onCancel={() => setConfirmationModalVisible(false)}
                confirmText="Tamamla"
                cancelText="İptal"
                type="warning"
            />

            <SuccessModal
                visible={successModalVisible}
                message={successMessage}
                onClose={() => setSuccessModalVisible(false)}
            />

        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.backgroundDark,
        ...(Platform.OS === 'web' && {
            height: '100vh',
            overflow: 'hidden',
        }),
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor handled by theme view container
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    contentContainer: {
        padding: 16,
    },
    card: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        // Background and border handled by GlassCard/Theme
    },
    jobTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoText: {
        marginLeft: 8,
        fontSize: 14,
    },
    description: {
        fontSize: 14,
        lineHeight: 20,
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        marginTop: 8,
    },
    stepCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        // Background and border handled by GlassCard/Theme
    },
    lockedCard: {
        opacity: 0.5,
    },
    stepHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: COLORS.primary,
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkedBox: {
        backgroundColor: COLORS.primary,
    },
    stepTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    completedText: {
        color: COLORS.primary,
    },
    substepsContainer: {
        marginTop: 12,
        paddingLeft: 12,
        borderLeftWidth: 1,
        borderLeftColor: COLORS.cardBorder,
    },
    substepWrapper: {
        marginBottom: 16,
    },
    substepRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    substepInfo: {
        flex: 1,
    },
    substepText: {
        fontSize: 15,
        marginBottom: 4,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    completeButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    startButton: {
        backgroundColor: COLORS.blue500,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    undoButton: {
        backgroundColor: COLORS.cardBorder,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    btnText: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.black,
    },
    disabledButton: {
        opacity: 0.5,
    },
    stepPhotoContainer: {
        marginTop: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    photoCountText: {
        fontSize: 12,
        color: COLORS.textGray,
    },
    photoButtonsContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    photoIconBtn: {
        padding: 8,
        backgroundColor: 'rgba(204, 255, 4, 0.1)',
        borderRadius: 8,
    },
    thumbnailsContainer: {
        marginTop: 8,
        flexDirection: 'row',
    },
    thumbnail: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 8,
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        marginTop: 8,
    },
    addCostButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    addCostButtonText: {
        color: COLORS.black,
        fontWeight: '600',
        fontSize: 14,
        marginLeft: 4,
    },
    costCard: {
        backgroundColor: COLORS.cardDark,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
    },
    costHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    costCategory: {
        color: COLORS.primary,
        fontWeight: '600',
    },
    costRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    costAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textLight,
    },
    costDate: {
        color: COLORS.textGray,
    },
    costDescription: {
        color: COLORS.textGray,
        fontSize: 14,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.backgroundDark,
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: COLORS.cardBorder,
    },
    mainCompleteButton: {
        backgroundColor: COLORS.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    mainCompleteButtonText: {
        color: COLORS.black,
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        padding: 20,
        ...(Platform.OS === 'web' && {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
        }),
    },
    formCard: {
        backgroundColor: COLORS.cardDark,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.textLight,
        marginBottom: 20,
        textAlign: 'center',
    },
    inputLabel: {
        color: COLORS.textGray,
        marginBottom: 8,
        fontSize: 14,
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
        borderRadius: 8,
        padding: 12,
        color: COLORS.textLight,
        marginBottom: 16,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    categoryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
    },
    categoryChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
    },
    categoryChipSelected: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    categoryText: {
        color: COLORS.textGray,
        fontSize: 12,
    },
    categoryTextSelected: {
        color: COLORS.black,
        fontWeight: '600',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    modalButton: {
        flex: 1,
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: COLORS.cardBorder,
    },
    submitButton: {
        backgroundColor: COLORS.primary,
    },
    cancelButtonText: {
        color: COLORS.textLight,
        fontWeight: '600',
    },
    submitButtonText: {
        color: COLORS.black,
        fontWeight: 'bold',
    },
    closeButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        zIndex: 10,
    },
    fullImage: {
        width: '100%',
        height: '80%',
    },
    loadingOverlay: {
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: COLORS.primary,
        marginTop: 12,
        fontSize: 16,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        marginLeft: 8,
        borderWidth: 1,
    },
    smallBadge: {
        transform: [{ scale: 0.9 }],
    },
    badgeApproved: {
        borderColor: COLORS.green500,
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
    },
    badgeRejected: {
        borderColor: COLORS.red500,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
    },
    badgePending: {
        borderColor: COLORS.blue500,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
    },
    statusBadgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: COLORS.textLight,
    },
    lockedText: {
        color: COLORS.textGray,
        fontSize: 12,
        fontStyle: 'italic',
        marginTop: 4,
    },
    rejectionReasonText: {
        color: COLORS.red500,
        fontSize: 12,
        marginTop: 8,
        padding: 8,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderRadius: 4,
    },
    managerActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 8,
        marginTop: 12,
    },
    substepManagerActions: {
        flexDirection: 'row',
        gap: 4,
    },
    actionButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    miniActionButton: {
        padding: 4,
        borderRadius: 4,
        marginLeft: 4,
    },
    approveButton: {
        backgroundColor: COLORS.green500,
    },
    rejectButton: {
        backgroundColor: COLORS.red500,
    },
    actionButtonText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: '600',
    },
    emptyText: {
        color: COLORS.textGray,
        textAlign: 'center',
        marginTop: 20,
        fontStyle: 'italic',
    },
    acceptanceStatusContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        padding: 12,
        backgroundColor: COLORS.cardDark,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
    },
    acceptanceStatusLabel: {
        color: COLORS.textLight,
        fontWeight: '600',
    },
    acceptanceStatusValue: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    statusApproved: { color: COLORS.green500 },
    statusRejected: { color: COLORS.red500 },
    statusPending: { color: COLORS.blue500 },
    acceptJobButton: {
        backgroundColor: COLORS.green500,
    },
    dateText: {
        fontSize: 12,
        color: COLORS.textGray,
        marginTop: 2,
    },
    dateSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        gap: 8,
    },
    imageUploadButton: {
        height: 200,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
        borderStyle: 'dashed',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        overflow: 'hidden',
    },
    uploadPlaceholder: {
        alignItems: 'center',
        gap: 8,
    },
    uploadText: {
        color: COLORS.textGray,
        fontSize: 14,
    },
    previewImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    removeImageButton: {
        alignItems: 'center',
        padding: 8,
        marginBottom: 16,
    },
    removeImageText: {
        color: COLORS.red500,
        fontSize: 14,
    },
});
