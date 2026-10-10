import BenchmarkChart from '../components/BenchmarkChart'
import MetricCard from '../components/MetricCard'

function Dashboard() {
  const chartData = [
    { metric: 'Latencia', micronaut: 125, spring: 148 },
    { metric: 'Memoria', micronaut: 180, spring: 310 },
    { metric: 'CPU', micronaut: 32, spring: 41 },
    { metric: 'Req/s', micronaut: 820, spring: 710 },
  ]

  return (
    <div className="dashboard">
      <section className="dashboard-header">
        <div>
          <div className="eyebrow">BENCHMARK DE FRAMEWORKS BACKEND</div>
          <h1>Micronaut <span>vs</span> Spring Boot</h1>
          <p>Comparación de rendimiento entre dos de los principales frameworks para el desarrollo de aplicaciones backend con Java.</p>
        </div>
        <div className="benchmark-status"><span className="status-dot" />Benchmark activo</div>
      </section>

      <section className="framework-cards">
        <div className="framework-card micronaut-card">
          <div className="framework-card-top"><div className="framework-logo micronaut-logo">M</div><div><h2>Micronaut</h2><span>Framework JVM</span></div></div>
          <div className="framework-result"><span>Rendimiento</span><strong>Superior</strong></div>
          <div className="framework-tags"><span>Bajo consumo</span><span>Inicio rápido</span></div>
        </div>
        <div className="framework-card spring-card">
          <div className="framework-card-top"><div className="framework-logo spring-logo">S</div><div><h2>Spring Boot</h2><span>Framework JVM</span></div></div>
          <div className="framework-result"><span>Rendimiento</span><strong>Referencia</strong></div>
          <div className="framework-tags"><span>Ecosistema amplio</span><span>Alta madurez</span></div>
        </div>
      </section>

      <section className="section">
        <div className="section-title"><h2>Métricas principales</h2><p>Datos de ejemplo para visualizar el dashboard.</p></div>
        <div className="metrics-grid">
          <MetricCard title="Latencia" description="Tiempo medio de respuesta" micronaut="125" spring="148" unit=" ms" icon="⚡" />
          <MetricCard title="Memoria" description="Consumo de memoria" micronaut="180" spring="310" unit=" MB" icon="◈" />
          <MetricCard title="CPU" description="Uso medio del procesador" micronaut="32" spring="41" unit="%" icon="◉" />
          <MetricCard title="Throughput" description="Peticiones procesadas" micronaut="820" spring="710" unit=" req/s" icon="↗" />
        </div>
      </section>

      <section className="section"><BenchmarkChart title="Comparación de rendimiento" description="Valores de referencia utilizados para construir la interfaz." data={chartData} /></section>

      <section className="summary-card"><div className="summary-icon">✓</div><div><h2>Resultado preliminar</h2><p>En este ejemplo, Micronaut presenta menor latencia, menor consumo de memoria y mayor throughput. Estos valores serán sustituidos posteriormente por los resultados reales del benchmark.</p></div></section>
    </div>
  )
}

export default Dashboard
