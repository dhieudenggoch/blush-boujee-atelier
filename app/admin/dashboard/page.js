'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminNav from '../../../components/AdminNav'

const fmt = n => 'UGX ' + Number(n||0).toLocaleString('en-UG',{minimumFractionDigits:0,maximumFractionDigits:0})

export default function Dashboard() {
  const [products, setProducts] = useState([])
  const [orders,   setOrders]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const router = useRouter()

  useEffect(() => {
    Promise.all([fetch('/api/products').then(r=>r.json()), fetch('/api/orders').then(r=>r.json())])
      .then(([p, o]) => {
        if (p.error==='Unauthorized'||o.error==='Unauthorized') { router.push('/admin'); return }
        setProducts(p.products||[]); setOrders(o.orders||[]); setLoading(false)
      }).catch(()=>router.push('/admin'))
  }, [])

  const revenue  = orders.filter(o=>o.status!=='cancelled').reduce((s,o)=>s+(o.total||0),0)
  const pending  = orders.filter(o=>o.status==='pending').length
  const lowStock = products.filter(p=>p.stock<=5&&p.stock>0).length

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{textAlign:'center'}}><div className="shimmer d" style={{fontSize:'2.5rem',fontWeight:700}}>B&B</div><p style={{color:'var(--muted)',fontSize:'.78rem',letterSpacing:'.3em',marginTop:12,animation:'pulse 1.5s infinite'}}>Loading…</p></div>
    </div>
  )

  const card = {background:'rgba(17,0,34,.88)',border:'1px solid var(--bdr)',borderRadius:6,padding:'1.25rem'}

  return (
    <div style={{minHeight:'100vh'}}>
      <AdminNav/>
      <div style={{maxWidth:1280,margin:'0 auto',padding:'2rem 1.25rem'}}>
        <div style={{marginBottom:'2rem'}}>
          <h1 className="d" style={{color:'#fff',fontSize:'2rem'}}>Dashboard</h1>
          <p style={{color:'var(--muted)',fontSize:'.84rem',marginTop:4}}>{new Date().toLocaleDateString('en-UG',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
        </div>

        {/* Stats */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12,marginBottom:'1.5rem'}}>
          <style>{`@media(min-width:640px){.stat-grid{grid-template-columns:repeat(4,1fr)!important}}`}</style>
          {[
            {label:'Total Revenue',   value:fmt(revenue),   sub:`${orders.length} orders`,       color:'#a78bfa'},
            {label:'Pending Orders',  value:pending,         sub:'Need attention',                color:pending>0?'#fbbf24':'#4ade80'},
            {label:'Total Products',  value:products.length, sub:'In store',                      color:'#60a5fa'},
            {label:'Low Stock',       value:lowStock,        sub:'5 or fewer remaining',          color:lowStock>0?'#f87171':'#4ade80'},
          ].map(s=>(
            <div key={s.label} className="stat-grid" style={card}>
              <p style={{fontSize:'.65rem',letterSpacing:'.2em',textTransform:'uppercase',color:'var(--muted)',marginBottom:8}}>{s.label}</p>
              <p className="d" style={{fontSize:'2rem',color:s.color}}>{s.value}</p>
              <p style={{fontSize:'.72rem',color:'var(--muted)',marginTop:4}}>{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:12,marginBottom:'1.5rem'}}>
          {[
            {href:'/admin/upload',   emoji:'📦', title:'Add New Product', desc:'Upload images & create listing', highlight:true},
            {href:'/admin/orders',   emoji:'📋', title:'Manage Orders',   desc:`${pending} pending orders`},
            {href:'/admin/products', emoji:'✏️', title:'Edit Products',   desc:`${products.length} products`},
            {href:'/admin/settings', emoji:'⚙️', title:'Settings',        desc:'Delivery, mobile money'},
          ].map(q=>(
            <Link key={q.href} href={q.href} style={{textDecoration:'none'}}>
              <div style={{...card,cursor:'pointer',transition:'transform .25s,border-color .25s',background:q.highlight?'linear-gradient(135deg,rgba(76,29,148,.4),rgba(17,0,34,.88))':'rgba(17,0,34,.88)',borderColor:q.highlight?'rgba(139,92,246,.4)':'var(--bdr)'}}>
                <div style={{fontSize:'2rem',marginBottom:10}}>{q.emoji}</div>
                <h3 style={{color:'#fff',fontSize:'.88rem',fontWeight:500,letterSpacing:'.05em'}}>{q.title}</h3>
                <p style={{color:'var(--muted)',fontSize:'.78rem',marginTop:4}}>{q.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Orders */}
        <div style={{...card,padding:0,overflow:'hidden'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'1rem 1.25rem',borderBottom:'1px solid rgba(139,92,246,.15)'}}>
            <h2 style={{fontSize:'.7rem',letterSpacing:'.25em',textTransform:'uppercase',color:'var(--pur-l)'}}>Recent Orders</h2>
            <Link href="/admin/orders" style={{color:'var(--muted)',fontSize:'.75rem',textDecoration:'none',letterSpacing:'.1em'}}>View All →</Link>
          </div>
          {orders.length===0 ? (
            <div style={{padding:'3rem',textAlign:'center'}}><p className="d" style={{color:'var(--textm)',fontSize:'1.5rem'}}>No orders yet</p></div>
          ) : (
            <div style={{overflowX:'auto'}}>
              <table className="atbl">
                <thead><tr><th>Order ID</th><th>Customer</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th></tr></thead>
                <tbody>
                  {orders.slice(0,8).map(o=>(
                    <tr key={o.id}>
                      <td style={{fontFamily:'monospace',color:'var(--pur-l)',fontSize:'.78rem'}}>{o.id}</td>
                      <td><div style={{color:'#fff',fontSize:'.84rem'}}>{o.customer?.firstName} {o.customer?.lastName}</div><div style={{color:'var(--muted)',fontSize:'.72rem'}}>{o.customer?.email}</div></td>
                      <td style={{color:'#fff',fontWeight:500}}>{fmt(o.total)}</td>
                      <td><span style={{fontSize:'.72rem',color:'var(--textm)',letterSpacing:'.05em'}}>{o.paymentMethod==='mobilemoney'?'📱 Mobile Money':'💵 Cash on Delivery'}</span></td>
                      <td><span className={`sp sp-${o.status}`}>{o.status}</span></td>
                      <td style={{color:'var(--muted)',fontSize:'.75rem'}}>{new Date(o.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
