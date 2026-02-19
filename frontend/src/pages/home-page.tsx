import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
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

type HomeView = 'inicio' | 'leads' | 'dashboard' | 'atividades' | 'metricas' | 'perfil'

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
  const [activeView, setActiveView] = useState<HomeView>('inicio')

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

  const [profileName, setProfileName] = useState('LeadFlow CRM')
  const [profilePhoto, setProfilePhoto] = useState('')
  const [profileFeedback, setProfileFeedback] = useState('')

  const menuItems: Array<{ key: HomeView; label: string }> = [
    { key: 'inicio', label: 'Inicio' },
    { key: 'leads', label: 'Leads' },
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'atividades', label: 'Atividades' },
    { key: 'metricas', label: 'Metricas' }
  ]

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

  useEffect(() => {
    const savedName = localStorage.getItem('leadflow.profile.name')
    const savedPhoto = localStorage.getItem('leadflow.profile.photo')

    if (savedName) {
      setProfileName(savedName)
    }

    if (savedPhoto) {
      setProfilePhoto(savedPhoto)
    }
  }, [])

  function handleSignOut() {
    signOut()
    navigate('/login', { replace: true })
  }

  function handleProfilePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setProfilePhoto(reader.result)
      }
    }

    reader.readAsDataURL(file)
  }

  function handleSaveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    localStorage.setItem('leadflow.profile.name', profileName)
    localStorage.setItem('leadflow.profile.photo', profilePhoto)

    setProfileFeedback('Perfil atualizado com sucesso.')
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

  const totalOpenFollowUps = todayFollowUps.length + overdueFollowUps.length + upcomingFollowUps.length

  function renderMainContent() {
    if (activeView === 'inicio') {
      return (
        <>
          <section className="overview-cards">
            <article className="overview-card">
              <strong>{metrics?.totalLeads ?? 0}</strong>
              <span>Total de leads</span>
            </article>
            <article className="overview-card">
              <strong>{metrics?.byStatus.CONTACTED ?? 0}</strong>
              <span>Em contato</span>
            </article>
            <article className="overview-card">
              <strong>{totalOpenFollowUps}</strong>
              <span>Follow-ups abertos</span>
            </article>
            <article className="overview-card">
              <strong>{metrics?.conversaionRate ?? 0}%</strong>
              <span>Taxa de conversão</span>
            </article>
          </section>

          <section className="recent-section">
            <h2>Dados recentes</h2>
            <div className="recent-grid">
              <article className="recent-card">
                <h3>Hoje</h3>
                {todayFollowUps.length > 0 ? (
                  <ul className="compact-list">
                    {todayFollowUps.slice(0, 4).map((followUp) => (
                      <li key={followUp.id}>
                        <span>{followUp.lead.name}</span>
                        <small>{formatDateTime(followUp.scheduledAt)}</small>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Nenhum follow-up para hoje.</p>
                )}
              </article>

              <article className="recent-card">
                <h3>Atrasados</h3>
                {overdueFollowUps.length > 0 ? (
                  <ul className="compact-list">
                    {overdueFollowUps.slice(0, 4).map((followUp) => (
                      <li key={followUp.id}>
                        <span>{followUp.lead.name}</span>
                        <small>{formatDateTime(followUp.scheduledAt)}</small>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Nenhum follow-up atrasado.</p>
                )}
              </article>
            </div>
          </section>
        </>
      )
    }

    if (activeView === 'leads') {
      return (
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
      )
    }

    if (activeView === 'dashboard') {
      return (
        <>
          <MetricsSection
            isLoading={isLoadingMetrics}
            errorMessage={metricsErrorMessage}
            metrics={metrics}
            onRefresh={loadMetrics}
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
        </>
      )
    }

    if (activeView === 'atividades') {
      return (
        <ActivitiesSection
          isLoadingActivities={isLoadingActivities}
          activitiesErrorMessage={activitiesErrorMessage}
          activities={activities}
          onRefreshActivities={loadActivities}
          formatDateTime={formatDateTime}
        />
      )
    }

    if (activeView === 'metricas') {
      return (
        <MetricsSection
          isLoading={isLoadingMetrics}
          errorMessage={metricsErrorMessage}
          metrics={metrics}
          onRefresh={loadMetrics}
        />
      )
    }

    return (
      <section className="list-section">
        <h2>Perfil</h2>

        <form className="auth-form profile-form" onSubmit={handleSaveProfile}>
          <div className="profile-preview">
            {profilePhoto ? (
              <img src={profilePhoto} alt="Foto de perfil" />
            ) : (
              <div className="profile-placeholder">{profileName.charAt(0).toUpperCase()}</div>
            )}
          </div>

          <label>
            Nome
            <input
              type="text"
              value={profileName}
              onChange={(event) => setProfileName(event.target.value)}
              required
            />
          </label>

          <label>
            Foto
            <input type="file" accept="image/*" onChange={handleProfilePhotoChange} />
          </label>

          {profileFeedback ? <p className="profile-feedback">{profileFeedback}</p> : null}

          <button type="submit">Salvar perfil</button>
        </form>
      </section>
    )
  }

  const pageTitleMap: Record<HomeView, string> = {
    inicio: 'Inicio',
    leads: 'Leads',
    dashboard: 'Dashboard',
    atividades: 'Atividades',
    metricas: 'Metricas',
    perfil: 'Perfil'
  }

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div>
          <div className="sidebar-brand">
            <span className="sidebar-brand-drop" aria-hidden="true" />
            <span>LeadFlow</span>
          </div>

          <nav className="sidebar-nav" aria-label="Navegação principal">
            {menuItems.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`sidebar-nav-item ${activeView === item.key ? 'active' : ''}`}
                onClick={() => setActiveView(item.key)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="sidebar-footer">
          <button
            type="button"
            className="profile-card"
            onClick={() => setActiveView('perfil')}
          >
            {profilePhoto ? (
              <img src={profilePhoto} alt="Foto de perfil" className="profile-card-photo" />
            ) : (
              <span className="profile-card-avatar">{profileName.charAt(0).toUpperCase()}</span>
            )}
            <div>
              <strong>{profileName}</strong>
              <small>Ver perfil</small>
            </div>
          </button>

          <button type="button" className="sidebar-signout" onClick={handleSignOut}>
            Sair
          </button>
        </div>
      </aside>

      <main className="dashboard-content">
        <header className="dashboard-header">
          <h1>{pageTitleMap[activeView]}</h1>
        </header>

        {renderMainContent()}
      </main>
    </div>
  )
}
