import bcrypt from 'bcrypt'
import { prisma } from '../../lib/prisma.js'
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError
} from '../../errors/app-error.js'

type WorkspaceMode = 'CREATE' | 'JOIN'

interface RegisterInput {
  name: string
  email: string
  password: string
  workspaceName: string
  workspaceMode: WorkspaceMode
}

export class AuthService {
  private normalizeWorkspaceName(name: string) {
    return name.trim()
  }

  async identifyByEmail(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        memberships: {
          include: {
            workspace: true
          }
        }
      }
    })

    if (!user) {
      return {
        exists: false,
        name: null,
        workspaceName: null
      }
    }

    const membership = user.memberships[0]

    return {
      exists: true,
      name: user.name,
      workspaceName: membership?.workspace?.name ?? null
    }
  }

  async register(data: RegisterInput) {
    const { name, email, password, workspaceName, workspaceMode } = data
    const normalizedWorkspaceName = this.normalizeWorkspaceName(workspaceName)

    const userAlreadyExists = await prisma.user.findUnique({
      where: { email }
    })

    if (userAlreadyExists) {
      throw new ConflictError('Usuário email já cadastrado.')
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword
        }
      })

      let workspace

      if (workspaceMode === 'CREATE') {
        const existingWorkspace = await tx.workspace.findFirst({
          where: {
            name: {
              equals: normalizedWorkspaceName,
              mode: 'insensitive'
            }
          }
        })

        if (existingWorkspace) {
          throw new ConflictError('Já existe um workspace com esse nome.')
        }

        workspace = await tx.workspace.create({
          data: { name: normalizedWorkspaceName }
        })

        await tx.workspaceMember.create({
          data: {
            userId: user.id,
            workspaceId: workspace.id,
            role: 'owner'
          }
        })
      } else {
        workspace = await tx.workspace.findFirst({
          where: {
            name: {
              equals: normalizedWorkspaceName,
              mode: 'insensitive'
            }
          }
        })

        if (!workspace) {
          throw new NotFoundError('Workspace não encontrado.')
        }

        await tx.workspaceMember.create({
          data: {
            userId: user.id,
            workspaceId: workspace.id,
            role: 'member'
          }
        })
      }

      return { user, workspace }
    })

    return result
  }

  async login(email: string, password: string, workspaceName: string, workspaceMode: WorkspaceMode) {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      throw new UnauthorizedError('Credenciais inválidas')
    }

    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      throw new UnauthorizedError('Credenciais inválidas')
    }

    const normalizedWorkspaceName = this.normalizeWorkspaceName(workspaceName)

    if (!normalizedWorkspaceName) {
      throw new BadRequestError('Nome do workspace é obrigatório.')
    }

    const result = await prisma.$transaction(async (tx) => {
      let workspace = await tx.workspace.findFirst({
        where: {
          name: {
            equals: normalizedWorkspaceName,
            mode: 'insensitive'
          }
        }
      })

      if (workspaceMode === 'CREATE') {
        if (workspace) {
          throw new ConflictError('Já existe um workspace com esse nome.')
        }

        workspace = await tx.workspace.create({
          data: {
            name: normalizedWorkspaceName
          }
        })

        await tx.workspaceMember.create({
          data: {
            userId: user.id,
            workspaceId: workspace.id,
            role: 'owner'
          }
        })
      } else {
        if (!workspace) {
          throw new NotFoundError('Workspace não encontrado.')
        }

        const membership = await tx.workspaceMember.findUnique({
          where: {
            userId_workspaceId: {
              userId: user.id,
              workspaceId: workspace.id
            }
          }
        })

        if (!membership) {
          await tx.workspaceMember.create({
            data: {
              userId: user.id,
              workspaceId: workspace.id,
              role: 'member'
            }
          })
        }
      }

      return { workspace }
    })

    return {
      user,
      workspace: result.workspace
    }
  }
}
