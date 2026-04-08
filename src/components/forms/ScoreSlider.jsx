export default function ScoreSlider({ value, onChange }) {
  return (
    <div className="slider-wrapper">
      <div className="slider-header">
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>1</span>
        <span className="slider-value">{value}</span>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>10</span>
      </div>
      <input
        type="range"
        className="slider-input"
        min="1"
        max="10"
        step="0.5"
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
      />
    </div>
  )
}
