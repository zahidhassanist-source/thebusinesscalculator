'use client'
import { MonthData } from '@/app/page'
import TableWrapper from './TableWrapper'

interface Props {
  data: MonthData[]
  computed: {
    totalFixed: number
    totalVariable: number
    totalCost: number
    fixedCostContribution: number
    variableCostPerUnit: number
    totalCostPerUnit: number
  }[]
  updateCell: (i: number, field: keyof MonthData, v: number) => void
}

const ROW_COLORS = ['transparent', 'rgba(67,233,123,0.03)']

export default function TotalCostTab({ data, computed }: Props) {
  const annualFixed = computed.reduce((s, r) => s + r.totalFixed, 0)
  const annualVariable = computed.reduce((s, r) => s + r.totalVariable, 0)
  const annualTotal = computed.reduce((s, r) => s + r.totalCost, 0)
  const annualSales = data.reduce((s, r) => s + r.plannedSalesVolume, 0)
  const avgCostPerUnit = annualSales > 0 ? annualTotal / annualSales : 0

  const headers = [
    { label: 'Month' },
    { label: 'Total Fixed Cost', accent: 'var(--accent)' },
    { label: 'Total Variable Cost', accent: 'var(--accent2)' },
    { label: 'Total Cost', accent: 'var(--accent3)' },
    { label: 'Sales Volume' },
    { label: 'FC / Unit', sub: 'auto' },
    { label: 'VC / Unit', sub: 'auto' },
    { label: 'Total Cost / Unit', sub: 'auto', accent: 'var(--accent3)' },
    { label: 'Fixed %', sub: 'of total' },
  ]

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: 'Total Fixed (Annual)', value: `৳${annualFixed.toLocaleString()}`, color: 'var(--accent)' },
          { label: 'Total Variable (Annual)', value: `৳${annualVariable.toLocaleString()}`, color: 'var(--accent2)' },
          { label: 'Grand Total (Annual)', value: `৳${annualTotal.toLocaleString()}`, color: 'var(--accent3)' },
          { label: 'Avg Cost Per Unit', value: `৳${avgCostPerUnit.toFixed(2)}`, color: '#fff' },
        ].map(s => (
          <div key={s.label} className="glass" style={{ borderRadius: 10, padding: '12px 18px', flex: '1', minWidth: 160 }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Cost breakdown visual */}
      <div className="glass" style={{ borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10, fontFamily: "'Syne', sans-serif", fontWeight: 600 }}>
          ANNUAL COST BREAKDOWN
        </div>
        <div style={{ display: 'flex', height: 20, borderRadius: 6, overflow: 'hidden', gap: 2 }}>
          <div style={{
            flex: annualFixed,
            background: 'linear-gradient(90deg, var(--accent), #8b84ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, color: '#fff', fontWeight: 600, minWidth: 40
          }}>
            {((annualFixed / annualTotal) * 100).toFixed(1)}%
          </div>
          <div style={{
            flex: annualVariable,
            background: 'linear-gradient(90deg, var(--accent2), #ff8fa3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, color: '#fff', fontWeight: 600, minWidth: 40
          }}>
            {((annualVariable / annualTotal) * 100).toFixed(1)}%
          </div>
        </div>
        <div style={{ display: 'flex', gap: 20, marginTop: 8, fontSize: 11 }}>
          <span style={{ color: 'var(--accent)' }}>■ Fixed Cost</span>
          <span style={{ color: 'var(--accent2)' }}>■ Variable Cost</span>
        </div>
      </div>

      <TableWrapper
        title="Total Cost Summary"
        subtitle="All figures auto-calculated from Fixed and Variable tabs"
        headers={headers}
        accentColor="var(--accent3)"
      >
        {data.map((row, i) => {
          const c = computed[i]
          const fixedPct = c.totalCost > 0 ? ((c.totalFixed / c.totalCost) * 100).toFixed(1) : '0.0'
          return (
            <tr
              key={row.month}
              style={{ background: ROW_COLORS[i % 2], borderBottom: '1px solid rgba(42,42,58,0.5)', transition: 'background 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(67,233,123,0.07)')}
              onMouseLeave={e => (e.currentTarget.style.background = ROW_COLORS[i % 2])}
            >
              <td style={{ padding: '8px 12px', fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                {row.month}
              </td>
              <td style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--accent)', fontWeight: 600 }}>
                ৳{c.totalFixed.toLocaleString()}
              </td>
              <td style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--accent2)', fontWeight: 600 }}>
                ৳{c.totalVariable.toLocaleString()}
              </td>
              <td style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--accent3)', fontWeight: 700, fontFamily: "'Syne', sans-serif", fontSize: 14 }}>
                ৳{c.totalCost.toLocaleString()}
              </td>
              <td style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--text-muted)', fontSize: 12 }}>
                {row.plannedSalesVolume.toLocaleString()}
              </td>
              <td style={{ padding: '8px 12px', textAlign: 'right', fontSize: 12, color: 'var(--accent)' }}>
                ৳{c.fixedCostContribution.toFixed(2)}
              </td>
              <td style={{ padding: '8px 12px', textAlign: 'right', fontSize: 12, color: 'var(--accent2)' }}>
                ৳{c.variableCostPerUnit.toFixed(2)}
              </td>
              <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: 'var(--accent3)', fontFamily: "'DM Mono', monospace" }}>
                ৳{c.totalCostPerUnit.toFixed(2)}
              </td>
              <td style={{ padding: '8px 12px', textAlign: 'right', fontSize: 12 }}>
                <span style={{
                  padding: '2px 7px', borderRadius: 4,
                  background: parseFloat(fixedPct) > 60 ? 'rgba(108,99,255,0.2)' : 'rgba(67,233,123,0.15)',
                  color: parseFloat(fixedPct) > 60 ? 'var(--accent)' : 'var(--accent3)',
                  fontWeight: 600, fontSize: 11
                }}>
                  {fixedPct}%
                </span>
              </td>
            </tr>
          )
        })}
        <tr style={{ background: 'rgba(67,233,123,0.08)', borderTop: '2px solid var(--accent3)' }}>
          <td style={{ padding: '10px 12px', fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 12, color: 'var(--accent3)' }}>ANNUAL</td>
          <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: "'Syne', sans-serif", fontWeight: 700, color: 'var(--accent)' }}>৳{annualFixed.toLocaleString()}</td>
          <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: "'Syne', sans-serif", fontWeight: 700, color: 'var(--accent2)' }}>৳{annualVariable.toLocaleString()}</td>
          <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 15, color: 'var(--accent3)' }}>৳{annualTotal.toLocaleString()}</td>
          <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-muted)', fontSize: 12 }}>{annualSales.toLocaleString()}</td>
          <td colSpan={3} style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-muted)', fontSize: 12 }}>
            Avg: ৳{avgCostPerUnit.toFixed(2)}/unit
          </td>
          <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-muted)', fontSize: 12 }}>
            {((annualFixed / annualTotal) * 100).toFixed(1)}%
          </td>
        </tr>
      </TableWrapper>
    </div>
  )
}
