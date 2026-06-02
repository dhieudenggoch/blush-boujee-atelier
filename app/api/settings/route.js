import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { readSettings } = require('../../../lib/db')
    return NextResponse.json({ settings: readSettings() })
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

export async function PUT(request) {
  try {
    const { adminFromReq } = require('../../../lib/auth')
    if (!adminFromReq(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { readSettings, writeSettings } = require('../../../lib/db')
    const body = await request.json()
    const updated = { ...readSettings(), ...body }
    writeSettings(updated)
    return NextResponse.json({ success: true, settings: updated })
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
