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
    SafeAreaView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import jobService from '../../services/job.service';
import costService from '../../services/cost.service';
import authService from '../../services/auth.service';
import SuccessModal from '../../components/SuccessModal';
import ConfirmationModal from '../../components/ConfirmationModal';

const COLORS = {
    primary: "#CCFF04",
    backgroundLight: "#f8f8f5",
    backgroundDark: "#010100",
    cardDark: "#111827", // gray-900
    cardBorder: "#1f2937", // gray-800
    textLight: "#f8fafc", // slate-50
    textGray: "#94a3b8", // slate-400
    red500: "#ef4444",
    red900: "#7f1d1d",
    green500: "#22c55e",
    orange500: "#f97316",
    blue500: "#3b82f6",
    black: "#000000",
    white: "#ffffff",
};



export default function JobDetailScreen({ route, navigation }) {
    const { jobId } = route.params;
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [successModalVisible, setSuccessModalVisible] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [confirmationModalVisible, setConfirmationModalVisible] = useState(false);

    // Cost State
    const [costModalVisible, setCostModalVisible] = useState(false);
    const [costAmount, setCostAmount] = useState('');
    const [costCategory, setCostCategory] = useState('Yemek');
    const [costDescription, setCostDescription] = useState('');
    const [costDate, setCostDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [submittingCost, setSubmittingCost] = useState(false);
    const [userRole, setUserRole] = useState(null);

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
        checkUserRole();
    }, [jobId]);

    const checkUserRole = async () => {
        try {
            const user = await authService.getProfile();
            if (user) {
                setUserRole(user.role);
            }
        } catch (error) {
            console.error('JobDetailScreen: Error fetching user profile:', error);
        }
    };

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
            await costService.create({
                jobId: job.id,
                amount: parseFloat(costAmount),
                amount: parseFloat(costAmount),
                category: costCategory,
                description: costDescription,
                date: costDate.toISOString(),
                currency: 'TRY'
            });

            Alert.alert('Başarılı', 'Masraf eklendi ve onaya gönderildi.');
            setCostModalVisible(false);
            setCostAmount('');
            setCostDescription('');
            setCostCategory('Yemek');
            setCostDate(new Date());
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
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (!job) {
        return (
            <View style={styles.centerContainer}>
                <Text style={{ color: COLORS.textLight }}>İş bulunamadı.</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.backgroundDark} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>İş Detayı</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.contentContainer}>
                {/* Job Info Card */}
                <View style={styles.card}>
                    <Text style={styles.jobTitle}>{job.title}</Text>
                    <View style={styles.infoRow}>
                        <MaterialIcons name="business" size={16} color={COLORS.textGray} />
                        <Text style={styles.infoText}>Müşteri: {job.customer?.name || 'Müşteri'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <MaterialIcons name="description" size={16} color={COLORS.textGray} />
                        <Text style={styles.description}>{job.description}</Text>
                    </View>
                    {job.startedAt && (
                        <View style={styles.infoRow}>
                            <MaterialIcons name="play-circle-outline" size={16} color={COLORS.primary} />
                            <Text style={styles.infoText}>Başlangıç: {formatDate(job.startedAt)}</Text>
                        </View>
                    )}
                    {job.completedDate && (
                        <View style={styles.infoRow}>
                            <MaterialIcons name="check-circle-outline" size={16} color={COLORS.green500} />
                            <Text style={styles.infoText}>Bitiş: {formatDate(job.completedDate)}</Text>
                        </View>
                    )}
                </View>


                {/* Assignments Section */}
                <Text style={styles.sectionTitle}>Ekip ve Atamalar</Text>
                {job.assignments && job.assignments.length > 0 ? (
                    job.assignments.map((assignment, index) => (
                        <View key={index} style={styles.card}>
                            <View style={styles.infoRow}>
                                <MaterialIcons name="group" size={20} color={COLORS.primary} />
                                <View style={{ marginLeft: 8 }}>
                                    {assignment.team ? (
                                        <>
                                            <Text style={[styles.infoText, { fontWeight: 'bold' }]}>{assignment.team.name}</Text>
                                            {assignment.team.members && assignment.team.members.length > 0 && (
                                                <Text style={[styles.infoText, { fontSize: 12, color: COLORS.textGray, marginTop: 4 }]}>
                                                    {assignment.team.members.map(m => m.user?.name).filter(Boolean).join(', ')}
                                                </Text>
                                            )}
                                        </>
                                    ) : (
                                        <Text style={styles.infoText}>{assignment.worker?.name}</Text>
                                    )}
                                </View>
                            </View>
                        </View>
                    ))
                ) : (
                    <View style={styles.card}>
                        <Text style={styles.infoText}>Atama bulunamadı.</Text>
                    </View>
                )}

                {/* Steps Section */}
                <Text style={styles.sectionTitle}>İş Adımları</Text>
                {job.steps && job.steps.map((step, index) => {
                    const isLocked = index > 0 && !job.steps[index - 1].isCompleted;

                    return (
                        <View key={step.id} style={[styles.stepCard, isLocked && styles.lockedCard]}>
                            <View style={styles.stepHeader}>
                                <View style={[styles.checkbox, step.isCompleted && styles.checkedBox]}>
                                    {step.isCompleted && <MaterialIcons name="check" size={16} color={COLORS.black} />}
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.stepTitle, step.isCompleted && styles.completedText]}>
                                        {step.title || step.name}
                                    </Text>
                                    {step.startedAt && (
                                        <Text style={styles.dateText}>
                                            Başladı: {formatDate(step.startedAt)}
                                        </Text>
                                    )}
                                    {step.completedAt && (
                                        <Text style={styles.dateText}>
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
                                {isLocked && <MaterialIcons name="lock" size={20} color={COLORS.textGray} />}
                            </View>

                            {step.approvalStatus === 'REJECTED' && step.rejectionReason && (
                                <Text style={styles.rejectionReasonText}>Red Sebebi: {step.rejectionReason}</Text>
                            )}

                            {['ADMIN', 'MANAGER'].includes(userRole?.toUpperCase()) && (step.isCompleted || step.approvalStatus !== 'PENDING') && (
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
                                            <View key={substep.id} style={[styles.substepWrapper, isSubstepLocked && styles.lockedCard]}>
                                                <View style={styles.substepRow}>
                                                    <View style={styles.substepInfo}>
                                                        <Text style={[styles.substepText, substep.isCompleted && styles.completedText]}>
                                                            {substep.title || substep.name}
                                                        </Text>
                                                        {substep.startedAt && (
                                                            <Text style={styles.dateText}>
                                                                Başladı: {formatDate(substep.startedAt)}
                                                            </Text>
                                                        )}
                                                        {substep.completedAt && (
                                                            <Text style={styles.dateText}>
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
                                                        {isSubstepLocked && <Text style={styles.lockedText}>(Önceki adımı tamamlayın)</Text>}
                                                    </View>

                                                    {!['ADMIN', 'MANAGER'].includes(userRole?.toUpperCase()) && (
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

                                                    {['ADMIN', 'MANAGER'].includes(userRole?.toUpperCase()) && (substep.isCompleted || substep.approvalStatus !== 'PENDING') && (
                                                        <View style={styles.substepManagerActions}>
                                                            <TouchableOpacity
                                                                style={[styles.miniActionButton, styles.rejectButton]}
                                                                onPress={() => openSubstepRejectionModal(substep.id)}
                                                            >
                                                                <MaterialIcons name="close" size={16} color={COLORS.white} />
                                                            </TouchableOpacity>
                                                            <TouchableOpacity
                                                                style={[styles.miniActionButton, styles.approveButton]}
                                                                onPress={() => handleApproveSubstep(substep.id)}
                                                            >
                                                                <MaterialIcons name="check" size={16} color={COLORS.white} />
                                                            </TouchableOpacity>
                                                        </View>
                                                    )}
                                                </View>

                                                {!isSubstepLocked && !substep.isCompleted && !['ADMIN', 'MANAGER'].includes(userRole?.toUpperCase()) && (
                                                    <View style={styles.stepPhotoContainer}>
                                                        <Text style={styles.photoCountText}>
                                                            Fotoğraflar ({photoCount}/3)
                                                        </Text>
                                                        {canUpload ? (
                                                            <View style={styles.photoButtonsContainer}>
                                                                <TouchableOpacity
                                                                    style={styles.photoIconBtn}
                                                                    onPress={() => pickImage(step.id, substep.id, 'camera')}
                                                                >
                                                                    <MaterialIcons name="camera-alt" size={20} color={COLORS.primary} />
                                                                </TouchableOpacity>
                                                                <TouchableOpacity
                                                                    style={styles.photoIconBtn}
                                                                    onPress={() => pickImage(step.id, substep.id, 'gallery')}
                                                                >
                                                                    <MaterialIcons name="photo-library" size={20} color={COLORS.primary} />
                                                                </TouchableOpacity>
                                                            </View>
                                                        ) : (
                                                            !substep.startedAt && <Text style={styles.lockedText}>Fotoğraf yüklemek için başlayın</Text>
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
                                            </View>
                                        );
                                    })}
                                </View>
                            )}

                            {(!step.subSteps || step.subSteps.length === 0) && !['ADMIN', 'MANAGER'].includes(userRole?.toUpperCase()) && (
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
                                            <Text style={styles.photoCountText}>
                                                Fotoğraflar ({step.photos?.length || 0}/3)
                                            </Text>
                                            {step.startedAt && (step.photos?.length || 0) < 3 ? (
                                                <View style={styles.photoButtonsContainer}>
                                                    <TouchableOpacity
                                                        style={styles.photoIconBtn}
                                                        onPress={() => pickImage(step.id, null, 'camera')}
                                                    >
                                                        <MaterialIcons name="camera-alt" size={20} color={COLORS.primary} />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        style={styles.photoIconBtn}
                                                        onPress={() => pickImage(step.id, null, 'gallery')}
                                                    >
                                                        <MaterialIcons name="photo-library" size={20} color={COLORS.primary} />
                                                    </TouchableOpacity>
                                                </View>
                                            ) : (
                                                !step.startedAt && <Text style={styles.lockedText}>Fotoğraf yüklemek için başlayın</Text>
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
                        </View>
                    );
                })}

                {/* Costs Section */}
                <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>Masraflar</Text>
                    {!['ADMIN', 'MANAGER'].includes(userRole?.toUpperCase()) && (
                        <TouchableOpacity
                            style={styles.addCostButton}
                            onPress={() => setCostModalVisible(true)}
                        >
                            <MaterialIcons name="add" size={20} color={COLORS.black} />
                            <Text style={styles.addCostButtonText}>Ekle</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {job.costs && job.costs.length > 0 ? (
                    job.costs.map((cost) => (
                        <View key={cost.id} style={styles.costCard}>
                            <View style={styles.costHeader}>
                                <Text style={styles.costCategory}>{cost.category}</Text>
                                <Text style={[
                                    styles.costStatus,
                                    cost.status === 'APPROVED' ? styles.statusApproved :
                                        cost.status === 'REJECTED' ? styles.statusRejected : styles.statusPending
                                ]}>
                                    {cost.status === 'APPROVED' ? 'Onaylandı' :
                                        cost.status === 'REJECTED' ? 'Reddedildi' : 'Bekliyor'}
                                </Text>
                            </View>
                            <View style={styles.costRow}>
                                <Text style={styles.costAmount}>{cost.amount} {cost.currency}</Text>
                                <Text style={styles.costDate}>{new Date(cost.date).toLocaleDateString()}</Text>
                            </View>
                            <Text style={styles.costDescription}>{cost.description}</Text>
                            {cost.rejectionReason && (
                                <Text style={styles.rejectionReason}>Red Nedeni: {cost.rejectionReason}</Text>
                            )}
                        </View>
                    ))
                ) : (
                    <Text style={styles.emptyText}>Henüz masraf eklenmemiş.</Text>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Footer Actions */}
            <View style={styles.footer}>
                {!['ADMIN', 'MANAGER'].includes(userRole?.toUpperCase()) ? (
                    job.status === 'PENDING' ? (
                        <TouchableOpacity
                            style={styles.mainCompleteButton}
                            onPress={handleStartJob}
                        >
                            <Text style={styles.mainCompleteButtonText}>İşi Başlat</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={[styles.mainCompleteButton, (job.status === 'COMPLETED' || completing) && styles.disabledButton]}
                            onPress={() => {
                                console.log('[MOBILE] Complete Job button pressed');
                                handleCompleteJob();
                            }}
                            disabled={job.status === 'COMPLETED' || completing}
                        >
                            {completing ? (
                                <ActivityIndicator color={COLORS.black} />
                            ) : (
                                <Text style={styles.mainCompleteButtonText}>
                                    {job.status === 'COMPLETED' ? "İş Tamamlandı" : "İşi Tamamla"}
                                </Text>
                            )}
                        </TouchableOpacity>
                    )
                ) : (
                    <View style={{ width: '100%' }}>
                        <View style={styles.acceptanceStatusContainer}>
                            <Text style={styles.acceptanceStatusLabel}>Montaj Durumu:</Text>
                            <Text style={[
                                styles.acceptanceStatusValue,
                                job.acceptanceStatus === 'ACCEPTED' ? styles.statusApproved :
                                    job.acceptanceStatus === 'REJECTED' ? styles.statusRejected : styles.statusPending
                            ]}>
                                {job.acceptanceStatus === 'ACCEPTED' ? 'KABUL EDİLDİ' :
                                    job.acceptanceStatus === 'REJECTED' ? 'REDDEDİLDİ' : 'ONAY BEKLİYOR'}
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.mainCompleteButton, styles.acceptJobButton]}
                            onPress={handleAcceptJob}
                        >
                            <Text style={styles.mainCompleteButtonText}>Montajı Kabul Et</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <Modal visible={modalVisible} transparent={true} onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalContainer}>
                    <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                        <MaterialIcons name="close" size={30} color={COLORS.white} />
                    </TouchableOpacity>
                    {selectedImage && (
                        <Image source={{ uri: selectedImage }} style={styles.fullImage} resizeMode="contain" />
                    )}
                </View>
            </Modal>

            <Modal visible={costModalVisible} transparent={true} animationType="slide" onRequestClose={() => setCostModalVisible(false)}>
                <View style={styles.modalContainer}>
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
                        <TextInput
                            style={styles.input}
                            value={costAmount}
                            onChangeText={setCostAmount}
                            keyboardType="numeric"
                            placeholder="0.00"
                            placeholderTextColor={COLORS.textGray}
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
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={costDescription}
                            onChangeText={setCostDescription}
                            multiline
                            numberOfLines={3}
                            placeholder="Masraf detayları..."
                            placeholderTextColor={COLORS.textGray}
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setCostModalVisible(false)}>
                                <Text style={styles.cancelButtonText}>İptal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalButton, styles.submitButton]} onPress={handleCreateCost} disabled={submittingCost}>
                                {submittingCost ? <ActivityIndicator color={COLORS.black} /> : <Text style={styles.submitButtonText}>Kaydet</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal visible={rejectionModalVisible} transparent={true} animationType="slide" onRequestClose={() => setRejectionModalVisible(false)}>
                <View style={styles.modalContainer}>
                    <View style={styles.formCard}>
                        <Text style={styles.modalTitle}>{selectedSubstepId ? 'Alt Görevi Reddet' : 'İş Adımını Reddet'}</Text>
                        <Text style={styles.inputLabel}>Red Sebebi</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={rejectionReason}
                            onChangeText={setRejectionReason}
                            multiline
                            numberOfLines={3}
                            placeholder="Lütfen red sebebini belirtin..."
                            placeholderTextColor={COLORS.textGray}
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setRejectionModalVisible(false)}>
                                <Text style={styles.cancelButtonText}>İptal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalButton, styles.rejectButton]} onPress={selectedSubstepId ? handleRejectSubstep : handleRejectStep}>
                                <Text style={styles.actionButtonText}>Reddet</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

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
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.backgroundDark,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: COLORS.backgroundDark,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.cardBorder,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.textLight,
    },
    contentContainer: {
        padding: 16,
    },
    card: {
        backgroundColor: COLORS.cardDark,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
    },
    jobTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.textLight,
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoText: {
        color: COLORS.textGray,
        marginLeft: 8,
        fontSize: 14,
    },
    description: {
        color: COLORS.textGray,
        fontSize: 14,
        lineHeight: 20,
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textLight,
        marginBottom: 12,
        marginTop: 8,
    },
    stepCard: {
        backgroundColor: COLORS.cardDark,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
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
        color: COLORS.textLight,
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
        color: COLORS.textLight,
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
});
