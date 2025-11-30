import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

const StatCard = ({
    label,
    value,
    icon,
    iconColor = COLORS.primary,
    backgroundColor = COLORS.cardDark,
    style
}) => {
    return (
        <View style={[styles.card, { backgroundColor }, style]}>
            <View style={[styles.iconBox, { backgroundColor: `${iconColor}1A` }]}>
                <MaterialIcons name={icon} size={24} color={iconColor} />
            </View>
            <Text style={[styles.number, { color: iconColor === COLORS.primary ? COLORS.white : iconColor }]}>
                {value}
            </Text>
            <Text style={styles.label}>{label}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        margin: 6,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    number: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    label: {
        color: COLORS.slate400,
        fontSize: 14,
        textAlign: 'center',
    },
});

export default StatCard;
