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
  // inline confirm: stores the row pending deletion
  const [confirmRow, setConfirmRow] = useState(null)

  const category = CATEGORIES.find(c => c.key === active)
  const rows = options[active] || []

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

  async function confirmDelete() {
    if (!confirmRow) return
    setDeletingId(confirmRow.id)
    setConfirmRow(null)
    await supabase.from('tasting_options').delete().eq('id', confirmRow.id)
    setDeletingId(null)
    reload()
  }

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

  function renderChip(row) {
    return (
      <div key={row.id} className="config-chip">
        <span>{row.value}</span>
        <button
          className="config-chip__delete"
          type="button"
          onClick={() => setConfirmRow(row)}
          disabled={deletingId === row.id}
          aria-label={`Eliminar ${row.value}`}
        >
          {deletingId === row.id ? '…' : '×'}
        </button>
      </div>
    )
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

      {/* Inline delete confirmation */}
      {confirmRow && (
        <div className="config-confirm">
          <p className="config-confirm__text">
            ¿Eliminar <strong>"{confirmRow.value}"</strong>?<br />
            <span>Si alguna cata ya usa esta opción, seguirá guardada pero no aparecerá al editar.</span>
          </p>
          <div className="config-confirm__btns">
            <button type="button" className="action-link" onClick={() => setConfirmRow(null)}>
              Cancelar
            </button>
            <button type="button" className="action-link action-link--danger" onClick={confirmDelete}>
              Sí, eliminar
            </button>
          </div>
        </div>
      )}

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

          <div className="config-options">
            {category.hasGroups ? (
              Object.entries(groupedRows()).map(([group, groupRows]) => (
                <div key={group} className="config-group">
                  <h3 className="config-group__title">{group}</h3>
                  <div className="config-chips">
                    {groupRows.map(row => renderChip(row))}
                  </div>
                </div>
              ))
            ) : (
              <div className="config-chips">
                {rows.map(row => renderChip(row))}
              </div>
            )}
          </div>

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
