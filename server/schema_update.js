const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:Guidewire@4567@db.dhshsndofflzamcqwmdx.supabase.co:5432/postgres'
});

async function upgradeDB() {
  try {
    await client.connect();
    console.log("Connected to Supabase PostgreSQL.");

    const addCols = `
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS country varchar DEFAULT 'India',
      ADD COLUMN IF NOT EXISTS city varchar;
    `;
    await client.query(addCols);
    console.log("Added country and city columns to users table.");
    
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await client.end();
  }
}

upgradeDB();
