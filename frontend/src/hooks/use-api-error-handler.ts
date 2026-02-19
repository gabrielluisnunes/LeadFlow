import { useNavigate } from 'react-router-dom'
import { signOut } from '../modules/auth/session'
import { ApiError } from '../types/api'

export function useApiErrorHandler() {
  const navigate = useNavigate()

  function handleApiError(
    error: unknown,
    fallbackMessage: string,
    setMessage: (message: string) => void
  ) {
    if (error instanceof ApiError && error.status === 401) {
      signOut()
      navigate('/login', { replace: true })
      return
    }

    if (error instanceof ApiError) {
      setMessage(error.message)
      return
    }

    setMessage(fallbackMessage)
  }

  return {
    handleApiError
  }
}
