import { useEffect, useMemo, useState } from 'react'

import RecordForm from '../components/RecordForm'
import {
  backends,
  createRecord,
  crudResources,
  deleteRecord,
  describeError,
  listRecords,
  toPayload,
  updateRecord,
} from '../services/crud'

const PAGE_SIZE = 15

function Crud() {
  const [backend, setBackend] = useState('micronaut')
  const [resourceKey, setResourceKey] = useState('teams')
  const [reloadToken, setReloadToken] = useState(0)
  const [records, setRecords] = useState([])
  const [loaded, setLoaded] = useState({ key: null, error: '' })
  const [lookups, setLookups] = useState({ teams: {}, players: {} })
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [lastRequest, setLastRequest] = useState(null)
  const [form, setForm] = useState(null) // { record } — record is null when creating
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [toDelete, setToDelete] = useState(null)
  const [notice, setNotice] = useState('')

  const resource = crudResources.find((item) => item.key === resourceKey)
  const backendInfo = backends[backend]
  const loadKey = `${backend}:${resourceKey}:${reloadToken}`
  const loading = loaded.key !== loadKey

  useEffect(() => {
    let cancelled = false
    listRecords(backend, resource)
      .then(({ data, info }) => {
        if (cancelled) return
        setRecords([...data].sort((a, b) => a.id - b.id))
        setLoaded({ key: loadKey, error: '' })
        setLastRequest(info)
      })
      .catch((error) => {
        if (cancelled) return
        setRecords([])
        setLoaded({ key: loadKey, error: describeError(error) })
        setLastRequest(error.info)
      })
    return () => { cancelled = true }
  }, [backend, resource, loadKey])

  // Names shown next to team / player ids.
  useEffect(() => {
    let cancelled = false
    const byKey = (key) => listRecords(backend, crudResources.find((item) => item.key === key))
      .then(({ data }) => Object.fromEntries(data.map((item) => [item.id, item.name])))
      .catch(() => ({}))
    Promise.all([byKey('teams'), byKey('players')]).then(([teams, players]) => {
      if (!cancelled) setLookups({ teams, players })
    })
    return () => { cancelled = true }
  }, [backend, reloadToken])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return records
    return records.filter((record) =>
      String(record.id) === term ||
      resource.searchFields.some((name) => String(record[name] ?? '').toLowerCase().includes(term)))
  }, [records, search, resource])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const changeBackend = (key) => { setBackend(key); setPage(1); setNotice('') }
  const changeResource = (key) => { setResourceKey(key); setPage(1); setSearch(''); setNotice('') }
  const reload = () => setReloadToken((value) => value + 1)

  const openForm = (record) => { setForm({ record }); setFormError('') }

  const submitForm = async (values) => {
    setSaving(true)
    setFormError('')
    const body = toPayload(resource, values)
    try {
      const { data, info } = form.record
        ? await updateRecord(backend, resource, form.record.id, body)
        : await createRecord(backend, resource, body)
      setLastRequest(info)
      setNotice(form.record ? `Se actualizó ${resource.article} ${resource.singular} #${data.id}.` : `Se creó ${resource.article} ${resource.singular} #${data.id}.`)
      setForm(null)
      reload()
    } catch (error) {
      setLastRequest(error.info)
      setFormError(describeError(error))
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    setSaving(true)
    try {
      const { info } = await deleteRecord(backend, resource, toDelete.id)
      setLastRequest(info)
      setNotice(`Se eliminó ${resource.article} ${resource.singular} #${toDelete.id}.`)
      setToDelete(null)
      reload()
    } catch (error) {
      setLastRequest(error.info)
      setNotice('')
      setToDelete({ ...toDelete, error: describeError(error) })
    } finally {
      setSaving(false)
    }
  }

  const renderCell = (field, record) => {
    const value = record[field.name]
    if (value === null || value === undefined || value === '') return <span className="muted">—</span>
    if (field.type === 'ref') {
      return <span>#{value} <span className="muted">{lookups[field.ref]?.[value] ?? ''}</span></span>
    }
    if (field.type === 'datetime') {
      return new Date(value).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })
    }
    if (field.name === 'status') return <span className={`status-pill ${String(value).toLowerCase()}`}>{value}</span>
    return value
  }

  return (
    <div className="page-container crud-page">
      <div className="page-header">
        <div className="eyebrow">GESTIÓN DE DATOS</div>
        <h1>Gestión (CRUD)</h1>
        <p>Crea, consulta, modifica y elimina registros usando cualquiera de los dos backends. Ambos comparten la misma base de datos PostgreSQL, por lo que los cambios hechos desde uno se ven también desde el otro.</p>
      </div>

      <div className="backend-switch" role="tablist" aria-label="Backend">
        {Object.values(backends).map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            className={`backend-option ${item.key} ${backend === item.key ? 'active' : ''}`}
            onClick={() => changeBackend(item.key)}
          >
            <strong>{item.label}</strong>
            <span>localhost:{item.port}</span>
          </button>
        ))}
      </div>

      <div className="api-toolbar">
        <div className={`api-tabs crud-tabs ${backend}`} role="tablist" aria-label="Recursos">
          {crudResources.map((item) => (
            <button
              key={item.key}
              type="button"
              role="tab"
              className={item.key === resourceKey ? 'api-tab active' : 'api-tab'}
              onClick={() => changeResource(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <button className={`btn btn-primary ${backend}`} type="button" onClick={() => openForm(null)} disabled={loading || Boolean(loaded.error)}>
          + {resource.newLabel}
        </button>
      </div>

      <div className="crud-card">
        <div className="crud-card-header">
          <input
            className="search-input"
            type="search"
            placeholder={resource.searchFields.length ? 'Buscar por ID o texto…' : 'Buscar por ID…'}
            value={search}
            onChange={(event) => { setSearch(event.target.value); setPage(1) }}
          />
          <div className="crud-meta">
            {lastRequest && (
              <span className={`request-badge ${backend}`} title="Tiempo de respuesta medido desde el navegador">
                {lastRequest.method} {lastRequest.url} · {lastRequest.status} · {Math.round(lastRequest.ms)} ms
              </span>
            )}
            <span className="muted">{filtered.length} registros</span>
          </div>
        </div>

        {notice && <div className="crud-notice">{notice}</div>}

        {loading && <div className="api-state crud-state">Consultando {backendInfo.label}…</div>}
        {!loading && loaded.error && <div className="api-state error crud-state">{loaded.error}</div>}

        {!loading && !loaded.error && (
          <div className="crud-table-wrapper">
            <table className="crud-table">
              <thead>
                <tr>
                  <th>ID</th>
                  {resource.fields.map((field) => <th key={field.name}>{field.label}</th>)}
                  <th className="actions-col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((record) => (
                  <tr key={record.id}>
                    <td className="id-col">{record.id}</td>
                    {resource.fields.map((field) => <td key={field.name}>{renderCell(field, record)}</td>)}
                    <td className="actions-col">
                      <button className="btn btn-small" type="button" onClick={() => openForm(record)}>Editar</button>
                      <button className="btn btn-small btn-danger" type="button" onClick={() => setToDelete(record)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
                {visible.length === 0 && (
                  <tr><td className="empty-row" colSpan={resource.fields.length + 2}>No hay registros que coincidan con la búsqueda.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !loaded.error && totalPages > 1 && (
          <div className="pagination">
            <button className="btn btn-small" type="button" disabled={currentPage === 1} onClick={() => setPage(1)}>«</button>
            <button className="btn btn-small" type="button" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Anterior</button>
            <span>Página {currentPage} de {totalPages}</span>
            <button className="btn btn-small" type="button" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)}>Siguiente</button>
            <button className="btn btn-small" type="button" disabled={currentPage === totalPages} onClick={() => setPage(totalPages)}>»</button>
          </div>
        )}
      </div>

      {form && (
        <RecordForm
          key={form.record?.id ?? 'new'}
          resource={resource}
          record={form.record}
          lookups={lookups}
          backend={backend}
          backendLabel={backendInfo.label}
          saving={saving}
          error={formError}
          onCancel={() => setForm(null)}
          onSubmit={submitForm}
        />
      )}

      {toDelete && (
        <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && !saving && setToDelete(null)}>
          <div className="modal-card modal-small">
            <div className="modal-header">
              <div>
                <span className="result-label">{backendInfo.label}</span>
                <h2>¿Eliminar {resource.singular} #{toDelete.id}?</h2>
              </div>
            </div>
            <p className="modal-text">Esta acción borra el registro de la base de datos compartida, por lo que también desaparecerá en el otro backend.</p>
            {toDelete.error && <div className="api-state error form-error">{toDelete.error}</div>}
            <div className="modal-actions">
              <button className="btn btn-secondary" type="button" onClick={() => setToDelete(null)} disabled={saving}>Cancelar</button>
              <button className="btn btn-danger-solid" type="button" onClick={confirmDelete} disabled={saving}>{saving ? 'Eliminando…' : 'Eliminar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Crud
