'use client'

import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { getCalendarEventsAction } from '@/lib/actions/calendar'

export default function Calendar() {
    const router = useRouter()
    const [events, setEvents] = useState<any[]>([])
    const [view, setView] = useState('dayGridMonth')

    const fetchEvents = async (info: any) => {
        try {
            // Using Server Action instead of API fetch
            // But FullCalendar fetchEvents expects a promise or array.
            // Since we can't export server action from this file (it's 'use client'),
            // we need to import it.
            // Note: Server actions are async functions.

            const start = new Date(info.startStr)
            const end = new Date(info.endStr)

            const data = await getCalendarEventsAction(start, end)
            setEvents(data)
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
                    datesSet={(dateInfo: { startStr: string; endStr: string; view: { type: string } }) => {
                        fetchEvents(dateInfo)
                        setView(dateInfo.view.type)
                    }}
                    eventContent={(eventInfo: { timeText: string; event: { title: string } }) => {
                        return (
                            <div className="overflow-hidden text-xs p-0.5 cursor-pointer">
                                <div className="font-semibold truncate">{eventInfo.timeText}</div>
                                <div className="truncate font-medium">{eventInfo.event.title}</div>
                            </div>
                        )
                    }}
                    eventClick={(info: { event: { id: string } }) => {
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
