import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useBeers } from '../../hooks/useBeers'
import { supabase } from '../../lib/supabase'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'
import '../../styles/admin.css'
import '../../styles/adminConfig.css'

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const { beers, loading } = useBeers()
  const [search, setSearch] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [confirmBeer, setConfirmBeer] = useState(null)

  const sorted = [...beers].sort((a, b) =>
    new Date(b.latestTasting?.tasting_date ?? 0) - new Date(a.latestTasting?.tasting_date ?? 0)
  )

  const filtered = sorted.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.brewery.toLowerCase().includes(search.toLowerCase())
  )

  async function handleDelete(e, beer) {
    e.stopPropagation()
    setConfirmBeer(beer)
  }

  async function confirmDelete() {
    if (!confirmBeer) return
    const beer = confirmBeer
    setConfirmBeer(null)
    setDeletingId(beer.id)
    try {
      await supabase.from('tastings').delete().eq('beer_id', beer.id)
      await supabase.from('beer_categories').delete().eq('beer_id', beer.id)
      const { error } = await supabase.from('beers').delete().eq('id', beer.id)
      if (error) throw error
      window.location.reload()
    } catch (err) {
      alert('Error al eliminar: ' + err.message)
      setDeletingId(null)
    }
  }

  return (
    <div className="admin-dashboard">

      {confirmBeer && (
        <div className="config-confirm" style={{ margin: '0 0 var(--space-lg)' }}>
          <p className="config-confirm__text">
            ¿Eliminar <strong>"{confirmBeer.name}"</strong> de {confirmBeer.brewery}?<br />
            <span>Esta acción no se puede deshacer.</span>
          </p>
          <div className="config-confirm__btns">
            <button type="button" className="action-link" onClick={() => setConfirmBeer(null)}>
              Cancelar
            </button>
            <button type="button" className="action-link action-link--danger" onClick={confirmDelete}>
              Sí, eliminar
            </button>
          </div>
        </div>
      )}

      <div className="admin-dashboard__header">
        <div>
          <h1>Panel de administración</h1>
          <p>{beers.length} cervezas registradas</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="admin-search"
            placeholder="Buscar cerveza…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <Link to="/admin/stats" className="action-link" style={{ whiteSpace: 'nowrap' }}>
            Estadísticas
          </Link>
          <Link to="/admin/config" className="action-link" style={{ whiteSpace: 'nowrap' }}>
            ⚙ Opciones
          </Link>
          <Link to="/admin/beer/new" className="btn-primary" style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}>
            + Nueva cerveza
          </Link>
        </div>
      </div>

      {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
        <EmptyState message={search ? 'No se encontraron cervezas.' : 'Aún no hay cervezas. ¡Agregá la primera!'} />
      ) : (
        <div className="beer-table-wrapper">
          <table className="beer-table">
            <thead>
              <tr>
                <th>Cerveza</th>
                <th>Estilo</th>
                <th>Nota</th>
                <th>Fecha</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(beer => (
                <tr
                  key={beer.id}
                  onClick={() => navigate(`/admin/beer/${beer.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>
                    <div className="beer-table__name">{beer.name}</div>
                    <div className="beer-table__brewery">{beer.brewery}</div>
                  </td>
                  <td>{beer.style}</td>
                  <td>
                    {beer.latestTasting?.score != null ? (
                      <span className="beer-table__score">{beer.latestTasting.score}</span>
                    ) : '—'}
                  </td>
                  <td>
                    {beer.latestTasting?.tasting_date
                      ? new Date(beer.latestTasting.tasting_date + 'T12:00:00').toLocaleDateString('es-AR', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })
                      : '—'}
                  </td>
                  <td>
                    <button
                      className="action-link action-link--danger"
                      onClick={e => handleDelete(e, beer)}
                      disabled={deletingId === beer.id}
                    >
                      {deletingId === beer.id ? '…' : 'Eliminar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ padding: 'var(--space-sm) var(--space-md)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Hacé clic en una cerveza para ver y editar sus datos.
          </p>
        </div>
      )}
    </div>
  )
}
