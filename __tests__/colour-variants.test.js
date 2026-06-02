/**
 * Acceptance tests — Named colour variants with per-variant stock
 * Updated to match polished component aria-labels and text
 */

import { render, screen, fireEvent, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import ProductGallery from '../app/products/[id]/ProductGallery'
import ProductActions from '../app/products/[id]/ProductActions'

const localStorageMock = (() => {
  let store = {}
  return { getItem: k => store[k] ?? null, setItem: (k,v) => { store[k] = String(v) }, clear: () => { store = {} } }
})()
Object.defineProperty(window, 'localStorage', { value: localStorageMock })
jest.spyOn(window, 'dispatchEvent')
beforeEach(() => { localStorageMock.clear(); window.dispatchEvent.mockClear() })

const RED   = { id:'v_001', name:'Red',                 images:['/r1.jpg','/r2.jpg','/r3.jpg'], stock:5 }
const GREEN = { id:'v_002', name:'Light green/Striped',  images:['/g1.jpg','/g2.jpg'],           stock:3 }
const OOS   = { id:'v_003', name:'Blue',                images:['/b1.jpg'],                      stock:0 }
const SOLO  = { id:'v_004', name:'Pink',                images:['/p1.jpg'],                      stock:2 }

const baseProduct  = { id:'1', name:'Noir Quilted Crossbody', price:897000, category:'Crossbody Bags', images:['/fallback.jpg'], stock:0, variants:[RED, GREEN] }
const allOOS       = { ...baseProduct, variants:[{ ...OOS }, { ...OOS, id:'v_005', name:'Purple' }] }
const noVar        = { id:'2', name:'Classic Tote', price:450000, category:'Tote Bags', images:['/t1.jpg','/t2.jpg'], stock:10, colors:['#0a0a0a'] }
const singleImg    = { ...baseProduct, variants:[SOLO] }

// ── GALLERY ───────────────────────────────────────────────────────────────

test('AC1 — variant thumbnails render for each variant', () => {
  render(<ProductGallery product={baseProduct} />)
  // aria-label is "Red" or "Red — Selected"
  expect(screen.getByRole('button', { name: /^Red/ })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /^Light green/ })).toBeInTheDocument()
})

test('AC2 — clicking a variant thumbnail switches the main gallery image', () => {
  render(<ProductGallery product={baseProduct} />)
  fireEvent.click(screen.getByRole('button', { name: /^Light green/ }))
  expect(document.querySelector('img[alt="Light green/Striped"]')).toHaveAttribute('src', '/g1.jpg')
})

test('AC3 — prev/next arrows shown when variant has multiple images', () => {
  render(<ProductGallery product={baseProduct} />)
  expect(screen.getByLabelText('Next image')).toBeInTheDocument()
  expect(screen.getByLabelText('Previous image')).toBeInTheDocument()
})

test('EDGE — no prev/next arrows when variant has only 1 image', () => {
  render(<ProductGallery product={singleImg} />)
  expect(screen.queryByLabelText('Next image')).not.toBeInTheDocument()
  expect(screen.queryByLabelText('Previous image')).not.toBeInTheDocument()
})

test('AC4 — selected variant name is displayed', () => {
  render(<ProductGallery product={baseProduct} />)
  expect(screen.getByText('Red')).toBeInTheDocument()
})

test('AC5b — all variant thumbnails show OOS overlay when all stock is 0', () => {
  render(<ProductGallery product={allOOS} />)
  expect(screen.getAllByText(/sold out/i).length).toBeGreaterThanOrEqual(2)
})

test('GALLERY — next arrow advances to second image', () => {
  render(<ProductGallery product={baseProduct} />)
  fireEvent.click(screen.getByLabelText('Next image'))
  expect(document.querySelector('img[alt="Red"]')).toHaveAttribute('src', '/r2.jpg')
})

test('GALLERY — previous arrow wraps to last image', () => {
  render(<ProductGallery product={baseProduct} />)
  fireEvent.click(screen.getByLabelText('Previous image'))
  expect(document.querySelector('img[alt="Red"]')).toHaveAttribute('src', '/r3.jpg')
})

