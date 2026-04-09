import { useTastingOptions } from '../../hooks/useTastingOptions'
import SingleSelect from './SingleSelect'
import PhotoUpload from './PhotoUpload'

export default function BeerForm({ data, onChange }) {
  const { values, beerStyleGroups, loading } = useTastingOptions()

  const originOptions = values('origins')
  const styleGroups   = beerStyleGroups()

  function set(field, value) {
    onChange({ ...data, [field]: value })
  }

  return (
    <div className="form-section">
      <h3>Información de la cerveza</h3>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="name">Nombre *</label>
          <input
            id="name"
            type="text"
            value={data.name}
            onChange={e => set('name', e.target.value)}
            required
            placeholder="Nombre de la cerveza"
          />
        </div>

        <div className="form-group">
          <label htmlFor="brewery">Cervecería *</label>
          <input
            id="brewery"
            type="text"
            value={data.brewery}
            onChange={e => set('brewery', e.target.value)}
            required
            placeholder="Nombre de la cervecería"
          />
        </div>

        <div className="form-group">
          <label htmlFor="style">Tipo *</label>
          <select
            id="style"
            className="single-select"
            value={data.style}
            onChange={e => set('style', e.target.value)}
            required
          >
            <option value="">Seleccionar tipo…</option>
            {styleGroups.map(({ group, styles }) => (
              <optgroup key={group} label={group}>
                {[...styles].sort((a, b) => a.localeCompare(b, 'es')).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="origin">Origen</label>
          <SingleSelect
            id="origin"
            value={data.origin}
            onChange={v => set('origin', v)}
            options={originOptions}
            placeholder={loading ? 'Cargando…' : 'Seleccionar origen'}
          />
        </div>

        {data.origin === 'Internacional' && (
          <div className="form-group">
            <label htmlFor="country">País</label>
            <input
              id="country"
              type="text"
              value={data.country}
              onChange={e => set('country', e.target.value)}
              placeholder="País de origen"
            />
          </div>
        )}

        <div className={`form-group ${data.origin !== 'Internacional' ? 'form-grid--full' : ''}`}>
          <label>Foto</label>
          <PhotoUpload
            currentUrl={data.photo_url}
            onUpload={url => set('photo_url', url)}
          />
        </div>
      </div>
    </div>
  )
}
