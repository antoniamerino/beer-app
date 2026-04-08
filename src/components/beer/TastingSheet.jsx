import Badge from '../ui/Badge'
import '../../styles/tastingSheet.css'

function Attr({ label, value }) {
  if (!value && value !== 0) return null
  return (
    <div>
      <div className="tasting-attr__label">{label}</div>
      <div className="tasting-attr__value">{value}</div>
    </div>
  )
}

function BitternessDisplay({ value }) {
  return (
    <div>
      <div className="tasting-attr__label">Amargor</div>
      <div className="bitterness-display" style={{ marginTop: 4 }}>
        {[1, 2, 3, 4, 5].map(n => (
          <div
            key={n}
            className={`bitterness-display-dot ${n <= value ? 'bitterness-display-dot--filled' : ''}`}
          />
        ))}
      </div>
    </div>
  )
}

export default function TastingSheet({ tasting }) {
  if (!tasting) {
    return (
      <div className="tasting-section">
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Esta cerveza aún no tiene una cata registrada.
        </p>
      </div>
    )
  }

  const formattedDate = tasting.tasting_date
    ? new Date(tasting.tasting_date + 'T12:00:00').toLocaleDateString('es-AR', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : null

  return (
    <>
      {formattedDate && (
        <p className="tasting-attr__label" style={{ marginBottom: 'var(--space-md)' }}>
          Cata del {formattedDate}
        </p>
      )}

      <div className="tasting-section">
        <h3>Apariencia</h3>
        <div className="tasting-attrs">
          <Attr label="Color" value={tasting.color} />
          <Attr label="Turbidez" value={tasting.turbidity} />
          <Attr label="Espuma" value={tasting.foam_amount} />
          <Attr label="Persistencia de espuma" value={tasting.foam_persistence} />
        </div>
      </div>

      <div className="tasting-section">
        <h3>Aroma</h3>
        <div className="tasting-attrs">
          <Attr label="Intensidad" value={tasting.aroma_intensity} />
        </div>
        {tasting.aroma_notes?.length > 0 && (
          <div style={{ marginTop: 'var(--space-md)' }}>
            <div className="tasting-attr__label" style={{ marginBottom: 6 }}>Notas</div>
            <div className="tasting-notes-chips">
              {tasting.aroma_notes.map(n => (
                <span key={n} className="tasting-note-chip">{n}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="tasting-section">
        <h3>Sabor &amp; Sensaciones</h3>
        <div className="tasting-attrs">
          {tasting.bitterness != null && <BitternessDisplay value={tasting.bitterness} />}
          <Attr label="Cuerpo" value={tasting.body} />
          <Attr label="Carbonatación" value={tasting.carbonation} />
          <Attr label="Alcohol" value={tasting.alcohol_presence} />
        </div>
        {tasting.flavor_notes?.length > 0 && (
          <div style={{ marginTop: 'var(--space-md)' }}>
            <div className="tasting-attr__label" style={{ marginBottom: 6 }}>Notas de sabor</div>
            <div className="tasting-notes-chips">
              {tasting.flavor_notes.map(n => (
                <span key={n} className="tasting-note-chip">{n}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {(tasting.free_notes || tasting.comment) && (
        <div className="tasting-section">
          <h3>Comentario</h3>
          <p className="tasting-comment">"{tasting.free_notes || tasting.comment}"</p>
        </div>
      )}
    </>
  )
}
