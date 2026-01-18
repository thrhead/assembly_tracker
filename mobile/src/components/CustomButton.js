import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

const CustomButton = ({
    onPress,
    title,
    variant = 'primary', // primary, outline, danger, ghost
    loading = false,
    disabled = false,
    style,
    textStyle,
    icon,
    // theme prop is no longer strictly necessary but kept for backward compatibility if passed explicitly
    theme: propTheme
}) => {
    const { theme: contextTheme } = useTheme();
    const theme = propTheme || contextTheme;

    // Fallback values
    const primaryColor = theme ? theme.colors.primary : COLORS.primary;
    const errorColor = theme ? theme.colors.error : COLORS.red500;
    const slate700 = theme ? theme.colors.border || COLORS.slate700 : COLORS.slate700;
    const slate500 = theme ? theme.colors.subText || COLORS.slate500 : COLORS.slate500;
    const slate400 = theme ? theme.colors.subText || COLORS.slate400 : COLORS.slate400;
    const white = theme ? theme.colors.textInverse || COLORS.white : COLORS.white;
    const black = theme ? theme.colors.textInverse || COLORS.black : COLORS.black;

    const getBackgroundColor = () => {
        if (disabled) return slate700;
        switch (variant) {
            case 'primary': return primaryColor;
            case 'outline': return 'transparent';
            case 'danger': return errorColor;
            case 'ghost': return 'transparent';
            default: return primaryColor;
        }
    };

    const getTextColor = () => {
        if (disabled) return slate500;
        switch (variant) {
            case 'primary': return theme?.id === 'dark' ? COLORS.black : COLORS.textLight; // Dark mode primary is usually bright, so black text. Light mode primary is blue, so white text.
            case 'outline': return primaryColor;
            case 'danger': return white;
            case 'ghost': return slate400;
            default: return theme?.id === 'dark' ? COLORS.black : COLORS.textLight;
        }
    };

    const getBorder = () => {
        if (variant === 'outline') {
            return {
                borderWidth: 1,
                borderColor: disabled ? slate700 : primaryColor
            };
        }
        return {};
    };

    return (
        <TouchableOpacity
            style={[
                styles.button,
                { backgroundColor: getBackgroundColor() },
                getBorder(),
                style
            ]}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator color={getTextColor()} />
            ) : (
                <>
                    {icon}
                    <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
                        {title}
                    </Text>
                </>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        height: 48,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 8,
        paddingHorizontal: 16,
    },
    text: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default CustomButton;
