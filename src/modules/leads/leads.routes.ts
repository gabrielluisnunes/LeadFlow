import { FastifyInstance } from "fastify";
import { LeadsService } from "./leads.service.js";
import {
    createLeadNoteSchema,
    createLeadSchema,
    updateLeadSchema,
    updateLeadStatusSchema
} from "./leads.schemas.js"; 

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

        return replyy.code(201).send({
            data: lead
        });
    }) 

        app.get('/', async(request) => {
            const workspaceId = request.user.workspaceId;
            const leads = await leadsService.listByWorkspaceId(workspaceId);
    
            return {
                data: leads
            };   
            
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

        return {
            data: lead
        }
    })

        app.get('/:leadId', async (request) => {
            const { leadId } = request.params as { leadId: string }

            const workspaceId = request.user.workspaceId
            const lead = await leadsService.getById(workspaceId, leadId)

            return {
                data: lead
            }
        })

        app.patch('/:leadId', async (request) => {
            const { leadId } = request.params as { leadId: string }
            const body = updateLeadSchema.parse(request.body)

            const workspaceId = request.user.workspaceId
            const lead = await leadsService.update({
                workspaceId,
                leadId,
                ...body
            })

            return {
                data: lead
            }
        })

        app.post('/:leadId/notes', async (request, reply) => {
            const { leadId } = request.params as { leadId: string }
            const body = createLeadNoteSchema.parse(request.body)

            const workspaceId = request.user.workspaceId
            const authorId = request.user.userId

            const note = await leadsService.addNote({
                workspaceId,
                leadId,
                authorId,
                content: body.content,
                createdAt: body.createdAt ? new Date(body.createdAt) : undefined
            })

            return reply.code(201).send({
                data: note
            })
        })

    }
