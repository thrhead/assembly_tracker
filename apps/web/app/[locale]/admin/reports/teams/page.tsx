import { redirect } from "@/lib/navigation"

export default function RedirectToReports() {
    redirect("/admin/reports?tab=teams")
}