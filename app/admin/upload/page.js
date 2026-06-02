'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminNav from '../../../components/AdminNav'

const CATS = ['Crossbody Bags','Tote Bags','Feminine Bags','Mini Bags','Evening Bags','Clutches']
const TAGS = ['new','bestseller','limited','sale','evening','featured']

const PRESET_COLORS = [
  '#0a0a0a','#1a0030','#ffffff','#d4af37','#8B5CF6','#6d28d9',
  '#4c1d95','#f5f5f5','#c084fc','#a78bfa','#7c3aed','#4a1942',
  '#1e1e2e','#3b0764','#b45309','#be185d',
]

export default function UploadPage() {
  const router = useRouter()
  const [images,   setImages]   = useState([])
  const [uploading,setUploading]= useState(false)
  const [saving,   setSaving]   = useState(false)
  const [toast,    setToast]    = useState('')
  const [variants,  setVariants]  = useState([])
  const [varUploading, setVarUploading] = useState({})
  const [form, setForm] = useState({
    name:'', price:'', originalPrice:'', discountPercent:'',
    category:'Crossbody Bags', description:'', stock:'',
    featured:false, tags:[],
  })

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3500) }
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const uploadFile = async file => {
    setUploading(true)
    const fd = new FormData(); fd.append('file', file)
    try {
      const r = await fetch('/api/upload', { method: 'POST', body: fd })
      const d = await r.json()
      if (d.success) { setImages(prev => [...prev, d.url]); showToast('✓ Image uploaded') }
      else showToast('✗ ' + (d.error || 'Upload failed'))
    } catch { showToast('✗ Upload error') }
    setUploading(false)
  }

  const handleDrop  = e => { e.preventDefault(); Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/')).forEach(uploadFile) }
  const handleFiles = e => Array.from(e.target.files).forEach(uploadFile)
  const toggleTag   = t => set('tags', form.tags.includes(t) ? form.tags.filter(x => x !== t) : [...form.tags, t])
  // ── Variant helpers ────────────────────────────────────────────────────
  const addVariant = () => setVariants(prev => [...prev, { id: 'v_' + Date.now(), name: '', images: [], stock: '' }])
  const removeVariant = id => setVariants(prev => prev.filter(v => v.id !== id))
  const updateVariant = (id, key, val) => setVariants(prev => prev.map(v => v.id === id ? { ...v, [key]: val } : v))
  const uploadVariantImage = async (variantId, file) => {
    setVarUploading(prev => ({ ...prev, [variantId]: true }))
    const fd = new FormData(); fd.append('file', file)
    try {
      const r = await fetch('/api/upload', { method: 'POST', body: fd })
      const d = await r.json()
      if (d.success) setVariants(prev => prev.map(v => v.id === variantId ? { ...v, images: [...v.images, d.url] } : v))
      else showToast('✗ ' + (d.error || 'Upload failed'))
    } catch { showToast('✗ Upload error') }
    setVarUploading(prev => ({ ...prev, [variantId]: false }))
  }
  const removeVariantImage = (variantId, idx) => setVariants(prev => prev.map(v => v.id === variantId ? { ...v, images: v.images.filter((_,i) => i !== idx) } : v))

  const computedDiscount = () => {
    const p = Number(form.price), op = Number(form.originalPrice)
    if (form.discountPercent && Number(form.discountPercent) > 0) return Number(form.discountPercent)
    if (p > 0 && op > p) return Math.round((1 - p / op) * 100)
    return 0
  }

  const submit = async e => {
    e.preventDefault()
    if (!form.name || !form.price || !form.stock) { showToast('✗ Fill all required fields'); return }
    setSaving(true)
    try {
      const disc = computedDiscount()
      const body = {
        ...form,
        images,
        variants: variants.map(v => ({ ...v, stock: Number(v.stock) || 0 })),
        discountPercent: disc,
        // If no discount, clear originalPrice so it doesn't show strikethrough
        originalPrice: disc > 0 && form.originalPrice ? Number(form.originalPrice) : null,
      }
      const r = await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const d = await r.json()
      if (d.success) { showToast('✓ Product created!'); setTimeout(() => router.push('/admin/products'), 1200) }
      else showToast('✗ ' + (d.error || 'Failed'))
    } catch { showToast('✗ Error') }
    setSaving(false)
  }

  const box  = { background: 'rgba(17,0,34,.88)', border: '1px solid var(--bdr)', borderRadius: 6, padding: '1.5rem' }
  const lbl  = { display: 'block', fontSize: '.72rem', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }
  const disc = computedDiscount()

  return (
    <div style={{ minHeight: '100vh' }}>
      <AdminNav />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '2rem' }}>
          <Link href="/admin/products" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '.84rem' }}>← Products</Link>
          <span style={{ color: 'var(--muted)' }}>›</span>
          <h1 className="d" style={{ color: '#fff', fontSize: '1.5rem' }}>Add New Product</h1>
        </div>

        <form onSubmit={submit}>
          <style>{`@media(min-width:768px){.up-grid{grid-template-columns:300px 1fr!important}}`}</style>
          <div className="up-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>

            {/* LEFT — Images */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={box}>
                <span style={lbl}>Product Images</span>
                <div
                  onDrop={handleDrop} onDragOver={e => e.preventDefault()}
                  onClick={() => document.getElementById('fileIn').click()}
                  style={{ border: '2px dashed rgba(139,92,246,.3)', borderRadius: 4, padding: '2rem 1rem', textAlign: 'center', cursor: 'pointer', minHeight: 160, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {uploading
                    ? <><div style={{ fontSize: '2rem' }}>📤</div><p style={{ color: 'var(--muted)', fontSize: '.84rem' }}>Uploading…</p></>
                    : <><div style={{ fontSize: '2rem', opacity: .4 }}>📷</div><p style={{ color: 'var(--muted)', fontSize: '.84rem' }}>Drop images here</p><p style={{ color: 'rgba(124,95,160,.5)', fontSize: '.72rem' }}>or click to browse</p><p style={{ color: 'rgba(124,95,160,.4)', fontSize: '.68rem', marginTop: 4 }}>JPG · PNG · WebP · max 5MB</p></>}
                  <input id="fileIn" type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={handleFiles} />
                </div>
                {images.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginTop: 12 }}>
                    {images.map((url, i) => (
                      <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: 4, overflow: 'hidden', background: 'rgba(59,31,74,.5)' }}>
                        <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        {i === 0 && <span style={{ position: 'absolute', top: 4, left: 4, background: 'var(--pur-d)', color: '#fff', fontSize: 8, padding: '1px 5px' }}>MAIN</span>}
                        <button type="button" onClick={() => setImages(p => p.filter((_, j) => j !== i))} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,.7)', border: 'none', color: '#fff', width: 20, height: 20, borderRadius: '50%', cursor: 'pointer', fontSize: 12 }}>×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT — Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={box}>
                <span style={lbl}>Product Details</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div><label style={lbl}>Product Name *</label><input required value={form.name} onChange={e => set('name', e.target.value)} className="inp" placeholder="e.g. Noir Quilted Crossbody" /></div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div><label style={lbl}>Price (UGX) *</label><input required type="number" min="0" value={form.price} onChange={e => set('price', e.target.value)} className="inp" placeholder="897000" /></div>
                    <div>
                      <label style={lbl}>Original Price (only if on sale)</label>
                      <input type="number" min="0" value={form.originalPrice} onChange={e => set('originalPrice', e.target.value)} className="inp" placeholder="Leave blank if no discount" />
                    </div>
                  </div>

                  {disc > 0 && (
                    <div style={{ padding: '8px 12px', background: 'rgba(139,92,246,.1)', border: '1px solid rgba(139,92,246,.3)', borderRadius: 4, fontSize: '.78rem', color: 'var(--pur-l)' }}>
                      ✦ Discount: <strong>{disc}%</strong> off — auto-calculated from prices
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={lbl}>Category *</label>
                      <select value={form.category} onChange={e => set('category', e.target.value)} className="inp" required>
                        {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div><label style={lbl}>Stock Quantity *</label><input required type="number" min="0" value={form.stock} onChange={e => set('stock', e.target.value)} className="inp" placeholder="10" /></div>
                  </div>
                  <div><label style={lbl}>Description *</label><textarea required value={form.description} onChange={e => set('description', e.target.value)} className="inp" style={{ height: 100 }} placeholder="Describe the bag — materials, details, occasions…" /></div>
                </div>
              </div>

              {/* Colour Variants */}
              <div style={box}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={lbl}>Colour Variants</span>
                  <button type="button" onClick={addVariant}
                    style={{ padding: '5px 14px', fontSize: '.72rem', letterSpacing: '.12em', textTransform: 'uppercase', cursor: 'pointer', background: 'rgba(139,92,246,.15)', border: '1px solid rgba(139,92,246,.3)', color: 'var(--pur-l)', borderRadius: 3 }}>
                    + Add Variant
                  </button>
                </div>
                {variants.length === 0 && (
                  <p style={{ color: 'var(--muted)', fontSize: '.78rem' }}>No variants yet. Click "+ Add Variant" to add a colour option with its own photos and stock.</p>
                )}
                {variants.map((v, vi) => (
                  <div key={v.id} style={{ background: 'rgba(139,92,246,.05)', border: '1px solid rgba(139,92,246,.15)', borderRadius: 6, padding: '1rem', marginBottom: 12 }}>
                    <div style={{ display: 'flex', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                      <div style={{ flex: 2, minWidth: 120 }}>
                        <label style={lbl}>Colour Name</label>
                        <input value={v.name} onChange={e => updateVariant(v.id, 'name', e.target.value)} className="inp" placeholder="e.g. Light green/Striped" />
                      </div>
                      <div style={{ flex: 1, minWidth: 80 }}>
                        <label style={lbl}>Stock</label>
                        <input type="number" min="0" value={v.stock} onChange={e => updateVariant(v.id, 'stock', e.target.value)} className="inp" placeholder="0" />
                      </div>
                      <button type="button" onClick={() => removeVariant(v.id)}
                        style={{ alignSelf: 'flex-end', background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', color: '#f87171', padding: '8px 10px', borderRadius: 4, cursor: 'pointer', fontSize: '.8rem', whiteSpace: 'nowrap' }}>
                        Remove
                      </button>
                    </div>
                    {/* Variant images */}
                    {v.images.length > 0 && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, marginBottom: 8 }}>
                        {v.images.map((url, ii) => (
                          <div key={ii} style={{ position: 'relative', aspectRatio: '1', borderRadius: 4, overflow: 'hidden', background: 'rgba(59,31,74,.5)' }}>
                            <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            {ii === 0 && <span style={{ position: 'absolute', top: 3, left: 3, background: 'var(--pur-d)', color: '#fff', fontSize: 7, padding: '1px 4px' }}>MAIN</span>}
                            <button type="button" onClick={() => removeVariantImage(v.id, ii)}
                              style={{ position: 'absolute', top: 3, right: 3, background: 'rgba(0,0,0,.7)', border: 'none', color: '#fff', width: 18, height: 18, borderRadius: '50%', cursor: 'pointer', fontSize: 11 }}>×</button>
                          </div>
                        ))}
                      </div>
                    )}
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', background: 'rgba(139,92,246,.08)', border: '1px dashed rgba(139,92,246,.25)', borderRadius: 4, padding: '8px 12px' }}>
                      <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => Array.from(e.target.files).forEach(f => uploadVariantImage(v.id, f))} />
                      <span style={{ fontSize: '1rem' }}>📷</span>
                      <span style={{ color: 'var(--pur-l)', fontSize: '.78rem' }}>{varUploading[v.id] ? 'Uploading…' : v.images.length === 0 ? 'Upload photos for this colour' : 'Add more photos'}</span>
                    </label>
                  </div>
                ))}
              </div>

              {/* Tags & Featured */}
              <div style={box}>
                <span style={lbl}>Tags & Options</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                  {TAGS.map(t => (
                    <button type="button" key={t} onClick={() => toggleTag(t)}
                      style={{ padding: '6px 14px', fontSize: '.7rem', letterSpacing: '.15em', textTransform: 'uppercase', cursor: 'pointer', border: '1px solid', borderRadius: 3, transition: 'all .2s', background: form.tags.includes(t) ? 'var(--pur-d)' : 'transparent', borderColor: form.tags.includes(t) ? 'rgba(139,92,246,.5)' : 'var(--bdr)', color: form.tags.includes(t) ? '#fff' : 'var(--textm)' }}>
                      {t}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button type="button" onClick={() => set('featured', !form.featured)}
                    style={{ width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer', transition: 'background .2s', position: 'relative', background: form.featured ? 'var(--pur-d)' : 'rgba(59,31,74,.5)' }}>
                    <span style={{ position: 'absolute', top: 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left .2s', left: form.featured ? 'calc(100% - 19px)' : '3px' }} />
                  </button>
                  <label style={{ color: 'var(--textm)', fontSize: '.84rem', cursor: 'pointer' }} onClick={() => set('featured', !form.featured)}>Feature on homepage</label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="submit" disabled={saving} className="btn-p" style={{ flex: 1, padding: '1rem', fontSize: '.82rem', letterSpacing: '.2em' }}>{saving ? 'Creating…' : 'Create Product'}</button>
                <Link href="/admin/products"><button type="button" className="btn-o" style={{ padding: '1rem 1.5rem', fontSize: '.82rem', width: 'auto', flexShrink: 0 }}>Cancel</button></Link>
              </div>
            </div>
          </div>
        </form>
      </div>
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
