const fs = require('fs'), path = require('path')
console.log('\n🌸  Blush & Boujee Atelier — Setup\n')
;['data','public/uploads','public/images'].forEach(d => {
  const p = path.join(process.cwd(), d)
  if (!fs.existsSync(p)) { fs.mkdirSync(p, { recursive:true }); console.log('✅ Created', d) }
})
const envPath = path.join(process.cwd(), '.env.local')
if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, 'JWT_SECRET=blush-boujee-change-this-secret\nADMIN_USERNAME=admin\nADMIN_PASSWORD=BlushBoujee@2025\nNEXT_PUBLIC_SITE_URL=http://localhost:3000\n')
  console.log('✅ Created .env.local')
}
console.log('\n🚀  Done!')
console.log('   Run: npm run dev')
console.log('   Store: http://localhost:3000')
console.log('   Admin: http://localhost:3000/admin  (admin / BlushBoujee@2025)\n')
