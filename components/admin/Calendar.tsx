'use client'

import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'

export default function Calendar() {
    const router = useRouter()
    const [events, setEvents] = useState([])
    const [view, setView] = useState('dayGridMonth')

    const fetchEvents = async (info: any) => {
        try {
            const start = info.startStr
            const end = info.endStr
            // Encode dates to prevent + from becoming space in URL
            const url = `/api/calendar/events?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;

            const res = await fetch(url)

            if (res.ok) {
                const data = await res.json()
                setEvents(data)
            }
        } catch (error: any) {
            console.error('Failed to fetch calendar events:', error)
        }
    }

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="pb-2">
                <CardTitle>Takvim ve Kaynak Planlama</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
                <style jsx global>{`
          .fc {
            height: 100%;
            font-family: inherit;
          }
          .fc-toolbar-title {
            font-size: 1.25rem !important;
            font-weight: 600;
          }
          .fc-button-primary {
            background-color: #4f46e5 !important;
            border-color: #4f46e5 !important;
          }
          .fc-button-primary:hover {
            background-color: #4338ca !important;
            border-color: #4338ca !important;
          }
          .fc-button-active {
            background-color: #3730a3 !important;
            border-color: #3730a3 !important;
          }
        `}</style>
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView={view}
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay'
                    }}
                    locale="tr"
                    buttonText={{
                        today: 'Bugün',
                        month: 'Ay',
                        week: 'Hafta',
                        day: 'Gün'
                    }}
                    events={events}
                    datesSet={(dateInfo) => {
                        fetchEvents(dateInfo)
                        setView(dateInfo.view.type)
                    }}
                    eventContent={(eventInfo) => {
                        return (
                            <div className="overflow-hidden text-xs p-0.5 cursor-pointer">
                                <div className="font-semibold truncate">{eventInfo.timeText}</div>
                                <div className="truncate font-medium">{eventInfo.event.title}</div>
                            </div>
                        )
                    }}
                    eventClick={(info) => {
                        router.push(`/admin/jobs/${info.event.id}`)
                    }}
                    height="100%"
                    allDaySlot={false}
                    slotMinTime="08:00:00"
                    slotMaxTime="20:00:00"
                    expandRows={true}
                />
            </CardContent>
        </Card>
    )
}
