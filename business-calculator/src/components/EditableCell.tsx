'use client'
import { useState } from 'react'

interface EditableCellProps {
  value: number
  onChange: (v: number) => void
  prefix?: string
  decimals?: number
}

export default function EditableCell({ value, onChange, prefix = '৳', decimals = 0 }: EditableCellProps) {
  const [editing, setEditing] = useState(false)
  const [raw, setRaw] = useState('')

  const display = decimals > 0
    ? value.toFixed(decimals)
    : value.toLocaleString()

  if (editing) {
    return (
      <input
        type="number"
        autoFocus
        defaultValue={value}
        onChange={e => setRaw(e.target.value)}
        onBlur={() => {
          const num = parseFloat(raw)
          if (!isNaN(num)) onChange(num)
          setEditing(false)
        }}
        onKeyDown={e => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
          if (e.key === 'Escape') setEditing(false)
        }}
        style={{
          width: '100%',
          background: 'rgba(108,99,255,0.15)',
          border: '1px solid var(--accent)',
          borderRadius: 4,
          padding: '4px 6px',
          color: 'var(--text)',
          fontFamily: "'DM Mono', monospace",
          fontSize: 13,
          outline: 'none',
          textAlign: 'right',
        }}
      />
    )
  }

  return (
    <div
      onClick={() => { setRaw(String(value)); setEditing(true) }}
      title="Click to edit"
      style={{
        cursor: 'text',
        padding: '4px 6px',
        borderRadius: 4,
        textAlign: 'right',
        fontSize: 13,
        color: 'var(--text)',
        transition: 'background 0.15s',
        userSelect: 'none',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(108,99,255,0.1)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      {prefix}{display}
    </div>
  )
}
