
import { NextResponse } from "next/server"
import * as XLSX from 'xlsx'

export async function GET() {
    try {
        const templateData = [
            {
                "Template Name": "Duvar Tipi Klima Montajı",
                "Description": "Standart duvar tipi klima montaj adımları",
                "Step Title": "Hazırlık",
                "SubStep Title": "Montaj yerinin belirlenmesi"
            },
            {
                "Template Name": "Duvar Tipi Klima Montajı",
                "Description": "Standart duvar tipi klima montaj adımları",
                "Step Title": "Hazırlık",
                "SubStep Title": "Gerekli ekipmanların kontrolü"
            },
            {
                "Template Name": "Duvar Tipi Klima Montajı",
                "Description": "Standart duvar tipi klima montaj adımları",
                "Step Title": "İç Ünite Montajı",
                "SubStep Title": "Montaj sacının sabitlenmesi"
            }
        ]

        const worksheet = XLSX.utils.json_to_sheet(templateData)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, "Template")

        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': 'attachment; filename="Sablon_Yukleme_Formati.xlsx"'
            }
        })
    } catch (error) {
        console.error("Template sample export error:", error)
        return new NextResponse("Sunucu Hatası", { status: 500 })
    }
}
