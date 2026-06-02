/**
 * Blush & Boujee Atelier — PDF Receipt Generator
 * ------------------------------------------------
 * Generates a professional PDF receipt using PDFKit (server-side Node.js).
 *
 * NOTE: jsPDF is browser-only and cannot run in Next.js API routes.
 *       PDFKit is the correct server-side equivalent.
 *
 * Usage:
 *   const { generateReceipt } = require('./generateReceipt')
 *   const { buffer, filename } = await generateReceipt(order)
 */

const PDFDocument = require('pdfkit')

// ─── Helpers ────────────────────────────────────────────────────────────────

const fmtCurrency = n =>
  'UGX ' + Number(n || 0).toLocaleString('en-UG', { minimumFractionDigits: 0 })

const fmtDate = iso => {
  if (!iso) return 'N/A'
  return new Date(iso).toLocaleDateString('en-UG', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
}

const paymentLabel = {
  cod:         'Cash on Delivery',
  mobilemoney: 'Mobile Money',
  card:        'Card Payment',
}

// ─── PDF generation ──────────────────────────────────────────────────────────

/**
 * generateReceipt(order) → Promise<{ buffer: Buffer, filename: string }>
 *
 * Never throws. Returns null if generation fails.
 */
function generateReceipt(order) {
  return new Promise((resolve, reject) => {
    try {
      const {
        id, customer = {}, items = [],
        subtotal, shipping, total,
        paymentMethod, status, createdAt,
      } = order

      const fullName = [customer.firstName, customer.lastName].filter(Boolean).join(' ') || 'N/A'
      const address  = [customer.address, customer.city, customer.state, customer.country]
                         .filter(Boolean).join(', ') || 'N/A'
      const payLabel = paymentLabel[paymentMethod] || paymentMethod || 'N/A'
      const statusLabel = (status || 'pending').charAt(0).toUpperCase() + (status || 'pending').slice(1)

      // ── Document setup ───────────────────────────────────────────────────
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 55, right: 55 },
        info: {
          Title:    `Receipt ${id} — Blush & Boujee Atelier`,
          Author:   'Blush & Boujee Atelier',
          Subject:  'Order Receipt',
          Keywords: 'receipt order blush boujee',
        },
      })

      const chunks = []
      doc.on('data',  chunk => chunks.push(chunk))
      doc.on('end',   ()    => resolve({ buffer: Buffer.concat(chunks), filename: `receipt-${id}.pdf` }))
      doc.on('error', err   => reject(err))

      const W      = doc.page.width  - 55 - 55   // usable width
      const BLACK  = '#0a0a0a'
      const PURPLE = '#4c1d95'
      const MUTED  = '#6b7280'
      const LIGHT  = '#f3f4f6'
      const LINE   = '#e5e7eb'

      // ── Header band ──────────────────────────────────────────────────────
      doc.rect(0, 0, doc.page.width, 110).fill(BLACK)

      // Store name
      doc.fillColor('#ffffff')
         .font('Helvetica-Bold')
         .fontSize(22)
         .text('BLUSH & BOUJEE ATELIER', 55, 32, { align: 'left' })

      doc.fillColor('#a78bfa')    // light purple
         .font('Helvetica')
         .fontSize(9)
         .text('LUXURY HANDBAGS & ACCESSORIES', 55, 58, { align: 'left', characterSpacing: 2 })

      // "RECEIPT" badge top-right
      doc.fillColor('#a78bfa')
         .font('Helvetica-Bold')
         .fontSize(11)
         .text('RECEIPT', 0, 42, { align: 'right', width: doc.page.width - 55, characterSpacing: 3 })

      doc.fillColor('#ffffff')
         .font('Helvetica')
         .fontSize(9)
         .text(fmtDate(createdAt), 0, 58, { align: 'right', width: doc.page.width - 55 })

      // ── Order ID strip ───────────────────────────────────────────────────
      doc.rect(0, 110, doc.page.width, 32).fill(PURPLE)
      doc.fillColor('#ffffff')
         .font('Helvetica-Bold')
         .fontSize(10)
         .text(`ORDER ID: ${id}`, 55, 120, { align: 'left', characterSpacing: 1 })
      doc.fillColor('#ddd6fe')
         .font('Helvetica')
         .fontSize(9)
         .text(`Status: ${statusLabel}`, 0, 120, { align: 'right', width: doc.page.width - 55 })

      // ── Two-column info block ────────────────────────────────────────────
      let y = 165

      const sectionTitle = (text, xPos, yPos) => {
        doc.fillColor(PURPLE)
           .font('Helvetica-Bold')
           .fontSize(8)
           .text(text.toUpperCase(), xPos, yPos, { characterSpacing: 1.5 })
      }

      const infoLine = (label, value, xPos, yPos) => {
        doc.fillColor(MUTED).font('Helvetica').fontSize(8).text(label, xPos, yPos)
        doc.fillColor(BLACK).font('Helvetica').fontSize(9).text(value, xPos, yPos + 12, { width: W / 2 - 15 })
        return yPos + 28
      }

      // Left column — Customer
      sectionTitle('Customer Details', 55, y)
      y += 14
      let yL = infoLine('Full Name',     fullName,             55, y)
          yL = infoLine('Email Address', customer.email || 'N/A', 55, yL)
          yL = infoLine('Phone Number',  customer.phone || 'N/A', 55, yL)

      // Right column — Delivery
      const xR = 55 + W / 2 + 10
      sectionTitle('Delivery Details', xR, y)
      let yR = y + 14
          yR = infoLine('Address', address,  xR, yR)
          yR = infoLine('Payment', payLabel, xR, yR)

      // Separator
      const afterInfo = Math.max(yL, yR) + 10
      doc.moveTo(55, afterInfo).lineTo(55 + W, afterInfo).lineWidth(1).strokeColor(LINE).stroke()

      // ── Items table ──────────────────────────────────────────────────────
      y = afterInfo + 18

      // Table header
      doc.rect(55, y, W, 22).fill(BLACK)
      doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(8)
      doc.text('ITEM',     63,  y + 7)
      doc.text('QTY',      55 + W * 0.62, y + 7, { width: 40, align: 'right' })
      doc.text('UNIT PRICE', 55 + W * 0.70, y + 7, { width: W * 0.16, align: 'right' })
      doc.text('TOTAL',    55 + W * 0.87, y + 7, { width: W * 0.13, align: 'right' })
      y += 22

      // Rows
      items.forEach((item, i) => {
        const rowBg = i % 2 === 0 ? '#ffffff' : LIGHT
        const lineTotal = (item.price || 0) * (item.qty || 1)

        doc.rect(55, y, W, 22).fill(rowBg)

        const itemLabel = item.selectedColor
          ? `${item.name || 'Item'}  [Colour: ${item.selectedColor}]`
          : (item.name || 'Item')
        doc.fillColor(BLACK).font('Helvetica').fontSize(8.5)
        doc.text(itemLabel, 63, y + 7, { width: W * 0.58, ellipsis: true })

        doc.text(String(item.qty || 1),
          55 + W * 0.62, y + 7, { width: 40, align: 'right' })

        doc.text(fmtCurrency(item.price || 0),
          55 + W * 0.70, y + 7, { width: W * 0.16, align: 'right' })

        doc.fillColor(BLACK).font('Helvetica-Bold')
        doc.text(fmtCurrency(lineTotal),
          55 + W * 0.87, y + 7, { width: W * 0.13, align: 'right' })

        y += 22
      })

      // ── Totals block ─────────────────────────────────────────────────────
      doc.moveTo(55, y).lineTo(55 + W, y).lineWidth(0.5).strokeColor(LINE).stroke()
      y += 12

      const totalRow = (label, value, bold = false, color = BLACK) => {
        doc.fillColor(MUTED).font('Helvetica').fontSize(8.5)
           .text(label, 55, y, { width: W * 0.75, align: 'right' })
        doc.fillColor(color)
           .font(bold ? 'Helvetica-Bold' : 'Helvetica')
           .fontSize(bold ? 10 : 8.5)
           .text(value, 55 + W * 0.78, y, { width: W * 0.22, align: 'right' })
        y += bold ? 18 : 15
      }

      totalRow('Subtotal',        fmtCurrency(subtotal))
      totalRow('Shipping',        shipping === 0 ? 'FREE' : fmtCurrency(shipping))

      doc.moveTo(55 + W * 0.6, y).lineTo(55 + W, y).lineWidth(0.5).strokeColor(LINE).stroke()
      y += 8

      totalRow('TOTAL DUE',       fmtCurrency(total), true, PURPLE)

      // ── Customer notes ───────────────────────────────────────────────────
      if (customer.notes?.trim()) {
        y += 8
        doc.rect(55, y, W, 1).fill(LINE)
        y += 10
        doc.fillColor(PURPLE).font('Helvetica-Bold').fontSize(8).text('ORDER NOTES', 55, y, { characterSpacing: 1 })
        y += 13
        doc.fillColor(MUTED).font('Helvetica').fontSize(8.5)
           .text(customer.notes.trim(), 55, y, { width: W })
        y += 24
      }

      // ── Footer ───────────────────────────────────────────────────────────
      // Position footer near bottom of page
      const footerY = doc.page.height - 100

      doc.rect(0, footerY - 10, doc.page.width, 1).fill(LINE)

      doc.rect(0, footerY, doc.page.width, 100).fill(BLACK)

      doc.fillColor('#a78bfa')
         .font('Helvetica-Bold')
         .fontSize(13)
         .text('Thank You For Shopping With Us!', 55, footerY + 18, { align: 'center', width: W })

      doc.fillColor('#9ca3af')
         .font('Helvetica')
         .fontSize(8)
         .text(
           'Blush & Boujee Atelier  ·  Luxury Handbags & Accessories  ·  Uganda',
           55, footerY + 38, { align: 'center', width: W }
         )

      doc.fillColor('#6b7280')
         .fontSize(7.5)
         .text(
           `This is your official receipt. Please retain it for your records.  |  Order Date: ${fmtDate(createdAt)}`,
           55, footerY + 56, { align: 'center', width: W }
         )

      doc.end()

    } catch (err) {
      reject(err)
    }
  })
}

module.exports = { generateReceipt }
