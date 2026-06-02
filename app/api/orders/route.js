import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const { adminFromReq } = require('../../../lib/auth')
    if (!adminFromReq(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { readOrders } = require('../../../lib/db')
    return NextResponse.json({ orders: readOrders().reverse() })
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function POST(request) {
  try {
    const { readOrders, writeOrders, readProducts, writeProducts } = require('../../../lib/db')
    const { sendOrderNotification } = require('../../../lib/telegram')

    const body = await request.json()

    // Build the order object
    const orderId = 'BB-' + Date.now().toString().slice(-8).toUpperCase()
    const order = {
      id:            orderId,
      customer:      body.customer,
      items:         body.items,
      subtotal:      body.subtotal,
      shipping:      body.shipping,
      total:         body.total,
      paymentMethod: body.paymentMethod || 'cod',
      status:        'pending',
      notes:         '',
      createdAt:     new Date().toISOString(),
      updatedAt:     new Date().toISOString(),
    }

    // Deduct stock — supports per-variant stock (variantId) and legacy product-level stock
    const products = readProducts()
    for (const item of (body.items || [])) {
      const p = products.find(x => x.id === item.id)
      if (!p) continue
      if (item.variantId && Array.isArray(p.variants)) {
        // Deduct from the specific variant's stock
        const variant = p.variants.find(v => v.id === item.variantId)
        if (variant && variant.stock >= item.qty) variant.stock -= item.qty
      } else if (p.stock >= item.qty) {
        // Legacy: deduct from product-level stock
        p.stock -= item.qty
      }
    }
    writeProducts(products)

    // Persist the order
    const orders = readOrders()
    orders.push(order)
    writeOrders(orders)

    // 🔔 Send Telegram text notification (non-blocking — never fails the order)
    sendOrderNotification(order).catch(e =>
      console.error('[Telegram] Unexpected error in notification:', e.message)
    )

    return NextResponse.json({ success: true, orderId })
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
