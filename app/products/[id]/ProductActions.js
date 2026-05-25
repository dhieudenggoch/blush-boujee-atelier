'use client'
import { useState } from 'react'

const fmt = n => 'UGX ' + Number(n||0).toLocaleString('en-UG',{minimumFractionDigits:0,maximumFractionDigits:0})

export default function ProductActions({ product, whatsappNumber }) {
  const [qty,       setQty]       = useState(1)
  const [added,     setAdded]     = useState(false)
  const [selColor,  setSelColor]  = useState(product.colors?.[0] || null)

  const add = () => {
    const cart = JSON.parse(localStorage.getItem('bb_cart')||'[]')
    const ex = cart.find(i => i.id===product.id && i.selectedColor===selColor)
    if (ex) ex.qty += qty
    else cart.push({
      id: product.id, name: product.name, price: product.price,
      category: product.category, image: product.images?.[0]||null,
      selectedColor: selColor, qty,
    })
    localStorage.setItem('bb_cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('bb_cart_updated'))
    setAdded(true)
    setTimeout(() => setAdded(false), 3000)
  }

  if (product.stock === 0) return (
    <button disabled className="btn-p" style={{opacity:.5,cursor:'not-allowed'}}>Out of Stock</button>
  )

  return (
    <div style={{display:'flex',flexDirection:'column',gap:18}}>

      {/* Color selector */}
      {product.colors?.length > 0 && (
        <div>
          <p style={{fontSize:'.72rem',letterSpacing:'.2em',textTransform:'uppercase',color:'var(--muted)',marginBottom:10}}>
            Colour: <span style={{color:'var(--textm)',fontFamily:'monospace'}}>{selColor}</span>
          </p>
          <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
            {product.colors.map((c, i) => (
              <button key={i} type="button" onClick={()=>setSelColor(c)} title={c}
                style={{width:30,height:30,borderRadius:'50%',background:c,
                  border:selColor===c ? '3px solid var(--pur-l)' : '2px solid rgba(255,255,255,.25)',
                  cursor:'pointer',transition:'transform .2s,box-shadow .2s',
                  transform:selColor===c ? 'scale(1.2)' : 'scale(1)',
                  boxShadow:selColor===c ? '0 0 12px rgba(167,139,250,.7)' : 'none',
                }}/>
            ))}
          </div>
          {selColor && (
            <p style={{fontSize:'.7rem',color:'rgba(167,139,250,.7)',marginTop:8,letterSpacing:'.05em'}}>
              ✓ Colour {selColor} selected
            </p>
          )}
        </div>
      )}

      {/* Quantity */}
      <div style={{display:'flex',alignItems:'center',gap:16,flexWrap:'wrap'}}>
        <span style={{fontSize:'.72rem',letterSpacing:'.2em',textTransform:'uppercase',color:'var(--muted)'}}>Quantity</span>
        <div className="stepper">
          <button className="s-btn" onClick={()=>setQty(q=>Math.max(1,q-1))}>−</button>
          <span className="s-val">{qty}</span>
          <button className="s-btn" onClick={()=>setQty(q=>Math.min(product.stock,q+1))}>+</button>
        </div>
        <span style={{fontSize:'.72rem',color:'var(--muted)'}}>{product.stock} available</span>
      </div>

      {/* Add to bag */}
      <button onClick={add} className="btn-p" style={{padding:'.9rem',
        ...(added ? {background:'rgba(34,197,94,.12)',backgroundImage:'none',boxShadow:'none',color:'#4ade80',border:'1px solid rgba(34,197,94,.4)'} : {})}}>
        {added ? '✓ Added to Your Bag' : `Add to Bag — ${fmt(product.price * qty)}`}
      </button>

      <button className="btn-o" style={{padding:'.84rem'}}>♡ Save to Wishlist</button>

      {whatsappNumber && product.stock > 0 && (() => {
        const colour = selColor ? ` | Colour: ${selColor}` : ''
        const msg = encodeURIComponent(`Hi! I'd like to inquire about: ${product.name}${colour} | Qty: ${qty}`)
        return (
          <a
            href={`https://wa.me/${whatsappNumber}?text=${msg}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display:'flex', alignItems:'center', justifyContent:'center', gap:10,
              padding:'.84rem', borderRadius:4, textDecoration:'none',
              border:'1px solid rgba(37,211,102,.4)',
              background:'rgba(37,211,102,.08)',
              color:'#25D366', fontSize:'.84rem', letterSpacing:'.1em',
              transition:'background .2s, border-color .2s',
            }}
            onMouseEnter={e=>{e.currentTarget.style.background='rgba(37,211,102,.15)';e.currentTarget.style.borderColor='rgba(37,211,102,.7)'}}
            onMouseLeave={e=>{e.currentTarget.style.background='rgba(37,211,102,.08)';e.currentTarget.style.borderColor='rgba(37,211,102,.4)'}}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="#25D366" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.117.553 4.104 1.523 5.824L0 24l6.335-1.511A11.93 11.93 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.9a9.9 9.9 0 01-5.031-1.372l-.361-.214-3.741.981.998-3.648-.235-.374A9.862 9.862 0 012.1 12C2.1 6.52 6.52 2.1 12 2.1S21.9 6.52 21.9 12 17.48 21.9 12 21.9z"/>
            </svg>
            Inquiry on WhatsApp
          </a>
        )
      })()}
    </div>
  )
}
