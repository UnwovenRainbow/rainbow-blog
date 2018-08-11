const { Pool } = require('pg')
const credentials = require('./credentials.json')

const pool = new Pool(credentials)

// the pool with emit an error on behalf of any idle clients
// it contains if a backend error or network partition happens
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})

module.exports = {
  query: (text, params) => pool.query(text, params)
}