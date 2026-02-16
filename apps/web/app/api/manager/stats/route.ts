import { verifyAdminOrManager } from "@/lib/auth-helper";
import { NextResponse } from "next/server";
import { getManagerDashboardData } from "@/lib/data/manager-dashboard";

export async function GET(req: Request) {
    try {
        const session = await verifyAdminOrManager(req);

        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const data = await getManagerDashboardData();

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Manager stats fetch error:", error.message);
        return NextResponse.json({
            totalJobs: 0,
            activeTeams: 0,
            completedJobsThisMonth: 0,
            pendingApprovals: 0,
            recentJobs: [],
            error: "Data fetch failed"
        }, { status: 200 });
    }
}
