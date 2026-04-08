export default function Badge({ children, variant = 'default' }) {
  const styles = {
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: 'var(--radius-badge)',
    fontSize: '0.75rem',
    fontWeight: 600,
    ...(variant === 'green' && {
      background: 'var(--green-light)',
      color: 'var(--green-dark)',
    }),
    ...(variant === 'gold' && {
      background: 'var(--gold-pale)',
      color: 'var(--gold-dark)',
    }),
    ...(variant === 'default' && {
      background: 'var(--border-light)',
      color: 'var(--text-secondary)',
    }),
  }

  return <span style={styles}>{children}</span>
}
