const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv').config();

const supabase = createClient(
  process.env.PROJECT_URL,
  process.env.KEY
);

module.exports = supabase;