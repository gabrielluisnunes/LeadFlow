import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import {
  addLeadNote,
  getLeadDetails,
  type Lead,
  type LeadDetails,
  type LeadStatus,
  type UpdateLeadInput
} from '../../../modules/leads/api'

const leadStatusOptions: LeadStatus[] = ['NEW', 'CONTACTED', 'WON', 'LOST']

const leadStatusLabelMap: Record<LeadStatus, string> = {
  NEW: 'Novo',
  CONTACTED: 'Em contato',
  WON: 'Convertido',
  LOST: 'Perdido'
}

const sourceOptions = ['Instagram', 'Facebook', 'WhatsApp', 'Email'] as const

interface LeadFormData {
  name: string
  phone: string
  email: string
  source: string
  observation: string
  observationDateTime: string
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
  onUpdateLead: (leadId: string, input: UpdateLeadInput) => Promise<void>
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
  onUpdateLead,
  onRefreshLeads
}: LeadsSectionProps) {
  const [phoneTouched, setPhoneTouched] = useState(false)
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [selectedLeadDetails, setSelectedLeadDetails] = useState<LeadDetails | null>(null)
  const [isLoadingLeadDetails, setIsLoadingLeadDetails] = useState(false)
  const [leadDetailsErrorMessage, setLeadDetailsErrorMessage] = useState('')
  const [isSavingLead, setIsSavingLead] = useState(false)
  const [isAddingNote, setIsAddingNote] = useState(false)

  const [leadEditData, setLeadEditData] = useState({
    name: '',
    phone: '',
    email: '',
    source: ''
  })

  const [newNoteContent, setNewNoteContent] = useState('')
  const [newNoteDateTime, setNewNoteDateTime] = useState('')

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

  const phoneDigits = formData.phone.replace(/\D/g, '')
  const isPhoneLengthValid = phoneDigits.length === 10 || phoneDigits.length === 11
  const showPhoneError = phoneTouched && phoneDigits.length > 0 && !isPhoneLengthValid

  const sourceSelection =
    !formData.source || sourceOptions.includes(formData.source as (typeof sourceOptions)[number])
      ? formData.source
      : 'OTHER'

  const leadEditSourceSelection =
    !leadEditData.source ||
    sourceOptions.includes(leadEditData.source as (typeof sourceOptions)[number])
      ? leadEditData.source
      : 'OTHER'

  function formatLeadDate(date: string) {
    return new Date(date).toLocaleDateString('pt-BR')
  }

  function formatDateTime(value: string) {
    return new Date(value).toLocaleString('pt-BR')
  }

  async function handleOpenLead(leadId: string) {
    if (selectedLeadId === leadId) {
      setSelectedLeadId(null)
      setSelectedLeadDetails(null)
      setLeadDetailsErrorMessage('')
      return
    }

    setSelectedLeadId(leadId)
    setIsLoadingLeadDetails(true)
    setLeadDetailsErrorMessage('')

    try {
      const details = await getLeadDetails(leadId)
      setSelectedLeadDetails(details)
      setLeadEditData({
        name: details.name,
        phone: details.phone,
        email: details.email || '',
        source: details.source || ''
      })
    } catch {
      setLeadDetailsErrorMessage('Não foi possível carregar os detalhes do lead.')
      setSelectedLeadDetails(null)
    } finally {
      setIsLoadingLeadDetails(false)
    }
  }

  async function handleSaveLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!selectedLeadDetails) {
      return
    }

    const digits = leadEditData.phone.replace(/\D/g, '')
    const phoneIsValid = digits.length === 10 || digits.length === 11

    if (!phoneIsValid) {
      setLeadDetailsErrorMessage('Telefone inválido. Use 10 ou 11 dígitos com DDD.')
      return
    }

    setIsSavingLead(true)
    setLeadDetailsErrorMessage('')

    try {
      await onUpdateLead(selectedLeadDetails.id, {
        name: leadEditData.name,
        phone: digits,
        email: leadEditData.email || undefined,
        source: leadEditData.source || undefined
      })

      const refreshed = await getLeadDetails(selectedLeadDetails.id)
      setSelectedLeadDetails(refreshed)
      setLeadEditData({
        name: refreshed.name,
        phone: refreshed.phone,
        email: refreshed.email || '',
        source: refreshed.source || ''
      })
    } catch {
      setLeadDetailsErrorMessage('Não foi possível salvar as alterações do lead.')
    } finally {
      setIsSavingLead(false)
    }
  }

  async function handleAddNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!selectedLeadDetails || !newNoteContent.trim()) {
      return
    }

    setIsAddingNote(true)
    setLeadDetailsErrorMessage('')

    try {
      await addLeadNote(selectedLeadDetails.id, {
        content: newNoteContent.trim(),
        createdAt: newNoteDateTime ? new Date(newNoteDateTime).toISOString() : undefined
      })

      const refreshed = await getLeadDetails(selectedLeadDetails.id)
      setSelectedLeadDetails(refreshed)
      setNewNoteContent('')
      setNewNoteDateTime('')
    } catch {
      setLeadDetailsErrorMessage('Não foi possível salvar a observação.')
    } finally {
      setIsAddingNote(false)
    }
  }

  return (
    <section className="leads-page">
      <div className="leads-top-grid">
        <article className="leads-panel">
          <header className="leads-panel-header">
            <h2>Novo lead</h2>
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

            <label className="leads-half">
              Telefone
              <input
                type="text"
                value={formatPhoneForDisplay(formData.phone)}
                onChange={(event) => {
                  const digitsOnly = event.target.value.replace(/\D/g, '').slice(0, 11)
                  onLeadFieldChange('phone', digitsOnly)
                }}
                onBlur={() => setPhoneTouched(true)}
                inputMode="numeric"
                className={showPhoneError ? 'input-invalid' : ''}
                placeholder="(11) 99999-9999"
                required
              />
            </label>

            {showPhoneError ? (
              <p className="field-help field-help-error">Informe um telefone com DDD (10 ou 11 dígitos).</p>
            ) : (
              <p className="field-help"></p>
            )}

            <label>
              Email (opcional)
              <input
                type="email"
                value={formData.email}
                onChange={(event) =>
                  onLeadFieldChange('email', event.target.value.replace(/\s+/g, '').toLowerCase())
                }
                placeholder="contato@empresa.com"
              />
            </label>

            <label>
              Origem (opcional)
              <select
                value={sourceSelection}
                onChange={(event) => {
                  const nextValue = event.target.value

                  if (!nextValue) {
                    onLeadFieldChange('source', '')
                    return
                  }

                  if (nextValue === 'OTHER') {
                    if (sourceOptions.includes(formData.source as (typeof sourceOptions)[number])) {
                      onLeadFieldChange('source', '')
                    }
                    return
                  }

                  onLeadFieldChange('source', nextValue)
                }}
              >
                <option value="">Selecione uma origem</option>
                {sourceOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
                <option value="OTHER">Outro (digitar)</option>
              </select>
            </label>

            {sourceSelection === 'OTHER' ? (
              <label>
                Outra origem
                <input
                  type="text"
                  value={sourceOptions.includes(formData.source as (typeof sourceOptions)[number]) ? '' : formData.source}
                  onChange={(event) => onLeadFieldChange('source', event.target.value)}
                  placeholder="Ex.: Indicação, Evento, Site..."
                />
              </label>
            ) : null}

            <label>
              Observação inicial (opcional)
              <textarea
                value={formData.observation}
                onChange={(event) => onLeadFieldChange('observation', event.target.value)}
                placeholder="Anote informações importantes sobre esse contato..."
                rows={3}
              />
            </label>

            <label>
              Data e hora da observação (opcional)
              <input
                type="datetime-local"
                value={formData.observationDateTime}
                onChange={(event) => onLeadFieldChange('observationDateTime', event.target.value)}
              />
            </label>

            {createErrorMessage ? <p className="form-error">{createErrorMessage}</p> : null}

            <button
              type="submit"
              className="leads-primary-action"
              disabled={isCreating || !isPhoneLengthValid}
            >
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
                <li key={lead.id} className={`lead-card-item ${selectedLeadId === lead.id ? 'expanded' : ''}`}>
                  <div className="lead-card-main">
                    <button
                      type="button"
                      className="lead-card-open"
                      onClick={() => handleOpenLead(lead.id)}
                    >
                      <div>
                        <h3>{lead.name}</h3>
                        <p>{formatPhoneForDisplay(lead.phone)}</p>
                      </div>
                      <small>{selectedLeadId === lead.id ? 'Fechar' : 'Abrir lead'}</small>
                    </button>

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

                  {selectedLeadId === lead.id ? (
                    <section className="lead-details-panel">
                      {isLoadingLeadDetails ? <p>Carregando detalhes do lead...</p> : null}

                      {!isLoadingLeadDetails && leadDetailsErrorMessage ? (
                        <p className="form-error">{leadDetailsErrorMessage}</p>
                      ) : null}

                      {!isLoadingLeadDetails && selectedLeadDetails ? (
                        <>
                          <form className="auth-form lead-edit-form" onSubmit={handleSaveLead}>
                            <h4>Editar lead</h4>

                            <label>
                              Nome
                              <input
                                type="text"
                                value={leadEditData.name}
                                onChange={(event) =>
                                  setLeadEditData((current) => ({
                                    ...current,
                                    name: event.target.value
                                  }))
                                }
                                minLength={3}
                                required
                              />
                            </label>

                            <label>
                              Telefone
                              <input
                                type="text"
                                value={formatPhoneForDisplay(leadEditData.phone)}
                                onChange={(event) =>
                                  setLeadEditData((current) => ({
                                    ...current,
                                    phone: event.target.value.replace(/\D/g, '').slice(0, 11)
                                  }))
                                }
                                required
                              />
                            </label>

                            <label>
                              Email (opcional)
                              <input
                                type="email"
                                value={leadEditData.email}
                                onChange={(event) =>
                                  setLeadEditData((current) => ({
                                    ...current,
                                    email: event.target.value.replace(/\s+/g, '').toLowerCase()
                                  }))
                                }
                              />
                            </label>

                            <label>
                              Origem (opcional)
                              <select
                                value={leadEditSourceSelection}
                                onChange={(event) => {
                                  const nextValue = event.target.value

                                  if (!nextValue) {
                                    setLeadEditData((current) => ({ ...current, source: '' }))
                                    return
                                  }

                                  if (nextValue === 'OTHER') {
                                    if (
                                      sourceOptions.includes(
                                        leadEditData.source as (typeof sourceOptions)[number]
                                      )
                                    ) {
                                      setLeadEditData((current) => ({ ...current, source: '' }))
                                    }
                                    return
                                  }

                                  setLeadEditData((current) => ({ ...current, source: nextValue }))
                                }}
                              >
                                <option value="">Selecione uma origem</option>
                                {sourceOptions.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                                <option value="OTHER">Outro (digitar)</option>
                              </select>
                            </label>

                            {leadEditSourceSelection === 'OTHER' ? (
                              <label>
                                Outra origem
                                <input
                                  type="text"
                                  value={
                                    sourceOptions.includes(
                                      leadEditData.source as (typeof sourceOptions)[number]
                                    )
                                      ? ''
                                      : leadEditData.source
                                  }
                                  onChange={(event) =>
                                    setLeadEditData((current) => ({
                                      ...current,
                                      source: event.target.value
                                    }))
                                  }
                                  placeholder="Ex.: Indicação, Evento, Site..."
                                />
                              </label>
                            ) : null}

                            <button type="submit" disabled={isSavingLead}>
                              {isSavingLead ? 'Salvando alterações...' : 'Salvar alterações'}
                            </button>
                          </form>

                          <section className="lead-notes-section">
                            <h4>Observações</h4>

                            <form className="auth-form lead-note-form" onSubmit={handleAddNote}>
                              <label>
                                Anotação
                                <textarea
                                  value={newNoteContent}
                                  onChange={(event) => setNewNoteContent(event.target.value)}
                                  rows={3}
                                  placeholder="Ex.: Cliente prefere contato no fim da tarde..."
                                  required
                                />
                              </label>

                              <label>
                                Data e hora (opcional)
                                <input
                                  type="datetime-local"
                                  value={newNoteDateTime}
                                  onChange={(event) => setNewNoteDateTime(event.target.value)}
                                />
                              </label>

                              <button type="submit" disabled={isAddingNote}>
                                {isAddingNote ? 'Salvando observação...' : 'Adicionar observação'}
                              </button>
                            </form>

                            {selectedLeadDetails.notes.length > 0 ? (
                              <ul className="lead-notes-list">
                                {selectedLeadDetails.notes.map((note) => (
                                  <li key={note.id}>
                                    <p>{note.content}</p>
                                    <small>{formatDateTime(note.createdAt)}</small>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="leads-empty-state">Sem observações para este lead ainda.</p>
                            )}
                          </section>
                        </>
                      ) : null}
                    </section>
                  ) : null}
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

function formatPhoneForDisplay(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11)

  if (digits.length <= 2) {
    return digits
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}
