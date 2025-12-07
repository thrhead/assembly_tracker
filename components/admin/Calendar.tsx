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
            const res = await fetch(`/api/calendar/events?start=${start}&end=${end}`)
            if (res.ok) {
                const data = await res.json()
                setEvents(data)
            }
        } catch (error) {
            console.error('Failed to fetch events', error)
        }
    }

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
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
                        // Show details in a simple alert for now, or consider a dialog
                        const props = info.event.extendedProps
                        const message = `İş: ${info.event.title}\nDurum: ${props.status}\nKonum: ${props.location || 'Belirtilmedi'}\nAtamalar: ${props.assignments || 'Atama Yok'}`
                        alert(message)
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
