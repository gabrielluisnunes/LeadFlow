import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { login } from '../modules/auth/api'
import { isAuthenticated } from '../modules/auth/session'
import { setToken } from '../lib/token-storage'
import { ApiError } from '../types/api'
import './login-page.css'

export function LoginPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  if (isAuthenticated()) {
    return <Navigate to="/app" replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      const result = await login({
        email,
        password
      })

      setToken(result.token)
      navigate('/app', { replace: true })
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage('Não foi possível fazer login agora')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <header className="login-topbar">
        <div className="login-brand">
          <span className="brand-drop" aria-hidden="true" />
          <span>LeadFlow</span>
        </div>

        <button type="button" className="topbar-enter-button">
          <span aria-hidden="true">↗</span>
          <span>Entrar</span>
        </button>
      </header>

      <section className="login-hero">
        <span className="hero-drop" aria-hidden="true" />
        <h1>Login</h1>

        <form className="login-card" onSubmit={handleSubmit}>
          <label>
            E-mail
            <input
              type="email"
              placeholder="exemplo@leadflow.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label>
            Senha
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

          <button type="submit" className="login-submit" disabled={isSubmitting}>
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>

          <p className="login-footer-text">
            Ainda não possui uma conta? <a href="#">criar conta</a>
          </p>
        </form>
      </section>
    </main>
  )
}
