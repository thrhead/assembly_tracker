import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

const DateFilter = ({ startDate, endDate, onStartDateChange, onEndDateChange, theme }) => {
    const { t, i18n } = useTranslation();
    const colors = theme ? theme.colors : COLORS;
    const [showStart, setShowStart] = useState(false);
    const [showEnd, setShowEnd] = useState(false);

    const handleStartChange = (event, selectedDate) => {
        setShowStart(Platform.OS === 'ios');
        if (selectedDate) {
            onStartDateChange(selectedDate);
        }
    };

    const handleEndChange = (event, selectedDate) => {
        setShowEnd(Platform.OS === 'ios');
        if (selectedDate) {
            onEndDateChange(selectedDate);
        }
    };

    const formatDate = (date) => {
        if (!date) return t('common.search'); // Or a "Select Date" key
        return date.toLocaleDateString(i18n.language === 'tr' ? 'tr-TR' : 'en-US');
    };

    return (
        <View style={styles.container}>
            <View style={styles.dateButtonContainer}>
                <Text style={[styles.label, { color: colors.subText }]}>{t('jobs.start')}</Text>
                <TouchableOpacity
                    style={[styles.dateButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    onPress={() => setShowStart(true)}
                >
                    <MaterialIcons name="event" size={20} color={colors.primary} />
                    <Text style={[styles.dateText, { color: colors.text }]}>{formatDate(startDate)}</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.dateButtonContainer}>
                <Text style={[styles.label, { color: colors.subText }]}>{t('jobs.end')}</Text>
                <TouchableOpacity
                    style={[styles.dateButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    onPress={() => setShowEnd(true)}
                >
                    <MaterialIcons name="event" size={20} color={colors.primary} />
                    <Text style={[styles.dateText, { color: colors.text }]}>{formatDate(endDate)}</Text>
                </TouchableOpacity>
            </View>

            {showStart && (
                <DateTimePicker
                    value={startDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={handleStartChange}
                    maximumDate={endDate || new Date()}
                />
            )}

            {showEnd && (
                <DateTimePicker
                    value={endDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={handleEndChange}
                    minimumDate={startDate}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 12,
        marginBottom: 12,
    },
    dateButtonContainer: {
        flex: 1,
    },
    label: {
        fontSize: 12,
        marginBottom: 4,
        marginLeft: 4,
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        gap: 8,
    },
    dateText: {
        fontSize: 14,
    },
});

export default DateFilter;
