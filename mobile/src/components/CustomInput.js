import React from 'react';
import { View, TextInput, StyleSheet, Text } from 'react-native';
import { COLORS } from '../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';

const CustomInput = ({
    value,
    onChangeText,
    placeholder,
    secureTextEntry,
    icon,
    label,
    error,
    keyboardType,
    autoCapitalize,
    editable = true,
    style
}) => {
    return (
        <View style={[styles.container, style]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={[styles.inputContainer, error && styles.errorBorder]}>
                {icon && (
                    <MaterialIcons
                        name={icon}
                        size={20}
                        color={COLORS.slate500}
                        style={styles.icon}
                    />
                )}
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={COLORS.slate500}
                    secureTextEntry={secureTextEntry}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    editable={editable}
                />
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        color: COLORS.slate400,
        marginBottom: 8,
        fontSize: 14,
        fontWeight: '500',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: COLORS.slate700,
        borderRadius: 8,
        height: 48,
    },
    errorBorder: {
        borderColor: COLORS.red500,
    },
    icon: {
        marginLeft: 12,
    },
    input: {
        flex: 1,
        color: COLORS.white,
        paddingHorizontal: 12,
        height: '100%',
    },
    errorText: {
        color: COLORS.red500,
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
});

export default CustomInput;
