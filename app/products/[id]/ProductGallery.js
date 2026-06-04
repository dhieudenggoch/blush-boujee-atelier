'use client'
import { useState, useRef } from 'react'

export default function ProductGallery({ product }) {
  const hasVariants = Array.isArray(product.variants) && product.variants.length > 0
  const [selVariant, setSelVariant] = useState(hasVariants ? product.variants[0] : null)
  const [galleryIdx, setGalleryIdx] = useState(0)
  const [isZoomed,   setIsZoomed]   = useState(false)
  const touchStartRef = useRef(null)

  const pickVariant = v => {
    setSelVariant(v)
    setGalleryIdx(0)
    setIsZoomed(false)
    window.dispatchEvent(new CustomEvent('bb_variant_selected', { detail: v }))
  }

  const activeImages = hasVariants
    ? (selVariant?.images?.length ? selVariant.images : product.images || [])
    : (product.images || [])

  const prev = e => { e?.stopPropagation(); setGalleryIdx(i => (i - 1 + activeImages.length) % activeImages.length) }
  const next = e => { e?.stopPropagation(); setGalleryIdx(i => (i + 1) % activeImages.length) }

  const handleMouseMove = e => {
    if (!isZoomed) return
    const r = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width  * 100).toFixed(1)
    const y = ((e.clientY - r.top)  / r.height * 100).toFixed(1)
    e.currentTarget.querySelector('.gallery-img').style.transformOrigin = `${x}% ${y}%`
  }

  // Touch swipe handlers
  const handleTouchStart = e => {
    touchStartRef.current = e.touches[0].clientX
  }
  const handleTouchEnd = e => {
    if (touchStartRef.current === null || activeImages.length <= 1) return
    const deltaX = e.changedTouches[0].clientX - touchStartRef.current
    if (Math.abs(deltaX) > 40) {
      if (deltaX < 0) next(null)
      else prev(null)
    }
    touchStartRef.current = null
  }

  // Detect touch device — disable zoom on touch screens
  const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window)

  const btnBase = {
    position:'absolute', top:'50%', transform:'translateY(-50%)',
    width:44, height:44, borderRadius:'50%', border:'1px solid rgba(255,255,255,.15)',
    background:'rgba(7,0,15,.7)', backdropFilter:'blur(8px)',
    color:'#fff', cursor:'pointer', fontSize:'1.2rem',
    display:'flex', alignItems:'center', justifyContent:'center',
    transition:'background .2s, border-color .2s, transform .2s',
    zIndex:2, minWidth:44, minHeight:44,
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
            cursor: isTouchDevice ? 'default' : (isZoomed ? 'zoom-out' : 'zoom-in'),
            boxShadow:'0 24px 64px rgba(0,0,0,.5)',
            touchAction:'pan-y',
          }}
          onClick={() => { if (!isTouchDevice) setIsZoomed(z => !z) }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => { if (isZoomed) { const img = document.querySelector('.gallery-img'); if(img) img.style.transformOrigin='50% 50%' } }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
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
              userSelect:'none',
              WebkitUserDrag:'none',
            }}
            draggable={false}
          />

          {/* Zoom hint — desktop only */}
          {!isZoomed && !isTouchDevice && (
            <div style={{ position:'absolute', bottom:12, right:12, background:'rgba(7,0,15,.7)', backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,.1)', borderRadius:20, padding:'4px 10px', display:'flex', alignItems:'center', gap:5, opacity:.8 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35M11 8v6M8 11h6"/></svg>
              <span style={{ fontSize:10, letterSpacing:'.1em', color:'rgba(255,255,255,.8)' }}>ZOOM</span>
            </div>
          )}

          {/* Swipe hint — touch only, shown when multiple images */}
          {activeImages.length > 1 && isTouchDevice && (
            <div style={{ position:'absolute', bottom:12, right:12, background:'rgba(7,0,15,.7)', backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,.1)', borderRadius:20, padding:'4px 10px', opacity:.7 }}>
              <span style={{ fontSize:10, letterSpacing:'.1em', color:'rgba(255,255,255,.8)' }}>← swipe →</span>
            </div>
          )}

          {/* Prev / Next — always shown when multiple images */}
          {activeImages.length > 1 && (
            <>
              <button onClick={prev} aria-label="Previous image"
                style={{ ...btnBase, left:10 }}
                onMouseEnter={e=>{e.currentTarget.style.background='rgba(109,40,217,.7)';e.currentTarget.style.borderColor='rgba(139,92,246,.5)'}}
                onMouseLeave={e=>{e.currentTarget.style.background='rgba(7,0,15,.7)';e.currentTarget.style.borderColor='rgba(255,255,255,.15)'}}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
              </button>
              <button onClick={next} aria-label="Next image"
                style={{ ...btnBase, right:10 }}
                onMouseEnter={e=>{e.currentTarget.style.background='rgba(109,40,217,.7)';e.currentTarget.style.borderColor='rgba(139,92,246,.5)'}}
                onMouseLeave={e=>{e.currentTarget.style.background='rgba(7,0,15,.7)';e.currentTarget.style.borderColor='rgba(255,255,255,.15)'}}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
              </button>
            </>
          )}

          {/* Dot indicators */}
          {activeImages.length > 1 && (
            <div style={{ position:'absolute', bottom:12, left:'50%', transform:'translateX(-50%)', display:'flex', gap:6, zIndex:3 }}>
              {activeImages.map((_,i) => (
                <button key={i} onClick={e=>{e.stopPropagation();setGalleryIdx(i)}} aria-label={`Image ${i+1}`}
                  style={{ width: i===galleryIdx?20:7, height:7, borderRadius:4, border:'none', cursor:'pointer', transition:'all .25s', background: i===galleryIdx ? 'var(--pur-l)' : 'rgba(255,255,255,.3)', padding:0, minWidth:7, minHeight:7 }}/>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{ width:'100%', aspectRatio:'1', borderRadius:8, background:'linear-gradient(145deg,rgba(17,0,34,.9),rgba(59,31,74,.4))', border:'1px solid var(--bdr)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'6rem', opacity:.15 }}>👜</div>
      )}

      {/* ── Thumbnails ── */}
      {activeImages.length > 1 && (
        <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:4, scrollbarWidth:'none' }}>
          {activeImages.map((img,i) => (
            <button key={i} onClick={()=>setGalleryIdx(i)} aria-label={`View image ${i+1}`} aria-pressed={galleryIdx===i}
              style={{ flexShrink:0, width:72, height:72, borderRadius:6, overflow:'hidden', padding:0, cursor:'pointer', border: galleryIdx===i ? '2px solid var(--pur-l)' : '2px solid rgba(255,255,255,.1)', transition:'border-color .2s, transform .2s', transform: galleryIdx===i ? 'scale(1.05)' : 'scale(1)', background:'rgba(59,31,74,.3)', minWidth:44, minHeight:44 }}>
              <img src={img} alt={`View ${i+1}`} style={{ width:'100%', height:'100%', objectFit:'cover' }} draggable={false}/>
            </button>
          ))}
        </div>
      )}

      {/* ── Variant picker ── */}
      {hasVariants && (
        <div>
          <p style={{ fontSize:'.68rem', letterSpacing:'.25em', textTransform:'uppercase', color:'var(--muted)', marginBottom:10 }}>
            Style — <span style={{ color:'var(--pur-l)', textTransform:'none', letterSpacing:'normal' }}>{selVariant?.name}</span>
          </p>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {product.variants.map(v => {
              const thumb  = v.images?.[0] || null
              const oos    = (v.stock ?? 0) === 0
              const isSel  = selVariant?.id === v.id
              return (
                <button key={v.id} type="button" onClick={() => { if (!oos) pickVariant(v) }}
                  title={v.name + (oos ? ' — Sold out' : '')}
                  aria-label={v.name} aria-pressed={isSel}
                  style={{ width:60, height:60, borderRadius:6, overflow:'hidden', padding:0, cursor: oos ? 'not-allowed' : 'pointer', border: isSel ? '2px solid var(--pur-l)' : '2px solid rgba(255,255,255,.15)', background:'rgba(59,31,74,.5)', transform: isSel ? 'scale(1.08)' : 'scale(1)', transition:'transform .2s, border-color .2s, box-shadow .2s', opacity: oos ? 0.45 : 1, boxShadow: isSel ? '0 0 0 3px rgba(196,168,255,.25)' : 'none', position:'relative', flexShrink:0, minWidth:44, minHeight:44 }}>
                  {thumb
                    ? <img src={thumb} alt={v.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} draggable={false}/>
                    : <div style={{ width:'100%', height:'100%', background:'rgba(139,92,246,.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.7rem', color:'var(--pur-l)' }}>👜</div>
                  }
                  {oos && <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.55)', display:'flex', alignItems:'center', justifyContent:'center' }}><span style={{ fontSize:7, color:'#f87171', fontWeight:700 }}>OUT</span></div>}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
