"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ReportFiltersProps {
    jobs?: { id: string; title: string }[];
    categories?: string[];
    onFilterChange?: (range: DateRange | undefined) => void;
}

export default function ReportFilters({ jobs = [], categories = [], onFilterChange }: ReportFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const date = (() => {
        const from = searchParams.get("from");
        const to = searchParams.get("to");
        return from && to ? { from: new Date(from), to: new Date(to) } : undefined;
    })();

    const jobStatus = searchParams.get("jobStatus") || "all";
    const selectedJobId = searchParams.get("jobId") || "all";
    const selectedCategory = searchParams.get("category") || "all";

    const updateFilters = (updates: Record<string, string | DateRange | undefined>) => {
        const params = new URLSearchParams(searchParams.toString());

        Object.entries(updates).forEach(([key, value]) => {
            if (key === 'date') {
                const range = value as DateRange | undefined;
                if (range?.from) params.set("from", range.from.toISOString());
                else params.delete("from");
                if (range?.to) params.set("to", range.to.toISOString());
                else params.delete("to");
            } else if (key === 'jobStatus') {
                if (value && value !== "all") params.set(key, value as string);
                else params.delete(key);
                // Reset selected job when status changes
                params.delete("jobId");
            } else {
                if (value && value !== "all") params.set(key, value as string);
                else params.delete(key);
            }
        });

        router.push(`?${params.toString()}`);
    };

    return (
        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                            "w-[260px] justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                            date.to ? (
                                <>{format(date.from, "dd.MM.yy")} - {format(date.to, "dd.MM.yy")}</>
                            ) : (
                                format(date.from, "dd.MM.yy")
                            )
                        ) : (
                            <span>Tüm Zamanlar</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={(newDate) => updateFilters({ date: newDate })}
                        numberOfMonths={2}
                    />
                </PopoverContent>
            </Popover>

            <Select value={jobStatus} onValueChange={(val) => updateFilters({ jobStatus: val })}>
                <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="İş Durumu" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Tüm Durumlar</SelectItem>
                    <SelectItem value="IN_PROGRESS">Aktif İşler</SelectItem>
                    <SelectItem value="COMPLETED">Tamamlananlar</SelectItem>
                    <SelectItem value="PENDING">Bekleyenler</SelectItem>
                </SelectContent>
            </Select>

            <Select value={selectedJobId} onValueChange={(val) => updateFilters({ jobId: val })}>
                <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Montaj Seçin" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Tüm Montajlar</SelectItem>
                    {jobs.map(job => (
                        <SelectItem key={job.id} value={job.id}>{job.title}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={(val) => updateFilters({ category: val })}>
                <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Tüm Kategoriler</SelectItem>
                    {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}