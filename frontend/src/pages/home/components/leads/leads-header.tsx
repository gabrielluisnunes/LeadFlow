interface LeadsHeaderProps {
  onCreateClick: () => void
}

export function LeadsHeader({ onCreateClick }: LeadsHeaderProps) {
  return (
    <header className="leads-v2-header">
      <div>
        <h2>Leads</h2>
        <p>Gerencie seus contatos e oportunidades</p>
      </div>

      <button type="button" className="leads-v2-primary" onClick={onCreateClick}>
        Novo Lead
      </button>
    </header>
  )
}
