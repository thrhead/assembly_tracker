
'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPinIcon, NavigationIcon, RefreshCwIcon } from 'lucide-react'
import { toast } from 'sonner'
import dynamic from 'next/dynamic'

// Leaflet is for client side only
const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(m => m.Popup), { ssr: false })
const Polyline = dynamic(() => import('react-leaflet').then(m => m.Polyline), { ssr: false })

interface Job {
    id: string
    title: string
    latitude: number | null
    longitude: number | null
    customer: { company: string }
}

export function RouteOptimizer() {
    const [jobs, setJobs] = useState<Job[]>([])
    const [optimizedJobs, setOptimizedJobs] = useState<Job[]>([])
    const [loading, setLoading] = useState(false)
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

    const fetchOptimizedRoute = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/jobs/optimize-routes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date: selectedDate })
            })
            const data = await res.json()
            setOptimizedJobs(data)
            toast.success('Rota optimize edildi')
        } catch (error) {
            toast.error('Optimizasyon sırasında hata oluştu')
        } finally {
            setLoading(false)
        }
    }

    const routeCoords: [number, number][] = optimizedJobs
        .filter(j => j.latitude !== null && j.longitude !== null)
        .map(j => [j.latitude!, j.longitude!])

    return (
        <Card className="p-6 bg-card/50 backdrop-blur-sm border-border overflow-hidden min-h-[600px] flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <MapPinIcon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold">Rota Optimizasyonu</h3>
                </div>
                <div className="flex items-center gap-4">
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="bg-background border rounded-md px-3 py-1 text-sm focus:ring-1 focus:ring-primary outline-none"
                    />
                    <Button onClick={fetchOptimizedRoute} disabled={loading} size="sm">
                        {loading ? <RefreshCwIcon className="w-4 h-4 mr-2 animate-spin" /> : <NavigationIcon className="w-4 h-4 mr-2" />}
                        Optimize Et
                    </Button>
                </div>
            </div>

            <div className="flex-1 rounded-xl overflow-hidden border border-border relative bg-muted/20">
                {typeof window !== 'undefined' ? (
                    <MapContainer
                        center={[41.0082, 28.9784]} // Default to Istanbul
                        zoom={10}
                        style={{ height: '500px', width: '100%' }}
                        className="z-10"
                    >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                        {optimizedJobs.map((job, idx) => (
                            job.latitude && job.longitude && (
                                <Marker key={job.id} position={[job.latitude, job.longitude]}>
                                    <Popup>
                                        <div className="p-1">
                                            <p className="font-bold text-xs">{idx + 1}. {job.title}</p>
                                            <p className="text-[10px] text-muted-foreground">{job.customer.company}</p>
                                        </div>
                                    </Popup>
                                </Marker>
                            )
                        ))}

                        {routeCoords.length > 1 && (
                            <Polyline positions={routeCoords} color="#16A34A" weight={3} opacity={0.7} dashArray="5, 10" />
                        )}
                    </MapContainer>
                ) : (
                    <div className="flex items-center justify-center h-[500px]">Harita yükleniyor...</div>
                )}
            </div>

            {optimizedJobs.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {optimizedJobs.map((job, idx) => (
                        <div key={job.id} className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border">
                            <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                                {idx + 1}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold truncate">{job.title}</span>
                                <span className="text-[10px] text-muted-foreground">{job.customer.company}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    )
}
