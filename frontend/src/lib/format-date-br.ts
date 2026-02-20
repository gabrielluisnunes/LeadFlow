export function formatDateBR(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date)
}

export function maskDateBRInput(rawValue: string) {
  const digits = rawValue.replace(/\D/g, '').slice(0, 8)

  if (digits.length <= 2) {
    return digits
  }

  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`
  }

  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

export function parseDateBRToIso(value: string) {
  const normalized = value.trim()

  if (!normalized) {
    return undefined
  }

  const match = normalized.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)

  if (!match) {
    return undefined
  }

  const [, day, month, year] = match
  const parsed = new Date(`${year}-${month}-${day}T12:00:00`)

  if (Number.isNaN(parsed.getTime())) {
    return undefined
  }

  return parsed.toISOString()
}

export function maskDateTimeBRInput(rawValue: string) {
  const digits = rawValue.replace(/\D/g, '').slice(0, 12)

  if (digits.length <= 2) {
    return digits
  }

  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`
  }

  if (digits.length <= 8) {
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
  }

  if (digits.length <= 10) {
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)} ${digits.slice(8)}`
  }

  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)} ${digits.slice(8, 10)}:${digits.slice(10)}`
}

export function parseDateTimeBRToIso(value: string) {
  const normalized = value.trim()

  if (!normalized) {
    return undefined
  }

  const match = normalized.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s(\d{2}):(\d{2}))?$/)

  if (!match) {
    return undefined
  }

  const [, day, month, year, hour = '12', minute = '00'] = match
  const parsed = new Date(`${year}-${month}-${day}T${hour}:${minute}:00`)

  if (Number.isNaN(parsed.getTime())) {
    return undefined
  }

  return parsed.toISOString()
}
