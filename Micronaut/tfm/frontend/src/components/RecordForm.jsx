import { useState } from 'react'

import { toFormValues } from '../services/crud'

function RecordForm({ resource, record, lookups, backend, backendLabel, saving, error, onCancel, onSubmit }) {
  const [values, setValues] = useState(() => toFormValues(resource, record))
  const isEdit = Boolean(record)

  const setValue = (name, value) => setValues((current) => ({ ...current, [name]: value }))

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit(values)
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && !saving && onCancel()}>
      <form className="modal-card" onSubmit={handleSubmit}>
        <div className="modal-header">
          <div>
            <span className="result-label">{backendLabel}</span>
            <h2>{isEdit ? `Editar ${resource.singular} #${record.id}` : resource.newLabel}</h2>
          </div>
          <button className="icon-button" type="button" onClick={onCancel} disabled={saving} aria-label="Cerrar">×</button>
        </div>

        <div className="form-grid">
          {resource.fields.map((field) => (
            <label className="form-field" key={field.name}>
              <span>{field.label}{field.required && <em> *</em>}</span>
              <FieldInput field={field} value={values[field.name]} onChange={(value) => setValue(field.name, value)} />
              {field.type === 'ref' && values[field.name] !== '' && (
                <small className={lookups[field.ref]?.[values[field.name]] ? 'field-hint' : 'field-hint warning'}>
                  {lookups[field.ref]?.[values[field.name]] ?? 'No existe ningún registro con ese ID'}
                </small>
              )}
            </label>
          ))}
        </div>

        {error && <div className="api-state error form-error">{error}</div>}

        <div className="modal-actions">
          <button className="btn btn-secondary" type="button" onClick={onCancel} disabled={saving}>Cancelar</button>
          <button className={`btn btn-primary ${backend}`} type="submit" disabled={saving}>
            {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear'}
          </button>
        </div>
      </form>
    </div>
  )
}

function FieldInput({ field, value, onChange }) {
  const common = { value, required: field.required, onChange: (event) => onChange(event.target.value) }

  if (field.type === 'select') {
    return (
      <select {...common}>
        <option value="">—</option>
        {field.options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    )
  }
  if (field.type === 'datetime') return <input type="datetime-local" {...common} />
  if (field.type === 'number' || field.type === 'ref') {
    return <input type="number" min={field.type === 'ref' ? 1 : field.min} max={field.max} step="1" placeholder={field.type === 'ref' ? 'ID' : ''} {...common} />
  }
  return <input type="text" maxLength={field.maxLength} {...common} />
}

export default RecordForm
