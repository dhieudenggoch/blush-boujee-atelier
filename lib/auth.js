export function verifyCredentials(u, p) {
  return u === (process.env.ADMIN_USERNAME || 'admin') &&
         p === (process.env.ADMIN_PASSWORD  || 'BlushBoujee@2025')
}
export function makeToken() {
  return Buffer.from(JSON.stringify({ role:'admin', exp: Date.now() + 86400000 })).toString('base64')
}
export function checkToken(tok) {
  try {
    const p = JSON.parse(Buffer.from(tok, 'base64').toString())
    return p.role === 'admin' && p.exp > Date.now()
  } catch { return false }
}
export function adminFromReq(req) {
  const c = req.headers.get('cookie') || ''
  const m = c.match(/admin_token=([^;]+)/)
  return m && checkToken(m[1]) ? true : null
}
