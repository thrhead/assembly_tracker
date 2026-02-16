import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Modal,
    Image,
    Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import VoiceRecorder from '../../common/VoiceRecorder';
// Duplicate imports removed
// import { COLORS } from '../../../constants/theme'; // Removed legacy
import { CATEGORIES } from './ExpenseFilter';

// Safari iOS compatible input component
const WebInput = ({ style, value, onChangeText, placeholder, inputMode, theme, ...props }) => {
    if (Platform.OS === 'web') {
        return (
            <input
                type={inputMode === 'decimal' ? 'number' : 'text'}
                inputMode={inputMode}
                step={inputMode === 'decimal' ? '0.01' : undefined}
                value={value}
                onChange={(e) => onChangeText(e.target.value)}
                placeholder={placeholder}
                style={{
                    backgroundColor: theme.colors.surface,
                    borderRadius: 12,
                    padding: 16,
                    color: theme.colors.text,
                    fontSize: 16,
                    border: `1px solid ${theme.colors.border}`,
                    width: '100%',
                    boxSizing: 'border-box',
                    outline: 'none',
                    fontFamily: 'inherit',
                    ...StyleSheet.flatten(style)
                }}
            />
        );
    }
    return (
        <TextInput
            style={style}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.subText}
            {...props}
        />
    );
};

