import { NextResponse } from 'next/server'

export async function PUT(request, { params }) {
  try {
    const { adminFromReq } = require('../../../../lib/auth')
    if (!adminFromReq(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { readOrders, writeOrders } = require('../../../../lib/db')
    const body = await request.json()
    const orders = readOrders()
    const idx = orders.findIndex(o => o.id === params.id)
    if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    orders[idx] = { ...orders[idx], ...body, id: params.id, updatedAt: new Date().toISOString() }
    writeOrders(orders)
    return NextResponse.json({ success: true, order: orders[idx] })
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
