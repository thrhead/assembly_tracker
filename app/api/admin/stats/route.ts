import { verifyAuth } from "@/lib/auth-helper";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const session = await verifyAuth(req);

        if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const [totalJobs, activeTeams, completedJobs, pendingJobs] = await Promise.all([
            prisma.job.count(),
            prisma.team.count(), // Assuming all teams are active for now, or filter by isActive if available
            prisma.job.count({
                where: {
                    status: "COMPLETED",
                },
            }),
            prisma.job.count({
                where: {
                    status: "PENDING",
                },
            }),
        ]);

        return NextResponse.json({
            totalJobs,
            activeTeams,
            completedJobs,
            pendingJobs,
        });
    } catch (error) {
        console.error("[ADMIN_STATS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
