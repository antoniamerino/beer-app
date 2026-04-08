export default function SingleSelect({ id, value, onChange, options, placeholder = 'Seleccionar…' }) {
  return (
    <select
      id={id}
      className="single-select"
      value={value}
      onChange={e => onChange(e.target.value)}
    >
      <option value="">{placeholder}</option>
      {options.map(opt => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  )
}
