import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useTastingOptions } from '../../hooks/useTastingOptions'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import '../../styles/admin.css'
import '../../styles/adminConfig.css'

const CATEGORIES = [
  { key: 'aroma_notes',  label: 'Notas de aroma y sabor', hasGroups: false },
  { key: 'beer_styles',  label: 'Estilos de cerveza',     hasGroups: true  },
  { key: 'colors',       label: 'Colores',                hasGroups: false },
  { key: 'origins',      label: 'Origen',                 hasGroups: false },
]

export default function AdminConfigPage() {
  const { options, loading, reload } = useTastingOptions()
  const [active, setActive] = useState('aroma_notes')
  const [newValue, setNewValue] = useState('')
  const [newGroup, setNewGroup] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  const category = CATEGORIES.find(c => c.key === active)
  const rows = options[active] || []

  // Unique groups for beer_styles
  const existingGroups = active === 'beer_styles'
    ? [...new Set(rows.map(r => r.group_name).filter(Boolean))]
    : []

  async function handleAdd(e) {
    e.preventDefault()
    const val = newValue.trim()
    if (!val) return
    if (rows.some(r => r.value.toLowerCase() === val.toLowerCase())) {
      setError('Esa opción ya existe.')
      return
    }
    setSaving(true)
    setError('')
    const { error: err } = await supabase.from('tasting_options').insert({
      category: active,
      value: val,
      group_name: category.hasGroups ? (newGroup.trim() || null) : null,
    })
    setSaving(false)
    if (err) { setError(err.message); return }
    setNewValue('')
    setNewGroup('')
    reload()
  }

  async function handleDelete(row) {
    const confirmed = window.confirm(
      `¿Eliminar "${row.value}"?\n\nSi alguna cata ya usa esta opción, seguirá guardada pero no aparecerá disponible al editar.`
    )
    if (!confirmed) return
    setDeletingId(row.id)
    await supabase.from('tasting_options').delete().eq('id', row.id)
    setDeletingId(null)
    reload()
  }

  // Group rows for beer_styles display
  function groupedRows() {
    if (!category.hasGroups) return null
    const map = {}
    rows.forEach(r => {
      const g = r.group_name || 'Sin grupo'
      if (!map[g]) map[g] = []
      map[g].push(r)
    })
    return map
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1>Configuración de opciones</h1>
          <p>Administrá las opciones disponibles en los formularios de cata</p>
        </div>
        <Link to="/admin" className="action-link">← Volver al panel</Link>
      </div>

      {/* Category tabs */}
      <div className="config-tabs">
        {CATEGORIES.map(c => (
          <button
            key={c.key}
            className={`config-tab ${active === c.key ? 'config-tab--active' : ''}`}
            onClick={() => { setActive(c.key); setNewValue(''); setNewGroup(''); setError('') }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="config-panel">
          <h2 className="config-panel__title">{category.label}</h2>
          <p className="config-panel__count">{rows.length} opción{rows.length !== 1 ? 'es' : ''}</p>

          {/* Options list */}
          <div className="config-options">
            {category.hasGroups ? (
              Object.entries(groupedRows()).map(([group, groupRows]) => (
                <div key={group} className="config-group">
                  <h3 className="config-group__title">{group}</h3>
                  <div className="config-chips">
                    {groupRows.map(row => (
                      <div key={row.id} className="config-chip">
                        <span>{row.value}</span>
                        <button
                          className="config-chip__delete"
                          onClick={() => handleDelete(row)}
                          disabled={deletingId === row.id}
                          aria-label={`Eliminar ${row.value}`}
                        >
                          {deletingId === row.id ? '…' : '×'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="config-chips">
                {rows.map(row => (
                  <div key={row.id} className="config-chip">
                    <span>{row.value}</span>
                    <button
                      className="config-chip__delete"
                      onClick={() => handleDelete(row)}
                      disabled={deletingId === row.id}
                      aria-label={`Eliminar ${row.value}`}
                    >
                      {deletingId === row.id ? '…' : '×'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add form */}
          <form className="config-add-form" onSubmit={handleAdd}>
            <h3 className="config-add-form__title">Agregar nueva opción</h3>
            {error && <p className="config-add-form__error">{error}</p>}
            <div className="config-add-form__fields">
              {category.hasGroups && (
                <div className="config-add-form__group-field">
                  <label>Grupo</label>
                  <input
                    type="text"
                    list="groups-list"
                    value={newGroup}
                    onChange={e => setNewGroup(e.target.value)}
                    placeholder="Nombre del grupo (ej: IPAs)"
                  />
                  <datalist id="groups-list">
                    {existingGroups.map(g => <option key={g} value={g} />)}
                  </datalist>
                </div>
              )}
              <div className="config-add-form__value-row">
                <input
                  type="text"
                  value={newValue}
                  onChange={e => { setNewValue(e.target.value); setError('') }}
                  placeholder={`Nueva ${category.label.toLowerCase().slice(0, -1)}…`}
                  required
                />
                <button type="submit" className="action-link action-link--primary" disabled={saving}>
                  {saving ? 'Guardando…' : '+ Agregar'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
