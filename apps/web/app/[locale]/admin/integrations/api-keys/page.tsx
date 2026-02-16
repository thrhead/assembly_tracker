
import { auth } from "@/lib/auth"
import { redirect } from "@/lib/navigation"
import { ApiKeyManager } from "@/components/admin/api-key-manager"
import { WebhookManager } from "@/components/admin/webhook-manager"
import { GlobeIcon, ShieldCheckIcon, TerminalIcon } from "lucide-react"

export default async function IntegrationsPage() {
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
        redirect("/login")
    }

    return (
        <div className="p-4 space-y-8 max-w-5xl mx-auto">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Entegrasyonlar ve API</h1>
                <p className="text-muted-foreground">
                    Assembly Tracker verilerini dış sistemlere bağlayın ve API anahtarlarınızı yönetin.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card/50">
                    <div className="p-2 bg-blue-100 rounded-lg shrink-0">
                        <GlobeIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm">Public API (v1)</h4>
                        <p className="text-[10px] text-muted-foreground mt-1">
                            İşleri, ekipleri ve maliyetleri programatik olarak yönetin.
                        </p>
                    </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card/50">
                    <div className="p-2 bg-emerald-100 rounded-lg shrink-0">
                        <TerminalIcon className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm">Webhooks</h4>
                        <p className="text-[10px] text-muted-foreground mt-1">
                            İş durum değişikliklerinde anlık bildirimler alın.
                        </p>
                    </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card/50">
                    <div className="p-2 bg-purple-100 rounded-lg shrink-0">
                        <ShieldCheckIcon className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm">Güvenli Erişim</h4>
                        <p className="text-[10px] text-muted-foreground mt-1">
                            Anahtarlar SHA-256 ile hashlenerek saklanır.
                        </p>
                    </div>
                </div>
            </div>

            <section>
                <div className="flex items-center gap-2 mb-6">
                    <div className="h-6 w-1 bg-primary rounded-full" />
                    <h2 className="text-xl font-bold">API Anahtarları</h2>
                </div>
                <ApiKeyManager />
            </section>

            <section>
                <div className="flex items-center gap-2 mb-6">
                    <div className="h-6 w-1 bg-emerald-500 rounded-full" />
                    <h2 className="text-xl font-bold">Webhooks</h2>
                </div>
                <WebhookManager />
            </section>
        </div>
    )
}
