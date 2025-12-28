import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

export interface JobReportData {
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
        user: {
            name: string
            phone: string
            email: string
        }
    }
    steps: Array<{
        title: string
        isCompleted: boolean
        order: number
        subSteps?: Array<{
            title: string
            isCompleted: boolean
        }>
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
        members: Array<{
            user: {
                name: string
                role: string
            }
        }>
    }
}

export function generateJobPDF(data: JobReportData) {
    const doc = new jsPDF()

    // Set font to support Turkish characters
    doc.setFont('helvetica')

    let yPos = 20

    // Header
    doc.setFontSize(20)
    doc.setTextColor(22, 163, 74) // Green-600
    doc.text('İş Raporu', 105, yPos, { align: 'center' })

    yPos += 15
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`Oluşturulma Tarihi: ${format(new Date(), 'dd MMMM yyyy, HH:mm', { locale: tr })}`, 105, yPos, { align: 'center' })

    yPos += 15

    // Job Information
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text('İş Bilgileri', 20, yPos)
    yPos += 10

    const jobInfo = [
        ['İş Başlığı', data.title],
        ['Durum', data.status],
        ['Öncelik', data.priority],
        ['Lokasyon', data.location],
        ['Planlanan Tarih', data.scheduledDate ? format(new Date(data.scheduledDate), 'dd MMMM yyyy', { locale: tr }) : 'Belirtilmemiş'],
        ['Tamamlanma Tarihi', data.completedDate ? format(new Date(data.completedDate), 'dd MMMM yyyy', { locale: tr }) : '-']
    ]

    autoTable(doc, {
        startY: yPos,
        head: [],
        body: jobInfo,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 3 },
        columnStyles: {
            0: { fontStyle: 'bold', fillColor: [248, 250, 252] },
            1: { cellWidth: 120 }
        }
    })

    yPos = (doc as any).lastAutoTable.finalY + 10

    // Customer Information
    doc.setFontSize(14)
    doc.text('Müşteri Bilgileri', 20, yPos)
    yPos += 10

    const customerInfo = [
        ['Şirket', data.customer.company],
        ['Adres', data.customer.address],
        ['İletişim', data.customer.user.name],
        ['Telefon', data.customer.user.phone],
        ['Email', data.customer.user.email]
    ]

    autoTable(doc, {
        startY: yPos,
        head: [],
        body: customerInfo,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 3 },
        columnStyles: {
            0: { fontStyle: 'bold', fillColor: [248, 250, 252] },
            1: { cellWidth: 120 }
        }
    })

    yPos = (doc as any).lastAutoTable.finalY + 10

    // Team Information
    if (data.team) {
        doc.setFontSize(14)
        doc.text('Ekip Bilgileri', 20, yPos)
        yPos += 10

        const teamMembers = data.team.members.map(m => [m.user.name, m.user.role])

        autoTable(doc, {
            startY: yPos,
            head: [['Ekip Üyesi', 'Rol']],
            body: teamMembers,
            theme: 'striped',
            styles: { fontSize: 10, cellPadding: 3 },
            headStyles: { fillColor: [22, 163, 74] }
        })

        yPos = (doc as any).lastAutoTable.finalY + 10
    }

    // Add new page if needed
    if (yPos > 250) {
        doc.addPage()
        yPos = 20
    }

    // Steps
    doc.setFontSize(14)
    doc.text('İş Adımları', 20, yPos)
    yPos += 10

    const stepsData = data.steps.map(step => {
        const stepStatus = step.isCompleted ? '✓ Tamamlandı' : '○ Bekliyor'
        const subStepsText = step.subSteps && step.subSteps.length > 0
            ? step.subSteps.map(sub => `  - ${sub.title} ${sub.isCompleted ? '✓' : '○'}`).join('\n')
            : ''

        return [
            step.order.toString(),
            step.title + (subStepsText ? '\n' + subStepsText : ''),
            stepStatus
        ]
    })

    autoTable(doc, {
        startY: yPos,
        head: [['#', 'Adım', 'Durum']],
        body: stepsData,
        theme: 'striped',
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [22, 163, 74] },
        columnStyles: {
            0: { cellWidth: 15 },
            2: { cellWidth: 35 }
        }
    })

    yPos = (doc as any).lastAutoTable.finalY + 10

    // Add new page if needed
    if (yPos > 250) {
        doc.addPage()
        yPos = 20
    }

    // Costs
    if (data.costs.length > 0) {
        doc.setFontSize(14)
        doc.text('Maliyetler', 20, yPos)
        yPos += 10

        const costsData = data.costs.map(cost => [
            format(new Date(cost.date), 'dd/MM/yyyy', { locale: tr }),
            cost.category,
            cost.description,
            `₺${cost.amount.toFixed(2)}`,
            cost.status
        ])

        const totalCost = data.costs
            .filter(c => c.status === 'APPROVED')
            .reduce((sum, c) => sum + c.amount, 0)

        autoTable(doc, {
            startY: yPos,
            head: [['Tarih', 'Kategori', 'Açıklama', 'Tutar', 'Durum']],
            body: costsData,
            foot: [['', '', 'Toplam Onaylı:', `₺${totalCost.toFixed(2)}`, '']],
            theme: 'striped',
            styles: { fontSize: 9, cellPadding: 3 },
            headStyles: { fillColor: [22, 163, 74] },
            footStyles: { fillColor: [248, 250, 252], fontStyle: 'bold' }
        })
    }

    // Footer with page numbers
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        doc.text(
            `Sayfa ${i} / ${pageCount}`,
            105,
            doc.internal.pageSize.height - 10,
            { align: 'center' }
        )
    }

    // Generate filename
    const filename = `Is_Raporu_${data.title.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd')}.pdf`

    // Download PDF
    doc.save(filename)
}

