'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [mode, setMode] = useState<'login'|'signup'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { login, signup } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('bizcalc_remember_email')
    if (saved) setEmail(saved)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setLoading(true)
    await new Promise(r => setTimeout(r, 500))
    if (mode === 'signup') {
      if (!name.trim()) { setError('Please enter your name'); setLoading(false); return }
      if (password.length < 6) { setError('Password must be at least 6 characters'); setLoading(false); return }
      const ok = await signup(name.trim(), email.trim().toLowerCase(), password)
      if (!ok) { setError('An account with this email already exists'); setLoading(false); return }
    } else {
      if (remember) localStorage.setItem('bizcalc_remember_email', email.trim().toLowerCase())
      const ok = await login(email.trim().toLowerCase(), password, remember)
      if (!ok) { setError('Invalid email or password'); setLoading(false); return }
    }
    router.push('/')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f7f4', display: 'flex' }}>
      {/* Left — branding */}
      <div style={{
        flex: 1, padding: '60px 72px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        background: '#1a1916', position: 'relative', overflow: 'hidden',
        opacity: mounted ? 1 : 0, transition: 'opacity 0.6s ease',
      }}>
        {/* Subtle grid pattern */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />
        {/* Glow */}
        <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)', zIndex: 0 }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, background: '#fff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>B</div>
            <span style={{ color: '#fff', fontWeight: 600, fontSize: 18, letterSpacing: '-0.3px' }}>BizCalc</span>
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 24, fontWeight: 500 }}>Business Planning</div>
          <h1 style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: 52, fontWeight: 400, lineHeight: 1.15,
            color: '#fff', letterSpacing: '-1px', marginBottom: 28,
          }}>
            Your costs,<br />
            <em style={{ color: 'rgba(255,255,255,0.45)', fontStyle: 'italic' }}>perfectly</em><br />
            planned.
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, maxWidth: 340 }}>
            Add costs month by month, categorize them, and get a full annual report — all in one place.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 52 }}>
            {[
              { icon: '→', label: 'Add fixed & variable costs by month' },
              { icon: '→', label: 'Download annual PDF report' },
              { icon: '→', label: 'Cost per unit auto-calculated' },
            ].map(f => (
              <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>{f.icon}</span>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1, fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>
          © 2025 BizCalc. Data stored locally.
        </div>
      </div>

      {/* Right — form */}
      <div style={{
        width: 480, padding: '60px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'center',
        background: '#f8f7f4',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateX(0)' : 'translateX(20px)',
        transition: 'all 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s',
      }}>
        {/* Tab toggle */}
        <div style={{ display: 'flex', background: '#eceae6', borderRadius: 10, padding: 4, marginBottom: 40 }}>
          {(['login','signup'] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setError('') }} style={{
              flex: 1, padding: '9px 0', borderRadius: 7, border: 'none', cursor: 'pointer',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 13, fontWeight: 600,
              background: mode === m ? '#fff' : 'transparent',
              color: mode === m ? '#1a1916' : '#9e9b96',
              boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s',
            }}>
              {m === 'login' ? 'Sign in' : 'Create account'}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 30, fontWeight: 400, color: '#1a1916', letterSpacing: '-0.5px', marginBottom: 6 }}>
            {mode === 'login' ? 'Welcome back' : 'Get started free'}
          </h2>
          <p style={{ fontSize: 14, color: '#9e9b96' }}>
            {mode === 'login' ? 'Sign in to your BizCalc account' : 'Create your account in seconds'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {mode === 'signup' && (
            <div style={{ animation: 'fadeUp 0.3s ease both' }}>
              <label style={lbl}>Full name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required style={inp}
                onFocus={e => Object.assign(e.target.style, inpFocus)}
                onBlur={e => Object.assign(e.target.style, inpBlur)} />
            </div>
          )}
          <div>
            <label style={lbl}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required style={inp}
              onFocus={e => Object.assign(e.target.style, inpFocus)}
              onBlur={e => Object.assign(e.target.style, inpBlur)} />
          </div>
          <div>
            <label style={lbl}>Password</label>
            <div style={{ position: 'relative' }}>
              <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••'} required
                style={{ ...inp, paddingRight: 44 }}
                onFocus={e => Object.assign(e.target.style, inpFocus)}
                onBlur={e => Object.assign(e.target.style, inpBlur)} />
              <button type="button" onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9e9b96', fontSize: 13, padding: 0 }}>
                {showPass ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {mode === 'login' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div onClick={() => setRemember(r => !r)} style={{
                width: 18, height: 18, borderRadius: 4, cursor: 'pointer', flexShrink: 0,
                border: `1.5px solid ${remember ? '#1a1916' : '#d0cec8'}`,
                background: remember ? '#1a1916' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }}>
                {remember && <span style={{ color: '#fff', fontSize: 11, lineHeight: 1 }}>✓</span>}
              </div>
              <span style={{ fontSize: 13, color: '#6b6860', cursor: 'pointer' }} onClick={() => setRemember(r => !r)}>Remember me</span>
            </div>
          )}

          {error && (
            <div style={{ padding: '10px 14px', borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca', fontSize: 13, color: '#c0392b' }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            marginTop: 4, padding: '14px', borderRadius: 10, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            background: loading ? '#9e9b96' : '#1a1916',
            color: '#fff', fontSize: 14, fontWeight: 600,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            transition: 'all 0.2s', letterSpacing: '0.01em',
          }}
            onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = '#2d2b28' }}
            onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = '#1a1916' }}
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p style={{ fontSize: 12, color: '#9e9b96', textAlign: 'center', marginTop: 32, lineHeight: 1.6 }}>
          Your data is stored locally on your device.<br />No server. No tracking.
        </p>
      </div>

      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        input::placeholder { color: #c4c2bd; }
      `}</style>
    </div>
  )
}

const lbl: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: '#6b6860', marginBottom: 7, letterSpacing: '0.02em' }
const inp: React.CSSProperties = { width: '100%', padding: '12px 14px', borderRadius: 9, background: '#fff', border: '1.5px solid #e5e3de', color: '#1a1916', fontSize: 14, outline: 'none', transition: 'all 0.15s', fontFamily: "'Plus Jakarta Sans', sans-serif" }
const inpFocus: React.CSSProperties = { border: '1.5px solid #1a1916', boxShadow: '0 0 0 3px rgba(26,25,22,0.06)' }
const inpBlur: React.CSSProperties = { border: '1.5px solid #e5e3de', boxShadow: 'none' }
