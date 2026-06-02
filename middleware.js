import { NextResponse } from 'next/server'

export function middleware(request) {
  const { pathname } = request.nextUrl
  if (!pathname.startsWith('/admin/')) return NextResponse.next()
  const token = request.cookies.get('admin_token')?.value
  if (!token) return NextResponse.redirect(new URL('/admin', request.url))
  try {
    const p = JSON.parse(Buffer.from(token, 'base64').toString())
    if (p.role !== 'admin' || p.exp <= Date.now()) {
      const res = NextResponse.redirect(new URL('/admin', request.url))
      res.cookies.delete('admin_token')
      return res
    }
  } catch {
    return NextResponse.redirect(new URL('/admin', request.url))
  }
  return NextResponse.next()
}

export const config = { matcher: ['/admin/:path*'] }
