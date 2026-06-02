'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminNav from '../../../components/AdminNav'

const fmt = n => 'UGX ' + Number(n||0).toLocaleString('en-UG',{minimumFractionDigits:0,maximumFractionDigits:0})
const STATUSES = ['pending','processing','shipped','delivered','cancelled']

export default function AdminOrders() {
  const [orders,   setOrders]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [selected, setSelected] = useState(null)
  const [toast,    setToast]    = useState('')
  const [filter,   setFilter]   = useState('all')
  const [editNote, setEditNote] = useState('')
  const [imgUp,    setImgUp]    = useState(false)
  const [orderImgs,setOrderImgs]= useState([])
  const router = useRouter()

  const showToast = msg => { setToast(msg); setTimeout(()=>setToast(''),3000) }

  useEffect(()=>{
    fetch('/api/orders').then(r=>r.json()).then(d=>{
      if(d.error==='Unauthorized'){router.push('/admin');return}
      setOrders(d.orders||[]); setLoading(false)
    })
  },[])

  const selectOrder = o => { setSelected(o); setEditNote(o.adminNote||''); setOrderImgs(o.images||[]) }

  const updateStatus = async (id, status) => {
    const r = await fetch(`/api/orders/${id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({status})})
    const d = await r.json()
    if(d.success){ setOrders(prev=>prev.map(o=>o.id===id?{...o,status}:o)); if(selected?.id===id) setSelected(s=>({...s,status})); showToast('✓ Status updated') }
  }

  const saveOrderDetails = async () => {
    const r = await fetch(`/api/orders/${selected.id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({adminNote:editNote,images:orderImgs})})
    const d = await r.json()
    if(d.success){ setOrders(prev=>prev.map(o=>o.id===selected.id?{...o,adminNote:editNote,images:orderImgs}:o)); setSelected(s=>({...s,adminNote:editNote,images:orderImgs})); showToast('✓ Order updated') }
  }

  const uploadImg = async file => {
    setImgUp(true)
    const fd=new FormData(); fd.append('file',file)
    try{
      const r=await fetch('/api/upload',{method:'POST',body:fd})
      const d=await r.json()
      if(d.success){setOrderImgs(prev=>[...prev,d.url]);showToast('✓ Image added')}
      else showToast('✗ Upload failed')
    }catch{showToast('✗ Error')}
    setImgUp(false)
  }

  const stats = { all:orders.length, pending:orders.filter(o=>o.status==='pending').length, processing:orders.filter(o=>o.status==='processing').length, shipped:orders.filter(o=>o.status==='shipped').length, delivered:orders.filter(o=>o.status==='delivered').length }
  const filtered = filter==='all' ? orders : orders.filter(o=>o.status===filter)

  if(loading) return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}><p style={{color:'var(--muted)',animation:'pulse 1.5s infinite'}}>Loading…</p></div>

  const box={background:'rgba(17,0,34,.88)',border:'1px solid var(--bdr)',borderRadius:6}
  const secTitleStyle={fontSize:'.65rem',letterSpacing:'.25em',textTransform:'uppercase',color:'var(--pur-l)',display:'block',marginBottom:'0.75rem'}

  return (
    <div style={{minHeight:'100vh'}}>
      <AdminNav/>
      <div style={{maxWidth:1280,margin:'0 auto',padding:'2rem 1.25rem'}}>
        <div style={{marginBottom:'2rem'}}>
          <h1 className="d" style={{color:'#fff',fontSize:'2rem'}}>Orders</h1>
          <p style={{color:'var(--muted)',fontSize:'.84rem',marginTop:4}}>{orders.length} total orders</p>
        </div>

        {/* Filter tabs */}
        <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:'1.5rem'}}>
          {['all','pending','processing','shipped','delivered'].map(s=>(
            <button key={s} onClick={()=>setFilter(s)} style={{padding:'7px 14px',fontSize:'.7rem',letterSpacing:'.15em',textTransform:'uppercase',cursor:'pointer',transition:'all .2s',background:filter===s?'var(--pur-d)':'transparent',border:`1px solid ${filter===s?'rgba(139,92,246,.5)':'var(--bdr)'}`,color:filter===s?'#fff':'var(--textm)',borderRadius:3}}>
              {s} ({stats[s]||0})
            </button>
          ))}
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr',gap:16}}>
          <style>{`@media(min-width:900px){.ord-grid{grid-template-columns:1fr 380px!important}}`}</style>
          <div className="ord-grid" style={{display:'grid',gridTemplateColumns:'1fr',gap:16}}>

            {/* Orders list */}
            <div style={{...box,overflow:'hidden'}}>
              {filtered.length===0 ? (
                <div style={{padding:'3rem',textAlign:'center'}}><p className="d" style={{color:'var(--textm)',fontSize:'1.5rem'}}>No orders found</p></div>
              ) : (
                <div style={{overflowX:'auto'}}>
                  <table className="atbl">
                    <thead><tr><th>Order ID</th><th>Customer</th><th>Items / Colours</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th><th></th></tr></thead>
                    <tbody>
                      {filtered.map(o=>(
                        <tr key={o.id} style={{background:selected?.id===o.id?'rgba(139,92,246,.06)':'transparent'}}>
                          <td style={{fontFamily:'monospace',color:'var(--pur-l)',fontSize:'.78rem'}}>{o.id}</td>
                          <td><div style={{color:'#fff',fontSize:'.84rem'}}>{o.customer?.firstName} {o.customer?.lastName}</div><div style={{color:'var(--muted)',fontSize:'.72rem'}}>{o.customer?.email}</div></td>
                          <td>
                            <div style={{display:'flex',flexDirection:'column',gap:4}}>
                              {o.items?.map((item,i)=>(
                                <div key={i} style={{display:'flex',alignItems:'center',gap:5,fontSize:'.75rem'}}>
                                  <span style={{color:'var(--textm)'}}>{item.name}</span>
                                  {item.selectedColor && <div style={{width:12,height:12,borderRadius:'50%',background:item.selectedColor,border:'1px solid rgba(255,255,255,.4)',flexShrink:0}} title={item.selectedColor}/>}
                                </div>
                              ))}
                            </div>
                          </td>
                          <td style={{color:'#fff',fontWeight:500,fontSize:'.84rem'}}>{fmt(o.total)}</td>
                          <td><span style={{fontSize:'.72rem',color:'var(--textm)'}}>{o.paymentMethod==='mobilemoney'?'📱 Mobile':'💵 Cash'}</span></td>
                          <td><span className={`sp sp-${o.status}`}>{o.status}</span></td>
                          <td style={{color:'var(--muted)',fontSize:'.75rem'}}>{new Date(o.createdAt).toLocaleDateString()}</td>
                          <td><button onClick={()=>selectOrder(o)} style={{background:'none',border:'1px solid rgba(139,92,246,.3)',color:'var(--pur-l)',cursor:'pointer',padding:'4px 10px',fontSize:'.72rem',borderRadius:3}}>View</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Order Detail Panel */}
            <div>
              {selected ? (
                <div style={{...box,position:'sticky',top:72,maxHeight:'calc(100vh - 100px)',overflowY:'auto'}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'1rem 1.25rem',borderBottom:'1px solid rgba(139,92,246,.15)'}}>
                    <div><h2 className="d" style={{color:'#fff',fontSize:'1.1rem'}}>Order Detail</h2><p style={{fontFamily:'monospace',color:'var(--pur-l)',fontSize:'.75rem',marginTop:2}}>{selected.id}</p></div>
                    <button onClick={()=>setSelected(null)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--muted)',fontSize:'1.25rem'}}>✕</button>
                  </div>

                  <div style={{padding:'1.25rem',display:'flex',flexDirection:'column',gap:16}}>

                    {/* Status update */}
                    <div>
                      <span style={secTitleStyle}>Update Status</span>
                      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6}}>
                        {STATUSES.map(s=>(
                          <button key={s} onClick={()=>updateStatus(selected.id,s)} className={`sp sp-${s}`} style={{cursor:'pointer',border:'1px solid',padding:'6px 4px',textAlign:'center',transition:'all .2s',opacity:selected.status===s?1:.5,fontFamily:'Jost,sans-serif'}}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Customer */}
                    <div style={{borderTop:'1px solid rgba(139,92,246,.1)',paddingTop:14}}>
                      <span style={secTitleStyle}>Customer</span>
                      <p style={{color:'#fff',fontSize:'.88rem'}}>{selected.customer?.firstName} {selected.customer?.lastName}</p>
                      <p style={{color:'var(--muted)',fontSize:'.8rem'}}>{selected.customer?.email}</p>
                      {selected.customer?.phone&&<p style={{color:'var(--muted)',fontSize:'.8rem'}}>{selected.customer?.phone}</p>}
                    </div>

                    {/* Address */}
                    <div style={{borderTop:'1px solid rgba(139,92,246,.1)',paddingTop:14}}>
                      <span style={secTitleStyle}>Delivery Address</span>
                      <p style={{color:'var(--textm)',fontSize:'.84rem',lineHeight:1.6}}>{selected.customer?.address}<br/>{selected.customer?.city}{selected.customer?.state?', '+selected.customer.state:''}<br/>{selected.customer?.country}</p>
                      {selected.customer?.notes&&<div style={{marginTop:8,padding:'8px 10px',background:'rgba(139,92,246,.06)',border:'1px solid rgba(139,92,246,.15)',borderRadius:4,fontSize:'.78rem',color:'var(--muted)',fontStyle:'italic'}}>Note: {selected.customer.notes}</div>}
                    </div>

                    {/* Items */}
                    <div style={{borderTop:'1px solid rgba(139,92,246,.1)',paddingTop:14}}>
                      <span style={secTitleStyle}>Items Ordered</span>
                      <div style={{display:'flex',flexDirection:'column',gap:10}}>
                        {selected.items?.map((item,i)=>(
                          <div key={i} style={{background:'rgba(139,92,246,.05)',border:'1px solid rgba(139,92,246,.12)',borderRadius:4,padding:'8px 10px'}}>
                            <div style={{display:'flex',justifyContent:'space-between',fontSize:'.84rem',marginBottom:item.selectedColor?5:0}}>
                              <span style={{color:'var(--textm)',fontWeight:500}}>{item.name} ×{item.qty}</span>
                              <span style={{color:'#fff'}}>{fmt(item.price*item.qty)}</span>
                            </div>
                            {item.selectedColor && (
                              <div style={{display:'flex',alignItems:'center',gap:7,marginTop:4}}>
                                <div style={{width:16,height:16,borderRadius:'50%',background:item.selectedColor,border:'2px solid rgba(255,255,255,.3)',flexShrink:0,boxShadow:'0 0 6px rgba(0,0,0,.5)'}}/>
                                <span style={{fontSize:'.72rem',color:'var(--muted)',letterSpacing:'.1em',textTransform:'uppercase'}}>Colour: <span style={{color:'var(--pur-l)'}}>{item.selectedColor}</span></span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <div style={{marginTop:10,paddingTop:10,borderTop:'1px solid rgba(139,92,246,.1)',display:'flex',flexDirection:'column',gap:6}}>
                        <div style={{display:'flex',justifyContent:'space-between',fontSize:'.82rem',color:'var(--muted)'}}><span>Subtotal</span><span>{fmt(selected.subtotal)}</span></div>
                        <div style={{display:'flex',justifyContent:'space-between',fontSize:'.82rem',color:'var(--muted)'}}><span>Delivery</span><span>{selected.shipping===0?'Free':fmt(selected.shipping)}</span></div>
                        <div style={{display:'flex',justifyContent:'space-between',fontWeight:500,color:'#fff',paddingTop:6,borderTop:'1px solid rgba(139,92,246,.1)'}}><span>Total</span><span style={{color:'var(--pur-l)'}}>{fmt(selected.total)}</span></div>
                      </div>
                    </div>

                    {/* Images (admin can add proof-of-delivery images etc.) */}
                    <div style={{borderTop:'1px solid rgba(139,92,246,.1)',paddingTop:14}}>
                      <span style={secTitleStyle}>Order Images (delivery proof, etc.)</span>
                      {orderImgs.length>0&&(
                        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6,marginBottom:10}}>
                          {orderImgs.map((url,i)=>(
                            <div key={i} style={{position:'relative',aspectRatio:'1',borderRadius:4,overflow:'hidden',background:'rgba(59,31,74,.5)'}}>
                              <img src={url} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                              <button type="button" onClick={()=>setOrderImgs(p=>p.filter((_,j)=>j!==i))} style={{position:'absolute',top:3,right:3,background:'rgba(0,0,0,.7)',border:'none',color:'#fff',width:18,height:18,borderRadius:'50%',cursor:'pointer',fontSize:11,display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
                            </div>
                          ))}
                        </div>
                      )}
                      <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',background:'rgba(139,92,246,.08)',border:'1px dashed rgba(139,92,246,.3)',borderRadius:4,padding:'8px 12px',fontSize:'.78rem',color:'var(--pur-l)'}}>
                        <input type="file" accept="image/*" multiple style={{display:'none'}} onChange={e=>Array.from(e.target.files).forEach(uploadImg)}/>
                        {imgUp?'Uploading…':'📎 Add Image'}
                      </label>
                    </div>

                    {/* Admin note */}
                    <div style={{borderTop:'1px solid rgba(139,92,246,.1)',paddingTop:14}}>
                      <span style={secTitleStyle}>Admin Note</span>
                      <textarea value={editNote} onChange={e=>setEditNote(e.target.value)} className="inp" style={{height:70,fontSize:'.84rem'}} placeholder="Internal notes about this order…"/>
                    </div>

                    <button onClick={saveOrderDetails} className="btn-p" style={{padding:'.85rem',fontSize:'.8rem',letterSpacing:'.18em'}}>Save Changes</button>

                    <p style={{color:'var(--muted)',fontSize:'.72rem',textAlign:'center'}}>Placed: {new Date(selected.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ) : (
                <div style={{...box,padding:'2.5rem',textAlign:'center'}}>
                  <p className="d" style={{color:'var(--textm)',fontSize:'1.2rem',marginBottom:8}}>Select an order</p>
                  <p style={{color:'var(--muted)',fontSize:'.8rem'}}>Click "View" to see details, update status, or add images</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {toast&&<div className="toast">{toast}</div>}
    </div>
  )
}
