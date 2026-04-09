export default function MultiSelect({ options, selected, onChange }) {
  function toggle(e, option) {
    e.preventDefault()
    if (selected.includes(option)) {
      onChange(selected.filter(o => o !== option))
    } else {
      onChange([...selected, option])
    }
  }

  return (
    <div className="multi-select">
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          className={`multi-select__chip ${selected.includes(opt) ? 'multi-select__chip--selected' : ''}`}
          onPointerDown={e => toggle(e, opt)}
          style={{ touchAction: 'manipulation', userSelect: 'none' }}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}
