import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { readProducts } = require('../../../lib/db')
    return NextResponse.json({ products: readProducts() })
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function POST(request) {
  try {
    const { adminFromReq } = require('../../../lib/auth')
    if (!adminFromReq(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { readProducts, writeProducts } = require('../../../lib/db')
    const body = await request.json()
    const products = readProducts()

    const price = Number(body.price)
    const originalPrice = body.originalPrice ? Number(body.originalPrice) : null
    // Only compute discount if originalPrice is actually higher than price
    const discountPercent = body.discountPercent && Number(body.discountPercent) > 0
      ? Number(body.discountPercent)
      : (originalPrice && originalPrice > price ? Math.round((1 - price / originalPrice) * 100) : 0)

    const product = {
      id:             Date.now().toString(),
      name:           body.name,
      price,
      // Only store originalPrice if there's an actual discount
      originalPrice:  discountPercent > 0 ? originalPrice : null,
      discountPercent,
      category:       body.category,
      description:    body.description,
      images:         body.images || [],
      colors:         body.colors || [],
      stock:          Number(body.stock) || 0,
      featured:       Boolean(body.featured),
      tags:           body.tags || [],
      createdAt:      new Date().toISOString(),
    }
    products.push(product)
    writeProducts(products)
    return NextResponse.json({ success: true, product })
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
