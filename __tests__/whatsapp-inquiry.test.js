/**
 * Acceptance tests — WhatsApp product inquiry button
 * Updated for polished ProductActions (canAdd gate, variant-aware)
 */

import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import ProductActions from '../app/products/[id]/ProductActions'

const localStorageMock = (() => {
  let store = {}
  return { getItem: k => store[k] ?? null, setItem: (k,v) => { store[k] = String(v) }, clear: () => { store = {} } }
})()
Object.defineProperty(window, 'localStorage', { value: localStorageMock })
// Use real dispatchEvent so CustomEvent/Event both work; spy for assertions
jest.spyOn(window, 'dispatchEvent')
beforeEach(() => { localStorageMock.clear(); window.dispatchEvent.mockClear() })

// Product with a variant (stock > 0) so WhatsApp button is visible
const baseProduct = {
  id:'1', name:'Noir Quilted Crossbody', price:897000, category:'Crossbody Bags',
  images:['/img.jpg'], stock:0,
  variants:[{ id:'v_001', name:'Black', images:['/img.jpg'], stock:8 }],
}
// No-variant product with stock
const simpleProduct = {
  id:'2', name:'Classic Tote', price:450000, category:'Tote Bags',
  images:['/tote.jpg'], stock:5, colors:['#0a0a0a'],
}
const outOfStockProduct = { ...baseProduct, variants:[{ id:'v_oos', name:'Blue', images:['/b.jpg'], stock:0 }] }

// AC1 — button renders
test('AC1 — renders inquiry button when whatsappNumber set and stock > 0', () => {
  render(<ProductActions product={baseProduct} whatsappNumber="256700000000" />)
  expect(screen.getByRole('link', { name: /inquiry on whatsapp/i })).toBeInTheDocument()
})

// AC2 — correct URL
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
  expect(link).toHaveAttribute('href', expect.stringContaining(encodeURIComponent('Colour: Black')))
})

// AC3 — admin-controlled number
test('AC3 — uses whatsappNumber prop directly', () => {
  render(<ProductActions product={baseProduct} whatsappNumber="256711111111" />)
  const link = screen.getByRole('link', { name: /inquiry on whatsapp/i })
  expect(link).toHaveAttribute('href', expect.stringContaining('wa.me/256711111111'))
})

// AC5 — no button when number is missing
test('AC5 — button does not render when whatsappNumber is null', () => {
  render(<ProductActions product={baseProduct} whatsappNumber={null} />)
  expect(screen.queryByRole('link', { name: /inquiry on whatsapp/i })).not.toBeInTheDocument()
})

test('AC5 — button does not render when whatsappNumber is empty string', () => {
  render(<ProductActions product={baseProduct} whatsappNumber="" />)
  expect(screen.queryByRole('link', { name: /inquiry on whatsapp/i })).not.toBeInTheDocument()
})

// AC6 — no button when OOS
test('AC6 — button does not render when variant stock is 0', () => {
  render(<ProductActions product={outOfStockProduct} whatsappNumber="256700000000" />)
  expect(screen.queryByRole('link', { name: /inquiry on whatsapp/i })).not.toBeInTheDocument()
})

// EDGE — qty update reflected in URL
test('EDGE — inquiry URL updates when quantity is increased', () => {
  render(<ProductActions product={baseProduct} whatsappNumber="256700000000" />)
  fireEvent.click(screen.getByLabelText('Increase quantity'))
  const link = screen.getByRole('link', { name: /inquiry on whatsapp/i })
  expect(link).toHaveAttribute('href', expect.stringContaining(encodeURIComponent('Qty: 2')))
})

// EDGE — new tab + noopener
test('EDGE — button opens in a new tab with noopener', () => {
  render(<ProductActions product={baseProduct} whatsappNumber="256700000000" />)
  const link = screen.getByRole('link', { name: /inquiry on whatsapp/i })
  expect(link).toHaveAttribute('target', '_blank')
  expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'))
})
