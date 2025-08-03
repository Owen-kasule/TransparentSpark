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

async function checkPersistence() {
  console.log('🧪 Checking database persistence for comments and replies...\n');

  // Step 1: Insert a comment
  const { data: comment, error: commentError } = await supabase
    .from('blog_comments')
    .insert([{
      blog_post_id: 'test-persist-post',
      author_name: 'Persistence Tester',
      author_email: 'persist@example.com',
      content: 'This is a persistence test comment.',
      status: 'approved'
    }])
    .select()
    .single();

  if (commentError) {
    console.error('❌ Failed to insert comment:', commentError.message);
    return;
  }
  console.log('✅ Inserted comment:', comment.id);

  // Step 2: Insert a reply
  const { data: reply, error: replyError } = await supabase
    .from('comment_replies')
    .insert([{
      comment_id: comment.id,
      author_name: 'Reply Tester',
      author_email: 'reply@example.com',
      content: 'This is a persistence test reply.',
      status: 'approved'
    }])
    .select()
    .single();

  if (replyError) {
    console.error('❌ Failed to insert reply:', replyError.message);
    return;
  }
  console.log('✅ Inserted reply:', reply.id);

  // Step 3: Read back all comments for the test post
  const { data: comments, error: readCommentsError } = await supabase
    .from('blog_comments')
    .select('*')
    .eq('blog_post_id', 'test-persist-post');

  if (readCommentsError) {
    console.error('❌ Failed to read comments:', readCommentsError.message);
    return;
  }
  console.log('\n📋 All comments for test-persist-post:');
  console.log(comments);

  // Step 4: Read back all replies for the inserted comment
  const { data: replies, error: readRepliesError } = await supabase
    .from('comment_replies')
    .select('*')
    .eq('comment_id', comment.id);

  if (readRepliesError) {
    console.error('❌ Failed to read replies:', readRepliesError.message);
    return;
  }
  console.log('\n📋 All replies for comment', comment.id, ':');
  console.log(replies);

  // Note: We do NOT clean up, so you can check in the dashboard as well
  console.log('\n✅ Persistence test complete. Data remains in the database for manual inspection.');
}

checkPersistence().catch(console.error); 