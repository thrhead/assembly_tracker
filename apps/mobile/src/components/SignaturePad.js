import React, { useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Modal } from 'react-native';
import Signature from 'react-native-signature-canvas';
import { COLORS } from '../constants/theme';

const SignaturePad = ({ visible, onSave, onCancel, theme }) => {
    const signatureRef = useRef();

    const handleOK = (signature) => {
        onSave(signature);
    };

    const handleEmpty = () => {
        console.log('Empty signature');
    };

    const handleClear = () => {
        signatureRef.current.clearSignature();
    };

    const handleConfirm = () => {
        signatureRef.current.readSignature();
    };

    const style = `.m-signature-pad--footer {display: none; margin: 0px;}`;

    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <View style={styles.container}>
                <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
                    <Text style={[styles.title, { color: theme.colors.text }]}>Müşteri İmzası</Text>
                    <Text style={[styles.subtitle, { color: theme.colors.subText }]}>Lütfen aşağıdaki alana imzalayın</Text>
                    
                    <View style={styles.signatureBox}>
                        <Signature
                            ref={signatureRef}
                            onOK={handleOK}
                            onEmpty={handleEmpty}
                            descriptionText="İmza"
                            clearText="Temizle"
                            confirmText="Onayla"
                            webStyle={style}
                        />
                    </View>

                    <View style={styles.buttonRow}>
                        <TouchableOpacity 
                            style={[styles.button, styles.cancelButton]} 
                            onPress={onCancel}
                        >
                            <Text style={styles.cancelButtonText}>İptal</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={[styles.button, styles.clearButton, { borderColor: theme.colors.border }]} 
                            onPress={handleClear}
                        >
                            <Text style={[styles.clearButtonText, { color: theme.colors.text }]}>Temizle</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.button, styles.saveButton, { backgroundColor: theme.colors.primary }]} 
                            onPress={handleConfirm}
                        >
                            <Text style={styles.saveButtonText}>Onayla</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 20
    },
    modalContent: {
        width: '100%',
        height: 450,
        borderRadius: 20,
        padding: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 5
    },
    subtitle: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 20
    },
    signatureBox: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: '#fff'
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        gap: 10
    },
    button: {
        flex: 1,
        height: 48,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#f1f5f9',
    },
    cancelButtonText: {
        color: '#64748b',
        fontWeight: '600'
    },
    clearButton: {
        borderWidth: 1,
    },
    clearButtonText: {
        fontWeight: '600'
    },
    saveButton: {
        backgroundColor: COLORS.electricBlue,
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: 'bold'
    }
});

export default SignaturePad;
