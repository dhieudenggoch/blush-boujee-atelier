'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const submit = async e => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const r = await fetch('/api/admin/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) })
      const d = await r.json()
      if (d.success) router.push('/admin/dashboard')
      else setError(d.error || 'Invalid credentials')
    } catch { setError('Connection failed') }
    setLoading(false)
  }

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'1.25rem',position:'relative'}}>
      <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:'min(600px,100vw)',height:'min(600px,100vw)',borderRadius:'50%',background:'radial-gradient(ellipse,rgba(109,40,217,.25) 0%,transparent 70%)',pointerEvents:'none'}}/>
      <div style={{position:'relative',width:'100%',maxWidth:420}}>
        <div style={{textAlign:'center',marginBottom:'2.5rem'}}>
          <div className="shimmer d" style={{fontSize:'3.5rem',fontWeight:700}}>B&B</div>
          <div style={{fontSize:8,letterSpacing:'0.5em',textTransform:'uppercase',color:'var(--muted)',margin:'4px 0 1.5rem'}}>Atelier</div>
          <div className="divider"><span>Admin Access</span></div>
        </div>
        <div style={{background:'rgba(17,0,34,.9)',border:'1px solid var(--bdr)',borderRadius:6,padding:'2rem'}}>
          <h1 className="d" style={{color:'#fff',fontSize:'1.5rem',textAlign:'center',marginBottom:6}}>Welcome Back</h1>
          <p style={{color:'var(--muted)',fontSize:'.78rem',textAlign:'center',letterSpacing:'.1em',marginBottom:'1.75rem'}}>Sign in to manage your store</p>
          {error && <div style={{marginBottom:'1.25rem',padding:'.75rem',background:'rgba(239,68,68,.1)',border:'1px solid rgba(239,68,68,.3)',color:'#f87171',fontSize:'.84rem',textAlign:'center',borderRadius:4}}>{error}</div>}
          <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:16}}>
            <div>
              <label style={{display:'block',fontSize:'.72rem',letterSpacing:'.2em',textTransform:'uppercase',color:'var(--muted)',marginBottom:8}}>Username</label>
              <input type="text" required className="inp" placeholder="admin" autoComplete="username"
                value={form.username} onChange={e=>setForm(f=>({...f,username:e.target.value}))}/>
            </div>
            <div>
              <label style={{display:'block',fontSize:'.72rem',letterSpacing:'.2em',textTransform:'uppercase',color:'var(--muted)',marginBottom:8}}>Password</label>
              <input type="password" required className="inp" placeholder="••••••••" autoComplete="current-password"
                value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))}/>
            </div>
            <button type="submit" disabled={loading} className="btn-p" style={{marginTop:8,padding:'1rem',fontSize:'.82rem',letterSpacing:'.2em'}}>
              {loading ? 'Signing In…' : 'Sign In to Dashboard'}
            </button>
          </form>
          <div style={{textAlign:'center',marginTop:'1.5rem'}}>
            <a href="/" style={{color:'var(--muted)',fontSize:'.78rem',textDecoration:'none',letterSpacing:'.1em'}}>← Back to Store</a>
          </div>
        </div>
        <p style={{textAlign:'center',color:'rgba(124,95,160,.5)',fontSize:'.72rem',marginTop:'1rem'}}>Default: admin / BlushBoujee@2025</p>
      </div>
    </div>
  )
}
