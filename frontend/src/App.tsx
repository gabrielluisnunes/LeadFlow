import { env } from './lib/env'
import './App.css'

function App() {
  return (
    <main className="app-shell">
      <h1>LeadFlow Frontend</h1>

      <p>Base técnica criada com cliente API tipado e suporte a JWT.</p>

      <ul>
        <li>Backend URL: {env.apiBaseUrl}</li>
        <li>Contrato esperado: sucesso em {`{ data: ... }`} e erro em {`{ error: ... }`}</li>
      </ul>

      <p>Próximo passo: aplicar o design quando você enviar o Figma.</p>
    </main>
  )
}

export default App
