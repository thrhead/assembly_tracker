import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-helper';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
    try {
        const session = await verifyAuth(request);
        if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch all teams with their members and associated jobs
        const teams = await prisma.team.findMany({
            include: {
                lead: true,
                members: {
                    include: {
                        user: true
                    }
                },
                assignments: {
                    include: {
                        job: true
                    }
                }
            }
        });

        // Calculate stats for each team
        const reports = teams.map(team => {
            const jobs = team.assignments.map(a => a.job);
            const completedJobs = jobs.filter(j => j.status === 'COMPLETED').length;
            const totalJobs = jobs.length;
            
            // Mock efficiency score calculation - in a real app this would be based on time taken vs estimated time
            const efficiencyScore = totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0;
            
            // Calculate total expenses for the team
            // For now, let's assume expenses are tracked per job and we sum them up
            // This is a simplified calculation
            const totalExpenses = 0; // In a real scenario, we'd query costTracking related to these jobs
            
            return {
                id: team.id,
                name: team.name,
                leadName: team.lead?.name || 'Belirlenmedi',
                stats: {
                    completedJobs,
                    totalJobs,
                    efficiencyScore: efficiencyScore || 75, // Default mock score if 0
                    totalExpenses,
                    totalWorkingHours: completedJobs * 8 // Mock hours
                }
            };
        });

        const globalStats = {
            totalTeams: teams.length,
            avgEfficiency: reports.length > 0 ? Math.round(reports.reduce((acc, r) => acc + r.stats.efficiencyScore, 0) / reports.length) : 0,
            totalEmployees: teams.reduce((acc, t) => acc + t.members.length, 0) + teams.filter(t => t.leadId).length
        };

        return NextResponse.json({
            reports,
            globalStats
        });
    } catch (error) {
        console.error('Mobile Teams Report Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
