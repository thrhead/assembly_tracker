import { auth } from "@/lib/auth"
import { redirect } from "@/lib/navigation"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { TemplateImportDialog } from "@/components/admin/template-import-dialog"

async function getTemplates() {
    return await prisma.jobTemplate.findMany({
        include: {
            steps: {
                include: { subSteps: true },
                orderBy: { order: 'asc' }
            }
        },
        orderBy: { createdAt: 'desc' },
    })
}

export default async function TemplatesPage() {
    const session = await auth()
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TEAM_LEAD")) {
        redirect("/login")
    }

    const templates = await getTemplates()

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">İş Şablonları</h1>
                    <p className="text-gray-500 mt-2">İş oluştururken kullanılacak şablonları yönetin.</p>
                </div>
                <div className="flex gap-2">
                    <TemplateImportDialog />
                    {/* Manual creation dialog could go here */}
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => (
                    <div key={template.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                                {template.description && (
                                    <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                                )}
                            </div>
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                {template.steps.length} Adım
                            </span>
                        </div>

                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                            {template.steps.map((step) => (
                                <div key={step.id} className="text-sm border-l-2 border-gray-200 pl-3 py-1">
                                    <p className="font-medium text-gray-700">{step.order}. {step.title}</p>
                                    {step.subSteps.length > 0 && (
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {step.subSteps.length} alt adım
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-4 pt-4 border-t">
                            Oluşturulma: {template.createdAt.toLocaleDateString('tr-TR')}
                        </p>
                    </div>
                ))}

                {templates.length === 0 && (
                    <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                        <p className="text-gray-500">Henüz şablon bulunmuyor.</p>
                        <p className="text-sm text-gray-400 mt-1">Excel ile yükleyerek başlayabilirsiniz.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
