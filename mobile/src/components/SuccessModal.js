import React, { useEffect, useRef } from 'react';
import { Modal, View, Text, StyleSheet, Animated, Easing, TouchableOpacity, Dimensions } from 'react-native';
import { Check, X } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const SuccessModal = ({ visible, type = 'success', message, onClose }) => {
    const scaleValue = useRef(new Animated.Value(0)).current;
    const opacityValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(scaleValue, {
                    toValue: 1,
                    friction: 5,
                    tension: 40,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityValue, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            scaleValue.setValue(0);
            opacityValue.setValue(0);
        }
    }, [visible]);

    if (!visible) return null;

    const isSuccess = type === 'success';
    const Icon = isSuccess ? Check : X;
    const color = isSuccess ? '#39FF14' : '#FF3B30'; // Neon Green or Red

    return (
        <Modal transparent visible={visible} animationType="none">
            <View style={styles.overlay}>
                <Animated.View
                    style={[
                        styles.container,
                        {
                            opacity: opacityValue,
                            transform: [{ scale: scaleValue }],
                        },
                    ]}
                >
                    <View style={[styles.iconContainer, { borderColor: color }]}>
                        <Icon size={48} color={color} strokeWidth={3} />
                    </View>

                    <Text style={styles.title}>
                        {isSuccess ? 'Başarılı!' : 'Hata!'}
                    </Text>

                    <Text style={styles.message}>{message}</Text>

                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: color }]}
                        onPress={onClose}
                    >
                        <Text style={[styles.buttonText, { color: isSuccess ? '#000' : '#FFF' }]}>
                            Tamam
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: width * 0.8,
        backgroundColor: '#1c1c1e',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.51,
        shadowRadius: 13.16,
        elevation: 20,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 8,
    },
    message: {
        fontSize: 16,
        color: '#AAA',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    button: {
        width: '100%',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default SuccessModal;
