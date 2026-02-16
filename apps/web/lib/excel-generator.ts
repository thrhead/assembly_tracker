import * as XLSX from 'xlsx'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

// Types
interface JobData {
    id: string
    title: string
    status: string
    priority: string
    location: string
    scheduledDate: Date | null
    completedDate: Date | null
    customer: {
        company: string
        address: string
        user: { name: string; phone: string; email: string }
    }
    steps: Array<{
        title: string
        isCompleted: boolean
        order: number
        subSteps?: Array<{ title: string; isCompleted: boolean }>
    }>
    costs: Array<{
        amount: number
        category: string
        description: string
        status: string
        date: Date
    }>
    team?: {
        name: string
        members: Array<{ user: { name: string; role: string } }>
    }
}

interface JobListItem {
    id: string
    title: string
    status: string
    priority: string
    customerName: string
    teamName: string
    progress: number
    totalCost: number
    scheduledDate: Date
}

interface CostData {
    id: string
    jobTitle: string
    category: string
    description: string
    amount: number
    status: string
    date: Date
    createdBy: string
}

// Utility functions
const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
    }).format(amount)
}

const formatDate = (date: Date | null): string => {
    if (!date) return '-'
    return format(new Date(date), 'dd.MM.yyyy', { locale: tr })
}

const statusLabels: Record<string, string> = {
    PENDING: 'Beklemede',
    IN_PROGRESS: 'Devam Ediyor',
    COMPLETED: 'Tamamlandı',
    CANCELLED: 'İptal',
    ON_HOLD: 'Beklemede',
    APPROVED: 'Onaylandı',
    REJECTED: 'Reddedildi',
}

const priorityLabels: Record<string, string> = {
    LOW: 'Düşük',
    MEDIUM: 'Orta',
    HIGH: 'Yüksek',
}

// Generate single job Excel report
export function generateJobExcel(jobData: JobData) {
    const wb = XLSX.utils.book_new()

    // Job Info Sheet
    const jobInfoData = [
        ['İŞ RAPORU'],
        [],
        ['İş Bilgileri'],
        ['Başlık', jobData.title],
        ['Durum', statusLabels[jobData.status] || jobData.status],
        ['Öncelik', priorityLabels[jobData.priority] || jobData.priority],
        ['Lokasyon', jobData.location],
        ['Planlanan Tarih', formatDate(jobData.scheduledDate)],
        ['Tamamlanma Tarihi', formatDate(jobData.completedDate)],
        [],
        ['Müşteri Bilgileri'],
        ['Şirket', jobData.customer.company],
        ['Adres', jobData.customer.address],
        ['İletişim Kişisi', jobData.customer.user.name],
        ['Telefon', jobData.customer.user.phone],
        ['E-posta', jobData.customer.user.email],
    ]

    if (jobData.team) {
        jobInfoData.push([])
        jobInfoData.push(['Ekip Bilgileri'])
        jobInfoData.push(['Ekip Adı', jobData.team.name])
        jobInfoData.push(['Ekip Üyeleri', ''])
        jobData.team.members.forEach((member) => {
            jobInfoData.push(['', `${member.user.name} (${member.user.role})`])
        })
    }

    const ws1 = XLSX.utils.aoa_to_sheet(jobInfoData)
    ws1['!cols'] = [{ wch: 20 }, { wch: 50 }]
    XLSX.utils.book_append_sheet(wb, ws1, 'İş Bilgileri')

    // Steps Sheet
    const stepsData = [['#', 'Adım', 'Alt Görevler', 'Durum']]
    jobData.steps.forEach((step) => {
        const subStepsText = step.subSteps?.map((sub) =>
            `${sub.isCompleted ? '✓' : '○'} ${sub.title}`
        ).join('\n') || '-'

        stepsData.push([
            step.order.toString(),
            step.title,
            subStepsText,
            step.isCompleted ? 'Tamamlandı' : 'Bekliyor',
        ])
    })

    const ws2 = XLSX.utils.aoa_to_sheet(stepsData)
    ws2['!cols'] = [{ wch: 5 }, { wch: 30 }, { wch: 40 }, { wch: 15 }]
    XLSX.utils.book_append_sheet(wb, ws2, 'Adımlar')

    // Costs Sheet
    if (jobData.costs.length > 0) {
        const costsData = [['Tarih', 'Kategori', 'Açıklama', 'Tutar', 'Durum']]

        jobData.costs.forEach((cost) => {
            costsData.push([
                formatDate(cost.date),
                cost.category,
                cost.description,
                cost.amount.toString(),
                statusLabels[cost.status] || cost.status,
            ])
        })

        const totalApproved = jobData.costs
            .filter((c) => c.status === 'APPROVED')
            .reduce((sum, c) => sum + c.amount, 0)

        costsData.push([])
        costsData.push(['', '', 'TOPLAM ONAYLANAN:', totalApproved.toString(), ''])

        const ws3 = XLSX.utils.aoa_to_sheet(costsData)
        ws3['!cols'] = [{ wch: 12 }, { wch: 15 }, { wch: 40 }, { wch: 12 }, { wch: 15 }]
        XLSX.utils.book_append_sheet(wb, ws3, 'Maliyetler')
    }

    // Generate filename and download
    const filename = `Is_Raporu_${jobData.title.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd')}.xlsx`
    XLSX.writeFile(wb, filename)
}

