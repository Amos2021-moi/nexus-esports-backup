const { Client } = require('pg')

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'nexus-esports',
  user: 'postgres',
  password: 'postgres',
})

async function run() {
  try {
    await client.connect()
    console.log('✅ Connected to database')
    
    await client.query(`
      ALTER TABLE "Maintenance" 
      ADD COLUMN IF NOT EXISTS "endTime" TIMESTAMP(3)
    `)
    console.log('✅ Added "endTime" column to Maintenance table')
    
    await client.end()
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

run()