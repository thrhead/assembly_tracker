import React, { useState, useEffect } from 'react';
import { View, Text, Modal, ScrollView, StyleSheet } from 'react-native';
import CustomInput from '../CustomInput';
import CustomButton from '../CustomButton';
import { COLORS } from '../../constants/theme';

const CustomerFormModal = ({ visible, onClose, initialData, onSave, theme }) => {
    const colors = theme ? theme.colors : COLORS;

    const [formData, setFormData] = useState({
        companyName: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        taxId: '',
        notes: '',
    });

    useEffect(() => {
        if (visible) {
            if (initialData) {
                setFormData({
                    companyName: initialData.companyName || '',
                    contactPerson: initialData.contactPerson || '',
                    email: initialData.email || '',
                    phone: initialData.phone || '',
                    address: initialData.address || '',
                    taxId: initialData.taxId || '',
                    notes: initialData.notes || '',
                });
            } else {
                setFormData({
                    companyName: '',
                    contactPerson: '',
                    email: '',
                    phone: '',
                    address: '',
                    taxId: '',
                    notes: '',
                });
            }
        }
    }, [visible, initialData]);

    const handleSave = () => {
        onSave(formData);
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <ScrollView>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>
                            {initialData ? 'Müşteriyi Düzenle' : 'Yeni Müşteri Ekle'}
                        </Text>

                        <CustomInput
                            label="Şirket Adı *"
                            value={formData.companyName}
                            onChangeText={(text) => setFormData({ ...formData, companyName: text })}
                            placeholder="ABC Şirketi"
                            theme={theme}
                        />

                        <CustomInput
                            label="İletişim Kişisi *"
                            value={formData.contactPerson}
                            onChangeText={(text) => setFormData({ ...formData, contactPerson: text })}
                            placeholder="Ahmet Yılmaz"
                            theme={theme}
                        />

                        <CustomInput
                            label="Email *"
                            value={formData.email}
                            onChangeText={(text) => setFormData({ ...formData, email: text })}
                            placeholder="info@sirket.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            theme={theme}
                        />

                        <CustomInput
                            label="Telefon"
                            value={formData.phone}
                            onChangeText={(text) => setFormData({ ...formData, phone: text })}
                            placeholder="+90 555 123 4567"
                            keyboardType="phone-pad"
                            theme={theme}
                        />

                        <CustomInput
                            label="Vergi No / T.C."
                            value={formData.taxId}
                            onChangeText={(text) => setFormData({ ...formData, taxId: text })}
                            placeholder="Vergi numarası"
                            keyboardType="numeric"
                            theme={theme}
                        />

                        <CustomInput
                            label="Adres"
                            value={formData.address}
                            onChangeText={(text) => setFormData({ ...formData, address: text })}
                            placeholder="İstanbul, Kadıköy"
                            multiline
                            numberOfLines={3}
                            style={{ height: 80, textAlignVertical: 'top' }}
                            theme={theme}
                        />

                        <CustomInput
                            label="Notlar"
                            value={formData.notes}
                            onChangeText={(text) => setFormData({ ...formData, notes: text })}
                            placeholder="Müşteri hakkında notlar..."
                            multiline
                            numberOfLines={3}
                            style={{ height: 80, textAlignVertical: 'top' }}
                            theme={theme}
                        />

                        <View style={styles.modalButtons}>
                            <CustomButton
                                title="İptal"
                                onPress={onClose}
                                variant="outline"
                                style={{ flex: 1, borderColor: colors.border }}
                                textStyle={{ color: colors.text }}
                                theme={theme}
                            />
                            <CustomButton
                                title={initialData ? 'Güncelle' : 'Ekle'}
                                onPress={handleSave}
                                variant="primary"
                                style={{ flex: 1, backgroundColor: colors.primary }}
                                textStyle={{ color: colors.textInverse }}
                                theme={theme}
                            />
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '85%',
        borderWidth: 1,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 20,
    },
});

export default CustomerFormModal;
