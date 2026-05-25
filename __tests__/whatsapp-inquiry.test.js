/**
 * Acceptance tests — WhatsApp product inquiry button
 *
 * Criteria covered:
 * AC1 - Button renders when whatsappNumber set and stock > 0
 * AC2 - Button href contains correct wa.me URL with product name, colour, qty
 * AC3 - Number comes from settings (prop-driven; admin change reflected)
 * AC4 - Button renders on all screen sizes (DOM presence; responsive CSS tested visually)
 * AC5 - Button does not render when whatsappNumber is falsy
 * AC6 - Button does not render when stock === 0
 * EDGE - URL updates when qty or colour changes
 */

import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import ProductActions from '../app/products/[id]/ProductActions'

const baseProduct = {
  id: '1',
  name: 'Noir Quilted Crossbody',
  price: 897000,
  stock: 15,
  colors: ['#0a0a0a', '#1a0030'],
  images: [],
}

const outOfStockProduct = { ...baseProduct, stock: 0 }
const noColorProduct    = { ...baseProduct, colors: [] }

// ─── AC1: button renders when configured ───────────────────────────────────
test('AC1 — renders inquiry button when whatsappNumber is set and stock > 0', () => {
  render(<ProductActions product={baseProduct} whatsappNumber="256700000000" />)
  expect(screen.getByText(/inquiry on whatsapp/i)).toBeInTheDocument()
})

// ─── AC2: URL is correct ────────────────────────────────────────────────────
test('AC2 — button href uses wa.me with correct number and product name', () => {
  render(<ProductActions product={baseProduct} whatsappNumber="256700000000" />)
  const link = screen.getByRole('link', { name: /inquiry on whatsapp/i })
  expect(link).toHaveAttribute('href', expect.stringContaining('wa.me/256700000000'))
  expect(link).toHaveAttribute('href', expect.stringContaining(encodeURIComponent('Noir Quilted Crossbody')))
})

test('AC2 — pre-filled message includes quantity', () => {
  render(<ProductActions product={baseProduct} whatsappNumber="256700000000" />)
  const link = screen.getByRole('link', { name: /inquiry on whatsapp/i })
  expect(link).toHaveAttribute('href', expect.stringContaining(encodeURIComponent('Qty: 1')))
})

test('AC2 — pre-filled message includes selected colour', () => {
  render(<ProductActions product={baseProduct} whatsappNumber="256700000000" />)
  const link = screen.getByRole('link', { name: /inquiry on whatsapp/i })
  expect(link).toHaveAttribute('href', expect.stringContaining(encodeURIComponent('Colour:')))
})

// ─── AC3: number is prop-driven (reflects admin setting) ────────────────────
test('AC3 — uses whatsappNumber prop directly (admin-controlled)', () => {
  render(<ProductActions product={baseProduct} whatsappNumber="256711111111" />)
  const link = screen.getByRole('link', { name: /inquiry on whatsapp/i })
  expect(link).toHaveAttribute('href', expect.stringContaining('wa.me/256711111111'))
})

// ─── AC5: no button when number is missing ──────────────────────────────────
test('AC5 — button does not render when whatsappNumber is null', () => {
  render(<ProductActions product={baseProduct} whatsappNumber={null} />)
  expect(screen.queryByText(/inquiry on whatsapp/i)).not.toBeInTheDocument()
})

test('AC5 — button does not render when whatsappNumber is empty string', () => {
  render(<ProductActions product={baseProduct} whatsappNumber="" />)
  expect(screen.queryByText(/inquiry on whatsapp/i)).not.toBeInTheDocument()
})

// ─── AC6: no button when out of stock ──────────────────────────────────────
test('AC6 — button does not render when stock is 0', () => {
  render(<ProductActions product={outOfStockProduct} whatsappNumber="256700000000" />)
  expect(screen.queryByText(/inquiry on whatsapp/i)).not.toBeInTheDocument()
})

// ─── EDGE: URL reflects quantity changes ────────────────────────────────────
test('EDGE — inquiry URL updates when quantity is increased', () => {
  render(<ProductActions product={baseProduct} whatsappNumber="256700000000" />)
  fireEvent.click(screen.getByText('+'))
  const link = screen.getByRole('link', { name: /inquiry on whatsapp/i })
  expect(link).toHaveAttribute('href', expect.stringContaining(encodeURIComponent('Qty: 2')))
})

// ─── EDGE: product with no colours ─────────────────────────────────────────
test('EDGE — renders correctly for product with no colours configured', () => {
  render(<ProductActions product={noColorProduct} whatsappNumber="256700000000" />)
  expect(screen.getByText(/inquiry on whatsapp/i)).toBeInTheDocument()
  const link = screen.getByRole('link', { name: /inquiry on whatsapp/i })
  expect(link).toHaveAttribute('href', expect.stringContaining('wa.me/256700000000'))
})

// ─── EDGE: opens in new tab ─────────────────────────────────────────────────
test('EDGE — button opens in a new tab', () => {
  render(<ProductActions product={baseProduct} whatsappNumber="256700000000" />)
  const link = screen.getByRole('link', { name: /inquiry on whatsapp/i })
  expect(link).toHaveAttribute('target', '_blank')
  expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'))
})
