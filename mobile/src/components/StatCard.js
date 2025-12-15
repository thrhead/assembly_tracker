import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import GradientCard from './ui/GradientCard';

const StatCard = ({
    label,
    value,
    icon,
    iconColor = COLORS.primary,
    gradientColors = [COLORS.cardDark, '#1e293b'],
    style
}) => {
    return (
        <GradientCard
            colors={gradientColors}
            style={[styles.card, style]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <View style={styles.contentContainer}>
                <View style={[styles.iconBox, { backgroundColor: `${iconColor}15` }]}>
                    <MaterialIcons name={icon} size={24} color={iconColor} />
                </View>
                <View style={styles.textContainer}>
                    <Text style={[styles.number, { color: COLORS.white }]}>
                        {value}
                    </Text>
                    <Text style={styles.label} numberOfLines={1}>{label}</Text>
                </View>
            </View>
        </GradientCard>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 20,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        // Shadow for depth
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconBox: {
        width: 42,
        height: 42,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    number: {
        fontSize: 24,
        fontWeight: '800',
        lineHeight: 28,
        letterSpacing: -0.5,
    },
    label: {
        color: COLORS.slate400,
        fontSize: 12,
        fontWeight: '600',
        marginTop: 2,
    },
});

export default StatCard;
