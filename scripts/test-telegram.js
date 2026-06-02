/**
 * Test Telegram notification
 * Run: node scripts/test-telegram.js
 */

require('dotenv').config({ path: '.env.local' })
const { sendOrderNotification } = require('../lib/telegram')

const testOrder = {
  id: 'BB-TEST001',
  customer: {
    firstName: 'Amara',
    lastName:  'Nakato',
    email:     'amara@example.com',
    phone:     '+256 700 123 456',
    address:   '14 Kampala Road',
    city:      'Kampala',
    state:     'Central',
    country:   'Uganda',
    notes:     'Please call before delivery.',
  },
  items: [
    { name: 'Noir Quilted Crossbody', qty: 1, price: 897000 },
    { name: 'Velvet Femme Clutch',    qty: 2, price: 644000 },
  ],
  subtotal:      2185000,
  shipping:      0,
  total:         2185000,
  paymentMethod: 'cod',
  createdAt:     new Date().toISOString(),
}

console.log('Sending test Telegram notification...\n')

sendOrderNotification(testOrder).then(result => {
  if (result.sent) {
    console.log('✅ Success! Check your Telegram.')
  } else {
    console.log('❌ Not sent:', result.reason, result.detail || '')
    if (result.reason === 'missing_config') {
      console.log('\nMake sure TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID are set in .env.local')
    }
    if (result.reason === 'duplicate') {
      console.log('\nThis test order ID was already sent. Delete data/.telegram_sent.json to reset.')
    }
  }
}).catch(e => {
  console.error('Unexpected error:', e.message)
})
