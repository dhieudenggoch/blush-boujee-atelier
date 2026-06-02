import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import ProductGrid from './ProductGrid'

async function getAll() {
  try { const { readProducts } = require('../../lib/db'); return readProducts() } catch { return [] }
}

export default async function ProductsPage({ searchParams }) {
  const products = await getAll()
  const category = searchParams?.category || 'All'

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <div style={{ padding: '8rem 1.25rem 2rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(109,40,217,0.18) 0%,transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative' }}>
          <div className="divider" style={{ maxWidth: 240, margin: '0 auto 1.25rem' }}><span>The Collection</span></div>
          {/* This is server-rendered title — ProductGrid handles client-side title updates */}
          <h1 className="d" style={{ color: '#fff', fontSize: 'clamp(2.5rem,8vw,5rem)' }} id="collection-title">
            {category !== 'All' ? category : 'All Bags'}
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '.875rem', letterSpacing: '.1em', marginTop: 12 }}>
            {products.length} piece{products.length !== 1 ? 's' : ''} of luxury
          </p>
        </div>
      </div>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.25rem 5rem' }}>
        <ProductGrid products={products} initialCategory={category} />
      </div>
      <Footer />
    </div>
  )
}
