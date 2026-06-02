import { NextResponse } from 'next/server'

export async function PUT(request, { params }) {
  try {
    const { adminFromReq } = require('../../../../lib/auth')
    if (!adminFromReq(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { readProducts, writeProducts } = require('../../../../lib/db')
    const body = await request.json()
    const products = readProducts()
    const idx = products.findIndex(p => p.id === params.id)
    if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const price = Number(body.price)
    const originalPrice = body.originalPrice ? Number(body.originalPrice) : null
    const discountPercent = body.discountPercent && Number(body.discountPercent) > 0
      ? Number(body.discountPercent)
      : (originalPrice && originalPrice > price ? Math.round((1 - price / originalPrice) * 100) : 0)

    products[idx] = {
      ...products[idx],
      ...body,
      id: params.id,
      price,
      // Only store originalPrice if there's a real discount - fixes the lingering strikethrough bug
      originalPrice: discountPercent > 0 ? originalPrice : null,
      discountPercent,
      stock:    Number(body.stock),
      featured: Boolean(body.featured),
      colors:   body.colors || products[idx].colors || [],
    }
    writeProducts(products)
    return NextResponse.json({ success: true, product: products[idx] })
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function DELETE(request, { params }) {
  try {
    const { adminFromReq } = require('../../../../lib/auth')
    if (!adminFromReq(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { readProducts, writeProducts } = require('../../../../lib/db')
    writeProducts(readProducts().filter(p => p.id !== params.id))
    return NextResponse.json({ success: true })
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
