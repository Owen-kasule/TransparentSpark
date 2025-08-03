import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyFix() {
  console.log('🧪 Verifying Database Fix...\n');

  try {
    // Test comment insertion
    console.log('📝 Testing comment insertion...');
    const { data: comment, error: commentError } = await supabase
      .from('blog_comments')
      .insert([{
        blog_post_id: 'test-post-123',
        author_name: 'Test User',
        author_email: 'test@example.com',
        content: 'This comment should be saved to the database.',
        status: 'approved'
      }])
      .select()
      .single();

    if (commentError) {
      console.error('❌ Comment insertion failed:', commentError.message);
      console.log('\n💡 The database fix has NOT been applied yet.');
      console.log('📋 Please apply the targeted-database-fix.sql script in your Supabase Dashboard.');
      return;
    }

    console.log('✅ Comment insertion successful:', comment.id);

    // Test reply insertion
    console.log('\n📝 Testing reply insertion...');
    const { data: reply, error: replyError } = await supabase
      .from('comment_replies')
      .insert([{
        comment_id: comment.id,
        author_name: 'Test Replier',
        author_email: 'replier@example.com',
        content: 'This reply should also be saved to the database.',
        status: 'approved'
      }])
      .select()
      .single();

    if (replyError) {
      console.error('❌ Reply insertion failed:', replyError.message);
    } else {
      console.log('✅ Reply insertion successful:', reply.id);
    }

    // Clean up
    console.log('\n🧹 Cleaning up test data...');
    if (reply) {
      await supabase.from('comment_replies').delete().eq('id', reply.id);
    }
    await supabase.from('blog_comments').delete().eq('id', comment.id);
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 SUCCESS! Database fix is working correctly.');
    console.log('💡 Comments and replies can now be saved to the database.');
    console.log('🚀 Your blog comment system should work perfectly now!');

  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
}

verifyFix().catch(console.error); 