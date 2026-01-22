import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { View, Text, Modal, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

const SelectionModal = ({ visible, onClose, title, items, onSelect, selectedId, displayKey = 'name', theme }) => {
    const colors = theme ? theme.colors : COLORS;

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                    <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>{title}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <MaterialIcons name="close" size={24} color={colors.subText || COLORS.slate400} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={styles.modalList}>
                        {items.map((item, index) => {
                            const isSelected = item.id ? selectedId === item.id : selectedId === item;
                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={[styles.modalItem, { borderBottomColor: colors.border }]}
                                    onPress={() => {
                                        onSelect(item);
                                        onClose();
                                    }}
                                >
                                    <Text style={[styles.modalItemText, { color: colors.text }]}>
                                        {displayKey === 'complex_customer'
                                            ? `${item.company || item.companyName} (${item.user?.name || item.contactPerson})`
                                            : (typeof item === 'object' ? item[displayKey] : item)}
                                    </Text>
                                    {isSelected && (
                                        <MaterialIcons name="check" size={20} color={colors.primary} />
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: theme.colors.card,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.slate800,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    modalList: {
        padding: 16,
    },
    modalItem: {
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.slate800,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    modalItemText: {
        color: COLORS.textLight,
        fontSize: 16,
    },
});

export default SelectionModal;
