import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import CustomInput from '../CustomInput';
import CustomButton from '../CustomButton';
// import { COLORS } from '../../constants/theme';

const TeamFormModal = ({ visible, onClose, initialData, onSave, availableUsers, theme }) => {
    const { t } = useTranslation();
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
                <View style={[styles.modalContent, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                    <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{initialData ? t('manager.editTeam') : t('manager.addTeam')}</Text>

                    <ScrollView style={{ maxHeight: 500 }} showsVerticalScrollIndicator={false}>
                        <CustomInput
                            label={`${t('manager.teamName')} *`}
                            value={formData.name}
                            onChangeText={(text) => setFormData({ ...formData, name: text })}
                            placeholder={t('manager.teamNamePlaceholder')}
                            theme={theme}
                        />

                        <CustomInput
                            label={t('jobs.description')}
                            value={formData.description}
                            onChangeText={(text) => setFormData({ ...formData, description: text })}
                            placeholder={t('manager.teamDescription')}
                            multiline
                            numberOfLines={3}
                            style={{ height: 80, textAlignVertical: 'top' }}
                            theme={theme}
                        />

                        <Text style={[styles.label, { color: theme.colors.text }]}>{t('manager.teamLeader')}</Text>
                        <View style={[styles.selectionBox, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
                            {availableUsers.filter(u => u.role === 'TEAM_LEAD' || u.role === 'MANAGER').map(u => (
                                <TouchableOpacity
                                    key={u.id}
                                    style={styles.checkboxItem}
                                    onPress={() => setFormData({ ...formData, leadId: formData.leadId === u.id ? '' : u.id })}
                                >
                                    <View style={[
                                        styles.checkbox,
                                        { borderColor: theme.colors.subText },
                                        formData.leadId === u.id && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                                    ]}>
                                        {formData.leadId === u.id && <Text style={[styles.checkmark, { color: theme.colors.textInverse }]}>✓</Text>}
                                    </View>
                                    <Text style={[styles.checkboxLabel, { color: theme.colors.text }]}>{u.name} ({u.role === 'TEAM_LEAD' ? t('manager.leader') : t('manager.admin')})</Text>
                                </TouchableOpacity>
                            ))}
                            {availableUsers.filter(u => u.role === 'TEAM_LEAD' || u.role === 'MANAGER').length === 0 && (
                                <Text style={[styles.emptyText, { color: theme.colors.subText }]}>{t('manager.noLeadOrAdmin')}</Text>
                            )}
                        </View>

                        <Text style={[styles.label, { color: theme.colors.text }]}>{t('manager.teamMembers')}</Text>
                        <View style={[styles.selectionBox, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
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
                                    <View style={[
                                        styles.checkbox,
                                        { borderColor: theme.colors.subText },
                                        formData.memberIds?.includes(u.id) && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                                    ]}>
                                        {formData.memberIds?.includes(u.id) && <Text style={[styles.checkmark, { color: theme.colors.textInverse }]}>✓</Text>}
                                    </View>
                                    <Text style={[styles.checkboxLabel, { color: theme.colors.text }]}>{u.name} ({u.role === 'WORKER' ? t('manager.worker') : t('manager.leader')})</Text>
                                </TouchableOpacity>
                            ))}
                            {availableUsers.filter(u => u.role === 'WORKER' || u.role === 'TEAM_LEAD').length === 0 && (
                                <Text style={[styles.emptyText, { color: theme.colors.subText }]}>{t('manager.noWorkers')}</Text>
                            )}
                        </View>
                    </ScrollView>

                    <View style={styles.modalButtons}>
                        <CustomButton
                            title={t('common.cancel')}
                            onPress={onClose}
                            variant="outline"
                            style={{ flex: 1, borderColor: theme.colors.border }}
                            textStyle={{ color: theme.colors.text }}
                        />
                        <CustomButton
                            title={t('common.save')}
                            onPress={handleSave}
                            variant="primary"
                            style={{ flex: 1, backgroundColor: theme.colors.primary }}
                            textStyle={{ color: theme.colors.textInverse }}
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
        marginBottom: 8,
        fontWeight: '600',
    },
    selectionBox: {
        borderRadius: 8,
        borderWidth: 1,
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
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    checkmark: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    checkboxLabel: {
        fontSize: 14,
        flex: 1,
    },
    emptyText: {
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
