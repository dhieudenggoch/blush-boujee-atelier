import { NextResponse } from 'next/server'
import { verifyCredentials, makeToken } from '../../../../lib/auth'

export async function POST(request) {
  try {
    const { username, password } = await request.json()
    if (verifyCredentials(username, password)) {
      const token = makeToken()
      const res = NextResponse.json({ success: true })
      res.cookies.set('admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 86400,
        path: '/',
      })
      return res
    }
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
