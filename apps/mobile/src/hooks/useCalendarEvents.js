import { useState, useCallback, useMemo } from 'react';
import { InteractionManager } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api';

const formatDateISO = (date) => {
    try {
        return date.toISOString().split('T')[0];
    } catch (e) {
        return new Date().toISOString().split('T')[0];
    }
};

export const useCalendarEvents = () => {
    const [rawEvents, setRawEvents] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchCalendarData = useCallback(async () => {
        try {
            setLoading(true);
            const now = new Date();
            const start = new Date(now.getFullYear(), now.getMonth() - 3, 1);
            const end = new Date(now.getFullYear(), now.getMonth() + 4, 0);

            const startStr = formatDateISO(start);
            const endStr = formatDateISO(end);

            console.log('[Calendar] Fetching:', startStr, 'to', endStr);
            const response = await api.get(`/api/calendar/events?start=${encodeURIComponent(startStr)}&end=${encodeURIComponent(endStr)}`);

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
            const task = InteractionManager.runAfterInteractions(() => {
                fetchCalendarData();
            });
            return () => task.cancel();
        }, [fetchCalendarData])
    );

    const { markedDates, eventsByDate } = useMemo(() => {
        const marked = {};
        const byDate = {};

        if (!rawEvents || rawEvents.length === 0) {
            return { markedDates: marked, eventsByDate: byDate };
        }

        rawEvents.forEach(event => {
            const startDate = new Date(event.start);
            let endDate = event.end ? new Date(event.end) : new Date(startDate);
            if (endDate < startDate) endDate = new Date(startDate);

            let currentDate = new Date(startDate);
            let daysProcessed = 0;

            while (currentDate <= endDate && daysProcessed < 60) {
                const dateKey = formatDateISO(currentDate);

                if (!marked[dateKey]) {
                    marked[dateKey] = { dots: [] };
                }

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

    return {
        markedDates,
        eventsByDate,
        loading,
        fetchCalendarData
    };
};
