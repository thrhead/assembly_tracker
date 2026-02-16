import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { COLORS } from '../constants/theme';

const LanguageSwitcher = ({ compact = false }) => {
    const { t, i18n } = useTranslation();
    const { theme } = useTheme();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    const currentLanguage = i18n.language;

    return (
        <View style={[styles.container, compact && styles.compactContainer]}>
            {!compact && (
                <Text style={[styles.label, { color: theme.colors.text }]}>
                    {t('settings.language')}
                </Text>
            )}
            <View style={[styles.optionsContainer, compact && styles.compactOptions]}>
                <TouchableOpacity
                    style={[
                        styles.option,
                        { borderColor: theme.colors.border },
                        compact && styles.compactOption,
                        currentLanguage === 'tr' && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                    ]}
                    onPress={() => changeLanguage('tr')}
                >
                    <Text style={[
                        styles.optionText,
                        { color: theme.colors.text },
                        compact && { fontSize: 12 },
                        currentLanguage === 'tr' && { color: '#fff', fontWeight: 'bold' }
                    ]}>TR</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.option,
                        { borderColor: theme.colors.border },
                        compact && styles.compactOption,
                        currentLanguage === 'en' && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                    ]}
                    onPress={() => changeLanguage('en')}
                >
                    <Text style={[
                        styles.optionText,
                        { color: theme.colors.text },
                        compact && { fontSize: 12 },
                        currentLanguage === 'en' && { color: '#fff', fontWeight: 'bold' }
                    ]}>EN</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 10,
        paddingHorizontal: 20,
    },
    compactContainer: {
        marginVertical: 0,
        paddingHorizontal: 0,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    optionsContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    compactOptions: {
        gap: 6,
    },
    option: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    compactOption: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        flex: 0,
        minWidth: 40,
        borderRadius: 6,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    optionText: {
        fontSize: 14,
    },
});

export default LanguageSwitcher;
