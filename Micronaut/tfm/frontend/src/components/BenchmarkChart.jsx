import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

function BenchmarkChart({ title, description, data }) {
  return (
    <div className="chart-card">
      <div className="chart-header">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="metric" tick={{ fontSize: 13 }} />
            <YAxis tick={{ fontSize: 13 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="micronaut" name="Micronaut" fill="#2563eb" radius={[6, 6, 0, 0]} />
            <Bar dataKey="spring" name="Spring Boot" fill="#16a34a" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default BenchmarkChart
