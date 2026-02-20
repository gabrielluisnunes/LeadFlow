import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import type { Lead, LeadStatus } from '../../../modules/leads/api'

const leadStatusOptions: LeadStatus[] = ['NEW', 'CONTACTED', 'WON', 'LOST']

const leadStatusLabelMap: Record<LeadStatus, string> = {
  NEW: 'Novo',
  CONTACTED: 'Em contato',
  WON: 'Convertido',
  LOST: 'Perdido'
}

interface LeadFormData {
  name: string
  phone: string
  email: string
  source: string
}

interface LeadsSectionProps {
  formData: LeadFormData
  isCreating: boolean
  createErrorMessage: string
  onCreateLead: (event: FormEvent<HTMLFormElement>) => void
  onLeadFieldChange: (field: keyof LeadFormData, value: string) => void
  leads: Lead[]
  isLoading: boolean
  errorMessage: string
  statusErrorMessage: string
  isUpdatingStatusId: string | null
  onUpdateStatus: (leadId: string, status: LeadStatus) => void
  onRefreshLeads: () => void
}

export function LeadsSection({
  formData,
  isCreating,
  createErrorMessage,
  onCreateLead,
  onLeadFieldChange,
  leads,
  isLoading,
  errorMessage,
  statusErrorMessage,
  isUpdatingStatusId,
  onUpdateStatus,
  onRefreshLeads
}: LeadsSectionProps) {
  const leadsByStatus = leads.reduce(
    (accumulator, lead) => {
      accumulator[lead.status] += 1
      return accumulator
    },
    {
      NEW: 0,
      CONTACTED: 0,
      WON: 0,
      LOST: 0
    } satisfies Record<LeadStatus, number>
  )

  const [searchValue, setSearchValue] = useState('')
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'ALL'>('ALL')

  const filteredLeads = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase()

    return leads.filter((lead) => {
      const matchesStatus = statusFilter === 'ALL' || lead.status === statusFilter

      if (!normalizedSearch) {
        return matchesStatus
      }

      const matchesSearch =
        lead.name.toLowerCase().includes(normalizedSearch) || lead.phone.includes(normalizedSearch)

      return matchesStatus && matchesSearch
    })
  }, [leads, searchValue, statusFilter])

  function formatLeadDate(date: string) {
    return new Date(date).toLocaleDateString('pt-BR')
  }

  return (
    <section className="leads-page">
      <div className="leads-top-grid">
        <article className="leads-panel">
          <header className="leads-panel-header">
            <h2 className="title-with-emoji">
              <span className="title-emoji" aria-hidden="true">
                🧲
              </span>
              <span>Novo lead</span>
            </h2>
            <p>Preencha os dados para cadastrar rapidamente.</p>
          </header>

          <form className="auth-form leads-form" onSubmit={onCreateLead}>
            <label>
              Nome
              <input
                type="text"
                value={formData.name}
                onChange={(event) => onLeadFieldChange('name', event.target.value)}
                minLength={3}
                required
              />
            </label>

            <label>
              Telefone
              <input
                type="text"
                value={formData.phone}
                onChange={(event) => onLeadFieldChange('phone', event.target.value)}
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
                onChange={(event) => onLeadFieldChange('email', event.target.value)}
              />
            </label>

            <label>
              Origem (opcional)
              <input
                type="text"
                value={formData.source}
                onChange={(event) => onLeadFieldChange('source', event.target.value)}
              />
            </label>

            {createErrorMessage ? <p className="form-error">{createErrorMessage}</p> : null}

            <button type="submit" className="leads-primary-action" disabled={isCreating}>
              {isCreating ? 'Salvando lead...' : 'Criar lead'}
            </button>
          </form>
        </article>

        <aside className="leads-panel leads-summary-panel">
          <header className="leads-panel-header">
            <h2 className="title-with-emoji">
              <span className="title-emoji" aria-hidden="true">
                📌
              </span>
              <span>Resumo</span>
            </h2>
            <p>Visão rápida do funil de leads.</p>
          </header>

          <div className="leads-summary-grid">
            <article className="leads-summary-card">
              <small>Total</small>
              <strong>{leads.length}</strong>
            </article>

            <article className="leads-summary-card">
              <small>Novos</small>
              <strong>{leadsByStatus.NEW}</strong>
            </article>

            <article className="leads-summary-card">
              <small>Em contato</small>
              <strong>{leadsByStatus.CONTACTED}</strong>
            </article>

            <article className="leads-summary-card">
              <small>Convertidos</small>
              <strong>{leadsByStatus.WON}</strong>
            </article>
          </div>

          <button
            type="button"
            className="leads-secondary-action"
            onClick={onRefreshLeads}
            disabled={isLoading}
          >
            Atualizar leads
          </button>
        </aside>
      </div>

      <article className="leads-panel">
        <header className="leads-panel-header">
          <h2 className="title-with-emoji">
            <span className="title-emoji" aria-hidden="true">
              📋
            </span>
            <span>Leads cadastrados</span>
          </h2>
          <p>Gerencie status e acompanhe os contatos em andamento.</p>
        </header>

        <div className="leads-filters">
          <label className="leads-filter-field">
            Buscar
            <input
              type="search"
              placeholder="Nome ou telefone"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
            />
          </label>

          <label className="leads-filter-field">
            Status
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as LeadStatus | 'ALL')}
            >
              <option value="ALL">Todos</option>
              {leadStatusOptions.map((option) => (
                <option key={option} value={option}>
                  {leadStatusLabelMap[option]}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            className="leads-clear-filters"
            onClick={() => {
              setSearchValue('')
              setStatusFilter('ALL')
            }}
            disabled={!searchValue && statusFilter === 'ALL'}
          >
            Limpar filtros
          </button>
        </div>

        {isLoading ? <p>Carregando leads...</p> : null}
        {!isLoading && errorMessage ? <p className="form-error">{errorMessage}</p> : null}
        {!isLoading && !errorMessage && statusErrorMessage ? (
          <p className="form-error">{statusErrorMessage}</p>
        ) : null}

        {!isLoading && !errorMessage ? (
          filteredLeads.length > 0 ? (
            <ul className="lead-cards-list">
              {filteredLeads.map((lead) => (
                <li key={lead.id} className="lead-card-item">
                  <div className="lead-card-main">
                    <div>
                      <h3>{lead.name}</h3>
                      <p>{lead.phone}</p>
                    </div>

                    <span className={`lead-status-badge status-${lead.status.toLowerCase()}`}>
                      {leadStatusLabelMap[lead.status]}
                    </span>
                  </div>

                  <div className="lead-card-meta">
                    <span>
                      <strong>Email:</strong> {lead.email || 'Não informado'}
                    </span>
                    <span>
                      <strong>Origem:</strong> {lead.source || 'Não informada'}
                    </span>
                    <span>
                      <strong>Cadastro:</strong> {formatLeadDate(lead.createdAt)}
                    </span>
                  </div>

                  <label className="status-field lead-status-field">
                    Status
                    <select
                      value={lead.status}
                      onChange={(event) => onUpdateStatus(lead.id, event.target.value as LeadStatus)}
                      disabled={isUpdatingStatusId === lead.id}
                    >
                      {leadStatusOptions.map((option) => (
                        <option key={option} value={option}>
                          {leadStatusLabelMap[option]}
                        </option>
                      ))}
                    </select>
                  </label>
                </li>
              ))}
            </ul>
          ) : (
            <p className="leads-empty-state">
              {leads.length === 0
                ? 'Nenhum lead cadastrado ainda.'
                : 'Nenhum lead encontrado com os filtros aplicados.'}
            </p>
          )
        ) : null}
      </article>
    </section>
  )
}
