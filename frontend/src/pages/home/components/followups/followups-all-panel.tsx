import { useEffect, useMemo, useState } from 'react'
import type { FollowUpWithLead } from '../../../../modules/followups/api'
import type { FollowUpAction } from './types'

type FollowUpStatusFilter = 'ALL' | 'PENDING' | 'DONE' | 'CANCELED'
type FollowUpSortOption = 'SCHEDULED_DESC' | 'SCHEDULED_ASC' | 'PRIORITY_DESC' | 'PRIORITY_ASC'

const PAGE_SIZE = 8

interface FollowUpsAllPanelProps {
  followUps: FollowUpWithLead[]
  isLoadingFollowUps: boolean
  followUpErrorMessage: string
  activeFollowUpAction: { followUpId: string; action: FollowUpAction } | null
  onMarkFollowUpAsDone: (followUpId: string) => void
  onRescheduleFollowUp: (followUpId: string, currentScheduledAt: string) => void
  onCancelFollowUp: (followUpId: string) => void
  onRefreshAgenda: () => void
  formatDateTime: (value: string) => string
}

export function FollowUpsAllPanel({
  followUps,
  isLoadingFollowUps,
  followUpErrorMessage,
  activeFollowUpAction,
  onMarkFollowUpAsDone,
  onRescheduleFollowUp,
  onCancelFollowUp,
  onRefreshAgenda,
  formatDateTime
}: FollowUpsAllPanelProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<FollowUpStatusFilter>('ALL')
  const [sortBy, setSortBy] = useState<FollowUpSortOption>('SCHEDULED_DESC')
  const [currentPage, setCurrentPage] = useState(1)

  function getPriorityLabel(priority: string) {
    if (priority === 'HIGH') {
      return 'Alta'
    }

    if (priority === 'LOW') {
      return 'Baixa'
    }

    return 'Média'
  }

  function getStatusLabel(status: string) {
    if (status === 'DONE') {
      return 'Concluído'
    }

    if (status === 'CANCELED') {
      return 'Cancelado'
    }

    return 'Pendente'
  }

  const statusCounts = useMemo(() => {
    return followUps.reduce(
      (accumulator, item) => {
        accumulator.ALL += 1
        accumulator[item.status] += 1

        return accumulator
      },
      {
        ALL: 0,
        PENDING: 0,
        DONE: 0,
        CANCELED: 0
      }
    )
  }, [followUps])

  const filteredFollowUps = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase()

    return followUps.filter((item) => {
      const statusMatches = statusFilter === 'ALL' || item.status === statusFilter

      const textMatches =
        normalizedTerm.length === 0 ||
        item.title.toLowerCase().includes(normalizedTerm) ||
        item.lead.name.toLowerCase().includes(normalizedTerm) ||
        (item.notes ?? '').toLowerCase().includes(normalizedTerm)

      return statusMatches && textMatches
    })
  }, [followUps, searchTerm, statusFilter])

  const orderedFollowUps = useMemo(() => {
    const priorityWeight: Record<FollowUpWithLead['priority'], number> = {
      HIGH: 3,
      MEDIUM: 2,
      LOW: 1
    }

    const items = [...filteredFollowUps]

    items.sort((a, b) => {
      if (sortBy === 'SCHEDULED_ASC') {
        return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
      }

      if (sortBy === 'PRIORITY_DESC') {
        const byPriority = priorityWeight[b.priority] - priorityWeight[a.priority]

        if (byPriority !== 0) {
          return byPriority
        }

        return new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
      }

      if (sortBy === 'PRIORITY_ASC') {
        const byPriority = priorityWeight[a.priority] - priorityWeight[b.priority]

        if (byPriority !== 0) {
          return byPriority
        }

        return new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
      }

      return new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
    })

    return items
  }, [filteredFollowUps, sortBy])

  const totalPages = Math.max(1, Math.ceil(orderedFollowUps.length / PAGE_SIZE))

  const hasActiveFilters =
    searchTerm.trim().length > 0 || statusFilter !== 'ALL' || sortBy !== 'SCHEDULED_DESC'

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, sortBy, followUps.length])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const paginatedFollowUps = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    const end = start + PAGE_SIZE

    return orderedFollowUps.slice(start, end)
  }, [orderedFollowUps, currentPage])

  const statusFilters: Array<{ key: FollowUpStatusFilter; label: string }> = [
    { key: 'ALL', label: 'Todos' },
    { key: 'PENDING', label: 'Pendentes' },
    { key: 'DONE', label: 'Concluídos' },
    { key: 'CANCELED', label: 'Cancelados' }
  ]

  function handleClearFilters() {
    setSearchTerm('')
    setStatusFilter('ALL')
    setSortBy('SCHEDULED_DESC')
    setCurrentPage(1)
  }

  return (
    <section className="followups-panel followups-all-panel">
      <header className="followups-panel-header followups-panel-header-inline">
        <div>
          <h2>Todos os follow-ups</h2>
          <p>Visualize e edite follow-ups concluídos, cancelados e pendentes em um só lugar.</p>
        </div>

        <button
          type="button"
          className="followups-refresh"
          onClick={onRefreshAgenda}
          disabled={isLoadingFollowUps}
        >
          Atualizar lista
        </button>
      </header>

      {isLoadingFollowUps ? <p>Carregando follow-ups...</p> : null}
      {!isLoadingFollowUps && followUpErrorMessage ? (
        <p className="form-error">{followUpErrorMessage}</p>
      ) : null}

      {!isLoadingFollowUps && !followUpErrorMessage ? (
        followUps.length > 0 ? (
          <>
            <div className="followups-all-controls">
              <div className="followups-all-toolbar">
                <label className="followups-all-search">
                  <span>Buscar follow-up</span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Título, lead ou observação"
                  />
                </label>

                <label className="followups-all-sort">
                  <span>Ordenar por</span>
                  <select value={sortBy} onChange={(event) => setSortBy(event.target.value as FollowUpSortOption)}>
                    <option value="SCHEDULED_DESC">Agendamento mais recente</option>
                    <option value="SCHEDULED_ASC">Agendamento mais antigo</option>
                    <option value="PRIORITY_DESC">Prioridade alta primeiro</option>
                    <option value="PRIORITY_ASC">Prioridade baixa primeiro</option>
                  </select>
                </label>

                <button
                  type="button"
                  className="followups-all-clear"
                  onClick={handleClearFilters}
                  disabled={!hasActiveFilters}
                >
                  Limpar filtros
                </button>
              </div>

              <div className="followups-all-filters" aria-label="Filtros por status">
                {statusFilters.map((filter) => (
                  <button
                    key={filter.key}
                    type="button"
                    className={`followups-all-filter ${statusFilter === filter.key ? 'active' : ''}`}
                    onClick={() => setStatusFilter(filter.key)}
                  >
                    {filter.label} ({statusCounts[filter.key]})
                  </button>
                ))}
              </div>
            </div>

            <div className="followups-all-summary">
              <small>
                Mostrando {paginatedFollowUps.length} de {orderedFollowUps.length} follow-ups filtrados
              </small>
            </div>

            {orderedFollowUps.length === 0 ? (
              <p className="followups-empty">Nenhum follow-up encontrado para os filtros aplicados.</p>
            ) : (
              <ul className="followups-all-list">
                {paginatedFollowUps.map((followUp) => {
                  const isPending = followUp.status === 'PENDING'

                  return (
                    <li key={followUp.id} className="followups-all-item">
                      <div className="followups-all-item-head">
                        <strong>{followUp.title}</strong>
                        <span className={`followups-status followups-status-${followUp.status.toLowerCase()}`}>
                          {getStatusLabel(followUp.status)}
                        </span>
                      </div>

                      <small>
                        Lead: {followUp.lead.name} · Agendado: {formatDateTime(followUp.scheduledAt)}
                      </small>

                      <div className="followups-item-badges">
                        <span className={`followups-priority followups-priority-${followUp.priority.toLowerCase()}`}>
                          Prioridade {getPriorityLabel(followUp.priority)}
                        </span>
                      </div>

                      {followUp.notes ? <p className="followups-notes">{followUp.notes}</p> : null}

                      {followUp.status === 'DONE' && followUp.doneAt ? (
                        <small className="followups-all-meta">Concluído em: {formatDateTime(followUp.doneAt)}</small>
                      ) : null}

                      {followUp.status === 'CANCELED' && followUp.canceledAt ? (
                        <small className="followups-all-meta">Cancelado em: {formatDateTime(followUp.canceledAt)}</small>
                      ) : null}

                      {isPending ? (
                        <div className="followups-all-item-actions">
                          <button
                            type="button"
                            className="followups-item-action followups-item-action-success"
                            onClick={() => onMarkFollowUpAsDone(followUp.id)}
                            disabled={
                              activeFollowUpAction?.followUpId === followUp.id &&
                              activeFollowUpAction?.action === 'done'
                            }
                          >
                            {activeFollowUpAction?.followUpId === followUp.id &&
                            activeFollowUpAction?.action === 'done'
                              ? 'Concluindo...'
                              : 'Concluir'}
                          </button>

                          <button
                            type="button"
                            className="followups-item-action"
                            onClick={() => onRescheduleFollowUp(followUp.id, followUp.scheduledAt)}
                            disabled={
                              activeFollowUpAction?.followUpId === followUp.id &&
                              activeFollowUpAction?.action === 'reschedule'
                            }
                          >
                            {activeFollowUpAction?.followUpId === followUp.id &&
                            activeFollowUpAction?.action === 'reschedule'
                              ? 'Reagendando...'
                              : 'Reagendar +1d'}
                          </button>

                          <button
                            type="button"
                            className="followups-item-action followups-item-action-danger"
                            onClick={() => onCancelFollowUp(followUp.id)}
                            disabled={
                              activeFollowUpAction?.followUpId === followUp.id &&
                              activeFollowUpAction?.action === 'cancel'
                            }
                          >
                            {activeFollowUpAction?.followUpId === followUp.id &&
                            activeFollowUpAction?.action === 'cancel'
                              ? 'Cancelando...'
                              : 'Cancelar'}
                          </button>
                        </div>
                      ) : null}
                    </li>
                  )
                })}
              </ul>
            )}

            {orderedFollowUps.length > PAGE_SIZE ? (
              <div className="followups-pagination">
                <button
                  type="button"
                  className="followups-pagination-button"
                  onClick={() => setCurrentPage((current) => Math.max(1, current - 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </button>

                <span>
                  Página {currentPage} de {totalPages}
                </span>

                <button
                  type="button"
                  className="followups-pagination-button"
                  onClick={() => setCurrentPage((current) => Math.min(totalPages, current + 1))}
                  disabled={currentPage === totalPages}
                >
                  Próxima
                </button>
              </div>
            ) : null}
          </>
        ) : (
          <p className="followups-empty">Nenhum follow-up cadastrado.</p>
        )
      ) : null}
    </section>
  )
}
