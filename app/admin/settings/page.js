'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminNav from '../../../components/AdminNav'

const fmt = n => 'UGX ' + Number(n||0).toLocaleString('en-UG',{minimumFractionDigits:0,maximumFractionDigits:0})

export default function AdminSettings() {
  const [settings, setSettings] = useState({ deliveryFee:15000, freeDeliveryThreshold:500000, mobileMoneyNumber:'256700000000', storeName:'Blush & Boujee Atelier' })
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [toast,    setToast]    = useState('')
  const router = useRouter()

  const showToast = msg => { setToast(msg); setTimeout(()=>setToast(''),3000) }

  useEffect(()=>{
    fetch('/api/settings').then(r=>r.json()).then(d=>{
      if(d.error==='Unauthorized'){router.push('/admin');return}
      if(d.settings) setSettings(d.settings)
      setLoading(false)
    })
  },[])

  const set = (k,v) => setSettings(s=>({...s,[k]:v}))

  const save = async () => {
    setSaving(true)
    try{
      const r=await fetch('/api/settings',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(settings)})
      const d=await r.json()
      if(d.success) showToast('✓ Settings saved')
      else showToast('✗ '+(d.error||'Failed'))
    }catch{showToast('✗ Error')}
    setSaving(false)
  }

  if(loading) return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}><p style={{color:'var(--muted)',animation:'pulse 1.5s infinite'}}>Loading…</p></div>

  const box={background:'rgba(17,0,34,.88)',border:'1px solid var(--bdr)',borderRadius:6,padding:'1.5rem',marginBottom:16}
  const lbl={display:'block',fontSize:'.72rem',letterSpacing:'.2em',textTransform:'uppercase',color:'var(--muted)',marginBottom:8}
  const hint={fontSize:'.75rem',color:'var(--muted)',marginTop:6}

  return (
    <div style={{minHeight:'100vh'}}>
      <AdminNav/>
      <div style={{maxWidth:720,margin:'0 auto',padding:'2rem 1.25rem'}}>
        <div style={{marginBottom:'2rem'}}>
          <h1 className="d" style={{color:'#fff',fontSize:'2rem'}}>Settings</h1>
          <p style={{color:'var(--muted)',fontSize:'.84rem',marginTop:4}}>Configure delivery fees, mobile money, and store info</p>
        </div>

        {/* Delivery Settings */}
        <div style={box}>
          <h2 style={{fontSize:'.75rem',letterSpacing:'.3em',textTransform:'uppercase',color:'var(--pur-l)',marginBottom:'1.25rem'}}>🚚 Delivery Settings</h2>
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            <div>
              <label style={lbl}>Delivery Fee (UGX)</label>
              <input type="number" min="0" value={settings.deliveryFee} onChange={e=>set('deliveryFee',Number(e.target.value))} className="inp"/>
              <p style={hint}>Charged on orders below the free delivery threshold. Currently: {fmt(settings.deliveryFee)}</p>
            </div>
            <div>
              <label style={lbl}>Free Delivery Threshold (UGX)</label>
              <input type="number" min="0" value={settings.freeDeliveryThreshold} onChange={e=>set('freeDeliveryThreshold',Number(e.target.value))} className="inp"/>
              <p style={hint}>Orders at or above this amount get free delivery. Currently: {fmt(settings.freeDeliveryThreshold)}</p>
            </div>
          </div>
        </div>

        {/* Mobile Money */}
        <div style={box}>
          <h2 style={{fontSize:'.75rem',letterSpacing:'.3em',textTransform:'uppercase',color:'var(--pur-l)',marginBottom:'1.25rem'}}>📱 Mobile Money (WhatsApp)</h2>
          <div>
            <label style={lbl}>WhatsApp / Mobile Money Number</label>
            <input type="text" value={settings.mobileMoneyNumber} onChange={e=>set('mobileMoneyNumber',e.target.value)} className="inp" placeholder="256700000000"/>
            <p style={hint}>International format without +. e.g. 256700000000 for Uganda. Customers who choose Mobile Money will be redirected to WhatsApp on this number.</p>
          </div>
          <div style={{marginTop:12,padding:'10px 14px',background:'rgba(37,211,102,.08)',border:'1px solid rgba(37,211,102,.2)',borderRadius:4,display:'flex',gap:10,alignItems:'center'}}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.117.553 4.104 1.523 5.824L0 24l6.335-1.511A11.93 11.93 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.9a9.9 9.9 0 01-5.031-1.372l-.361-.214-3.741.981.998-3.648-.235-.374A9.862 9.862 0 012.1 12C2.1 6.52 6.52 2.1 12 2.1S21.9 6.52 21.9 12 17.48 21.9 12 21.9z"/></svg>
            <div>
              <p style={{color:'#4ade80',fontSize:'.82rem',fontWeight:500}}>WhatsApp: wa.me/{settings.mobileMoneyNumber}</p>
              <p style={{color:'rgba(74,222,128,.6)',fontSize:'.72rem',marginTop:2}}>Customers will open this chat when they choose Mobile Money at checkout</p>
            </div>
          </div>
        </div>

        {/* Store Info */}
        <div style={box}>
          <h2 style={{fontSize:'.75rem',letterSpacing:'.3em',textTransform:'uppercase',color:'var(--pur-l)',marginBottom:'1.25rem'}}>🏪 Store Information</h2>
          <div>
            <label style={lbl}>Store Name</label>
            <input type="text" value={settings.storeName} onChange={e=>set('storeName',e.target.value)} className="inp"/>
          </div>
        </div>

        <button onClick={save} disabled={saving} className="btn-p" style={{padding:'1rem',fontSize:'.84rem',letterSpacing:'.2em'}}>
          {saving ? 'Saving…' : 'Save All Settings'}
        </button>

        {/* Preview */}
        <div style={{marginTop:'1.5rem',padding:'1rem 1.25rem',background:'rgba(139,92,246,.06)',border:'1px solid rgba(139,92,246,.15)',borderRadius:6}}>
          <p style={{fontSize:'.7rem',letterSpacing:'.2em',textTransform:'uppercase',color:'var(--pur-l)',marginBottom:10}}>Preview — What customers see at checkout</p>
          <p style={{color:'var(--textm)',fontSize:'.84rem'}}>Delivery fee: <strong style={{color:'#fff'}}>{fmt(settings.deliveryFee)}</strong></p>
          <p style={{color:'var(--textm)',fontSize:'.84rem',marginTop:4}}>Free delivery on orders: <strong style={{color:'#4ade80'}}>{fmt(settings.freeDeliveryThreshold)}+</strong></p>
          <p style={{color:'var(--textm)',fontSize:'.84rem',marginTop:4}}>Mobile Money WhatsApp: <strong style={{color:'#25D366'}}>+{settings.mobileMoneyNumber}</strong></p>
        </div>
      </div>
      {toast&&<div className="toast">{toast}</div>}
    </div>
  )
}
