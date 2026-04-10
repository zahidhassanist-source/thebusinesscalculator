'use client'
import { MonthData } from '@/app/page'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts'

interface Props {
  data: MonthData[]
  computed: { totalFixed: number; totalVariable: number; totalCost: number }[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--surface2)', border: '1px solid var(--border)',
      borderRadius: 10, padding: '12px 16px', fontSize: 12,
      fontFamily: "'DM Mono', monospace"
    }}>
      <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.color, marginBottom: 4 }}>
          {p.name}: ৳{Number(p.value).toLocaleString()}
        </div>
      ))}
      <div style={{ borderTop: '1px solid var(--border)', marginTop: 6, paddingTop: 6, color: '#fff', fontWeight: 600 }}>
        Total: ৳{payload.reduce((s: number, p: any) => s + p.value, 0).toLocaleString()}
      </div>
    </div>
  )
}

export default function SummaryChart({ data, computed }: Props) {
  const chartData = data.map((row, i) => ({
    name: row.month.slice(0, 3),
    'Fixed Cost': computed[i].totalFixed,
    'Variable Cost': computed[i].totalVariable,
  }))

  return (
    <div className="glass" style={{ borderRadius: 16, padding: '20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>
            Monthly Cost Overview
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
            Fixed + Variable breakdown across all months
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} barGap={2} barCategoryGap="25%">
          <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
          <XAxis
            dataKey="name"
            tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: "'Syne', sans-serif" }}
            axisLine={false} tickLine={false}
          />
          <YAxis
            tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: "'DM Mono', monospace" }}
            axisLine={false} tickLine={false}
            tickFormatter={v => `৳${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Legend
            wrapperStyle={{ fontSize: 12, fontFamily: "'Syne', sans-serif", color: 'var(--text-muted)', paddingTop: 8 }}
          />
          <Bar dataKey="Fixed Cost" fill="#6c63ff" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Variable Cost" fill="#ff6584" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
