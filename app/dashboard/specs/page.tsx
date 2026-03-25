'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const INTENTS = ['Informational', 'Commercial', 'Transactional', 'Navigational']
const TONES = ['Educational', 'Conversational', 'Authoritative', 'Friendly', 'Professional']
const CATEGORIES = ['Savings', 'Investing', 'Credit Cards', 'Loans', 'Budgeting', 'Insurance', 'Taxes', 'Retirement', 'Banking', 'Real Estate']
const STEPS = ['Core Details', 'Content Strategy', 'Content Extras', 'References', 'Review']

export default function SpecsPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [generatingAngle, setGeneratingAngle] = useState(false)
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
      setForm(f => ({ ...f, title: topic.title || '', primary_keyword: topic.primary_keyword || '', reference_links: topic.source_url || '' }))
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

  async function generateAngle() {
    if (!form.title) return
    setGeneratingAngle(true)
    try {
      const res = await fetch('/api/suggest-angle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: form.title, intent: form.intent, primary_keyword: form.primary_keyword }),
      })
      const data = await res.json()
      if (data.angle) set('angle', data.angle)
    } catch (e) {}
    setGeneratingAngle(false)
  }

  function validateStep(s: number): Record<string, string> {
    const e: Record<string, string> = {}
    if (s === 0) {
      if (!form.primary_keyword) e.primary_keyword = 'Required'
      if (!form.category) e.category = 'Required'
    }
    if (s === 1) {
      if (!form.intent) e.intent = 'Required'
      if (!form.tone) e.tone = 'Required'
      if (!form.content_specification) e.content_specification = 'Required'
      if (!form.angle) e.angle = 'Required'
      if (!form.word_count || form.word_count < 300) e.word_count = 'Min 300'
    }
    return e
  }

  function handleNext() {
    const e = validateStep(step)
    if (Object.keys(e).length > 0) { setErrors(e); return }
    setErrors({})
    setStep(s => s + 1)
  }

  function handleBack() {
    if (step > 0) setStep(s => s - 1)
    else router.back()
  }

  function handleSubmit() {
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

  const ReviewField = ({ label, value }: { label: string, value: any }) => (
    <div style={s.reviewField}>
      <div style={s.reviewLabel}>{label}</div>
      <div style={s.reviewValue}>{Array.isArray(value) ? (value.length > 0 ? value.join(', ') : '—') : value || '—'}</div>
    </div>
  )

  return (
    <div style={s.wrapper}>
      <div style={s.backBtn} onClick={handleBack}>← Back</div>
      <div style={s.page}>

        {/* Step indicator */}
        <div style={s.stepRow}>
          {STEPS.map((label, i) => (
            <div key={i} style={s.stepItem}>
              <div style={{ ...s.stepCircle, ...(i < step ? s.stepDone : {}), ...(i === step ? s.stepActive : {}) }}>
                {i < step ? '✓' : i + 1}
              </div>
              <div style={{ ...s.stepLabel, ...(i === step ? s.stepLabelActive : {}) }}>{label}</div>
              {i < STEPS.length - 1 && <div style={{ ...s.stepLine, ...(i < step ? s.stepLineDone : {}) }} />}
            </div>
          ))}
        </div>

        {/* Card */}
        <div style={s.card}>
          <h2 style={s.cardTitle}>{STEPS[step]}</h2>

          {step === 0 && (
            <div style={s.fields}>
              <div style={s.field}>
                <label style={s.label}>Title</label>
                <div style={s.lockedField}><span style={s.lockIcon}>🔒</span><span style={s.lockedText}>{form.title || 'No title set'}</span></div>
                <span style={s.hint}>Set from Pick Topic or Write a Topic</span>
              </div>
              <div style={s.field}>
                <label style={s.label}>Primary Keyword <span style={s.req}>*</span></label>
                {form.primary_keyword ? (
                  <><div style={s.lockedField}><span style={s.lockIcon}>🔒</span><span style={s.lockedText}>{form.primary_keyword}</span></div><span style={s.hint}>Set from Write a Topic</span></>
                ) : (
                  <><input value={form.primary_keyword} onChange={e => set('primary_keyword', e.target.value)} style={{ ...s.input, ...(errors.primary_keyword ? s.inputErr : {}) }} placeholder="e.g. high yield savings account" />{errors.primary_keyword && <span style={s.errMsg}>{errors.primary_keyword}</span>}</>
                )}
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
                  {form.tags.map(t => (<span key={t} style={s.tag}>{t}<button type="button" style={s.tagX} onClick={() => removeTag(t)}>×</button></span>))}
                  <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(tagInput); setTagInput('') } }} onBlur={() => { if (tagInput) { addTag(tagInput); setTagInput('') } }} placeholder="Type & press Enter…" style={s.tagInput} />
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div style={s.fields}>
              <div style={s.grid2}>
                <div style={s.field}>
                  <label style={s.label}>Intent <span style={s.req}>*</span></label>
                  <select value={form.intent} onChange={e => set('intent', e.target.value)} style={{ ...s.select, ...(errors.intent ? s.inputErr : {}) }}>
                    <option value="">— Select —</option>{INTENTS.map(i => <option key={i}>{i}</option>)}
                  </select>
                  {errors.intent && <span style={s.errMsg}>{errors.intent}</span>}
                </div>
                <div style={s.field}>
                  <label style={s.label}>Tone <span style={s.req}>*</span></label>
                  <select value={form.tone} onChange={e => set('tone', e.target.value)} style={{ ...s.select, ...(errors.tone ? s.inputErr : {}) }}>
                    <option value="">— Select —</option>{TONES.map(t => <option key={t}>{t}</option>)}
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
              </div>
              <div style={s.field}>
                <label style={s.label}>Angle <span style={s.req}>*</span></label>
                <div style={s.angleWrap}>
                  <input value={form.angle} onChange={e => set('angle', e.target.value)} style={{ ...s.input, ...s.angleInput, ...(errors.angle ? s.inputErr : {}) }} placeholder="e.g. Step-by-step guide for first-time investors" />
                  <button type="button" style={{ ...s.angleBtn, ...(generatingAngle ? s.angleBtnLoading : {}) }} onClick={generateAngle} disabled={generatingAngle || !form.title} title={!form.title ? 'Set a title first' : 'Generate angle with AI'}>
                    {generatingAngle ? '⏳' : '✨ AI'}
                  </button>
                </div>
                {errors.angle && <span style={s.errMsg}>{errors.angle}</span>}
                <span style={s.hint}>Click ✨ AI to auto-generate based on your title and intent</span>
              </div>
              <div style={s.grid2}>
                <div style={s.field}>
                  <label style={s.label}>Target Audience</label>
                  <div style={s.lockedField}><span style={s.lockIcon}>🔒</span><span style={s.lockedText}>{form.target_audience}</span></div>
                </div>
                <div style={s.field}>
                  <label style={s.label}>Brand Mention</label>
                  <div style={s.lockedField}><span style={s.lockIcon}>🔒</span><span style={s.lockedText}>{form.brand_mention}</span></div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={s.fields}>
              {[
                { field: 'story_hook', label: 'Story Hook', desc: 'Add a narrative intro before the article' },
                { field: 'finsery_pro_tip', label: 'Finsery Pro Tip', desc: 'Include a Pro Tip block in the article' },
                { field: 'key_takeaway', label: 'Key Takeaway', desc: 'Add key takeaways section at the start' },
                { field: 'accordion', label: 'Accordion Block', desc: 'Include accordion blocks instead of bullet lists' },
              ].map(({ field, label, desc }) => (
                <div key={field} style={s.extraItem}>
                  <div><div style={s.extraLabel}>{label}</div><div style={s.extraDesc}>{desc}</div></div>
                  <Toggle field={field} />
                </div>
              ))}
            </div>
          )}

          {step === 3 && (
            <div style={s.fields}>
              <div style={s.field}>
                <label style={s.label}>Reference Links</label>
                <textarea value={form.reference_links} onChange={e => set('reference_links', e.target.value)} style={s.textarea} rows={4} placeholder="Paste reference URLs, one per line&#10;e.g. https://investopedia.com/article" />
                <span style={s.hint}>The AI will use these to pull real product data and facts</span>
              </div>
              <div style={s.field}>
                <label style={s.label}>Avoid</label>
                <textarea value={form.avoid} onChange={e => set('avoid', e.target.value)} style={s.textarea} rows={3} placeholder="Topics, phrases, or competitors to avoid" />
              </div>
            </div>
          )}

          {step === 4 && (
            <div style={s.fields}>
              <div style={s.reviewNote}>Review everything below. Click any section to go back and edit.</div>
              {[
                { title: '📄 Core Details', stepIdx: 0, fields: [['Title', form.title], ['Primary Keyword', form.primary_keyword], ['Category', form.category], ['Tags', form.tags]] },
                { title: '🎯 Content Strategy', stepIdx: 1, fields: [['Intent', form.intent], ['Tone', form.tone], ['Content Spec', form.content_specification], ['Word Count', `${form.word_count?.toLocaleString()} words`], ['Angle', form.angle], ['Target Audience', form.target_audience]] },
                { title: '✍️ Content Extras', stepIdx: 2, fields: [['Story Hook', form.story_hook], ['Pro Tip', form.finsery_pro_tip], ['Key Takeaway', form.key_takeaway], ['Accordion', form.accordion]] },
                { title: '🔗 References', stepIdx: 3, fields: [['Reference Links', form.reference_links || '—'], ['Avoid', form.avoid || '—']] },
              ].map(section => (
                <div key={section.title} style={s.reviewSection}>
                  <div style={s.reviewSectionHead} onClick={() => setStep(section.stepIdx)}>
                    {section.title} <span style={s.editLink}>Edit →</span>
                  </div>
                  <div style={s.reviewGrid}>
                    {section.fields.map(([label, value]) => (
                      <ReviewField key={label} label={label} value={value} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Nav */}
          <div style={s.navRow}>
            <button style={s.prevBtn} onClick={handleBack}>{step === 0 ? '← Cancel' : '← Previous'}</button>
            <div style={s.stepCount}>{step + 1} / {STEPS.length}</div>
            {step < STEPS.length - 1
              ? <button style={s.nextBtn} onClick={handleNext}>Next →</button>
              : <button style={s.generateBtn} onClick={handleSubmit}>⚡ Generate Draft</button>
            }
          </div>
        </div>
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  wrapper: { position: 'relative', minHeight: '100vh', background: '#f4f6fb' },
  backBtn: { position: 'absolute', top: '24px', left: '32px', fontSize: '13px', color: '#6b7280', cursor: 'pointer', fontWeight: 500, zIndex: 10 },
  page: { maxWidth: '680px', margin: '0 auto', padding: '80px 24px 60px', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  stepRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px' },
  stepItem: { display: 'flex', alignItems: 'center' },
  stepCircle: { width: '30px', height: '30px', borderRadius: '50%', background: '#e2e6f0', color: '#9ca3af', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s', zIndex: 1 },
  stepActive: { background: '#4557A1', color: '#fff', boxShadow: '0 0 0 4px rgba(69,87,161,0.15)' },
  stepDone: { background: '#10b981', color: '#fff' },
  stepLabel: { display: 'none' },
  stepLabelActive: { display: 'none' },
  stepLine: { width: '40px', height: '2px', background: '#e2e6f0', transition: 'background 0.2s' },
  stepLineDone: { background: '#10b981' },
  card: { background: '#fff', border: '1px solid #e2e6f0', borderRadius: '16px', padding: '36px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' },
  cardTitle: { fontSize: '20px', fontWeight: 700, color: '#1a1f36', marginBottom: '28px', paddingBottom: '16px', borderBottom: '1px solid #f4f6fb' },
  fields: { display: 'flex', flexDirection: 'column', gap: '20px' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '12px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' },
  req: { color: '#4557A1' },
  input: { padding: '11px 14px', border: '1.5px solid #e2e6f0', borderRadius: '8px', fontSize: '14px', color: '#1a1f36', outline: 'none', background: '#fafbff' },
  select: { padding: '11px 14px', border: '1.5px solid #e2e6f0', borderRadius: '8px', fontSize: '14px', color: '#1a1f36', outline: 'none', background: '#fafbff', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%236b7280' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: '32px' },
  textarea: { padding: '11px 14px', border: '1.5px solid #e2e6f0', borderRadius: '8px', fontSize: '14px', color: '#1a1f36', outline: 'none', background: '#fafbff', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 as any },
  inputErr: { borderColor: '#ef4444' },
  errMsg: { fontSize: '11px', color: '#ef4444' },
  hint: { fontSize: '12px', color: '#9ca3af' },
  lockedField: { display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 14px', background: '#f4f6fb', border: '1.5px solid #e2e6f0', borderRadius: '8px' },
  lockIcon: { fontSize: '13px', flexShrink: 0 },
  lockedText: { fontSize: '14px', color: '#6b7280', fontWeight: 500 },
  tagsWrap: { display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '8px 10px', border: '1.5px solid #e2e6f0', borderRadius: '8px', background: '#fafbff', minHeight: '46px', alignItems: 'center' },
  tag: { background: 'rgba(69,87,161,0.1)', color: '#4557A1', fontSize: '12px', fontWeight: 600, padding: '3px 8px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '4px' },
  tagX: { background: 'none', border: 'none', color: '#4557A1', cursor: 'pointer', fontSize: '14px', lineHeight: 1 as any, padding: 0 },
  tagInput: { border: 'none', outline: 'none', fontSize: '13px', background: 'transparent', color: '#1a1f36', minWidth: '120px', flex: 1 },
  extraItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: '#fafbff', borderRadius: '10px', border: '1px solid #e2e6f0' },
  extraLabel: { fontSize: '14px', fontWeight: 600, color: '#1a1f36', marginBottom: '2px' },
  extraDesc: { fontSize: '12px', color: '#9ca3af' },
  toggleGroup: { display: 'flex', gap: '6px' },
  toggleOpt: { padding: '7px 16px', borderRadius: '6px', border: '1.5px solid #e2e6f0', fontSize: '13px', fontWeight: 600, cursor: 'pointer', color: '#6b7280', background: '#fff' },
  toggleOptActive: { background: 'rgba(69,87,161,0.1)', borderColor: '#4557A1', color: '#4557A1' },
  reviewNote: { background: 'rgba(69,87,161,0.06)', border: '1px solid rgba(69,87,161,0.15)', borderRadius: '8px', padding: '12px 16px', fontSize: '13px', color: '#4557A1' },
  reviewSection: { border: '1px solid #e2e6f0', borderRadius: '10px', overflow: 'hidden' },
  reviewSectionHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f4f6fb', fontSize: '13px', fontWeight: 700, color: '#1a1f36', cursor: 'pointer' },
  editLink: { fontSize: '12px', color: '#4557A1', fontWeight: 600 },
  reviewGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr' },
  reviewField: { padding: '12px 16px', borderTop: '1px solid #f4f6fb' },
  reviewLabel: { fontSize: '10px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '4px' },
  reviewValue: { fontSize: '13px', color: '#1a1f36', fontWeight: 500, wordBreak: 'break-word' },
  navRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px', paddingTop: '20px', borderTop: '1px solid #f4f6fb' },
  prevBtn: { background: '#fff', border: '1.5px solid #e2e6f0', borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: 500, color: '#6b7280', cursor: 'pointer' },
  nextBtn: { background: '#4557A1', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' },
  generateBtn: { background: '#4557A1', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 28px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' },
  stepCount: { fontSize: '13px', color: '#9ca3af', fontWeight: 500 },
  angleWrap: { display: 'flex', gap: '8px', alignItems: 'center' },
  angleInput: { flex: 1 },
  angleBtn: { background: 'rgba(69,87,161,0.08)', border: '1.5px solid rgba(69,87,161,0.25)', borderRadius: '8px', padding: '11px 14px', fontSize: '13px', fontWeight: 700, color: '#4557A1', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, transition: 'all 0.15s' },
  angleBtnLoading: { opacity: 0.6, cursor: 'not-allowed' },
}