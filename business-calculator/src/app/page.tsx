'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import FixedCostTab from '@/components/FixedCostTab'
import VariableCostTab from '@/components/VariableCostTab'
import TotalCostTab from '@/components/TotalCostTab'
import SummaryChart from '@/components/SummaryChart'

export type MonthData = {
  month: string
  houseRent: number
  electricityBill: number
  internetBill: number
  salaryBenefits: number
  miscFixed: number
  plannedSalesVolume: number
  rawMaterials: number
  packaging: number
  shipping: number
  commissions: number
  miscVariable: number
}

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
]

const defaultData = (): MonthData[] => MONTHS.map((month, i) => ({
  month,
  houseRent:       i === 0 ? 7000 : 5000,
  electricityBill: 400,
  internetBill:    400,
  salaryBenefits:  30000,
  miscFixed:       [500,1500,5000,2500,500,600,400,200,500,500,500,500][i],
  plannedSalesVolume: [2000,1000,4000,2000,500,4000,200,3500,1200,200,800,2000][i],
  rawMaterials:    [8000,4000,15000,8000,2000,15000,1000,12000,5000,1000,3000,8000][i],
  packaging:       [1000,500,2000,1000,250,2000,150,1500,600,150,400,1000][i],
  shipping:        [2000,1000,4000,2000,500,4000,200,3000,1200,200,800,2000][i],
  commissions:     [1500,750,3000,1500,375,3000,150,2250,900,150,600,1500][i],
  miscVariable:    [500,250,1000,500,125,1000,50,750,300,50,200,500][i],
}))

const TABS = ['Fixed Cost', 'Variable Cost', 'Total Cost'] as const
type Tab = typeof TABS[number]

export default function Home() {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('Fixed Cost')
  const [data, setData] = useState<MonthData[]>(defaultData())

  useEffect(() => {
    if (!isLoading && !user) router.push('/login')
  }, [user, isLoading, router])

  const updateCell = (monthIdx: number, field: keyof MonthData, value: number) => {
    setData(prev => prev.map((row, i) =>
      i === monthIdx ? { ...row, [field]: value } : row
    ))
  }

  const computed = useMemo(() => data.map(row => {
    const totalFixed = row.houseRent + row.electricityBill + row.internetBill + row.salaryBenefits + row.miscFixed
    const fixedCostContribution = row.plannedSalesVolume > 0 ? +(totalFixed / row.plannedSalesVolume).toFixed(2) : 0
    const totalVariable = row.rawMaterials + row.packaging + row.shipping + row.commissions + row.miscVariable
    const variableCostPerUnit = row.plannedSalesVolume > 0 ? +(totalVariable / row.plannedSalesVolume).toFixed(2) : 0
    const totalCost = totalFixed + totalVariable
    const totalCostPerUnit = row.plannedSalesVolume > 0 ? +(totalCost / row.plannedSalesVolume).toFixed(2) : 0
    return { totalFixed, fixedCostContribution, totalVariable, variableCostPerUnit, totalCost, totalCostPerUnit }
  }), [data])

  const annualSummary = useMemo(() => ({
    totalFixed: computed.reduce((s, r) => s + r.totalFixed, 0),
    totalVariable: computed.reduce((s, r) => s + r.totalVariable, 0),
    totalCost: computed.reduce((s, r) => s + r.totalCost, 0),
    totalSalesVolume: data.reduce((s, r) => s + r.plannedSalesVolume, 0),
  }), [computed, data])

  if (isLoading || !user) {
    return (
      <div style={{ minHeight: '100vh', background: '#08080f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>Loading...</div>
      </div>
    )
  }

  const handleLogout = () => { logout(); router.push('/login') }

  return (
    <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
      <header style={{
        borderBottom: '1px solid var(--border)',
        padding: '20px 32px',
        background: 'rgba(10,10,15,0.9)',
        backdropFilter: 'blur(16px)',
        position: 'sticky', top: 0, zIndex: 50
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, var(--accent), var(--accent2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>💼</div>
              <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--text)' }}>BizCalc</h1>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, marginLeft: 42 }}>Business Cost Calculator — Annual Planning</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <div style={{ display: 'flex', gap: 24, fontSize: 12 }}>
              {[
                { label: 'Annual Fixed', value: annualSummary.totalFixed, color: 'var(--accent)' },
                { label: 'Annual Variable', value: annualSummary.totalVariable, color: 'var(--accent2)' },
                { label: 'Total Cost', value: annualSummary.totalCost, color: 'var(--accent3)' },
              ].map(item => (
                <div key={item.label} style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>{item.label}</div>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, color: item.color }}>৳{item.value.toLocaleString()}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 20, borderLeft: '1px solid var(--border)' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--accent2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: '#fff', fontFamily: "'Syne', sans-serif" }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{user.name}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{user.email}</div>
              </div>
              <button onClick={handleLogout} style={{ marginLeft: 6, padding: '6px 12px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', cursor: 'pointer', fontSize: 11, color: 'var(--text-muted)', fontFamily: "'Syne', sans-serif", transition: 'all 0.2s' }}
                onMouseEnter={e => { (e.currentTarget).style.borderColor = 'rgba(255,101,132,0.5)'; (e.currentTarget).style.color = '#ff6584' }}
                onMouseLeave={e => { (e.currentTarget).style.borderColor = 'rgba(255,255,255,0.1)'; (e.currentTarget).style.color = 'var(--text-muted)' }}>
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 32px' }}>
        <div className="fade-up" style={{ marginBottom: 32 }}>
          <SummaryChart data={data} computed={computed} />
        </div>
        <div className="fade-up delay-1">
          <div style={{ display: 'flex', gap: 4, background: 'var(--surface)', padding: 4, borderRadius: 10, border: '1px solid var(--border)', width: 'fit-content', marginBottom: 24 }}>
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '8px 20px', borderRadius: 7, border: 'none', cursor: 'pointer', fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 600, transition: 'all 0.2s', background: activeTab === tab ? 'linear-gradient(135deg, var(--accent), #8b84ff)' : 'transparent', color: activeTab === tab ? '#fff' : 'var(--text-muted)', boxShadow: activeTab === tab ? '0 2px 12px rgba(108,99,255,0.4)' : 'none' }}>
                {tab}
              </button>
            ))}
          </div>
          {activeTab === 'Fixed Cost' && <FixedCostTab data={data} computed={computed} updateCell={updateCell} />}
          {activeTab === 'Variable Cost' && <VariableCostTab data={data} computed={computed} updateCell={updateCell} />}
          {activeTab === 'Total Cost' && <TotalCostTab data={data} computed={computed} updateCell={updateCell} />}
        </div>
      </main>
    </div>
  )
}
