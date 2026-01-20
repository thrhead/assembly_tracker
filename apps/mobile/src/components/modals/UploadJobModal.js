import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Alert, Linking } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { COLORS } from '../../constants/theme';
import { API_BASE_URL } from '../../services/api';

const UploadJobModal = ({ visible, onClose }) => {

    const handlePickDocument = async (type) => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                copyToCacheDirectory: true
            });

            if (result.assets && result.assets.length > 0) {
                Alert.alert('Bilgi', 'Excel yükleme özelliği backend ile bağlanacak.');
                onClose();
            }
        } catch (err) {
            console.error('Document picker error:', err);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { width: '80%' }]}>
                    <Text style={styles.modalTitle}>Excel Yükleme</Text>
                    <TouchableOpacity style={[styles.selectorButton, { marginBottom: 12, justifyContent: 'center' }]} onPress={() => handlePickDocument('job')}>
                        <MaterialIcons name="file-upload" size={24} color={COLORS.neonGreen} style={{ marginRight: 10 }} />
                        <Text style={styles.selectorButtonText}>Toplu İş Yükle (Excel)</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.selectorButton, { marginBottom: 12, justifyContent: 'center' }]} onPress={() => handlePickDocument('template')}>
                        <MaterialIcons name="file-upload" size={24} color={COLORS.blue500} style={{ marginRight: 10 }} />
                        <Text style={styles.selectorButtonText}>Şablon Yükle (Excel)</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.selectorButton, { justifyContent: 'center', borderColor: COLORS.textGray }]}
                        onPress={() => {
                            const url = `${API_BASE_URL}/api/admin/templates/sample`;
                            Linking.openURL(url).catch(err => {
                                console.error("Couldn't load page", err);
                                Alert.alert('Hata', 'Şablon indirme linki açılamadı.');
                            });
                        }}
                    >
                        <MaterialIcons name="file-download" size={24} color={COLORS.textLight} style={{ marginRight: 10 }} />
                        <Text style={styles.selectorButtonText}>Örnek Şablon İndir</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.cancelButton, { marginTop: 20 }]} onPress={onClose}>
                        <Text style={styles.cancelButtonText}>İptal</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: '#1A1A1A', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#333' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#ffffff', marginBottom: 20, textAlign: 'center' },
    selectorButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#2d3748', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#4b5563' },
    selectorButtonText: { color: '#ffffff' },
    cancelButton: { padding: 14, borderRadius: 8, backgroundColor: '#334155', alignItems: 'center' },
    cancelButtonText: { color: '#e2e8f0', fontWeight: '600' },
});

export default UploadJobModal;
