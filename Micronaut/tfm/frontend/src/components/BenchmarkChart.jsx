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

import { formatNumber } from '../services/benchmarks'

const COLORS = { micronaut: '#2563eb', spring: '#16a34a' }

function BenchmarkChart({ title, description, data, xKey = 'label', unit = '', digits = 0, height = 320 }) {
  const format = (value) => `${formatNumber(value, digits)}${unit ? ` ${unit}` : ''}`

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      <div className="chart-container" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }} barGap={2} barCategoryGap="22%">
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef0f3" />
            <XAxis dataKey={xKey} interval={0} tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} />
            <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} tickLine={false} axisLine={false}
              tickFormatter={(value) => formatNumber(value, 0)} width={64}
              label={unit ? { value: unit, angle: -90, position: 'insideLeft', fill: '#9ca3af', fontSize: 11 } : undefined} />
            <Tooltip formatter={(value, name) => [format(value), name]} cursor={{ fill: 'rgba(17, 24, 39, .04)' }}
              contentStyle={{ borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 13 }} />
            <Legend wrapperStyle={{ fontSize: 13 }} />
            <Bar dataKey="micronaut" name="Micronaut" fill={COLORS.micronaut} radius={[4, 4, 0, 0]} maxBarSize={46} isAnimationActive={false} />
            <Bar dataKey="spring" name="Spring Boot" fill={COLORS.spring} radius={[4, 4, 0, 0]} maxBarSize={46} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default BenchmarkChart
