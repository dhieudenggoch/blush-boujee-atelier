'use client'
import {useState,useEffect} from 'react'
import Link from 'next/link'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

const fmt = n => 'UGX ' + Number(n||0).toLocaleString('en-UG',{minimumFractionDigits:0,maximumFractionDigits:0})

export default function Checkout() {
  const [cart,    setCart]    = useState([])
  const [settings,setSettings]= useState({deliveryFee:15000,freeDeliveryThreshold:500000,mobileMoneyNumber:'256700000000'})
  const [pay,     setPay]     = useState('')
  const [loading, setLoading] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [form,    setForm]    = useState({firstName:'',lastName:'',email:'',phone:'',address:'',city:'',state:'',country:'Uganda',notes:''})

  useEffect(()=>{
    setCart(JSON.parse(localStorage.getItem('bb_cart')||'[]'))
    fetch('/api/settings').then(r=>r.json()).then(d=>{if(d.settings)setSettings(d.settings)}).catch(()=>{})
  },[])

  const chgQty=(id,d)=>{const u=cart.map(i=>i.id===id?{...i,qty:Math.max(1,i.qty+d)}:i);setCart(u);localStorage.setItem('bb_cart',JSON.stringify(u));window.dispatchEvent(new Event('bb_cart_updated'))}
  const remove=id=>{const u=cart.filter(i=>i.id!==id);setCart(u);localStorage.setItem('bb_cart',JSON.stringify(u));window.dispatchEvent(new Event('bb_cart_updated'))}
  const set=(k,v)=>setForm(p=>({...p,[k]:v}))

  const subtotal   =cart.reduce((s,i)=>s+i.price*i.qty,0)
  const deliveryFee=subtotal>=settings.freeDeliveryThreshold?0:settings.deliveryFee
  const total      =subtotal+deliveryFee

  const openWA=()=>{
    const num=settings.mobileMoneyNumber||'256700000000'
    const list=cart.map(i=>`• ${i.name} ×${i.qty} = ${fmt(i.price*i.qty)}`).join('\n')
    const msg=`Hello Blush & Boujee Atelier! 💜\n\nI'd like to pay via Mobile Money:\n\n${list}\n\nDelivery: ${deliveryFee===0?'Free':fmt(deliveryFee)}\nTotal: ${fmt(total)}\n\nPlease send payment details. Thank you!`
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`,'_blank')
  }

  // ─── Silent receipt generator ──────────────────────────────────────────────
  // Generates a PDF receipt via jsPDF and POSTs the base64 to our backend,
  // which converts it to a Buffer and forwards it to Telegram as a downloadable
  // document. Fully fire-and-forget — errors never reach the user.
  const generateAndSendReceipt = async (orderId, orderForm, orderCart, orderSubtotal, orderShipping, orderTotal, orderPay) => {
    try {
      const { jsPDF } = await import('jspdf')

      const doc     = new jsPDF({ unit: 'pt', format: 'a4' })
      const PW      = doc.internal.pageSize.getWidth()   // 595
      const ML      = 40   // margin left
      const MR      = 40   // margin right
      const UW      = PW - ML - MR                       // usable width: 515
      const BLACK   = [10,  0,  0]
      const PURPLE  = [76, 29, 149]
      const MUTED   = [107, 114, 128]
      const LGRAY   = [243, 244, 246]
      const LINE    = [229, 231, 235]
      const WHITE   = [255, 255, 255]

      const fmtAmt  = n => 'UGX ' + Number(n||0).toLocaleString('en-UG',{minimumFractionDigits:0})
      const fmtDate = () => new Date().toLocaleDateString('en-UG',{day:'2-digit',month:'long',year:'numeric'})
      const payLbl  = {cod:'Cash on Delivery',mobilemoney:'Mobile Money',card:'Card Payment'}[orderPay] || orderPay || 'N/A'
      const fullName= [orderForm.firstName,orderForm.lastName].filter(Boolean).join(' ')||'N/A'
      const address = [orderForm.address,orderForm.city,orderForm.state,orderForm.country].filter(Boolean).join(', ')||'N/A'

      // ── Header band ──────────────────────────────────────────────────────
      doc.setFillColor(...BLACK)
      doc.rect(0, 0, PW, 90, 'F')

      doc.setTextColor(...WHITE)
      doc.setFont('helvetica','bold')
      doc.setFontSize(20)
      doc.text('BLUSH & BOUJEE ATELIER', ML, 34)

      doc.setFont('helvetica','normal')
      doc.setFontSize(7.5)
      doc.setCharSpace(2)
      doc.text('LUXURY HANDBAGS & ACCESSORIES', ML, 50)
      doc.setCharSpace(0)

      doc.setTextColor(...[161,139,250])
      doc.setFont('helvetica','bold')
      doc.setFontSize(10)
      doc.setCharSpace(2)
      doc.text('RECEIPT', PW - MR, 34, { align: 'right' })
      doc.setCharSpace(0)

      doc.setFont('helvetica','normal')
      doc.setFontSize(8)
      doc.setTextColor(...WHITE)
      doc.text(fmtDate(), PW - MR, 50, { align: 'right' })

      // ── Order ID strip ───────────────────────────────────────────────────
      doc.setFillColor(...PURPLE)
      doc.rect(0, 90, PW, 26, 'F')

      doc.setTextColor(...WHITE)
      doc.setFont('helvetica','bold')
      doc.setFontSize(9)
      doc.setCharSpace(0.8)
      doc.text(`ORDER ID: ${orderId}`, ML, 107)
      doc.setCharSpace(0)

      doc.setTextColor(221,214,254)
      doc.setFont('helvetica','normal')
      doc.text('Status: Pending', PW - MR, 107, { align: 'right' })

      // ── Customer + delivery two-column ───────────────────────────────────
      let y = 135
      const col2x = ML + UW / 2 + 10
      const colW  = UW / 2 - 10

      const sectionHead = (label, x, yy) => {
        doc.setTextColor(...PURPLE)
        doc.setFont('helvetica','bold')
        doc.setFontSize(7.5)
        doc.setCharSpace(1.2)
        doc.text(label, x, yy)
        doc.setCharSpace(0)
      }
      const infoRow = (label, value, x, yy) => {
        doc.setTextColor(...MUTED)
        doc.setFont('helvetica','normal')
        doc.setFontSize(7.5)
        doc.text(label, x, yy)
        doc.setTextColor(...BLACK)
        doc.setFont('helvetica','normal')
        doc.setFontSize(8.5)
        const lines = doc.splitTextToSize(value, colW)
        doc.text(lines, x, yy + 12)
        return yy + 12 + lines.length * 11 + 6
      }

      sectionHead('CUSTOMER DETAILS', ML, y)
      let yL = y + 14
      yL = infoRow('Full Name',     fullName,                   ML, yL)
      yL = infoRow('Email',         orderForm.email || 'N/A',   ML, yL)
      yL = infoRow('Phone',         orderForm.phone || 'N/A',   ML, yL)

      sectionHead('DELIVERY DETAILS', col2x, y)
      let yR = y + 14
      yR = infoRow('Address', address,  col2x, yR)
      yR = infoRow('Payment', payLbl,   col2x, yR)
      if (orderForm.notes?.trim()) yR = infoRow('Notes', orderForm.notes.trim(), col2x, yR)

      // ── Divider ──────────────────────────────────────────────────────────
      y = Math.max(yL, yR) + 8
      doc.setDrawColor(...LINE)
      doc.setLineWidth(0.5)
      doc.line(ML, y, ML + UW, y)

      // ── Items table ──────────────────────────────────────────────────────
      y += 14

      // Header row
      doc.setFillColor(...BLACK)
      doc.rect(ML, y, UW, 20, 'F')
      doc.setTextColor(...WHITE)
      doc.setFont('helvetica','bold')
      doc.setFontSize(7.5)
      doc.text('ITEM',              ML + 6,         y + 13)
      doc.text('QTY',               ML + UW * 0.63, y + 13, { align: 'right' })
      doc.text('UNIT PRICE',        ML + UW * 0.79, y + 13, { align: 'right' })
      doc.text('TOTAL',             ML + UW,        y + 13, { align: 'right' })
      y += 20

      // Data rows
      orderCart.forEach((item, i) => {
        const rowH    = 20
        const lineTot = (item.price || 0) * (item.qty || 1)
        doc.setFillColor(...(i % 2 === 0 ? WHITE : LGRAY))
        doc.rect(ML, y, UW, rowH, 'F')

        doc.setTextColor(...BLACK)
        doc.setFont('helvetica','normal')
        doc.setFontSize(8.5)

        // Truncate long names
        const nameStr = doc.splitTextToSize(item.name || '', UW * 0.58)[0]
        doc.text(nameStr,                          ML + 6,         y + 13)
        doc.text(String(item.qty || 1),            ML + UW * 0.63, y + 13, { align: 'right' })
        doc.text(fmtAmt(item.price || 0),          ML + UW * 0.79, y + 13, { align: 'right' })
        doc.setFont('helvetica','bold')
        doc.text(fmtAmt(lineTot),                  ML + UW,        y + 13, { align: 'right' })
        y += rowH
      })

      // ── Totals ───────────────────────────────────────────────────────────
      doc.setDrawColor(...LINE)
      doc.line(ML, y, ML + UW, y)
      y += 10

      const totRow = (label, value, bold = false, color = BLACK) => {
        doc.setTextColor(...MUTED)
        doc.setFont('helvetica','normal')
        doc.setFontSize(8.5)
        doc.text(label, ML + UW * 0.72, y, { align: 'right' })
        doc.setTextColor(...color)
        doc.setFont('helvetica', bold ? 'bold' : 'normal')
        doc.setFontSize(bold ? 10 : 8.5)
        doc.text(value, ML + UW, y, { align: 'right' })
        y += bold ? 18 : 14
      }

      totRow('Subtotal',  fmtAmt(orderSubtotal))
      totRow('Shipping',  orderShipping === 0 ? 'FREE' : fmtAmt(orderShipping))
      doc.setDrawColor(...LINE)
      doc.line(ML + UW * 0.58, y, ML + UW, y)
      y += 8
      totRow('TOTAL DUE', fmtAmt(orderTotal), true, PURPLE)

      // ── Footer ───────────────────────────────────────────────────────────
      const footY = doc.internal.pageSize.getHeight() - 75
      doc.setFillColor(...BLACK)
      doc.rect(0, footY, PW, 75, 'F')

      doc.setTextColor(161, 139, 250)
      doc.setFont('helvetica','bold')
      doc.setFontSize(12)
      doc.text('Thank You For Shopping With Us!', PW / 2, footY + 24, { align: 'center' })

      doc.setTextColor(156, 163, 175)
      doc.setFont('helvetica','normal')
      doc.setFontSize(7.5)
      doc.text('Blush & Boujee Atelier  ·  Luxury Handbags & Accessories  ·  Uganda', PW / 2, footY + 42, { align: 'center' })
      doc.text('This is your official receipt. Please retain it for your records.', PW / 2, footY + 57, { align: 'center' })

      // ── Send base64 to backend ────────────────────────────────────────────
      const pdfBase64 = doc.output('datauristring')

      fetch('/api/send-telegram-receipt', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdfBase64,
          order: {
            id:            orderId,
            customer:      orderForm,
            items:         orderCart,
            subtotal:      orderSubtotal,
            shipping:      orderShipping,
            total:         orderTotal,
            paymentMethod: orderPay,
            status:        'pending',
            createdAt:     new Date().toISOString(),
          },
        }),
      }).catch(e => console.error('[Receipt] upload failed:', e.message))

    } catch (e) {
      console.error('[Receipt] generation failed:', e.message)
    }
  }

  const submit=async e=>{
    e.preventDefault()
    if(!pay){alert('Please select a payment method.');return}
    if(pay==='mobilemoney'){openWA();return}
    setLoading(true)
    try{
      const r=await fetch('/api/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({customer:form,items:cart,subtotal,shipping:deliveryFee,total,paymentMethod:pay})})
      const d=await r.json()
      if(d.success){
        setOrderId(d.orderId)
        localStorage.removeItem('bb_cart')
        window.dispatchEvent(new Event('bb_cart_updated'))
        window.scrollTo(0,0)
        // 🧾 Fire-and-forget — never blocks or affects UI
        generateAndSendReceipt(d.orderId, form, cart, subtotal, deliveryFee, total, pay)
      }
      else alert(d.error||'Something went wrong.')
    }catch{alert('Connection error. Please try again.')}
    setLoading(false)
  }

  const box={background:'rgba(17,0,34,.88)',border:'1px solid var(--bdr)',borderRadius:6,padding:'1.5rem'}
  const secTitle={fontSize:'.7rem',letterSpacing:'.3em',textTransform:'uppercase',color:'var(--pur-l)',marginBottom:'1.25rem',display:'block'}
  const fld=(label,required,children)=>(<div><label style={{display:'block',fontSize:'.72rem',letterSpacing:'.2em',textTransform:'uppercase',color:'var(--muted)',marginBottom:8}}>{label}{required?' *':''}</label>{children}</div>)

  if(orderId) return (
    <div style={{minHeight:'100vh'}}>
      <Navbar/>
      <div style={{maxWidth:540,margin:'0 auto',padding:'10rem 1.25rem 5rem',textAlign:'center'}}>
        <div style={{fontSize:'4rem',marginBottom:'2rem',animation:'floaty 5s ease-in-out infinite'}}>💜</div>
        <style>{`@keyframes floaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}`}</style>
        <div className="divider" style={{marginBottom:'1.5rem'}}><span>Order Confirmed</span></div>
        <h1 className="d" style={{color:'#fff',fontSize:'3.5rem',marginBottom:'1rem'}}>Thank You!</h1>
        <p style={{color:'var(--textm)',marginBottom:8}}>Your order has been placed successfully.</p>
        <p style={{color:'var(--pur-l)',fontFamily:'monospace',letterSpacing:'.1em',marginBottom:8}}>Order #{orderId}</p>
        <p style={{color:'var(--muted)',fontSize:'.875rem',marginBottom:'3rem'}}>Confirmation sent to {form.email}</p>
        <Link href="/products"><button className="btn-p" style={{width:'auto',display:'inline-block',padding:'1rem 2.5rem'}}>Continue Shopping</button></Link>
      </div>
      <Footer/>
    </div>
  )

  if(cart.length===0) return (
    <div style={{minHeight:'100vh'}}>
      <Navbar/>
      <div style={{maxWidth:480,margin:'0 auto',padding:'10rem 1.25rem 5rem',textAlign:'center'}}>
        <div style={{fontSize:'3.5rem',opacity:.25,marginBottom:'1.5rem'}}>🛍️</div>
        <h2 className="d" style={{color:'#fff',fontSize:'2.5rem',marginBottom:'1.5rem'}}>Your bag is empty</h2>
        <Link href="/products"><button className="btn-p" style={{width:'auto',display:'inline-block',padding:'1rem 2.5rem'}}>Shop Now</button></Link>
      </div>
      <Footer/>
    </div>
  )

  return (
    <div style={{minHeight:'100vh'}}>
      <Navbar/>
      <div style={{maxWidth:1200,margin:'0 auto',padding:'7rem 1.25rem 5rem'}}>
        <div style={{textAlign:'center',marginBottom:'3rem'}}>
          <div className="divider" style={{marginBottom:'1rem'}}><span>Checkout</span></div>
          <h1 className="d" style={{color:'#fff',fontSize:'clamp(2rem,5vw,3.5rem)'}}>Complete Your Order</h1>
        </div>
        <form onSubmit={submit}>
          <div style={{display:'grid',gridTemplateColumns:'1fr',gap:24}}>
            <style>{`@media(min-width:768px){.co-grid{grid-template-columns:1fr 380px!important}}@media(max-width:540px){.f2col{grid-template-columns:1fr!important}}`}</style>
            <div className="co-grid" style={{display:'grid',gridTemplateColumns:'1fr',gap:24}}>

              {/* LEFT */}
              <div style={{display:'flex',flexDirection:'column',gap:20}}>

                {/* Contact */}
                <div style={box}>
                  <span style={secTitle}>Contact Information</span>
                  <div className="f2col" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                    {fld('First Name',true,<input required value={form.firstName} onChange={e=>set('firstName',e.target.value)} className="inp" placeholder="Jane"/>)}
                    {fld('Last Name',true,<input required value={form.lastName} onChange={e=>set('lastName',e.target.value)} className="inp" placeholder="Doe"/>)}
                    {fld('Email',true,<input required type="email" value={form.email} onChange={e=>set('email',e.target.value)} className="inp" placeholder="jane@example.com"/>)}
                    {fld('Phone',true,<input required type="tel" value={form.phone} onChange={e=>set('phone',e.target.value)} className="inp" placeholder="+256 700 000000"/>)}
                  </div>
                </div>

                {/* Address */}
                <div style={box}>
                  <span style={secTitle}>Delivery Address</span>
                  <div style={{display:'flex',flexDirection:'column',gap:14}}>
                    {fld('Street / Area',true,<input required value={form.address} onChange={e=>set('address',e.target.value)} className="inp" placeholder="Plot 12, Kampala Road"/>)}
                    <div className="f2col" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                      {fld('City',true,<input required value={form.city} onChange={e=>set('city',e.target.value)} className="inp" placeholder="Kampala"/>)}
                      {fld('District',false,<input value={form.state} onChange={e=>set('state',e.target.value)} className="inp" placeholder="Central"/>)}
                    </div>
                    {fld('Country',false,<input value={form.country} onChange={e=>set('country',e.target.value)} className="inp"/>)}
                    {fld('Order Notes',false,<textarea value={form.notes} onChange={e=>set('notes',e.target.value)} className="inp" style={{height:80}} placeholder="Special instructions, landmark, etc."/>)}
                  </div>
                </div>

                {/* Payment */}
                <div style={box}>
                  <span style={secTitle}>Payment Method</span>
                  <div className="f2col" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>

                    {/* Cash on Delivery */}
                    <button type="button" onClick={()=>setPay('cod')} className={`pay-card${pay==='cod'?' sel':''}`}>
                      <div style={{display:'flex',gap:12,alignItems:'flex-start'}}>
                        <div style={{width:16,height:16,borderRadius:'50%',border:`2px solid ${pay==='cod'?'var(--pur-l)':'var(--muted)'}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:2}}>
                          {pay==='cod'&&<div style={{width:8,height:8,borderRadius:'50%',background:'var(--pur-l)'}}/>}
                        </div>
                        <div style={{textAlign:'left'}}>
                          <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:6}}>
                            <span style={{fontSize:'1.4rem'}}>💵</span>
                            <span style={{color:'#fff',fontSize:'.9rem',fontWeight:500}}>Payment on Delivery</span>
                          </div>
                          <p style={{color:'var(--muted)',fontSize:'.75rem',lineHeight:1.5}}>Pay cash when your order arrives. Safe and convenient.</p>
                        </div>
                      </div>
                    </button>

                    {/* Mobile Money */}
                    <button type="button" onClick={()=>setPay('mobilemoney')} className={`pay-card${pay==='mobilemoney'?' sel':''}`}>
                      <div style={{display:'flex',gap:12,alignItems:'flex-start'}}>
                        <div style={{width:16,height:16,borderRadius:'50%',border:`2px solid ${pay==='mobilemoney'?'var(--pur-l)':'var(--muted)'}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:2}}>
                          {pay==='mobilemoney'&&<div style={{width:8,height:8,borderRadius:'50%',background:'var(--pur-l)'}}/>}
                        </div>
                        <div style={{textAlign:'left'}}>
                          <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:6}}>
                            <span style={{fontSize:'1.4rem'}}>📱</span>
                            <span style={{color:'#fff',fontSize:'.9rem',fontWeight:500}}>Mobile Money</span>
                          </div>
                          <p style={{color:'var(--muted)',fontSize:'.75rem',lineHeight:1.5}}>MTN / Airtel Mobile Money — opens WhatsApp to complete payment.</p>
                          {pay==='mobilemoney'&&(
                            <div style={{marginTop:10,display:'flex',gap:8,alignItems:'center',background:'rgba(37,211,102,.1)',border:'1px solid rgba(37,211,102,.25)',padding:'6px 10px',borderRadius:4}}>
                              <svg viewBox="0 0 24 24" width="14" height="14" fill="#25D366" style={{flexShrink:0}}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.117.553 4.104 1.523 5.824L0 24l6.335-1.511A11.93 11.93 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.9a9.9 9.9 0 01-5.031-1.372l-.361-.214-3.741.981.998-3.648-.235-.374A9.862 9.862 0 012.1 12C2.1 6.52 6.52 2.1 12 2.1S21.9 6.52 21.9 12 17.48 21.9 12 21.9z"/></svg>
                              <span style={{color:'#4ade80',fontSize:'.72rem'}}>"Place Order" opens WhatsApp</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  </div>
                  {!pay&&<p style={{textAlign:'center',color:'var(--muted)',fontSize:'.78rem',marginTop:12}}>↑ Please select a payment method</p>}
                </div>

                <button type="submit" disabled={loading||!pay} className="btn-p" style={{padding:'1rem',fontSize:'.82rem',letterSpacing:'.2em',opacity:!pay?.5:1}}>
                  {loading?'Placing Order…':pay==='mobilemoney'?`💬 Confirm & Open WhatsApp — ${fmt(total)}`:pay==='cod'?`✓ Place Order — ${fmt(total)}`:'Select a Payment Method to Continue'}
                </button>
              </div>

              {/* RIGHT — summary */}
              <div>
                <div style={{...box,position:'sticky',top:72}}>
                  <span style={secTitle}>Order Summary</span>
                  <div style={{maxHeight:300,overflowY:'auto',display:'flex',flexDirection:'column',gap:12,marginBottom:16}}>
                    {cart.map(item=>(
                      <div key={item.id} style={{display:'flex',gap:12}}>
                        <div style={{width:54,height:54,borderRadius:4,overflow:'hidden',background:'rgba(59,31,74,.5)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                          {item.image?<img src={item.image} alt={item.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<span style={{fontSize:'1.4rem'}}>👜</span>}
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          <p style={{color:'#fff',fontSize:'.82rem',lineHeight:1.3,wordBreak:'break-word'}}>{item.name}</p>
                          <p style={{color:'var(--muted)',fontSize:'.7rem',marginTop:2}}>{fmt(item.price)} each</p>
                          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:8}}>
                            <div className="stepper" style={{transform:'scale(0.82)',transformOrigin:'left center'}}>
                              <button type="button" className="s-btn" onClick={()=>chgQty(item.id,-1)}>−</button>
                              <span className="s-val" style={{fontSize:'.78rem'}}>{item.qty}</span>
                              <button type="button" className="s-btn" onClick={()=>chgQty(item.id,1)}>+</button>
                            </div>
                            <div style={{display:'flex',gap:10,alignItems:'center'}}>
                              <span style={{color:'var(--pur-l)',fontSize:'.82rem',fontWeight:500}}>{fmt(item.price*item.qty)}</span>
                              <button type="button" onClick={()=>remove(item.id)} style={{background:'none',border:'none',cursor:'pointer',color:'rgba(239,68,68,.5)',fontSize:'.75rem'}}>✕</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{borderTop:'1px solid rgba(139,92,246,.12)',paddingTop:16,display:'flex',flexDirection:'column',gap:10}}>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:'.875rem',color:'var(--textm)'}}><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:'.875rem',color:'var(--textm)'}}><span>Delivery</span><span style={{color:deliveryFee===0?'#4ade80':'inherit'}}>{deliveryFee===0?'Free':fmt(deliveryFee)}</span></div>
                    {deliveryFee>0&&<p style={{color:'var(--muted)',fontSize:'.72rem'}}>Free delivery on orders {fmt(settings.freeDeliveryThreshold)}+</p>}
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingTop:10,borderTop:'1px solid rgba(139,92,246,.12)'}}>
                      <span style={{color:'#fff',fontWeight:500}}>Total</span>
                      <span className="d" style={{color:'var(--pur-l)',fontSize:'1.3rem'}}>{fmt(total)}</span>
                    </div>
                  </div>
                  <div style={{marginTop:16,paddingTop:16,borderTop:'1px solid rgba(139,92,246,.1)',display:'flex',flexDirection:'column',gap:6}}>
                    {['🔒 Secure Checkout','🚚 Delivery: '+fmt(settings.deliveryFee),'↩ 7-Day Returns'].map(t=><p key={t} style={{textAlign:'center',color:'var(--muted)',fontSize:'.72rem'}}>{t}</p>)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
      <Footer/>
    </div>
  )
}