export function generateCostReportPDF(costs: Array<{
    date: Date,
    jobTitle: string,
    category: string | null,
    description: string,
    amount: number,
    status: string,
    createdBy: string
}>) {
    const doc = new jsPDF()

    // Set font
    doc.setFont('helvetica')

    let yPos = 20

    // Header
    doc.setFontSize(20)
    doc.setTextColor(22, 163, 74) // Green-600
    doc.text('Maliyet Raporu', 105, yPos, { align: 'center' })

    yPos += 15
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`Oluşturulma Tarihi: ${format(new Date(), 'dd MMMM yyyy, HH:mm', { locale: tr })}`, 105, yPos, { align: 'center' })

    yPos += 15

    const costsData = costs.map(cost => [
        format(new Date(cost.date), 'dd/MM/yyyy', { locale: tr }),
        cost.jobTitle,
        cost.category || '-',
        cost.description,
        `₺${cost.amount.toFixed(2)}`,
        cost.status,
        cost.createdBy
    ])

    const totalCost = costs
        .filter(c => c.status === 'APPROVED')
        .reduce((sum, c) => sum + c.amount, 0)

    autoTable(doc, {
        startY: yPos,
        head: [['Tarih', 'İş', 'Kategori', 'Açıklama', 'Tutar', 'Durum', 'Oluşturan']],
        body: costsData,
        foot: [['', '', '', 'Toplam Onaylı:', `₺${totalCost.toFixed(2)}`, '', '']],
        theme: 'striped',
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [22, 163, 74] },
        footStyles: { fillColor: [248, 250, 252], fontStyle: 'bold' }
    })

    // Footer with page numbers
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        doc.text(
            `Sayfa ${i} / ${pageCount}`,
            105,
            doc.internal.pageSize.height - 10,
            { align: 'center' }
        )
    }

    const filename = `Maliyet_Raporu_${format(new Date(), 'yyyyMMdd')}.pdf`
    doc.save(filename)
}
