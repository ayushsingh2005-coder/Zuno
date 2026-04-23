require('dotenv').config()
const r = require('./config/redis')

r.keys('cache:*').then(keys => {
  console.log('Found keys:', keys)
  return Promise.all(keys.map(k => r.del(k)))
}).then(() => {
  console.log('All cache cleared ✅')
  process.exit()
})