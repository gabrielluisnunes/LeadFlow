import { request } from '../../lib/http'

interface AuthTokenResponse {
  token: string
}

export type WorkspaceMode = 'CREATE' | 'JOIN'

interface IdentifyUserResponse {
  exists: boolean
  name: string | null
  workspaceName: string | null
}

export interface RegisterInput {
  name: string
  email: string
  password: string
  workspaceName: string
  workspaceMode: WorkspaceMode
}

export interface LoginInput {
  email: string
  password: string
  workspaceName: string
  workspaceMode: WorkspaceMode
}

interface IdentifyInput {
  email: string
}

export function register(input: RegisterInput) {
  return request<AuthTokenResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input)
  })
}

export function login(input: LoginInput) {
  return request<AuthTokenResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(input)
  })
}

export function identifyUser(input: IdentifyInput) {
  return request<IdentifyUserResponse>('/auth/identify', {
    method: 'POST',
    body: JSON.stringify(input)
  })
}
