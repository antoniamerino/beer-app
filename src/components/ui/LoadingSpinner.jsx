export default function LoadingSpinner() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 'var(--space-2xl)',
      flex: 1,
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid var(--green-light)',
        borderTopColor: 'var(--green-primary)',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
