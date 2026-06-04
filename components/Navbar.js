'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const fmt = n => 'UGX ' + Number(n||0).toLocaleString('en-UG',{minimumFractionDigits:0,maximumFractionDigits:0})

export default function Navbar() {
  const [cart,     setCart]     = useState([])
  const [drawer,   setDrawer]   = useState(false)
  const [menu,     setMenu]     = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mounted,  setMounted]  = useState(false)

  useEffect(() => {
    setMounted(true)
    const sync = () => setCart(JSON.parse(localStorage.getItem('bb_cart')||'[]'))
    sync()
    window.addEventListener('bb_cart_updated', sync)
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll)
    return () => {
      window.removeEventListener('bb_cart_updated', sync)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  const count = cart.reduce((s,i) => s + i.qty, 0)
  const sub   = cart.reduce((s,i) => s + i.price * i.qty, 0)

  const chgQty = (id, d) => {
    const u = cart.map(i => i.id===id ? {...i, qty:Math.max(1,i.qty+d)} : i)
    localStorage.setItem('bb_cart', JSON.stringify(u)); setCart(u)
    window.dispatchEvent(new Event('bb_cart_updated'))
  }
  const del = id => {
    const u = cart.filter(i => i.id!==id)
    localStorage.setItem('bb_cart', JSON.stringify(u)); setCart(u)
    window.dispatchEvent(new Event('bb_cart_updated'))
  }

  const navBg = mounted && scrolled
    ? 'rgba(9,0,18,0.94)'
    : 'transparent'
  const navBdr = mounted && scrolled
    ? '1px solid rgba(139,92,246,0.18)'
    : 'none'

  return (
    <>
      <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:50,transition:'background .4s,border .4s',background:navBg,backdropFilter:mounted&&scrolled?'blur(16px)':'none',borderBottom:navBdr}}>
        <div style={{maxWidth:1280,margin:'0 auto',padding:'0 1.25rem',display:'flex',alignItems:'center',justifyContent:'space-between',height:'clamp(72px,10vw,136px)'}}>

          {/* Hamburger — only on mobile (hidden via CSS .bb-ham) */}
          <button
            onClick={()=>setMenu(o=>!o)}
            aria-label={menu ? 'Close menu' : 'Open menu'}
            style={{background:'none',border:'none',cursor:'pointer',color:'var(--pur-l)',padding:8,flexShrink:0,touchAction:'manipulation',minWidth:44,minHeight:44,display:'flex',alignItems:'center',justifyContent:'center'}}
            className="bb-ham"
          >
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menu
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12"/>
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16"/>}
            </svg>
          </button>

          {/* Logo */}
          <Link href="/" style={{position:'absolute',left:'50%',transform:'translateX(-50%)',textDecoration:'none',display:'flex',alignItems:'center',justifyContent:'center',background:'none',border:'none',outline:'none'}}>
            <Image
              src="/images/logo.png"
              alt="Blush & Boujee Atelier"
              width={320}
              height={213}
              style={{width:'auto',height:'clamp(64px,10vw,120px)',objectFit:'contain',background:'transparent',filter:'brightness(1.15) saturate(1.2)'}}
              priority
            />
          </Link>

          <div style={{flex:1}} />

          {/* Desktop nav links — hidden on mobile via CSS */}
          <div className="bb-desk-icon" style={{position:'absolute',left:'50%',transform:'translateX(-50%)',top:'50%',marginTop:50,display:'flex',gap:28,alignItems:'center',pointerEvents:'none'}}>
            {[
              {l:'All Bags',       h:'/products'},
              {l:'Crossbody',      h:'/products?category=Crossbody%20Bags'},
              {l:'Tote Bags',      h:'/products?category=Tote%20Bags'},
              {l:'Feminine Bags',  h:'/products?category=Feminine%20Bags'},
            ].map(lnk => (
              <Link key={lnk.h} href={lnk.h}
                style={{fontSize:'.68rem',letterSpacing:'.28em',textTransform:'uppercase',color:'var(--muted)',textDecoration:'none',transition:'color .2s',pointerEvents:'auto'}}
                onMouseEnter={e=>e.target.style.color='var(--pur-l)'}
                onMouseLeave={e=>e.target.style.color='var(--muted)'}
              >
                {lnk.l}
              </Link>
            ))}
          </div>

          {/* Right icons */}
          <div style={{display:'flex',alignItems:'center',gap:16}}>
            <Link href="/products" aria-label="Browse" style={{color:'var(--muted)',display:'flex'}} className="bb-desk-icon">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </Link>
            <button onClick={()=>setDrawer(true)} aria-label="Cart" style={{background:'none',border:'none',cursor:'pointer',color:'var(--muted)',position:'relative',padding:8,display:'flex',alignItems:'center',justifyContent:'center',minWidth:44,minHeight:44,touchAction:'manipulation'}}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
              </svg>
              {mounted && count > 0 && (
                <span style={{position:'absolute',top:-4,right:-4,width:16,height:16,borderRadius:'50%',background:'var(--pur-d)',color:'#fff',fontSize:9,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:600}}>
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {menu && (
          <div style={{background:'rgba(9,0,18,0.97)',borderTop:'1px solid rgba(139,92,246,0.14)',padding:'6px 20px 12px'}}>
            {[
              {l:'All Bags',       h:'/products'},
              {l:'Crossbody Bags', h:'/products?category=Crossbody%20Bags'},
              {l:'Tote Bags',      h:'/products?category=Tote%20Bags'},
              {l:'Feminine Bags',  h:'/products?category=Feminine%20Bags'},
            ].map(lnk => (
              <Link key={lnk.h} href={lnk.h} onClick={()=>setMenu(false)}
                style={{display:'block',padding:'14px 0',fontSize:'.78rem',letterSpacing:'.3em',textTransform:'uppercase',color:'var(--textm)',textDecoration:'none',borderBottom:'1px solid rgba(139,92,246,0.08)'}}>
                {lnk.l}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Responsive helper — in globals.css we handle .bb-ham and .bb-desk-icon */}

      {/* CART DRAWER */}
      {drawer && (
        <>
          <div className="overlay" onClick={()=>setDrawer(false)}/>
          <div className="drawer">
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'1.25rem',borderBottom:'1px solid rgba(139,92,246,0.18)'}}>
              <div>
                <h2 className="d" style={{fontSize:'1.3rem',color:'#fff'}}>Your Bag</h2>
                <p style={{fontSize:10,letterSpacing:'.35em',textTransform:'uppercase',color:'var(--muted)',marginTop:2}}>{count} item{count!==1?'s':''}</p>
              </div>
              <button onClick={()=>setDrawer(false)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--muted)'}}>
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div style={{flex:1,overflowY:'auto',padding:'1rem'}}>
              {cart.length===0 ? (
                <div style={{textAlign:'center',padding:'4rem 1rem'}}>
                  <div style={{fontSize:'3rem',marginBottom:'1rem'}}>🛍️</div>
                  <p className="d" style={{color:'var(--textm)',fontSize:'1.2rem'}}>Your bag is empty</p>
                  <p style={{color:'var(--muted)',fontSize:'.8rem',marginTop:8}}>Add something beautiful</p>
                  <button onClick={()=>setDrawer(false)} className="btn-o" style={{marginTop:'1.5rem',width:'auto',display:'inline-block',padding:'.7rem 2rem'}}>Shop Now</button>
                </div>
              ) : cart.map(item => (
                <div key={item.id+item.selectedColor} style={{display:'flex',gap:12,padding:12,marginBottom:10,background:'rgba(26,0,52,0.7)',border:'1px solid var(--bdr)',borderRadius:4}}>
                  <div style={{width:60,height:60,flexShrink:0,borderRadius:4,overflow:'hidden',background:'rgba(59,31,74,0.5)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                    {item.image ? <img src={item.image} alt={item.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/> : <span style={{fontSize:'1.6rem'}}>👜</span>}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <p className="d drawer-item-name" style={{color:'#fff',fontSize:'.88rem',lineHeight:1.3}}>{item.name}</p>
                    {item.selectedColor && (
                      <div style={{display:'flex',alignItems:'center',gap:5,marginTop:3}}>
                        <div style={{width:10,height:10,borderRadius:'50%',background:item.selectedColor,border:'1px solid rgba(255,255,255,0.3)'}}/>
                        <span style={{fontSize:'.68rem',color:'var(--muted)'}}>Colour selected</span>
                      </div>
                    )}
                    <p style={{color:'var(--pur-l)',fontSize:'.85rem',marginTop:4}}>{fmt(item.price*item.qty)}</p>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:8}}>
                      <div className="stepper">
                        <button className="s-btn" onClick={()=>chgQty(item.id,-1)}>−</button>
                        <span className="s-val" style={{fontSize:'.82rem'}}>{item.qty}</span>
                        <button className="s-btn" onClick={()=>chgQty(item.id,1)}>+</button>
                      </div>
                      <button onClick={()=>del(item.id)} style={{background:'none',border:'none',cursor:'pointer',color:'rgba(239,68,68,0.55)',fontSize:'.78rem'}}>Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {cart.length > 0 && (
              <div style={{padding:'1.25rem',borderTop:'1px solid rgba(139,92,246,0.18)'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                  <span style={{color:'var(--textm)',fontSize:'.9rem'}}>Subtotal</span>
                  <span className="d" style={{color:'#fff',fontSize:'1.3rem'}}>{fmt(sub)}</span>
                </div>
                <p style={{color:'var(--muted)',fontSize:10,textAlign:'center',marginBottom:12}}>Delivery calculated at checkout</p>
                <Link href="/checkout" onClick={()=>setDrawer(false)}><button className="btn-p" style={{marginBottom:8}}>Checkout</button></Link>
                <button onClick={()=>setDrawer(false)} className="btn-o">Continue Shopping</button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  )
}
