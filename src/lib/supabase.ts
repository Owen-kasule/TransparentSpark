import { createClient } from '@supabase/supabase-js';

// Get environment variables with detailed logging
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug logging to see what's happening during initialization
console.log('🔍 Supabase Environment Check:', {
  url: supabaseUrl,
  hasKey: !!supabaseAnonKey,
  keyLength: supabaseAnonKey?.length,
  envMode: import.meta.env.MODE,
  isDev: import.meta.env.DEV
});

// Validate environment variables
if (!supabaseUrl) {
  console.error('❌ VITE_SUPABASE_URL is missing from environment variables');
  throw new Error('Missing VITE_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  console.error('❌ VITE_SUPABASE_ANON_KEY is missing from environment variables');
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable');
}

// Create Supabase client with error handling
let supabase: any;

try {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  });
  
  console.log('✅ Supabase client created successfully:', {
    url: supabase.supabaseUrl,
    hasAuth: !!supabase.auth,
    clientCreated: true
  });
  
  // Make available globally for debugging
  if (typeof window !== 'undefined') {
    (window as any).supabase = supabase;
  }
  
} catch (error) {
  console.error('❌ Failed to create Supabase client:', error);
  throw new Error(`Failed to initialize Supabase: ${error}`);
}

export { supabase };

// Database types
export interface Review {
  id: string;
  name: string;
  email: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface Analytics {
  id: string;
  page: string;
  visitor_id: string;
  user_agent: string;
  referrer: string;
  country: string;
  city: string;
  created_at: string;
}

export interface AdminUser {
  id: string;
  github_id: string;
  username: string;
  avatar_url: string;
  email: string;
  created_at: string;
}

// GitHub OAuth configuration
export const githubOAuthConfig = {
  redirectTo: `${window.location.origin}/admin`,
  scopes: 'read:user user:email'
};

// Enhanced GitHub user data fetching with multiple fallback strategies
export const getGitHubUserData = async (accessToken?: string) => {
  console.log('🐙 Starting GitHub user data fetch...');

  try {
    // Strategy 1: Use provided access token
    if (accessToken) {
      console.log('📋 Using provided access token');
      return await fetchGitHubUserWithToken(accessToken);
    }

    // Strategy 2: Get token from current session
    console.log('📋 Getting token from current session...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      throw new Error(`Session error: ${sessionError.message}`);
    }

    if (!session?.provider_token) {
      throw new Error('No provider token found in session');
    }

    console.log('✅ Found provider token in session');
    return await fetchGitHubUserWithToken(session.provider_token);
  } catch (error) {
    console.error('❌ GitHub user data fetch failed:', error);

    // Strategy 3: Fallback to user metadata if available
    try {
      console.log('🔄 Attempting fallback to user metadata...');
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user?.user_metadata) {
        console.log('📋 Using user metadata as fallback');
        return {
          id: user.user_metadata.provider_id || user.user_metadata.sub,
          login: user.user_metadata.user_name || user.user_metadata.preferred_username,
          avatar_url: user.user_metadata.avatar_url,
          email: user.email || user.user_metadata.email,
          name: user.user_metadata.full_name || user.user_metadata.name
        };
      }
    } catch (fallbackError) {
      console.error('❌ Fallback strategy failed:', fallbackError);
    }

    throw error;
  }
};

// Fetch GitHub user data with token
const fetchGitHubUserWithToken = async (token: string) => {
  console.log('🌐 Fetching GitHub user data with token...');

  const response = await fetch('https://api.github.com/user', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Owen-Portfolio-App'
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ GitHub API error:', response.status, errorText);

    if (response.status === 401) {
      throw new Error('GitHub token is invalid or expired');
    } else if (response.status === 403) {
      throw new Error('GitHub API rate limit exceeded');
    } else {
      throw new Error(`GitHub API error: ${response.status} ${errorText}`);
    }
  }

  const userData = await response.json();
  console.log('✅ GitHub user data fetched successfully:', userData.login);

  return userData;
};

// Helper function to check if user is authorized admin
export const checkAdminAuthorization = async (githubId: string): Promise<AdminUser | null> => {
  console.log('🔍 Checking admin authorization for GitHub ID:', githubId);

  try {
    const { data: adminUser, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('github_id', githubId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('❌ User not found in admin_users table');
        return null;
      }
      throw error;
    }

    console.log('✅ Admin authorization confirmed for:', adminUser.username);
    return adminUser;
  } catch (error) {
    console.error('❌ Error checking admin authorization:', error);
    return null;
  }
};

// Helper function to create or update admin user
export const upsertAdminUser = async (githubUserData: any): Promise<AdminUser | null> => {
  try {
    const adminUserData = {
      github_id: githubUserData.id.toString(),
      username: githubUserData.login,
      avatar_url: githubUserData.avatar_url,
      email: githubUserData.email || `${githubUserData.login}@github.local`
    };

    const { data: adminUser, error } = await supabase
      .from('admin_users')
      .upsert(adminUserData, { 
        onConflict: 'github_id',
        ignoreDuplicates: false 
      })
      .select()
      .single();

    if (error) {
      console.error('Error upserting admin user:', error);
      return null;
    }

    return adminUser;
  } catch (error) {
    console.error('Error in admin user upsert:', error);
    return null;
  }
};