export const CreateExpenseModal = ({ visible, onClose, onSubmit, projects, defaultJobId, theme }) => {
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        category: 'Yemek',
        description: '',
        jobId: defaultJobId || '',
        date: new Date()
    });
    const [receiptImage, setReceiptImage] = useState(null);
    const [audioUri, setAudioUri] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Update jobId when default changes if not set
    React.useEffect(() => {
        if (defaultJobId && !formData.jobId) {
            setFormData(prev => ({ ...prev, jobId: defaultJobId }));
        }
    }, [defaultJobId]);

    const handleSubmit = async () => {
        const success = await onSubmit(formData, receiptImage, audioUri);
        if (success) {
            handleClose();
        }
    };

    const handleClose = () => {
        setFormData({
            title: '',
            amount: '',
            category: 'Yemek',
            description: '',
            jobId: defaultJobId || '',
            date: new Date()
        });
        setReceiptImage(null);
        setAudioUri(null);
        onClose();
    };

    // Safari iOS fix: don't render if not visible
    if (!visible) return null;

    const formContent = (
        <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <View style={styles.modalHeader}>
                    <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Yeni Masraf Ekle</Text>
                    <TouchableOpacity onPress={handleClose}>
                        <MaterialIcons name="close" size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                </View>

                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="none"
                >
                    <View style={styles.formGroup}>
                        <Text style={[styles.label, { color: theme.colors.subText }]}>Başlık</Text>
                        <WebInput
                            style={[styles.input, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]}
                            placeholder="Örn: Öğle Yemeği"
                            inputMode="text"
                            value={formData.title}
                            onChangeText={(text) => setFormData({ ...formData, title: text })}
                            theme={theme}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={[styles.label, { color: theme.colors.subText }]}>Tarih</Text>
                        <TouchableOpacity
                            style={[styles.dateSelector, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <MaterialIcons name="event" size={24} color={theme.colors.subText} />
                            <Text style={[styles.dateText, { color: theme.colors.text }]}>
                                {formData.date.toLocaleDateString('tr-TR')}
                            </Text>
                        </TouchableOpacity>
                        {showDatePicker && (
                            <DateTimePicker
                                value={formData.date}
                                mode="date"
                                display="default"
                                onChange={(event, selectedDate) => {
                                    setShowDatePicker(Platform.OS === 'ios');
                                    if (selectedDate) {
                                        setFormData({ ...formData, date: selectedDate });
                                    }
                                }}
                            />
                        )}
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={[styles.label, { color: theme.colors.subText }]}>Tutar (₺)</Text>
                        <WebInput
                            style={[styles.input, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]}
                            placeholder="0.00"
                            inputMode="decimal"
                            value={formData.amount}
                            onChangeText={(text) => setFormData({ ...formData, amount: text })}
                            theme={theme}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={[styles.label, { color: theme.colors.subText }]}>Kategori</Text>
                        <View style={styles.categorySelector}>
                            {CATEGORIES.filter(c => c.id !== 'Tümü').map((cat) => (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={[
                                        styles.categoryOption,
                                        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                                        formData.category === cat.id && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                                    ]}
                                    onPress={() => setFormData({ ...formData, category: cat.id })}
                                >
                                    <MaterialIcons
                                        name={cat.icon}
                                        size={20}
                                        color={formData.category === cat.id ? theme.colors.textInverse : theme.colors.subText}
                                    />
                                    <Text style={[
                                        styles.categoryOptionText,
                                        { color: theme.colors.subText },
                                        formData.category === cat.id && { color: theme.colors.textInverse, fontWeight: 'bold' }
                                    ]}>{cat.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={[styles.label, { color: theme.colors.subText }]}>Açıklama</Text>
                        <TextInput
                            style={[styles.input, styles.textArea, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }]}
                            placeholder="Masraf detayı..."
                            placeholderTextColor={theme.colors.subText}
                            inputMode="text"
                            autoComplete="off"
                            multiline
                            numberOfLines={3}
                            value={formData.description}
                            onChangeText={(text) => setFormData({ ...formData, description: text })}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={[styles.label, { color: theme.colors.subText }]}>Sesli Not (Opsiyonel)</Text>
                        <VoiceRecorder
                            onRecordingComplete={setAudioUri}
                            onDelete={() => setAudioUri(null)}
                            existingAudioUrl={audioUri}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={[styles.label, { color: theme.colors.subText }]}>Fiş/Fatura Fotoğrafı</Text>
                        <TouchableOpacity
                            style={[styles.imageUploadButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
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
                                <Image 
                                    source={{ uri: receiptImage }} 
                                    style={styles.previewImage} 
                                    accessibilityLabel="Receipt preview"
                                />
                            ) : (
                                <View style={styles.uploadPlaceholder}>
                                    <MaterialIcons name="add-a-photo" size={32} color={theme.colors.subText} />
                                    <Text style={[styles.uploadText, { color: theme.colors.subText }]}>Fotoğraf Ekle</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                        {receiptImage && (
                            <TouchableOpacity
                                style={styles.removeImageButton}
                                onPress={() => setReceiptImage(null)}
                            >
                                <Text style={[styles.removeImageText, { color: theme.colors.error }]}>Fotoğrafı Kaldır</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <TouchableOpacity
                        style={[styles.submitButton, { backgroundColor: theme.colors.primary }]}
                        onPress={handleSubmit}
                    >
                        <Text style={[styles.submitButtonText, { color: theme.colors.textInverse }]}>Kaydet</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </View>
    );

    // For web (Safari iOS), return without Modal wrapper
    if (Platform.OS === 'web') {
        return formContent;
    }

    // For native, wrap in Modal
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={handleClose}
        >
            {formContent}
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'flex-end',
        // Web fix for Safari iOS
        ...(Platform.OS === 'web' && {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
        }),
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '90%',
        borderWidth: 1,
        // Safari iOS fix
        ...(Platform.OS === 'web' && {
            zIndex: 1000,
            cursor: 'auto',
        }),
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    input: {
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        borderWidth: 1,
        // Web/Safari iOS fixes
        outlineStyle: 'none',
        ...(Platform.OS === 'web' && {
            WebkitAppearance: 'none',
            userSelect: 'text',
        }),
    },
    dateSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        gap: 12
    },
    dateText: {
        fontSize: 16
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    categorySelector: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    categoryOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        gap: 8,
    },
    categoryOptionText: {
        fontWeight: '500',
    },
    submitButton: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 24,
    },
    imageUploadButton: {
        height: 150,
        borderRadius: 12,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderStyle: 'dashed',
    },
    previewImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    uploadPlaceholder: {
        alignItems: 'center',
    },
    uploadText: {
        marginTop: 8,
        fontSize: 14,
    },
    removeImageButton: {
        marginTop: 8,
        alignItems: 'center',
    },
    removeImageText: {
        fontSize: 14,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});
