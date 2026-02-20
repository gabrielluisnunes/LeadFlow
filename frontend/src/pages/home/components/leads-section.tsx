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
import { formatDateBR, maskDateTimeBRInput, parseDateTimeBRToIso } from '../../../lib/format-date-br'
import { CreateLeadForm } from './leads/create-lead-form'
import { LeadCard } from './leads/lead-card'
import { LeadsFilters } from './leads/leads-filters'
import { LeadsHeader } from './leads/leads-header'
import { MetricsCards } from './leads/metrics-cards'

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
  const [searchValue, setSearchValue] = useState('')
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'ALL'>('ALL')

  const [leadEditData, setLeadEditData] = useState({
    name: '',
    phone: '',
    email: '',
    source: ''
  })

  const [newNoteContent, setNewNoteContent] = useState('')
  const [newNoteDateTime, setNewNoteDateTime] = useState('')

  const leadsByStatus = useMemo(
    () =>
      leads.reduce(
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
      ),
    [leads]
  )

  const filteredLeads = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase()

    return leads.filter((lead) => {
      const matchesStatus = statusFilter === 'ALL' || lead.status === statusFilter

      if (!normalizedSearch) {
        return matchesStatus
      }

      const matchesSearch =
        lead.name.toLowerCase().includes(normalizedSearch) ||
        lead.phone.includes(normalizedSearch) ||
        (lead.email || '').toLowerCase().includes(normalizedSearch)

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
    return formatDateBR(date)
  }

  function formatDateTime(value: string) {
    return formatDateBR(value)
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

    const payload: UpdateLeadInput = {
      name: leadEditData.name.trim(),
      phone: digits,
      email: leadEditData.email.trim() || undefined,
      source: leadEditData.source.trim() || undefined
    }

    console.log('[LeadFlow] handleSaveLead submit', {
      leadId: selectedLeadDetails.id,
      payload
    })

    try {
      await onUpdateLead(selectedLeadDetails.id, payload)

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
        createdAt: parseDateTimeBRToIso(newNoteDateTime)
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
    <section className="leads-v2-page">
      <LeadsHeader
        onCreateClick={() => {
          document.getElementById('create-lead-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }}
      />

      <MetricsCards total={leads.length} byStatus={leadsByStatus} />

      <div className="leads-v2-grid">
        <CreateLeadForm
          formData={formData}
          isCreating={isCreating}
          createErrorMessage={createErrorMessage}
          sourceSelection={sourceSelection}
          showPhoneError={showPhoneError}
          isPhoneLengthValid={isPhoneLengthValid}
          onCreateLead={onCreateLead}
          onLeadFieldChange={onLeadFieldChange}
          onPhoneBlur={() => setPhoneTouched(true)}
          formatPhoneForDisplay={formatPhoneForDisplay}
        />

        <article className="leads-v2-card leads-v2-list-card">
          <header className="leads-v2-card-header">
            <div>
              <h3>Leads cadastrados</h3>
              <p>Acompanhe, filtre e atualize seus contatos.</p>
            </div>
            <button type="button" className="leads-v2-secondary" onClick={onRefreshLeads}>
              Atualizar
            </button>
          </header>

          <LeadsFilters
            searchValue={searchValue}
            statusFilter={statusFilter}
            onSearchChange={setSearchValue}
            onStatusChange={setStatusFilter}
            onClear={() => {
              setSearchValue('')
              setStatusFilter('ALL')
            }}
          />

          {isLoading ? (
            <div className="leads-v2-skeletons">
              <div />
              <div />
              <div />
            </div>
          ) : null}

          {!isLoading && errorMessage ? <p className="form-error">{errorMessage}</p> : null}
          {!isLoading && !errorMessage && statusErrorMessage ? (
            <p className="form-error">{statusErrorMessage}</p>
          ) : null}

          {!isLoading && !errorMessage ? (
            filteredLeads.length > 0 ? (
              <ul className="lead-v2-list">
                {filteredLeads.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    isExpanded={selectedLeadId === lead.id}
                    isUpdatingStatusId={isUpdatingStatusId}
                    onToggle={handleOpenLead}
                    onUpdateStatus={onUpdateStatus}
                    formatLeadDate={formatLeadDate}
                    formatPhoneForDisplay={formatPhoneForDisplay}
                  >
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
                                setLeadEditData((current) => ({ ...current, name: event.target.value }))
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
                                  setLeadEditData((current) => ({ ...current, source: event.target.value }))
                                }
                                placeholder=""
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
                                placeholder=""
                                required
                              />
                            </label>

                            <label>
                              Data e hora (opcional)
                              <input
                                type="text"
                                value={newNoteDateTime}
                                onChange={(event) =>
                                  setNewNoteDateTime(maskDateTimeBRInput(event.target.value))
                                }
                                inputMode="numeric"
                                maxLength={16}
                                placeholder="dd/mm/aaaa hh:mm"
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
                            <p className="leads-v2-empty">Sem observações para este lead ainda.</p>
                          )}
                        </section>
                      </>
                    ) : null}
                  </LeadCard>
                ))}
              </ul>
            ) : (
              <div className="leads-v2-empty-state">
                <h4>Nenhum lead encontrado</h4>
                <p>
                  {leads.length === 0
                    ? 'Comece cadastrando seu primeiro lead para preencher o funil.'
                    : 'Tente ajustar os filtros para visualizar outros contatos.'}
                </p>
              </div>
            )
          ) : null}
        </article>
      </div>
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
