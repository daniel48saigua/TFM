function MetricCard({ title, micronaut, spring, unit, icon, description }) {
  return (
    <article className="metric-card">
      <div className="metric-card-header">
        <div>
          <div className="metric-title">{title}</div>
          <div className="metric-description">{description}</div>
        </div>
        <div className="metric-icon">{icon}</div>
      </div>
      <div className="metric-values">
        <div className="framework-value micronaut-value">
          <span className="framework-name">Micronaut</span>
          <span className="metric-number">{micronaut}<small>{unit}</small></span>
        </div>
        <div className="metric-divider" />
        <div className="framework-value spring-value">
          <span className="framework-name">Spring Boot</span>
          <span className="metric-number">{spring}<small>{unit}</small></span>
        </div>
      </div>
    </article>
  )
}

export default MetricCard
