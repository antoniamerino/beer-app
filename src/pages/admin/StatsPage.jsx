import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import '../../styles/admin.css'
import '../../styles/adminConfig.css'

const TASTING_FIELDS = [
  { key: 'color',            label: 'Color' },
  { key: 'bitterness',       label: 'Amargor' },
  { key: 'body',             label: 'Cuerpo' },
  { key: 'carbonation',      label: 'Carbonatación' },
  { key: 'alcohol_presence', label: 'Alcohol' },
  { key: 'aroma_notes',      label: 'Notas de aroma' },
  { key: 'flavor_notes',     label: 'Notas de sabor' },
  { key: 'score',            label: 'Nota' },
]

function missingFields(t) {
  return TASTING_FIELDS.filter(({ key }) => {
    const v = t[key]
    if (Array.isArray(v)) return v.length === 0
    return v == null || v === ''
  }).map(f => f.label)
}

export default function StatsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: beers } = await supabase
        .from('beers')
        .select(`
          id, name, brewery, style, origin, photo_url,
          tastings (
            id, score, tasting_date, color, turbidity,
            foam_amount, foam_persistence, aroma_intensity,
            body, bitterness, carbonation, alcohol_presence,
            aroma_notes, flavor_notes
          )
        `)

      if (!beers) { setLoading(false); return }

      const withTasting = beers.filter(b => b.tastings?.length > 0)
      const withoutTasting = beers.filter(b => !b.tastings?.length)

      // Latest tasting per beer
      const latestTastings = withTasting.map(b => {
        const t = [...b.tastings].sort((a, z) => new Date(z.tasting_date) - new Date(a.tasting_date))[0]
        return { beer: b, tasting: t }
      })

      // Scores
      const scores = latestTastings.map(x => x.tasting.score).filter(s => s != null)
      const avgScore = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : null
      const maxScore = scores.length ? Math.max(...scores) : null
      const minScore = scores.length ? Math.min(...scores) : null

      // Top styles
      const styleCounts = {}
      beers.forEach(b => { if (b.style) styleCounts[b.style] = (styleCounts[b.style] || 0) + 1 })
      const topStyles = Object.entries(styleCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)

      // Top breweries
      const breweryCounts = {}
      beers.forEach(b => { breweryCounts[b.brewery] = (breweryCounts[b.brewery] || 0) + 1 })
      const topBreweries = Object.entries(breweryCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)

      // Incomplete beers: no photo, or tasting with missing fields
      const incomplete = [
        ...withoutTasting.map(b => ({ beer: b, missing: ['Sin cata registrada'] })),
        ...latestTastings
          .map(({ beer, tasting }) => {
            const missing = []
            if (!beer.photo_url) missing.push('Foto')
            missing.push(...missingFields(tasting))
            return { beer, missing }
          })
          .filter(x => x.missing.length > 0),
      ].sort((a, b) => b.missing.length - a.missing.length)

      setData({ beers, withTasting, withoutTasting, avgScore, maxScore, minScore, topStyles, topBreweries, incomplete })
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="admin-dashboard"><LoadingSpinner /></div>
  if (!data) return <div className="admin-dashboard"><p>Error cargando datos.</p></div>

  const { beers, withTasting, withoutTasting, avgScore, maxScore, minScore, topStyles, topBreweries, incomplete } = data

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard__header">
        <div>
          <h1>Estadísticas</h1>
          <p>{beers.length} cervezas en la colección</p>
        </div>
        <Link to="/admin" className="action-link">← Volver</Link>
      </div>

      {/* Stats grid */}
      <div className="stats-grid">
        <div className="stats-card">
          <div className="stats-card__value">{beers.length}</div>
          <div className="stats-card__label">Total cervezas</div>
        </div>
        <div className="stats-card">
          <div className="stats-card__value">{withTasting.length}</div>
          <div className="stats-card__label">Con cata</div>
        </div>
        <div className="stats-card">
          <div className="stats-card__value">{withoutTasting.length}</div>
          <div className="stats-card__label">Sin cata</div>
        </div>
        <div className="stats-card">
          <div className="stats-card__value">{avgScore ?? '—'}</div>
          <div className="stats-card__label">Nota promedio</div>
        </div>
        <div className="stats-card">
          <div className="stats-card__value">{maxScore ?? '—'}</div>
          <div className="stats-card__label">Nota máxima</div>
        </div>
        <div className="stats-card">
          <div className="stats-card__value">{minScore ?? '—'}</div>
          <div className="stats-card__label">Nota mínima</div>
        </div>
      </div>

      <div className="stats-cols">
        <div className="stats-section">
          <h3>Top estilos</h3>
          <ul className="stats-list">
            {topStyles.map(([style, count]) => (
              <li key={style}>
                <span>{style}</span>
                <span className="stats-list__count">{count}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="stats-section">
          <h3>Top cervecerías</h3>
          <ul className="stats-list">
            {topBreweries.map(([brewery, count]) => (
              <li key={brewery}>
                <span>{brewery}</span>
                <span className="stats-list__count">{count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Incomplete beers */}
      {incomplete.length > 0 && (
        <div className="stats-section" style={{ marginTop: 'var(--space-xl)' }}>
          <h3>Cervezas con datos incompletos ({incomplete.length})</h3>
          <div className="beer-table-wrapper">
            <table className="beer-table">
              <thead>
                <tr>
                  <th>Cerveza</th>
                  <th>Campos faltantes</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {incomplete.map(({ beer, missing }) => (
                  <tr key={beer.id}>
                    <td>
                      <div className="beer-table__name">{beer.name}</div>
                      <div className="beer-table__brewery">{beer.brewery}</div>
                    </td>
                    <td>
                      <div className="stats-missing">
                        {missing.map(f => (
                          <span key={f} className="stats-missing__tag">{f}</span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <Link to={`/admin/beer/${beer.id}`} className="action-link">
                        Editar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
