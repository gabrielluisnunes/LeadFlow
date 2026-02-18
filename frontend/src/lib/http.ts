import { env } from './env'
import { getToken } from './token-storage'
import { ApiError, type ApiErrorResponse } from '../types/api'

interface ApiSuccessResponse<T> {
  data: T
}

interface RequestOptions extends Omit<RequestInit, 'headers'> {
  headers?: Record<string, string>
}

export async function request<T>(path: string, options: RequestOptions = {}) {
  const token = getToken()

  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  })

  if (!response.ok) {
    let errorPayload: ApiErrorResponse | null = null

    try {
      errorPayload = (await response.json()) as ApiErrorResponse
    } catch {
      errorPayload = null
    }

    throw new ApiError(
      response.status,
      errorPayload?.error.code || 'UNKNOWN_ERROR',
      errorPayload?.error.message || 'Erro ao comunicar com a API',
      errorPayload?.error.details
    )
  }

  const payload = (await response.json()) as ApiSuccessResponse<T>

  return payload.data
}
