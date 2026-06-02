/**
 * Blush & Boujee Atelier — Telegram Notification Service
 * -------------------------------------------------------
 * Sends order alerts to the admin Telegram chat.
 * Uses a lightweight file-based dedup log so duplicate
 * notifications are never sent even on hot-reloads or retries.
 */

const fs   = require('fs')
const path = require('path')

// ─── Config ────────────────────────────────────────────────────────────────

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const CHAT_ID   = process.env.TELEGRAM_CHAT_ID

const DEDUP_FILE = path.join(process.cwd(), 'data', '.telegram_sent.json')
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`

// ─── Deduplication helpers ──────────────────────────────────────────────────

function loadSentIds() {
  try {
    if (!fs.existsSync(DEDUP_FILE)) return new Set()
    const raw = JSON.parse(fs.readFileSync(DEDUP_FILE, 'utf-8'))
    return new Set(Array.isArray(raw) ? raw : [])
  } catch {
    return new Set()
  }
}

function markAsSent(orderId) {
  try {
    const ids = loadSentIds()
    ids.add(orderId)
    // Keep only the last 500 order IDs to prevent unbounded growth
    const trimmed = [...ids].slice(-500)
    const dir = path.join(process.cwd(), 'data')
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(DEDUP_FILE, JSON.stringify(trimmed, null, 2))
  } catch (e) {
    console.error('[Telegram] Failed to update dedup log:', e.message)
  }
}

function alreadySent(orderId) {
  return loadSentIds().has(orderId)
}

// ─── Message formatter ──────────────────────────────────────────────────────

const paymentLabel = {
  cod:         'Cash on Delivery',
  mobilemoney: 'Mobile Money',
  card:        'Card Payment',
}

function formatOrderMessage(order) {
  const { id, customer, items = [], subtotal, shipping, total, paymentMethod, createdAt } = order

  const fmt = n => 'UGX ' + Number(n || 0).toLocaleString('en-UG', { minimumFractionDigits: 0 })

  const productLines = items.map(item => {
    const lineTotal = fmt(item.price * item.qty)
    const colourLabel = item.variantName || item.selectedColor || null
    const colourLine = colourLabel ? `
    🎨 Colour: ${colourLabel}` : ''
    return `  • ${item.name} ×${item.qty}  →  ${lineTotal}${colourLine}`
  }).join('\n')

  const payLabel = {
    cod:         '💵 Cash on Delivery',
    mobilemoney: '📱 Mobile Money',
    card:        '💳 Card',
  }[paymentMethod] || paymentMethod || 'N/A'

  const dateStr = createdAt
    ? new Date(createdAt).toLocaleString('en-UG', { dateStyle: 'medium', timeStyle: 'short' })
    : 'N/A'

  const fullName   = [customer?.firstName, customer?.lastName].filter(Boolean).join(' ') || 'N/A'
  const phone      = customer?.phone   || 'N/A'
  const email      = customer?.email   || 'N/A'
  const address    = [customer?.address, customer?.city, customer?.state, customer?.country]
                       .filter(Boolean).join(', ') || 'N/A'
  const notes      = customer?.notes?.trim() || '—'

  return [
    `🛍️ *NEW ORDER — Blush \\& Boujee*`,
    ``,
    `📦 *Order:* \`${escMd(id)}\``,
    `🕐 *Date:* ${escMd(dateStr)}`,
    ``,
    `👤 *Customer*`,
    `  Name:   ${escMd(fullName)}`,
    `  Phone:  ${escMd(phone)}`,
    `  Email:  ${escMd(email)}`,
    ``,
    `📍 *Delivery Address*`,
    `  ${escMd(address)}`,
    ``,
    `🛒 *Items*`,
    escMd(productLines),
    ``,
    `💰 *Payment*`,
    `  Subtotal: ${escMd(fmt(subtotal))}`,
    `  Shipping: ${escMd(shipping === 0 ? 'FREE' : fmt(shipping))}`,
    `  *Total:   ${escMd(fmt(total))}*`,
    `  Method:  ${escMd(payLabel)}`,
    ``,
    `📝 *Notes:* ${escMd(notes)}`,
    ``,
    `_Log in to your admin dashboard to manage this order\\._`,
  ].join('\n')
}

/** Escape special chars for Telegram MarkdownV2 */
function escMd(text) {
  return String(text ?? '').replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, c => '\\' + c)
}

// ─── Main send function ─────────────────────────────────────────────────────

/**
 * sendOrderNotification(order)
 *
 * Sends a Telegram message to the admin chat for the given order.
 * Returns { sent: true } on success, { sent: false, reason } on skip/failure.
 * Never throws — all errors are caught and logged.
 */
