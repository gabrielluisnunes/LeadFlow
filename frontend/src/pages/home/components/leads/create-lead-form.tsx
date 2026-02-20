import type { FormEvent } from 'react'

const sourceOptions = ['Instagram', 'Facebook', 'WhatsApp', 'Email'] as const

interface LeadFormData {
  name: string
  phone: string
  email: string
  source: string
  observation: string
  observationDateTime: string
}

interface CreateLeadFormProps {
  formData: LeadFormData
  isCreating: boolean
  createErrorMessage: string
  sourceSelection: string
  showPhoneError: boolean
  isPhoneLengthValid: boolean
  onCreateLead: (event: FormEvent<HTMLFormElement>) => void
  onLeadFieldChange: (field: keyof LeadFormData, value: string) => void
  onPhoneBlur: () => void
  formatPhoneForDisplay: (value: string) => string
}

export function CreateLeadForm({
  formData,
  isCreating,
  createErrorMessage,
  sourceSelection,
  showPhoneError,
  isPhoneLengthValid,
  onCreateLead,
  onLeadFieldChange,
  onPhoneBlur,
  formatPhoneForDisplay
}: CreateLeadFormProps) {
  return (
    <article className="leads-v2-card" id="create-lead-card">
      <header className="leads-v2-card-header">
        <h3>Novo lead</h3>
        <p>Cadastre contato, origem e uma observação inicial.</p>
      </header>

      <form className="auth-form leads-v2-form" onSubmit={onCreateLead}>
        <label className="leads-v2-field half">
          Nome
          <input
            type="text"
            value={formData.name}
            onChange={(event) => onLeadFieldChange('name', event.target.value)}
            minLength={3}
            required
          />
        </label>

        <label className="leads-v2-field half">
          Telefone
          <input
            type="text"
            value={formatPhoneForDisplay(formData.phone)}
            onChange={(event) => {
              const digitsOnly = event.target.value.replace(/\D/g, '').slice(0, 11)
              onLeadFieldChange('phone', digitsOnly)
            }}
            onBlur={onPhoneBlur}
            inputMode="numeric"
            className={showPhoneError ? 'input-invalid' : ''}
            placeholder="(11) 99999-9999"
            required
          />
        </label>

        {showPhoneError ? (
          <p className="field-help field-help-error">Informe um telefone com DDD (10 ou 11 dígitos).</p>
        ) : (
          <p className="field-help">Digite só números. Ex.: (45) 98814-0524.</p>
        )}

        <label className="leads-v2-field half">
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

        <label className="leads-v2-field half">
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
          <label className="leads-v2-field">
            Outra origem
            <input
              type="text"
              value={sourceOptions.includes(formData.source as (typeof sourceOptions)[number]) ? '' : formData.source}
              onChange={(event) => onLeadFieldChange('source', event.target.value)}
              placeholder="Ex.: Indicação, Evento, Site..."
            />
          </label>
        ) : null}

        <label className="leads-v2-field">
          Observação inicial (opcional)
          <textarea
            value={formData.observation}
            onChange={(event) => onLeadFieldChange('observation', event.target.value)}
            placeholder="Anote informações importantes sobre esse contato..."
            rows={3}
          />
        </label>

        <label className="leads-v2-field">
          Data e hora da observação (opcional)
          <input
            type="datetime-local"
            value={formData.observationDateTime}
            onChange={(event) => onLeadFieldChange('observationDateTime', event.target.value)}
          />
        </label>

        {createErrorMessage ? <p className="form-error">{createErrorMessage}</p> : null}

        <button type="submit" className="leads-v2-primary" disabled={isCreating || !isPhoneLengthValid}>
          {isCreating ? 'Salvando lead...' : 'Criar lead'}
        </button>
      </form>
    </article>
  )
}
