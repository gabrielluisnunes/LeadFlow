import { lazy, Suspense, useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import {
  BarChart3,
  Calendar,
  ChevronLeft,
  ClipboardList,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Users
} from 'lucide-react'
import { signOut } from '../modules/auth/session'
import { getToken } from '../lib/token-storage'
import { BrandLogo } from '../components/brand-logo'
import { useApiErrorHandler } from '../hooks/use-api-error-handler'
import {
  addLeadNote,
  createLead,
  updateLead,
  listLeads,
  updateLeadStatus,
  type Lead,
  type LeadStatus,
  type UpdateLeadInput
} from '../modules/leads/api'
import { formatDateBR, parseDateBRToIso } from '../lib/format-date-br'
import {
  cancelFollowUp,
  concludeFollowUp,
  createFollowUp,
  listAllFollowUps,
  listOverdueFollowUps,
  listTodayFollowUps,
  listUpcomingFollowUps,
  rescheduleFollowUp,
  type FollowUpPriority,
  type FollowUpWithLead
} from '../modules/followups/api'
import { listActivities, type Activity } from '../modules/activities/api'
import { getLeadsOverviewMetrics, type LeadsOverviewMetrics } from '../modules/metrics/api'
import type { FollowUpAction, FollowUpFormData } from './home/components/followups-section'

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

const FollowUpsSection = lazy(() =>
  import('./home/components/followups-section').then((module) => ({
    default: module.FollowUpsSection
  }))
)

type HomeView = 'inicio' | 'leads' | 'dashboard' | 'followups' | 'atividades' | 'metricas' | 'perfil'

interface LeadFormData {
  name: string
  phone: string
  email: string
  source: string
  observation: string
  observationDateTime: string
}

export function HomePage() {
  const navigate = useNavigate()
  const { handleApiError } = useApiErrorHandler()
  const [activeView, setActiveView] = useState<HomeView>('inicio')
  const [isSidebarVisible, setIsSidebarVisible] = useState(() => {
    if (typeof window === 'undefined') {
      return true
    }

    return window.innerWidth > 1024
  })

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
  const [allFollowUps, setAllFollowUps] = useState<FollowUpWithLead[]>([])
  const [isLoadingFollowUps, setIsLoadingFollowUps] = useState(true)
  const [followUpErrorMessage, setFollowUpErrorMessage] = useState('')
  const [isCreatingFollowUp, setIsCreatingFollowUp] = useState(false)
  const [createFollowUpErrorMessage, setCreateFollowUpErrorMessage] = useState('')
  const [activeFollowUpAction, setActiveFollowUpAction] = useState<{
    followUpId: string
    action: FollowUpAction
  } | null>(null)

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
    source: '',
    observation: '',
    observationDateTime: ''
  })

  const [followUpFormData, setFollowUpFormData] = useState<FollowUpFormData>({
    leadId: '',
    scheduledAt: '',
    title: '',
    priority: 'MEDIUM' as FollowUpPriority,
    notes: ''
  })

  const [profileName, setProfileName] = useState('LeadFlow CRM')
  const [profilePhoto, setProfilePhoto] = useState('')
  const [profileFeedback, setProfileFeedback] = useState('')

  const menuItems: Array<{ key: HomeView; label: string; icon: LucideIcon }> = [
    { key: 'inicio', label: 'Início', icon: Home },
    { key: 'leads', label: 'Leads', icon: Users },
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'followups', label: 'Follow-ups', icon: Calendar },
    { key: 'atividades', label: 'Atividades', icon: ClipboardList },
    { key: 'metricas', label: 'Métricas', icon: BarChart3 }
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
      const [today, overdue, upcoming, all] = await Promise.all([
        listTodayFollowUps(),
        listOverdueFollowUps(),
        listUpcomingFollowUps(),
        listAllFollowUps()
      ])

      setTodayFollowUps(today)
      setOverdueFollowUps(overdue)
      setUpcomingFollowUps(upcoming)
      setAllFollowUps(all)
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

  function handleMenuSelect(view: HomeView) {
    setActiveView(view)

    if (typeof window !== 'undefined' && window.innerWidth <= 1024) {
      setIsSidebarVisible(false)
    }
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
      const createdLead = await createLead({
        name: formData.name,
        phone: formData.phone,
        email: formData.email || undefined,
        source: formData.source || undefined
      })

      if (formData.observation.trim()) {
        await addLeadNote(createdLead.id, {
          content: formData.observation.trim(),
          createdAt: parseDateBRToIso(formData.observationDateTime)
        })
      }

      setFormData({
        name: '',
        phone: '',
        email: '',
        source: '',
        observation: '',
        observationDateTime: ''
      })

      await loadLeads()
      await loadMetrics()
      await loadActivities()
    } catch (error) {
      handleApiError(error, 'Não foi possível criar o lead', setCreateErrorMessage)
    } finally {
      setIsCreating(false)
    }
  }

  async function handleUpdateLead(leadId: string, input: UpdateLeadInput) {
    setStatusErrorMessage('')
    setIsUpdatingStatusId(leadId)

    console.log('[LeadFlow] updateLead submit', { leadId, input })

    try {
      const updatedLead = await updateLead(leadId, input)
      console.log('[LeadFlow] updateLead success', updatedLead)

      setLeads((current) =>
        current.map((lead) => (lead.id === updatedLead.id ? updatedLead : lead))
      )
    } catch (error) {
      console.error('[LeadFlow] updateLead error', { leadId, input, error })
      handleApiError(error, 'Não foi possível atualizar o lead', setStatusErrorMessage)
      throw error
    } finally {
      setIsUpdatingStatusId(null)
    }
  }

  async function handleUpdateStatus(leadId: string, status: LeadStatus) {
    setStatusErrorMessage('')
    setIsUpdatingStatusId(leadId)

    if (!leadId) {
      setStatusErrorMessage('Lead inválido para atualização de status.')
      setIsUpdatingStatusId(null)
      return
    }

    const normalizedStatus = String(status).toUpperCase() as LeadStatus
    const allowedStatus: LeadStatus[] = ['NEW', 'CONTACTED', 'WON', 'LOST']

    if (!allowedStatus.includes(normalizedStatus)) {
      setStatusErrorMessage('Status inválido enviado para API.')
      setIsUpdatingStatusId(null)
      return
    }

    console.log('enviando status:', normalizedStatus)
    console.log('leadId:', leadId)
    console.log('[LeadFlow] updateLeadStatus request', {
      endpoint: `/leads/${leadId}/status`,
      method: 'PATCH',
      hasToken: Boolean(getToken()),
      body: { status: normalizedStatus }
    })

    try {
      const updatedLead = await updateLeadStatus(leadId, normalizedStatus)
      console.log('[LeadFlow] updateLeadStatus success', updatedLead)

      if (!updatedLead?.id) {
        throw new Error('Resposta inválida ao atualizar status do lead')
      }

      setLeads((current) =>
        current.map((lead) => (lead.id === updatedLead.id ? updatedLead : lead))
      )

      await Promise.all([loadLeads(), loadMetrics()])
    } catch (error) {
      console.error('[LeadFlow] updateLeadStatus error', {
        endpoint: `/leads/${leadId}/status`,
        method: 'PATCH',
        body: { status: normalizedStatus },
        error
      })
      handleApiError(error, 'Não foi possível atualizar o status do lead', setStatusErrorMessage)
    } finally {
      setIsUpdatingStatusId(null)
    }
  }

  function handleFollowUpFieldChange(
    field: keyof FollowUpFormData,
    value: FollowUpFormData[keyof FollowUpFormData]
  ) {
    setFollowUpFormData((current) => ({
      ...current,
      [field]: value
    }))
  }

  async function handleCreateFollowUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setCreateFollowUpErrorMessage('')

    const scheduledAtIso = parseDateBRToIso(followUpFormData.scheduledAt)

    if (!scheduledAtIso) {
      setCreateFollowUpErrorMessage('Data inválida. Use o formato dd/mm/aaaa.')
      return
    }

    setIsCreatingFollowUp(true)

    try {
      await createFollowUp({
        leadId: followUpFormData.leadId,
        scheduledAt: scheduledAtIso,
        title: followUpFormData.title,
        priority: followUpFormData.priority,
        notes: followUpFormData.notes || undefined
      })

      setFollowUpFormData({
        leadId: '',
        scheduledAt: '',
        title: '',
        priority: 'MEDIUM',
        notes: ''
      })

      await Promise.all([loadFollowUpsAgenda(), loadActivities(), loadLeads(), loadMetrics()])
    } catch (error) {
      handleApiError(error, 'Não foi possível criar o follow-up', setCreateFollowUpErrorMessage)
    } finally {
      setIsCreatingFollowUp(false)
    }
  }

  async function handleMarkFollowUpAsDone(followUpId: string) {
    setFollowUpErrorMessage('')
    setActiveFollowUpAction({ followUpId, action: 'done' })

    try {
      await concludeFollowUp(followUpId)
      await Promise.all([loadFollowUpsAgenda(), loadActivities(), loadLeads(), loadMetrics()])
    } catch (error) {
      handleApiError(error, 'Não foi possível concluir o follow-up', setFollowUpErrorMessage)
    } finally {
      setActiveFollowUpAction(null)
    }
  }

  async function handleRescheduleFollowUp(followUpId: string, currentScheduledAt: string) {
    setFollowUpErrorMessage('')
    setActiveFollowUpAction({ followUpId, action: 'reschedule' })

    try {
      const currentDate = new Date(currentScheduledAt)
      currentDate.setDate(currentDate.getDate() + 1)

      await rescheduleFollowUp(followUpId, {
        scheduledAt: currentDate.toISOString()
      })

      await Promise.all([loadFollowUpsAgenda(), loadActivities(), loadLeads(), loadMetrics()])
    } catch (error) {
      handleApiError(error, 'Não foi possível reagendar o follow-up', setFollowUpErrorMessage)
    } finally {
      setActiveFollowUpAction(null)
    }
  }

  async function handleCancelFollowUp(followUpId: string) {
    setFollowUpErrorMessage('')
    setActiveFollowUpAction({ followUpId, action: 'cancel' })

    try {
      await cancelFollowUp(followUpId)
      await Promise.all([loadFollowUpsAgenda(), loadActivities()])
    } catch (error) {
      handleApiError(error, 'Não foi possível cancelar o follow-up', setFollowUpErrorMessage)
    } finally {
      setActiveFollowUpAction(null)
    }
  }

  function formatDateTime(value: string) {
    return formatDateBR(value)
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
            onUpdateLead={handleUpdateLead}
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
            leads={leads}
            onRefreshActivities={loadActivities}
            formatDateTime={formatDateTime}
          />
        </Suspense>
      )
    }

    if (activeView === 'followups') {
      return (
        <Suspense fallback={renderSectionFallback('Carregando seção de follow-ups...')}>
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
            allFollowUps={allFollowUps}
            activeFollowUpAction={activeFollowUpAction}
            onMarkFollowUpAsDone={handleMarkFollowUpAsDone}
            onRescheduleFollowUp={handleRescheduleFollowUp}
            onCancelFollowUp={handleCancelFollowUp}
            onRefreshAgenda={loadFollowUpsAgenda}
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
            leads={leads}
            onRefresh={loadMetrics}
          />
        </Suspense>
      )
    }

    return (
      <section className="list-section profile-section">
        <div className="profile-panel">
          <form className="auth-form profile-form" onSubmit={handleSaveProfile}>
            <div className="profile-preview">
              {profilePhoto ? (
                <img src={profilePhoto} alt="Foto de perfil" />
              ) : (
                <div className="profile-placeholder">{profileName.charAt(0).toUpperCase()}</div>
              )}
            </div>

            <p className="profile-name">{profileName}</p>

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
        </div>
      </section>
    )
  }

  const pageTitleMap: Record<HomeView, string> = {
    inicio: 'Inicio',
    leads: 'Leads',
    dashboard: 'Dashboard',
    followups: 'Follow-ups',
    atividades: 'Atividades',
    metricas: 'Metricas',
    perfil: 'Perfil'
  }

  return (
    <div className={`dashboard-layout ${isSidebarVisible ? 'sidebar-open' : 'sidebar-hidden'}`}>
      {isSidebarVisible ? (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Fechar menu"
          onClick={() => setIsSidebarVisible(false)}
        />
      ) : null}

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

          <BrandLogo className="sidebar-brand" />

          <nav className="sidebar-nav" aria-label="Navegação principal">
            {menuItems.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`sidebar-nav-item ${activeView === item.key ? 'active' : ''}`}
                onClick={() => handleMenuSelect(item.key)}
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
            onClick={() => handleMenuSelect('perfil')}
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
          {activeView !== 'leads' ? <h1>{pageTitleMap[activeView]}</h1> : null}
        </header>

        {renderMainContent()}
      </main>
    </div>
  )
}
