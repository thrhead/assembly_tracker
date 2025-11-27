import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Linking, Platform, Modal, Image, TextInput } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import jobService from '../../services/job.service';
import costService from '../../services/cost.service';
import authService from '../../services/auth.service';

export default function JobDetailScreen({ route, navigation }) {
    const { jobId } = route.params;
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [uploading, setUploading] = useState(false);

    // Cost State
    const [costModalVisible, setCostModalVisible] = useState(false);
    const [costAmount, setCostAmount] = useState('');
    const [costCategory, setCostCategory] = useState('Yemek');
    const [costDescription, setCostDescription] = useState('');
    const [submittingCost, setSubmittingCost] = useState(false);
    const [userRole, setUserRole] = useState(null);

    // Rejection State
    const [rejectionModalVisible, setRejectionModalVisible] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [selectedStepId, setSelectedStepId] = useState(null);
    const [selectedSubstepId, setSelectedSubstepId] = useState(null);

    const COST_CATEGORIES = ['Yemek', 'Yakıt', 'Konaklama', 'Malzeme', 'Diğer'];

    useEffect(() => {
        loadJobDetails();
        checkUserRole();
    }, [jobId]);

    const checkUserRole = async () => {
        try {
            const user = await authService.getProfile();
            console.log('JobDetailScreen: Fetched user profile:', user);
            if (user) {
                console.log('JobDetailScreen: Setting userRole to:', user.role);
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
            // Optimistic update
            const isCompleted = !currentStatus; // Toggle

            // Call API
            await jobService.toggleSubstep(jobId, stepId, substepId, isCompleted);

            // Reload job to get updated state (including timestamps)
            loadJobDetails();
        } catch (error) {
            console.error('Error toggling substep:', error);
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

            // File name extraction
            const filename = uri.split('/').pop();
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image`;

            formData.append('photo', { uri, name: filename, type });

            await jobService.uploadPhotos(jobId, stepId, formData, substepId);

            Alert.alert('Başarılı', 'Fotoğraf yüklendi');
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

    const openSubstepRejectionModal = (substepId) => {
        setSelectedSubstepId(substepId);
        setRejectionModalVisible(true);
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
                            Alert.alert('Hata', 'Montaj kabul edilirken bir hata oluştu. Lütfen tüm adımların tamamlandığından emin olun.');
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
                category: costCategory,
                description: costDescription,
                currency: 'TRY'
            });

            Alert.alert('Başarılı', 'Masraf eklendi ve onaya gönderildi.');
            setCostModalVisible(false);
            setCostAmount('');
            setCostDescription('');
            setCostCategory('Yemek');
            loadJobDetails();
        } catch (error) {
            console.error('Error creating cost:', error);
            Alert.alert('Hata', 'Masraf eklenirken bir hata oluştu.');
        } finally {
            setSubmittingCost(false);
        }
    };

    const handleCompleteJob = async () => {
        // Check if all steps are completed
        const allStepsCompleted = job.steps.every(step => step.isCompleted);

        if (!allStepsCompleted) {
            Alert.alert("Uyarı", "İşi tamamlamak için tüm adımları bitirmelisiniz.");
            return;
        }

        Alert.alert(
            "İşi Tamamla",
            "İşi tamamlamak istediğinize emin misiniz?",
            [
                { text: "İptal", style: "cancel" },
                {
                    text: "Tamamla",
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await jobService.completeJob(jobId);
                            Alert.alert("Başarılı", "İş tamamlandı ve onaya gönderildi.", [
                                { text: "Tamam", onPress: () => navigation.goBack() }
                            ]);
                        } catch (error) {
                            console.error('Error completing job:', error);
                            Alert.alert('Hata', 'İş tamamlanırken bir hata oluştu');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const openMap = (location) => {
        const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
        Linking.openURL(url);
    };

    const callPhone = (phone) => {
        Linking.openURL(`tel:${phone}`);
    };

    const openImageModal = (uri) => {
        setSelectedImage(uri);
        setModalVisible(true);
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#16A34A" />
            </View>
        );
    }

    if (!job) {
        return (
            <View style={styles.centerContainer}>
                <Text>İş bulunamadı.</Text>
            </View>
        );
    }

    console.log('JobDetailScreen Render - userRole:', userRole);

    return (
        <View style={styles.container}>
            <ScrollView style={styles.container}>
                {/* Header Info */}
                <View style={styles.headerCard}>
                    <Text style={styles.title}>{job.title}</Text>

                    <Text style={styles.label}>Müşteri:</Text>

                    <Text style={styles.description}>{job.description}</Text>
                </View>

                {/* Steps & Checklist */}
                <Text style={styles.sectionTitle}>İş Adımları</Text>

                {
                    job.steps && job.steps.map((step, index) => {
                        const isLocked = index > 0 && !job.steps[index - 1].isCompleted;
                        console.log(`Rendering step ${step.id}: isCompleted=${step.isCompleted}, approvalStatus=${step.approvalStatus}, userRole=${userRole}`);

                        return (
                            <View key={step.id} style={[styles.stepCard, isLocked && styles.lockedCard]}>
                                <View style={styles.stepHeader}>
                                    <View style={[styles.checkbox, step.isCompleted && styles.checkedBox]}>
                                        {step.isCompleted && <Text style={styles.checkmark}>✓</Text>}
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.stepTitle, step.isCompleted && styles.completedText]}>
                                            {step.title || step.name}
                                        </Text>
                                        {/* Status Badge in Header */}
                                        {(step.approvalStatus && step.approvalStatus !== 'PENDING') && (
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
                                    {isLocked && <Text style={styles.lockedText}>(Kilitli)</Text>}
                                </View>

                                {/* Rejection Reason */}
                                {step.approvalStatus === 'REJECTED' && step.rejectionReason && (
                                    <Text style={styles.rejectionReasonText}>Red Sebebi: {step.rejectionReason}</Text>
                                )}

                                {/* Manager Actions - Always visible for completed or processed steps */}
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

                                {/* Substeps */}
                                {!isLocked && step.subSteps && (
                                    <View style={styles.substepsContainer}>
                                        {step.subSteps.map((substep, subIndex) => {
                                            const substepPhotos = substep.photos || [];
                                            const photoCount = substepPhotos.length;
                                            const isSubstepLocked = subIndex > 0 && !step.subSteps[subIndex - 1].isCompleted;
                                            const canComplete = photoCount >= 1;
                                            const canUpload = photoCount < 3;

                                            return (
                                                <View key={substep.id} style={[styles.substepWrapper, isSubstepLocked && styles.lockedCard]}>
                                                    <View style={styles.substepRow}>
                                                        <View style={styles.substepInfo}>
                                                            <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                                                                <Text style={[styles.substepText, substep.isCompleted && styles.completedText]}>
                                                                    {substep.title || substep.name}
                                                                </Text>
                                                                {/* Status Badge */}
                                                                {(substep.approvalStatus && substep.approvalStatus !== 'PENDING') && (
                                                                    <View style={[
                                                                        styles.statusBadge,
                                                                        styles.smallBadge,
                                                                        substep.approvalStatus === 'APPROVED' ? styles.badgeApproved : styles.badgeRejected
                                                                    ]}>
                                                                        <Text style={styles.statusBadgeText}>
                                                                            {substep.approvalStatus === 'APPROVED' ? 'ONAYLANDI' : 'REDDEDİLDİ'}
                                                                        </Text>
                                                                    </View>
                                                                )}
                                                            </View>

                                                            {isSubstepLocked && <Text style={styles.lockedText}>(Önceki adımı tamamlayın)</Text>}
                                                            {substep.startedAt && (
                                                                <Text style={styles.timeText}>
                                                                    {new Date(substep.startedAt).toLocaleTimeString()} - {substep.completedAt ? new Date(substep.completedAt).toLocaleTimeString() : '...'}
                                                                </Text>
                                                            )}

                                                            {substep.approvalStatus === 'REJECTED' && substep.rejectionReason && (
                                                                <Text style={styles.rejectionReasonText}>{substep.rejectionReason}</Text>
                                                            )}
                                                        </View>

                                                        {/* Action Buttons - ONLY FOR WORKERS */}
                                                        {!['ADMIN', 'MANAGER'].includes(userRole?.toUpperCase()) && (
                                                            <View style={styles.actionButtons}>
                                                                {!substep.isCompleted ? (
                                                                    <TouchableOpacity
                                                                        style={[styles.completeButton, (!canComplete || isSubstepLocked) && styles.disabledButton]}
                                                                        onPress={() => {
                                                                            if (!canComplete) {
                                                                                Alert.alert('Uyarı', 'Tamamlamak için en az 1 fotoğraf yüklemelisiniz.');
                                                                                return;
                                                                            }
                                                                            handleSubstepToggle(step.id, substep.id, false);
                                                                        }}
                                                                        disabled={!canComplete || isSubstepLocked}
                                                                    >
                                                                        <Text style={styles.btnText}>Tamamla</Text>
                                                                    </TouchableOpacity>
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

                                                        {/* Manager Actions for Sub-step - Always visible if completed or processed */}
                                                        {['ADMIN', 'MANAGER'].includes(userRole?.toUpperCase()) && (substep.isCompleted || substep.approvalStatus !== 'PENDING') && (
                                                            <View style={styles.substepManagerActions}>
                                                                <TouchableOpacity
                                                                    style={[styles.miniActionButton, styles.rejectButton, { width: 'auto', paddingHorizontal: 8, borderRadius: 4 }]}
                                                                    onPress={() => openSubstepRejectionModal(substep.id)}
                                                                >
                                                                    <Text style={[styles.miniActionButtonText, { fontSize: 12 }]}>Reddet</Text>
                                                                </TouchableOpacity>
                                                                <TouchableOpacity
                                                                    style={[styles.miniActionButton, styles.approveButton, { width: 'auto', paddingHorizontal: 8, borderRadius: 4 }]}
                                                                    onPress={() => handleApproveSubstep(substep.id)}
                                                                >
                                                                    <Text style={[styles.miniActionButtonText, { fontSize: 12 }]}>Onayla</Text>
                                                                </TouchableOpacity>
                                                            </View>
                                                        )}
                                                    </View>

                                                    {/* Substep Photo Upload */}
                                                    {!isSubstepLocked && !substep.isCompleted && !['ADMIN', 'MANAGER'].includes(userRole?.toUpperCase()) && (
                                                        <View style={styles.stepPhotoContainer}>
                                                            <Text style={styles.photoCountText}>
                                                                Fotoğraflar ({photoCount}/3)
                                                            </Text>
                                                            {canUpload && (
                                                                <View style={styles.photoButtonsContainer}>
                                                                    <TouchableOpacity
                                                                        style={styles.photoIconBtn}
                                                                        onPress={() => pickImage(step.id, substep.id, 'camera')}
                                                                    >
                                                                        <Text style={styles.photoIconText}>📷</Text>
                                                                    </TouchableOpacity>
                                                                    <TouchableOpacity
                                                                        style={styles.photoIconBtn}
                                                                        onPress={() => pickImage(step.id, substep.id, 'gallery')}
                                                                    >
                                                                        <Text style={styles.photoIconText}>🖼️</Text>
                                                                    </TouchableOpacity>
                                                                </View>
                                                            )}
                                                        </View>
                                                    )}

                                                    {/* Substep Thumbnails */}
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


                            </View>
                        );
                    })
                }

                {/* Costs Section */}
                <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>Masraflar</Text>
                    {!['ADMIN', 'MANAGER'].includes(userRole?.toUpperCase()) && (
                        <TouchableOpacity
                            style={styles.addCostButton}
                            onPress={() => setCostModalVisible(true)}
                        >
                            <Text style={styles.addCostButtonText}>+ Ekle</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {
                    job.costs && job.costs.length > 0 ? (
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
                    )
                }

                {!['ADMIN', 'MANAGER'].includes(userRole?.toUpperCase()) ? (
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[styles.mainCompleteButton, job.status === 'COMPLETED' && styles.disabledButton]}
                            onPress={handleCompleteJob}
                            disabled={job.status === 'COMPLETED'}
                        >
                            <Text style={styles.mainCompleteButtonText}>
                                {job.status === 'COMPLETED' ? "İş Tamamlandı" : "İşi Tamamla"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.footer}>
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
                            <Text style={styles.mainCompleteButtonText}>
                                Montajı Kabul Et
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>

            {/* Image Viewer Modal */}
            < Modal
                visible={modalVisible}
                transparent={true}
                onRequestClose={() => setModalVisible(false)
                }
            >
                <View style={styles.modalContainer}>
                    <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                        <Text style={styles.closeButtonText}>Kapat</Text>
                    </TouchableOpacity>
                    {selectedImage && (
                        <Image source={{ uri: selectedImage }} style={styles.fullImage} resizeMode="contain" />
                    )}
                </View>
            </Modal >

            {/* Add Cost Modal */}
            < Modal
                visible={costModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setCostModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.formCard}>
                        <Text style={styles.modalTitle}>Masraf Ekle</Text>

                        <Text style={styles.inputLabel}>Tutar (TL)</Text>
                        <TextInput
                            style={styles.input}
                            value={costAmount}
                            onChangeText={setCostAmount}
                            keyboardType="numeric"
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
                                    <Text style={[styles.categoryText, costCategory === cat && styles.categoryTextSelected]}>
                                        {cat}
                                    </Text>
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
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setCostModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>İptal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.submitButton]}
                                onPress={handleCreateCost}
                                disabled={submittingCost}
                            >
                                {submittingCost ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <Text style={styles.submitButtonText}>Kaydet</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal >

            {/* Rejection Modal */}
            <Modal
                visible={rejectionModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setRejectionModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.formCard}>
                        <Text style={styles.modalTitle}>
                            {selectedSubstepId ? 'Alt Görevi Reddet' : 'İş Adımını Reddet'}
                        </Text>
                        <Text style={styles.inputLabel}>Red Sebebi</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={rejectionReason}
                            onChangeText={setRejectionReason}
                            multiline
                            numberOfLines={3}
                            placeholder="Lütfen red sebebini belirtin..."
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setRejectionModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>İptal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.rejectButton]}
                                onPress={selectedSubstepId ? handleRejectSubstep : handleRejectStep}
                            >
                                <Text style={styles.actionButtonText}>Reddet</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {uploading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={styles.loadingText}>Yükleniyor...</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerCard: {
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#111827',
    },
    row: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    label: {
        width: 80,
        fontWeight: '600',
        color: '#4B5563',
    },
    value: {
        flex: 1,
        color: '#111827',
    },
    description: {
        marginTop: 8,
        color: '#6B7280',
        fontStyle: 'italic',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 16,
        marginBottom: 12,
        color: '#374151',
    },
    stepCard: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 12,
        padding: 16,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
            },
            android: {
                elevation: 2,
            },
            web: {
                boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
            }
        })
    },
    lockedCard: {
        opacity: 0.6,
        backgroundColor: '#F9FAFB',
    },
    stepHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    stepTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 12,
        flex: 1,
    },
    lockedText: {
        fontSize: 12,
        color: '#EF4444',
        fontStyle: 'italic',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkedBox: {
        backgroundColor: '#16A34A',
        borderColor: '#16A34A',
    },
    checkmark: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    substepsContainer: {
        marginLeft: 10,
        marginBottom: 12,
        borderLeftWidth: 2,
        borderLeftColor: '#E5E7EB',
        paddingLeft: 10,
    },
    substepWrapper: {
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        paddingVertical: 12,
    },
    substepRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    substepInfo: {
        flex: 1,
        marginRight: 10,
    },
    substepText: {
        fontSize: 14,
        color: '#374151',
        fontWeight: '500',
    },
    timeText: {
        fontSize: 11,
        color: '#6B7280',
        marginTop: 2,
    },
    completedText: {
        color: '#9CA3AF',
        textDecorationLine: 'line-through',
    },
    actionButtons: {
        width: 80,
        alignItems: 'flex-end',
    },
    completeButton: {
        backgroundColor: '#16A34A',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    undoButton: {
        backgroundColor: '#6B7280',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    btnText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    stepPhotoContainer: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    photoButtonsContainer: {
        flexDirection: 'row',
        marginTop: 8,
    },
    photoIconBtn: {
        padding: 8,
        backgroundColor: '#F3F4F6',
        borderRadius: 6,
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    photoIconText: {
        fontSize: 16,
    },
    photoCountText: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
    thumbnailsContainer: {
        flexDirection: 'row',
        marginTop: 8,
    },
    thumbnail: {
        width: 50,
        height: 50,
        borderRadius: 4,
        marginRight: 8,
        backgroundColor: '#E5E7EB',
    },
    footer: {
        padding: 16,
        paddingBottom: 32,
    },
    mainCompleteButton: {
        backgroundColor: '#16A34A',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    mainCompleteButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    disabledButton: {
        backgroundColor: '#9CA3AF',
    },
    linkText: {
        color: '#2563EB',
        textDecorationLine: 'underline',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullImage: {
        width: '90%',
        height: '80%',
    },
    closeButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        padding: 10,
        zIndex: 1,
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#fff',
        marginTop: 10,
        fontWeight: 'bold',
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginRight: 16,
    },
    addCostButton: {
        backgroundColor: '#E5E7EB',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    addCostButtonText: {
        color: '#374151',
        fontWeight: 'bold',
        fontSize: 12,
    },
    costCard: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: 8,
        padding: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#9CA3AF',
    },
    costHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    costCategory: {
        fontWeight: 'bold',
        color: '#374151',
    },
    costStatus: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    statusPending: { color: '#F59E0B' },
    approvalContainer: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    approvalStatus: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    rejectionReasonText: {
        fontSize: 12,
        color: '#EF4444',
        fontStyle: 'italic',
        marginBottom: 8,
    },
    managerActions: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 8,
    },
    actionButton: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 6,
        alignItems: 'center',
    },
    actionButtonText: {
        color: '#111827',
        fontWeight: 'bold',
        fontSize: 12,
    },
    // Reusing existing button styles where possible, but defining specific ones if needed
    rejectButton: {
        backgroundColor: '#FEE2E2',
    },
    approveButton: {
        backgroundColor: '#DCFCE7',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#111827',
        textAlign: 'center',
    },
    formCard: {
        backgroundColor: '#fff',
        width: '90%',
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 4,
    },
    input: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 6,
        padding: 10,
        marginBottom: 16,
        fontSize: 14,
        color: '#111827',
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 6,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#F3F4F6',
    },
    submitButton: {
        backgroundColor: '#16A34A',
    },
    cancelButtonText: {
        color: '#374151',
        fontWeight: 'bold',
    },
    submitButtonText: {
        color: '#fff',
        fontWeight: 'bold',
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
        borderRadius: 16,
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    categoryChipSelected: {
        backgroundColor: '#DCFCE7',
        borderColor: '#16A34A',
    },
    categoryText: {
        fontSize: 12,
        color: '#4B5563',
    },
    categoryTextSelected: {
        color: '#16A34A',
        fontWeight: 'bold',
    },
    statusApproved: { color: '#10B981' },
    statusRejected: { color: '#EF4444' },
    costRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    costAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
    },
    costDate: {
        fontSize: 12,
        color: '#6B7280',
    },
    costDescription: {
        color: '#4B5563',
        fontSize: 14,
    },
    rejectionReason: {
        color: '#EF4444',
        fontSize: 12,
        marginTop: 4,
        fontStyle: 'italic',
    },
    emptyText: {
        marginLeft: 16,
        color: '#6B7280',
        fontStyle: 'italic',
        marginBottom: 16,
    },
    substepApprovalContainer: {
        marginTop: 4,
    },
    substepManagerActions: {
        flexDirection: 'row',
        gap: 8,
        marginLeft: 8,
    },
    miniActionButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    miniActionButtonText: {
        color: '#111827',
        fontWeight: 'bold',
        fontSize: 14,
    },
    acceptJobButton: {
        backgroundColor: '#4F46E5', // Indigo color for distinction
        marginTop: 16,
    },
    acceptanceStatusContainer: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    acceptanceStatusLabel: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 4,
    },
    acceptanceStatusValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 8,
        alignSelf: 'flex-start',
    },
    smallBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
        marginLeft: 6,
    },
    badgeApproved: {
        backgroundColor: '#DCFCE7', // green-100
        borderWidth: 1,
        borderColor: '#16A34A', // green-600
    },
    badgeRejected: {
        backgroundColor: '#FEE2E2', // red-100
        borderWidth: 1,
        borderColor: '#DC2626', // red-600
    },
    statusBadgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#333',
    },
});
