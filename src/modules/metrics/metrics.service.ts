import {prisma} from '../../lib/prisma.js';
import {LeadStatus} from '@prisma/client';

export class MetricsService {
    async getLeadsOveerview(workspaceId: string) {
        const totalLeads = await prisma.lead.count({
            where: {
                workspaceId
            }
        })

        const grouped = await prisma.lead.groupBy({
            by: ['status'],
            where: {
                workspaceId
            },
            _count: {
                status: true
            }
        })

        const byStatus: Record<LeadStatus, number> = {
            NEW: 0,
            CONTACTED: 0,
            WON: 0,
            LOST: 0
        }
        for (const item of grouped) {
            byStatus[item.status] = item._count.status
        }
        const won = byStatus.WON

        const conversaionRate = 
            totalLeads === 0 
            ? 0
            : Number(((won / totalLeads) * 100).toFixed(2))

        return {
            totalLeads,
            byStatus,
            conversaionRate
        }
    }
}