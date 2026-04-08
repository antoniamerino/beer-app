import { useState, useMemo } from 'react'
import { useBeers } from '../hooks/useBeers'
import FilterSidebar from '../components/beer/FilterSidebar'
import BeerGrid from '../components/beer/BeerGrid'
import '../styles/filterSidebar.css'
import '../styles/beerGrid.css'

const HERO_IMG = '/martin-pescador.jpeg'

const DEFAULT_FILTERS = {
  origins: [],         // [] = all
  styles: [],          // [] = all
  colors: [],
  turbidities: [],
  foamAmounts: [],
  aromaIntensities: [],
  bodies: [],
  bitternesses: [],    // numbers 1-5
  carbonations: [],
  alcoholPresences: [],
  minScore: '',
  sortBy: 'score_desc',
}

function applyFilters(beers, filters) {
  let result = beers

  // Beer-level filters
  if (filters.origins.length > 0)
    result = result.filter(b => b.origin && filters.origins.includes(b.origin))

  if (filters.styles.length > 0)
    result = result.filter(b => b.style && filters.styles.includes(b.style))

  // Tasting-level filters (applied to latestTasting)
  const hasTastingFilter =
    filters.colors.length > 0 || filters.turbidities.length > 0 ||
    filters.foamAmounts.length > 0 || filters.aromaIntensities.length > 0 ||
    filters.bodies.length > 0 || filters.bitternesses.length > 0 ||
    filters.carbonations.length > 0 || filters.alcoholPresences.length > 0 ||
    !!filters.minScore

  if (hasTastingFilter) {
    result = result.filter(b => {
      const t = b.latestTasting
      if (!t) return false

      if (filters.colors.length > 0 && !filters.colors.includes(t.color)) return false
      if (filters.turbidities.length > 0 && !filters.turbidities.includes(t.turbidity)) return false
      if (filters.foamAmounts.length > 0 && !filters.foamAmounts.includes(t.foam_amount)) return false
      if (filters.aromaIntensities.length > 0 && !filters.aromaIntensities.includes(t.aroma_intensity)) return false
      if (filters.bodies.length > 0 && !filters.bodies.includes(t.body)) return false
      if (filters.bitternesses.length > 0 && !filters.bitternesses.includes(t.bitterness)) return false
      if (filters.carbonations.length > 0 && !filters.carbonations.includes(t.carbonation)) return false
      if (filters.alcoholPresences.length > 0 && !filters.alcoholPresences.includes(t.alcohol_presence)) return false
      if (filters.minScore && (t.score == null || t.score < parseFloat(filters.minScore))) return false

      return true
    })
  }

  // Sort
  if (filters.sortBy === 'score_desc') {
    result = [...result].sort((a, b) => (b.latestTasting?.score ?? -1) - (a.latestTasting?.score ?? -1))
  } else if (filters.sortBy === 'date_desc') {
    result = [...result].sort((a, b) =>
      new Date(b.latestTasting?.tasting_date ?? 0) - new Date(a.latestTasting?.tasting_date ?? 0)
    )
  } else {
    result = [...result].sort((a, b) => a.name.localeCompare(b.name, 'es'))
  }

  return result
}

export default function HomePage() {
  const { beers, loading } = useBeers()
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Derive unique styles from loaded beers
  const availableStyles = useMemo(() => {
    const styles = new Set(beers.map(b => b.style).filter(Boolean))
    return [...styles].sort((a, b) => a.localeCompare(b, 'es'))
  }, [beers])

  const filtered = useMemo(() => applyFilters(beers, filters), [beers, filters])

  const totalActive = [
    filters.origins, filters.styles, filters.colors, filters.turbidities,
    filters.foamAmounts, filters.aromaIntensities, filters.bodies,
    filters.bitternesses, filters.carbonations, filters.alcoholPresences,
  ].filter(arr => arr.length > 0).length + (filters.minScore ? 1 : 0)

  return (
    <>
      <div className="home-hero">
        <img src={HERO_IMG} alt="Martín Pescador" className="home-hero__img" />
        <div className="home-hero__overlay">
          <h1 className="home-hero__title">Cervezas Diego</h1>
          <p className="home-hero__subtitle">Registro personal de catas de cerveza artesanal</p>
        </div>
      </div>

      <div className="home-layout">
      <FilterSidebar
        filters={filters}
        onChange={setFilters}
        availableStyles={availableStyles}
        isOpen={sidebarOpen}
      />

      <div className="home-layout__content">
        <div className="home-layout__bar">
          <button
            className="filter-mobile-btn"
            onClick={() => setSidebarOpen(o => !o)}
          >
            🔍 Filtros
            {totalActive > 0 && (
              <span className="filter-mobile-btn__count">{totalActive}</span>
            )}
          </button>
          <span className="home-layout__count">
            {loading ? '' : `${filtered.length} cerveza${filtered.length !== 1 ? 's' : ''}`}
            {totalActive > 0 && !loading ? ` · ${totalActive} filtro${totalActive !== 1 ? 's' : ''} activo${totalActive !== 1 ? 's' : ''}` : ''}
          </span>
        </div>

        <BeerGrid beers={filtered} loading={loading} />
      </div>
    </div>
    </>
  )
}
