import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS } from '../constants/theme';

const CustomButton = ({
    onPress,
    title,
    variant = 'primary', // primary, outline, danger, ghost
    loading = false,
    disabled = false,
    style,
    textStyle,
    icon
}) => {
    const getBackgroundColor = () => {
        if (disabled) return COLORS.slate700;
        switch (variant) {
            case 'primary': return COLORS.primary;
            case 'outline': return 'transparent';
            case 'danger': return COLORS.red500;
            case 'ghost': return 'transparent';
            default: return COLORS.primary;
        }
    };

    const getTextColor = () => {
        if (disabled) return COLORS.slate500;
        switch (variant) {
            case 'primary': return COLORS.black;
            case 'outline': return COLORS.primary;
            case 'danger': return COLORS.white;
            case 'ghost': return COLORS.slate400;
            default: return COLORS.black;
        }
    };

    const getBorder = () => {
        if (variant === 'outline') {
            return {
                borderWidth: 1,
                borderColor: disabled ? COLORS.slate700 : COLORS.primary
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
