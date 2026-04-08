export default function BitternessSlider({ value, onChange }) {
  return (
    <div className="slider-wrapper">
      <div className="slider-header">
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Suave</span>
        <span className="slider-value" style={{ color: 'var(--green-primary)' }}>{value}/5</span>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Intenso</span>
      </div>
      <input
        type="range"
        className="slider-input"
        min="1"
        max="5"
        step="1"
        value={value}
        onChange={e => onChange(parseInt(e.target.value))}
      />
      <div className="bitterness-dots">
        {[1, 2, 3, 4, 5].map(n => (
          <div
            key={n}
            className={`bitterness-dot ${n <= value ? 'bitterness-dot--filled' : ''}`}
          />
        ))}
      </div>
    </div>
  )
}
