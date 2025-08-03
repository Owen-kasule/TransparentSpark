import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const supabaseUrl = 'https://qvomiouwgrdrlgtddykr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2b21pb3V3Z3JkcmxndGRkeWtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwMjU1MjksImV4cCI6MjA2NjYwMTUyOX0.rFZcC9tWYPQEEkLSQEfPhiPgXi6l0xjWDoAhgvmSP5U';

// Note: For running migrations, you'll need the service role key, not the anon key
// The anon key has limited permissions and cannot create tables or run DDL
const supabaseServiceKey = 'YOUR_SERVICE_ROLE_KEY'; // You'll need to get this from Supabase dashboard

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigrations() {
  console.log('🚀 Running Supabase migrations...');
  
  try {
    // Read the migration file
    const migrationPath = join(process.cwd(), 'supabase', 'migrations', '20250628102306_frosty_temple.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');
    
    console.log('📄 Migration file loaded, executing SQL...');
    
    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });
    
    if (error) {
      console.error('❌ Migration failed:', error);
    } else {
      console.log('✅ Migration completed successfully!');
      console.log('📊 Result:', data);
    }
    
  } catch (err) {
    console.error('❌ Error running migration:', err);
  }
}

runMigrations();
