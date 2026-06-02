'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminNav from '../../../components/AdminNav'

const fmt = n => 'UGX ' + Number(n||0).toLocaleString('en-UG',{minimumFractionDigits:0,maximumFractionDigits:0})
const CATS = ['Crossbody Bags','Tote Bags','Feminine Bags','Mini Bags','Evening Bags','Clutches']
const TAGS = ['new','bestseller','limited','sale','evening','featured']
const PRESET_COLORS = ['#0a0a0a','#1a0030','#ffffff','#d4af37','#8B5CF6','#6d28d9','#4c1d95','#f5f5f5','#c084fc','#a78bfa','#7c3aed','#4a1942','#1e1e2e','#3b0764','#b45309','#be185d']

export default function AdminProducts() {
  const [products,   setProducts]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [editId,     setEditId]     = useState(null)
  const [editForm,   setEditForm]   = useState({})
  const [editColors,    setEditColors]    = useState([])
  const [editImages,    setEditImages]    = useState([])
  const [editVariants,  setEditVariants]  = useState([])
  const [uploadingImg,  setUploadingImg]  = useState(false)
  const [varUploading,  setVarUploading]  = useState({})
  const [customColor,   setCustomColor]   = useState('#8B5CF6')
  const [toast,      setToast]      = useState('')
  const router = useRouter()

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then(d => {
      if (d.error === 'Unauthorized') { router.push('/admin'); return }
      setProducts(d.products || [])
      setLoading(false)
    })
  }, [])

  const startEdit = p => {
    setEditId(p.id)
    setEditColors(p.colors || [])
    setEditImages(p.images || [])
    setEditVariants(p.variants || [])
    setEditForm({
      name: p.name, price: p.price,
      originalPrice: p.originalPrice || '',
      discountPercent: p.discountPercent || 0,
      category: p.category, description: p.description,
      stock: p.stock, featured: p.featured, tags: p.tags || [],
    })
  }

  const uploadEditImage = async file => {
    setUploadingImg(true)
    const fd = new FormData(); fd.append('file', file)
    try {
      const r = await fetch('/api/upload', { method: 'POST', body: fd })
      const d = await r.json()
      if (d.success) { setEditImages(prev => [...prev, d.url]); showToast('✓ Image uploaded') }
      else showToast('✗ ' + (d.error || 'Upload failed'))
    } catch { showToast('✗ Upload error') }
    setUploadingImg(false)
  }

  const removeEditImage = idx => setEditImages(prev => prev.filter((_,i) => i !== idx))
  const setMainImage = idx => setEditImages(prev => { const a=[...prev]; const [m]=a.splice(idx,1); return [m,...a] })

  const computedDiscount = () => {
    const p = Number(editForm.price), op = Number(editForm.originalPrice)
    if (editForm.discountPercent && Number(editForm.discountPercent) > 0) return Number(editForm.discountPercent)
    if (p > 0 && op > p) return Math.round((1 - p / op) * 100)
    return 0
  }

  const saveEdit = async () => {
    const disc = computedDiscount()
    const body = {
      ...editForm,
      colors: editColors,
      images: editImages,
      variants: editVariants.map(v => ({ ...v, stock: Number(v.stock) || 0 })),
      discountPercent: disc,
      originalPrice: disc > 0 && editForm.originalPrice ? Number(editForm.originalPrice) : null,
    }
    const r = await fetch(`/api/products/${editId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const d = await r.json()
    if (d.success) { setProducts(prev => prev.map(p => p.id === editId ? d.product : p)); setEditId(null); showToast('✓ Product updated') }
    else showToast('✗ ' + (d.error || 'Failed'))
  }

  const del = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return
    const r = await fetch(`/api/products/${id}`, { method: 'DELETE' })
    const d = await r.json()
    if (d.success) { setProducts(prev => prev.filter(p => p.id !== id)); showToast('✓ Deleted') }
  }

  const efSet = (k, v) => setEditForm(f => ({ ...f, [k]: v }))
  const toggleTag = t => efSet('tags', editForm.tags?.includes(t) ? editForm.tags.filter(x => x !== t) : [...(editForm.tags||[]), t])
  const toggleEditColor = c => setEditColors(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])
  const addCustomColor = () => { if (!editColors.includes(customColor)) setEditColors(prev => [...prev, customColor]) }

  // ── Edit variant helpers ─────────────────────────────────────────────────
  const addEditVariant = () => setEditVariants(prev => [...prev, { id: 'v_' + Date.now(), name: '', images: [], stock: '' }])
  const removeEditVariant = id => setEditVariants(prev => prev.filter(v => v.id !== id))
  const updateEditVariant = (id, key, val) => setEditVariants(prev => prev.map(v => v.id === id ? { ...v, [key]: val } : v))
  const uploadEditVariantImage = async (variantId, file) => {
    setVarUploading(prev => ({ ...prev, [variantId]: true }))
    const fd = new FormData(); fd.append('file', file)
    try {
      const r = await fetch('/api/upload', { method: 'POST', body: fd })
      const d = await r.json()
      if (d.success) setEditVariants(prev => prev.map(v => v.id === variantId ? { ...v, images: [...v.images, d.url] } : v))
      else showToast('✗ ' + (d.error || 'Upload failed'))
    } catch { showToast('✗ Upload error') }
    setVarUploading(prev => ({ ...prev, [variantId]: false }))
  }
  const removeEditVariantImage = (variantId, idx) => setEditVariants(prev => prev.map(v => v.id === variantId ? { ...v, images: v.images.filter((_,i) => i !== idx) } : v))

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <p style={{ color:'var(--muted)' }}>Loading…</p>
    </div>
  )

  const lbl  = { display:'block', fontSize:'.72rem', letterSpacing:'.2em', textTransform:'uppercase', color:'var(--muted)', marginBottom:8 }
  const disc = editId ? computedDiscount() : 0

  return (
    <div style={{ minHeight:'100vh' }}>
      <AdminNav />
      <div style={{ maxWidth:1280, margin:'0 auto', padding:'2rem 1.25rem' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'2rem', flexWrap:'wrap', gap:12 }}>
          <div>
            <h1 className="d" style={{ color:'#fff', fontSize:'2rem' }}>Products</h1>
            <p style={{ color:'var(--muted)', fontSize:'.84rem', marginTop:4 }}>{products.length} products total</p>
          </div>
          <Link href="/admin/upload">
            <button className="btn-p" style={{ width:'auto', display:'inline-block', padding:'.75rem 1.5rem', fontSize:'.75rem' }}>+ Add Product</button>
          </Link>
        </div>

        {/* ── EDIT MODAL ── */}
        {editId && (
          <div style={{ position:'fixed', inset:0, background:'rgba(7,0,15,0.85)', backdropFilter:'blur(6px)', zIndex:100, display:'flex', alignItems:'flex-start', justifyContent:'center', padding:'1rem', overflowY:'auto' }}>
            <div style={{ background:'linear-gradient(135deg,rgba(17,0,34,0.98),rgba(26,0,52,0.98))', border:'1px solid var(--bdr)', borderRadius:8, width:'100%', maxWidth:620, margin:'auto' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1.25rem 1.5rem', borderBottom:'1px solid rgba(139,92,246,0.15)' }}>
                <h2 className="d" style={{ color:'#fff', fontSize:'1.3rem' }}>Edit Product</h2>
                <button onClick={() => setEditId(null)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--muted)', fontSize:'1.25rem' }}>✕</button>
              </div>

              <div style={{ padding:'1.5rem', display:'flex', flexDirection:'column', gap:16 }}>

                {/* ── IMAGES SECTION ── */}
                <div>
                  <label style={lbl}>Product Images</label>
                  {/* Current images grid */}
                  {editImages.length > 0 && (
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:12 }}>
                      {editImages.map((url, i) => (
                        <div key={i} style={{ position:'relative', aspectRatio:'1', borderRadius:4, overflow:'hidden', background:'rgba(59,31,74,0.5)' }}>
                          <img src={url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                          {i === 0 && (
                            <span style={{ position:'absolute', top:3, left:3, background:'var(--pur-d)', color:'#fff', fontSize:7, padding:'1px 4px', borderRadius:2 }}>MAIN</span>
                          )}
                          <div style={{ position:'absolute', bottom:0, left:0, right:0, display:'flex', gap:2, padding:3, background:'rgba(0,0,0,0.6)' }}>
                            {i !== 0 && (
                              <button type="button" onClick={() => setMainImage(i)} title="Set as main"
                                style={{ flex:1, background:'rgba(139,92,246,0.6)', border:'none', color:'#fff', fontSize:8, cursor:'pointer', borderRadius:2, padding:'1px 0' }}>
                                Main
                              </button>
                            )}
                            <button type="button" onClick={() => removeEditImage(i)} title="Remove"
                              style={{ flex:1, background:'rgba(239,68,68,0.6)', border:'none', color:'#fff', fontSize:10, cursor:'pointer', borderRadius:2, padding:'1px 0' }}>
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Upload new image */}
                  <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer', background:'rgba(139,92,246,0.08)', border:'1px dashed rgba(139,92,246,0.3)', borderRadius:4, padding:'10px 14px' }}>
                    <input type="file" accept="image/*" multiple style={{ display:'none' }}
                      onChange={e => Array.from(e.target.files).forEach(uploadEditImage)} />
                    <span style={{ fontSize:'1.2rem' }}>📷</span>
                    <span style={{ color:'var(--pur-l)', fontSize:'.82rem' }}>
                      {uploadingImg ? 'Uploading…' : editImages.length === 0 ? 'Upload product images' : 'Add more images'}
                    </span>
                  </label>
                  {editImages.length > 0 && (
                    <p style={{ color:'var(--muted)', fontSize:'.7rem', marginTop:6 }}>Click "Main" to set main photo · "✕" to remove</p>
                  )}
                </div>

                {/* Name */}
                <div><label style={lbl}>Name</label><input value={editForm.name} onChange={e => efSet('name', e.target.value)} className="inp" /></div>

                {/* Price */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <div><label style={lbl}>Price (UGX)</label><input type="number" value={editForm.price} onChange={e => efSet('price', e.target.value)} className="inp" /></div>
                  <div><label style={lbl}>Original Price (sale only)</label><input type="number" value={editForm.originalPrice} onChange={e => efSet('originalPrice', e.target.value)} className="inp" placeholder="Leave blank if no discount" /></div>
                </div>
                {disc > 0 && (
                  <div style={{ padding:'8px 12px', background:'rgba(139,92,246,0.1)', border:'1px solid rgba(139,92,246,0.3)', borderRadius:4, fontSize:'.78rem', color:'var(--pur-l)' }}>
                    ✦ Discount: <strong>{disc}%</strong> off
                  </div>
                )}

                {/* Category & Stock */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <div><label style={lbl}>Category</label>
                    <select value={editForm.category} onChange={e => efSet('category', e.target.value)} className="inp">
                      {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div><label style={lbl}>Stock</label><input type="number" value={editForm.stock} onChange={e => efSet('stock', e.target.value)} className="inp" /></div>
                </div>

                {/* Description */}
                <div><label style={lbl}>Description</label><textarea value={editForm.description} onChange={e => efSet('description', e.target.value)} className="inp" style={{ height:80 }} /></div>

                {/* Colour Variants */}
                <div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                    <label style={lbl}>Colour Variants</label>
                    <button type="button" onClick={addEditVariant}
                      style={{ padding:'4px 12px', fontSize:'.7rem', letterSpacing:'.12em', textTransform:'uppercase', cursor:'pointer', background:'rgba(139,92,246,.15)', border:'1px solid rgba(139,92,246,.3)', color:'var(--pur-l)', borderRadius:3 }}>
                      + Add Variant
                    </button>
                  </div>
                  {editVariants.length === 0 && (
                    <p style={{ color:'var(--muted)', fontSize:'.75rem', marginBottom:8 }}>No variants yet. Click "+ Add Variant" to add a colour with its own photos and stock.</p>
                  )}
                  {editVariants.map(v => (
                    <div key={v.id} style={{ background:'rgba(139,92,246,.05)', border:'1px solid rgba(139,92,246,.15)', borderRadius:6, padding:'.85rem', marginBottom:10 }}>
                      <div style={{ display:'flex', gap:8, marginBottom:8, flexWrap:'wrap' }}>
                        <div style={{ flex:2, minWidth:100 }}>
                          <label style={{ ...lbl, marginBottom:4 }}>Colour Name</label>
                          <input value={v.name} onChange={e => updateEditVariant(v.id, 'name', e.target.value)} className="inp" placeholder="e.g. Red" style={{ padding:'6px 10px' }} />
                        </div>
                        <div style={{ flex:1, minWidth:70 }}>
                          <label style={{ ...lbl, marginBottom:4 }}>Stock</label>
                          <input type="number" min="0" value={v.stock} onChange={e => updateEditVariant(v.id, 'stock', e.target.value)} className="inp" placeholder="0" style={{ padding:'6px 10px' }} />
                        </div>
                        <button type="button" onClick={() => removeEditVariant(v.id)}
                          style={{ alignSelf:'flex-end', background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.3)', color:'#f87171', padding:'6px 8px', borderRadius:4, cursor:'pointer', fontSize:'.75rem' }}>
                          Remove
                        </button>
                      </div>
                      {v.images.length > 0 && (
                        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:5, marginBottom:7 }}>
                          {v.images.map((url, ii) => (
                            <div key={ii} style={{ position:'relative', aspectRatio:'1', borderRadius:4, overflow:'hidden', background:'rgba(59,31,74,.5)' }}>
                              <img src={url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                              {ii === 0 && <span style={{ position:'absolute', top:2, left:2, background:'var(--pur-d)', color:'#fff', fontSize:6, padding:'1px 3px' }}>MAIN</span>}
                              <button type="button" onClick={() => removeEditVariantImage(v.id, ii)}
                                style={{ position:'absolute', top:2, right:2, background:'rgba(0,0,0,.7)', border:'none', color:'#fff', width:16, height:16, borderRadius:'50%', cursor:'pointer', fontSize:10 }}>×</button>
                            </div>
                          ))}
                        </div>
                      )}
                      <label style={{ display:'flex', alignItems:'center', gap:7, cursor:'pointer', background:'rgba(139,92,246,.07)', border:'1px dashed rgba(139,92,246,.22)', borderRadius:4, padding:'6px 10px' }}>
                        <input type="file" accept="image/*" multiple style={{ display:'none' }} onChange={e => Array.from(e.target.files).forEach(f => uploadEditVariantImage(v.id, f))} />
                        <span style={{ fontSize:'.9rem' }}>📷</span>
                        <span style={{ color:'var(--pur-l)', fontSize:'.75rem' }}>{varUploading[v.id] ? 'Uploading…' : v.images.length === 0 ? 'Upload photos for this colour' : 'Add more photos'}</span>
                      </label>
                    </div>
                  ))}
                </div>

                {/* Tags */}
                <div>
                  <label style={lbl}>Tags</label>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                    {TAGS.map(t => (
                      <button type="button" key={t} onClick={() => toggleTag(t)}
                        style={{ padding:'5px 12px', fontSize:'.68rem', letterSpacing:'.12em', textTransform:'uppercase', cursor:'pointer', border:'1px solid', borderRadius:3, transition:'all .2s', background:editForm.tags?.includes(t)?'var(--pur-d)':'transparent', borderColor:editForm.tags?.includes(t)?'rgba(139,92,246,0.5)':'var(--bdr)', color:editForm.tags?.includes(t)?'#fff':'var(--textm)' }}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Featured */}
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <button type="button" onClick={() => efSet('featured', !editForm.featured)}
                    style={{ width:40, height:22, borderRadius:11, border:'none', cursor:'pointer', position:'relative', background:editForm.featured?'var(--pur-d)':'rgba(59,31,74,0.5)', transition:'background .2s' }}>
                    <span style={{ position:'absolute', top:3, width:16, height:16, borderRadius:'50%', background:'#fff', transition:'left .2s', left:editForm.featured?'calc(100% - 19px)':'3px' }} />
                  </button>
                  <span style={{ color:'var(--textm)', fontSize:'.84rem' }}>Featured on homepage</span>
                </div>

                {/* Actions */}
                <div style={{ display:'flex', gap:12, marginTop:8 }}>
                  <button onClick={saveEdit} className="btn-p" style={{ flex:1, padding:'.9rem', fontSize:'.8rem', letterSpacing:'.18em' }}>Save Changes</button>
                  <button onClick={() => setEditId(null)} className="btn-o" style={{ width:'auto', padding:'.9rem 1.5rem', fontSize:'.8rem', flexShrink:0 }}>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products table */}
        <div style={{ background:'rgba(17,0,34,0.88)', border:'1px solid var(--bdr)', borderRadius:6, overflow:'hidden' }}>
          {products.length === 0 ? (
            <div style={{ padding:'4rem', textAlign:'center' }}>
              <p className="d" style={{ color:'var(--textm)', fontSize:'1.5rem', marginBottom:'1.5rem' }}>No products yet</p>
              <Link href="/admin/upload"><button className="btn-p" style={{ width:'auto', display:'inline-block', padding:'.9rem 2rem', fontSize:'.8rem' }}>Add Your First Product</button></Link>
            </div>
          ) : (
            <div style={{ overflowX:'auto' }}>
              <table className="atbl">
                <thead>
                  <tr>
                    <th>Product</th><th>Category</th><th>Price</th>
                    <th>Discount</th><th>Colours</th><th>Stock</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id}>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                          <div style={{ width:44, height:44, borderRadius:4, overflow:'hidden', background:'rgba(59,31,74,0.5)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                            {p.images?.[0] ? <img src={p.images[0]} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <span style={{ fontSize:'1.2rem', opacity:.4 }}>👜</span>}
                          </div>
                          <div>
                            <div style={{ color:'#fff', fontSize:'.84rem' }}>{p.name}</div>
                            <div style={{ color:'var(--muted)', fontSize:'.68rem', fontFamily:'monospace' }}>#{p.id}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ color:'var(--textm)', fontSize:'.78rem' }}>{p.category}</td>
                      <td>
                        <div style={{ color:'var(--pur-l)', fontWeight:500, fontSize:'.84rem' }}>{fmt(p.price)}</div>
                        {p.discountPercent > 0 && p.originalPrice && <div style={{ color:'var(--muted)', fontSize:'.72rem', textDecoration:'line-through' }}>{fmt(p.originalPrice)}</div>}
                      </td>
                      <td>{p.discountPercent > 0 ? <span className="bdg bdg-sale">−{p.discountPercent}%</span> : <span style={{ color:'var(--muted)', fontSize:'.75rem' }}>—</span>}</td>
                      <td>
                        <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                          {(p.colors||[]).map((c,i) => <div key={i} style={{ width:16, height:16, borderRadius:'50%', background:c, border:'1px solid rgba(255,255,255,0.25)' }} />)}
                          {(!p.colors || p.colors.length === 0) && <span style={{ color:'var(--muted)', fontSize:'.72rem' }}>—</span>}
                        </div>
                      </td>
                      <td><span style={{ fontSize:'.84rem', fontWeight:500, color:p.stock===0?'#f87171':p.stock<=5?'#fbbf24':'#4ade80' }}>{p.stock}</span></td>
                      <td>
                        <div style={{ display:'flex', gap:8 }}>
                          <button onClick={() => startEdit(p)} style={{ background:'none', border:'1px solid rgba(139,92,246,0.3)', color:'var(--pur-l)', cursor:'pointer', padding:'4px 10px', fontSize:'.72rem', borderRadius:3 }}>Edit</button>
                          <button onClick={() => del(p.id, p.name)} style={{ background:'none', border:'1px solid rgba(239,68,68,0.3)', color:'#f87171', cursor:'pointer', padding:'4px 10px', fontSize:'.72rem', borderRadius:3 }}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
