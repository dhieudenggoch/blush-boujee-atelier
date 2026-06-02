'use client'
import { useState } from 'react'

export default function ProductGallery({ product }) {
  const hasVariants = Array.isArray(product.variants) && product.variants.length > 0
  const [selVariant, setSelVariant] = useState(hasVariants ? product.variants[0] : null)
  const [galleryIdx, setGalleryIdx] = useState(0)
  const [isZoomed,   setIsZoomed]   = useState(false)

  const pickVariant = v => {
    setSelVariant(v)
    setGalleryIdx(0)
    setIsZoomed(false)
    window.dispatchEvent(new CustomEvent('bb_variant_selected', { detail: v }))
  }

  const activeImages = hasVariants
    ? (selVariant?.images?.length ? selVariant.images : product.images || [])
    : (product.images || [])

  const prev = e => { e.stopPropagation(); setGalleryIdx(i => (i - 1 + activeImages.length) % activeImages.length) }
  const next = e => { e.stopPropagation(); setGalleryIdx(i => (i + 1) % activeImages.length) }

  const handleMouseMove = e => {
    if (!isZoomed) return
    const r = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width  * 100).toFixed(1)
    const y = ((e.clientY - r.top)  / r.height * 100).toFixed(1)
    e.currentTarget.querySelector('.gallery-img').style.transformOrigin = `${x}% ${y}%`
  }

  const btnBase = {
    position:'absolute', top:'50%', transform:'translateY(-50%)',
    width:40, height:40, borderRadius:'50%', border:'1px solid rgba(255,255,255,.15)',
    background:'rgba(7,0,15,.7)', backdropFilter:'blur(8px)',
    color:'#fff', cursor:'pointer', fontSize:'1.2rem',
    display:'flex', alignItems:'center', justifyContent:'center',
    transition:'background .2s, border-color .2s, transform .2s',
    zIndex:2,
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:10, position:'sticky', top:'6rem' }}>

      {/* ── Main image ── */}
      {activeImages.length > 0 ? (
        <div
          style={{
            position:'relative', width:'100%', aspectRatio:'1',
            borderRadius:8, overflow:'hidden',
            background:'linear-gradient(145deg,rgba(17,0,34,.9),rgba(59,31,74,.4))',
            border:'1px solid var(--bdr)',
            cursor: isZoomed ? 'zoom-out' : 'zoom-in',
            boxShadow:'0 24px 64px rgba(0,0,0,.5)',
          }}
          onClick={() => setIsZoomed(z => !z)}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => { if (isZoomed) { const img = document.querySelector('.gallery-img'); if(img) img.style.transformOrigin='50% 50%' } }}
        >
          <img
            className="gallery-img"
            src={activeImages[galleryIdx]}
            alt={selVariant?.name || product.name}
            style={{
              width:'100%', height:'100%', objectFit:'cover',
              transition: isZoomed ? 'transform .1s ease' : 'transform .45s cubic-bezier(.4,0,.2,1)',
              transform: isZoomed ? 'scale(2.4)' : 'scale(1)',
              willChange:'transform',
            }}
          />

          {/* Zoom hint */}
          {!isZoomed && (
            <div style={{ position:'absolute', bottom:12, right:12, background:'rgba(7,0,15,.7)', backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,.1)', borderRadius:20, padding:'4px 10px', display:'flex', alignItems:'center', gap:5, opacity:.8 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35M11 8v6M8 11h6"/></svg>
              <span style={{ fontSize:10, letterSpacing:'.1em', color:'rgba(255,255,255,.8)' }}>ZOOM</span>
            </div>
          )}

          {/* Prev / Next */}
          {activeImages.length > 1 && (
            <>
              <button
                onClick={prev} aria-label="Previous image"
                style={{ ...btnBase, left:12 }}
                onMouseEnter={e => { e.currentTarget.style.background='rgba(139,92,246,.35)'; e.currentTarget.style.borderColor='var(--pur)' }}
                onMouseLeave={e => { e.currentTarget.style.background='rgba(7,0,15,.7)'; e.currentTarget.style.borderColor='rgba(255,255,255,.15)' }}
              >‹</button>
              <button
                onClick={next} aria-label="Next image"
                style={{ ...btnBase, right:12 }}
                onMouseEnter={e => { e.currentTarget.style.background='rgba(139,92,246,.35)'; e.currentTarget.style.borderColor='var(--pur)' }}
                onMouseLeave={e => { e.currentTarget.style.background='rgba(7,0,15,.7)'; e.currentTarget.style.borderColor='rgba(255,255,255,.15)' }}
              >›</button>

              {/* Dot indicators */}
              <div style={{ position:'absolute', bottom:14, left:0, right:0, display:'flex', justifyContent:'center', gap:6, zIndex:2 }}>
                {activeImages.map((_, i) => (
                  <button key={i} onClick={e => { e.stopPropagation(); setGalleryIdx(i) }} aria-label={`Photo ${i+1}`}
                    style={{ width: i===galleryIdx ? 20 : 6, height:6, borderRadius:3, border:'none', padding:0, cursor:'pointer', transition:'width .25s, background .25s', background: i===galleryIdx ? '#fff' : 'rgba(255,255,255,.35)' }} />
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <div style={{ aspectRatio:'1', borderRadius:8, background:'rgba(59,31,74,.2)', border:'1px solid var(--bdr)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="rgba(139,92,246,.3)" strokeWidth="1" aria-hidden="true"><path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
        </div>
      )}

      {/* ── Thumbnail strip ── */}
      {activeImages.length > 1 && (
        <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:2, scrollbarWidth:'none' }}>
          {activeImages.map((url, i) => (
            <button key={i} onClick={() => setGalleryIdx(i)} aria-label={`View photo ${i+1}`}
              style={{
                flexShrink:0, width:68, height:68, borderRadius:6, overflow:'hidden', padding:0, cursor:'pointer',
                border: i===galleryIdx ? '2px solid var(--pur-l)' : '2px solid rgba(255,255,255,.08)',
                background:'rgba(59,31,74,.5)',
                transition:'border-color .2s, transform .2s',
                transform: i===galleryIdx ? 'scale(1.04)' : 'scale(1)',
                boxShadow: i===galleryIdx ? '0 0 0 3px rgba(196,168,255,.2)' : 'none',
              }}>
              <img src={url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            </button>
          ))}
        </div>
      )}

      {/* ── Variant picker ── */}
      {hasVariants && (
        <div style={{ paddingTop:4 }}>
          <p style={{ fontSize:'.7rem', letterSpacing:'.2em', textTransform:'uppercase', color:'var(--muted)', marginBottom:10 }}>
            Colour —&nbsp;<span style={{ color:'var(--pur-l)', textTransform:'none', letterSpacing:'normal', fontWeight:500 }}>{selVariant?.name || '—'}</span>
          </p>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {product.variants.map(v => {
              const thumb = v.images?.[0] || null
              const oos   = (v.stock ?? 0) === 0
              const isSel = selVariant?.id === v.id
              return (
                <button key={v.id} type="button"
                  onClick={() => !oos && pickVariant(v)}
                  title={v.name + (oos ? ' — Out of stock' : '')}
                  aria-label={v.name + (oos ? ' — Out of stock' : '') + (isSel ? ' — Selected' : '')}
                  aria-pressed={isSel}
                  style={{
                    position:'relative', width:64, height:64, borderRadius:6, overflow:'hidden',
                    padding:0, cursor: oos ? 'not-allowed' : 'pointer',
                    border: isSel ? '2px solid var(--pur-l)' : '2px solid rgba(255,255,255,.1)',
                    background:'rgba(59,31,74,.5)',
                    transform: isSel ? 'scale(1.08)' : 'scale(1)',
                    transition:'transform .2s, border-color .2s, box-shadow .2s',
                    opacity: oos ? 0.4 : 1,
                    boxShadow: isSel ? '0 0 0 3px rgba(196,168,255,.25), 0 8px 24px rgba(109,40,217,.4)' : 'none',
                  }}>
                  {thumb
                    ? <img src={thumb} alt={v.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(139,92,246,.5)" strokeWidth="1.5" aria-hidden="true"><path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/></svg>
                      </div>
                  }
                  {oos && (
                    <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.6)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <span style={{ fontSize:7, color:'#f87171', fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase' }}>Sold out</span>
                    </div>
                  )}
                  {isSel && (
                    <div style={{ position:'absolute', top:3, right:3, width:12, height:12, borderRadius:'50%', background:'var(--pur-l)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <svg width="7" height="7" viewBox="0 0 12 12" fill="none" stroke="#000" strokeWidth="2.5" aria-hidden="true"><polyline points="2,6 5,9 10,3"/></svg>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
