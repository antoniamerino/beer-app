import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useBeer } from '../hooks/useBeer'
import TastingSheet from '../components/beer/TastingSheet'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import '../styles/tastingSheet.css'

export default function BeerDetailPage() {
  const { id } = useParams()
  const { beer, tastings, loading, error } = useBeer(id)
  const [selectedTasting, setSelectedTasting] = useState(0)

  if (loading) return <LoadingSpinner />

  if (error || !beer) return (
    <div style={{ textAlign: 'center', padding: 'var(--space-2xl)', color: 'var(--text-muted)' }}>
      <div style={{ fontSize: '2rem', marginBottom: 'var(--space-md)' }}>🍺</div>
      <p>Cerveza no encontrada.</p>
      <Link to="/" style={{ color: 'var(--green-primary)', marginTop: 'var(--space-md)', display: 'inline-block' }}>
        ← Volver al inicio
      </Link>
    </div>
  )

  const activeTasting = tastings[selectedTasting] || null

  return (
    <div className="tasting-sheet-page">
      <Link to="/" className="tasting-sheet-page__back">← Volver</Link>

      <div className="beer-hero">
        {beer.photo_url ? (
          <img src={beer.photo_url} alt={beer.name} className="beer-hero__photo" />
        ) : (
          <div className="beer-hero__photo-placeholder">🍺</div>
        )}

        <div className="beer-hero__info">
          <div className="beer-hero__name-row">
            <h1 className="beer-hero__name">{beer.name}</h1>
            {activeTasting?.score != null && (
              <div className="beer-hero__score">
                <span className="beer-hero__score-value">{activeTasting.score}</span>
                <span className="beer-hero__score-max">/10</span>
              </div>
            )}
          </div>

          <div className="beer-hero__meta">
            {beer.brewery && (
              <p className="beer-hero__meta-row">
                <span className="beer-hero__meta-label">Cervecería</span>
                <span>{beer.brewery}</span>
              </p>
            )}
            {beer.style && (
              <p className="beer-hero__meta-row">
                <span className="beer-hero__meta-label">Tipo</span>
                <span>{beer.style}</span>
              </p>
            )}
            {beer.origin && (
              <p className="beer-hero__meta-row">
                <span className="beer-hero__meta-label">Origen</span>
                <span>{beer.origin}{beer.country ? ` · ${beer.country}` : ''}</span>
              </p>
            )}
          </div>

          <a
            className="beer-hero__where-to-buy"
            href={`https://www.google.com/search?q=${encodeURIComponent(`comprar ${beer.name} ${beer.brewery} ${beer.style ?? ''} Chile`)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            ¿Dónde comprar?
          </a>
        </div>
      </div>

      {tastings.length > 1 && (
        <div className="tastings-nav">
          {tastings.map((t, i) => (
            <button
              key={t.id}
              className={`tastings-nav__btn ${i === selectedTasting ? 'tastings-nav__btn--active' : ''}`}
              onClick={() => setSelectedTasting(i)}
            >
              {t.tasting_date
                ? new Date(t.tasting_date + 'T12:00:00').toLocaleDateString('es-AR', { month: 'short', year: 'numeric' })
                : `Cata ${i + 1}`}
              {t.score != null ? ` · ${t.score}` : ''}
            </button>
          ))}
        </div>
      )}

      <TastingSheet tasting={activeTasting} />
    </div>
  )
}
