import React from 'react';
import { TextInput, Platform, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/theme';

export const WebInput = ({ style, value, onChangeText, placeholder, inputMode, ...props }) => {
    if (Platform.OS === 'web') {
        return (
            <input
                type={inputMode === 'decimal' ? 'number' : 'text'}
                inputMode={inputMode}
                step={inputMode === 'decimal' ? '0.01' : undefined}
                value={value}
                onChange={(e) => onChangeText(e.target.value)}
                placeholder={placeholder}
                style={{
                    backgroundColor: 'rgba(255,255,255,0.05)', // Hardcoded COLORS.cardBorder equivalent
                    borderRadius: '12px',
                    padding: '16px',
                    color: '#FFF', // COLORS.textLight equivalent
                    fontSize: '16px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    width: '100%',
                    boxSizing: 'border-box',
                    outline: 'none',
                    fontFamily: 'inherit',
                    marginBottom: '16px' // Common margin
                }}
            />
        );
    }
    return (
        <TextInput
            style={style}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={COLORS.textGray}
            {...props}
        />
    );
};
