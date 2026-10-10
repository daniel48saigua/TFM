import BenchmarkChart from '../components/BenchmarkChart'
import MetricCard from '../components/MetricCard'
import {
  compare,
  formatNumber,
  loadRow,
  loadSeries,
  summary,
  throughputRatioRange,
  winsCount,
} from '../services/benchmarks'

const HEADLINE_VUS = 100

function Dashboard() {
  const { startup, memoryIdle, environment } = summary
  const smallM = loadRow('micronaut', 'small', HEADLINE_VUS)
  const smallS = loadRow('spring', 'small', HEADLINE_VUS)
  const wins = winsCount()
  const ratio = throughputRatioRange()
  const startupRatio = compare(startup.micronaut.firstResponseMs.median, startup.spring.firstResponseMs.median, false).ratio
  const memoryDiff = compare(memoryIdle.micronaut.workingSetMB, memoryIdle.spring.workingSetMB, false).diffPct

  return (
    <div className="dashboard">
      <section className="dashboard-header">
        <div>
          <div className="eyebrow">BENCHMARK DE FRAMEWORKS BACKEND</div>
          <h1>Micronaut <span>vs</span> Spring Boot</h1>
          <p>Resultados reales de las pruebas experimentales: tiempo de arranque, consumo de memoria y rendimiento bajo carga de dos APIs REST funcionalmente equivalentes sobre la misma base de datos PostgreSQL.</p>
        </div>
        <div className="benchmark-status"><span className="status-dot" />Medición del {environment.date}</div>
      </section>

      <section className="framework-cards">
        <div className="framework-card micronaut-card">
          <div className="framework-card-top"><div className="framework-logo micronaut-logo">M</div><div><h2>Micronaut</h2><span>Inyección de dependencias en compilación</span></div></div>
          <div className="framework-result"><span>Mejor resultado en</span><strong>{wins.micronaut} de {wins.total} métricas</strong></div>
          <div className="framework-tags"><span>JAR {formatNumber(environment.jarSizeMB.micronaut, 1)} MB</span><span>{formatNumber(memoryIdle.micronaut.loadedClasses)} clases cargadas</span></div>
        </div>
        <div className="framework-card spring-card">
          <div className="framework-card-top"><div className="framework-logo spring-logo">S</div><div><h2>Spring Boot</h2><span>Framework de referencia</span></div></div>
          <div className="framework-result"><span>Mejor resultado en</span><strong>{wins.spring} de {wins.total} métricas</strong></div>
          <div className="framework-tags"><span>JAR {formatNumber(environment.jarSizeMB.spring, 1)} MB</span><span>{formatNumber(memoryIdle.spring.loadedClasses)} clases cargadas</span></div>
        </div>
      </section>

      <section className="section">
        <div className="section-title"><h2>Métricas principales</h2><p>La carga corresponde a la respuesta pequeña con {HEADLINE_VUS} usuarios simultáneos (media de {smallM?.reps} repeticiones).</p></div>
        <div className="metrics-grid">
          <MetricCard title="Arranque" description="Mediana hasta la primera respuesta" icon="⏱"
            micronaut={formatNumber(startup.micronaut.firstResponseMs.median / 1000, 2)} spring={formatNumber(startup.spring.firstResponseMs.median / 1000, 2)} unit=" s" />
          <MetricCard title="Memoria" description="Proceso en reposo" icon="◈"
            micronaut={formatNumber(memoryIdle.micronaut.workingSetMB)} spring={formatNumber(memoryIdle.spring.workingSetMB)} unit=" MB" />
          <MetricCard title="Throughput" description="Peticiones por segundo" icon="↗"
            micronaut={formatNumber(smallM?.rps)} spring={formatNumber(smallS?.rps)} unit=" req/s" />
          <MetricCard title="Latencia p95" description="95 % de las peticiones por debajo de" icon="⚡"
            micronaut={formatNumber(smallM?.p95Ms, 1)} spring={formatNumber(smallS?.p95Ms, 1)} unit=" ms" />
        </div>
      </section>

      <section className="section charts-grid">
        <BenchmarkChart title="Peticiones por segundo — respuesta pequeña" description="GET /api/teams/1 · más es mejor" data={loadSeries('small', 'rps')} unit="req/s" />
        <BenchmarkChart title="Peticiones por segundo — respuesta grande" description="GET /api/teams (1000 registros) · más es mejor" data={loadSeries('large', 'rps')} unit="req/s" />
      </section>

      <section className="summary-card">
        <div className="summary-icon">✓</div>
        <div>
          <h2>Resultado</h2>
          <p>
            En estas pruebas Micronaut arrancó {formatNumber(startupRatio, 1)} veces más rápido (mediana), usó un {formatNumber(Math.abs(memoryDiff))} % menos de memoria en reposo
            y procesó entre {formatNumber(ratio.min, 1)} y {formatNumber(ratio.max, 1)} veces más peticiones por segundo que Spring Boot, sin errores HTTP en ninguno de los dos.
            Los resultados corresponden a un único equipo ({environment.cpu}, {formatNumber(environment.ramGB, 0)} GB de RAM) con k6, la aplicación y PostgreSQL ejecutándose en la misma máquina.
          </p>
        </div>
      </section>
    </div>
  )
}

export default Dashboard
