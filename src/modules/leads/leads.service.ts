import { prisma } from "../../lib/prisma.js";
import {LeadStatus} from "@prisma/client";

interface CreateLeadInput {
    workspaceId: string;
    name: string;
    phone: string;
    email?: string;
    source?: string;
}

export class LeadsService {
    async create(data: CreateLeadInput) {
        const lead = await prisma.lead.create({
            data:{
                workspaceId: data.workspaceId,
                name: data.name,
                phone: data.phone,
                email: data.email,
                source: data.source,
                status: LeadStatus.NEW
            }
        })
        
        return lead
    }

    async listByWorkspaceId(workspaceId: string) {
        const leads = await prisma.lead.findMany({
            where: {
                workspaceId
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
 
        return
    }
}