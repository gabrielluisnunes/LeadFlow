import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { env } from '../lib/env'
import { signOut } from '../modules/auth/session'
import {
  createLead,
  listLeads,
  updateLeadStatus,
  type Lead,
  type LeadStatus
} from '../modules/leads/api'
import { ApiError } from '../types/api'

const leadStatusOptions: LeadStatus[] = ['NEW', 'CONTACTED', 'WON', 'LOST']

export function HomePage() {
  const navigate = useNavigate()
  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [createErrorMessage, setCreateErrorMessage] = useState('')
  const [isUpdatingStatusId, setIsUpdatingStatusId] = useState<string | null>(null)
  const [statusErrorMessage, setStatusErrorMessage] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    source: ''
  })

  async function loadLeads() {
    setErrorMessage('')
    setIsLoading(true)

    try {
      const items = await listLeads()
      setLeads(items)
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        signOut()
        navigate('/login', { replace: true })
        return
      }

      if (error instanceof ApiError) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage('Não foi possível carregar os leads')
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadLeads()
  }, [])

  function handleSignOut() {
    signOut()
    navigate('/login', { replace: true })
  }

  async function handleCreateLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setCreateErrorMessage('')
    setIsCreating(true)

    try {
      await createLead({
        name: formData.name,
        phone: formData.phone,
        email: formData.email || undefined,
        source: formData.source || undefined
      })

      setFormData({
        name: '',
        phone: '',
        email: '',
        source: ''
      })

      await loadLeads()
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        signOut()
        navigate('/login', { replace: true })
        return
      }

      if (error instanceof ApiError) {
        setCreateErrorMessage(error.message)
      } else {
        setCreateErrorMessage('Não foi possível criar o lead')
      }
    } finally {
      setIsCreating(false)
    }
  }

  async function handleUpdateStatus(leadId: string, status: LeadStatus) {
    setStatusErrorMessage('')
    setIsUpdatingStatusId(leadId)

    try {
      const updatedLead = await updateLeadStatus(leadId, status)

      setLeads((current) =>
        current.map((lead) => (lead.id === updatedLead.id ? updatedLead : lead))
      )
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        signOut()
        navigate('/login', { replace: true })
        return
      }

      if (error instanceof ApiError) {
        setStatusErrorMessage(error.message)
      } else {
        setStatusErrorMessage('Não foi possível atualizar o status do lead')
      }
    } finally {
      setIsUpdatingStatusId(null)
    }
  }

  return (
    <main className="app-shell">
      <h1>LeadFlow</h1>

      <p>Login realizado com sucesso.</p>

      <ul>
        <li>Backend URL: {env.apiBaseUrl}</li>
        <li>Contrato: respostas em {`{ data: ... }`} e erros em {`{ error: ... }`}</li>
      </ul>

      <section className="list-section">
        <h2>Novo lead</h2>

        <form className="auth-form" onSubmit={handleCreateLead}>
          <label>
            Nome
            <input
              type="text"
              value={formData.name}
              onChange={(event) =>
                setFormData((current) => ({ ...current, name: event.target.value }))
              }
              minLength={3}
              required
            />
          </label>

          <label>
            Telefone
            <input
              type="text"
              value={formData.phone}
              onChange={(event) =>
                setFormData((current) => ({ ...current, phone: event.target.value }))
              }
              minLength={10}
              maxLength={11}
              required
            />
          </label>

          <label>
            Email (opcional)
            <input
              type="email"
              value={formData.email}
              onChange={(event) =>
                setFormData((current) => ({ ...current, email: event.target.value }))
              }
            />
          </label>

          <label>
            Origem (opcional)
            <input
              type="text"
              value={formData.source}
              onChange={(event) =>
                setFormData((current) => ({ ...current, source: event.target.value }))
              }
            />
          </label>

          {createErrorMessage ? <p className="form-error">{createErrorMessage}</p> : null}

          <button type="submit" disabled={isCreating}>
            {isCreating ? 'Salvando...' : 'Criar lead'}
          </button>
        </form>
      </section>

      <section className="list-section">
        <h2>Leads</h2>

        {isLoading ? <p>Carregando leads...</p> : null}

        {!isLoading && errorMessage ? <p className="form-error">{errorMessage}</p> : null}
        {!isLoading && !errorMessage && statusErrorMessage ? (
          <p className="form-error">{statusErrorMessage}</p>
        ) : null}

        {!isLoading && !errorMessage ? (
          leads.length > 0 ? (
            <ul className="lead-list">
              {leads.map((lead) => (
                <li key={lead.id} className="lead-item">
                  <div>
                    <strong>{lead.name}</strong> — {lead.phone}
                  </div>

                  <label className="status-field">
                    Status
                    <select
                      value={lead.status}
                      onChange={(event) =>
                        handleUpdateStatus(lead.id, event.target.value as LeadStatus)
                      }
                      disabled={isUpdatingStatusId === lead.id}
                    >
                      {leadStatusOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                </li>
              ))}
            </ul>
          ) : (
            <p>Nenhum lead cadastrado.</p>
          )
        ) : null}

        <button type="button" onClick={loadLeads} disabled={isLoading}>
          Atualizar leads
        </button>
      </section>

      <button type="button" onClick={handleSignOut}>
        Sair
      </button>
    </main>
  )
}
