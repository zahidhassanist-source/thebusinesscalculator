'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { login, signup } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    // Restore saved email if remember was set
    const saved = localStorage.getItem('bizcalc_remember_email')
    if (saved) setEmail(saved)
  }, [])

  // Particle canvas animation
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas!.getContext('2d')!
    let raf: number
    canvas!.width = canvas.offsetWidth
    canvas!.height = canvas.offsetHeight

    const particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number }[] = []
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas!.width,
        y: Math.random() * canvas!.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.4 + 0.1,
      })
    }

    function draw() {
      ctx.clearRect(0, 0, canvas!.width, canvas!.height)
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0) p.x = canvas!.width
        if (p.x > canvas!.width) p.x = 0
        if (p.y < 0) p.y = canvas!.height
        if (p.y > canvas!.height) p.y = 0
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(147, 129, 255, ${p.opacity})`
        ctx.fill()
      })
      // Draw lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 100) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(147, 129, 255, ${0.12 * (1 - dist / 100)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setLoading(true)
    await new Promise(r => setTimeout(r, 600))
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

  const switchMode = () => {
    setMode(m => m === 'login' ? 'signup' : 'login')
    setError(''); setPassword('')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#08080f',
      display: 'flex',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Fraunces:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap" rel="stylesheet" />

      {/* Particle canvas */}
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }} />

      {/* Glow orbs */}
      <div style={{
        position: 'absolute', top: '-20%', left: '-10%',
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(108,99,255,0.15) 0%, transparent 70%)',
        zIndex: 0, pointerEvents: 'none',
        animation: 'orbFloat 8s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', bottom: '-20%', right: '-10%',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,101,132,0.1) 0%, transparent 70%)',
        zIndex: 0, pointerEvents: 'none',
        animation: 'orbFloat 10s ease-in-out infinite reverse',
      }} />

      {/* Left panel — branding */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px 80px', position: 'relative', zIndex: 1,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateX(0)' : 'translateX(-30px)',
        transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 80 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, #6c63ff 0%, #ff6584 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, boxShadow: '0 8px 32px rgba(108,99,255,0.4)',
          }}>💼</div>
          <span style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 600, color: '#fff', letterSpacing: '-0.5px' }}>
            BizCalc
          </span>
        </div>

        <h1 style={{
          fontFamily: "'Fraunces', serif",
          fontSize: 52, fontWeight: 300, lineHeight: 1.1,
          color: '#fff', letterSpacing: '-1px', marginBottom: 24,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.9s cubic-bezier(0.16,1,0.3,1) 0.2s',
        }}>
          Your business,<br />
          <em style={{ fontStyle: 'italic', color: '#9381ff' }}>perfectly</em><br />
          calculated.
        </h1>

        <p style={{
          fontSize: 16, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, maxWidth: 380,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.9s cubic-bezier(0.16,1,0.3,1) 0.35s',
        }}>
          Track fixed costs, variable costs, and profitability — all in one beautiful dashboard built for serious businesses.
        </p>

        {/* Feature pills */}
        <div style={{
          display: 'flex', gap: 10, marginTop: 48, flexWrap: 'wrap',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.9s cubic-bezier(0.16,1,0.3,1) 0.5s',
        }}>
          {['Live calculations', '12-month planning', 'Cost per unit', 'Visual charts'].map(f => (
            <div key={f} style={{
              padding: '7px 14px', borderRadius: 100,
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.04)',
              fontSize: 13, color: 'rgba(255,255,255,0.55)',
            }}>{f}</div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{
        width: 480, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px 56px', position: 'relative', zIndex: 1,
        background: 'rgba(255,255,255,0.03)',
        borderLeft: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(20px)',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateX(0)' : 'translateX(30px)',
        transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s',
      }}>
        <h2 style={{
          fontFamily: "'Fraunces', serif",
          fontSize: 30, fontWeight: 400, color: '#fff',
          marginBottom: 8, letterSpacing: '-0.5px',
        }}>
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 36 }}>
          {mode === 'login' ? 'Sign in to your BizCalc account' : 'Start your free account today'}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {mode === 'signup' && (
            <div style={{ animation: 'slideDown 0.3s ease both' }}>
              <label style={labelStyle}>Full name</label>
              <input
                type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="Zahid Hassan" required
                style={inputStyle}
                onFocus={e => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={e => Object.assign(e.target.style, inputBlurStyle)}
              />
            </div>
          )}

          <div>
            <label style={labelStyle}>Email address</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@company.com" required
              style={inputStyle}
              onFocus={e => Object.assign(e.target.style, inputFocusStyle)}
              onBlur={e => Object.assign(e.target.style, inputBlurStyle)}
            />
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••'}
                required
                style={{ ...inputStyle, paddingRight: 44 }}
                onFocus={e => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={e => Object.assign(e.target.style, inputBlurStyle)}
              />
              <button type="button" onClick={() => setShowPass(s => !s)}
                style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'rgba(255,255,255,0.35)', fontSize: 16, padding: 0, lineHeight: 1,
                }}>
                {showPass ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          {mode === 'login' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                onClick={() => setRemember(r => !r)}
                style={{
                  width: 20, height: 20, borderRadius: 5, cursor: 'pointer',
                  border: `2px solid ${remember ? '#6c63ff' : 'rgba(255,255,255,0.2)'}`,
                  background: remember ? '#6c63ff' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s', flexShrink: 0,
                }}>
                {remember && <span style={{ color: '#fff', fontSize: 12, lineHeight: 1 }}>✓</span>}
              </div>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', cursor: 'pointer' }}
                onClick={() => setRemember(r => !r)}>
                Remember me & save password
              </span>
            </div>
          )}

          {error && (
            <div style={{
              padding: '10px 14px', borderRadius: 8,
              background: 'rgba(255,101,132,0.12)',
              border: '1px solid rgba(255,101,132,0.25)',
              fontSize: 13, color: '#ff6584',
              animation: 'shake 0.4s ease',
            }}>{error}</div>
          )}

          <button type="submit" disabled={loading} style={{
            marginTop: 8,
            padding: '14px 24px', borderRadius: 10, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            background: loading ? 'rgba(108,99,255,0.5)' : 'linear-gradient(135deg, #6c63ff 0%, #8b84ff 100%)',
            color: '#fff', fontSize: 15, fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif",
            letterSpacing: '0.01em',
            transition: 'all 0.2s',
            boxShadow: loading ? 'none' : '0 8px 32px rgba(108,99,255,0.4)',
            transform: 'translateY(0)',
          }}
            onMouseEnter={e => { if (!loading) { (e.target as HTMLButtonElement).style.transform = 'translateY(-1px)'; (e.target as HTMLButtonElement).style.boxShadow = '0 12px 40px rgba(108,99,255,0.5)' } }}
            onMouseLeave={e => { (e.target as HTMLButtonElement).style.transform = 'translateY(0)'; (e.target as HTMLButtonElement).style.boxShadow = '0 8px 32px rgba(108,99,255,0.4)' }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span style={{ animation: 'spin 0.8s linear infinite', display: 'inline-block' }}>◌</span>
                {mode === 'login' ? 'Signing in...' : 'Creating account...'}
              </span>
            ) : (
              mode === 'login' ? 'Sign in →' : 'Create account →'
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
          </span>
          <button onClick={switchMode} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 13, color: '#9381ff', fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif",
            textDecoration: 'underline', textUnderlineOffset: 3,
          }}>
            {mode === 'login' ? 'Sign up free' : 'Sign in'}
          </button>
        </div>

        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: 32, lineHeight: 1.6 }}>
          Your data is stored locally on your device.<br />No server, no tracking, 100% private.
        </p>
      </div>

      <style>{`
        @keyframes orbFloat {
          0%,100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(30px,20px) scale(1.05); }
        }
        @keyframes slideDown {
          from { opacity:0; transform:translateY(-10px); max-height:0; }
          to { opacity:1; transform:translateY(0); max-height:100px; }
        }
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-6px)}
          40%{transform:translateX(6px)}
          60%{transform:translateX(-4px)}
          80%{transform:translateX(4px)}
        }
        @keyframes spin { to { transform:rotate(360deg); } }
        input::placeholder { color: rgba(255,255,255,0.2); }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px #1a1a2e inset;
          -webkit-text-fill-color: #fff;
        }
      `}</style>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 500,
  color: 'rgba(255,255,255,0.5)', marginBottom: 8, letterSpacing: '0.05em',
  textTransform: 'uppercase',
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '13px 16px', borderRadius: 10,
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#fff', fontSize: 15,
  fontFamily: "'DM Sans', sans-serif",
  outline: 'none', transition: 'all 0.2s',
}

const inputFocusStyle: React.CSSProperties = {
  background: 'rgba(108,99,255,0.1)',
  border: '1px solid rgba(108,99,255,0.5)',
  boxShadow: '0 0 0 3px rgba(108,99,255,0.15)',
}

const inputBlurStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  boxShadow: 'none',
}
