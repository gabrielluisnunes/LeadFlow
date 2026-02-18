import { request } from '../../lib/http'

interface AuthTokenResponse {
  token: string
}

export interface RegisterInput {
  name: string
  email: string
  password: string
  workspaceName: string
}

export interface LoginInput {
  email: string
  password: string
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
