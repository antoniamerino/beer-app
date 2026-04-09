import { useState } from 'react'
import {
  ORIGIN_OPTIONS, COLOR_OPTIONS, TURBIDITY_OPTIONS,
  FOAM_AMOUNT_OPTIONS, AROMA_INTENSITY_OPTIONS, BODY_OPTIONS,
  CARBONATION_OPTIONS, ALCOHOL_PRESENCE_OPTIONS,
  SORT_OPTIONS, MIN_SCORE_OPTIONS,
} from '../../constants/tastingOptions'
import '../../styles/filterSidebar.css'

const BITTERNESS_OPTIONS = [1, 2, 3, 4, 5]

/**
 * FilterGroup with chip-style multi-select.
 * selected = [] means "no filter active" (show all).
 * Clicking a chip adds it to the selection (= filter by it).
 * Clicking an active chip removes it.
 * If all options end up selected, reset to [] (no filter).
 */
function FilterGroup({ title, options, selected, onChange, searchable }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const isFiltered = selected.length > 0

  const visibleOptions = searchable && query.trim()
    ? options.filter(opt => {
        const label = typeof opt === 'object' ? opt.label : opt
        return label.toLowerCase().includes(query.toLowerCase())
      })
    : options

  function toggle(value) {
    if (selected.includes(value)) {
      const next = selected.filter(v => v !== value)
      onChange(next)
    } else {
      const next = [...selected, value]
      onChange(next.length === options.length ? [] : next)
    }
  }

  return (
    <div className="filter-group">
      <button type="button" className="filter-group__toggle" onClick={() => setOpen(o => !o)}>
        <span className="filter-group__title">
          {title}
          {isFiltered && <span className="filter-group__badge">{selected.length}</span>}
        </span>
        <span className={`filter-group__arrow ${open ? 'filter-group__arrow--open' : ''}`}>▼</span>
      </button>

      {open && (
        <div className="filter-group__body">
          {searchable && (
            <input
              className="filter-group__search"
              type="text"
              placeholder="Buscar tipo…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onClick={e => e.stopPropagation()}
            />
          )}
          {isFiltered && (
            <button type="button" className="filter-group__clear" onClick={() => onChange([])}>
              Limpiar
            </button>
          )}
          <div className="filter-group__chips">
            {visibleOptions.map(opt => {
              const value = typeof opt === 'object' ? opt.value : opt
              const label = typeof opt === 'object' ? opt.label : opt
              const active = selected.includes(value)
              return (
                <button
                  key={value}
                  type="button"
                  className={`filter-chip ${active ? 'filter-chip--active' : ''}`}
                  onClick={() => toggle(value)}
                >
                  {label}
                </button>
              )
            })}
            {visibleOptions.length === 0 && (
              <span className="filter-group__no-results">Sin resultados</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function BitternessGroup({ selected, onChange }) {
  const [open, setOpen] = useState(false)
  const isFiltered = selected.length > 0

  function toggle(n) {
    if (selected.includes(n)) {
      const next = selected.filter(v => v !== n)
      onChange(next)
    } else {
      const next = [...selected, n]
      onChange(next.length === BITTERNESS_OPTIONS.length ? [] : next)
    }
  }

  return (
    <div className="filter-group">
      <button type="button" className="filter-group__toggle" onClick={() => setOpen(o => !o)}>
        <span className="filter-group__title">
          Amargor
          {isFiltered && <span className="filter-group__badge">{selected.length}</span>}
        </span>
        <span className={`filter-group__arrow ${open ? 'filter-group__arrow--open' : ''}`}>▼</span>
      </button>

      {open && (
        <div className="filter-group__body">
          {isFiltered && (
            <button type="button" className="filter-group__clear" onClick={() => onChange([])}>
              Limpiar
            </button>
          )}
          <div className="filter-group__chips">
            {BITTERNESS_OPTIONS.map(n => {
              const active = selected.includes(n)
              return (
                <button
                  key={n}
                  type="button"
                  className={`filter-chip ${active ? 'filter-chip--active' : ''}`}
                  onClick={() => toggle(n)}
                >
                  {n}
                  <span className="chip-dots">
                    {[1, 2, 3, 4, 5].map(d => (
                      <span
                        key={d}
                        className={`chip-dot ${d <= n ? 'chip-dot--filled' : ''}`}
                      />
                    ))}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default function FilterSidebar({ filters, onChange, availableStyles, isOpen }) {
  const totalActive = [
    filters.origins, filters.styles, filters.colors, filters.turbidities,
    filters.foamAmounts, filters.aromaIntensities, filters.bodies,
    filters.bitternesses, filters.carbonations, filters.alcoholPresences,
  ].filter(arr => arr.length > 0).length + (filters.minScore ? 1 : 0)

  function set(field, value) {
    onChange({ ...filters, [field]: value })
  }

  function resetAll() {
    onChange({
      origins: [], styles: [], colors: [], turbidities: [],
      foamAmounts: [], aromaIntensities: [], bodies: [],
      bitternesses: [], carbonations: [], alcoholPresences: [],
      minScore: '', sortBy: filters.sortBy,
    })
  }

  return (
    <div className={`filter-sidebar ${isOpen ? 'filter-sidebar--open' : ''}`}>
      <div className="filter-sidebar__header">
        <h3>Filtros</h3>
        {totalActive > 0 && (
          <button className="filter-sidebar__reset" onClick={resetAll}>
            Limpiar todo ({totalActive})
          </button>
        )}
      </div>

      <div className="filter-sidebar__top">
        <div className="filter-sidebar__sort">
          <span className="filter-sidebar__top-label">Ordenar por</span>
          <select
            className="filter-sidebar__select"
            value={filters.sortBy}
            onChange={e => set('sortBy', e.target.value)}
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <span className="filter-sidebar__top-label">Nota mínima</span>
          <select
            className="filter-sidebar__select"
            value={filters.minScore}
            onChange={e => set('minScore', e.target.value)}
          >
            {MIN_SCORE_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <FilterGroup
        title="Origen"
        options={ORIGIN_OPTIONS}
        selected={filters.origins}
        onChange={v => set('origins', v)}
      />

      {availableStyles.length > 0 && (
        <FilterGroup
          title="Tipo de cerveza"
          options={availableStyles}
          selected={filters.styles}
          onChange={v => set('styles', v)}
          searchable
        />
      )}

      <FilterGroup
        title="Color"
        options={COLOR_OPTIONS}
        selected={filters.colors}
        onChange={v => set('colors', v)}
      />

      <FilterGroup
        title="Turbidez"
        options={TURBIDITY_OPTIONS}
        selected={filters.turbidities}
        onChange={v => set('turbidities', v)}
      />

      <FilterGroup
        title="Espuma"
        options={FOAM_AMOUNT_OPTIONS}
        selected={filters.foamAmounts}
        onChange={v => set('foamAmounts', v)}
      />

      <FilterGroup
        title="Intensidad aroma"
        options={AROMA_INTENSITY_OPTIONS}
        selected={filters.aromaIntensities}
        onChange={v => set('aromaIntensities', v)}
      />

      <FilterGroup
        title="Cuerpo"
        options={BODY_OPTIONS}
        selected={filters.bodies}
        onChange={v => set('bodies', v)}
      />

      <BitternessGroup
        selected={filters.bitternesses}
        onChange={v => set('bitternesses', v)}
      />

      <FilterGroup
        title="Carbonación"
        options={CARBONATION_OPTIONS}
        selected={filters.carbonations}
        onChange={v => set('carbonations', v)}
      />

      <FilterGroup
        title="Presencia de alcohol"
        options={ALCOHOL_PRESENCE_OPTIONS}
        selected={filters.alcoholPresences}
        onChange={v => set('alcoholPresences', v)}
      />
    </div>
  )
}
