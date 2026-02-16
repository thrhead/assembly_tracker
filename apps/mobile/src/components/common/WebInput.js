import React from 'react';
import { TextInput, Platform, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export const WebInput = ({ style, value, onChangeText, placeholder, inputMode, ...props }) => {
    const { theme } = useTheme();

    if (Platform.OS === 'web') {
        const flattenedStyle = StyleSheet.flatten(style) || {};

        return (
            <input
                type={inputMode === 'decimal' ? 'number' : 'text'}
                inputMode={inputMode}
                step={inputMode === 'decimal' ? '0.01' : undefined}
                value={value}
                onChange={(e) => onChangeText(e.target.value)}
                placeholder={placeholder}
                style={{
                    backgroundColor: theme?.colors?.surface || 'rgba(255,255,255,0.05)',
                    borderRadius: '12px',
                    padding: '16px',
                    color: theme?.colors?.text || '#FFF',
                    fontSize: '16px',
                    border: `1px solid ${theme?.colors?.border || 'rgba(255,255,255,0.1)'}`,
                    width: '100%',
                    boxSizing: 'border-box',
                    outline: 'none',
                    fontFamily: 'inherit',
                    marginBottom: '16px',
                    ...flattenedStyle
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
            placeholderTextColor={theme?.colors?.subText || '#9ca3af'}
            {...props}
        />
    );
};
