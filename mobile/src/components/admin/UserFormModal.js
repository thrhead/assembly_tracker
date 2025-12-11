import React, { useState, useEffect } from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import CustomInput from '../CustomInput';
import CustomButton from '../CustomButton';
import { COLORS } from '../../constants/theme';

const UserFormModal = ({ visible, onClose, initialData, onSave }) => {
    const [formData, setFormData] = useState({ name: '', email: '', role: 'WORKER', password: '' });

    useEffect(() => {
        if (visible) {
            if (initialData) {
                setFormData({
                    name: initialData.name,
                    email: initialData.email,
                    role: initialData.role,
                    password: ''
                });
            } else {
                setFormData({ name: '', email: '', role: 'WORKER', password: '' });
            }
        }
    }, [visible, initialData]);

    const handleSave = () => {
        if (!formData.name || !formData.email || !formData.role) {
            Alert.alert('Hata', 'Lütfen tüm zorunlu alanları doldurun.');
            return;
        }
        if (!initialData && !formData.password) {
            Alert.alert('Hata', 'Yeni kullanıcı için şifre zorunludur.');
            return;
        }
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
                    <Text style={styles.modalTitle}>{initialData ? 'Kullanıcıyı Düzenle' : 'Yeni Kullanıcı'}</Text>

                    <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
                        <CustomInput
                            label="Ad Soyad *"
                            value={formData.name}
                            onChangeText={(text) => setFormData({ ...formData, name: text })}
                            placeholder="Ahmet Yılmaz"
                        />

                        <CustomInput
                            label="E-posta *"
                            value={formData.email}
                            onChangeText={(text) => setFormData({ ...formData, email: text })}
                            placeholder="ornek@email.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        {!initialData && (
                            <CustomInput
                                label="Şifre *"
                                value={formData.password}
                                onChangeText={(text) => setFormData({ ...formData, password: text })}
                                placeholder="******"
                                secureTextEntry
                            />
                        )}

                        <Text style={styles.label}>Rol</Text>
                        <View style={styles.roleSelector}>
                            {['WORKER', 'TEAM_LEAD', 'MANAGER', 'ADMIN'].map((role) => (
                                <TouchableOpacity
                                    key={role}
                                    style={[
                                        styles.roleOption,
                                        formData.role === role && styles.activeRoleOption
                                    ]}
                                    onPress={() => setFormData({ ...formData, role })}
                                >
                                    <Text style={[
                                        styles.roleOptionText,
                                        formData.role === role && styles.activeRoleOptionText
                                    ]}>
                                        {role}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>

                    <View style={styles.modalButtons}>
                        <CustomButton
                            title="İptal"
                            onPress={onClose}
                            variant="outline"
                            style={{ flex: 1 }}
                        />
                        <CustomButton
                            title="Kaydet"
                            onPress={handleSave}
                            variant="primary"
                            style={{ flex: 1 }}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: COLORS.cardDark,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: COLORS.slate800,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.textLight,
        marginBottom: 20,
        textAlign: 'center',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textLight,
        marginBottom: 8,
        marginTop: 8,
    },
    roleSelector: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 20,
    },
    roleOption: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: COLORS.slate800,
        borderWidth: 1,
        borderColor: COLORS.slate700,
    },
    activeRoleOption: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    roleOptionText: {
        fontSize: 12,
        color: COLORS.slate400,
    },
    activeRoleOptionText: {
        color: COLORS.black,
        fontWeight: 'bold',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 10,
    },
});

export default UserFormModal;
