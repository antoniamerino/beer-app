import { ORIGIN_OPTIONS, SORT_OPTIONS, MIN_SCORE_OPTIONS } from '../../constants/tastingOptions'
import '../../styles/beerFilters.css'

export default function BeerFilters({ filters, onChange, totalCount }) {
  function set(field, value) {
    onChange({ ...filters, [field]: value })
  }

  const hasFilters = filters.style || filters.origin || filters.minScore

  return (
    <div className="beer-filters">
      <span className="beer-filters__label">Filtrar:</span>

      <input
        type="text"
        className="filter-select"
        placeholder="Estilo…"
        value={filters.style}
        onChange={e => set('style', e.target.value)}
        style={{ paddingRight: 'var(--space-md)', backgroundImage: 'none' }}
      />

      <select
        className="filter-select"
        value={filters.origin}
        onChange={e => set('origin', e.target.value)}
      >
        <option value="">Origen</option>
        {ORIGIN_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
      </select>

      <select
        className="filter-select"
        value={filters.minScore}
        onChange={e => set('minScore', e.target.value)}
      >
        {MIN_SCORE_OPTIONS.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {hasFilters && (
        <button
          className="beer-filters__reset"
          onClick={() => onChange({ style: '', origin: '', minScore: '', sortBy: filters.sortBy })}
        >
          Limpiar filtros
        </button>
      )}

      <div className="beer-filters__divider" />

      <span className="beer-filters__count">{totalCount} cerveza{totalCount !== 1 ? 's' : ''}</span>

      <select
        className="filter-select filter-select--sort"
        value={filters.sortBy}
        onChange={e => set('sortBy', e.target.value)}
      >
        {SORT_OPTIONS.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}
