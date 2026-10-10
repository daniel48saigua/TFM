function Comparison() {
  return (
    <div className="page-container">
      <div className="page-header"><div className="eyebrow">ANÁLISIS COMPARATIVO</div><h1>Comparación</h1><p>Comparación detallada de las métricas obtenidas durante las pruebas de rendimiento.</p></div>
      <div className="comparison-table-card">
        <table><thead><tr><th>Métrica</th><th>Micronaut</th><th>Spring Boot</th><th>Mejor resultado</th></tr></thead><tbody>
          <tr><td>Latencia</td><td>125 ms</td><td>148 ms</td><td className="winner">Micronaut</td></tr>
          <tr><td>Memoria</td><td>180 MB</td><td>310 MB</td><td className="winner">Micronaut</td></tr>
          <tr><td>CPU</td><td>32%</td><td>41%</td><td className="winner">Micronaut</td></tr>
          <tr><td>Throughput</td><td>820 req/s</td><td>710 req/s</td><td className="winner">Micronaut</td></tr>
        </tbody></table>
      </div>
    </div>
  )
}

export default Comparison
