import { clearToken, getToken } from '../../lib/token-storage'

export function isAuthenticated() {
  return Boolean(getToken())
}

export function signOut() {
  clearToken()
}
