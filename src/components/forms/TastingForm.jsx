import {
  COLOR_OPTIONS, TURBIDITY_OPTIONS, FOAM_AMOUNT_OPTIONS,
  FOAM_PERSISTENCE_OPTIONS, AROMA_INTENSITY_OPTIONS, AROMA_FLAVOR_NOTES,
  BODY_OPTIONS, CARBONATION_OPTIONS, ALCOHOL_PRESENCE_OPTIONS,
} from '../../constants/tastingOptions'
import SingleSelect from './SingleSelect'
import MultiSelect from './MultiSelect'
import ScoreSlider from './ScoreSlider'
import BitternessSlider from './BitternessSlider'

export default function TastingForm({ data, onChange }) {
  function set(field, value) {
    onChange({ ...data, [field]: value })
  }

  return (
    <>
      <div className="form-section">
        <h3>Fecha de cata</h3>
        <div className="form-group" style={{ maxWidth: 240 }}>
          <label htmlFor="tasting_date">Fecha</label>
          <input
            id="tasting_date"
            type="date"
            value={data.tasting_date}
            onChange={e => set('tasting_date', e.target.value)}
          />
        </div>
      </div>

      <div className="form-section">
        <h3>Apariencia</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Color</label>
            <SingleSelect
              value={data.color}
              onChange={v => set('color', v)}
              options={COLOR_OPTIONS}
              placeholder="Seleccionar color"
            />
          </div>
          <div className="form-group">
            <label>Turbidez</label>
            <SingleSelect
              value={data.turbidity}
              onChange={v => set('turbidity', v)}
              options={TURBIDITY_OPTIONS}
              placeholder="Seleccionar turbidez"
            />
          </div>
          <div className="form-group">
            <label>Espuma — cantidad</label>
            <SingleSelect
              value={data.foam_amount}
              onChange={v => set('foam_amount', v)}
              options={FOAM_AMOUNT_OPTIONS}
              placeholder="Seleccionar"
            />
          </div>
          <div className="form-group">
            <label>Espuma — persistencia</label>
            <SingleSelect
              value={data.foam_persistence}
              onChange={v => set('foam_persistence', v)}
              options={FOAM_PERSISTENCE_OPTIONS}
              placeholder="Seleccionar"
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Aroma</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Intensidad de aroma</label>
            <SingleSelect
              value={data.aroma_intensity}
              onChange={v => set('aroma_intensity', v)}
              options={AROMA_INTENSITY_OPTIONS}
              placeholder="Seleccionar"
            />
          </div>
          <div className="form-group form-grid--full">
            <label>Notas de aroma</label>
            <MultiSelect
              options={AROMA_FLAVOR_NOTES}
              selected={data.aroma_notes || []}
              onChange={v => set('aroma_notes', v)}
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Sabor &amp; Sensaciones</h3>
        <div className="form-grid">
          <div className="form-group form-grid--full">
            <label>Notas de sabor</label>
            <MultiSelect
              options={AROMA_FLAVOR_NOTES}
              selected={data.flavor_notes || []}
              onChange={v => set('flavor_notes', v)}
            />
          </div>
          <div className="form-group">
            <label>Amargor (1–5)</label>
            <BitternessSlider
              value={data.bitterness || 1}
              onChange={v => set('bitterness', v)}
            />
          </div>
          <div className="form-group">
            <label>Cuerpo</label>
            <SingleSelect
              value={data.body}
              onChange={v => set('body', v)}
              options={BODY_OPTIONS}
              placeholder="Seleccionar"
            />
          </div>
          <div className="form-group">
            <label>Carbonatación</label>
            <SingleSelect
              value={data.carbonation}
              onChange={v => set('carbonation', v)}
              options={CARBONATION_OPTIONS}
              placeholder="Seleccionar"
            />
          </div>
          <div className="form-group">
            <label>Presencia de alcohol</label>
            <SingleSelect
              value={data.alcohol_presence}
              onChange={v => set('alcohol_presence', v)}
              options={ALCOHOL_PRESENCE_OPTIONS}
              placeholder="Seleccionar"
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Evaluación</h3>
        <div className="form-grid">
          <div className="form-group form-grid--full">
            <label>Nota general (1–10)</label>
            <ScoreSlider
              value={data.score || 5}
              onChange={v => set('score', v)}
            />
          </div>
          <div className="form-group form-grid--full">
            <label htmlFor="free_notes">Comentario libre</label>
            <textarea
              id="free_notes"
              value={data.free_notes || ''}
              onChange={e => set('free_notes', e.target.value)}
              placeholder="Impresiones, maridajes, contexto…"
              rows={4}
            />
          </div>
        </div>
      </div>
    </>
  )
}
