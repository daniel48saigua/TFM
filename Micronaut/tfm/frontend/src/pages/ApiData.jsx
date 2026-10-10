import { useEffect, useState } from 'react'

import { apiResources, fetchApiResource } from '../services/api'

function ApiData() {
  const [resourceKey, setResourceKey] = useState('teams')
  const [data, setData] = useState(null)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  const resource = apiResources.find((item) => item.key === resourceKey)

  useEffect(() => {
    let cancelled = false

    fetchApiResource(resource.path)
      .then((result) => {
        if (!cancelled) {
          setData(result)
          setStatus('success')
        }
      })
      .catch(() => {
        if (!cancelled) {
          setData(null)
          setError('No se pudo conectar con uno o ambos backends. Comprueba que Micronaut y Spring estén ejecutándose.')
          setStatus('error')
        }
      })

    return () => {
      cancelled = true
    }
  }, [resource])

  return (
    <div className="page-container api-page">
      <div className="page-header">
        <div className="eyebrow">DATOS REALES DEL API</div>
        <h1>Explorador de datos</h1>
        <p>Consulta el mismo recurso en Micronaut y Spring Boot para verificar que ambos backends entregan el mismo contrato.</p>
      </div>

      <div className="api-toolbar">
        <div className="api-tabs" role="tablist" aria-label="Recursos del API">
          {apiResources.map((item) => (
            <button
              className={item.key === resourceKey ? 'api-tab active' : 'api-tab'}
              key={item.key}
              onClick={() => setResourceKey(item.key)}
              role="tab"
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
        <code>{resource.path}</code>
      </div>

      {status === 'loading' && <div className="api-state">Consultando ambos backends...</div>}
      {status === 'error' && <div className="api-state error">{error}</div>}

      {status === 'success' && data && (
        <div className="api-results">
          <ApiResult title="Micronaut" tone="micronaut" data={data.micronaut} />
          <ApiResult title="Spring Boot" tone="spring" data={data.spring} />
        </div>
      )}
    </div>
  )
}

function ApiResult({ title, tone, data }) {
  const records = Array.isArray(data) ? data : [data]

  return (
    <section className={`api-result-card ${tone}-api-card`}>
      <div className="api-result-header">
        <div>
          <span className="result-label">Respuesta</span>
          <h2>{title}</h2>
        </div>
        <strong>{records.length} registros</strong>
      </div>
      <div className="api-records">
        {records.slice(0, 100).map((record, index) => (
          <pre key={record.id ?? index}>{JSON.stringify(record, null, 2)}</pre>
        ))}
      </div>
    </section>
  )
}

export default ApiData