// Generate jobs list Excel
export function generateJobsListExcel(jobs: JobListItem[]) {
    const wb = XLSX.utils.book_new()

    const data = [
        ['İŞ LİSTESİ'],
        [],
        ['#', 'Başlık', 'Durum', 'Öncelik', 'Müşteri', 'Ekip', 'İlerleme (%)', 'Toplam Maliyet', 'Planlanan Tarih'],
    ]

    jobs.forEach((job, index) => {
        data.push([
            (index + 1).toString(),
            job.title,
            statusLabels[job.status] || job.status,
            priorityLabels[job.priority] || job.priority,
            job.customerName,
            job.teamName || 'Atanmamış',
            job.progress.toString(),
            job.totalCost.toString(),
            formatDate(job.scheduledDate),
        ])
    })

    const ws = XLSX.utils.aoa_to_sheet(data)
    ws['!cols'] = [
        { wch: 5 },
        { wch: 30 },
        { wch: 15 },
        { wch: 12 },
        { wch: 25 },
        { wch: 20 },
        { wch: 12 },
        { wch: 15 },
        { wch: 15 },
    ]

    XLSX.utils.book_append_sheet(wb, ws, 'İşler')

    const filename = `Is_Listesi_${format(new Date(), 'yyyyMMdd')}.xlsx`
    XLSX.writeFile(wb, filename)
}

// Generate cost report Excel
export function generateCostExcel(costs: CostData[]) {
    const wb = XLSX.utils.book_new()

    const data = [
        ['MALİYET RAPORU'],
        [],
        ['Tarih', 'İş', 'Kategori', 'Açıklama', 'Tutar', 'Durum', 'Oluşturan'],
    ]

    costs.forEach((cost) => {
        data.push([
            formatDate(cost.date),
            cost.jobTitle,
            cost.category,
            cost.description,
            cost.amount.toString(),
            statusLabels[cost.status] || cost.status,
            cost.createdBy,
        ])
    })

    // Calculate totals
    const totalPending = costs.filter((c) => c.status === 'PENDING').reduce((sum, c) => sum + c.amount, 0)
    const totalApproved = costs.filter((c) => c.status === 'APPROVED').reduce((sum, c) => sum + c.amount, 0)
    const totalRejected = costs.filter((c) => c.status === 'REJECTED').reduce((sum, c) => sum + c.amount, 0)

    data.push([])
    data.push(['', '', '', 'TOPLAM BEKLEYEN:', totalPending.toString(), '', ''])
    data.push(['', '', '', 'TOPLAM ONAYLANAN:', totalApproved.toString(), '', ''])
    data.push(['', '', '', 'TOPLAM REDDEDİLEN:', totalRejected.toString(), '', ''])
    data.push(['', '', '', 'GENEL TOPLAM:', (totalPending + totalApproved + totalRejected).toString(), '', ''])

    const ws = XLSX.utils.aoa_to_sheet(data)
    ws['!cols'] = [
        { wch: 12 },
        { wch: 25 },
        { wch: 15 },
        { wch: 40 },
        { wch: 12 },
        { wch: 15 },
        { wch: 20 },
    ]

    XLSX.utils.book_append_sheet(wb, ws, 'Maliyetler')

    const filename = `Maliyet_Raporu_${format(new Date(), 'yyyyMMdd')}.xlsx`
    XLSX.writeFile(wb, filename)
}
