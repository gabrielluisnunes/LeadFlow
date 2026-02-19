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
import {
  createFollowUp,
  listOverdueFollowUps,
  listTodayFollowUps,
  listUpcomingFollowUps,
  markFollowUpAsDone,
  type FollowUpWithLead
} from '../modules/followups/api'
import { listActivities, type Activity } from '../modules/activities/api'
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
  const [todayFollowUps, setTodayFollowUps] = useState<FollowUpWithLead[]>([])
  const [overdueFollowUps, setOverdueFollowUps] = useState<FollowUpWithLead[]>([])
  const [upcomingFollowUps, setUpcomingFollowUps] = useState<FollowUpWithLead[]>([])
  const [isLoadingFollowUps, setIsLoadingFollowUps] = useState(true)
  const [followUpErrorMessage, setFollowUpErrorMessage] = useState('')
  const [isCreatingFollowUp, setIsCreatingFollowUp] = useState(false)
  const [isMarkingDoneId, setIsMarkingDoneId] = useState<string | null>(null)
  const [createFollowUpErrorMessage, setCreateFollowUpErrorMessage] = useState('')
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoadingActivities, setIsLoadingActivities] = useState(true)
  const [activitiesErrorMessage, setActivitiesErrorMessage] = useState('')
  const [followUpFormData, setFollowUpFormData] = useState({
    leadId: '',
    scheduledAt: ''
  })
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

  async function loadFollowUpsAgenda() {
    setFollowUpErrorMessage('')
    setIsLoadingFollowUps(true)

    try {
      const [today, overdue, upcoming] = await Promise.all([
        listTodayFollowUps(),
        listOverdueFollowUps(),
        listUpcomingFollowUps()
      ])

      setTodayFollowUps(today)
      setOverdueFollowUps(overdue)
      setUpcomingFollowUps(upcoming)
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        signOut()
        navigate('/login', { replace: true })
        return
      }

      if (error instanceof ApiError) {
        setFollowUpErrorMessage(error.message)
      } else {
        setFollowUpErrorMessage('Não foi possível carregar a agenda de follow-ups')
      }
    } finally {
      setIsLoadingFollowUps(false)
    }
  }

  useEffect(() => {
    loadFollowUpsAgenda()
  }, [])

  async function loadActivities() {
    setActivitiesErrorMessage('')
    setIsLoadingActivities(true)

    try {
      const items = await listActivities()
      setActivities(items)
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        signOut()
        navigate('/login', { replace: true })
        return
      }

      if (error instanceof ApiError) {
        setActivitiesErrorMessage(error.message)
      } else {
        setActivitiesErrorMessage('Não foi possível carregar o histórico de atividades')
      }
    } finally {
      setIsLoadingActivities(false)
    }
  }

  useEffect(() => {
    loadActivities()
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
      const createdLead = await createLead({
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

      if (!followUpFormData.leadId) {
        setFollowUpFormData((current) => ({
          ...current,
          leadId: createdLead.id
        }))
      }
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

  async function handleCreateFollowUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setCreateFollowUpErrorMessage('')
    setIsCreatingFollowUp(true)

    try {
      await createFollowUp({
        leadId: followUpFormData.leadId,
        scheduledAt: new Date(followUpFormData.scheduledAt).toISOString()
      })

      setFollowUpFormData((current) => ({
        ...current,
        scheduledAt: ''
      }))

      await loadFollowUpsAgenda()
      await loadActivities()
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        signOut()
        navigate('/login', { replace: true })
        return
      }

      if (error instanceof ApiError) {
        setCreateFollowUpErrorMessage(error.message)
      } else {
        setCreateFollowUpErrorMessage('Não foi possível criar o follow-up')
      }
    } finally {
      setIsCreatingFollowUp(false)
    }
  }

  async function handleMarkFollowUpAsDone(followUpId: string) {
    setCreateFollowUpErrorMessage('')
    setIsMarkingDoneId(followUpId)

    try {
      await markFollowUpAsDone(followUpId)
      await loadFollowUpsAgenda()
      await loadActivities()
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        signOut()
        navigate('/login', { replace: true })
        return
      }

      if (error instanceof ApiError) {
        setCreateFollowUpErrorMessage(error.message)
      } else {
        setCreateFollowUpErrorMessage('Não foi possível concluir o follow-up')
      }
    } finally {
      setIsMarkingDoneId(null)
    }
  }

  function formatDateTime(value: string) {
    return new Date(value).toLocaleString('pt-BR')
  }

  function getActivityLabel(activity: Activity) {
    switch (activity.type) {
      case 'LEAD_CREATED':
        return 'Lead criado'
      case 'LEAD_STATUS_UPDATED':
        return 'Status do lead atualizado'
      case 'FOLLOWUP_CREATED':
        return 'Follow-up criado'
      case 'FOLLOWUP_DONE':
        return 'Follow-up concluído'
      default:
        return activity.type
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

      <section className="list-section">
        <h2>Novo follow-up</h2>

        <form className="auth-form" onSubmit={handleCreateFollowUp}>
          <label>
            Lead
            <select
              value={followUpFormData.leadId}
              onChange={(event) =>
                setFollowUpFormData((current) => ({ ...current, leadId: event.target.value }))
              }
              required
            >
              <option value="">Selecione um lead</option>
              {leads.map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {lead.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Data e hora
            <input
              type="datetime-local"
              value={followUpFormData.scheduledAt}
              onChange={(event) =>
                setFollowUpFormData((current) => ({
                  ...current,
                  scheduledAt: event.target.value
                }))
              }
              required
            />
          </label>

          {createFollowUpErrorMessage ? (
            <p className="form-error">{createFollowUpErrorMessage}</p>
          ) : null}

          <button type="submit" disabled={isCreatingFollowUp || leads.length === 0}>
            {isCreatingFollowUp ? 'Salvando...' : 'Criar follow-up'}
          </button>
        </form>
      </section>

      <section className="list-section">
        <h2>Agenda de follow-ups</h2>

        {isLoadingFollowUps ? <p>Carregando agenda...</p> : null}
        {!isLoadingFollowUps && followUpErrorMessage ? (
          <p className="form-error">{followUpErrorMessage}</p>
        ) : null}

        {!isLoadingFollowUps && !followUpErrorMessage ? (
          <>
            <h3>Hoje</h3>
            {todayFollowUps.length > 0 ? (
              <ul className="followup-list">
                {todayFollowUps.map((followUp) => (
                  <li key={followUp.id} className="followup-item">
                    <div>
                      <strong>{followUp.lead.name}</strong> — {formatDateTime(followUp.scheduledAt)}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleMarkFollowUpAsDone(followUp.id)}
                      disabled={isMarkingDoneId === followUp.id}
                    >
                      {isMarkingDoneId === followUp.id ? 'Concluindo...' : 'Concluir'}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Nenhum follow-up para hoje.</p>
            )}

            <h3>Atrasados</h3>
            {overdueFollowUps.length > 0 ? (
              <ul className="followup-list">
                {overdueFollowUps.map((followUp) => (
                  <li key={followUp.id} className="followup-item">
                    <div>
                      <strong>{followUp.lead.name}</strong> — {formatDateTime(followUp.scheduledAt)}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleMarkFollowUpAsDone(followUp.id)}
                      disabled={isMarkingDoneId === followUp.id}
                    >
                      {isMarkingDoneId === followUp.id ? 'Concluindo...' : 'Concluir'}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Nenhum follow-up atrasado.</p>
            )}

            <h3>Próximos (7 dias)</h3>
            {upcomingFollowUps.length > 0 ? (
              <ul className="followup-list">
                {upcomingFollowUps.map((followUp) => (
                  <li key={followUp.id} className="followup-item">
                    <div>
                      <strong>{followUp.lead.name}</strong> — {formatDateTime(followUp.scheduledAt)}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleMarkFollowUpAsDone(followUp.id)}
                      disabled={isMarkingDoneId === followUp.id}
                    >
                      {isMarkingDoneId === followUp.id ? 'Concluindo...' : 'Concluir'}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Nenhum follow-up próximo.</p>
            )}

            <button type="button" onClick={loadFollowUpsAgenda} disabled={isLoadingFollowUps}>
              Atualizar agenda
            </button>
          </>
        ) : null}
      </section>

      <section className="list-section">
        <h2>Atividades</h2>

        {isLoadingActivities ? <p>Carregando atividades...</p> : null}
        {!isLoadingActivities && activitiesErrorMessage ? (
          <p className="form-error">{activitiesErrorMessage}</p>
        ) : null}

        {!isLoadingActivities && !activitiesErrorMessage ? (
          activities.length > 0 ? (
            <ul className="activity-list">
              {activities.map((activity) => (
                <li key={activity.id} className="activity-item">
                  <strong>{getActivityLabel(activity)}</strong>
                  <div className="activity-meta">
                    <span>{formatDateTime(activity.createdAt)}</span>
                    {activity.leadId ? <span>Lead: {activity.leadId}</span> : null}
                    {activity.followUpId ? <span>Follow-up: {activity.followUpId}</span> : null}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>Nenhuma atividade registrada.</p>
          )
        ) : null}

        <button type="button" onClick={loadActivities} disabled={isLoadingActivities}>
          Atualizar atividades
        </button>
      </section>

      <button type="button" onClick={handleSignOut}>
        Sair
      </button>
    </main>
  )
}
