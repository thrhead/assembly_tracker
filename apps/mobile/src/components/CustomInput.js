import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const CustomInput = ({
    value,
    onChangeText,
    placeholder,
    secureTextEntry,
    icon,
    rightIcon,
    onRightIconPress,
    label,
    error,
    keyboardType,
    autoCapitalize,
    editable = true,
    style,
    theme: propTheme
}) => {
    const { theme: contextTheme } = useTheme();
    const theme = propTheme || contextTheme;
    const colors = theme ? theme.colors : COLORS;
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={[styles.container, style]}>
            {label && <Text style={[styles.label, { color: colors.subText || colors.slate400 }]}>{label}</Text>}
            <View style={[
                styles.inputContainer, 
                { 
                    backgroundColor: theme ? colors.card : 'rgba(255,255,255,0.05)', 
                    borderColor: error ? (colors.error || colors.red500) : (isFocused ? (colors.primary || COLORS.primary) : (theme ? colors.border : colors.slate700)),
                    borderWidth: isFocused || error ? 2 : 1
                }
            ]}>
                {icon && (
                    <MaterialIcons
                        name={icon}
                        size={20}
                        color={isFocused ? (colors.primary || COLORS.primary) : (colors.subText || colors.slate500)}
                        style={styles.icon}
                    />
                )}
                <TextInput
                    style={[styles.input, { color: colors.text || colors.white }]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={colors.subText || colors.slate500}
                    secureTextEntry={secureTextEntry}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    editable={editable}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    accessibilityLabel={label || placeholder}
                />
                {rightIcon && (
                    <TouchableOpacity 
                        onPress={onRightIconPress} 
                        style={styles.rightIcon}
                        accessibilityRole="button"
                        accessibilityLabel={rightIcon}
                    >
                        <MaterialIcons
                            name={rightIcon}
                            size={20}
                            color={colors.subText || colors.slate500}
                        />
                    </TouchableOpacity>
                )}
            </View>
            {error && <Text style={[styles.errorText, { color: colors.error || colors.red500 }]}>{error}</Text>}
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
    rightIcon: {
        marginRight: 12,
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
