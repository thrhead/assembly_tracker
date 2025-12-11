import React, { useState, useEffect } from 'react';
import { View, Text, Modal, ScrollView, StyleSheet } from 'react-native';
import CustomInput from '../CustomInput';
import CustomButton from '../CustomButton';
import { COLORS } from '../../constants/theme';

const CustomerFormModal = ({ visible, onClose, initialData, onSave }) => {
    const [formData, setFormData] = useState({
        companyName: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
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
                });
            } else {
                setFormData({
                    companyName: '',
                    contactPerson: '',
                    email: '',
                    phone: '',
                    address: '',
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
                <View style={styles.modalContent}>
                    <ScrollView>
                        <Text style={styles.modalTitle}>
                            {initialData ? 'Müşteriyi Düzenle' : 'Yeni Müşteri Ekle'}
                        </Text>

                        <CustomInput
                            label="Şirket Adı *"
                            value={formData.companyName}
                            onChangeText={(text) => setFormData({ ...formData, companyName: text })}
                            placeholder="ABC Şirketi"
                        />

                        <CustomInput
                            label="İletişim Kişisi *"
                            value={formData.contactPerson}
                            onChangeText={(text) => setFormData({ ...formData, contactPerson: text })}
                            placeholder="Ahmet Yılmaz"
                        />

                        <CustomInput
                            label="Email *"
                            value={formData.email}
                            onChangeText={(text) => setFormData({ ...formData, email: text })}
                            placeholder="info@sirket.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <CustomInput
                            label="Telefon"
                            value={formData.phone}
                            onChangeText={(text) => setFormData({ ...formData, phone: text })}
                            placeholder="+90 555 123 4567"
                            keyboardType="phone-pad"
                        />

                        <CustomInput
                            label="Adres"
                            value={formData.address}
                            onChangeText={(text) => setFormData({ ...formData, address: text })}
                            placeholder="İstanbul, Kadıköy"
                            multiline
                            numberOfLines={3}
                            style={{ height: 80, textAlignVertical: 'top' }}
                        />

                        <View style={styles.modalButtons}>
                            <CustomButton
                                title="İptal"
                                onPress={onClose}
                                variant="outline"
                                style={{ flex: 1 }}
                            />
                            <CustomButton
                                title={initialData ? 'Güncelle' : 'Ekle'}
                                onPress={handleSave}
                                variant="primary"
                                style={{ flex: 1 }}
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
        backgroundColor: COLORS.cardDark,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '85%',
        borderWidth: 1,
        borderColor: COLORS.slate800,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.textLight,
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 20,
    },
});

export default CustomerFormModal;
