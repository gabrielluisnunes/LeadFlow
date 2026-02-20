import type { LeadStatus } from '../../../../modules/leads/api'

interface LeadsFiltersProps {
  searchValue: string
  statusFilter: LeadStatus | 'ALL'
  onSearchChange: (value: string) => void
  onStatusChange: (value: LeadStatus | 'ALL') => void
  onClear: () => void
}

const leadStatusOptions: LeadStatus[] = ['NEW', 'CONTACTED', 'WON', 'LOST']

const labelMap: Record<LeadStatus, string> = {
  NEW: 'Novo',
  CONTACTED: 'Em contato',
  WON: 'Convertido',
  LOST: 'Perdido'
}

export function LeadsFilters({
  searchValue,
  statusFilter,
  onSearchChange,
  onStatusChange,
  onClear
}: LeadsFiltersProps) {
  return (
    <div className="leads-v2-filters">
      <label className="leads-v2-field">
        Buscar
        <input
          type="search"
          placeholder="Nome ou telefone"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </label>

      <label className="leads-v2-field">
        Status
        <select
          value={statusFilter}
          onChange={(event) => onStatusChange(event.target.value as LeadStatus | 'ALL')}
        >
          <option value="ALL">Todos</option>
          {leadStatusOptions.map((option) => (
            <option key={option} value={option}>
              {labelMap[option]}
            </option>
          ))}
        </select>
      </label>

      <button
        type="button"
        className="leads-v2-clear"
        onClick={onClear}
        disabled={!searchValue && statusFilter === 'ALL'}
      >
        Limpar filtros
      </button>
    </div>
  )
}
