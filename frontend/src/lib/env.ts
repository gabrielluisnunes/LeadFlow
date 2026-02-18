const defaultApiBaseUrl = 'http://localhost:3333'

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || defaultApiBaseUrl
}
