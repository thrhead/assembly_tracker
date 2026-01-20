import { verifyAdminOrManager } from "@/lib/auth-helper";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const session = await verifyAdminOrManager(req);

        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const [totalJobs, activeTeams, completedJobs, pendingJobs] = await Promise.all([
            prisma.job.count(),
            prisma.team.count({
                where: {
                    isActive: true,
                },
            }),
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
        console.error("Admin stats fetch error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
