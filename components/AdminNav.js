'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const LINKS = [
  {l:'Dashboard',href:'/admin/dashboard'},
  {l:'Products', href:'/admin/products'},
  {l:'Add Item', href:'/admin/upload'},
  {l:'Orders',   href:'/admin/orders'},
  {l:'Settings', href:'/admin/settings'},
]

export default function AdminNav() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const logout = async () => { await fetch('/api/admin/logout',{method:'POST'}); router.push('/admin') }

  return (
    <>
      <style>{`
        .an-bar{position:sticky;top:0;z-index:50;background:rgba(9,0,18,.97);border-bottom:1px solid rgba(139,92,246,.2);backdrop-filter:blur(16px)}
        .an-inner{max-width:1280px;margin:0 auto;padding:0 1.25rem;height:54px;display:flex;align-items:center;justify-content:space-between;gap:16px}
        .an-links{display:flex;gap:4px}
        .an-link{padding:6px 12px;font-size:.7rem;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);text-decoration:none;border-radius:4px;transition:color .2s,background .2s}
        .an-link:hover{color:#fff;background:rgba(139,92,246,.15)}
        .an-ham{background:none;border:none;cursor:pointer;color:var(--pur-l);display:none}
        .an-mob{display:none;background:rgba(9,0,18,.99);border-top:1px solid rgba(139,92,246,.12);padding:8px 20px}
        .an-mob a{display:block;padding:11px 0;font-size:.78rem;letter-spacing:.3em;text-transform:uppercase;color:var(--textm);text-decoration:none;border-bottom:1px solid rgba(139,92,246,.08)}
        .an-vs{color:var(--muted);font-size:.7rem;letter-spacing:.2em;text-transform:uppercase;text-decoration:none}
        @media(max-width:640px){.an-ham{display:flex!important}.an-links{display:none!important}.an-vs{display:none!important}.an-mob.open{display:block!important}}
      `}</style>
      <header className="an-bar">
        <div className="an-inner">
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <button className="an-ham" onClick={()=>setOpen(o=>!o)}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
            <Link href="/admin/dashboard" style={{textDecoration:'none',display:'flex',alignItems:'center',gap:8}}>
              <span className="shimmer d" style={{fontSize:'1.3rem',fontWeight:700}}>B&B</span>
              <span style={{color:'var(--muted)',fontSize:'.72rem',letterSpacing:'0.3em',textTransform:'uppercase'}}>Admin</span>
            </Link>
            <nav className="an-links">
              {LINKS.map(l=><Link key={l.href} href={l.href} className="an-link">{l.l}</Link>)}
            </nav>
          </div>
          <div style={{display:'flex',gap:16,alignItems:'center'}}>
            <Link href="/" target="_blank" className="an-vs">View Store ↗</Link>
            <button onClick={logout} style={{background:'none',border:'none',cursor:'pointer',color:'var(--muted)',fontSize:'.7rem',letterSpacing:'0.2em',textTransform:'uppercase'}}>Logout</button>
          </div>
        </div>
        <div className={`an-mob${open?' open':''}`}>
          {LINKS.map(l=><Link key={l.href} href={l.href} onClick={()=>setOpen(false)}>{l.l}</Link>)}
          <Link href="/" style={{color:'var(--muted)'}}>View Store ↗</Link>
        </div>
      </header>
    </>
  )
}
