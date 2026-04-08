import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import BeerForm from '../../components/forms/BeerForm'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import '../../styles/forms.css'

export default function EditBeerPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [original, setOriginal] = useState(null)
  const [beer, setBeer] = useState(null)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const isDirty = beer && original && JSON.stringify(beer) !== JSON.stringify(original)
  const successTimeout = useRef(null)

  useEffect(() => {
    supabase.from('beers').select('*').eq('id', id).single()
      .then(({ data, error: err }) => {
        if (err || !data) { navigate('/admin'); return }
        setOriginal(data)
        setBeer(data)
      })
    return () => clearTimeout(successTimeout.current)
  }, [id, navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!beer.name || !beer.brewery || !beer.style) {
      setError('Nombre, cervecería y estilo son obligatorios.')
      return
    }
    setError('')
    setSaving(true)

    const { error: err } = await supabase
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

    setSaving(false)
    if (err) { setError(err.message); return }

    setOriginal({ ...beer })
    setSuccess(true)
    successTimeout.current = setTimeout(() => {
      navigate('/admin')
    }, 1500)
  }

  function handleCancel() {
    if (isDirty) {
      const confirmed = window.confirm(
        '¿Seguro que querés salir sin guardar los cambios?'
      )
      if (!confirmed) return
    }
    navigate('/admin')
  }

  if (!beer) return <LoadingSpinner />

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1>Editar cerveza</h1>
          <p>{original?.name}</p>
        </div>
        <button onClick={handleCancel} className="btn-secondary">
          ← Volver
        </button>
      </div>

      {success && (
        <div style={{
          background: '#f0fff4',
          border: '1px solid #9ae6b4',
          borderRadius: 'var(--radius-sm)',
          color: '#276749',
          padding: 'var(--space-md)',
          marginBottom: 'var(--space-md)',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-sm)',
        }}>
          ✓ Cerveza actualizada. Redirigiendo al panel…
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {error && <div className="form-error" style={{ marginBottom: 'var(--space-md)' }}>{error}</div>}
        <BeerForm data={beer} onChange={setBeer} />
        <div className="form-actions">
          <button type="button" onClick={handleCancel} className="btn-secondary">
            Salir
          </button>
          <button type="submit" className="btn-primary" disabled={saving || success || !isDirty}>
            {saving ? 'Guardando…' : 'Actualizar cerveza'}
          </button>
        </div>
      </form>
    </div>
  )
}
