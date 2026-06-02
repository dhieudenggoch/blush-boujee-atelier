import Link from 'next/link'
export default function NotFound() {
  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'2rem'}}>
      <div>
        <div className="shimmer d" style={{fontSize:'6rem',fontWeight:700,opacity:.15}}>404</div>
        <h1 className="d" style={{color:'#fff',fontSize:'2.5rem',margin:'1rem 0 .5rem'}}>Page Not Found</h1>
        <p style={{color:'var(--muted)',marginBottom:'2rem'}}>The page you're looking for doesn't exist.</p>
        <Link href="/"><button className="btn-p" style={{width:'auto',display:'inline-block',padding:'1rem 2.5rem'}}>Back to Store</button></Link>
      </div>
    </div>
  )
}
