const { Pool } = require('pg')

const pool = new Pool({
  connectionString:
    'postgresql://postgres:MOWU_RDS_DATABASE@database-1.cvq4iy62m8vx.eu-north-1.rds.amazonaws.com:5432/postgres',
  connectionTimeoutMillis: 10000,
  ssl: {
    rejectUnauthorized: false,
  },
})

async function testConnection() {
  try {
    console.log('Attempting to connect to AWS RDS...')
    console.log('Host: database-1.cvq4iy62m8vx.eu-north-1.rds.amazonaws.com')
    console.log('Port: 5432')
    console.log('Database: postgres')
    console.log('User: postgres')
    console.log('')

    const client = await pool.connect()
    console.log('✓ Successfully connected to AWS RDS!')

    const result = await client.query('SELECT version()')
    console.log('\nDatabase version:')
    console.log(result.rows[0].version)

    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `)

    console.log('\nExisting tables in database:')
    if (tablesResult.rows.length === 0) {
      console.log('  (none - database is empty)')
    } else {
      tablesResult.rows.forEach((row) => console.log(`  - ${row.table_name}`))
    }

    client.release()
  } catch (error) {
    console.error('\n✗ Connection failed!')
    console.error('\nError details:', error.message)
    console.error('\nPossible causes:')
    console.error('1. Security Group is not allowing incoming connections on port 5432')
    console.error('2. RDS instance is not publicly accessible')
    console.error('3. Network ACLs or firewall blocking the connection')
    console.error('4. Incorrect credentials')
    console.error('\nTo fix this:')
    console.error('- Go to AWS RDS Console → Your DB Instance → Security')
    console.error('- Edit the Security Group to allow inbound traffic on port 5432')
    console.error('- Source: Your IP address or 0.0.0.0/0 (for testing only)')
  } finally {
    await pool.end()
  }
}

testConnection()
