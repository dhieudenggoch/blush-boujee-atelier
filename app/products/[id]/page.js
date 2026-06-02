import { notFound } from 'next/navigation'
import Link from 'next/link'
import Navbar from '../../../components/Navbar'
import Footer from '../../../components/Footer'
import ProductActions from './ProductActions'
import ProductGallery from './ProductGallery'

const fmt = n => 'UGX ' + Number(n||0).toLocaleString('en-UG',{minimumFractionDigits:0,maximumFractionDigits:0})

async function getProduct(id) {
  try { const { readProducts } = require('../../../lib/db'); return readProducts().find(p => p.id === id) || null }
  catch { return null }
}
async function getWhatsappNumber() {
  try { const { readSettings } = require('../../../lib/db'); return readSettings().mobileMoneyNumber || null }
  catch { return null }
}
async function getRelated(p) {
  try { const { readProducts } = require('../../../lib/db'); return readProducts().filter(r => r.id !== p.id && r.category === p.category).slice(0, 4) }
  catch { return [] }
}

export async function generateMetadata({ params }) {
  const p = await getProduct(params.id)
  return p ? { title: `${p.name} | Blush & Boujee Atelier`, description: p.description } : { title: 'Not Found' }
}

export default async function ProductPage({ params }) {
  const product = await getProduct(params.id)
  if (!product) notFound()
  const related      = await getRelated(product)
  const whatsappNumber = await getWhatsappNumber()

  const hd   = product.originalPrice && Number(product.originalPrice) > Number(product.price)
  const disc = product.discountPercent && product.discountPercent > 0
    ? product.discountPercent
    : (hd ? Math.round((1 - product.price / product.originalPrice) * 100) : 0)

  // Derive first variant thumb for related cards
  const relatedThumb = r => r.variants?.[0]?.images?.[0] || r.images?.[0] || null
  const relatedVariantCount = r => r.variants?.length || 0

  return (
    <div style={{ minHeight:'100vh' }}>
      <Navbar />

      <div style={{ maxWidth:1320, margin:'0 auto', padding:'7rem 1.5rem 6rem' }}>

        {/* ── Breadcrumb ── */}
        <nav aria-label="Breadcrumb" style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap', fontSize:'.72rem', color:'var(--muted)', marginBottom:'2.5rem', letterSpacing:'.12em', textTransform:'uppercase' }}>
          <Link href="/" className="bc-link">Home</Link>
          <span style={{ opacity:.4 }}>›</span>
          <Link href="/products" className="bc-link">Bags</Link>
          <span style={{ opacity:.4 }}>›</span>
          <span style={{ color:'var(--textm)' }}>{product.name}</span>
        </nav>

        {/* ── Product grid ── */}
        <style>{`
          @media(min-width:900px){.pg{grid-template-columns:1fr 1fr!important;align-items:start}}
          @media(min-width:1200px){.pg{grid-template-columns:55% 1fr!important;gap:5rem!important}}
          .rel-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
          @media(min-width:640px){.rel-grid{grid-template-columns:repeat(4,1fr)!important}}
          .rel-card:hover .rel-img img{transform:scale(1.06)}
          .rel-img img{transition:transform .5s cubic-bezier(.4,0,.2,1)}
          ::-webkit-scrollbar{display:none}
          .bc-link{color:var(--muted);text-decoration:none;transition:color .15s}
          .bc-link:hover{color:var(--pur-l)}
          .rel-inner{border-radius:8px;overflow:hidden;border:1px solid rgba(139,92,246,.1);background:rgba(17,0,34,.6);backdrop-filter:blur(12px);transition:border-color .25s,transform .3s,box-shadow .3s}
          .rel-inner:hover{border-color:rgba(196,168,255,.3);transform:translateY(-4px);box-shadow:0 20px 48px rgba(0,0,0,.5)}
        `}</style>

        <div className="pg" style={{ display:'grid', gridTemplateColumns:'1fr', gap:'2.5rem' }}>

          {/* ── Left — sticky gallery ── */}
          <div>
            <ProductGallery product={product} />
          </div>

          {/* ── Right — product info + actions ── */}
          <div style={{ display:'flex', flexDirection:'column', gap:0 }}>

            {/* Tags row */}
            <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:'1rem', alignItems:'center' }}>
              <span style={{ fontSize:9, letterSpacing:'.45em', textTransform:'uppercase', color:'rgba(196,168,255,.6)', marginRight:4 }}>{product.category}</span>
              {product.tags?.includes('new')        && <span className="bdg bdg-new">New</span>}
              {product.tags?.includes('bestseller') && <span className="bdg bdg-best">Best Seller</span>}
              {product.tags?.includes('limited')    && <span className="bdg bdg-ltd">Limited Edition</span>}
              {product.tags?.includes('sale')       && <span className="bdg bdg-sale">Sale</span>}
              {product.tags?.includes('featured')   && <span className="bdg" style={{ background:'rgba(212,175,55,.12)', color:'#d4af37', border:'1px solid rgba(212,175,55,.25)', fontSize:9, letterSpacing:'.2em', padding:'3px 8px' }}>Featured</span>}
            </div>

            {/* Name */}
            <h1 className="d" style={{ color:'#fff', fontSize:'clamp(1.9rem,4.5vw,3.2rem)', lineHeight:1.1, marginBottom:'1.25rem', letterSpacing:'-.01em' }}>
              {product.name}
            </h1>

            {/* Price */}
            <div style={{ display:'flex', gap:14, alignItems:'center', flexWrap:'wrap', marginBottom:'1rem' }}>
              <span style={{ color:'var(--pur-l)', fontSize:'1.85rem', fontWeight:500, letterSpacing:'-.01em' }}>
                {fmt(product.price)}
              </span>
              {disc > 0 && hd && (
                <>
                  <span style={{ color:'rgba(255,255,255,.3)', fontSize:'1.1rem', textDecoration:'line-through', fontWeight:300 }}>
                    {fmt(product.originalPrice)}
                  </span>
                  <span style={{ background:'rgba(239,68,68,.12)', color:'#f87171', border:'1px solid rgba(239,68,68,.25)', fontSize:10, letterSpacing:'.15em', padding:'3px 9px', borderRadius:20, textTransform:'uppercase' }}>
                    −{disc}%
                  </span>
                </>
              )}
            </div>

            {/* Gradient rule */}
            <div style={{ width:56, height:1, background:'linear-gradient(90deg,var(--pur-l),transparent)', marginBottom:'1.25rem', borderRadius:1 }} />

            {/* Description */}
            <p style={{ color:'var(--textm)', lineHeight:1.85, fontWeight:300, fontSize:'.95rem', marginBottom:'1.75rem' }}>
              {product.description}
            </p>

            {/* Stock status (product-level, for non-variant products) */}
            {!product.variants?.length && (() => {
              const s = product.stock ?? 0
              const color = s === 0 ? '#f87171' : s <= 5 ? '#fb923c' : s <= 10 ? '#fbbf24' : '#4ade80'
              const label = s === 0 ? 'Sold Out' : s <= 5 ? `Only ${s} left` : s <= 10 ? `${s} remaining` : 'In Stock'
              return (
                <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:'1.5rem' }}>
                  <div style={{ width:7, height:7, borderRadius:'50%', background:color, boxShadow: s > 0 ? `0 0 8px ${color}88` : 'none', flexShrink:0 }} />
                  <span style={{ fontSize:'.72rem', color, letterSpacing:'.1em', textTransform:'uppercase' }}>{label}</span>
                </div>
              )
            })()}

            {/* Divider before actions */}
            <div style={{ height:1, background:'linear-gradient(90deg,rgba(139,92,246,.2),transparent)', marginBottom:'1.75rem' }} />

            <ProductActions product={product} whatsappNumber={whatsappNumber} />

            {/* Product details accordion-style */}
            <div style={{ marginTop:'2.5rem', display:'flex', flexDirection:'column', gap:0, borderTop:'1px solid rgba(139,92,246,.1)' }}>
              {[
                { icon:'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', label:'Authenticity Guaranteed', desc:'Every piece is verified before dispatch' },
                { icon:'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',               label:'Premium Packaging',        desc:'Delivered in signature gift wrapping' },
                { icon:'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z', label:'Dedicated Support', desc:'0800 BB ATELIER · Mon–Sat 9am–6pm' },
              ].map(({ icon, label, desc }) => (
                <div key={label} style={{ display:'flex', alignItems:'flex-start', gap:14, padding:'1rem 0', borderBottom:'1px solid rgba(139,92,246,.07)' }}>
                  <div style={{ width:34, height:34, borderRadius:6, background:'rgba(139,92,246,.06)', border:'1px solid rgba(139,92,246,.12)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--pur-l)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={icon}/></svg>
                  </div>
                  <div>
                    <p style={{ fontSize:'.78rem', color:'rgba(255,255,255,.85)', fontWeight:500, margin:'0 0 2px' }}>{label}</p>
                    <p style={{ fontSize:'.72rem', color:'var(--muted)', margin:0, lineHeight:1.5 }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* ── Related products ── */}
        {related.length > 0 && (
          <section style={{ marginTop:'6rem' }} aria-label="You may also love">
            <div style={{ display:'flex', alignItems:'center', gap:'1.5rem', marginBottom:'2.5rem' }}>
              <div style={{ flex:1, height:1, background:'linear-gradient(90deg,rgba(139,92,246,.25),transparent)' }} />
              <span className="d" style={{ fontSize:'clamp(.9rem,2vw,1.1rem)', letterSpacing:'.3em', textTransform:'uppercase', color:'rgba(196,168,255,.7)', whiteSpace:'nowrap' }}>You May Also Love</span>
              <div style={{ flex:1, height:1, background:'linear-gradient(270deg,rgba(139,92,246,.25),transparent)' }} />
            </div>

            <div className="rel-grid">
              {related.map(r => (
                <Link key={r.id} href={`/products/${r.id}`} style={{ textDecoration:'none' }} className="rel-card">
                  <div className="rel-inner">

                    {/* Image */}
                    <div className="rel-img" style={{ aspectRatio:'1', overflow:'hidden', background:'rgba(59,31,74,.3)', position:'relative' }}>
                      {relatedThumb(r)
                        ? <img src={relatedThumb(r)} alt={r.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                        : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', opacity:.1, fontSize:'3rem' }}>👜</div>
                      }
                      {r.tags?.includes('new') && (
                        <span style={{ position:'absolute', top:8, left:8 }} className="bdg bdg-new">New</span>
                      )}
                      {relatedVariantCount(r) > 1 && (
                        <span style={{ position:'absolute', bottom:8, right:8, background:'rgba(7,0,15,.75)', backdropFilter:'blur(6px)', border:'1px solid rgba(255,255,255,.1)', color:'rgba(255,255,255,.7)', fontSize:9, letterSpacing:'.1em', padding:'3px 8px', borderRadius:20 }}>
                          {relatedVariantCount(r)} colours
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ padding:'0.85rem 1rem 1rem' }}>
                      <p style={{ fontSize:8, color:'rgba(196,168,255,.5)', letterSpacing:'.35em', textTransform:'uppercase', marginBottom:5 }}>{r.category}</p>
                      <h3 className="d" style={{ color:'rgba(255,255,255,.9)', fontSize:'.95rem', marginBottom:6, lineHeight:1.3 }}>{r.name}</h3>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
                        <span style={{ color:'var(--pur-l)', fontSize:'.85rem', fontWeight:500 }}>{fmt(r.price)}</span>
                        {r.originalPrice && Number(r.originalPrice) > Number(r.price) && (
                          <span style={{ fontSize:'.72rem', color:'rgba(255,255,255,.3)', textDecoration:'line-through' }}>{fmt(r.originalPrice)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

      </div>
      <Footer />
    </div>
  )
}
