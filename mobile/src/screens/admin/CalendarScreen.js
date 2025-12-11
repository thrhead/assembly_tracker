import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCalendarEvents } from '../../hooks/useCalendarEvents';
import EventList from '../../components/admin/EventList';

export default function CalendarScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const { markedDates, eventsByDate, loading } = useCalendarEvents();

    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const onDayPress = useCallback((day) => {
        setSelectedDate(day.dateString);
    }, []);

    const eventsForSelectedDate = useMemo(() => {
        return eventsByDate[selectedDate] || [];
    }, [eventsByDate, selectedDate]);

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>{'< Geri'}</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Takvim</Text>
                <View style={{ width: 50 }} />
            </View>

            <Calendar
                current={selectedDate}
                markingType={'multi-dot'}
                markedDates={{
                    ...markedDates,
                    [selectedDate]: {
                        ...markedDates[selectedDate],
                        selected: true,
                        selectedColor: '#39FF14',
                        selectedTextColor: '#000000'
                    }
                }}
                onDayPress={onDayPress}
                theme={{
                    calendarBackground: '#0f172a',
                    textSectionTitleColor: '#94a3b8',
                    selectedDayBackgroundColor: '#39FF14',
                    selectedDayTextColor: '#000000',
                    todayTextColor: '#39FF14',
                    dayTextColor: '#e2e8f0',
                    textDisabledColor: '#475569',
                    dotColor: '#39FF14',
                    selectedDotColor: '#000000',
                    arrowColor: '#39FF14',
                    monthTextColor: '#e2e8f0',
                    textDayFontWeight: '400',
                    textMonthFontWeight: 'bold',
                    textDayHeaderFontWeight: '500',
                }}
            />

            <EventList
                selectedDate={selectedDate}
                events={eventsForSelectedDate}
                onEventPress={(id) => navigation.navigate('JobDetail', { jobId: id })}
            />

            {loading && (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color="#39FF14" />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#1e293b',
    },
    backButton: {
        padding: 8,
    },
    backButtonText: {
        fontSize: 16,
        color: '#39FF14',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#e2e8f0',
    },
    loader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
    },
});
