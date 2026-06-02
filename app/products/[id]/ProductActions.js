'use client'
import { useState, useEffect } from 'react'

const fmt = n => 'UGX ' + Number(n||0).toLocaleString('en-UG',{minimumFractionDigits:0,maximumFractionDigits:0})

export default function ProductActions({ product, whatsappNumber }) {
  const hasVariants = Array.isArray(product.variants) && product.variants.length > 0
  const [selVariant, setSelVariant] = useState(hasVariants ? product.variants[0] : null)
  const [selColor,   setSelColor]   = useState(product.colors?.[0] || null)
  const [qty,        setQty]        = useState(1)
  const [added,      setAdded]      = useState(false)
  const [wishlist,   setWishlist]   = useState(false)

  useEffect(() => {
    if (!hasVariants) return
    const handler = e => setSelVariant(e.detail)
    window.addEventListener('bb_variant_selected', handler)
    return () => window.removeEventListener('bb_variant_selected', handler)
  }, [hasVariants])

  const activeStock = hasVariants ? (selVariant?.stock ?? 0) : (product.stock ?? 0)
  const canAdd = activeStock > 0

  const add = () => {
    if (!canAdd) return
    const cart = JSON.parse(localStorage.getItem('bb_cart') || '[]')
    const matchKey = hasVariants ? selVariant?.id : selColor
    const ex = cart.find(i => i.id === product.id && (hasVariants ? i.variantId === matchKey : i.selectedColor === matchKey))
    const item = {
      id: product.id, name: product.name, price: product.price, category: product.category,
      image: hasVariants ? (selVariant?.images?.[0] || product.images?.[0] || null) : (product.images?.[0] || null),
      selectedColor: hasVariants ? null : (selColor || null),
      variantId:   hasVariants ? selVariant?.id   : null,
      variantName: hasVariants ? selVariant?.name : null,
      qty,
    }
    if (ex) ex.qty += qty
    else cart.push(item)
    localStorage.setItem('bb_cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('bb_cart_updated'))
    setAdded(true)
    setTimeout(() => setAdded(false), 2800)
  }

  const lbl = { fontSize:'.7rem', letterSpacing:'.2em', textTransform:'uppercase', color:'var(--muted)', marginBottom:8, display:'block' }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

      {/* ── Variant stock pill ── */}
      {hasVariants && (
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:7, height:7, borderRadius:'50%', flexShrink:0,
            background: activeStock > 10 ? '#4ade80' : activeStock > 0 ? '#fbbf24' : '#f87171',
            boxShadow: activeStock > 0 ? `0 0 8px ${activeStock > 10 ? 'rgba(74,222,128,.6)' : 'rgba(251,191,36,.6)'}` : 'none',
          }}/>
          <span style={{ fontSize:'.72rem', letterSpacing:'.1em', color: activeStock > 0 ? 'var(--textm)' : '#f87171' }}>
            {activeStock > 10
              ? `In stock — ${selVariant?.name}`
              : activeStock > 0
              ? `Only ${activeStock} left — ${selVariant?.name}`
              : `${selVariant?.name} is sold out`}
          </span>
        </div>
      )}

      {/* ── Legacy hex colour swatches ── */}
      {!hasVariants && product.colors?.length > 0 && (
        <div>
          <span style={lbl}>Colour — <span style={{ color:'var(--pur-l)', textTransform:'none', letterSpacing:'normal' }}>{selColor}</span></span>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            {product.colors.map((c,i) => (
              <button key={i} type="button" onClick={() => setSelColor(c)}
                aria-label={`Colour ${c}`} aria-pressed={selColor===c}
                title={c}
                style={{ width:32, height:32, borderRadius:'50%', background:c,
                  border: selColor===c ? '3px solid var(--pur-l)' : '2px solid rgba(255,255,255,.2)',
                  cursor:'pointer', transition:'transform .2s, box-shadow .2s',
                  transform: selColor===c ? 'scale(1.2)' : 'scale(1)',
                  boxShadow: selColor===c ? '0 0 0 3px rgba(196,168,255,.25), 0 0 16px rgba(139,92,246,.5)' : 'none',
                }} />
            ))}
          </div>
        </div>
      )}

      {/* ── Quantity ── */}
      <div>
        <span style={lbl}>Quantity</span>
        <div style={{ display:'flex', alignItems:'center', gap:0 }}>
          <div className="stepper" style={{ borderRadius:4 }}>
            <button className="s-btn" onClick={() => setQty(q => Math.max(1, q-1))}
              aria-label="Decrease quantity" style={{ borderRadius:'4px 0 0 4px' }}>−</button>
            <span className="s-val" style={{ minWidth:'2.8rem', fontSize:'.9rem', fontWeight:400 }}>{qty}</span>
            <button className="s-btn" onClick={() => setQty(q => Math.min(activeStock, q+1))}
              disabled={!canAdd || qty >= activeStock}
              aria-label="Increase quantity" style={{ borderRadius:'0 4px 4px 0' }}>+</button>
          </div>
          {activeStock > 0 && activeStock <= 10 && (
            <span style={{ marginLeft:12, fontSize:'.7rem', color:'#fbbf24', letterSpacing:'.08em' }}>
              {activeStock - qty <= 0 ? 'Max reached' : `${activeStock - qty} more available`}
            </span>
          )}
        </div>
      </div>

      {/* ── CTA buttons ── */}
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {!canAdd ? (
          <button disabled className="btn-p" style={{ opacity:.45, cursor:'not-allowed', padding:'1rem', borderRadius:4 }}>
            Sold Out
          </button>
        ) : (
          <button onClick={add} className="btn-p"
            style={{
              padding:'1rem', borderRadius:4,
              ...(added ? {
                background:'rgba(34,197,94,.1)', backgroundImage:'none',
                boxShadow:'0 0 0 1px rgba(34,197,94,.4) inset',
                color:'#4ade80', border:'none',
              } : {}),
            }}>
            {added
              ? <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                  Added to Your Bag
                </span>
              : `Add to Bag — ${fmt(product.price * qty)}`
            }
          </button>
        )}

        <button
          className="btn-o"
          onClick={() => setWishlist(w => !w)}
          aria-label={wishlist ? 'Remove from wishlist' : 'Save to wishlist'}
          style={{ padding:'.9rem', borderRadius:4, display:'flex', alignItems:'center', justifyContent:'center', gap:8,
            ...(wishlist ? { color:'#f472b6', borderColor:'rgba(244,114,182,.4)', background:'rgba(244,114,182,.06)' } : {}),
          }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill={wishlist ? '#f472b6' : 'none'} stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
          </svg>
          {wishlist ? 'Saved to Wishlist' : 'Save to Wishlist'}
        </button>

        {/* WhatsApp */}
        {whatsappNumber && canAdd && (() => {
          const colourLabel = hasVariants ? selVariant?.name : selColor
          const colourPart  = colourLabel ? ` | Colour: ${colourLabel}` : ''
          const msg = encodeURIComponent(`Hi! I'd like to inquire about: ${product.name}${colourPart} | Qty: ${qty}`)
          return (
            <a href={`https://wa.me/${whatsappNumber}?text=${msg}`}
              target="_blank" rel="noopener noreferrer"
              style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:9,
                padding:'.9rem', borderRadius:4, textDecoration:'none',
                border:'1px solid rgba(37,211,102,.25)',
                background:'rgba(37,211,102,.05)',
                color:'#25D366', fontSize:'.78rem', letterSpacing:'.12em', textTransform:'uppercase',
                transition:'background .2s, border-color .2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background='rgba(37,211,102,.12)'; e.currentTarget.style.borderColor='rgba(37,211,102,.5)' }}
              onMouseLeave={e => { e.currentTarget.style.background='rgba(37,211,102,.05)'; e.currentTarget.style.borderColor='rgba(37,211,102,.25)' }}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="#25D366" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.117.553 4.104 1.523 5.824L0 24l6.335-1.511A11.93 11.93 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.9a9.9 9.9 0 01-5.031-1.372l-.361-.214-3.741.981.998-3.648-.235-.374A9.862 9.862 0 012.1 12C2.1 6.52 6.52 2.1 12 2.1S21.9 6.52 21.9 12 17.48 21.9 12 21.9z"/>
              </svg>
              Inquiry on WhatsApp
            </a>
          )
        })()}
      </div>

      {/* ── Trust signals ── */}
      <div style={{ borderTop:'1px solid rgba(139,92,246,.1)', paddingTop:20, display:'flex', flexDirection:'column', gap:10 }}>
        {[
          { icon:<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>, label:'Secure Checkout',    desc:'SSL encrypted payments' },
          { icon:<><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></>, label:'Free Delivery 500K+', desc:'Across Kampala & beyond' },
          { icon:<><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></>, label:'7-Day Returns',       desc:'Hassle-free exchanges' },
        ].map(({ icon, label, desc }) => (
          <div key={label} style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:32, height:32, borderRadius:6, background:'rgba(139,92,246,.08)', border:'1px solid rgba(139,92,246,.15)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--pur-l)" strokeWidth="1.8" aria-hidden="true">{icon}</svg>
            </div>
            <div>
              <p style={{ fontSize:'.75rem', color:'var(--textm)', fontWeight:500, margin:0 }}>{label}</p>
              <p style={{ fontSize:'.68rem', color:'var(--muted)', margin:0 }}>{desc}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
