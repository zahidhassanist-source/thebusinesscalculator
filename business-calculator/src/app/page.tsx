'use client'
import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

const FIXED_CATEGORIES = ['House Rent','Electricity Bill','Internet Bill','Salary & Benefits','Insurance','Office Supplies','Equipment Lease','Software Subscriptions','Loan Repayment','Other Fixed']
const VARIABLE_CATEGORIES = ['Raw Materials','Packaging','Shipping & Delivery','Sales Commissions','Marketing & Ads','Fuel & Transport','Freelancer Fees','Utilities (Variable)','Other Variable']

type CostEntry = { id: string; category: string; amount: number; type: 'fixed'|'variable' }
type MonthData = { salesVolume: number; entries: CostEntry[] }

const emptyMonth = (): MonthData => ({ salesVolume: 0, entries: [] })

function fmt(n: number) {
  return '$' + Math.round(n).toLocaleString('en-US')
}

export default function Home() {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const [months, setMonths] = useState<MonthData[]>(MONTHS.map(() => emptyMonth()))
  const [activeMonth, setActiveMonth] = useState(0)
  const [activeTab, setActiveTab] = useState<'fixed'|'variable'|'summary'>('fixed')
  const [addCat, setAddCat] = useState('')
  const [addAmt, setAddAmt] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => { if (!isLoading && !user) router.push('/login') }, [user, isLoading, router])

  if (isLoading || !user) return (
    <div style={{ minHeight: '100vh', background: '#f8f7f4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 14, color: '#9e9b96' }}>Loading...</div>
    </div>
  )

  const cur = months[activeMonth]
  const fixedEntries = cur.entries.filter(e => e.type === 'fixed')
  const variableEntries = cur.entries.filter(e => e.type === 'variable')
  const totalFixed = fixedEntries.reduce((s, e) => s + e.amount, 0)
  const totalVariable = variableEntries.reduce((s, e) => s + e.amount, 0)
  const totalCost = totalFixed + totalVariable
  const fcUnit = cur.salesVolume > 0 ? totalFixed / cur.salesVolume : 0
  const vcUnit = cur.salesVolume > 0 ? totalVariable / cur.salesVolume : 0
  const tcUnit = cur.salesVolume > 0 ? totalCost / cur.salesVolume : 0

  const annual = useMemo(() => {
    const tf = months.reduce((s, m) => s + m.entries.filter(e => e.type==='fixed').reduce((ss,e)=>ss+e.amount,0), 0)
    const tv = months.reduce((s, m) => s + m.entries.filter(e => e.type==='variable').reduce((ss,e)=>ss+e.amount,0), 0)
    const sv = months.reduce((s, m) => s + m.salesVolume, 0)
    return { tf, tv, tc: tf+tv, sv }
  }, [months])

  const addEntry = () => {
    if (!addCat || !addAmt || parseFloat(addAmt) <= 0) return
    const entry: CostEntry = {
      id: Math.random().toString(36).slice(2),
      category: addCat,
      amount: parseFloat(addAmt),
      type: activeTab as 'fixed'|'variable',
    }
    setMonths(prev => prev.map((m, i) => i === activeMonth ? { ...m, entries: [...m.entries, entry] } : m))
    setAddCat(''); setAddAmt('')
  }

  const removeEntry = (id: string) => {
    setMonths(prev => prev.map((m, i) => i === activeMonth ? { ...m, entries: m.entries.filter(e => e.id !== id) } : m))
  }

  const updateSales = (v: string) => {
    const n = parseFloat(v) || 0
    setMonths(prev => prev.map((m, i) => i === activeMonth ? { ...m, salesVolume: n } : m))
  }

  const downloadReport = () => {
    const lines: string[] = []
    lines.push('BIZCALC — ANNUAL COST REPORT')
    lines.push('================================')
    lines.push('')
    MONTHS.forEach((name, i) => {
      const m = months[i]
      const tf = m.entries.filter(e=>e.type==='fixed').reduce((s,e)=>s+e.amount,0)
      const tv = m.entries.filter(e=>e.type==='variable').reduce((s,e)=>s+e.amount,0)
      if (tf === 0 && tv === 0 && m.salesVolume === 0) return
      lines.push(`${name.toUpperCase()}`)
      lines.push(`  Sales Volume: ${m.salesVolume} units`)
      lines.push(`  Fixed Costs: $${tf.toLocaleString()}`)
      m.entries.filter(e=>e.type==='fixed').forEach(e => lines.push(`    - ${e.category}: $${e.amount.toLocaleString()}`))
      lines.push(`  Variable Costs: $${tv.toLocaleString()}`)
      m.entries.filter(e=>e.type==='variable').forEach(e => lines.push(`    - ${e.category}: $${e.amount.toLocaleString()}`))
      lines.push(`  Total: $${(tf+tv).toLocaleString()}`)
      if (m.salesVolume > 0) lines.push(`  Cost/Unit: $${((tf+tv)/m.salesVolume).toFixed(2)}`)
      lines.push('')
    })
    lines.push('ANNUAL SUMMARY')
    lines.push('==============')
    lines.push(`Total Fixed:    $${annual.tf.toLocaleString()}`)
    lines.push(`Total Variable: $${annual.tv.toLocaleString()}`)
    lines.push(`Grand Total:    $${annual.tc.toLocaleString()}`)
    lines.push(`Total Volume:   ${annual.sv.toLocaleString()} units`)
    if (annual.sv > 0) lines.push(`Avg Cost/Unit:  $${(annual.tc/annual.sv).toFixed(2)}`)

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'BizCalc-Annual-Report.txt'; a.click()
    URL.revokeObjectURL(url)
  }

  const cats = activeTab === 'fixed' ? FIXED_CATEGORIES : VARIABLE_CATEGORIES
  const entries = activeTab === 'fixed' ? fixedEntries : variableEntries
  const tabTotal = activeTab === 'fixed' ? totalFixed : totalVariable

  return (
    <div style={{ minHeight: '100vh', background: '#f8f7f4', opacity: mounted ? 1 : 0, transition: 'opacity 0.4s ease' }}>
      {/* Header */}
      <header style={{ background: '#fff', borderBottom: '1px solid #e5e3de', padding: '0 32px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, background: '#1a1916', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700 }}>B</div>
            <span style={{ fontWeight: 700, fontSize: 16, color: '#1a1916', letterSpacing: '-0.3px' }}>BizCalc</span>
          </div>

          {/* Annual stats */}
          <div style={{ display: 'flex', gap: 32 }}>
            {[
              { label: 'Annual Fixed', value: fmt(annual.tf), color: '#1a1916' },
              { label: 'Annual Variable', value: fmt(annual.tv), color: '#6b6860' },
              { label: 'Grand Total', value: fmt(annual.tc), color: '#1a7a4a' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#9e9b96', marginBottom: 2 }}>{s.label}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={downloadReport} style={{ padding: '8px 16px', borderRadius: 8, border: '1.5px solid #e5e3de', background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#1a1916', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#f2f1ee' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#fff' }}>
              ↓ Download Report
            </button>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1a1916', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700 }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1916' }}>{user.name}</div>
              <div style={{ fontSize: 11, color: '#9e9b96' }}>{user.email}</div>
            </div>
            <button onClick={() => { logout(); router.push('/login') }} style={{ padding: '6px 12px', borderRadius: 7, border: '1.5px solid #e5e3de', background: 'transparent', cursor: 'pointer', fontSize: 12, color: '#6b6860', fontFamily: 'inherit', transition: 'all 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#1a1916'; (e.currentTarget as HTMLButtonElement).style.color = '#1a1916' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#e5e3de'; (e.currentTarget as HTMLButtonElement).style.color = '#6b6860' }}>
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 32px' }}>
        {/* Month selector */}
        <div className="fade-up" style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, color: '#9e9b96', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Select Month</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {MONTHS.map((m, i) => {
              const mf = months[i].entries.filter(e=>e.type==='fixed').reduce((s,e)=>s+e.amount,0)
              const mv = months[i].entries.filter(e=>e.type==='variable').reduce((s,e)=>s+e.amount,0)
              const hasData = mf+mv > 0
              return (
                <button key={m} onClick={() => setActiveMonth(i)} style={{
                  padding: '8px 14px', borderRadius: 8, border: `1.5px solid ${activeMonth === i ? '#1a1916' : '#e5e3de'}`,
                  background: activeMonth === i ? '#1a1916' : hasData ? '#f8f7f4' : '#fff',
                  color: activeMonth === i ? '#fff' : hasData ? '#1a1916' : '#6b6860',
                  cursor: 'pointer', fontSize: 13, fontWeight: activeMonth === i ? 600 : 400,
                  fontFamily: 'inherit', transition: 'all 0.15s', position: 'relative',
                }}>
                  {m.slice(0,3)}
                  {hasData && <span style={{ position: 'absolute', top: 4, right: 4, width: 5, height: 5, borderRadius: '50%', background: activeMonth === i ? 'rgba(255,255,255,0.6)' : '#1a7a4a' }} />}
                </button>
              )
            })}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
          {/* Left — main entry */}
          <div>
            {/* Month stats */}
            <div className="fade-up d1" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Fixed Cost', value: fmt(totalFixed), sub: fcUnit > 0 ? `${fmt(fcUnit).replace('$','$')}/unit` : '—' },
                { label: 'Variable Cost', value: fmt(totalVariable), sub: vcUnit > 0 ? `${fmt(vcUnit).replace('$','$')}/unit` : '—' },
                { label: 'Total Cost', value: fmt(totalCost), sub: tcUnit > 0 ? `${('$'+tcUnit.toFixed(2))}/unit` : '—' },
                { label: 'Sales Volume', value: cur.salesVolume > 0 ? cur.salesVolume.toLocaleString()+' units' : '0 units', sub: 'editable below' },
              ].map(s => (
                <div key={s.label} style={{ background: '#fff', border: '1px solid #e5e3de', borderRadius: 12, padding: '16px 18px' }}>
                  <div style={{ fontSize: 11, color: '#9e9b96', marginBottom: 8 }}>{s.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#1a1916', letterSpacing: '-0.5px' }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: '#9e9b96', marginTop: 4 }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="fade-up d2" style={{ background: '#fff', border: '1px solid #e5e3de', borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ display: 'flex', borderBottom: '1px solid #e5e3de' }}>
                {(['fixed','variable','summary'] as const).map(t => (
                  <button key={t} onClick={() => setActiveTab(t)} style={{
                    flex: 1, padding: '14px 0', border: 'none', cursor: 'pointer',
                    fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
                    background: activeTab === t ? '#fff' : '#f8f7f4',
                    color: activeTab === t ? '#1a1916' : '#9e9b96',
                    borderBottom: activeTab === t ? '2px solid #1a1916' : '2px solid transparent',
                    transition: 'all 0.15s',
                  }}>
                    {t === 'fixed' ? 'Fixed Costs' : t === 'variable' ? 'Variable Costs' : 'Month Summary'}
                  </button>
                ))}
              </div>

              {activeTab !== 'summary' && (
                <div style={{ padding: '20px 24px' }}>
                  {/* Add row */}
                  <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                    <select value={addCat} onChange={e => setAddCat(e.target.value)} style={{
                      flex: 1, padding: '10px 12px', borderRadius: 8, border: '1.5px solid #e5e3de', background: '#fff',
                      color: addCat ? '#1a1916' : '#9e9b96', fontSize: 13, fontFamily: 'inherit', outline: 'none', cursor: 'pointer',
                    }}>
                      <option value="">Select category...</option>
                      {cats.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9e9b96', fontSize: 13 }}>$</span>
                      <input type="number" value={addAmt} onChange={e => setAddAmt(e.target.value)} placeholder="0.00" min="0" style={{ width: 120, padding: '10px 12px 10px 24px', borderRadius: 8, border: '1.5px solid #e5e3de', background: '#fff', color: '#1a1916', fontSize: 13, fontFamily: 'inherit', outline: 'none' }}
                        onKeyDown={e => e.key === 'Enter' && addEntry()}
                        onFocus={e => e.target.style.borderColor = '#1a1916'}
                        onBlur={e => e.target.style.borderColor = '#e5e3de'} />
                    </div>
                    <button onClick={addEntry} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: '#1a1916', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', whiteSpace: 'nowrap' }}
                      onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = '#2d2b28'}
                      onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = '#1a1916'}>
                      + Add
                    </button>
                  </div>

                  {/* Entries list */}
                  {entries.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: '#9e9b96', fontSize: 14 }}>
                      No {activeTab} costs added yet for {MONTHS[activeMonth]}.<br />
                      <span style={{ fontSize: 12 }}>Select a category and enter an amount above.</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {entries.map((e, idx) => (
                        <div key={e.id} className="fade-up" style={{ display: 'flex', alignItems: 'center', padding: '12px 14px', borderRadius: 8, background: idx % 2 === 0 ? '#f8f7f4' : '#fff', transition: 'background 0.15s' }}
                          onMouseEnter={el => (el.currentTarget as HTMLDivElement).style.background = '#f2f1ee'}
                          onMouseLeave={el => (el.currentTarget as HTMLDivElement).style.background = idx % 2 === 0 ? '#f8f7f4' : '#fff'}>
                          <span style={{ flex: 1, fontSize: 13, color: '#1a1916' }}>{e.category}</span>
                          <span style={{ fontSize: 14, fontWeight: 600, color: '#1a1916', marginRight: 16 }}>${e.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          <button onClick={() => removeEntry(e.id)} style={{ width: 24, height: 24, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: '#c4c2bd', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
                            onMouseEnter={el => { (el.currentTarget as HTMLButtonElement).style.background = '#fef2f2'; (el.currentTarget as HTMLButtonElement).style.color = '#c0392b' }}
                            onMouseLeave={el => { (el.currentTarget as HTMLButtonElement).style.background = 'transparent'; (el.currentTarget as HTMLButtonElement).style.color = '#c4c2bd' }}>
                            ×
                          </button>
                        </div>
                      ))}
                      <div style={{ display: 'flex', padding: '12px 14px', borderTop: '1.5px solid #e5e3de', marginTop: 4 }}>
                        <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#6b6860' }}>Total {activeTab === 'fixed' ? 'Fixed' : 'Variable'}</span>
                        <span style={{ fontSize: 15, fontWeight: 700, color: '#1a1916' }}>${tabTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'summary' && (
                <div style={{ padding: '24px' }}>
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 11, color: '#9e9b96', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Sales Volume</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <input type="number" value={cur.salesVolume || ''} onChange={e => updateSales(e.target.value)} placeholder="0" min="0" style={{ width: 140, padding: '10px 12px', borderRadius: 8, border: '1.5px solid #e5e3de', background: '#fff', color: '#1a1916', fontSize: 14, fontFamily: 'inherit', outline: 'none' }}
                        onFocus={e => e.target.style.borderColor = '#1a1916'}
                        onBlur={e => e.target.style.borderColor = '#e5e3de'} />
                      <span style={{ fontSize: 13, color: '#9e9b96' }}>units sold this month</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {[
                      { label: 'Total Fixed Cost', value: fmt(totalFixed), sub: fixedEntries.length + ' items' },
                      { label: 'Total Variable Cost', value: fmt(totalVariable), sub: variableEntries.length + ' items' },
                      { label: 'Total Cost', value: fmt(totalCost), bold: true },
                      { label: 'Sales Volume', value: cur.salesVolume.toLocaleString() + ' units' },
                      { label: 'Fixed Cost / Unit', value: cur.salesVolume > 0 ? '$'+fcUnit.toFixed(2) : '—' },
                      { label: 'Variable Cost / Unit', value: cur.salesVolume > 0 ? '$'+vcUnit.toFixed(2) : '—' },
                      { label: 'Total Cost / Unit', value: cur.salesVolume > 0 ? '$'+tcUnit.toFixed(2) : '—', bold: true },
                    ].map((row, i) => (
                      <div key={row.label} style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: i < 6 ? '1px solid #f2f1ee' : 'none' }}>
                        <span style={{ flex: 1, fontSize: 13, color: row.bold ? '#1a1916' : '#6b6860', fontWeight: row.bold ? 600 : 400 }}>{row.label}</span>
                        {'sub' in row && row.sub && <span style={{ fontSize: 11, color: '#9e9b96', marginRight: 16 }}>{row.sub}</span>}
                        <span style={{ fontSize: 14, fontWeight: row.bold ? 700 : 600, color: '#1a1916' }}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right — annual overview */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Annual total card */}
            <div className="fade-up d2" style={{ background: '#1a1916', borderRadius: 14, padding: '24px', color: '#fff' }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>Annual Overview</div>
              {[
                { label: 'Fixed', value: fmt(annual.tf), color: 'rgba(255,255,255,0.9)' },
                { label: 'Variable', value: fmt(annual.tv), color: 'rgba(255,255,255,0.7)' },
                { label: 'Grand Total', value: fmt(annual.tc), color: '#fff', big: true },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>{s.label}</span>
                  <span style={{ fontSize: s.big ? 20 : 15, fontWeight: 700, color: s.color, letterSpacing: '-0.3px' }}>{s.value}</span>
                </div>
              ))}
              {annual.sv > 0 && (
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 12, marginTop: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>Avg cost/unit</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>${(annual.tc/annual.sv).toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Monthly breakdown list */}
            <div className="fade-up d3" style={{ background: '#fff', border: '1px solid #e5e3de', borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ padding: '16px 18px', borderBottom: '1px solid #e5e3de' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#1a1916' }}>Monthly Breakdown</div>
              </div>
              <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                {MONTHS.map((name, i) => {
                  const mf = months[i].entries.filter(e=>e.type==='fixed').reduce((s,e)=>s+e.amount,0)
                  const mv = months[i].entries.filter(e=>e.type==='variable').reduce((s,e)=>s+e.amount,0)
                  const mt = mf+mv
                  return (
                    <div key={name} onClick={() => setActiveMonth(i)} style={{ display: 'flex', alignItems: 'center', padding: '11px 18px', cursor: 'pointer', background: activeMonth === i ? '#f8f7f4' : '#fff', borderLeft: activeMonth === i ? '2px solid #1a1916' : '2px solid transparent', transition: 'all 0.15s' }}>
                      <span style={{ flex: 1, fontSize: 13, color: '#1a1916', fontWeight: activeMonth === i ? 600 : 400 }}>{name.slice(0,3)}</span>
                      <span style={{ fontSize: 13, color: mt > 0 ? '#1a1916' : '#c4c2bd', fontWeight: 500 }}>{mt > 0 ? fmt(mt) : '—'}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Sales volume quick set */}
            <div className="fade-up d4" style={{ background: '#fff', border: '1px solid #e5e3de', borderRadius: 14, padding: '18px' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#1a1916', marginBottom: 12 }}>Sales Volume — {MONTHS[activeMonth]}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="number" value={cur.salesVolume || ''} onChange={e => updateSales(e.target.value)} placeholder="0 units" min="0" style={{ flex: 1, padding: '9px 12px', borderRadius: 8, border: '1.5px solid #e5e3de', background: '#f8f7f4', color: '#1a1916', fontSize: 13, fontFamily: 'inherit', outline: 'none' }}
                  onFocus={e => e.target.style.borderColor = '#1a1916'}
                  onBlur={e => e.target.style.borderColor = '#e5e3de'} />
                <span style={{ padding: '9px 0', fontSize: 13, color: '#9e9b96', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>units</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
