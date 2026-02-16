import React, { useState } from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
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
    const [isFocused, setIsFocused] = useState(false);

    // Fallback values
    const primaryColor = theme ? theme.colors.primary : COLORS.primary;
    const errorColor = theme ? theme.colors.error : COLORS.red500;
    const slate700 = theme ? theme.colors.border || COLORS.slate700 : COLORS.slate700;
    const slate500 = theme ? theme.colors.subText || COLORS.slate500 : COLORS.slate500;
    const slate400 = theme ? theme.colors.subText || COLORS.slate400 : COLORS.slate400;
    const white = theme ? theme.colors.textInverse || COLORS.white : COLORS.white;
    const black = theme ? theme.colors.textInverse || theme.colors.textInverse : theme.colors.textInverse;

    const getBackgroundColor = (pressed) => {
        if (disabled) return slate700;
        if (variant === 'outline' || variant === 'ghost') {
            return pressed ? (theme?.id === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)') : 'transparent';
        }
        
        const baseColor = variant === 'danger' ? errorColor : primaryColor;
        return pressed ? baseColor : baseColor; // Ideally darken on press, keeping simple for now or use opacity
    };

    const getTextColor = () => {
        if (disabled) return slate500;
        switch (variant) {
            case 'primary': return theme?.id === 'dark' ? theme.colors.textInverse : COLORS.textLight;
            case 'outline': return primaryColor;
            case 'danger': return white;
            case 'ghost': return slate400;
            default: return theme?.id === 'dark' ? theme.colors.textInverse : COLORS.textLight;
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
        <Pressable
            onPress={onPress}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled || loading}
            accessibilityRole="button"
            accessibilityLabel={title}
            style={({ pressed }) => [
                styles.button,
                { 
                    backgroundColor: getBackgroundColor(pressed),
                    opacity: pressed && (variant === 'primary' || variant === 'danger') ? 0.8 : 1,
                    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {})
                },
                getBorder(),
                isFocused && {
                    borderColor: primaryColor,
                    borderWidth: 2,
                    // Ensure border is visible even for filled buttons if needed, or use outline style
                    // For primary buttons, maybe a shadow or ring effect is better, but border is safest for now
                    transform: [{ scale: 1.02 }]
                },
                style
            ]}
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
        </Pressable>
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
