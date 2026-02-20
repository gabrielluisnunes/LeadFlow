import { lazy, Suspense, useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import {
  BarChart3,
  ChevronLeft,
  ClipboardList,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Users
} from 'lucide-react'
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
  listOverdueFollowUps,
  listTodayFollowUps,
  listUpcomingFollowUps,
  type FollowUpWithLead
} from '../modules/followups/api'
import { listActivities, type Activity } from '../modules/activities/api'
import { getLeadsOverviewMetrics, type LeadsOverviewMetrics } from '../modules/metrics/api'

const MetricsSection = lazy(() =>
  import('./home/components/metrics-section').then((module) => ({
    default: module.MetricsSection
  }))
)

const LeadsSection = lazy(() =>
  import('./home/components/leads-section').then((module) => ({
    default: module.LeadsSection
  }))
)

const ActivitiesSection = lazy(() =>
  import('./home/components/activities-section').then((module) => ({
    default: module.ActivitiesSection
  }))
)

const DashboardSection = lazy(() =>
  import('./home/components/dashboard-section').then((module) => ({
    default: module.DashboardSection
  }))
)

type HomeView = 'inicio' | 'leads' | 'dashboard' | 'atividades' | 'metricas' | 'perfil'

interface LeadFormData {
  name: string
  phone: string
  email: string
  source: string
}

export function HomePage() {
  const navigate = useNavigate()
  const { handleApiError } = useApiErrorHandler()
  const [activeView, setActiveView] = useState<HomeView>('inicio')
  const [isSidebarVisible, setIsSidebarVisible] = useState(true)

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
  const [followUpErrorMessage, setFollowUpErrorMessage] = useState('')

  const [metrics, setMetrics] = useState<LeadsOverviewMetrics | null>(null)
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true)
  const [metricsErrorMessage, setMetricsErrorMessage] = useState('')

  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoadingActivities, setIsLoadingActivities] = useState(true)
  const [activitiesErrorMessage, setActivitiesErrorMessage] = useState('')

  const [formData, setFormData] = useState<LeadFormData>({
    name: '',
    phone: '',
    email: '',
    source: ''
  })

  const [profileName, setProfileName] = useState('LeadFlow CRM')
  const [profilePhoto, setProfilePhoto] = useState('')
  const [profileFeedback, setProfileFeedback] = useState('')

  const menuItems: Array<{ key: HomeView; label: string; icon: LucideIcon }> = [
    { key: 'inicio', label: 'Inicio', icon: Home },
    { key: 'leads', label: 'Leads', icon: Users },
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'atividades', label: 'Atividades', icon: ClipboardList },
    { key: 'metricas', label: 'Metricas', icon: BarChart3 }
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
      await loadMetrics()
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

  function formatDateTime(value: string) {
    return new Date(value).toLocaleString('pt-BR')
  }

  const totalOpenFollowUps = todayFollowUps.length + overdueFollowUps.length + upcomingFollowUps.length

  function renderSectionFallback(message: string) {
    return (
      <section className="list-section">
        <p>{message}</p>
      </section>
    )
  }

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
            {followUpErrorMessage ? <p className="form-error">{followUpErrorMessage}</p> : null}
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
        <Suspense fallback={renderSectionFallback('Carregando seção de leads...')}>
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
        </Suspense>
      )
    }

    if (activeView === 'dashboard') {
      return (
        <Suspense fallback={renderSectionFallback('Carregando dashboard...')}>
          <DashboardSection
            leads={leads}
            metrics={metrics}
            isLoading={isLoadingMetrics}
            errorMessage={metricsErrorMessage}
            onRefresh={loadMetrics}
          />
        </Suspense>
      )
    }

    if (activeView === 'atividades') {
      return (
        <Suspense fallback={renderSectionFallback('Carregando atividades...')}>
          <ActivitiesSection
            isLoadingActivities={isLoadingActivities}
            activitiesErrorMessage={activitiesErrorMessage}
            activities={activities}
            onRefreshActivities={loadActivities}
            formatDateTime={formatDateTime}
          />
        </Suspense>
      )
    }

    if (activeView === 'metricas') {
      return (
        <Suspense fallback={renderSectionFallback('Carregando métricas...')}>
          <MetricsSection
            isLoading={isLoadingMetrics}
            errorMessage={metricsErrorMessage}
            metrics={metrics}
            onRefresh={loadMetrics}
          />
        </Suspense>
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
    <div className={`dashboard-layout ${isSidebarVisible ? '' : 'sidebar-hidden'}`}>
      {isSidebarVisible ? (
        <aside className="sidebar">
        <div>
          <button
            type="button"
            className="sidebar-toggle"
            onClick={() => setIsSidebarVisible(false)}
            aria-label="Esconder sidebar"
          >
            <ChevronLeft size={18} strokeWidth={2.2} aria-hidden="true" />
          </button>

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
                <span className="sidebar-nav-icon" aria-hidden="true">
                  <item.icon size={18} strokeWidth={2.1} />
                </span>
                <span>{item.label}</span>
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
            <span className="sidebar-nav-icon" aria-hidden="true">
              <LogOut size={18} strokeWidth={2.1} />
            </span>
            Sair
          </button>
        </div>
      </aside>
      ) : null}

      <main className="dashboard-content">
        <header className="dashboard-header">
          {!isSidebarVisible ? (
            <button
              type="button"
              className="sidebar-toggle-open"
              onClick={() => setIsSidebarVisible(true)}
            >
              <Menu size={17} strokeWidth={2.2} aria-hidden="true" />
              <span>Mostrar menu</span>
            </button>
          ) : null}
          <h1>{pageTitleMap[activeView]}</h1>
        </header>

        {renderMainContent()}
      </main>
    </div>
  )
}
