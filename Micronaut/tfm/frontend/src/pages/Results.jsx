function Results() {
  return (
    <div className="page-container">
      <div className="page-header"><div className="eyebrow">RESULTADOS DEL BENCHMARK</div><h1>Resultados</h1><p>En esta sección se mostrarán los resultados obtenidos durante las pruebas experimentales.</p></div>
      <div className="results-grid">
        <div className="result-info-card"><span className="result-label">Framework</span><h2>Micronaut</h2><p>Resultados obtenidos mediante las pruebas de rendimiento configuradas.</p></div>
        <div className="result-info-card"><span className="result-label">Framework</span><h2>Spring Boot</h2><p>Resultados obtenidos mediante las pruebas de rendimiento configuradas.</p></div>
        <div className="result-info-card full-width"><span className="result-label">Estado</span><h2>Datos simulados</h2><p>Los valores mostrados actualmente son únicamente de demostración. En la siguiente fase serán reemplazados por los datos reales obtenidos de los benchmarks.</p></div>
      </div>
    </div>
  )
}

export default Results
