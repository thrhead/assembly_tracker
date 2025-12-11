import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { getStatusColor } from '../../utils/status-helper';

const EventList = ({ selectedDate, events, onEventPress }) => {
    return (
        <View style={styles.eventsContainer}>
            <Text style={styles.eventsTitle}>
                {new Date(selectedDate).toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                })}
            </Text>
            <ScrollView style={styles.eventsList}>
                {events.length === 0 ? (
                    <Text style={styles.noEvents}>Bu tarihte planlanmış iş yok</Text>
                ) : (
                    events.map((event, index) => (
                        <TouchableOpacity
                            key={`${event.id}-${index}`}
                            style={[styles.eventCard, { borderLeftColor: event.color || '#39FF14' }]}
                            onPress={() => onEventPress(event.id)}
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
    );
};

const styles = StyleSheet.create({
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
});

export default EventList;
