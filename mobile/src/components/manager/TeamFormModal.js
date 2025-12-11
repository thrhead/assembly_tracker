import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import CustomInput from '../CustomInput';
import CustomButton from '../CustomButton';
import { COLORS } from '../../constants/theme';

const TeamFormModal = ({ visible, onClose, initialData, onSave, availableUsers }) => {
    const [formData, setFormData] = useState({ name: '', description: '', leadId: '', memberIds: [] });

    useEffect(() => {
        if (visible) {
            if (initialData) {
                setFormData({
                    name: initialData.name,
                    description: initialData.description || '',
                    leadId: initialData.leadId || '',
                    memberIds: initialData.members?.map(m => m.userId) || []
                });
            } else {
                setFormData({ name: '', description: '', leadId: '', memberIds: [] });
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
                    <Text style={styles.modalTitle}>{initialData ? 'Ekibi Düzenle' : 'Yeni Ekip Ekle'}</Text>

                    <ScrollView style={{ maxHeight: 500 }} showsVerticalScrollIndicator={false}>
                        <CustomInput
                            label="Ekip Adı *"
                            value={formData.name}
                            onChangeText={(text) => setFormData({ ...formData, name: text })}
                            placeholder="Montaj Ekibi A"
                        />

                        <CustomInput
                            label="Açıklama"
                            value={formData.description}
                            onChangeText={(text) => setFormData({ ...formData, description: text })}
                            placeholder="Ekip açıklaması (opsiyonel)"
                            multiline
                            numberOfLines={3}
                            style={{ height: 80, textAlignVertical: 'top' }}
                        />

                        <Text style={styles.label}>Ekip Lideri</Text>
                        <View style={styles.selectionBox}>
                            {availableUsers.filter(u => u.role === 'TEAM_LEAD' || u.role === 'MANAGER').map(u => (
                                <TouchableOpacity
                                    key={u.id}
                                    style={styles.checkboxItem}
                                    onPress={() => setFormData({ ...formData, leadId: formData.leadId === u.id ? '' : u.id })}
                                >
                                    <View style={[styles.checkbox, formData.leadId === u.id && styles.checkboxChecked]}>
                                        {formData.leadId === u.id && <Text style={styles.checkmark}>✓</Text>}
                                    </View>
                                    <Text style={styles.checkboxLabel}>{u.name} ({u.role === 'TEAM_LEAD' ? 'Ekip Lideri' : 'Yönetici'})</Text>
                                </TouchableOpacity>
                            ))}
                            {availableUsers.filter(u => u.role === 'TEAM_LEAD' || u.role === 'MANAGER').length === 0 && (
                                <Text style={styles.emptyText}>Henüz ekip lideri veya yönetici yok</Text>
                            )}
                        </View>

                        <Text style={styles.label}>Ekip Üyeleri</Text>
                        <View style={styles.selectionBox}>
                            {availableUsers.filter(u => u.role === 'WORKER' || u.role === 'TEAM_LEAD').map(u => (
                                <TouchableOpacity
                                    key={u.id}
                                    style={styles.checkboxItem}
                                    onPress={() => {
                                        const isSelected = formData.memberIds?.includes(u.id);
                                        setFormData({
                                            ...formData,
                                            memberIds: isSelected
                                                ? formData.memberIds.filter(id => id !== u.id)
                                                : [...(formData.memberIds || []), u.id]
                                        });
                                    }}
                                >
                                    <View style={[styles.checkbox, formData.memberIds?.includes(u.id) && styles.checkboxChecked]}>
                                        {formData.memberIds?.includes(u.id) && <Text style={styles.checkmark}>✓</Text>}
                                    </View>
                                    <Text style={styles.checkboxLabel}>{u.name} ({u.role === 'WORKER' ? 'İşçi' : 'Ekip Lideri'})</Text>
                                </TouchableOpacity>
                            ))}
                            {availableUsers.filter(u => u.role === 'WORKER' || u.role === 'TEAM_LEAD').length === 0 && (
                                <Text style={styles.emptyText}>Henüz işçi yok</Text>
                            )}
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
        backgroundColor: 'rgba(0,0,0,0.8)',
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
        color: COLORS.textLight,
        marginBottom: 8,
        fontWeight: '600',
    },
    selectionBox: {
        backgroundColor: COLORS.slate800,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.slate600,
        padding: 12,
        marginBottom: 16,
        maxHeight: 200,
    },
    checkboxItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: COLORS.slate500,
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    checkboxChecked: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primary,
    },
    checkmark: {
        color: COLORS.black,
        fontSize: 16,
        fontWeight: 'bold',
    },
    checkboxLabel: {
        color: COLORS.textLight,
        fontSize: 14,
        flex: 1,
    },
    emptyText: {
        color: COLORS.slate400,
        fontSize: 14,
        fontStyle: 'italic',
        textAlign: 'center',
        paddingVertical: 12,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 10,
    },
});

export default TeamFormModal;
