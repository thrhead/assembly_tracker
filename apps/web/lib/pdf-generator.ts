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
    signatureUrl?: string | null
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

    // Professional branding tokens
    const BRAND_COLOR = [15, 23, 42] // Slate-900 for enterprise feel
    const ACCENT_COLOR = [22, 163, 74] // Green-600 for status
    const companyName = "ASSEMBLY TRACKER"
    const companySlogan = "Kurumsal Saha Operasyon Yonetim Sistemi"

    let yPos = 20

    // Header Branding
    doc.setFillColor(248, 250, 252)
    doc.rect(0, 0, 210, 45, 'F')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(22)
    doc.setTextColor(BRAND_COLOR[0], BRAND_COLOR[1], BRAND_COLOR[2])
    doc.text(companyName, 20, 25)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(companySlogan, 20, 32)
    doc.text('Vergi Dairesi: Bogazici | Vergi No: 1234567890', 20, 38)

    doc.setFontSize(10)
    doc.setTextColor(BRAND_COLOR[0], BRAND_COLOR[1], BRAND_COLOR[2])
    doc.text(`EVRAK NO: #${data.id.substring(0, 12).toUpperCase()}`, 190, 25, { align: 'right' })
    doc.text(`DUZENLEME TARIHI: ${format(new Date(), 'dd.MM.yyyy HH:mm')}`, 190, 32, { align: 'right' })

    yPos = 60

    // Job Title Section
    doc.setFontSize(18)
    doc.setTextColor(BRAND_COLOR[0], BRAND_COLOR[1], BRAND_COLOR[2])
    doc.text(data.title.toUpperCase(), 20, yPos)

    yPos += 10
    doc.setDrawColor(ACCENT_COLOR[0], ACCENT_COLOR[1], ACCENT_COLOR[2])
    doc.setLineWidth(1)
    doc.line(20, yPos, 190, yPos)

    yPos += 15

    // Summary Section with nested tables for alignment
    const summaryData: any[][] = [
        [{ content: 'MUSTERI BILGILERI', colSpan: 2, styles: { halign: 'left', fontStyle: 'bold', fillColor: [241, 245, 249] } },
        { content: 'IS DETAYLARI', colSpan: 2, styles: { halign: 'left', fontStyle: 'bold', fillColor: [241, 245, 249] } }],
        ['Sirket', data.customer.company, 'Durum', data.status === 'COMPLETED' ? 'TAMAMLANDI' : 'ISLEMDE'],
        ['Ilgili', data.customer.user.name, 'Oncelik', data.priority],
        ['Konum', data.location || '-', 'Tamamlanma', data.completedDate ? format(new Date(data.completedDate), 'dd.MM.yyyy') : '-']
    ]

    autoTable(doc, {
        startY: yPos,
        body: summaryData,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 3, lineColor: [226, 232, 240] },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 30 },
            1: { cellWidth: 60 },
            2: { fontStyle: 'bold', cellWidth: 30 },
            3: { fontStyle: 'bold' }
        }
    })

    yPos = (doc as any).lastAutoTable.finalY + 15

    // Steps Section
    doc.setFontSize(12)
    doc.setTextColor(BRAND_COLOR[0], BRAND_COLOR[1], BRAND_COLOR[2])
    doc.text('TEKNIK ISLEM ADIMLARI', 20, yPos)
    yPos += 6

    const stepsData = data.steps.map(step => [
        step.order.toString(),
        step.title,
        step.isCompleted ? '✓ TAMAM' : '○ BEKLIYOR'
    ])

    autoTable(doc, {
        startY: yPos,
        head: [['SIRA', 'ACIKLAMA', 'DURUM']],
        body: stepsData,
        theme: 'striped',
        headStyles: { fillColor: BRAND_COLOR as [number, number, number], fontSize: 9, halign: 'center' },
        columnStyles: {
            0: { halign: 'center', cellWidth: 15 },
            2: { halign: 'center', cellWidth: 30 }
        },
        styles: { fontSize: 8 }
    })

    yPos = (doc as any).lastAutoTable.finalY + 15

    // Costs Section
    if (data.costs && data.costs.length > 0) {
        doc.setFontSize(12)
        doc.text('MALIYET VE EKLEME DETAYLARI', 20, yPos)
        yPos += 6

        const costsData = data.costs.map(c => [
            format(new Date(c.date), 'dd.MM.yyyy'),
            c.description,
            c.category,
            `₺${c.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`
        ])

        autoTable(doc, {
            startY: yPos,
            head: [['TARIH', 'ACIKLAMA', 'KATEGORI', 'TUTAR']],
            body: costsData,
            theme: 'grid',
            headStyles: { fillColor: [71, 85, 105], fontSize: 9 },
            styles: { fontSize: 8 },
            columnStyles: { 3: { halign: 'right', fontStyle: 'bold' } }
        })

        yPos = (doc as any).lastAutoTable.finalY + 15
    }

    // Signature Area
    if (yPos > 240) { doc.addPage(); yPos = 30 }

    doc.setDrawColor(226, 232, 240)
    doc.line(20, yPos, 190, yPos)
    yPos += 8

    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text('DIJITAL ONAY VE IMZA', 20, yPos)

    yPos += 10
    doc.setFontSize(9)
    doc.setTextColor(0, 0, 0)
    doc.text('Musteri Yetkilisi:', 20, yPos)
    doc.text('Saha Personeli:', 110, yPos)

    yPos += 5
    if (data.signatureUrl) {
        try {
            doc.addImage(data.signatureUrl, 'PNG', 20, yPos, 45, 20)
        } catch (e) {
            doc.text('[Imza Kayitli]', 20, yPos + 10)
        }
    } else {
        doc.text('____________________', 20, yPos + 10)
    }
    doc.text('____________________', 110, yPos + 10)

    yPos += 30
    doc.setFont('helvetica', 'bold')
    doc.text(data.customer.user.name, 20, yPos)
    doc.text(data.team?.name || 'Yetkili Personel', 110, yPos)

    // Legal Footer & Page Numbers
    const pageCount = (doc as any).internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(7)
        doc.setTextColor(150, 150, 150)

        // Horizontal Line above footer
        doc.setDrawColor(241, 245, 249)
        doc.line(20, 280, 190, 280)

        doc.text(`Bu rapor Assembly Tracker tarafindan guvenli bir sekilde olusturulmustur. Tum haklari saklidir.`, 20, 285)
        doc.text(`SAYFA ${i} / ${pageCount}`, 190, 285, { align: 'right' })
    }

    return doc
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
    const pageCount = (doc as any).internal.getNumberOfPages()
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