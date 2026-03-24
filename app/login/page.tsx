'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else router.push('/dashboard')
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <span style={styles.logoText}>Fin<span style={styles.logoAccent}>sery</span></span>
          <span style={styles.logoSub}>Editorial</span>
        </div>
        <h1 style={styles.title}>Welcome back</h1>
        <p style={styles.subtitle}>Sign in to your editorial account</p>
        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@finsery.com"
              required
              style={styles.input}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={styles.input}
            />
          </div>
          {error && <div style={styles.error}>{error}</div>}
          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>
        </form>
        <p style={styles.footer}>
          Don't have an account?{' '}
          <Link href="/signup" style={styles.link}>Sign up</Link>
        </p>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a1f36 0%, #4557A1 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },
  card: {
    background: '#fff',
    borderRadius: '16px',
    padding: '48px 44px',
    width: '100%',
    maxWidth: '440px',
    boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
  },
  logo: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px',
    marginBottom: '32px',
  },
  logoText: {
    fontSize: '28px',
    fontWeight: 800,
    color: '#1a1f36',
    letterSpacing: '-0.5px',
  },
  logoAccent: { color: '#4557A1' },
  logoSub: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#9ca3af',
    letterSpacing: '2px',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#1a1f36',
    marginBottom: '6px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '32px',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: 600, color: '#374151' },
  input: {
    padding: '11px 14px',
    border: '1.5px solid #e2e6f0',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#1a1f36',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  error: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '13px',
    color: '#ef4444',
  },
  btn: {
    background: '#4557A1',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '13px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.2s',
    marginTop: '4px',
  },
  footer: { textAlign: 'center', fontSize: '14px', color: '#6b7280', marginTop: '24px' },
  link: { color: '#4557A1', fontWeight: 600 },
}
