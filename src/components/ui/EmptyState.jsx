export default function EmptyState({ message = 'No se encontraron resultados.' }) {
  return (
    <div style={{
      textAlign: 'center',
      padding: 'var(--space-2xl) var(--space-md)',
      color: 'var(--text-muted)',
    }}>
      <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>🍺</div>
      <p>{message}</p>
    </div>
  )
}
