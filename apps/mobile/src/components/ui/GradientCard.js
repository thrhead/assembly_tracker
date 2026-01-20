
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/theme';

const GradientCard = ({
    children,
    style,
    onPress,
    colors = [COLORS.cardDark, '#1f2937'], // Default subtle dark gradient
    start = { x: 0, y: 0 },
    end = { x: 1, y: 1 }
}) => {
    const Container = onPress ? TouchableOpacity : View;

    return (
        <Container onPress={onPress} activeOpacity={0.9} style={[styles.container, style]}>
            <LinearGradient
                colors={colors}
                start={start}
                end={end}
                style={StyleSheet.absoluteFill}
            />
            {children}
        </Container>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        overflow: 'hidden',
        // Shadow for iOS
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        // Elevation for Android
        elevation: 8,
        position: 'relative',
    }
});

export default GradientCard;
