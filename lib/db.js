const fs = require('fs')
const path = require('path')

const DIR      = path.join(process.cwd(), 'data')
const PRODUCTS = path.join(DIR, 'products.json')
const ORDERS   = path.join(DIR, 'orders.json')
const SETTINGS = path.join(DIR, 'settings.json')

function ensureDir() {
  if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true })
}

function readProducts() {
  ensureDir()
  if (!fs.existsSync(PRODUCTS)) {
    const seed = [
      { id:'1', name:'Noir Quilted Crossbody',  price:897000,  originalPrice:null, discountPercent:0, category:'Crossbody Bags', description:'A timeless black quilted crossbody bag with gold-tone hardware. Features a secure flap closure, adjustable chain strap, and luxurious satin interior lining.', images:[], colors:['#0a0a0a','#1a0030','#d4af37'], stock:15, featured:true,  tags:['bestseller'], createdAt:new Date().toISOString() },
      { id:'2', name:'Amethyst Tote Luxe',       price:1404000, originalPrice:null, discountPercent:0, category:'Tote Bags',      description:'Structured tote in deep purple with matte black hardware. Spacious enough for your essentials, stunning enough to turn heads.', images:[], colors:['#4c1d95','#0a0a0a','#6d28d9'], stock:8,  featured:true,  tags:['new'],        createdAt:new Date().toISOString() },
      { id:'3', name:'Velvet Femme Clutch',      price:644000,  originalPrice:null, discountPercent:0, category:'Feminine Bags',  description:'Midnight velvet clutch with crystal-encrusted clasp. Lined in champagne silk.', images:[], colors:['#0a0a0a','#7c3aed','#f5f5f5'], stock:5,  featured:true,  tags:['limited'],    createdAt:new Date().toISOString() },
      { id:'4', name:'Shadow Mini Bag',          price:536000,  originalPrice:null, discountPercent:0, category:'Crossbody Bags', description:'Compact and chic mini bag with a long adjustable strap.', images:[], colors:['#0a0a0a','#3b0764'], stock:20, featured:false, tags:[], createdAt:new Date().toISOString() },
      { id:'5', name:'Royale Structured Tote',   price:1656000, originalPrice:null, discountPercent:0, category:'Tote Bags',      description:'The ultimate power tote. Rigid frame, top handles, and a secure magnetic closure.', images:[], colors:['#0a0a0a','#1e1e2e','#d4af37'], stock:10, featured:false, tags:[], createdAt:new Date().toISOString() },
      { id:'6', name:'Plum Satin Evening Bag',   price:788000,  originalPrice:null, discountPercent:0, category:'Feminine Bags',  description:'A dreamy satin evening bag in deep plum with a jewelled top handle and chain strap.', images:[], colors:['#4a1942','#7c3aed','#f5f5f5'], stock:7,  featured:false, tags:['evening'], createdAt:new Date().toISOString() },
    ]
    fs.writeFileSync(PRODUCTS, JSON.stringify(seed, null, 2))
    return seed
  }
  return JSON.parse(fs.readFileSync(PRODUCTS, 'utf-8'))
}
function writeProducts(d) { ensureDir(); fs.writeFileSync(PRODUCTS, JSON.stringify(d, null, 2)) }

function readOrders() {
  ensureDir()
  if (!fs.existsSync(ORDERS)) { fs.writeFileSync(ORDERS, '[]'); return [] }
  return JSON.parse(fs.readFileSync(ORDERS, 'utf-8'))
}
function writeOrders(d) { ensureDir(); fs.writeFileSync(ORDERS, JSON.stringify(d, null, 2)) }

function readSettings() {
  ensureDir()
  if (!fs.existsSync(SETTINGS)) {
    const def = { deliveryFee:15000, freeDeliveryThreshold:500000, mobileMoneyNumber:'', storeName:'Blush & Boujee Atelier' }
    fs.writeFileSync(SETTINGS, JSON.stringify(def, null, 2))
    return def
  }
  return JSON.parse(fs.readFileSync(SETTINGS, 'utf-8'))
}
function writeSettings(d) { ensureDir(); fs.writeFileSync(SETTINGS, JSON.stringify(d, null, 2)) }

module.exports = { readProducts, writeProducts, readOrders, writeOrders, readSettings, writeSettings }
