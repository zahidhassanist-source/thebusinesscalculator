'use client'
import { MonthData } from '@/app/page'
import EditableCell from './EditableCell'
import TableWrapper from './TableWrapper'

interface Props {
  data: MonthData[]
  computed: { totalFixed: number; fixedCostContribution: number }[]
  updateCell: (i: number, field: keyof MonthData, v: number) => void
}

const ROW_COLORS = [
  'transparent',
  'rgba(108,99,255,0.03)',
]

export default function FixedCostTab({ data, computed, updateCell }: Props) {
  const annualTotal = computed.reduce((s, r) => s + r.totalFixed, 0)
  const annualSales = data.reduce((s, r) => s + r.plannedSalesVolume, 0)

  const headers = [
    { label: 'Month' },
    { label: 'House Rent', sub: 'editable' },
    { label: 'Electricity', sub: 'editable' },
    { label: 'Internet', sub: 'editable' },
    { label: 'Salary / Benefits', sub: 'editable' },
    { label: 'Misc.', sub: 'editable' },
    { label: 'Total Fixed', accent: 'var(--accent)' },
    { label: 'Planned Sales Vol.', sub: 'editable' },
    { label: 'FC / Unit', sub: 'auto-calculated', accent: 'var(--accent3)' },
  ]

  return (
    <div>
      {/* Quick stats */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: 'Annual Fixed Cost', value: `৳${annualTotal.toLocaleString()}`, color: 'var(--accent)' },
          { label: 'Total Sales Volume', value: annualSales.toLocaleString() + ' units', color: 'var(--accent3)' },
          { label: 'Avg FC/Month', value: `৳${Math.round(annualTotal / 12).toLocaleString()}`, color: 'var(--accent2)' },
        ].map(s => (
          <div key={s.label} className="glass" style={{ borderRadius: 10, padding: '12px 18px', flex: '1', minWidth: 160 }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <TableWrapper
        title="Fixed Cost Sheet"
        subtitle="Click any cell to edit — totals recalculate automatically"
        headers={headers}
        accentColor="var(--accent)"
      >
        {data.map((row, i) => {
          const c = computed[i]
          return (
            <tr
              key={row.month}
              style={{ background: ROW_COLORS[i % 2], borderBottom: '1px solid rgba(42,42,58,0.5)', transition: 'background 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(108,99,255,0.07)')}
              onMouseLeave={e => (e.currentTarget.style.background = ROW_COLORS[i % 2])}
            >
              <td style={{ padding: '8px 12px', fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                {row.month}
              </td>
              <td style={{ padding: '4px 6px' }}>
                <EditableCell value={row.houseRent} onChange={v => updateCell(i, 'houseRent', v)} />
              </td>
              <td style={{ padding: '4px 6px' }}>
                <EditableCell value={row.electricityBill} onChange={v => updateCell(i, 'electricityBill', v)} />
              </td>
              <td style={{ padding: '4px 6px' }}>
                <EditableCell value={row.internetBill} onChange={v => updateCell(i, 'internetBill', v)} />
              </td>
              <td style={{ padding: '4px 6px' }}>
                <EditableCell value={row.salaryBenefits} onChange={v => updateCell(i, 'salaryBenefits', v)} />
              </td>
              <td style={{ padding: '4px 6px' }}>
                <EditableCell value={row.miscFixed} onChange={v => updateCell(i, 'miscFixed', v)} />
              </td>
              <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: 'var(--accent)', fontFamily: "'Syne', sans-serif" }}>
                ৳{c.totalFixed.toLocaleString()}
              </td>
              <td style={{ padding: '4px 6px' }}>
                <EditableCell value={row.plannedSalesVolume} onChange={v => updateCell(i, 'plannedSalesVolume', v)} prefix="" />
              </td>
              <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, color: 'var(--accent3)', fontFamily: "'DM Mono', monospace" }}>
                ৳{c.fixedCostContribution.toFixed(2)}
              </td>
            </tr>
          )
        })}
        {/* Totals row */}
        <tr style={{ background: 'rgba(108,99,255,0.1)', borderTop: '2px solid var(--accent)' }}>
          <td style={{ padding: '10px 12px', fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 12, color: 'var(--accent)' }}>ANNUAL</td>
          <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-muted)', fontSize: 12 }}>
            ৳{data.reduce((s, r) => s + r.houseRent, 0).toLocaleString()}
          </td>
          <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-muted)', fontSize: 12 }}>
            ৳{data.reduce((s, r) => s + r.electricityBill, 0).toLocaleString()}
          </td>
          <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-muted)', fontSize: 12 }}>
            ৳{data.reduce((s, r) => s + r.internetBill, 0).toLocaleString()}
          </td>
          <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-muted)', fontSize: 12 }}>
            ৳{data.reduce((s, r) => s + r.salaryBenefits, 0).toLocaleString()}
          </td>
          <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-muted)', fontSize: 12 }}>
            ৳{data.reduce((s, r) => s + r.miscFixed, 0).toLocaleString()}
          </td>
          <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 15, color: 'var(--accent)' }}>
            ৳{annualTotal.toLocaleString()}
          </td>
          <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-muted)', fontSize: 12 }}>
            {annualSales.toLocaleString()}
          </td>
          <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-muted)', fontSize: 12 }}>—</td>
        </tr>
      </TableWrapper>
    </div>
  )
}
