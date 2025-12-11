import React from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

const SelectionModal = ({ visible, onClose, title, items, onSelect, selectedId, displayKey = 'name' }) => {
    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{title}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <MaterialIcons name="close" size={24} color={COLORS.slate400} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={styles.modalList}>
                        {items.map((item, index) => {
                            const isSelected = item.id ? selectedId === item.id : selectedId === item;
                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.modalItem}
                                    onPress={() => {
                                        onSelect(item);
                                        onClose();
                                    }}
                                >
                                    <Text style={styles.modalItemText}>
                                        {displayKey === 'complex_customer'
                                            ? `${item.company || item.companyName} (${item.user?.name || item.contactPerson})`
                                            : (typeof item === 'object' ? item[displayKey] : item)}
                                    </Text>
                                    {isSelected && (
                                        <MaterialIcons name="check" size={20} color={COLORS.primary} />
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
        backgroundColor: COLORS.cardDark,
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
