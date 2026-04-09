import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useBeers } from '../hooks/useBeers'
import '../styles/ranking.css'

const FILTERS = [
  { id: 'all',   label: 'Todas' },
  { id: 'ar',    label: 'Nacionales' },
  { id: 'intl',  label: 'Internacionales' },
]

const MEDALS = ['🥇', '🥈', '🥉']

export default function RankingPage() {
  const { beers, loading } = useBeers()
  const [filter, setFilter] = useState('all')

  const ranking = useMemo(() => {
    const map = {}

    beers.forEach(beer => {
      const score = beer.latestTasting?.score
      if (score == null) return

      if (!map[beer.brewery]) {
        map[beer.brewery] = {
          brewery: beer.brewery,
          origin:  beer.origin || '',
          scores:  [],
          beers:   [],
        }
      }
      map[beer.brewery].scores.push(score)
      map[beer.brewery].beers.push(beer)
    })

    return Object.values(map)
      .map(g => ({
        ...g,
        avg:   +(g.scores.reduce((a, b) => a + b, 0) / g.scores.length).toFixed(1),
        count: g.scores.length,
        best:  [...g.beers].sort((a, b) => b.latestTasting.score - a.latestTasting.score).slice(0, 3),
      }))
      .filter(g => {
        if (filter === 'ar')   return g.origin === 'Argentina'
        if (filter === 'intl') return g.origin === 'Internacional'
        return true
      })
      .sort((a, b) => b.avg - a.avg || b.count - a.count)
  }, [beers, filter])

  return (
    <div className="ranking-page">
      <div className="ranking-header">
        <div>
          <h1 className="ranking-title">Ranking de cervecerías</h1>
          <p className="ranking-subtitle">Promedio de notas por cervecería</p>
        </div>
        <div className="ranking-filters">
          {FILTERS.map(f => (
            <button
              key={f.id}
              className={`ranking-filter ${filter === f.id ? 'ranking-filter--active' : ''}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="ranking-empty">Cargando…</div>
      ) : ranking.length === 0 ? (
        <div className="ranking-empty">No hay cervecerías con catas registradas.</div>
      ) : (
        <div className="ranking-list">
          {ranking.map((g, i) => (
            <div key={g.brewery} className={`ranking-row ${i < 3 ? 'ranking-row--podium' : ''}`}>
              <div className="ranking-pos">
                {i < 3 ? (
                  <span className="ranking-medal">{MEDALS[i]}</span>
                ) : (
                  <span className="ranking-num">{i + 1}</span>
                )}
              </div>

              <div className="ranking-info">
                <div className="ranking-brewery">{g.brewery}</div>
                {g.origin && (
                  <div className="ranking-origin">{g.origin}</div>
                )}
                <div className="ranking-beers">
                  {g.best.map(b => (
                    <Link key={b.id} to={`/beer/${b.id}`} className="ranking-beer-chip">
                      {b.name}
                      <span className="ranking-beer-score">{b.latestTasting.score}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="ranking-score-col">
                <div className="ranking-avg">{g.avg}</div>
                <div className="ranking-count">{g.count} cerveza{g.count !== 1 ? 's' : ''}</div>
                <div className="ranking-bar-wrap">
                  <div className="ranking-bar" style={{ width: `${(g.avg / 10) * 100}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
