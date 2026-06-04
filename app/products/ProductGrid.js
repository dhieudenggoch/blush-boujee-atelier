'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const fmt = n => 'UGX ' + Number(n||0).toLocaleString('en-UG',{minimumFractionDigits:0,maximumFractionDigits:0})
const CATS  = ['All','Crossbody Bags','Tote Bags','Feminine Bags']
const SORTS = [
  {v:'default',   l:'Featured'},
  {v:'price-asc', l:'Price: Low → High'},
  {v:'price-desc',l:'Price: High → Low'},
  {v:'newest',    l:'Newest First'},
]

export default function ProductGrid({ products, initialCategory }) {
  const [cat,  setCat]  = useState(initialCategory && initialCategory !== 'All' ? initialCategory : 'All')
  const [sort, setSort] = useState('default')
  const [added,setAdded]= useState({})

  // Update the big page title when category changes
  useEffect(() => {
    const el = document.getElementById('collection-title')
    if (el) el.textContent = cat === 'All' ? 'All Bags' : cat
  }, [cat])

  let list = products.filter(p => cat === 'All' || p.category === cat)
  if (sort === 'price-asc')  list = [...list].sort((a,b) => a.price - b.price)
  if (sort === 'price-desc') list = [...list].sort((a,b) => b.price - a.price)
  if (sort === 'newest')     list = [...list].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))

  const addToCart = (e, p, selectedColor, selVariant) => {
    e.preventDefault()
    const cart = JSON.parse(localStorage.getItem('bb_cart')||'[]')
    const matchKey = selVariant ? selVariant.id : selectedColor
    const ex = cart.find(i => i.id === p.id && (selVariant ? i.variantId === matchKey : i.selectedColor === matchKey))
    const image = selVariant ? (selVariant.images?.[0] || p.images?.[0] || null) : (p.images?.[0] || null)
    if (ex) ex.qty += 1
    else cart.push({
      id: p.id, name: p.name, price: p.price, category: p.category,
      image,
      selectedColor: selVariant ? null : (selectedColor || null),
      variantId:   selVariant ? selVariant.id   : null,
      variantName: selVariant ? selVariant.name : null,
      qty: 1,
    })
    localStorage.setItem('bb_cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('bb_cart_updated'))
    setAdded(prev => ({ ...prev, [p.id]: true }))
    setTimeout(() => setAdded(prev => ({ ...prev, [p.id]: false })), 2000)
  }

  return (
    <div>
      {/* Filter bar */}
      <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between', gap:12, marginBottom:'2rem', paddingBottom:'1.25rem', borderBottom:'1px solid rgba(139,92,246,0.12)' }}>
        <div className="filter-bar">
          {CATS.map(c => (
            <button key={c} onClick={() => setCat(c)} style={{
              width:'auto', display:'inline-block', padding:'7px 14px',
              fontSize:'.7rem', letterSpacing:'.2em', textTransform:'uppercase', cursor:'pointer', transition:'all .2s',
              background: cat===c ? 'var(--pur-d)' : 'transparent',
              border: `1px solid ${cat===c ? 'rgba(139,92,246,0.5)' : 'var(--bdr)'}`,
              color: cat===c ? '#fff' : 'var(--textm)',
            }}>
              {c}
            </button>
          ))}
        </div>
        <select value={sort} onChange={e => setSort(e.target.value)} className="inp" style={{ width:'auto', minWidth:170, fontSize:'.78rem' }}>
          {SORTS.map(s => <option key={s.v} value={s.v}>{s.l}</option>)}
        </select>
      </div>

      {list.length === 0 ? (
        <div style={{ textAlign:'center', padding:'5rem 1rem' }}>
          <div style={{ fontSize:'3rem', opacity:.2, marginBottom:'1rem' }}>👜</div>
          <p className="d" style={{ color:'var(--textm)', fontSize:'1.5rem' }}>No bags in this category yet</p>
          <p style={{ color:'var(--muted)', marginTop:8, fontSize:'.875rem' }}>Check back soon.</p>
        </div>
      ) : (
        <div className="product-grid" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(270px,1fr))', gap:20 }}>
          {list.map(p => <PCard key={p.id} p={p} added={added[p.id]} onAdd={addToCart} />)}
        </div>
      )}
    </div>
  )
}

