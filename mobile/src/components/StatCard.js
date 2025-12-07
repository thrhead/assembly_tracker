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
            <View style={[styles.iconBox, { backgroundColor: `${iconColor}15` }]}>
                <MaterialIcons name={icon} size={28} color={iconColor} />
            </View>
            <View style={styles.textContainer}>
                <Text style={[styles.number, { color: COLORS.white }]}>
                    {value}
                </Text>
                <Text style={styles.label}>{label}</Text>
            </View>
        </GradientCard>
    );
};

const styles = StyleSheet.create({
    card: {
        flex: 1,
        padding: 16,
        borderRadius: 20,
        margin: 6,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        minHeight: 140, // Ensure nice height
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    iconBox: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    textContainer: {
        width: '100%',
    },
    number: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 4,
        letterSpacing: 0.5,
    },
    label: {
        color: COLORS.slate400,
        fontSize: 13,
        fontWeight: '500',
    },
});

export default StatCard;
