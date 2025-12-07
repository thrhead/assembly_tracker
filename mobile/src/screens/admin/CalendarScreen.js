import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Agenda } from 'react-native-calendars';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../../services/api';

// Helper to format date as YYYY-MM-DD
const formatDate = (date) => {
    return date.toISOString().split('T')[0];
};

// Static objects defined OUTSIDE the component to prevent re-creation on every render
const THEME = {
    agendaDayTextColor: '#333',
    agendaDayNumColor: '#333',
    agendaTodayColor: '#4f46e5',
    agendaKnobColor: '#4f46e5',
    selectedDayBackgroundColor: '#4f46e5',
    dotColor: '#4f46e5',
};

const RenderEmptyDate = () => {
    return (
        <View style={styles.emptyDate}>
            <Text style={{ color: '#999' }}>Planlanmış iş yok</Text>
        </View>
    );
};

export default function CalendarScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const [items, setItems] = useState({});
    const [loading, setLoading] = useState(false);

    // Memoize the today date string so it doesn't change on re-renders
    const todayStr = useMemo(() => formatDate(new Date()), []);

    // Load items for a month
    const loadItems = useCallback(async (day) => {
        // day is { timestamp, dateString, day, month, year }
        const start = new Date(day.timestamp);
        start.setDate(1); // 1st of month

        const end = new Date(start);
        end.setMonth(end.getMonth() + 1);
        end.setDate(0); // Last of month

        // API expects ISO strings
        const startStr = formatDate(start);
        const endStr = formatDate(end);

        try {
            // Only fetch, don't set loading state to avoid re-renders if not strictly necessary for UI blocking
            const response = await api.get(`/calendar/events?start=${startStr}&end=${endStr}`);
            const events = response.data;

            setItems(prevItems => {
                const newItems = { ...prevItems };
                let hasChanges = false;

                events.forEach(event => {
                    // Calculate all dates for this event (multi-day support)
                    // The API returns 'start' and 'end' as ISO strings
                    const startDate = new Date(event.start);
                    const endDate = new Date(event.end);

                    // Loop from start date to end date
                    let currentDate = new Date(startDate);
                    while (currentDate <= endDate) {
                        const dateKey = formatDate(currentDate);

                        if (!newItems[dateKey]) {
                            newItems[dateKey] = [];
                            hasChanges = true;
                        }

                        // Avoid duplicates if reloading
                        const exists = newItems[dateKey].find(i => i.id === event.id);
                        if (!exists) {
                            newItems[dateKey].push({
                                id: event.id,
                                name: event.title,
                                height: 80,
                                start: event.start,
                                end: event.end,
                                color: event.color,
                                details: event.extendedProps
                            });
                            hasChanges = true;
                        }

                        // Move to next day
                        currentDate.setDate(currentDate.getDate() + 1);
                    }
                });

                // Only return new object if we actually changed something to avoid unnecessary updates
                return hasChanges ? newItems : prevItems;
            });
        } catch (error) {
            console.error('Calendar fetch error', error);
        }
    }, []);

    const renderItem = useCallback((item) => {
        // Determine the ID correctly - item.id should be the jobId according to how we map it.
        // In the API (Calendar/route.ts), event.id IS job.id.
        return (
            <TouchableOpacity
                style={[styles.item, { borderLeftColor: item.color || '#3788d8' }]}
                onPress={() => {
                    // Navigate to JobDetailScreen with jobId
                    navigation.navigate('JobDetail', { jobId: item.id });
                }}
            >
                <Text style={styles.itemTitle}>{item.name}</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={styles.itemTime}>{item.start.split('T')[1].substring(0, 5)}</Text>
                    <Text style={[styles.itemTime, { color: item.color }]}>{item.details.status}</Text>
                </View>
                <Text style={[styles.itemTime, { marginTop: 2 }]}>{item.details.assignments}</Text>
            </TouchableOpacity>
        );
    }, [navigation]);

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>{'< Geri'}</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Takvim</Text>
                <View style={{ width: 50 }} />
            </View>
            <Agenda
                items={items}
                loadItemsForMonth={loadItems}
                selected={todayStr}
                renderItem={renderItem}
                renderEmptyDate={RenderEmptyDate}
                showClosingKnob={true}
                theme={THEME}
                showOnlySelectedDayItems={true}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    backButton: {
        padding: 8,
    },
    backButtonText: {
        color: '#4f46e5',
        fontWeight: '600',
    },
    item: {
        backgroundColor: 'white',
        flex: 1,
        borderRadius: 5,
        padding: 10,
        marginRight: 10,
        marginTop: 17,
        borderLeftWidth: 4,
        elevation: 2,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    itemTime: {
        fontSize: 12,
        color: '#666',
    },
    emptyDate: {
        height: 15,
        flex: 1,
        paddingTop: 30,
        alignItems: 'center'
    }
});
