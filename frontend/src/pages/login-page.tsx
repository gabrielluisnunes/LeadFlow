import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Building2, LogIn, UserPlus2 } from 'lucide-react'
import { identifyUser, login, register, type WorkspaceMode } from '../modules/auth/api'
import { isAuthenticated } from '../modules/auth/session'
import { setToken } from '../lib/token-storage'
import { ApiError } from '../types/api'
import { BrandLogo } from '../components/brand-logo'
import './login-page.css'

type FlowStep = 'IDENTIFY' | 'LOGIN' | 'REGISTER'
type AuthStage = 'IDENTIFY' | 'AUTH'

export function LoginPage() {
  const navigate = useNavigate()

  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>('JOIN')
  const [step, setStep] = useState<FlowStep>('IDENTIFY')

  const [name, setName] = useState('')
  const [workspaceName, setWorkspaceName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [isCheckingAccount, setIsCheckingAccount] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  if (isAuthenticated()) {
    return <Navigate to="/app" replace />
  }

  const title = useMemo(() => {
    if (step === 'LOGIN') {
      return 'Entrar na conta'
    }

    if (step === 'REGISTER') {
      return workspaceMode === 'CREATE' ? 'Criar conta e workspace' : 'Criar conta para entrar no workspace'
    }

    return workspaceMode === 'CREATE' ? 'Criar novo workspace' : 'Entrar em workspace existente'
  }, [step, workspaceMode])

  const subtitle = useMemo(() => {
    if (step === 'LOGIN') {
      return 'Conta encontrada. Digite a senha para acessar seu workspace.'
    }

    if (step === 'REGISTER') {
      return workspaceMode === 'CREATE'
        ? 'Finalize o cadastro para criar seu acesso de administrador.'
        : 'Finalize o cadastro para entrar no workspace da empresa.'
    }

    return 'Escolha a ação e informe seus dados para continuar.'
  }, [step, workspaceMode])

  function getFriendlyAuthError(error: unknown, stage: AuthStage) {
    if (error instanceof ApiError) {
      if (error.code === 'UNAUTHORIZED') {
        return 'E-mail ou senha inválidos. Verifique seus dados e tente novamente.'
      }

      if (error.code === 'NOT_FOUND' && workspaceMode === 'JOIN') {
        return 'Workspace não encontrado. Confira o nome do workspace e tente novamente.'
      }

      if (error.code === 'CONFLICT' && workspaceMode === 'CREATE') {
        return 'Esse nome de workspace já está em uso. Escolha outro nome para continuar.'
      }

      if (error.code === 'VALIDATION_ERROR') {
        return 'Alguns dados estão inválidos. Revise os campos e tente novamente.'
      }

      if (error.code === 'UNKNOWN_ERROR' || error.message === 'Erro ao comunicar com a API') {
        if (stage === 'AUTH' && workspaceMode === 'JOIN') {
          return 'Não foi possível entrar no workspace informado agora. Tente novamente em instantes.'
        }

        return 'Não foi possível concluir sua solicitação agora. Tente novamente em instantes.'
      }

      return error.message
    }

    if (stage === 'AUTH' && workspaceMode === 'JOIN') {
      return 'Não foi possível entrar no workspace informado agora. Tente novamente em instantes.'
    }

    return 'Não foi possível concluir sua solicitação agora. Tente novamente em instantes.'
  }

  async function handleIdentify() {
    setErrorMessage('')
    setIsCheckingAccount(true)

    try {
      const result = await identifyUser({ email })

      if (result.exists) {
        setStep('LOGIN')
        if (!name && result.name) {
          setName(result.name)
        }
          if (workspaceMode === 'JOIN' && !workspaceName && result.workspaceName) {
          setWorkspaceName(result.workspaceName)
        }
      } else {
        setStep('REGISTER')
      }
    } catch (error) {
      setErrorMessage(getFriendlyAuthError(error, 'IDENTIFY'))
    } finally {
      setIsCheckingAccount(false)
    }
  }

  async function handleAuthSubmit() {
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      const result =
        step === 'LOGIN'
          ? await login({
              email,
              password,
              workspaceName,
              workspaceMode
            })
          : await register({
              name,
              email,
              password,
              workspaceName,
              workspaceMode
            })

      setToken(result.token)
      navigate('/app', { replace: true })
    } catch (error) {
      setErrorMessage(getFriendlyAuthError(error, 'AUTH'))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (step === 'IDENTIFY') {
      await handleIdentify()
      return
    }

    await handleAuthSubmit()
  }

  function resetToIdentify(nextMode?: WorkspaceMode) {
    setStep('IDENTIFY')
    setPassword('')
    setErrorMessage('')

    if (nextMode) {
      setWorkspaceMode(nextMode)
    }
  }

  function goToRegister() {
    setStep('REGISTER')
    setPassword('')
    setErrorMessage('')
  }

  return (
    <main className="login-page">
      <div className="login-glow login-glow-left" />
      <div className="login-glow login-glow-right" />

      <header className="login-topbar">
        <BrandLogo className="login-brand" />
      </header>

      <section className="login-hero">
        <div className="login-switch" role="tablist" aria-label="Modo de acesso">
          <button
            type="button"
            role="tab"
            aria-selected={workspaceMode === 'JOIN'}
            className={`login-switch-item ${workspaceMode === 'JOIN' ? 'is-active' : ''}`}
            onClick={() => resetToIdentify('JOIN')}
          >
            <LogIn size={16} />
            Entrar em workspace
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={workspaceMode === 'CREATE'}
            className={`login-switch-item ${workspaceMode === 'CREATE' ? 'is-active' : ''}`}
            onClick={() => resetToIdentify('CREATE')}
          >
            <Building2 size={16} />
            Criar workspace
          </button>
        </div>

        <article className={`login-card login-card-${step.toLowerCase()}`}>
          <div className="login-card-head">
            <BrandLogo className="login-hero-logo" showText={false} />
            <h1>{title}</h1>
            <p className="login-subtitle">{subtitle}</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {step !== 'LOGIN' ? (
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
            ) : null}

            <label>
              Workspace
              <input
                type="text"
                placeholder="Nome do workspace"
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
                placeholder="voce@empresa.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>

            {step !== 'IDENTIFY' ? (
              <label>
                Senha
                <input
                  type="password"
                  placeholder="Sua senha"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </label>
            ) : null}

            {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

            <button
              type="submit"
              className="login-submit"
              disabled={isCheckingAccount || isSubmitting}
            >
              {step === 'IDENTIFY'
                ? isCheckingAccount
                  ? 'Verificando conta...'
                  : 'Continuar'
                : isSubmitting
                  ? step === 'LOGIN'
                    ? 'Entrando...'
                    : 'Criando acesso...'
                  : step === 'LOGIN'
                    ? 'Entrar'
                    : 'Criar conta'}
            </button>

            {step !== 'REGISTER' ? (
              <button
                type="button"
                className="login-signup-cta"
                onClick={goToRegister}
              >
                Quero me cadastrar
              </button>
            ) : null}

            {step !== 'IDENTIFY' ? (
              <button
                type="button"
                className="login-secondary"
                onClick={() => resetToIdentify()}
              >
                Voltar
              </button>
            ) : null}
          </form>

          <footer className="login-footer-text">
            <UserPlus2 size={16} />
            Login e cadastro unificados para dono e equipe.
          </footer>
        </article>
      </section>
    </main>
  )
}
