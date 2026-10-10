import { compare, comparisonGroups, formatNumber, frameworkLabels } from '../services/benchmarks'

function Comparison() {
  return (
    <div className="page-container">
      <div className="page-header">
        <div className="eyebrow">ANÁLISIS COMPARATIVO</div>
        <h1>Comparación</h1>
        <p>Todas las métricas medidas, con la diferencia relativa de Micronaut respecto a Spring Boot. En cada fila se indica si un valor mayor o menor es mejor.</p>
      </div>
      <div className="comparison-table-card">
        <table>
          <thead>
            <tr><th>Métrica</th><th>Micronaut</th><th>Spring Boot</th><th>Diferencia</th><th>Mejor resultado</th></tr>
          </thead>
          {comparisonGroups.map((group) => (
            <tbody key={group.title}>
              <tr className="group-row"><td colSpan={5}>{group.title}</td></tr>
              {group.rows.map((row) => {
                const { diffPct, winner } = compare(row.micronaut, row.spring, row.higherIsBetter)
                const unit = row.unit ? ` ${row.unit}` : ''
                return (
                  <tr key={row.label}>
                    <td>
                      {row.label}
                      <span className="metric-direction">{row.higherIsBetter ? 'más es mejor' : 'menos es mejor'}</span>
                    </td>
                    <td>{formatNumber(row.micronaut, row.digits)}{unit}</td>
                    <td>{formatNumber(row.spring, row.digits)}{unit}</td>
                    <td className="diff-cell">{diffPct === null ? '—' : `${diffPct > 0 ? '+' : ''}${formatNumber(diffPct, 1)} %`}</td>
                    <td className="winner">{winner ? frameworkLabels[winner] : 'Empate'}</td>
                  </tr>
                )
              })}
            </tbody>
          ))}
        </table>
      </div>
    </div>
  )
}

export default Comparison
