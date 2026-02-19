import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { env } from '../lib/env'
import { signOut } from '../modules/auth/session'
import { useApiErrorHandler } from '../hooks/use-api-error-handler'
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
import { getLeadsOverviewMetrics, type LeadsOverviewMetrics } from '../modules/metrics/api'
import { MetricsSection } from './home/components/metrics-section'
import { LeadsSection } from './home/components/leads-section'
import { FollowUpsSection } from './home/components/followups-section'
import { ActivitiesSection } from './home/components/activities-section'

interface LeadFormData {
  name: string
  phone: string
  email: string
  source: string
}

interface FollowUpFormData {
  leadId: string
  scheduledAt: string
}

export function HomePage() {
  const navigate = useNavigate()
  const { handleApiError } = useApiErrorHandler()

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

  const [metrics, setMetrics] = useState<LeadsOverviewMetrics | null>(null)
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true)
  const [metricsErrorMessage, setMetricsErrorMessage] = useState('')

  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoadingActivities, setIsLoadingActivities] = useState(true)
  const [activitiesErrorMessage, setActivitiesErrorMessage] = useState('')

  const [followUpFormData, setFollowUpFormData] = useState<FollowUpFormData>({
    leadId: '',
    scheduledAt: ''
  })

  const [formData, setFormData] = useState<LeadFormData>({
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
      handleApiError(error, 'Não foi possível carregar os leads', setErrorMessage)
    } finally {
      setIsLoading(false)
    }
  }

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
      handleApiError(
        error,
        'Não foi possível carregar a agenda de follow-ups',
        setFollowUpErrorMessage
      )
    } finally {
      setIsLoadingFollowUps(false)
    }
  }

  async function loadActivities() {
    setActivitiesErrorMessage('')
    setIsLoadingActivities(true)

    try {
      const items = await listActivities()
      setActivities(items)
    } catch (error) {
      handleApiError(
        error,
        'Não foi possível carregar o histórico de atividades',
        setActivitiesErrorMessage
      )
    } finally {
      setIsLoadingActivities(false)
    }
  }

  async function loadMetrics() {
    setMetricsErrorMessage('')
    setIsLoadingMetrics(true)

    try {
      const data = await getLeadsOverviewMetrics()
      setMetrics(data)
    } catch (error) {
      handleApiError(error, 'Não foi possível carregar as métricas', setMetricsErrorMessage)
    } finally {
      setIsLoadingMetrics(false)
    }
  }

  useEffect(() => {
    loadLeads()
    loadFollowUpsAgenda()
    loadActivities()
    loadMetrics()
  }, [])

  function handleSignOut() {
    signOut()
    navigate('/login', { replace: true })
  }

  function handleLeadFieldChange(field: keyof LeadFormData, value: string) {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  function handleFollowUpFieldChange(field: keyof FollowUpFormData, value: string) {
    setFollowUpFormData((current) => ({ ...current, [field]: value }))
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
      await loadMetrics()

      if (!followUpFormData.leadId) {
        setFollowUpFormData((current) => ({
          ...current,
          leadId: createdLead.id
        }))
      }
    } catch (error) {
      handleApiError(error, 'Não foi possível criar o lead', setCreateErrorMessage)
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

      await loadMetrics()
    } catch (error) {
      handleApiError(error, 'Não foi possível atualizar o status do lead', setStatusErrorMessage)
    } finally {
      setIsUpdatingStatusId(null)
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
      handleApiError(error, 'Não foi possível criar o follow-up', setCreateFollowUpErrorMessage)
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
      handleApiError(
        error,
        'Não foi possível concluir o follow-up',
        setCreateFollowUpErrorMessage
      )
    } finally {
      setIsMarkingDoneId(null)
    }
  }

  function formatDateTime(value: string) {
    return new Date(value).toLocaleString('pt-BR')
  }

  return (
    <main className="app-shell">
      <h1>LeadFlow</h1>

      <p>Login realizado com sucesso.</p>

      <ul>
        <li>Backend URL: {env.apiBaseUrl}</li>
        <li>Contrato: respostas em {`{ data: ... }`} e erros em {`{ error: ... }`}</li>
      </ul>

      <MetricsSection
        isLoading={isLoadingMetrics}
        errorMessage={metricsErrorMessage}
        metrics={metrics}
        onRefresh={loadMetrics}
      />

      <LeadsSection
        formData={formData}
        isCreating={isCreating}
        createErrorMessage={createErrorMessage}
        onCreateLead={handleCreateLead}
        onLeadFieldChange={handleLeadFieldChange}
        leads={leads}
        isLoading={isLoading}
        errorMessage={errorMessage}
        statusErrorMessage={statusErrorMessage}
        isUpdatingStatusId={isUpdatingStatusId}
        onUpdateStatus={handleUpdateStatus}
        onRefreshLeads={loadLeads}
      />

      <FollowUpsSection
        formData={followUpFormData}
        leads={leads}
        isCreatingFollowUp={isCreatingFollowUp}
        createFollowUpErrorMessage={createFollowUpErrorMessage}
        onCreateFollowUp={handleCreateFollowUp}
        onFollowUpFieldChange={handleFollowUpFieldChange}
        isLoadingFollowUps={isLoadingFollowUps}
        followUpErrorMessage={followUpErrorMessage}
        todayFollowUps={todayFollowUps}
        overdueFollowUps={overdueFollowUps}
        upcomingFollowUps={upcomingFollowUps}
        isMarkingDoneId={isMarkingDoneId}
        onMarkFollowUpAsDone={handleMarkFollowUpAsDone}
        onRefreshAgenda={loadFollowUpsAgenda}
        formatDateTime={formatDateTime}
      />

      <ActivitiesSection
        isLoadingActivities={isLoadingActivities}
        activitiesErrorMessage={activitiesErrorMessage}
        activities={activities}
        onRefreshActivities={loadActivities}
        formatDateTime={formatDateTime}
      />

      <button type="button" onClick={handleSignOut}>
        Sair
      </button>
    </main>
  )
}
