import bcrypt from 'bcrypt'
import { prisma } from '../../lib/prisma.js'
import {
  ConflictError,
  ForbiddenError,
  UnauthorizedError
} from '../../errors/app-error.js'

interface RegisterInput {
  name: string
  email: string
  password: string
  workspaceName: string
}

export class AuthService {

  async register(data: RegisterInput) {
    const { name, email, password, workspaceName } = data

    const userAlreadyExists = await prisma.user.findUnique({
      where: { email }
    })

    if (userAlreadyExists) {
      throw new ConflictError('Usuário email já cadastrado.')
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const result = await prisma.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({
        data: { name: workspaceName }
      })

      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword
        }
      })

      await tx.workspaceMember.create({
        data: {
          userId: user.id,
          workspaceId: workspace.id,
          role: 'owner'
        }
      })

      return { user, workspace }
    })

    return result
  }

  async login(email: string, password: string) {
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
      throw new UnauthorizedError('Credenciais inválidas')
    }

    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      throw new UnauthorizedError('Credenciais inválidas')
    }

    const membership = user.memberships[0]

    if (!membership) {
      throw new ForbiddenError('Nenhum workspace associado ao usuário')
    }

    return {
      user,
      workspace: membership.workspace
    }
  }
}
