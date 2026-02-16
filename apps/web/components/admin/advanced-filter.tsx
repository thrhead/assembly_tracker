'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { FilterIcon } from 'lucide-react'
import { tr } from 'date-fns/locale'
import { format } from 'date-fns'

import { DateRange } from "react-day-picker"

export interface FilterState {
    dateRange?: DateRange
    status: string[]
    teams: string[]
}

interface AdvancedFilterProps {
    teams: { id: string; name: string }[]
}

const STATUS_OPTIONS = [
    { value: 'PENDING', label: 'Bekleyen' },
    { value: 'IN_PROGRESS', label: 'Devam Eden' },
    { value: 'COMPLETED', label: 'Tamamlanan' },
    { value: 'CANCELLED', label: 'İptal' },
]

export function AdvancedFilter({ teams }: AdvancedFilterProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    
    const [status, setStatus] = useState<string[]>([])
    const [selectedTeams, setTeams] = useState<string[]>([])
    const [dateRange, setDateRange] = useState<DateRange | undefined>()
    const [isOpen, setIsOpen] = useState(false)

    // Initialize state from URL params
    useEffect(() => {
        const statusParam = searchParams.get('status')
        if (statusParam) setStatus(statusParam.split(','))
        
        const teamsParam = searchParams.get('teams')
        if (teamsParam) setTeams(teamsParam.split(','))

        const from = searchParams.get('from')
        const to = searchParams.get('to')
        if (from) {
            setDateRange({
                from: new Date(from),
                to: to ? new Date(to) : undefined
            })
        }
    }, [searchParams])

    const handleStatusChange = (value: string) => {
        setStatus((prev) => 
            prev.includes(value) 
                ? prev.filter((s) => s !== value) 
                : [...prev, value]
        )
    }

    const handleTeamChange = (value: string) => {
        setTeams((prev) => 
            prev.includes(value) 
                ? prev.filter((t) => t !== value) 
                : [...prev, value]
        )
    }

    const handleDateSelect = (range: DateRange | undefined) => {
        setDateRange(range)
    }

    const applyFilters = () => {
        const params = new URLSearchParams(searchParams.toString())
        
        if (status.length > 0) params.set('status', status.join(','))
        else params.delete('status')

        if (selectedTeams.length > 0) params.set('teams', selectedTeams.join(','))
        else params.delete('teams')

        if (dateRange?.from) params.set('from', dateRange.from.toISOString())
        else params.delete('from')

        if (dateRange?.to) params.set('to', dateRange.to.toISOString())
        else params.delete('to')

        // Reset page when filtering
        params.delete('page')

        router.push(`?${params.toString()}`)
        setIsOpen(false)
    }

    const clearFilters = () => {
        setStatus([])
        setTeams([])
        setDateRange(undefined)
        
        const params = new URLSearchParams(searchParams.toString())
        params.delete('status')
        params.delete('teams')
        params.delete('from')
        params.delete('to')
        params.delete('page')
        
        router.push(`?${params.toString()}`)
        setIsOpen(false)
    }

    const activeFilterCount = (dateRange?.from ? 1 : 0) + status.length + selectedTeams.length

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2 h-10">
                    <FilterIcon className="h-4 w-4" />
                    Filtrele
                    {activeFilterCount > 0 && (
                        <Badge variant="secondary" className="ml-1 px-1 h-5 min-w-5 flex items-center justify-center">
                            {activeFilterCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="start">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="font-medium">Filtreler</h4>
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={clearFilters}>
                            Temizle
                        </Button>
                    </div>

                    {/* Date Range */}
                    <div className="space-y-2">
                        <Label>Tarih Aralığı</Label>
                        <div className="border rounded-md p-2">
                            <Calendar
                                mode="range"
                                selected={dateRange}
                                onSelect={setDateRange as any}
                                initialFocus
                                locale={tr}
                            />
                        </div>
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                        <Label>Durum</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {STATUS_OPTIONS.map((option) => (
                                <div key={option.value} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`status-${option.value}`}
                                        checked={status.includes(option.value)}
                                        onCheckedChange={() => handleStatusChange(option.value)}
                                    />
                                    <label
                                        htmlFor={`status-${option.value}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        {option.label}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Teams */}
                    <div className="space-y-2">
                        <Label>Ekipler</Label>
                        <div className="max-h-32 overflow-y-auto space-y-2 border rounded-md p-2">
                            {teams.map((team) => (
                                <div key={team.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`team-${team.id}`}
                                        checked={selectedTeams.includes(team.id)}
                                        onCheckedChange={() => handleTeamChange(team.id)}
                                    />
                                    <label
                                        htmlFor={`team-${team.id}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        {team.name}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Button className="w-full" onClick={applyFilters}>
                        Uygula
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    )
}
