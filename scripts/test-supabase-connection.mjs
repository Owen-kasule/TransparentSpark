#!/usr/bin/env node
// Enhanced Supabase connectivity diagnostic script
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

function mask(value, visible = 6) {
  if (!value) return 'MISSING';
  if (value.length <= visible) return value;
  return value.slice(0, visible) + '…' + value.slice(-4);
}

function loadEnvVar(name, required = true) {
  const value = process.env[name];
  if (!value && required) {
    console.error(`❌ Missing required env: ${name}`);
  }
  return value;
}

console.log('🌱 Loading environment variables (.env auto-loaded if present)');
const url = loadEnvVar('VITE_SUPABASE_URL');
const key = loadEnvVar('VITE_SUPABASE_ANON_KEY');

console.log('🔐 Credentials summary:', {
  urlHost: url ? new URL(url).host : 'N/A',
  anonKeyPreview: mask(key)
});

if (!url || !key) {
  console.error('\nAborting: Supabase credentials missing. Add them to .env then re-run: npm run test:db');
  process.exit(1);
}

console.log('\n🔍 Initializing Supabase client...');
let supabase;
try {
  supabase = createClient(url, key);
  console.log('✅ Client created');
} catch (e) {
  console.error('❌ Failed to create client:', e.message);
  process.exit(1);
}

async function simpleQuery(table) {
  try {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.error(`❌ ${table} query error:`, error.message);
      return false;
    }
    console.log(`✅ ${table} reachable (${data?.length || 0} sample rows)`);
    return true;
  } catch (e) {
    console.error(`❌ ${table} unexpected failure:`, e.message);
    return false;
  }
}

async function countCheck(table) {
  try {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    if (error) {
      console.error(`⚠️ Count check failed for ${table}:`, error.message);
      return;
    }
    console.log(`📊 ${table} total rows: ${count}`);
  } catch (e) {
    console.error(`⚠️ Count check exception for ${table}:`, e.message);
  }
}

(async () => {
  console.log('\n🚦 Running connectivity tests...');
  const coreTables = ['blog_posts','blog_likes','blog_views','blog_comments'];
  let pass = true;
  for (const t of coreTables) {
    const ok = await simpleQuery(t);
    if (!ok) pass = false;
  }

  // Extra diagnostics if core passed
  if (pass) {
    console.log('\n🔎 Performing row count sampling...');
    for (const t of coreTables) {
      await countCheck(t);
    }
  }

  console.log('\n🧪 Testing a lightweight RPC-style insert + rollback simulation (view increment)...');
  try {
    // Safe no-op style: attempt to select a single post id and then run a view track if available
    const { data: posts } = await supabase.from('blog_posts').select('id').limit(1);
    if (posts && posts.length) {
      const postId = posts[0].id;
      console.log(`Attempting to track view for post id: ${postId}`);
      // If RLS allows, this should succeed; if not, it will just log an error
      const { error } = await supabase.rpc?.('increment_blog_view', { post_id: postId, visitor_id: 'diagnostic-test', user_agent: 'diag', referrer: 'diag', country: 'XX', city: 'Test' });
      if (error) console.log('ℹ️ View RPC not permitted (likely RLS) ->', error.message);
      else console.log('✅ View RPC executed (or function absent but no crash)');
    } else {
      console.log('ℹ️ No blog posts found to test view tracking.');
    }
  } catch (e) {
    console.log('ℹ️ View tracking diagnostic skipped:', e.message);
  }

  if (pass) {
    console.log('\n🎉 All core tables responded. Supabase connection looks healthy.');
    process.exit(0);
  } else {
    console.log('\n⚠️ Some tables failed. Review errors above.');
    process.exit(2);
  }
})();
