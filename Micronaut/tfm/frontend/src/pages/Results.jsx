import { useState } from 'react'

import BenchmarkChart from '../components/BenchmarkChart'
import {
  endpointLabels,
  formatNumber,
  frameworkLabels,
  frameworks,
  loadRow,
  loadSeries,
  scenarioLabel,
  startupRuns,
  summary,
  vusLevels,
} from '../services/benchmarks'

const memoryFields = [
  ['Proceso', 'workingSetMB'],
  ['Nativa (NMT)', 'nativeCommittedMB'],
  ['Metaspace', 'metaspaceUsedMB'],
  ['Heap tras GC', 'heapUsedAfterGcMB'],
]

function Results() {
  const [endpoint, setEndpoint] = useState('small')
  const { environment, startup, memoryIdle, jfr } = summary
  const params = environment.parameters

  const memoryData = memoryFields.map(([label, field]) => ({
    label, micronaut: memoryIdle.micronaut[field], spring: memoryIdle.spring[field],
  }))

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="eyebrow">RESULTADOS DEL BENCHMARK</div>
        <h1>Resultados</h1>
        <p>Detalle de cada medición: arranque, memoria en reposo, pruebas de carga con k6 y grabación de Java Flight Recorder.</p>
      </div>

      <div className="results-grid section">
        <div className="result-info-card full-width">
          <span className="result-label">Entorno de pruebas</span>
          <h2>{environment.date}</h2>
          <div className="env-grid">
            <div><span>Procesador</span><strong>{environment.cpu}</strong></div>
            <div><span>Núcleos / hilos</span><strong>{environment.cores} / {environment.logicalProcessors}</strong></div>
            <div><span>Memoria</span><strong>{formatNumber(environment.ramGB, 1)} GB</strong></div>
            <div><span>Sistema</span><strong>{environment.os}</strong></div>
            <div><span>Java</span><strong>{environment.java}</strong></div>
            <div><span>Opciones JVM</span><strong>{environment.jvmOptions}</strong></div>
            <div><span>Herramienta de carga</span><strong>{environment.k6}</strong></div>
            <div><span>Parámetros</span><strong>{params.startupRuns} arranques · {params.reps} repeticiones · {params.duration} por prueba · calentamiento {params.warmup}</strong></div>
          </div>
        </div>
      </div>

      <section className="section">
        <div className="section-title"><h2>1. Tiempo de arranque</h2><p>Tiempo desde que se lanza el proceso hasta la primera respuesta HTTP 200, en cada uno de los {params.startupRuns} arranques.</p></div>
        <div className="charts-grid">
          <BenchmarkChart title="Arranques individuales" description="Menos es mejor" data={startupRuns()} unit="ms" />
          <StatsTable
            title="Estadísticos del arranque"
            unit="ms"
            rows={[
              ['Mediana', 'median'], ['Media', 'mean'], ['Mínimo', 'min'], ['Máximo', 'max'], ['Desviación típica', 'stdev'],
            ].map(([label, key]) => ({ label, micronaut: startup.micronaut.firstResponseMs[key], spring: startup.spring.firstResponseMs[key] }))}
            note={`Según su propio log, Micronaut arrancó en ${formatNumber(startup.micronaut.reportedMs?.mean)} ms y Spring Boot en ${formatNumber(startup.spring.reportedMs?.mean)} ms de media.`}
          />
        </div>
      </section>

      <section className="section">
        <div className="section-title"><h2>2. Memoria en reposo</h2><p>Medida con jcmd 10 segundos después del arranque, sin carga.</p></div>
        <div className="charts-grid">
          <BenchmarkChart title="Consumo de memoria" description="Menos es mejor" data={memoryData} unit="MB" digits={1} />
          <StatsTable
            title="Otros indicadores"
            rows={[
              { label: 'Clases cargadas', micronaut: memoryIdle.micronaut.loadedClasses, spring: memoryIdle.spring.loadedClasses },
              { label: 'Hilos activos', micronaut: memoryIdle.micronaut.liveThreads, spring: memoryIdle.spring.liveThreads },
              { label: 'Heap usado antes de GC (MB)', micronaut: memoryIdle.micronaut.heapUsedMB, spring: memoryIdle.spring.heapUsedMB, digits: 1 },
              { label: 'Class space (MB)', micronaut: memoryIdle.micronaut.classSpaceUsedMB, spring: memoryIdle.spring.classSpaceUsedMB, digits: 1 },
              { label: 'Tamaño del JAR (MB)', micronaut: environment.jarSizeMB.micronaut, spring: environment.jarSizeMB.spring, digits: 1 },
            ]}
          />
        </div>
      </section>

      <section className="section">
        <div className="section-title results-load-title">
          <div><h2>3. Pruebas de carga</h2><p>k6 con usuarios constantes durante {params.duration}; media de {params.reps} repeticiones tras un calentamiento.</p></div>
          <div className="api-tabs">
            {Object.entries(endpointLabels).map(([key, label]) => (
              <button key={key} type="button" className={key === endpoint ? 'api-tab active' : 'api-tab'} onClick={() => setEndpoint(key)}>{label}</button>
            ))}
          </div>
        </div>
        <div className="charts-grid">
          <BenchmarkChart title="Peticiones por segundo" description="Más es mejor" data={loadSeries(endpoint, 'rps')} unit="req/s" />
          <BenchmarkChart title="Latencia p95" description="Menos es mejor" data={loadSeries(endpoint, 'p95Ms')} unit="ms" digits={1} />
          <BenchmarkChart title="Uso medio de CPU del proceso" description="Porcentaje del total del equipo" data={loadSeries(endpoint, 'cpuAvgPct')} unit="%" digits={1} />
          <BenchmarkChart title="Memoria media del proceso bajo carga" description="Working set · menos es mejor" data={loadSeries(endpoint, 'workingSetAvgMB')} unit="MB" />
        </div>
        <div className="comparison-table-card load-table">
          <table>
            <thead>
              <tr><th>Usuarios</th><th>Framework</th><th>req/s (± desv.)</th><th>Media</th><th>Mediana</th><th>p95</th><th>p99</th><th>Errores</th><th>CPU</th></tr>
            </thead>
            <tbody>
              {vusLevels.flatMap((vus) => frameworks.map((fw) => {
                const row = loadRow(fw, endpoint, vus)
                return (
                  <tr key={`${vus}-${fw}`} className={fw === 'micronaut' ? 'row-micronaut' : 'row-spring'}>
                    <td>{vus}</td>
                    <td>{frameworkLabels[fw]}</td>
                    <td>{formatNumber(row?.rps)} ± {formatNumber(row?.rpsStdev)}</td>
                    <td>{formatNumber(row?.avgMs, 2)} ms</td>
                    <td>{formatNumber(row?.medMs, 2)} ms</td>
                    <td>{formatNumber(row?.p95Ms, 2)} ms</td>
                    <td>{formatNumber(row?.p99Ms, 2)} ms</td>
                    <td>{formatNumber((row?.errorRate ?? 0) * 100, 2)} %</td>
                    <td>{formatNumber(row?.cpuAvgPct, 1)} %</td>
                  </tr>
                )
              }))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section">
        <div className="section-title"><h2>4. Java Flight Recorder</h2><p>Grabación durante la prueba más exigente ({scenarioLabel(jfr.micronaut?.scenario)}).</p></div>
        <StatsTable
          title="Recolección de basura (G1)"
          rows={[
            { label: 'Número de recolecciones', micronaut: jfr.micronaut?.gcCount, spring: jfr.spring?.gcCount },
            { label: 'Pausa total (ms)', micronaut: jfr.micronaut?.gcPauseTotalMs, spring: jfr.spring?.gcPauseTotalMs, digits: 1 },
            { label: 'Pausa máxima (ms)', micronaut: jfr.micronaut?.gcPauseMaxMs, spring: jfr.spring?.gcPauseMaxMs, digits: 2 },
          ]}
          note="Micronaut realiza más recolecciones porque atiende más peticiones en el mismo tiempo, pero con pausas más cortas."
        />
      </section>
    </div>
  )
}

function StatsTable({ title, rows, unit, note }) {
  return (
    <div className="chart-card stats-card">
      <div className="chart-header"><h2>{title}</h2></div>
      <table className="stats-table">
        <thead><tr><th /><th>Micronaut</th><th>Spring Boot</th></tr></thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <td>{row.label}</td>
              <td className="micronaut-text">{formatNumber(row.micronaut, row.digits ?? 0)}{unit ? ` ${unit}` : ''}</td>
              <td className="spring-text">{formatNumber(row.spring, row.digits ?? 0)}{unit ? ` ${unit}` : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {note && <p className="stats-note">{note}</p>}
    </div>
  )
}

export default Results
