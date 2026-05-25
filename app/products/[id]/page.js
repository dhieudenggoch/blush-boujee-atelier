import { notFound } from 'next/navigation'
import Link from 'next/link'
import Navbar from '../../../components/Navbar'
import Footer from '../../../components/Footer'
import ProductActions from './ProductActions'

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
  try { const { readProducts } = require('../../../lib/db'); return readProducts().filter(r => r.id !== p.id && r.category === p.category).slice(0, 3) }
  catch { return [] }
}

export async function generateMetadata({ params }) {
  const p = await getProduct(params.id)
  return p ? { title: `${p.name} | Blush & Boujee Atelier`, description: p.description } : { title: 'Not Found' }
}

export default async function ProductPage({ params }) {
  const product = await getProduct(params.id)
  if (!product) notFound()
  const related = await getRelated(product)
  const whatsappNumber = await getWhatsappNumber()

  // Fix: only show discount if discountPercent > 0 OR there's a valid originalPrice higher than price
  const hd   = product.originalPrice && Number(product.originalPrice) > Number(product.price)
  const disc = product.discountPercent && product.discountPercent > 0
    ? product.discountPercent
    : (hd ? Math.round((1 - product.price / product.originalPrice) * 100) : 0)

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '7rem 1.25rem 5rem' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', fontSize: '.78rem', color: 'var(--muted)', marginBottom: '2.5rem', letterSpacing: '.1em' }}>
          <Link href="/" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Home</Link>
          <span>/</span>
          <Link href="/products" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Bags</Link>
          <span>/</span>
          <span style={{ color: 'var(--textm)' }}>{product.name}</span>
        </div>

        <style>{`@media(min-width:768px){.pg{grid-template-columns:1fr 1fr!important}}`}</style>
        <div className="pg" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3rem' }}>

          {/* Image */}
          <div>
            <div className="zoom" style={{ aspectRatio: '1', borderRadius: 6, overflow: 'hidden', background: 'rgba(59,31,74,.3)', border: '1px solid var(--bdr)' }}>
              {product.images?.[0]
                ? <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8rem', opacity: .1 }}>👜</div>}
            </div>
            {product.images?.length > 1 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginTop: 10 }}>
                {product.images.map((img, i) => (
                  <div key={i} style={{ aspectRatio: '1', borderRadius: 4, overflow: 'hidden', background: 'rgba(59,31,74,.3)', border: '1px solid var(--bdr)' }}>
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: '1rem', alignItems: 'center' }}>
              <span style={{ fontSize: 10, letterSpacing: '.4em', textTransform: 'uppercase', color: 'var(--pur-l)' }}>{product.category}</span>
              {product.tags?.includes('new')        && <span className="bdg bdg-new">New</span>}
              {product.tags?.includes('bestseller') && <span className="bdg bdg-best">Best Seller</span>}
              {product.tags?.includes('limited')    && <span className="bdg bdg-ltd">Limited Edition</span>}
            </div>

            <h1 className="d" style={{ color: '#fff', fontSize: 'clamp(2rem,5vw,3.5rem)', lineHeight: 1.15, marginBottom: '1rem' }}>{product.name}</h1>

            {/* Price — only show strikethrough when discount is real */}
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
              <span style={{ color: 'var(--pur-l)', fontSize: '1.75rem', fontWeight: 500 }}>{fmt(product.price)}</span>
              {disc > 0 && hd && (
                <>
                  <span style={{ color: 'var(--muted)', fontSize: '1.2rem', textDecoration: 'line-through' }}>{fmt(product.originalPrice)}</span>
                  <span className="bdg bdg-sale">Save {disc}%</span>
                </>
              )}
            </div>

            <div style={{ width: 64, height: 1, background: 'linear-gradient(90deg,var(--pur),transparent)', marginBottom: '1.25rem' }} />
            <p style={{ color: 'var(--textm)', lineHeight: 1.8, fontWeight: 300, marginBottom: '1.5rem' }}>{product.description}</p>

            {product.stock === 0 && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f87171' }} />
                <span style={{ fontSize: '.78rem', color: '#f87171', letterSpacing: '.1em' }}>Out of Stock</span>
              </div>
            )}
            {product.stock > 0 && product.stock <= 10 && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--gold)' }} />
                <span style={{ fontSize: '.78rem', color: 'var(--gold)', letterSpacing: '.1em' }}>Only {product.stock} remaining</span>
              </div>
            )}
            {product.stock > 10 && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80' }} />
                <span style={{ fontSize: '.78rem', color: '#4ade80', letterSpacing: '.1em' }}>In Stock</span>
              </div>
            )}

            <ProductActions product={product} whatsappNumber={whatsappNumber} />

            <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(139,92,246,.12)', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                ['✦', 'Premium Materials',     'Only the finest leathers & fabrics'],
                ['◇', 'Crafted with Care',      'Quality stitching and hardware'],
                ['◉', 'Free Delivery 500K+',    'Free on orders UGX 500,000+'],
                ['♡', '7-Day Returns',           'Hassle-free return within 7 days'],
              ].map(([icon, label, desc]) => (
                <div key={label} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--pur)', fontSize: '.78rem', marginTop: 2 }}>{icon}</span>
                  <div>
                    <span style={{ color: '#fff', fontSize: '.78rem', fontWeight: 500 }}>{label}</span>
                    <span style={{ color: 'var(--muted)', fontSize: '.78rem', marginLeft: 8 }}>{desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div style={{ marginTop: '5rem' }}>
            <div className="divider" style={{ marginBottom: '2.5rem' }}><span>You May Also Love</span></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16 }}>
              {related.map(r => (
                <Link key={r.id} href={`/products/${r.id}`} style={{ textDecoration: 'none' }}>
                  <div className="card" style={{ borderRadius: 6, overflow: 'hidden' }}>
                    <div className="zoom" style={{ aspectRatio: '1', background: 'rgba(59,31,74,.3)' }}>
                      {r.images?.[0]
                        ? <img src={r.images[0]} alt={r.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', opacity: .1 }}>👜</div>}
                    </div>
                    {r.colors?.length > 0 && (
                      <div style={{ padding: '8px 12px 0', display: 'flex', gap: 5 }}>
                        {r.colors.map((c, i) => <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: c, border: '1px solid rgba(255,255,255,.3)' }} />)}
                      </div>
                    )}
                    <div style={{ padding: '0.75rem 1rem 1rem' }}>
                      <p style={{ fontSize: 9, color: 'var(--pur-l)', letterSpacing: '.3em', textTransform: 'uppercase', marginBottom: 4 }}>{r.category}</p>
                      <h3 className="d" style={{ color: '#fff', fontSize: '1rem' }}>{r.name}</h3>
                      <p style={{ color: 'var(--pur-l)', marginTop: 6, fontSize: '.875rem' }}>{fmt(r.price)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
