'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const steps = [
  'Reading article specifications…',
  'Building content prompt…',
  'Applying intent rules…',
  'Generating article with Cerebras AI…',
  'Processing WP blocks…',
  'Saving draft to database…',
  'Draft ready!',
]

export default function GeneratePage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')
  const [draftId, setDraftId] = useState('')

  useEffect(() => {
    const specs = localStorage.getItem('finsery_specs')
    if (!specs) { router.push('/dashboard/specs'); return }

    const data = JSON.parse(specs)

    // Progress animation
    let i = 0
    const interval = setInterval(() => {
      i++
      if (i < steps.length - 1) setStep(i)
      else clearInterval(interval)
    }, 1200)

    // Call generate API
    fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then(r => r.json())
      .then(res => {
        clearInterval(interval)
        if (res.error) {
          setError(res.error)
          setStep(0)
        } else {
          setStep(steps.length - 1)
          setDraftId(res.draft_id)
          localStorage.removeItem('finsery_specs')
          localStorage.removeItem('finsery_topic')
          setTimeout(() => router.push(`/dashboard/draft/${res.draft_id}`), 1200)
        }
      })
      .catch(e => {
        clearInterval(interval)
        setError(e.message)
      })

    return () => clearInterval(interval)
  }, [])

  const progress = Math.round((step / (steps.length - 1)) * 100)

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.iconWrap}>
          {error ? '❌' : step === steps.length - 1 ? '✅' : (
            <div style={s.spinner} />
          )}
        </div>

        <h1 style={s.title}>
          {error ? 'Generation Failed' : step === steps.length - 1 ? 'Draft Ready!' : 'Generating Your Draft'}
        </h1>

        {error ? (
          <>
            <p style={s.errorText}>{error}</p>
            <button style={s.retryBtn} onClick={() => router.push('/dashboard/specs')}>
              ← Back to Specs
            </button>
          </>
        ) : (
          <>
            <p style={s.stepText}>{steps[step]}</p>
            <div style={s.progressWrap}>
              <div style={{ ...s.progressBar, width: `${progress}%` }} />
            </div>
            <div style={s.progressPct}>{progress}%</div>

            {step === steps.length - 1 && (
              <button style={s.viewBtn} onClick={() => router.push(`/dashboard/draft/${draftId}`)}>
                View Draft →
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' },
  card: { background: '#fff', border: '1px solid #e2e6f0', borderRadius: '16px', padding: '60px 48px', textAlign: 'center', maxWidth: '480px', width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.06)' },
  iconWrap: { fontSize: '48px', marginBottom: '24px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  spinner: { width: '48px', height: '48px', border: '4px solid #e2e6f0', borderTopColor: '#4557A1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  title: { fontSize: '24px', fontWeight: 700, color: '#1a1f36', marginBottom: '10px' },
  stepText: { fontSize: '14px', color: '#6b7280', marginBottom: '28px', minHeight: '20px' },
  progressWrap: { background: '#f4f6fb', borderRadius: '100px', height: '8px', overflow: 'hidden', marginBottom: '8px' },
  progressBar: { background: 'linear-gradient(90deg, #4557A1, #7b8fe8)', height: '100%', borderRadius: '100px', transition: 'width 0.4s ease' },
  progressPct: { fontSize: '13px', color: '#9ca3af', marginBottom: '28px' },
  viewBtn: { background: '#4557A1', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px 32px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' },
  errorText: { fontSize: '14px', color: '#ef4444', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', textAlign: 'left' },
  retryBtn: { background: '#fff', border: '1.5px solid #e2e6f0', borderRadius: '8px', padding: '10px 24px', fontSize: '14px', fontWeight: 600, color: '#6b7280', cursor: 'pointer' },
}
