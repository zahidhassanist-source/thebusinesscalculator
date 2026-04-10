'use client'
import { ReactNode } from 'react'

interface TableWrapperProps {
  headers: { label: string; sub?: string; accent?: string }[]
  children: ReactNode
  title: string
  subtitle?: string
  accentColor?: string
}

export default function TableWrapper({ headers, children, title, subtitle, accentColor = 'var(--accent)' }: TableWrapperProps) {
  return (
    <div className="glass fade-up delay-2" style={{ borderRadius: 16, overflow: 'hidden' }}>
      <div style={{
        padding: '18px 24px',
        borderBottom: '1px solid var(--border)',
        background: 'rgba(108,99,255,0.05)',
        display: 'flex', alignItems: 'center', gap: 12
      }}>
        <div style={{ width: 3, height: 20, borderRadius: 2, background: accentColor }} />
        <div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{title}</div>
          {subtitle && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{subtitle}</div>}
        </div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--surface2)' }}>
              {headers.map((h, i) => (
                <th
                  key={i}
                  style={{
                    padding: '10px 12px',
                    textAlign: i === 0 ? 'left' : 'right',
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.05em',
                    color: h.accent || 'var(--text-muted)',
                    borderBottom: '1px solid var(--border)',
                    whiteSpace: 'nowrap',
                    fontFamily: "'Syne', sans-serif",
                  }}
                >
                  {h.label}
                  {h.sub && <div style={{ fontSize: 9, fontWeight: 400, color: 'var(--text-muted)', marginTop: 1 }}>{h.sub}</div>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  )
}
