import axios from 'axios'

export const micronautApi = axios.create({
  baseURL: 'http://localhost:8080',
})

export const springApi = axios.create({
  baseURL: 'http://localhost:8081',
})

export const apiResources = [
  { key: 'teams', label: 'Equipos', path: '/api/teams' },
  { key: 'players', label: 'Jugadores', path: '/api/players' },
  { key: 'matches', label: 'Partidos', path: '/api/matches' },
  { key: 'statistics', label: 'Estadísticas', path: '/api/statistics' },
]

export async function fetchApiResource(resourcePath) {
  const [micronautResponse, springResponse] = await Promise.all([
    micronautApi.get(resourcePath),
    springApi.get(resourcePath),
  ])

  return {
    micronaut: micronautResponse.data,
    spring: springResponse.data,
  }
}
