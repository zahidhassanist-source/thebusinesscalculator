'use client'
import { MonthData } from '@/app/page'
import EditableCell from './EditableCell'
import TableWrapper from './TableWrapper'

interface Props {
  data: MonthData[]
  computed: { totalVariable: number; variableCostPerUnit: number }[]
  updateCell: (i: number, field: keyof MonthData, v: number) => void
}

const ROW_COLORS = ['transparent', 'rgba(255,101,132,0.03)']

export default function VariableCostTab({ data, computed, updateCell }: Props) {
  const annualTotal = computed.reduce((s, r) => s + r.totalVariable, 0)

  const headers = [
    { label: 'Month' },
    { label: 'Raw Materials', sub: 'editable' },
    { label: 'Packaging', sub: 'editable' },
    { label: 'Shipping', sub: 'editable' },
    { label: 'Commissions', sub: 'editable' },
    { label: 'Misc.', sub: 'editable' },
    { label: 'Total Variable', accent: 'var(--accent2)' },
    { label: 'Sales Volume', sub: 'from fixed tab' },
    { label: 'VC / Unit', sub: 'auto-calculated', accent: 'var(--accent3)' },
  ]

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: 'Annual Variable Cost', value: `৳${annualTotal.toLocaleString()}`, color: 'var(--accent2)' },
          { label: 'Avg VC/Month', value: `৳${Math.round(annualTotal / 12).toLocaleString()}`, color: 'var(--accent)' },
          { label: 'Total Sales Volume', value: data.reduce((s, r) => s + r.plannedSalesVolume, 0).toLocaleString() + ' units', color: 'var(--accent3)' },
        ].map(s => (
          <div key={s.label} className="glass" style={{ borderRadius: 10, padding: '12px 18px', flex: '1', minWidth: 160 }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <TableWrapper
        title="Variable Cost Sheet"
        subtitle="Variable costs change with production volume — edit cells freely"
        headers={headers}
        accentColor="var(--accent2)"
      >
        {data.map((row, i) => {
          const c = computed[i]
          return (
            <tr
              key={row.month}
              style={{ background: ROW_COLORS[i % 2], borderBottom: '1px solid rgba(42,42,58,0.5)', transition: 'background 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,101,132,0.07)')}
              onMouseLeave={e => (e.currentTarget.style.background = ROW_COLORS[i % 2])}
            >
              <td style={{ padding: '8px 12px', fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                {row.month}
              </td>
              <td style={{ padding: '4px 6px' }}>
                <EditableCell value={row.rawMaterials} onChange={v => updateCell(i, 'rawMaterials', v)} />
              </td>
              <td style={{ padding: '4px 6px' }}>
                <EditableCell value={row.packaging} onChange={v => updateCell(i, 'packaging', v)} />
              </td>
              <td style={{ padding: '4px 6px' }}>
                <EditableCell value={row.shipping} onChange={v => updateCell(i, 'shipping', v)} />
              </td>
              <td style={{ padding: '4px 6px' }}>
                <EditableCell value={row.commissions} onChange={v => updateCell(i, 'commissions', v)} />
              </td>
              <td style={{ padding: '4px 6px' }}>
                <EditableCell value={row.miscVariable} onChange={v => updateCell(i, 'miscVariable', v)} />
              </td>
              <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: 'var(--accent2)', fontFamily: "'Syne', sans-serif" }}>
                ৳{c.totalVariable.toLocaleString()}
              </td>
              <td style={{ padding: '8px 12px', textAlign: 'right', fontSize: 12, color: 'var(--text-muted)' }}>
                {row.plannedSalesVolume.toLocaleString()}
              </td>
              <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, color: 'var(--accent3)', fontFamily: "'DM Mono', monospace" }}>
                ৳{c.variableCostPerUnit.toFixed(2)}
              </td>
            </tr>
          )
        })}
        <tr style={{ background: 'rgba(255,101,132,0.1)', borderTop: '2px solid var(--accent2)' }}>
          <td style={{ padding: '10px 12px', fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 12, color: 'var(--accent2)' }}>ANNUAL</td>
          <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-muted)', fontSize: 12 }}>৳{data.reduce((s, r) => s + r.rawMaterials, 0).toLocaleString()}</td>
          <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-muted)', fontSize: 12 }}>৳{data.reduce((s, r) => s + r.packaging, 0).toLocaleString()}</td>
          <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-muted)', fontSize: 12 }}>৳{data.reduce((s, r) => s + r.shipping, 0).toLocaleString()}</td>
          <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-muted)', fontSize: 12 }}>৳{data.reduce((s, r) => s + r.commissions, 0).toLocaleString()}</td>
          <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-muted)', fontSize: 12 }}>৳{data.reduce((s, r) => s + r.miscVariable, 0).toLocaleString()}</td>
          <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 15, color: 'var(--accent2)' }}>৳{annualTotal.toLocaleString()}</td>
          <td colSpan={2} style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text-muted)', fontSize: 12 }}>—</td>
        </tr>
      </TableWrapper>
    </div>
  )
}
