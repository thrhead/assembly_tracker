import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, InteractionManager } from 'react-native';
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
    // Raw events from API
    const [rawEvents, setRawEvents] = useState([]);
    const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
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

            // Just set the raw data, let useMemo handle the heavy lifting
            if (response.data) {
                setRawEvents(response.data);
            }
        } catch (error) {
            console.error('[Calendar] Error:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            // Defer fetching until after transitions
            const task = InteractionManager.runAfterInteractions(() => {
                fetchCalendarData();
            });
            return () => task.cancel();
        }, [fetchCalendarData])
    );

    // Optimized event processing using useMemo
    const { markedDates, eventsByDate } = useMemo(() => {
        const marked = {};
        const byDate = {};

        // Safety check for empty data
        if (!rawEvents || rawEvents.length === 0) {
            return { markedDates: marked, eventsByDate: byDate };
        }

        console.log('[Calendar] Processing events count:', rawEvents.length);

        rawEvents.forEach(event => {
            const startDate = new Date(event.start);
            let endDate = event.end ? new Date(event.end) : new Date(startDate);
            if (endDate < startDate) endDate = new Date(startDate);

            // Optimization: Limit the loop to reasonable range (e.g. max 60 days per event)
            // to prevent infinite loops or UI freezing on bad data
            let currentDate = new Date(startDate);
            let daysProcessed = 0;

            while (currentDate <= endDate && daysProcessed < 60) {
                const dateKey = formatDate(currentDate);

                if (!marked[dateKey]) {
                    marked[dateKey] = { dots: [] };
                }

                // Add dot if limit not reached
                if (marked[dateKey].dots.length < 3) {
                    marked[dateKey].dots.push({
                        key: event.id,
                        color: event.color || '#39FF14'
                    });
                }

                if (!byDate[dateKey]) {
                    byDate[dateKey] = [];
                }

                byDate[dateKey].push({
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
                daysProcessed++;
            }
        });

        return { markedDates: marked, eventsByDate: byDate };
    }, [rawEvents]);

    const onDayPress = useCallback((day) => {
        setSelectedDate(day.dateString);
    }, []);

    const eventsForSelectedDate = useMemo(() => {
        return eventsByDate[selectedDate] || [];
    }, [eventsByDate, selectedDate]);

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
                    {eventsForSelectedDate.length === 0 ? (
                        <Text style={styles.noEvents}>Bu tarihte planlanmış iş yok</Text>
                    ) : (
                        eventsForSelectedDate.map((event, index) => (
                            <TouchableOpacity
                                key={`${event.id}-${index}`}
                                style={[styles.eventCard, { borderLeftColor: event.color || '#39FF14' }]}
                                onPress={() => {
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
