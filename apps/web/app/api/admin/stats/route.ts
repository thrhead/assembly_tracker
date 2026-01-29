import { verifyAdminOrManager } from "@/lib/auth-helper";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getAdminDashboardData } from "@/lib/data/admin-dashboard";

export async function GET(req: Request) {
    try {
        const session = await verifyAdminOrManager(req);

        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Web dashboard logic serves exactly what we need
        const dashboardData = await getAdminDashboardData();

        // Include basic counts for backward compatibility if needed, 
        // though dashboardData is superior.
        const [totalJobs, activeTeams] = await Promise.all([
            prisma.job.count(),
            prisma.team.count({
                where: {
                    isActive: true,
                },
            }),
        ]);

        return NextResponse.json({
            ...dashboardData,
            totalJobs,
            activeTeams,
        });
    } catch (error: any) {
        console.error("Admin stats fetch error:", error.message);
        return NextResponse.json({
            totalJobs: 0,
            activeTeams: 0,
            totalCostToday: 0,
            budgetPercentage: 0,
            weeklyStats: [],
            error: "Data fetch failed"
        }, { status: 200 });
    }
}
