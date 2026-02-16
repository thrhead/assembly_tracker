import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const GlassCard = ({ children, style, onPress, theme: propTheme }) => {
    const { theme: contextTheme } = useTheme();
    const theme = propTheme || contextTheme;

    const CardContent = (
        <View style={[
            styles.glassCard,
            {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.cardBorder
            },
            style
        ]}>
            {children}
        </View>
    );

    if (onPress) {
        return (
            <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
                {CardContent}
            </TouchableOpacity>
        );
    }

    return CardContent;
};

const styles = StyleSheet.create({
    glassCard: {
        borderRadius: 22, // Match HTML rounded-[22px]
        borderWidth: 1,
        overflow: 'hidden',
    }
});

export default GlassCard;