async function sendOrderNotification(order) {
  // Guard: missing config
  if (!BOT_TOKEN || !CHAT_ID) {
    console.warn('[Telegram] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set — skipping notification.')
    return { sent: false, reason: 'missing_config' }
  }

  // Guard: duplicate
  if (alreadySent(order.id)) {
    console.log(`[Telegram] Notification already sent for order ${order.id} — skipping.`)
    return { sent: false, reason: 'duplicate' }
  }

  const message = formatOrderMessage(order)

  try {
    const res = await fetch(TELEGRAM_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id:    CHAT_ID,
        text:       message,
        parse_mode: 'MarkdownV2',
      }),
    })

    const data = await res.json()

    if (!res.ok || !data.ok) {
      console.error('[Telegram] API error:', JSON.stringify(data))
      return { sent: false, reason: 'api_error', detail: data.description }
    }

    // Mark as sent ONLY after confirmed delivery
    markAsSent(order.id)
    console.log(`[Telegram] ✅ Notification sent for order ${order.id}`)
    return { sent: true }

  } catch (e) {
    console.error('[Telegram] Network error:', e.message)
    return { sent: false, reason: 'network_error', detail: e.message }
  }
}

// ─── Receipt document sender ────────────────────────────────────────────────

/**
 * sendReceiptDocument({ buffer, filename, order })
 *
 * Sends a PDF buffer to the admin Telegram chat as a downloadable document.
 * Extends the existing bot — no new bot, no new config.
 * Returns { sent: true } on success, { sent: false, reason } on failure.
 * Never throws.
 */
async function sendReceiptDocument({ buffer, filename, order }) {
  if (!BOT_TOKEN || !CHAT_ID) {
    console.warn('[Telegram] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set — skipping receipt.')
    return { sent: false, reason: 'missing_config' }
  }

  const fmt      = n => 'UGX ' + Number(n || 0).toLocaleString('en-UG', { minimumFractionDigits: 0 })
  const fullName = [order.customer?.firstName, order.customer?.lastName].filter(Boolean).join(' ') || 'N/A'

  const caption = [
    `🧾 NEW ORDER RECEIPT`,
    ``,
    `📦 Order ID:  ${order.id}`,
    `👤 Customer:  ${fullName}`,
    `📱 Phone:     ${order.customer?.phone || 'N/A'}`,
    `💰 Total:     ${fmt(order.total)}`,
    `💳 Payment:   ${paymentLabel[order.paymentMethod] || order.paymentMethod || 'N/A'}`,
    ``,
    `Download the PDF above for the full receipt.`,
  ].join('\n')

  try {
    // ── Why manual multipart? ───────────────────────────────────────────────
    // Node.js's native FormData silently drops the filename when appending a
    // Blob, so Telegram receives an unnamed field and rejects it as not a
    // valid document. Constructing the raw multipart Buffer guarantees the
    // correct Content-Disposition header including filename= on every runtime.
    // No extra npm packages required — pure Node.js Buffers only.
    // ────────────────────────────────────────────────────────────────────────

    const boundary = `TgBoundary${Date.now()}`
    const CRLF     = '\r\n'

    // Helper: text field part
    const textPart = (name, value) =>
      `--${boundary}${CRLF}` +
      `Content-Disposition: form-data; name="${name}"${CRLF}` +
      CRLF +
      `${value}${CRLF}`

    const bodyParts = Buffer.concat([
      // chat_id field
      Buffer.from(textPart('chat_id', CHAT_ID)),

      // caption field
      Buffer.from(textPart('caption', caption)),

      // document file — must include filename so Telegram treats it as a file
      Buffer.from(
        `--${boundary}${CRLF}` +
        `Content-Disposition: form-data; name="document"; filename="${filename}"${CRLF}` +
        `Content-Type: application/pdf${CRLF}` +
        CRLF
      ),
      Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer),
      Buffer.from(`${CRLF}--${boundary}--${CRLF}`),
    ])

    const res = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`,
      {
        method:  'POST',
        headers: {
          'Content-Type':   `multipart/form-data; boundary=${boundary}`,
          'Content-Length': String(bodyParts.length),
        },
        body: bodyParts,
      }
    )

    const data = await res.json()

    if (!res.ok || !data.ok) {
      console.error('[Telegram] sendDocument API error:', JSON.stringify(data))
      return { sent: false, reason: 'api_error', detail: data.description }
    }

    console.log(`[Telegram] ✅ Receipt PDF sent for order ${order.id}`)
    return { sent: true }

  } catch (e) {
    console.error('[Telegram] Receipt network error:', e.message)
    return { sent: false, reason: 'network_error', detail: e.message }
  }
}

module.exports = { sendOrderNotification, sendReceiptDocument }
