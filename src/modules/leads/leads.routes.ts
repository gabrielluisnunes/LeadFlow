import { FastifyInstance } from "fastify";
import { LeadsService } from "./leads.service.js";
import { createLeadSchema, updateLeadStatusSchema } from "./leads.schemas.js"; 

export async function leadsRoutes(app: FastifyInstance) {
    const leadsService = new LeadsService();

    app.addHook("preHandler", app.authenticate); 

    app.post('/', async(request, replyy) => {
        const body = createLeadSchema.parse(request.body);

        const workspaceId = request.user.workspaceId;
        const lead = await leadsService.create({
            workspaceId,
            ...body
        });

        return replyy.code(201).send(lead);
    }) 

        app.get('/', async(request) => {
            const workspaceId = request.user.workspaceId;
            const leads = await leadsService.listByWorkspaceId(workspaceId);
    
            return leads;   
            
        });

        app.patch('/:leadId/status', async (request) => {
            const { leadId } = request.params as { leadId: string }

            const body = updateLeadStatusSchema.parse(request.body)

            const workspaceId = request.user.workspaceId

            const lead = await leadsService.updateStatus({
                workspaceId,
                leadId,
                status: body.status
        })

        return lead
    })

    }
