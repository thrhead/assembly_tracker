import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../services/api';

const formatDate = (date) => {
    try {
        return date.toISOString().split('T')[0];
    } catch (e) {
        return new Date().toISOString().split('T')[0];
    }
};

export default function CalendarScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const [markedDates, setMarkedDates] = useState({});
    const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
    const [eventsForDate, setEventsForDate] = useState([]);
    const [allEvents, setAllEvents] = useState({});
    const [loading, setLoading] = useState(false);

    const fetchCalendarData = useCallback(async () => {
        try {
            setLoading(true);
            const now = new Date();
            const start = new Date(now.getFullYear(), now.getMonth() - 3, 1);
            const end = new Date(now.getFullYear(), now.getMonth() + 4, 0);

            const startStr = formatDate(start);
            const endStr = formatDate(end);

            console.log('[Calendar] Fetching:', startStr, 'to', endStr);
            const response = await api.get(`/api/calendar/events?start=${encodeURIComponent(startStr)}&end=${encodeURIComponent(endStr)}`);
            console.log('[Calendar] Response status:', response.status);
            console.log('[Calendar] Events count:', response.data?.length);

            const events = response.data;

            if (!events || events.length === 0) {
                console.log('[Calendar] No events returned from API');
                setMarkedDates({});
                setAllEvents({});
                setEventsForDate([]);
                return;
            }

            console.log('[Calendar] Sample event:', events[0]);

            const marked = {};
            const eventsByDate = {};

            events.forEach(event => {
                const startDate = new Date(event.start);
                let endDate = event.end ? new Date(event.end) : new Date(startDate);
                if (endDate < startDate) endDate = new Date(startDate);

                let currentDate = new Date(startDate);
                let safetyCounter = 0;

                while (currentDate <= endDate && safetyCounter < 365) {
                    const dateKey = formatDate(currentDate);

                    if (!marked[dateKey]) {
                        marked[dateKey] = { dots: [] };
                    }

                    // Add dot if not already added for this event (prevent duplicates if logic tweaks)
                    // Limit dots to 3 to prevent UI overflow
                    if (marked[dateKey].dots.length < 3) {
                        marked[dateKey].dots.push({
                            key: event.id,
                            color: event.color || '#39FF14'
                        });
                    }

                    if (!eventsByDate[dateKey]) {
                        eventsByDate[dateKey] = [];
                    }

                    eventsByDate[dateKey].push({
                        id: event.id,
                        title: event.title,
                        start: event.start,
                        end: event.end,
                        color: event.color,
                        status: event.extendedProps?.status,
                        location: event.extendedProps?.location,
                        assignments: event.extendedProps?.assignments
                    });

                    currentDate.setDate(currentDate.getDate() + 1);
                    safetyCounter++;
                }
            });

            console.log('[Calendar] Marked dates count:', Object.keys(marked).length);

            setMarkedDates(marked);
            setAllEvents(eventsByDate);
            const todayEvents = eventsByDate[selectedDate] || [];
            setEventsForDate(todayEvents);
            console.log('[Calendar] Events for today:', selectedDate, todayEvents.length);
        } catch (error) {
            console.error('[Calendar] Error:', error);
            console.error('[Calendar] Error response:', error.response?.data);
        } finally {
            setLoading(false);
        }
    }, [selectedDate]);

    useFocusEffect(
        useCallback(() => {
            fetchCalendarData();
        }, [fetchCalendarData])
    );

    const onDayPress = useCallback((day) => {
        console.log('[Calendar] Day pressed:', day.dateString);
        setSelectedDate(day.dateString);
        const dayEvents = allEvents[day.dateString] || [];
        console.log('[Calendar] Events for day:', dayEvents.length);
        setEventsForDate(dayEvents);
    }, [allEvents]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'COMPLETED': return '#10B981';
            case 'IN_PROGRESS': return '#F59E0B';
            case 'PENDING': return '#6B7280';
            case 'CANCELLED': return '#EF4444';
            case 'ON_HOLD': return '#8B5CF6';
            default: return '#3788d8';
        }
    };

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

            <View style={styles.eventsContainer}>
                <Text style={styles.eventsTitle}>
                    {new Date(selectedDate).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    })}
                </Text>
                <ScrollView style={styles.eventsList}>
                    {eventsForDate.length === 0 ? (
                        <Text style={styles.noEvents}>Bu tarihte planlanmış iş yok</Text>
                    ) : (
                        eventsForDate.map((event, index) => (
                            <TouchableOpacity
                                key={`${event.id}-${index}`}
                                style={[styles.eventCard, { borderLeftColor: event.color || '#39FF14' }]}
                                onPress={() => {
                                    console.log('[Calendar] Navigating to JobDetail with ID:', event.id);
                                    navigation.navigate('JobDetail', { jobId: event.id });
                                }}
                            >
                                <Text style={styles.eventTitle}>{event.title}</Text>
                                {event.status && (
                                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(event.status) }]}>
                                        <Text style={styles.statusText}>{event.status}</Text>
                                    </View>
                                )}
                                {event.location && (
                                    <Text style={styles.eventDetail}>📍 {event.location}</Text>
                                )}
                                {event.assignments && (
                                    <Text style={styles.eventDetail}>👤 {event.assignments}</Text>
                                )}
                            </TouchableOpacity>
                        ))
                    )}
                </ScrollView>
            </View>

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
    eventsContainer: {
        flex: 1,
        padding: 16,
        backgroundColor: '#0f172a',
    },
    eventsTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#e2e8f0',
        marginBottom: 12,
    },
    eventsList: {
        flex: 1,
    },
    noEvents: {
        textAlign: 'center',
        color: '#64748b',
        marginTop: 24,
    },
    eventCard: {
        backgroundColor: '#1e293b',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        borderLeftWidth: 4,
    },
    eventTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#e2e8f0',
        marginBottom: 8,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        marginBottom: 8,
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500',
    },
    eventDetail: {
        fontSize: 14,
        color: '#94a3b8',
        marginTop: 4,
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
