const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:Guidewire@4567@db.dhshsndofflzamcqwmdx.supabase.co:5432/postgres'
});

async function check() {
  await client.connect();
  const res = await client.query(`
    SELECT column_name, data_type, character_maximum_length 
    FROM information_schema.columns 
    WHERE table_name = 'users';
  `);
  console.table(res.rows);
  await client.end();
}

check().catch(console.error);
