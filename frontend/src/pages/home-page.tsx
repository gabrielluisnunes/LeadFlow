import { useNavigate } from 'react-router-dom'
import { env } from '../lib/env'
import { signOut } from '../modules/auth/session'

export function HomePage() {
  const navigate = useNavigate()

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
        <li>Próximo passo: telas funcionais de Leads e Follow-ups (sem design final).</li>
      </ul>

      <button type="button" onClick={handleSignOut}>
        Sair
      </button>
    </main>
  )
}
