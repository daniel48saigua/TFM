import http from 'k6/http'
import { check } from 'k6'

const baseUrl = __ENV.BASE_URL || 'http://localhost:8080'
const resourcePath = __ENV.RESOURCE_PATH || '/api/teams/1'
const endpoint = `${baseUrl}${resourcePath}`
const maxVUs = Number(__ENV.MAX_VUS || 10)
const steadyDuration = __ENV.STEADY_DURATION || '30s'

export const options = {
  scenarios: {
    api_load: {
      executor: 'ramping-vus',
      startVUs: 1,
      stages: [
        { duration: '15s', target: maxVUs },
        { duration: steadyDuration, target: maxVUs },
        { duration: '15s', target: 0 },
      ],
      gracefulRampDown: '5s',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<1000'],
  },
}

export default function () {
  const response = http.get(endpoint, {
    tags: { endpoint: 'teams' },
  })

  check(response, {
    'status is 200': (result) => result.status === 200,
    'response is JSON': (result) => result.headers['Content-Type']?.includes('application/json'),
  })
}