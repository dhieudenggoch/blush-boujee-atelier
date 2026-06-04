import Link from 'next/link'
import Image from 'next/image'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import CollectionLinks from '../components/CollectionLinks'

const fmt = n => 'UGX ' + Number(n||0).toLocaleString('en-UG',{minimumFractionDigits:0,maximumFractionDigits:0})

async function getFeatured() {
  try { const {readProducts}=require('../lib/db'); return readProducts().filter(p=>p.featured).slice(0,3) }
  catch { return [] }
}

export default async function Home() {
  const featured = await getFeatured()
  return (
    <div style={{minHeight:'100vh'}}>
      <Navbar/>

      {/* HERO + PILLARS — shared full-bleed background that fades out at the bottom of pillars */}
      <div style={{position:'relative'}}>
        <style>{`
          @keyframes heroFadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
          @keyframes bobble{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(-6px)}}
          .ht1{animation:heroFadeUp .8s .0s both}
          .ht2{animation:heroFadeUp .8s .12s both}
          .ht3{animation:heroFadeUp .8s .24s both}
          .ht4{animation:heroFadeUp .8s .36s both}
          .ht5{animation:heroFadeUp .8s .48s both}
          @media(max-width:860px){
            .hero-text-panel{
              left:0!important; right:0!important; top:auto!important;
              bottom:0!important; padding:2rem 1.25rem 3.5rem!important;
              width:100%!important;
              background:linear-gradient(to top,rgba(7,0,15,.98) 0%,rgba(7,0,15,.92) 55%,rgba(7,0,15,.6) 80%,transparent 100%)!important;
            }
            .hero-btns-row{flex-direction:column!important; align-items:stretch!important}
            .hero-btns-row a,.hero-btns-row button{width:100%!important; display:block!important; box-sizing:border-box!important}
            .hero-stats-row{justify-content:flex-start!important; gap:1.5rem!important}
          }
          @media(max-width:480px){
            .hero-text-panel{ padding:1.5rem 1rem 5rem!important }
            .hero-h1{font-size:clamp(2.6rem,12vw,4rem)!important}
            .hero-stats-row{gap:1rem!important}
            .hero-stat-val{font-size:1.6rem!important}
            .hero-stat-lbl{font-size:10px!important; letter-spacing:.15em!important}
            .hero-tagline{font-size:12px!important; letter-spacing:.25em!important}
          }
          @media(min-width:640px){.pillars-grid{grid-template-columns:repeat(4,1fr)!important}}
        `}</style>

        {/* Full-bleed bag image — pinned behind hero AND pillars */}
        <div style={{position:'absolute',inset:0,zIndex:0,overflow:'hidden'}}>
          <Image
            src="/images/hero-bag.png"
            alt="Luxury Handbag"
            fill
            style={{objectFit:'cover',objectPosition:'20% 45%',filter:'brightness(.88) saturate(1.08)'}}
            priority
          />
          {/* Right-side gradient — image already has natural dark right, deepen for text */}
          <div style={{
            position:'absolute',inset:0,
            background:'linear-gradient(to right, rgba(7,0,15,.1) 0%, transparent 15%, transparent 35%, rgba(7,0,15,.45) 52%, rgba(7,0,15,.88) 66%, #07000f 80%)'
          }}/>
          {/* Top navbar fade */}
          <div style={{position:'absolute',top:0,left:0,right:0,height:'22%',background:'linear-gradient(to bottom,rgba(7,0,15,.7),transparent)'}}/>
          {/* Bottom fade — dissolves fully through the pillars section */}
          <div style={{position:'absolute',bottom:0,left:0,right:0,height:'52%',background:'linear-gradient(to top,#07000f 0%,#07000f 18%,rgba(7,0,15,.97) 32%,rgba(7,0,15,.82) 50%,rgba(7,0,15,.4) 70%,transparent 100%)'}}/>
        </div>

        {/* HERO */}
        <section style={{minHeight:'100vh',position:'relative',zIndex:1}}>

          {/* Text panel — right half, vertically centered */}
          <div className="hero-text-panel" style={{
            position:'absolute',top:0,bottom:0,right:0,width:'52%',
            zIndex:2,display:'flex',flexDirection:'column',justifyContent:'center',
            padding:'8rem 5rem 4rem 3rem'
          }}>
            <div className="ht1 divider" style={{maxWidth:320,marginBottom:'1.75rem',fontSize:'1rem'}}><span>Curated Luxury Goods</span></div>

            <h1 className="ht2 d hero-h1" style={{color:'#fff',lineHeight:1.05,marginBottom:'1.25rem',fontSize:'clamp(2.8rem,5.8vw,7rem)',fontWeight:300}}>
              <span style={{display:'block'}}>Luxury You</span>
              <span className="shimmer" style={{display:'block',fontWeight:500}}>Can Carry</span>
            </h1>

            <p className="ht3" style={{color:'var(--textm)',fontSize:'clamp(1.1rem,1.6vw,1.35rem)',letterSpacing:'.04em',marginBottom:12,maxWidth:440}}>Designed for the feminine touch.</p>
            <p className="ht3 hero-tagline" style={{color:'#cdbfdf',fontSize:14,letterSpacing:'.4em',textTransform:'uppercase',marginBottom:'2.25rem'}}>Timeless · Feminine · Sophisticated</p>

            <div className="ht4 hero-btns-row" style={{display:'flex',flexWrap:'wrap',gap:12,marginBottom:'2rem'}}>
              <Link href="/products" style={{display:'block'}}><button className="btn-p" style={{whiteSpace:'nowrap',padding:'1rem 2rem',fontSize:'.88rem'}}>Shop the Collection</button></Link>
              <Link href="/products?category=Crossbody%20Bags" style={{display:'block'}}><button className="btn-o" style={{whiteSpace:'nowrap',padding:'1rem 2rem',fontSize:'.88rem'}}>Explore Categories</button></Link>
            </div>

            <div className="ht5 hero-stats-row" style={{display:'flex',gap:'2rem',paddingTop:'1.5rem',borderTop:'1px solid rgba(139,92,246,.18)',flexWrap:'nowrap'}}>
              {[['500+','Clients'],['100%','Authentic'],['Free','Delivery*']].map(([v,l])=>(
                <div key={l} style={{flexShrink:0}}>
                  <div className="d hero-stat-val" style={{fontSize:'2rem',color:'var(--pur-l)',lineHeight:1}}>{v}</div>
                  <div className="hero-stat-lbl" style={{fontSize:11,letterSpacing:'.2em',textTransform:'uppercase',color:'#c8b0e0',marginTop:6}}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{position:'absolute',bottom:28,left:'50%',transform:'translateX(-50%)',display:'flex',flexDirection:'column',alignItems:'center',gap:6,animation:'bobble 2s ease-in-out infinite',zIndex:3}}>
            <span style={{fontSize:9,letterSpacing:'.4em',textTransform:'uppercase',color:'#c8b8e8'}}>Scroll</span>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="var(--pur)"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7"/></svg>
          </div>
        </section>

        {/* PILLARS — floats over the fading bottom of the image */}
        <section style={{position:'relative',zIndex:1}}>
          {/* Fading purple gradient line */}
          <div style={{height:2,background:'linear-gradient(to right, rgba(7,0,15,1) 0%, rgba(76,29,148,.1) 12%, rgba(109,40,217,.35) 28%, rgba(139,92,246,.9) 50%, rgba(109,40,217,.35) 72%, rgba(76,29,148,.1) 88%, rgba(7,0,15,1) 100%)'}}/>
          <div style={{maxWidth:1280,margin:'0 auto',padding:'0 1.25rem'}}>
            <div className="pillars-grid" style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)'}}>
              {[['◇','Luxury Goods','Only the finest'],['✦','Premium Quality','Built to last'],['♡','Timeless Design','Always in style'],['◉','Nationwide Shipping','To your door']].map(([icon,label,desc])=>(
                <div key={label} style={{textAlign:'center',padding:'2rem 1rem',borderRight:'1px solid rgba(139,92,246,.08)',borderBottom:'1px solid rgba(139,92,246,.06)'}}>
                  <div style={{fontSize:'1.8rem',color:'var(--pur)',marginBottom:10}}>{icon}</div>
                  <div style={{fontSize:'1rem',letterSpacing:'.2em',textTransform:'uppercase',color:'#fff',marginBottom:6}}>{label}</div>
                  <div style={{fontSize:'1rem',color:'#c8b0e0'}}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* COLLECTION LINKS — with animation trigger */}
      <section style={{padding:'4rem 1.25rem 2rem',maxWidth:1280,margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:'2rem'}}>
          <div className="divider" style={{maxWidth:320,margin:'0 auto 1.25rem',fontSize:'1.1rem'}}><span>Shop by Collection</span></div>
          <p style={{color:'var(--muted)',fontSize:'1.15rem',letterSpacing:'.1em',color:'#cfc0e8'}}>Click a collection to browse</p>
        </div>
        <CollectionLinks/>
      </section>

      {/* FEATURED */}
      <section style={{padding:'3rem 1.25rem 5rem',maxWidth:1280,margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:'3rem'}}>
          <div className="divider" style={{maxWidth:240,margin:'0 auto 1.5rem'}}><span>Featured</span></div>
          <h2 className="d" style={{color:'#fff',fontSize:'clamp(3.2rem,6vw,5.5rem)'}}>The Bags</h2>
          <p style={{color:'#cfc0e8',fontSize:'1.05rem',letterSpacing:'.1em',marginTop:12}}>Handpicked. Coveted. Yours.</p>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(270px,1fr))',gap:20}}>
          {featured.length>0 ? featured.map(p=><HCard key={p.id} p={p}/>) :
            [1,2,3].map(i=>(
              <div key={i} className="card" style={{borderRadius:6,overflow:'hidden'}}>
                <div style={{aspectRatio:'1'}} className="skel"/>
                <div style={{padding:20}}><div className="skel" style={{height:16,borderRadius:4,marginBottom:10,width:'75%'}}/><div className="skel" style={{height:12,borderRadius:4,width:'50%'}}/></div>
              </div>
            ))
          }
        </div>
        <div style={{textAlign:'center',marginTop:'3rem'}}>
          <Link href="/products"><button className="btn-o" style={{width:'auto',display:'inline-block',padding:'.9rem 3rem'}}>View All Bags</button></Link>
        </div>
      </section>

      {/* QUOTE */}
      <section style={{padding:'5rem 1.25rem',background:'linear-gradient(135deg,rgba(76,29,148,.22),rgba(109,40,217,.14),rgba(76,29,148,.22))',textAlign:'center'}}>
        <div style={{maxWidth:760,margin:'0 auto'}}>
          <div style={{fontSize:'2rem',color:'var(--pur)',marginBottom:'1.5rem'}}>✦</div>
          <blockquote className="d" style={{color:'#fff',fontSize:'clamp(2rem,5vw,4rem)',fontStyle:'italic',lineHeight:1.3}}>
            "A bag is more than an accessory — it's a statement of who you are."
          </blockquote>
          <p style={{color:'#c8b8e0',fontSize:13,letterSpacing:'.4em',textTransform:'uppercase',marginTop:'2rem'}}>— Blush &amp; Boujee Atelier</p>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section style={{padding:'4rem 1.25rem',maxWidth:580,margin:'0 auto',textAlign:'center'}}>
        <div className="divider" style={{marginBottom:'2rem'}}><span>Join the Club</span></div>
        <h2 className="d" style={{color:'#fff',fontSize:'clamp(2.6rem,5vw,4rem)',marginBottom:'1rem'}}>Be the First to Know</h2>
        <p style={{color:'#ddd0f0',fontSize:'1.05rem',marginBottom:'2rem',fontWeight:300}}>New arrivals, exclusive deals, and luxury inspo — delivered to your inbox.</p>
        <div className="newsletter-row" style={{display:'flex',flexWrap:'wrap'}}>
          <input type="email" placeholder="Your email address" className="inp" style={{flex:1,minWidth:200}}/>
          <button className="btn-p" style={{width:'auto',padding:'0 1.5rem',flexShrink:0}}>Subscribe</button>
        </div>
        <p style={{color:'#c0aad8',fontSize:13,marginTop:12}}>No spam. Unsubscribe anytime.</p>
      </section>

      <Footer/>
    </div>
  )
}

function HCard({p}) {
  const hd  = p.originalPrice && p.originalPrice > p.price
  const disc = p.discountPercent && p.discountPercent > 0 ? p.discountPercent : (hd ? Math.round((1-p.price/p.originalPrice)*100) : 0)
  return (
    <Link href={`/products/${p.id}`} style={{textDecoration:'none'}}>
      <div className="card" style={{borderRadius:6,overflow:'hidden',cursor:'pointer'}}>
        <div className="zoom" style={{aspectRatio:'1',background:'rgba(59,31,74,.3)',position:'relative'}}>
          {(() => { const img = (Array.isArray(p.variants) && p.variants[0]?.images?.[0]) || p.images?.[0] || null; return img ? <img src={img} alt={p.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/> : <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'5rem',opacity:.1}}>👜</div> })()}
          <div style={{position:'absolute',top:12,left:12,display:'flex',flexDirection:'column',gap:4}}>
            {p.tags?.includes('new')&&<span className="bdg bdg-new">New</span>}
            {p.tags?.includes('bestseller')&&<span className="bdg bdg-best">Best Seller</span>}
            {disc>0&&<span className="bdg bdg-sale">−{disc}%</span>}
          </div>
          {/* Variant / colour indicator */}
          {Array.isArray(p.variants) && p.variants.length > 0 ? (
            <div style={{position:'absolute',bottom:10,left:10,background:'rgba(7,0,15,.75)',backdropFilter:'blur(6px)',border:'1px solid rgba(255,255,255,.12)',borderRadius:20,padding:'3px 9px'}}>
              <span style={{fontSize:9,color:'rgba(255,255,255,.85)',letterSpacing:'.08em'}}>{p.variants.length} colour{p.variants.length>1?'s':''}</span>
            </div>
          ) : p.colors?.length > 0 ? (
            <div style={{position:'absolute',bottom:10,left:10,display:'flex',gap:5}}>
              {p.colors.map((col,i)=><div key={i} style={{width:14,height:14,borderRadius:'50%',background:col,border:'2px solid rgba(255,255,255,.5)',boxShadow:'0 0 4px rgba(0,0,0,.4)'}}/>)}
            </div>
          ) : null}
        </div>
        <div style={{padding:'1rem 1.25rem'}}>
          <p style={{fontSize:9,letterSpacing:'.3em',textTransform:'uppercase',color:'#c4a8ff',marginBottom:4}}>{p.category}</p>
          <h3 className="d" style={{color:'#fff',fontSize:'1.1rem',lineHeight:1.3}}>{p.name}</h3>
          <div style={{display:'flex',gap:10,alignItems:'center',marginTop:8,flexWrap:'wrap'}}>
            <span style={{color:'var(--pur-l)',fontWeight:500}}>{fmt(p.price)}</span>
            {hd&&<span style={{color:'var(--muted)',fontSize:'.85rem',textDecoration:'line-through'}}>{fmt(p.originalPrice)}</span>}
          </div>
          {p.stock>0&&p.stock<=5&&<p style={{fontSize:11,color:'#e8c84a',marginTop:4}}>Only {p.stock} left</p>}
        </div>
      </div>
    </Link>
  )
}
