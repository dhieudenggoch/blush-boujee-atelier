import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(request) {
  try {
    const { adminFromReq } = require('../../../lib/auth')
    if (!adminFromReq(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const formData = await request.formData()
    const file = formData.get('file')
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })
    const allowed = ['image/jpeg','image/png','image/webp','image/gif']
    if (!allowed.includes(file.type)) return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 })
    const bytes = await file.arrayBuffer()
    const dir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(dir, { recursive: true })
    const ext = file.name.split('.').pop().toLowerCase()
    const filename = `bag-${Date.now()}.${ext}`
    await writeFile(path.join(dir, filename), Buffer.from(bytes))
    return NextResponse.json({ success: true, url: `/uploads/${filename}` })
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
