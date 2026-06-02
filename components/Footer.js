import Link from 'next/link'
export default function Footer() {
  return (
    <footer style={{marginTop:'5rem',background:'rgba(7,0,15,.97)',borderTop:'1px solid rgba(139,92,246,.14)'}}>
      <div className="pline"/>
      <div style={{maxWidth:1280,margin:'0 auto',padding:'3rem 1.25rem'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:'2rem'}}>
          <div style={{gridColumn:'span 2'}}>
            <div className="shimmer d" style={{fontSize:'2.5rem',fontWeight:700}}>B & B</div>
            <div style={{fontSize:8,letterSpacing:'0.5em',textTransform:'uppercase',color:'var(--muted)',margin:'4px 0 16px'}}>Atelier</div>
            <p style={{color:'var(--textm)',fontSize:'.875rem',lineHeight:1.7,maxWidth:320,fontWeight:300}}>Luxury bags for women who love timeless elegance, premium quality and feminine sophistication.</p>
            <div style={{display:'flex',gap:16,marginTop:20,flexWrap:'wrap'}}>
              {['Instagram','Pinterest','TikTok'].map(s=><a key={s} href="#" style={{color:'var(--muted)',fontSize:'.72rem',letterSpacing:'0.3em',textTransform:'uppercase',textDecoration:'none'}}>{s}</a>)}
            </div>
          </div>
          <div>
            <h3 style={{fontSize:9,letterSpacing:'0.4em',textTransform:'uppercase',color:'var(--pur-l)',marginBottom:20}}>Shop</h3>
            <ul style={{listStyle:'none',display:'flex',flexDirection:'column',gap:12}}>
              {[['All Bags','/products'],['Crossbody Bags','/products?category=Crossbody%20Bags'],['Tote Bags','/products?category=Tote%20Bags'],['Feminine Bags','/products?category=Feminine%20Bags']].map(([l,h])=>(
                <li key={l}><Link href={h} style={{color:'var(--textm)',fontSize:'.875rem',textDecoration:'none',fontWeight:300}}>{l}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 style={{fontSize:9,letterSpacing:'0.4em',textTransform:'uppercase',color:'var(--pur-l)',marginBottom:20}}>Support</h3>
            <ul style={{listStyle:'none',display:'flex',flexDirection:'column',gap:12}}>
              {['Shipping Policy','Returns','Care Instructions','Contact Us','FAQ'].map(l=>(
                <li key={l}><a href="#" style={{color:'var(--textm)',fontSize:'.875rem',textDecoration:'none',fontWeight:300}}>{l}</a></li>
              ))}
            </ul>
          </div>
        </div>
        <div style={{marginTop:'2.5rem',paddingTop:'1.5rem',borderTop:'1px solid rgba(139,92,246,.1)',display:'flex',flexWrap:'wrap',alignItems:'center',justifyContent:'space-between',gap:12}}>
          <p style={{color:'var(--muted)',fontSize:'.72rem',letterSpacing:'0.2em'}}>© {new Date().getFullYear()} BLUSH &amp; BOUJEE ATELIER. ALL RIGHTS RESERVED.</p>
          <p style={{color:'var(--muted)',fontSize:9,letterSpacing:'0.3em',textTransform:'uppercase'}}>CLASSY · TIMELESS · UNIQUELY YOU</p>
        </div>
      </div>
    </footer>
  )
}
