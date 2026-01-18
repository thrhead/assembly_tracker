import React, { useState, useEffect } from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity, StyleSheet, Alert, Switch } from 'react-native';
import CustomInput from '../CustomInput';
import CustomButton from '../CustomButton';
import { COLORS } from '../../constants/theme';

const UserFormModal = ({ visible, onClose, initialData, onSave, theme }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'WORKER',
        password: '',
        phone: '',
        isActive: true
    });

    // Fallbacks
    const bg = theme ? theme.colors.card : COLORS.cardDark;
    const border = theme ? theme.colors.border : COLORS.slate800;
    const textMain = theme ? theme.colors.text : COLORS.textLight;
    const textSub = theme ? theme.colors.subText : COLORS.textLight;
    const primary = theme ? theme.colors.primary : COLORS.primary;

    useEffect(() => {
        if (visible) {
            if (initialData) {
                setFormData({
                    name: initialData.name || '',
                    email: initialData.email || '',
                    role: initialData.role || 'WORKER',
                    password: '', // Always empty on edit
                    phone: initialData.phone || '',
                    isActive: initialData.isActive ?? true
                });
            } else {
                setFormData({
                    name: '',
                    email: '',
                    role: 'WORKER',
                    password: '',
                    phone: '',
                    isActive: true
                });
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
                <View style={[styles.modalContent, { backgroundColor: bg, borderColor: border }]}>
                    <Text style={[styles.modalTitle, { color: textMain }]}>{initialData ? 'Kullanıcıyı Düzenle' : 'Yeni Kullanıcı'}</Text>

                    <ScrollView style={{ maxHeight: 500 }} showsVerticalScrollIndicator={false}>
                        <CustomInput
                            label="Ad Soyad *"
                            value={formData.name}
                            onChangeText={(text) => setFormData({ ...formData, name: text })}
                            placeholder="Ahmet Yılmaz"
                            theme={theme}
                        />

                        <CustomInput
                            label="E-posta *"
                            value={formData.email}
                            onChangeText={(text) => setFormData({ ...formData, email: text })}
                            placeholder="ornek@email.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            theme={theme}
                        />

                        <CustomInput
                            label="Telefon"
                            value={formData.phone}
                            onChangeText={(text) => setFormData({ ...formData, phone: text })}
                            placeholder="0555 123 45 67"
                            keyboardType="phone-pad"
                            theme={theme}
                        />

                        <CustomInput
                            label={initialData ? "Şifre (Değiştirmek için doldurun)" : "Şifre *"}
                            value={formData.password}
                            onChangeText={(text) => setFormData({ ...formData, password: text })}
                            placeholder="******"
                            secureTextEntry
                            theme={theme}
                        />

                        {initialData && (
                            <View style={styles.switchContainer}>
                                <Text style={[styles.label, { color: textMain, marginTop: 0 }]}>Hesap Durumu</Text>
                                <View style={styles.switchRow}>
                                    <Text style={[styles.roleOptionText, { color: textMain, marginRight: 10 }]}>
                                        {formData.isActive ? 'Aktif' : 'Pasif/Engelli'}
                                    </Text>
                                    <Switch
                                        trackColor={{ false: "#767577", true: primary }}
                                        thumbColor={formData.isActive ? "#f4f3f4" : "#f4f3f4"}
                                        ios_backgroundColor="#3e3e3e"
                                        onValueChange={() => setFormData({ ...formData, isActive: !formData.isActive })}
                                        value={formData.isActive}
                                    />
                                </View>
                            </View>
                        )}

                        <Text style={[styles.label, { color: textMain }]}>Rol</Text>
                        <View style={styles.roleSelector}>
                            {['WORKER', 'TEAM_LEAD', 'MANAGER', 'ADMIN'].map((role) => (
                                <TouchableOpacity
                                    key={role}
                                    style={[
                                        styles.roleOption,
                                        { backgroundColor: theme ? theme.colors.background : COLORS.slate800, borderColor: border },
                                        formData.role === role && { backgroundColor: primary, borderColor: primary }
                                    ]}
                                    onPress={() => setFormData({ ...formData, role })}
                                >
                                    <Text style={[
                                        styles.roleOptionText,
                                        { color: textSub },
                                        formData.role === role && { color: theme ? theme.colors.textInverse : COLORS.black, fontWeight: 'bold' }
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
                            theme={theme}
                        />
                        <CustomButton
                            title="Kaydet"
                            onPress={handleSave}
                            variant="primary"
                            style={{ flex: 1 }}
                            theme={theme}
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
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
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
        borderWidth: 1,
    },
    roleOptionText: {
        fontSize: 12,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 10,
    },
    switchContainer: {
        marginBottom: 16,
    },
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 8,
        paddingHorizontal: 4,
    },
});

export default UserFormModal;
