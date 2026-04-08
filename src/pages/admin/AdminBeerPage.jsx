import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useBeer } from '../../hooks/useBeer'
import BeerForm from '../../components/forms/BeerForm'
import TastingForm from '../../components/forms/TastingForm'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import '../../styles/forms.css'

const EMPTY_TASTING = {
  tasting_date: new Date().toISOString().slice(0, 10),
  color: '', turbidity: '', foam_amount: '', foam_persistence: '',
  aroma_intensity: '', aroma_notes: [], flavor_notes: [],
  bitterness: 3, body: '', carbonation: '', alcohol_presence: '',
  score: 7, free_notes: '',
}

export default function AdminBeerPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { beer: loadedBeer, tastings, loading } = useBeer(id)

  const [beer, setBeer] = useState(null)
  const [tasting, setTasting] = useState(null)
  const [originalBeer, setOriginalBeer] = useState(null)
  const [originalTasting, setOriginalTasting] = useState(null)

  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const successTimeout = useRef(null)

  // Once data loads, initialize form state
  useEffect(() => {
    if (loadedBeer && !beer) {
      setOriginalBeer(loadedBeer)
      setBeer(loadedBeer)
    }
  }, [loadedBeer, beer])

  useEffect(() => {
    if (tastings.length > 0 && !tasting) {
      const latest = tastings[0]
      setOriginalTasting(latest)
      setTasting(latest)
    } else if (tastings.length === 0 && loadedBeer && !tasting) {
      setOriginalTasting(null)
      setTasting(EMPTY_TASTING)
    }
  }, [tastings, loadedBeer, tasting])

  const beerDirty = beer && originalBeer && JSON.stringify(beer) !== JSON.stringify(originalBeer)
  const tastingDirty = tasting && JSON.stringify(tasting) !== JSON.stringify(originalTasting ?? EMPTY_TASTING)
  const isDirty = beerDirty || tastingDirty

  function handleBack() {
    if (isDirty) {
      const ok = window.confirm('¿Salir sin guardar los cambios?')
      if (!ok) return
    }
    navigate('/admin')
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!beer.name || !beer.brewery || !beer.style) {
      setError('Nombre, cervecería y estilo son obligatorios.')
      return
    }
    setError('')
    setSaving(true)

    try {
      // 1. Update beer
      const { error: beerErr } = await supabase
        .from('beers')
        .update({
          name: beer.name,
          brewery: beer.brewery,
          style: beer.style,
          origin: beer.origin || null,
          country: beer.origin === 'Internacional' ? beer.country || null : null,
          photo_url: beer.photo_url || null,
        })
        .eq('id', id)
      if (beerErr) throw beerErr

      // 2. Upsert tasting
      const hasExistingTasting = tastings.length > 0
      const tastingPayload = {
        beer_id: id,
        tasting_date: tasting.tasting_date || null,
        color: tasting.color || null,
        turbidity: tasting.turbidity || null,
        foam_amount: tasting.foam_amount || null,
        foam_persistence: tasting.foam_persistence || null,
        aroma_intensity: tasting.aroma_intensity || null,
        aroma_notes: tasting.aroma_notes || [],
        flavor_notes: tasting.flavor_notes || [],
        bitterness: tasting.bitterness ?? null,
        body: tasting.body || null,
        carbonation: tasting.carbonation || null,
        alcohol_presence: tasting.alcohol_presence || null,
        score: tasting.score ?? null,
        free_notes: tasting.free_notes || null,
      }

      if (hasExistingTasting) {
        const { error: tastingErr } = await supabase
          .from('tastings')
          .update(tastingPayload)
          .eq('id', tastings[0].id)
        if (tastingErr) throw tastingErr
      } else {
        const { error: tastingErr } = await supabase
          .from('tastings')
          .insert(tastingPayload)
        if (tastingErr) throw tastingErr
      }

      setOriginalBeer({ ...beer })
      setOriginalTasting({ ...tasting })
      setSuccess(true)
      successTimeout.current = setTimeout(() => navigate('/admin'), 1500)
    } catch (err) {
      setError(err.message || 'Error al guardar.')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !beer || !tasting) return <LoadingSpinner />

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1>{originalBeer?.name}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{originalBeer?.brewery}</p>
        </div>
        <button type="button" onClick={handleBack} className="btn-secondary">
          ← Volver al panel
        </button>
      </div>

      {success && (
        <div style={{
          background: '#f0fff4', border: '1px solid #9ae6b4',
          borderRadius: 'var(--radius-sm)', color: '#276749',
          padding: 'var(--space-md)', marginBottom: 'var(--space-md)',
          fontWeight: 600, display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
        }}>
          ✓ Cerveza actualizada. Volviendo al panel…
        </div>
      )}

      <form onSubmit={handleSave}>
        {error && (
          <div className="form-error" style={{ marginBottom: 'var(--space-md)' }}>{error}</div>
        )}

        <BeerForm data={beer} onChange={setBeer} />

        <div style={{ marginBottom: 'var(--space-md)' }}>
          <div style={{
            fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.8px', color: 'var(--green-primary)',
            padding: 'var(--space-md) 0 var(--space-sm)',
            borderBottom: '1px solid var(--border-light)',
            marginBottom: 'var(--space-md)',
          }}>
            {tastings.length > 0 ? 'Cata registrada' : 'Registrar cata'}
          </div>
        </div>

        <TastingForm data={tasting} onChange={setTasting} />

        <div className="form-actions">
          <button type="button" onClick={handleBack} className="btn-secondary">
            Salir
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={saving || success || !isDirty}
          >
            {saving ? 'Guardando…' : 'Actualizar'}
          </button>
        </div>
      </form>
    </div>
  )
}
