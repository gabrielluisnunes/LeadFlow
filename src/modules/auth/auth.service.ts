import bcrypt from 'bcrypt'
import {prisma} from '../../lib/prisma.js'

interface RegisterInput {
    name: string 
    email: string 
    passwortd: string
    workspaceName: string
}

export class AuthService {
    async register(data:RegisterInput) {
        const {name, email, passwortd, workspaceName} = data

        // 1. Verifica se já existe usuário com o email
        const userAlreadyExists = await prisma.user.findUnique({
            where: {
                email
            }
        })

        if(userAlreadyExists) {
            throw new Error('Usuário email já cadastrado. ')
        }

        // 2. Criptografa a senha
        const hashedPassword = await bcrypt.hash(passwortd, 10)

        // 3. Transação: cria workspace e usuário
        const result = await prisma.$transaction(async (tx) => {
            const workspace = await tx.workspace.create({
                data: {
                    name: workspaceName
                }
            })

        const user = await tx.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            }
        })
        await tx.workspaceMember.create({
        data: {
          userId: user.id,
          workspaceId: workspace.id,
          role: 'owner'
        }
      })

      return {
        user,
        workspace
      }
    })

    return result
  }
}await tx.workspaceMember.create({
        data: {
          userId: user.id,
          workspaceId: workspace.id,
          role: 'owner'
        }
      })

      return {
        user,
        workspace
      }
    })

    return result
  }
}