import summary from '../data/benchmark-summary.json'

export { summary }

export const frameworks = ['micronaut', 'spring']
export const frameworkLabels = { micronaut: 'Micronaut', spring: 'Spring Boot' }
export const endpointLabels = {
  small: 'Respuesta pequeña (1 equipo)',
  large: 'Respuesta grande (1000 equipos)',
}
export const vusLevels = summary.environment.parameters.vus

const numberFormat = (digits) => new Intl.NumberFormat('es-ES', { maximumFractionDigits: digits, minimumFractionDigits: digits, useGrouping: 'always' })

export function formatNumber(value, digits = 0) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  return numberFormat(digits).format(value)
}

// 'large-100vus' -> 'respuesta grande, 100 usuarios'
export function scenarioLabel(scenario) {
  const match = /^(small|large)-(\d+)vus$/.exec(scenario ?? '')
  if (!match) return scenario ?? ''
  return `respuesta ${match[1] === 'small' ? 'pequeña' : 'grande'}, ${match[2]} usuarios`
}

export function loadRow(framework, endpoint, vus) {
  return summary.load.find((row) => row.framework === framework && row.endpoint === endpoint && row.vus === vus)
}

// Rows for a chart: one entry per VU level with a value per framework.
export function loadSeries(endpoint, field) {
  return vusLevels.map((vus) => ({
    label: `${vus} usuarios`,
    micronaut: loadRow('micronaut', endpoint, vus)?.[field],
    spring: loadRow('spring', endpoint, vus)?.[field],
  }))
}

export function startupRuns() {
  return summary.startup.micronaut.runs.map((run, index) => ({
    label: `${run.run}`,
    micronaut: run.firstResponseMs,
    spring: summary.startup.spring.runs[index]?.firstResponseMs,
  }))
}

// Relative difference of Micronaut against Spring Boot and which one is better.
export function compare(micronaut, spring, higherIsBetter) {
  if (micronaut == null || spring == null || spring === 0) return { diffPct: null, winner: null, ratio: null }
  const diffPct = ((micronaut - spring) / spring) * 100
  const micronautBetter = higherIsBetter ? micronaut > spring : micronaut < spring
  const ratio = higherIsBetter ? micronaut / spring : spring / micronaut
  return { diffPct, winner: micronaut === spring ? null : micronautBetter ? 'micronaut' : 'spring', ratio }
}

const startup = summary.startup
const memory = summary.memoryIdle

// Every metric shown in the comparison table, grouped by area.
export const comparisonGroups = [
  {
    title: 'Arranque',
    rows: [
      { label: 'Tiempo hasta la primera respuesta (mediana)', unit: 'ms', digits: 0, higherIsBetter: false,
        micronaut: startup.micronaut.firstResponseMs.median, spring: startup.spring.firstResponseMs.median },
      { label: 'Tiempo indicado por el framework (media)', unit: 'ms', digits: 0, higherIsBetter: false,
        micronaut: startup.micronaut.reportedMs?.mean, spring: startup.spring.reportedMs?.mean },
      { label: 'Tamaño del JAR ejecutable', unit: 'MB', digits: 1, higherIsBetter: false,
        micronaut: summary.environment.jarSizeMB.micronaut, spring: summary.environment.jarSizeMB.spring },
    ],
  },
  {
    title: 'Memoria en reposo',
    rows: [
      ['Memoria del proceso (working set)', 'workingSetMB'],
      ['Heap usado tras GC', 'heapUsedAfterGcMB'],
      ['Metaspace usado', 'metaspaceUsedMB'],
      ['Memoria nativa comprometida (NMT)', 'nativeCommittedMB'],
    ].map(([label, field]) => ({ label, unit: 'MB', digits: 1, higherIsBetter: false,
      micronaut: memory.micronaut[field], spring: memory.spring[field] }))
      .concat([
        { label: 'Clases cargadas', unit: '', digits: 0, higherIsBetter: false,
          micronaut: memory.micronaut.loadedClasses, spring: memory.spring.loadedClasses },
        { label: 'Hilos activos', unit: '', digits: 0, higherIsBetter: false,
          micronaut: memory.micronaut.liveThreads, spring: memory.spring.liveThreads },
      ]),
  },
  ...['small', 'large'].map((endpoint) => ({
    title: `Carga — ${endpointLabels[endpoint]}`,
    rows: vusLevels.flatMap((vus) => {
      const m = loadRow('micronaut', endpoint, vus)
      const s = loadRow('spring', endpoint, vus)
      return [
        { label: `Peticiones por segundo (${vus} usuarios)`, unit: 'req/s', digits: 0, higherIsBetter: true, micronaut: m?.rps, spring: s?.rps },
        { label: `Latencia p95 (${vus} usuarios)`, unit: 'ms', digits: 1, higherIsBetter: false, micronaut: m?.p95Ms, spring: s?.p95Ms },
      ]
    }),
  })),
  {
    title: `Java Flight Recorder (${scenarioLabel(summary.jfr.micronaut?.scenario)})`,
    rows: [
      { label: 'Pausa total de GC', unit: 'ms', digits: 0, higherIsBetter: false,
        micronaut: summary.jfr.micronaut?.gcPauseTotalMs, spring: summary.jfr.spring?.gcPauseTotalMs },
      { label: 'Pausa máxima de GC', unit: 'ms', digits: 1, higherIsBetter: false,
        micronaut: summary.jfr.micronaut?.gcPauseMaxMs, spring: summary.jfr.spring?.gcPauseMaxMs },
    ],
  },
]

export function winsCount() {
  const rows = comparisonGroups.flatMap((group) => group.rows)
  const wins = { micronaut: 0, spring: 0 }
  rows.forEach((row) => {
    const { winner } = compare(row.micronaut, row.spring, row.higherIsBetter)
    if (winner) wins[winner] += 1
  })
  return { ...wins, total: rows.length }
}

// Range of the throughput ratio Micronaut / Spring Boot across every load scenario.
export function throughputRatioRange() {
  const ratios = summary.load
    .filter((row) => row.framework === 'micronaut')
    .map((row) => row.rps / loadRow('spring', row.endpoint, row.vus).rps)
  return { min: Math.min(...ratios), max: Math.max(...ratios) }
}
