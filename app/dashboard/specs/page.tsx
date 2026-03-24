'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const INTENTS = ['Informational', 'Commercial', 'Transactional', 'Navigational']
const TONES = ['Educational', 'Conversational', 'Authoritative', 'Friendly', 'Professional']
const CATEGORIES = ['Savings', 'Investing', 'Credit Cards', 'Loans', 'Budgeting', 'Insurance', 'Taxes', 'Retirement', 'Banking', 'Real Estate']

export default function SpecsPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    title: '', primary_keyword: '', intent: '', angle: '',
    finsery_pro_tip: 'no', content_specification: '',
    key_takeaway: 'no', story_hook: 'no', accordion: 'no',
    reference_links: '', avoid: '', brand_mention: 'Finsery',
    tone: '', target_audience: 'US Consumers',
    word_count: 1200, category: '', tags: [] as string[],
  })
  const [tagInput, setTagInput] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const saved = localStorage.getItem('finsery_topic')
    if (saved) {
      const topic = JSON.parse(saved)
      setForm(f => ({
        ...f,
        title: topic.title || '',
        primary_keyword: topic.primary_keyword || '',
        reference_links: topic.source_url ? topic.source_url : '',
      }))
    }
  }, [])

  function set(key: string, value: any) {
    setForm(f => ({ ...f, [key]: value }))
    setErrors(e => { const n = { ...e }; delete n[key]; return n })
  }

  function addTag(val: string) {
    const t = val.trim().replace(/,/g, '')
    if (t && !form.tags.includes(t)) set('tags', [...form.tags, t])
  }

  function removeTag(t: string) { set('tags', form.tags.filter(x => x !== t)) }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.title) e.title = 'Required'
    if (!form.primary_keyword) e.primary_keyword = 'Required'
    if (!form.intent) e.intent = 'Required'
    if (!form.angle) e.angle = 'Required'
    if (!form.tone) e.tone = 'Required'
    if (!form.content_specification) e.content_specification = 'Required'
    if (!form.category) e.category = 'Required'
    if (!form.word_count || form.word_count < 300) e.word_count = 'Min 300'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    localStorage.setItem('finsery_specs', JSON.stringify(form))
    router.push('/dashboard/generate')
  }

  const Toggle = ({ field }: { field: string }) => (
    <div style={s.toggleGroup}>
      {['yes', 'no'].map(v => (
        <label key={v} style={{ ...s.toggleOpt, ...(form[field as keyof typeof form] === v ? s.toggleOptActive : {}) }}>
          <input type="radio" name={field} value={v} checked={form[field as keyof typeof form] === v} onChange={() => set(field, v)} style={{ display: 'none' }} />
          {v === 'yes' ? 'Yes' : 'No'}
        </label>
      ))}
    </div>
  )

  return (
    <div style={s.page}>
      <div style={s.back} onClick={() => router.back()}>← Back</div>
      <h1 style={s.title}>Content Specifications</h1>
      <p style={s.sub}>Fill in the brief to generate your article draft.</p>

      <form onSubmit={handleSubmit}>
        {/* Core */}
        <div style={s.card}>
          <div style={s.cardHead}><span style={s.cardIcon}>📄</span><span style={s.cardLabel}>Core Details</span></div>
          <div style={s.grid2}>
            <div style={{ ...s.field, gridColumn: '1/-1' }}>
              <label style={s.label}>Title <span style={s.req}>*</span></label>
              <input value={form.title} onChange={e => set('title', e.target.value)} style={{ ...s.input, ...(errors.title ? s.inputErr : {}) }} placeholder="Article title" />
              {errors.title && <span style={s.errMsg}>{errors.title}</span>}
            </div>
            <div style={s.field}>
              <label style={s.label}>Primary Keyword <span style={s.req}>*</span></label>
              <input value={form.primary_keyword} onChange={e => set('primary_keyword', e.target.value)} style={{ ...s.input, ...(errors.primary_keyword ? s.inputErr : {}) }} placeholder="e.g. high yield savings account" />
              {errors.primary_keyword && <span style={s.errMsg}>{errors.primary_keyword}</span>}
            </div>
            <div style={s.field}>
              <label style={s.label}>Category <span style={s.req}>*</span></label>
              <select value={form.category} onChange={e => set('category', e.target.value)} style={{ ...s.select, ...(errors.category ? s.inputErr : {}) }}>
                <option value="">— Select —</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              {errors.category && <span style={s.errMsg}>{errors.category}</span>}
            </div>
            <div style={s.field}>
              <label style={s.label}>Tags</label>
              <div style={s.tagsWrap}>
                {form.tags.map(t => (
                  <span key={t} style={s.tag}>{t}<button type="button" style={s.tagX} onClick={() => removeTag(t)}>×</button></span>
                ))}
                <input
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(tagInput); setTagInput('') } }}
                  onBlur={() => { if (tagInput) { addTag(tagInput); setTagInput('') } }}
                  placeholder="Type & press Enter…"
                  style={s.tagInput}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Strategy */}
        <div style={s.card}>
          <div style={s.cardHead}><span style={s.cardIcon}>🎯</span><span style={s.cardLabel}>Content Strategy</span></div>
          <div style={s.grid2}>
            <div style={s.field}>
              <label style={s.label}>Intent <span style={s.req}>*</span></label>
              <select value={form.intent} onChange={e => set('intent', e.target.value)} style={{ ...s.select, ...(errors.intent ? s.inputErr : {}) }}>
                <option value="">— Select —</option>
                {INTENTS.map(i => <option key={i}>{i}</option>)}
              </select>
              {errors.intent && <span style={s.errMsg}>{errors.intent}</span>}
            </div>
            <div style={s.field}>
              <label style={s.label}>Tone <span style={s.req}>*</span></label>
              <select value={form.tone} onChange={e => set('tone', e.target.value)} style={{ ...s.select, ...(errors.tone ? s.inputErr : {}) }}>
                <option value="">— Select —</option>
                {TONES.map(t => <option key={t}>{t}</option>)}
              </select>
              {errors.tone && <span style={s.errMsg}>{errors.tone}</span>}
            </div>
            <div style={s.field}>
              <label style={s.label}>Content Spec <span style={s.req}>*</span></label>
              <select value={form.content_specification} onChange={e => set('content_specification', e.target.value)} style={{ ...s.select, ...(errors.content_specification ? s.inputErr : {}) }}>
                <option value="">— Select —</option>
                <option value="beginner">Beginner</option>
                <option value="advanced">Advanced</option>
              </select>
              {errors.content_specification && <span style={s.errMsg}>{errors.content_specification}</span>}
            </div>
            <div style={s.field}>
              <label style={s.label}>Word Count <span style={s.req}>*</span></label>
              <input type="number" value={form.word_count} onChange={e => set('word_count', parseInt(e.target.value))} style={{ ...s.input, ...(errors.word_count ? s.inputErr : {}) }} min={300} max={6000} />
              {errors.word_count && <span style={s.errMsg}>{errors.word_count}</span>}
            </div>
            <div style={{ ...s.field, gridColumn: '1/-1' }}>
              <label style={s.label}>Angle <span style={s.req}>*</span></label>
              <input value={form.angle} onChange={e => set('angle', e.target.value)} style={{ ...s.input, ...(errors.angle ? s.inputErr : {}) }} placeholder="e.g. Step-by-step guide for first-time investors" />
              {errors.angle && <span style={s.errMsg}>{errors.angle}</span>}
            </div>
            <div style={s.field}>
              <label style={s.label}>Target Audience</label>
              <input value={form.target_audience} readOnly style={{ ...s.input, opacity: 0.6, cursor: 'not-allowed' }} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Brand Mention</label>
              <input value={form.brand_mention} readOnly style={{ ...s.input, opacity: 0.6, cursor: 'not-allowed' }} />
            </div>
          </div>
        </div>

        {/* Content Extras */}
        <div style={s.card}>
          <div style={s.cardHead}><span style={s.cardIcon}>✍️</span><span style={s.cardLabel}>Content Extras</span></div>
          <div style={s.extrasGrid}>
            {[
              { field: 'story_hook', label: 'Story Hook', desc: 'Add a narrative intro' },
              { field: 'finsery_pro_tip', label: 'Pro Tip', desc: 'Include a Finsery Pro Tip block' },
              { field: 'key_takeaway', label: 'Key Takeaway', desc: 'Add key takeaways section' },
              { field: 'accordion', label: 'Accordion', desc: 'Include accordion blocks' },
            ].map(({ field, label, desc }) => (
              <div key={field} style={s.extraItem}>
                <div>
                  <div style={s.extraLabel}>{label}</div>
                  <div style={s.extraDesc}>{desc}</div>
                </div>
                <Toggle field={field} />
              </div>
            ))}
          </div>
        </div>

        {/* References */}
        <div style={s.card}>
          <div style={s.cardHead}><span style={s.cardIcon}>🔗</span><span style={s.cardLabel}>References & Restrictions</span></div>
          <div style={s.grid1}>
            <div style={s.field}>
              <label style={s.label}>Reference Links</label>
              <textarea value={form.reference_links} onChange={e => set('reference_links', e.target.value)} style={s.textarea} rows={3} placeholder="Paste reference URLs, one per line" />
            </div>
            <div style={s.field}>
              <label style={s.label}>Avoid</label>
              <textarea value={form.avoid} onChange={e => set('avoid', e.target.value)} style={s.textarea} rows={2} placeholder="Topics, phrases, or competitors to avoid" />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div style={s.submitRow}>
          <button type="button" style={s.cancelBtn} onClick={() => router.back()}>Cancel</button>
          <button type="submit" style={s.submitBtn}>Generate Draft ⚡</button>
        </div>
      </form>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: { padding: '36px 40px', maxWidth: '860px' },
  back: { fontSize: '13px', color: '#6b7280', cursor: 'pointer', marginBottom: '24px', display: 'inline-block' },
  title: { fontSize: '32px', fontWeight: 700, color: '#1a1f36', marginBottom: '6px' },
  sub: { fontSize: '14px', color: '#6b7280', marginBottom: '32px' },
  card: { background: '#fff', border: '1px solid #e2e6f0', borderRadius: '12px', padding: '28px 32px', marginBottom: '16px' },
  cardHead: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #f4f6fb' },
  cardIcon: { fontSize: '16px' },
  cardLabel: { fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#4557A1' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px' },
  grid1: { display: 'flex', flexDirection: 'column', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '12px', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' },
  req: { color: '#4557A1' },
  input: { padding: '10px 14px', border: '1.5px solid #e2e6f0', borderRadius: '8px', fontSize: '14px', color: '#1a1f36', outline: 'none', background: '#fafbff' },
  select: { padding: '10px 14px', border: '1.5px solid #e2e6f0', borderRadius: '8px', fontSize: '14px', color: '#1a1f36', outline: 'none', background: '#fafbff', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%236b7280' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' },
  inputErr: { borderColor: '#ef4444' },
  errMsg: { fontSize: '11px', color: '#ef4444' },
  textarea: { padding: '10px 14px', border: '1.5px solid #e2e6f0', borderRadius: '8px', fontSize: '14px', color: '#1a1f36', outline: 'none', background: '#fafbff', resize: 'vertical', fontFamily: 'inherit' },
  tagsWrap: { display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '8px 10px', border: '1.5px solid #e2e6f0', borderRadius: '8px', background: '#fafbff', minHeight: '46px', alignItems: 'center' },
  tag: { background: 'rgba(69,87,161,0.1)', color: '#4557A1', fontSize: '12px', fontWeight: 600, padding: '3px 8px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '4px' },
  tagX: { background: 'none', border: 'none', color: '#4557A1', cursor: 'pointer', fontSize: '14px', lineHeight: 1, padding: 0 },
  tagInput: { border: 'none', outline: 'none', fontSize: '13px', background: 'transparent', color: '#1a1f36', minWidth: '120px', flex: 1 },
  extrasGrid: { display: 'flex', flexDirection: 'column', gap: '12px' },
  extraItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#fafbff', borderRadius: '8px', border: '1px solid #e2e6f0' },
  extraLabel: { fontSize: '13px', fontWeight: 600, color: '#1a1f36', marginBottom: '2px' },
  extraDesc: { fontSize: '12px', color: '#9ca3af' },
  toggleGroup: { display: 'flex', gap: '6px' },
  toggleOpt: { padding: '6px 14px', borderRadius: '6px', border: '1.5px solid #e2e6f0', fontSize: '13px', fontWeight: 600, cursor: 'pointer', color: '#6b7280', background: '#fff', transition: 'all 0.15s' },
  toggleOptActive: { background: 'rgba(69,87,161,0.1)', borderColor: '#4557A1', color: '#4557A1' },
  submitRow: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px', paddingBottom: '40px' },
  cancelBtn: { background: '#fff', border: '1.5px solid #e2e6f0', borderRadius: '8px', padding: '11px 24px', fontSize: '14px', fontWeight: 500, color: '#6b7280', cursor: 'pointer' },
  submitBtn: { background: '#4557A1', color: '#fff', border: 'none', borderRadius: '8px', padding: '11px 32px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' },
}
