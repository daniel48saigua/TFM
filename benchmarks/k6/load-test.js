// Prueba de carga para comparar Micronaut y Spring Boot.
// Mantiene un número constante de usuarios virtuales (VUS) durante DURATION,
// de forma que las métricas reflejan el estado estable del servicio.
//
//   k6 run -e BASE_URL=http://localhost:8080 -e RESOURCE_PATH=/api/teams/1 -e VUS=10 -e DURATION=30s load-test.js
import http from 'k6/http'
import { check } from 'k6'

const baseUrl = __ENV.BASE_URL || 'http://localhost:8080'
const resourcePath = __ENV.RESOURCE_PATH || '/api/teams/1'
const endpoint = `${baseUrl}${resourcePath}`

export const options = {
  scenarios: {
    steady_load: {
      executor: 'constant-vus',
      vus: Number(__ENV.VUS || 10),
      duration: __ENV.DURATION || '30s',
      gracefulStop: '5s',
    },
  },
  // Sin umbrales que aborten la prueba: los errores se registran como métrica.
  discardResponseBodies: true,
}

export default function () {
  const response = http.get(endpoint)
  check(response, { 'status is 200': (r) => r.status === 200 })
}
