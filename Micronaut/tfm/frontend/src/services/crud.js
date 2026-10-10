import { micronautApi, springApi } from './api'

export const backends = {
  micronaut: { key: 'micronaut', label: 'Micronaut', port: 8080, client: micronautApi },
  spring: { key: 'spring', label: 'Spring Boot', port: 8081, client: springApi },
}

const scoreField = (name, label) => ({ name, label, type: 'number', min: 0, required: true })

export const crudResources = [
  {
    key: 'teams',
    label: 'Equipos',
    singular: 'equipo',
    article: 'el',
    newLabel: 'Nuevo equipo',
    path: '/api/teams',
    searchFields: ['name', 'city', 'stadium'],
    fields: [
      { name: 'name', label: 'Nombre', type: 'text', required: true, maxLength: 100 },
      { name: 'city', label: 'Ciudad', type: 'text', maxLength: 100 },
      { name: 'stadium', label: 'Estadio', type: 'text', maxLength: 150 },
    ],
  },
  {
    key: 'players',
    label: 'Jugadores',
    singular: 'jugador',
    article: 'el',
    newLabel: 'Nuevo jugador',
    path: '/api/players',
    searchFields: ['name', 'position'],
    fields: [
      { name: 'name', label: 'Nombre', type: 'text', required: true, maxLength: 100 },
      { name: 'age', label: 'Edad', type: 'number', min: 14, max: 60, required: true },
      { name: 'position', label: 'Posición', type: 'select', options: ['Portero', 'Defensa', 'Centrocampista', 'Delantero'] },
      { name: 'teamId', label: 'Equipo', type: 'ref', ref: 'teams' },
    ],
  },
  {
    key: 'matches',
    label: 'Partidos',
    singular: 'partido',
    article: 'el',
    newLabel: 'Nuevo partido',
    path: '/api/matches',
    searchFields: ['status'],
    fields: [
      { name: 'homeTeamId', label: 'Local', type: 'ref', ref: 'teams', required: true },
      { name: 'awayTeamId', label: 'Visitante', type: 'ref', ref: 'teams', required: true },
      { name: 'date', label: 'Fecha', type: 'datetime', required: true },
      scoreField('homeScore', 'Goles local'),
      scoreField('awayScore', 'Goles visitante'),
      { name: 'status', label: 'Estado', type: 'select', options: ['PROGRAMADO', 'FINALIZADO'], required: true },
    ],
  },
  {
    key: 'statistics',
    label: 'Estadísticas',
    singular: 'estadística',
    article: 'la',
    newLabel: 'Nueva estadística',
    path: '/api/statistics',
    searchFields: [],
    fields: [
      { name: 'playerId', label: 'Jugador', type: 'ref', ref: 'players', required: true },
      scoreField('matchesPlayed', 'Partidos'),
      scoreField('goals', 'Goles'),
      scoreField('assists', 'Asistencias'),
      scoreField('yellowCards', 'Amarillas'),
      scoreField('redCards', 'Rojas'),
    ],
  },
]

// Runs a request against the selected backend and measures how long the API took to answer.
async function timed(backend, method, url, data) {
  const start = performance.now()
  try {
    const response = await backends[backend].client.request({ method, url, data })
    return { data: response.data, info: { method: method.toUpperCase(), url, status: response.status, ms: performance.now() - start } }
  } catch (error) {
    error.info = { method: method.toUpperCase(), url, status: error.response?.status ?? 'sin respuesta', ms: performance.now() - start }
    throw error
  }
}

export const listRecords = (backend, resource) => timed(backend, 'get', resource.path)
export const createRecord = (backend, resource, body) => timed(backend, 'post', resource.path, body)
export const updateRecord = (backend, resource, id, body) => timed(backend, 'put', `${resource.path}/${id}`, body)
export const deleteRecord = (backend, resource, id) => timed(backend, 'delete', `${resource.path}/${id}`)

// Form values (strings) -> JSON body expected by both APIs.
export function toPayload(resource, values) {
  const body = {}
  for (const field of resource.fields) {
    const raw = values[field.name]
    if (raw === '' || raw === undefined || raw === null) {
      body[field.name] = null
    } else if (field.type === 'number' || field.type === 'ref') {
      body[field.name] = Number(raw)
    } else if (field.type === 'datetime') {
      body[field.name] = raw.length === 16 ? `${raw}:00` : raw
    } else {
      body[field.name] = raw
    }
  }
  return body
}

// Record from the API -> form values.
export function toFormValues(resource, record) {
  const values = {}
  for (const field of resource.fields) {
    const value = record?.[field.name]
    if (value === null || value === undefined) values[field.name] = ''
    else if (field.type === 'datetime') values[field.name] = String(value).slice(0, 16)
    else values[field.name] = String(value)
  }
  return values
}

export function describeError(error) {
  if (!error.response) return 'No se pudo conectar con el backend. Comprueba que está en ejecución.'
  const { status, data } = error.response
  if (status === 404) return 'El registro ya no existe.'
  const detail = typeof data === 'object' ? data?.message || data?._embedded?.errors?.[0]?.message || data?.error : null
  if (status >= 500) {
    return 'El servidor rechazó la operación. Si estás borrando, puede que otros registros dependan de este (por ejemplo, jugadores o partidos de un equipo).'
  }
  return detail ? `Error ${status}: ${detail}` : `Error ${status} al procesar la petición.`
}
