import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import * as XLSX from "xlsx"
import { generateJobNumber } from "@/lib/utils/job-number"

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TEAM_LEAD")) {
            return new NextResponse("Yetkisiz Erişim", { status: 401 })
        }

        const formData = await req.formData()
        const file = formData.get("file") as File

        if (!file) {
            return new NextResponse("Dosya gerekli", { status: 400 })
        }

        const buffer = await file.arrayBuffer()
        const workbook = XLSX.read(buffer, { type: "buffer" })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        if (jsonData.length === 0) {
            return new NextResponse("Excel dosyası boş", { status: 400 })
        }

        console.log("Processing bulk upload:", jsonData.length, "rows")

        let successCount = 0
        let errorCount = 0
        const errors: string[] = []

        // Group rows by Job Title to handle multiple steps/substeps for the same job
        const jobsMap = new Map<string, any[]>()

        for (const row of jsonData as any[]) {
            const jobTitle = row["Job Title"] || row["İş Başlığı"]
            if (!jobTitle) continue

            if (!jobsMap.has(jobTitle)) {
                jobsMap.set(jobTitle, [])
            }
            jobsMap.get(jobTitle)?.push(row)
        }

        // Process each job
        for (const [title, rows] of jobsMap) {
            try {
                await prisma.$transaction(async (tx) => {
                    // 1. Get or Validate Customer
                    const companyName = rows[0]["Customer Company"] || rows[0]["Müşteri"] || rows[0]["Firma"]
                    if (!companyName) {
                        throw new Error(`Exper şu iş için müşteri firması eksik: ${title}`)
                    }

                    const customer = await tx.customer.findFirst({
                        where: { company: { contains: companyName, mode: 'insensitive' } }
                    })

                    if (!customer) {
                        throw new Error(`'${companyName}' isimli müşteri bulunamadı. Lütfen önce müşteriyi oluşturun.`)
                    }



                    // 2. Create Job
                    // Basic fields from the first row
                    const description = rows[0]["Description"] || rows[0]["Açıklama"]
                    const priority = (rows[0]["Priority"] || rows[0]["Öncelik"] || "MEDIUM").toUpperCase()
                    const projectNo = rows[0]["Project No"] || rows[0]["Proje No"] || null

                    // Generate Job Number (Project based or Global)
                    const jobNo = await generateJobNumber(projectNo)

                    let scheduledDate = new Date()
                    if (rows[0]["Date"] || rows[0]["Tarih"]) {
                        // Handle Excel date serials or strings if necessary, but assuming simple string/date for now
                        // xlsx usually handles dates if cell format is date, returning a JS Date object used in json
                        // but if raw: false is not set (default), it might be different. 
                        // sheet_to_json default options usually work well for simple cases.
                        const d = rows[0]["Date"] || rows[0]["Tarih"]
                        if (d instanceof Date) scheduledDate = d
                        else scheduledDate = new Date(d)
                    }

                    const job = await tx.job.create({
                        data: {
                            jobNo: jobNo,
                            projectNo: projectNo,
                            title: title,
                            description: description,
                            customerId: customer.id,
                            creatorId: session.user.id,
                            priority: ["LOW", "MEDIUM", "HIGH", "URGENT"].includes(priority) ? priority : "MEDIUM",
                            status: "PENDING",
                            scheduledDate: scheduledDate
                        }
                    })

                    // 3. Process Steps & Substeps
                    // We need to group steps by Step Title within this job
                    const stepsMap = new Map<string, any[]>()

                    rows.forEach((row: any) => {
                        const stepTitle = row["Step Title"] || row["Adım Başlığı"]
                        if (!stepTitle) return
                        if (!stepsMap.has(stepTitle)) stepsMap.set(stepTitle, [])
                        stepsMap.get(stepTitle)?.push(row)
                    })

                    let stepOrder = 1
                    for (const [stepTitle, stepRows] of stepsMap) {
                        const step = await tx.jobStep.create({
                            data: {
                                jobId: job.id,
                                title: stepTitle,
                                order: stepOrder++,
                                isCompleted: false
                            }
                        })

                        let subStepOrder = 1
                        for (const sRow of stepRows) {
                            const subStepTitle = sRow["SubStep Title"] || sRow["Alt Adım"]
                            if (!subStepTitle) continue // Skip if no substep defined

                            // Extra fields
                            // const isMandatory = (sRow["Mandatory"] || sRow["Zorunlu"] || "NO").toUpperCase() === "YES"
                            // type isn't strictly in schema yet? Wait, let me check schema again.
                            // Schema has: JobSubStep: id, stepId, title, isCompleted... NO TYPE field in `JobSubStep` in schema.prisma!
                            // Waiting... the schema `JobSubStep` model:
                            // model JobSubStep { id, stepId, title, isCompleted... } 
                            // There is NO `type` (checkbox/photo) or `isMandatory` in the current schema.
                            // I should stick to the current schema or add fields if the user requested "custom tasks".
                            // The user said "custom olarak excel ile görevler ve alt görevler".
                            // I will add them as simple text titles for now as per schema.

                            await tx.jobSubStep.create({
                                data: {
                                    stepId: step.id,
                                    title: subStepTitle,
                                    order: subStepOrder++,
                                    isCompleted: false
                                }
                            })
                        }
                    }
                })
                successCount++
            } catch (error: any) {
                console.error(`Error processing job ${title}:`, error)
                errorCount++
                errors.push(`İş "${title}": ${error.message}`)
            }
        }

        return NextResponse.json({
            success: true,
            count: successCount,
            errors: errors.length > 0 ? errors : undefined
        })

    } catch (error) {
        console.error("Bulk upload error:", error)
        return new NextResponse("Sunucu Hatası", { status: 500 })
    }
}
