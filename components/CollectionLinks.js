'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const COLLECTIONS = [
  { name:'All Bags',       href:'/products',                            emoji:'👜', desc:'The full luxury edit' },
  { name:'Crossbody Bags', href:'/products?category=Crossbody%20Bags', emoji:'👛', desc:'Hands-free elegance' },
  { name:'Tote Bags',      href:'/products?category=Tote%20Bags',      emoji:'🛍️', desc:'Spacious & structured' },
  { name:'Feminine Bags',  href:'/products?category=Feminine%20Bags',  emoji:'💜', desc:'Soft. Dreamy. You.' },
]

export default function CollectionLinks() {
  const [active, setActive] = useState(null)
  const router = useRouter()

  useEffect(() => {
    if (!active) return
    const t = setTimeout(() => setActive(null), 3000)
    return () => clearTimeout(t)
  }, [active])

  const handleClick = (coll) => {
    setActive(coll.name)
    router.push(coll.href)
  }

  return (
    <>
      {/* Banner — only mounted on client, no SSR mismatch */}
      {active && (
        <div style={{
          position:'fixed',top:72,left:0,right:0,zIndex:49,
          padding:'14px 24px',
          background:'linear-gradient(90deg,rgba(76,29,148,0.96),rgba(109,40,217,0.96),rgba(76,29,148,0.96))',
          borderBottom:'1px solid rgba(192,132,252,0.3)',
          backdropFilter:'blur(12px)',
          display:'flex',alignItems:'center',justifyContent:'center',gap:16,flexWrap:'wrap',
          animation:'slideDown .4s cubic-bezier(.34,1.56,.64,1)',
        }}>
          <style>{`
            @keyframes slideDown{from{transform:translateY(-100%);opacity:0}to{transform:none;opacity:1}}
            @keyframes textPopIn{from{transform:scale(.8);opacity:0}to{transform:scale(1);opacity:1}}
          `}</style>
          <span style={{fontSize:'1.5rem'}}>{COLLECTIONS.find(c=>c.name===active)?.emoji}</span>
          <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'clamp(1rem,2.5vw,1.4rem)',color:'#fff',fontStyle:'italic',letterSpacing:'.05em',animation:'textPopIn .5s .1s both'}}>
            Now browsing: {active}
          </span>
          <span style={{background:'rgba(255,255,255,0.12)',border:'1px solid rgba(255,255,255,0.2)',color:'#fff',fontSize:'.62rem',padding:'3px 12px',letterSpacing:'.2em',textTransform:'uppercase',borderRadius:20}}>✦ Luxury</span>
          <span style={{background:'rgba(255,255,255,0.12)',border:'1px solid rgba(255,255,255,0.2)',color:'#fff',fontSize:'.62rem',padding:'3px 12px',letterSpacing:'.2em',textTransform:'uppercase',borderRadius:20}}>✦ Curated</span>
        </div>
      )}

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:14}}>
        {COLLECTIONS.map((coll) => (
          <button
            key={coll.name}
            onClick={() => handleClick(coll)}
            style={{
              position:'relative',borderRadius:8,overflow:'hidden',cursor:'pointer',
              border:`1px solid ${active===coll.name ? 'rgba(192,132,252,0.7)' : 'var(--bdr)'}`,
              background:'linear-gradient(140deg,rgba(17,0,34,0.9),rgba(26,0,52,0.92))',
              padding:0,transition:'transform .35s,border-color .35s,box-shadow .35s',
              boxShadow:active===coll.name ? '0 0 0 2px rgba(192,132,252,0.3),0 16px 40px rgba(109,40,217,0.4)' : 'none',
            }}
          >
            <div style={{padding:'2rem 1.5rem',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:10,minHeight:160}}>
              <span style={{fontSize:'3rem',transition:'transform .3s'}}>{coll.emoji}</span>
              <h3 className="d" style={{color:'#fff',fontSize:'1.15rem',textAlign:'center'}}>{coll.name}</h3>
              <p style={{color:'var(--muted)',fontSize:'.78rem',letterSpacing:'.1em',textAlign:'center'}}>{coll.desc}</p>
              <span style={{color:'var(--pur-l)',fontSize:'.68rem',letterSpacing:'.25em',textTransform:'uppercase',marginTop:4}}>Shop Now →</span>
            </div>
          </button>
        ))}
      </div>
    </>
  )
}
