import React, { createContext, useContext, useState, useCallback } from 'react';
import { Modal, View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { AlertCircle, CheckCircle2, Info, HelpCircle, AlertTriangle } from 'lucide-react-native';
import { useTheme } from './ThemeContext';

const { width } = Dimensions.get('window');

const AlertContext = createContext();

export const useAlert = () => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlert must be used within an AlertProvider');
    }
    return context;
};

export const AlertProvider = ({ children }) => {
    const { theme } = useTheme();
    const [visible, setVisible] = useState(false);
    const [config, setConfig] = useState({
        title: '',
        message: '',
        buttons: [],
        type: 'info', // info, success, warning, error, question
    });

    const scaleValue = React.useRef(new Animated.Value(0)).current;
    const opacityValue = React.useRef(new Animated.Value(0)).current;

    const showAlert = useCallback((title, message, buttons = [], type = 'info') => {
        // Default button if none provided
        const finalButtons = buttons.length > 0 ? buttons : [{ text: 'OK', onPress: () => { } }];

        setConfig({ title, message, buttons: finalButtons, type });
        setVisible(true);

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
    }, [scaleValue, opacityValue]);

    const hideAlert = useCallback(() => {
        Animated.parallel([
            Animated.timing(scaleValue, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(opacityValue, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setVisible(false);
        });
    }, [scaleValue, opacityValue]);

    const handleButtonPress = (onPress) => {
        hideAlert();
        if (onPress) {
            setTimeout(() => {
                onPress();
            }, 200);
        }
    };

    const getIcon = () => {
        const size = 48;
        const strokeWidth = 2.5;
        switch (config.type) {
            case 'success':
                return <CheckCircle2 size={size} color={theme.colors.secondary} strokeWidth={strokeWidth} />;
            case 'error':
                return <AlertCircle size={size} color={theme.colors.error} strokeWidth={strokeWidth} />;
            case 'warning':
                return <AlertTriangle size={size} color={theme.colors.tertiary} strokeWidth={strokeWidth} />;
            case 'question':
                return <HelpCircle size={size} color={theme.colors.primary} strokeWidth={strokeWidth} />;
            case 'info':
            default:
                return <Info size={size} color={theme.colors.primary} strokeWidth={strokeWidth} />;
        }
    };

    const getTypeColor = () => {
        switch (config.type) {
            case 'success': return theme.colors.secondary;
            case 'error': return theme.colors.error;
            case 'warning': return theme.colors.tertiary;
            case 'question': return theme.colors.primary;
            default: return theme.colors.primary;
        }
    };

    return (
        <AlertContext.Provider value={{ showAlert }}>
            {children}
            <Modal transparent visible={visible} animationType="none" onRequestClose={hideAlert}>
                <View style={styles.overlay}>
                    <Animated.View
                        style={[
                            styles.container,
                            {
                                backgroundColor: theme.colors.card,
                                borderColor: theme.colors.border,
                                opacity: opacityValue,
                                transform: [{ scale: scaleValue }],
                            },
                        ]}
                    >
                        <View style={[styles.iconContainer, { borderColor: getTypeColor(), backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0,0,0,0.03)' }]}>
                            {getIcon()}
                        </View>

                        <Text style={[styles.title, { color: theme.colors.text }]}>{config.title}</Text>
                        <Text style={[styles.message, { color: theme.colors.subText }]}>{config.message}</Text>

                        <View style={[styles.buttonContainer, config.buttons.length > 2 && styles.buttonContainerVertical]}>
                            {config.buttons.map((btn, idx) => (
                                <TouchableOpacity
                                    key={idx}
                                    style={[
                                        styles.button,
                                        config.buttons.length > 2 ? styles.buttonVertical : styles.buttonHorizontal,
                                        btn.style === 'cancel'
                                            ? { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.colors.border }
                                            : { backgroundColor: btn.style === 'destructive' ? theme.colors.error : getTypeColor() }
                                    ]}
                                    onPress={() => handleButtonPress(btn.onPress)}
                                >
                                    <Text style={[
                                        styles.buttonText,
                                        { color: btn.style === 'cancel' ? theme.colors.text : theme.colors.textInverse }
                                    ]}>
                                        {btn.text}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </Animated.View>
                </View>
            </Modal>
        </AlertContext.Provider>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: Math.min(width * 0.85, 400),
        borderRadius: 28,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 28,
        lineHeight: 22,
    },
    buttonContainer: {
        flexDirection: 'row',
        width: '100%',
        gap: 12,
    },
    buttonContainerVertical: {
        flexDirection: 'column',
    },
    button: {
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonHorizontal: {
        flex: 1,
    },
    buttonVertical: {
        width: '100%',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});
