import { Navigate } from 'react-router-dom'
import { isAuthenticated } from '../modules/auth/session'

export function RegisterPage() {
  if (isAuthenticated()) {
    return <Navigate to="/app" replace />
  }

  return <Navigate to="/login" replace />
}
