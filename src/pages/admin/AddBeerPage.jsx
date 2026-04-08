import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import BeerForm from '../../components/forms/BeerForm'
import TastingForm from '../../components/forms/TastingForm'
import '../../styles/forms.css'

const EMPTY_BEER = {
  name: '', brewery: '', style: '', origin: '', country: '', photo_url: '',
}

const EMPTY_TASTING = {
  tasting_date: new Date().toISOString().slice(0, 10),
  color: '', turbidity: '', foam_amount: '', foam_persistence: '',
  aroma_intensity: '', aroma_notes: [], flavor_notes: [],
  bitterness: 3, body: '', carbonation: '', alcohol_presence: '',
  score: 7, free_notes: '',
}

export default function AddBeerPage() {
  const navigate = useNavigate()
  const [beer, setBeer] = useState(EMPTY_BEER)
  const [tasting, setTasting] = useState(EMPTY_TASTING)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!beer.name || !beer.brewery || !beer.style) {
      setError('Nombre, cervecería y estilo son obligatorios.')
      return
    }
    setError('')
    setSaving(true)

    try {
      const { data: beerData, error: beerErr } = await supabase
        .from('beers')
        .insert({
          name: beer.name,
          brewery: beer.brewery,
          style: beer.style,
          origin: beer.origin || null,
          country: beer.origin === 'Internacional' ? beer.country || null : null,
          photo_url: beer.photo_url || null,
        })
        .select()
        .single()

      if (beerErr) throw beerErr

      const { error: tastingErr } = await supabase
        .from('tastings')
        .insert({
          beer_id: beerData.id,
          tasting_date: tasting.tasting_date || null,
          color: tasting.color || null,
          turbidity: tasting.turbidity || null,
          foam_amount: tasting.foam_amount || null,
          foam_persistence: tasting.foam_persistence || null,
          aroma_intensity: tasting.aroma_intensity || null,
          aroma_notes: tasting.aroma_notes,
          flavor_notes: tasting.flavor_notes,
          bitterness: tasting.bitterness,
          body: tasting.body || null,
          carbonation: tasting.carbonation || null,
          alcohol_presence: tasting.alcohol_presence || null,
          score: tasting.score,
          free_notes: tasting.free_notes || null,
        })

      if (tastingErr) throw tastingErr

      navigate('/admin')
    } catch (err) {
      setError(err.message || 'Error al guardar. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1>Nueva cerveza</h1>
          <p>Completá los datos y la cata inicial</p>
        </div>
        <Link to="/admin" className="btn-secondary" style={{ textDecoration: 'none', display: 'inline-block' }}>
          ← Volver
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        {error && <div className="form-error" style={{ marginBottom: 'var(--space-md)' }}>{error}</div>}

        <BeerForm data={beer} onChange={setBeer} />

        <div style={{
          fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.8px', color: 'var(--green-primary)',
          padding: 'var(--space-md) 0 var(--space-sm)',
          borderBottom: '1px solid var(--border-light)',
          marginBottom: 'var(--space-md)',
        }}>
          Cata inicial
        </div>

        <TastingForm data={tasting} onChange={setTasting} />

        <div className="form-actions">
          <Link to="/admin" className="btn-secondary" style={{ textDecoration: 'none' }}>
            Cancelar
          </Link>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar cerveza'}
          </button>
        </div>
      </form>
    </div>
  )
}
