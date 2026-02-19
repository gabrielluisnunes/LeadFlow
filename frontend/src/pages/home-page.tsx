import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { env } from '../lib/env'
import { signOut } from '../modules/auth/session'
import { listLeads, type Lead } from '../modules/leads/api'
import { ApiError } from '../types/api'

export function HomePage() {
  const navigate = useNavigate()
  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  async function loadLeads() {
    setErrorMessage('')
    setIsLoading(true)

    try {
      const items = await listLeads()
      setLeads(items)
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        signOut()
        navigate('/login', { replace: true })
        return
      }

      if (error instanceof ApiError) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage('Não foi possível carregar os leads')
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadLeads()
  }, [])

  function handleSignOut() {
    signOut()
    navigate('/login', { replace: true })
  }

  return (
    <main className="app-shell">
      <h1>LeadFlow</h1>

      <p>Login realizado com sucesso.</p>

      <ul>
        <li>Backend URL: {env.apiBaseUrl}</li>
        <li>Contrato: respostas em {`{ data: ... }`} e erros em {`{ error: ... }`}</li>
      </ul>

      <section className="list-section">
        <h2>Leads</h2>

        {isLoading ? <p>Carregando leads...</p> : null}

        {!isLoading && errorMessage ? <p className="form-error">{errorMessage}</p> : null}

        {!isLoading && !errorMessage ? (
          leads.length > 0 ? (
            <ul className="lead-list">
              {leads.map((lead) => (
                <li key={lead.id}>
                  <strong>{lead.name}</strong> — {lead.status} — {lead.phone}
                </li>
              ))}
            </ul>
          ) : (
            <p>Nenhum lead cadastrado.</p>
          )
        ) : null}

        <button type="button" onClick={loadLeads} disabled={isLoading}>
          Atualizar leads
        </button>
      </section>

      <button type="button" onClick={handleSignOut}>
        Sair
      </button>
    </main>
  )
}