function PCard({ p, added, onAdd }) {
  const hasVariants = Array.isArray(p.variants) && p.variants.length > 0
  const [selVariant, setSelVariant] = useState(hasVariants ? p.variants[0] : null)
  const [selColor,   setSelColor]   = useState(!hasVariants ? (p.colors?.[0] || null) : null)

  // Active image: first image of selected variant, else product image
  const activeImage = hasVariants
    ? (selVariant?.images?.[0] || p.images?.[0] || null)
    : (p.images?.[0] || null)
  const activeStock = hasVariants ? (selVariant?.stock ?? 0) : (p.stock ?? 0)

  const hd   = p.originalPrice && Number(p.originalPrice) > Number(p.price)
  const disc = (p.discountPercent && p.discountPercent > 0)
    ? p.discountPercent
    : (hd ? Math.round((1 - p.price / p.originalPrice) * 100) : 0)

  return (
    <div className="card" style={{ borderRadius:6, overflow:'hidden' }}>
      <Link href={`/products/${p.id}`} style={{ textDecoration:'none', display:'block' }}>
        <div className="zoom" style={{ aspectRatio:'1', background:'rgba(59,31,74,0.3)', position:'relative', display:'block' }}>
          {activeImage
            ? <img src={activeImage} alt={selVariant?.name || p.name} style={{ width:'100%', height:'100%', objectFit:'cover', transition:'opacity .25s' }} />
            : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'5rem', opacity:.1 }}>👜</div>}
          <div style={{ position:'absolute', top:12, left:12, display:'flex', flexDirection:'column', gap:4 }}>
            {p.tags?.includes('new')        && <span className="bdg bdg-new">New</span>}
            {p.tags?.includes('bestseller') && <span className="bdg bdg-best">Best Seller</span>}
            {p.tags?.includes('limited')    && <span className="bdg bdg-ltd">Limited</span>}
            {disc > 0                        && <span className="bdg bdg-sale">−{disc}%</span>}
          </div>
          {hasVariants && p.variants.length > 1 && (
            <div style={{ position:'absolute', bottom:10, left:10, background:'rgba(7,0,15,.75)', backdropFilter:'blur(6px)', border:'1px solid rgba(255,255,255,.12)', borderRadius:20, padding:'3px 9px' }}>
              <span style={{ fontSize:9, color:'rgba(255,255,255,.8)', letterSpacing:'.08em' }}>{p.variants.length} colours</span>
            </div>
          )}
          {!hasVariants && p.colors?.length > 0 && (
            <div style={{ position:'absolute', bottom:10, left:10, display:'flex', gap:5 }}>
              {p.colors.map((col,i) => (
                <div key={i} style={{ width:13, height:13, borderRadius:'50%', background:col, border:'2px solid rgba(255,255,255,0.6)', boxShadow:'0 0 4px rgba(0,0,0,0.5)' }}/>
              ))}
            </div>
          )}
        </div>
      </Link>

      <div style={{ padding:'1rem 1.25rem' }}>
        <p style={{ fontSize:9, letterSpacing:'.3em', textTransform:'uppercase', color:'var(--pur-l)', marginBottom:4 }}>{p.category}</p>
        <Link href={`/products/${p.id}`} style={{ textDecoration:'none' }}>
          <h3 className="d" style={{ color:'#fff', fontSize:'1.1rem', lineHeight:1.3, cursor:'pointer' }}>{p.name}</h3>
        </Link>
        <p style={{ color:'var(--muted)', fontSize:'.78rem', lineHeight:1.6, marginTop:6, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>{p.description}</p>

        {/* Variant thumbnail picker */}
        {hasVariants && (
          <div style={{ marginTop:10 }}>
            <p style={{ fontSize:'.68rem', letterSpacing:'.2em', textTransform:'uppercase', color:'var(--muted)', marginBottom:7 }}>
              Colour: <span style={{ color:'var(--pur-l)', textTransform:'none', letterSpacing:'normal' }}>{selVariant?.name || '—'}</span>
            </p>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {p.variants.map(v => {
                const thumb = v.images?.[0] || null
                const oos   = (v.stock ?? 0) === 0
                const isSel = selVariant?.id === v.id
                return (
                  <button key={v.id} type="button"
                    onClick={e => { e.preventDefault(); e.stopPropagation(); if (!oos) setSelVariant(v) }}
                    title={v.name + (oos ? ' — Sold out' : '')}
                    aria-label={v.name} aria-pressed={isSel}
                    className="variant-thumb"
                    style={{
                      width:36, height:36, borderRadius:5, overflow:'hidden', padding:0,
                      cursor: oos ? 'not-allowed' : 'pointer',
                      border: isSel ? '2px solid var(--pur-l)' : '2px solid rgba(255,255,255,.15)',
                      background:'rgba(59,31,74,.5)',
                      transform: isSel ? 'scale(1.1)' : 'scale(1)',
                      transition:'transform .2s, border-color .2s, box-shadow .2s',
                      opacity: oos ? 0.45 : 1,
                      boxShadow: isSel ? '0 0 0 2px rgba(196,168,255,.25)' : 'none',
                      flexShrink: 0,
                      position: 'relative',
                    }}>
                    {thumb
                      ? <img src={thumb} alt={v.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                      : <div style={{ width:'100%', height:'100%', background: 'rgba(139,92,246,.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.6rem', color:'var(--pur-l)' }}>👜</div>
                    }
                    {oos && <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.55)', display:'flex', alignItems:'center', justifyContent:'center' }}><span style={{ fontSize:6, color:'#f87171', fontWeight:700 }}>OUT</span></div>}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Legacy hex colour selector */}
        {!hasVariants && p.colors?.length > 0 && (
          <div style={{ marginTop:10 }}>
            <p style={{ fontSize:'.68rem', letterSpacing:'.2em', textTransform:'uppercase', color:'var(--muted)', marginBottom:6 }}>
              Colour: <span style={{ color:'var(--textm)' }}>{selColor}</span>
            </p>
            <div style={{ display:'flex', gap:7, flexWrap:'wrap' }}>
              {p.colors.map((col,i) => (
                <button key={i} type="button" onClick={()=>setSelColor(col)} title={col}
                  style={{ width:22, height:22, borderRadius:'50%', background:col, cursor:'pointer', border:selColor===col?'2px solid var(--pur-l)':'2px solid rgba(255,255,255,0.2)', transition:'transform .2s,border-color .2s', transform:selColor===col?'scale(1.25)':'scale(1)', boxShadow:selColor===col?'0 0 8px rgba(167,139,250,0.6)':'none' }}/>
              ))}
            </div>
          </div>
        )}

        {/* Price */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:12, flexWrap:'wrap', gap:6 }}>
          <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
            <span style={{ color:'var(--pur-l)', fontWeight:500 }}>{fmt(p.price)}</span>
            {disc > 0 && hd && <span style={{ color:'var(--muted)', fontSize:'.8rem', textDecoration:'line-through' }}>{fmt(p.originalPrice)}</span>}
          </div>
          {activeStock > 0 && activeStock <= 5 && <span style={{ fontSize:9, color:'var(--gold)' }}>Only {activeStock} left</span>}
          {activeStock === 0 && <span style={{ fontSize:9, color:'#f87171' }}>Sold Out</span>}
        </div>

        <button
          onClick={e => onAdd(e, p, hasVariants ? null : selColor, hasVariants ? selVariant : null)}
          disabled={activeStock === 0}
          style={{
            marginTop:12, width:'100%', padding:'.75rem', fontSize:'.72rem', letterSpacing:'.18em', textTransform:'uppercase',
            cursor:p.stock===0?'not-allowed':'pointer', transition:'all .2s', border:'none', fontFamily:'Jost,sans-serif', fontWeight:500,
            ...(added
              ? { background:'rgba(34,197,94,0.12)', border:'1px solid rgba(34,197,94,0.3)', color:'#4ade80' }
              : p.stock===0
              ? { background:'rgba(17,0,34,0.5)', border:'1px solid var(--bdr)', color:'var(--muted)', opacity:.6 }
              : { background:'linear-gradient(135deg,#5b21b6,#7c3aed 50%,#8b5cf6)', color:'#fff' }
            ),
          }}>
          {added ? '✓ Added to Bag' : p.stock===0 ? 'Sold Out' : 'Add to Bag'}
        </button>
      </div>
    </div>
  )
}
