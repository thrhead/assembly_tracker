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
import { COLORS } from '../../../constants/theme';
import { CATEGORIES } from './ExpenseFilter';

// Safari iOS compatible input component
const WebInput = ({ style, value, onChangeText, placeholder, inputMode, ...props }) => {
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
                    backgroundColor: COLORS.cardBorder,
                    borderRadius: 12,
                    padding: 16,
                    color: COLORS.textLight,
                    fontSize: 16,
                    border: `1px solid ${COLORS.cardBorder}`,
                    width: '100%',
                    boxSizing: 'border-box',
                    outline: 'none',
                    fontFamily: 'inherit',
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
            placeholderTextColor={COLORS.textGray}
            {...props}
        />
    );
};

export const CreateExpenseModal = ({ visible, onClose, onSubmit, projects, defaultJobId }) => {
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        category: 'Yemek',
        description: '',
        jobId: defaultJobId || '',
        date: new Date()
    });
    const [receiptImage, setReceiptImage] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Update jobId when default changes if not set
    React.useEffect(() => {
        if (defaultJobId && !formData.jobId) {
            setFormData(prev => ({ ...prev, jobId: defaultJobId }));
        }
    }, [defaultJobId]);

    const handleSubmit = async () => {
        const success = await onSubmit(formData, receiptImage);
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
        onClose();
    };

    // Safari iOS fix: don't render if not visible
    if (!visible) return null;

    const formContent = (
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Yeni Masraf Ekle</Text>
                    <TouchableOpacity onPress={handleClose}>
                        <MaterialIcons name="close" size={24} color={COLORS.textGray} />
                    </TouchableOpacity>
                </View>

                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="none"
                >
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Başlık</Text>
                        <WebInput
                            style={styles.input}
                            placeholder="Örn: Öğle Yemeği"
                            inputMode="text"
                            value={formData.title}
                            onChangeText={(text) => setFormData({ ...formData, title: text })}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Tarih</Text>
                        <TouchableOpacity
                            style={styles.dateSelector}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <MaterialIcons name="event" size={24} color={COLORS.textGray} />
                            <Text style={styles.dateText}>
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
                        <Text style={styles.label}>Tutar (₺)</Text>
                        <WebInput
                            style={styles.input}
                            placeholder="0.00"
                            inputMode="decimal"
                            value={formData.amount}
                            onChangeText={(text) => setFormData({ ...formData, amount: text })}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Kategori</Text>
                        <View style={styles.categorySelector}>
                            {CATEGORIES.filter(c => c.id !== 'Tümü').map((cat) => (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={[
                                        styles.categoryOption,
                                        formData.category === cat.id && styles.categoryOptionSelected
                                    ]}
                                    onPress={() => setFormData({ ...formData, category: cat.id })}
                                >
                                    <MaterialIcons
                                        name={cat.icon}
                                        size={20}
                                        color={formData.category === cat.id ? COLORS.backgroundDark : COLORS.textGray}
                                    />
                                    <Text style={[
                                        styles.categoryOptionText,
                                        formData.category === cat.id && styles.categoryOptionTextSelected
                                    ]}>{cat.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Açıklama</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Masraf detayı..."
                            placeholderTextColor={COLORS.textGray}
                            inputMode="text"
                            autoComplete="off"
                            multiline
                            numberOfLines={3}
                            value={formData.description}
                            onChangeText={(text) => setFormData({ ...formData, description: text })}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Fiş/Fatura Fotoğrafı</Text>
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
                    </View>

                    <TouchableOpacity
                        style={styles.submitButton}
                        onPress={handleSubmit}
                    >
                        <Text style={styles.submitButtonText}>Kaydet</Text>
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
        backgroundColor: COLORS.cardDark,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '90%',
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
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
        color: COLORS.textLight,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.textGray,
        marginBottom: 8,
    },
    input: {
        backgroundColor: COLORS.cardBorder,
        borderRadius: 12,
        padding: 16,
        color: COLORS.textLight,
        fontSize: 16,
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
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
        backgroundColor: COLORS.cardBorder,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
        gap: 12
    },
    dateText: {
        color: COLORS.textLight,
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
        backgroundColor: COLORS.cardBorder,
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
        gap: 8,
    },
    categoryOptionSelected: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    categoryOptionText: {
        color: COLORS.textGray,
        fontWeight: '500',
    },
    categoryOptionTextSelected: {
        color: COLORS.backgroundDark,
        fontWeight: 'bold',
    },
    submitButton: {
        backgroundColor: COLORS.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 24,
    },
    imageUploadButton: {
        height: 150,
        backgroundColor: COLORS.cardBorder,
        borderRadius: 12,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
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
        color: COLORS.textGray,
        marginTop: 8,
        fontSize: 14,
    },
    removeImageButton: {
        marginTop: 8,
        alignItems: 'center',
    },
    removeImageText: {
        color: COLORS.red500,
        fontSize: 14,
    },
    submitButtonText: {
        color: COLORS.backgroundDark,
        fontSize: 16,
        fontWeight: 'bold',
    },
});
