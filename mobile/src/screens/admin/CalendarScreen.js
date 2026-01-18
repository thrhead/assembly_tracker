import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCalendarEvents } from '../../hooks/useCalendarEvents';
import EventList from '../../components/admin/EventList';
import { useTheme } from '../../context/ThemeContext';

export default function CalendarScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const { theme, isDark } = useTheme();
    const { markedDates, eventsByDate, loading } = useCalendarEvents();

    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const onDayPress = useCallback((day) => {
        setSelectedDate(day.dateString);
    }, []);

    const eventsForSelectedDate = useMemo(() => {
        return eventsByDate[selectedDate] || [];
    }, [eventsByDate, selectedDate]);

    // Dynamic Calendar Theme
    const calendarTheme = {
        calendarBackground: theme.colors.card,
        textSectionTitleColor: theme.colors.subText,
        selectedDayBackgroundColor: theme.colors.primary,
        selectedDayTextColor: theme.colors.textInverse,
        todayTextColor: theme.colors.primary,
        dayTextColor: theme.colors.text,
        textDisabledColor: theme.colors.subText + '50', // Opacity for disabled
        dotColor: theme.colors.primary,
        selectedDotColor: theme.colors.textInverse,
        arrowColor: theme.colors.primary,
        monthTextColor: theme.colors.text,
        textDayFontWeight: '400',
        textMonthFontWeight: 'bold',
        textDayHeaderFontWeight: '500',
    };

    const dynamicMarkedDates = useMemo(() => {
        const marked = { ...markedDates };
        // Update marker colors for theme
        Object.keys(marked).forEach(date => {
            if (marked[date].dots) {
                marked[date].dots = marked[date].dots.map(dot => ({
                    ...dot,
                    color: dot.color === '#39FF14' ? theme.colors.primary : dot.color // Map legacy green to primary
                }));
            }
        });

        // Add selected date styling
        marked[selectedDate] = {
            ...(marked[selectedDate] || {}),
            selected: true,
            selectedColor: theme.colors.primary,
            selectedTextColor: theme.colors.textInverse,
        };
        return marked;
    }, [markedDates, selectedDate, theme]);

    return (
        <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
            <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>{'< Geri'}</Text>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Takvim</Text>
                <View style={{ width: 50 }} />
            </View>

            <Calendar
                current={selectedDate}
                markingType={'multi-dot'}
                markedDates={dynamicMarkedDates}
                onDayPress={onDayPress}
                theme={calendarTheme}
                key={isDark ? 'dark' : 'light'} // Force re-render on theme change
            />

            <EventList
                selectedDate={selectedDate}
                events={eventsForSelectedDate}
                onEventPress={(id) => navigation.navigate('JobDetail', { jobId: id })}
                theme={theme}
            />

            {loading && (
                <View style={[styles.loader, { backgroundColor: theme.colors.background + 'B3' }]}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 8,
    },
    backButtonText: {
        fontSize: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    loader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
