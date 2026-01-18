import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { COLORS, RADIUS } from '../../constants/theme';

const CircularProgress = ({
    percentage = 0,
    size = 48,
    strokeWidth = 3,
    color = COLORS.electricBlue,
    backgroundColor = COLORS.slate100,
    showLabel = true,
    labelStyle
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            <Svg width={size} height={size} style={styles.svg}>
                {/* Background Circle */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={backgroundColor}
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                {/* Progress Circle */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    rotation="-90"
                    origin={`${size / 2}, ${size / 2}`}
                />
            </Svg>
            {showLabel && (
                <View style={styles.labelContainer}>
                    <Text style={[styles.label, labelStyle]}>
                        {Math.round(percentage)}%
                    </Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
    },
    svg: {
        transform: [{ rotateZ: '-90deg' }],
    },
    labelContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    label: {
        fontSize: 10,
        fontWeight: '700',
        color: COLORS.slate800,
    },
});

export default CircularProgress;
