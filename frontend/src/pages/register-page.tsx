import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { register } from '../modules/auth/api'
import { isAuthenticated } from '../modules/auth/session'
import { setToken } from '../lib/token-storage'
import { ApiError } from '../types/api'
import { BrandLogo } from '../components/brand-logo'
import './login-page.css'

export function RegisterPage() {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [workspaceName, setWorkspaceName] = useState('')
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
      const result = await register({
        name,
        workspaceName,
        email,
        password
      })

      setToken(result.token)
      navigate('/app', { replace: true })
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage('Não foi possível criar a conta agora')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <header className="login-topbar">
        <BrandLogo className="login-brand" />
      </header>

      <section className="login-hero">
        <BrandLogo className="login-hero-logo" showText={false} />
        <h1>Criar conta</h1>
        <p className="login-subtitle">Cadastre-se para começar a usar o LeadFlow.</p>

        <form className="login-card" onSubmit={handleSubmit}>
          <label>
            Nome
            <input
              type="text"
              placeholder="Seu nome"
              value={name}
              onChange={(event) => setName(event.target.value)}
              minLength={2}
              required
            />
          </label>

          <label>
            Nome do workspace
            <input
              type="text"
              placeholder="Minha empresa"
              value={workspaceName}
              onChange={(event) => setWorkspaceName(event.target.value)}
              minLength={2}
              required
            />
          </label>

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
              minLength={6}
              required
            />
          </label>

          {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

          <button type="submit" className="login-submit" disabled={isSubmitting}>
            {isSubmitting ? 'Criando...' : 'Criar conta'}
          </button>

          <p className="login-footer-text">
            Já possui uma conta? <Link to="/login">entrar</Link>
          </p>
        </form>
      </section>
    </main>
  )
}