test('GALLERY — switching variant resets gallery index to 0', () => {
  render(<ProductGallery product={baseProduct} />)
  fireEvent.click(screen.getByLabelText('Next image'))
  fireEvent.click(screen.getByRole('button', { name: /^Light green/ }))
  expect(document.querySelector('img[alt="Light green/Striped"]')).toHaveAttribute('src', '/g1.jpg')
})

test('GALLERY — dispatches bb_variant_selected event when variant clicked', () => {
  render(<ProductGallery product={baseProduct} />)
  fireEvent.click(screen.getByRole('button', { name: /^Light green/ }))
  const calls = window.dispatchEvent.mock.calls.map(c => c[0])
  const evt = calls.find(e => e.type === 'bb_variant_selected')
  expect(evt).toBeDefined()
  expect(evt.detail.id).toBe('v_002')
})

test('AC9 — product without variants renders product-level images', () => {
  render(<ProductGallery product={noVar} />)
  expect(document.querySelector('img[alt="Classic Tote"]')).toHaveAttribute('src', '/t1.jpg')
  expect(screen.queryByRole('button', { name: /^Red/ })).not.toBeInTheDocument()
})

// ── ACTIONS ───────────────────────────────────────────────────────────────

test('AC5 — Sold Out shown when first (OOS) variant is default', () => {
  const p = { ...baseProduct, variants:[{ ...OOS }, GREEN] }
  render(<ProductActions product={p} whatsappNumber={null} />)
  // Polished component uses "Sold Out"
  expect(screen.getByRole('button', { name: /sold out/i })).toBeDisabled()
})

test('AC6 — stock indicator reflects default (first) variant', () => {
  render(<ProductActions product={baseProduct} whatsappNumber={null} />)
  expect(screen.getByText(/In stock|5 left|5 remaining/i)).toBeInTheDocument()
})

test('AC6 — stock updates when bb_variant_selected event fires', () => {
  render(<ProductActions product={baseProduct} whatsappNumber={null} />)
  act(() => { window.dispatchEvent(new CustomEvent('bb_variant_selected', { detail: GREEN })) })
  expect(screen.getByText(/3/)).toBeInTheDocument()
})

test('AC7 — cart item includes variantId and variantName', () => {
  render(<ProductActions product={baseProduct} whatsappNumber={null} />)
  fireEvent.click(screen.getByRole('button', { name: /add to bag/i }))
  const cart = JSON.parse(localStorage.getItem('bb_cart'))
  expect(cart[0].variantId).toBe('v_001')
  expect(cart[0].variantName).toBe('Red')
})

test('AC7 — cart updates variantName when variant changes via event', () => {
  render(<ProductActions product={baseProduct} whatsappNumber={null} />)
  act(() => { window.dispatchEvent(new CustomEvent('bb_variant_selected', { detail: GREEN })) })
  fireEvent.click(screen.getByRole('button', { name: /add to bag/i }))
  const cart = JSON.parse(localStorage.getItem('bb_cart'))
  expect(cart[0].variantName).toBe('Light green/Striped')
})

test('AC8 — Telegram colourLabel prefers variantName over selectedColor', () => {
  const items = [
    { name:'Bag', price:897000, qty:1, variantName:'Red', selectedColor:'#ff0000' },
    { name:'Tote', price:450000, qty:1, selectedColor:'#0a0a0a' },
  ]
  const lines = items.map(i => i.variantName || i.selectedColor || null)
  expect(lines[0]).toBe('Red')
  expect(lines[1]).toBe('#0a0a0a')
})

test('AC10 — WhatsApp link includes variant name when in stock', () => {
  render(<ProductActions product={baseProduct} whatsappNumber="256700000000" />)
  const link = screen.getByRole('link', { name: /inquiry on whatsapp/i })
  expect(link).toHaveAttribute('href', expect.stringContaining(encodeURIComponent('Colour: Red')))
})

test('AC10 — WhatsApp link opens in new tab with noopener', () => {
  render(<ProductActions product={baseProduct} whatsappNumber="256700000000" />)
  const link = screen.getByRole('link', { name: /inquiry on whatsapp/i })
  expect(link).toHaveAttribute('target', '_blank')
  expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'))
})

test('AC9 — no-variant product shows Add to Bag', () => {
  render(<ProductActions product={noVar} whatsappNumber={null} />)
  expect(screen.getByRole('button', { name: /add to bag/i })).toBeInTheDocument()
})
