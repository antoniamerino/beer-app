import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
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

export default function AddTastingPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [beerName, setBeerName] = useState('')
  const [tasting, setTasting] = useState(EMPTY_TASTING)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.from('beers').select('name').eq('id', id).single()
      .then(({ data }) => { if (data) setBeerName(data.name) })
  }, [id])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)

    const { error: err } = await supabase.from('tastings').insert({
      beer_id: id,
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

    setSaving(false)
    if (err) { setError(err.message); return }
    navigate(`/beer/${id}`)
  }

  if (!beerName) return <LoadingSpinner />

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1>Nueva cata</h1>
          <p>{beerName}</p>
        </div>
        <Link to={`/beer/${id}`} className="btn-secondary" style={{ textDecoration: 'none', display: 'inline-block' }}>
          ← Volver
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        {error && <div className="form-error" style={{ marginBottom: 'var(--space-md)' }}>{error}</div>}
        <TastingForm data={tasting} onChange={setTasting} />
        <div className="form-actions">
          <Link to={`/beer/${id}`} className="btn-secondary" style={{ textDecoration: 'none' }}>Cancelar</Link>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar cata'}
          </button>
        </div>
      </form>
    </div>
  )
}
