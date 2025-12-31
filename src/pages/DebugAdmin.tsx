import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const DebugAdmin: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkEnvironment = async () => {
      const info: any = {
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
        supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set (length: ' + import.meta.env.VITE_SUPABASE_ANON_KEY.length + ')' : 'Not Set',
        timestamp: new Date().toISOString(),
        windowLocation: window.location.href
      };

      // Test Supabase connection
      try {
        console.log('🔍 Testing Supabase connection...');
        const { data, error } = await supabase.auth.getSession();
        info.supabaseConnection = error ? `Error: ${error.message}` : 'Connected Successfully';
        info.currentSession = data.session ? `Active session (user: ${data.session.user?.id})` : 'No active session';
        console.log('Supabase auth test result:', { data, error });
      } catch (error) {
        console.error('Supabase connection test failed:', error);
        info.supabaseConnection = `Connection failed: ${error}`;
      }

      // Test admin_users table access
      try {
        console.log('🔍 Testing admin_users table access...');
        const { data, error } = await supabase
          .from('admin_users')
          .select('github_id, username')
          .limit(5);
        
        if (error) {
          info.adminTableAccess = `Error: ${error.message}`;
          info.adminTableDetails = error;
        } else {
          info.adminTableAccess = 'Table accessible';
          info.adminUsers = data;
          info.adminUserCount = data?.length || 0;
        }
        console.log('Admin table test result:', { data, error });
      } catch (error) {
        console.error('Admin table test failed:', error);
        info.adminTableAccess = `Table access failed: ${error}`;
      }

      // Test specific user lookup
      try {
        console.log('🔍 Testing specific GitHub ID lookup...');
        const { data, error } = await supabase
          .from('admin_users')
          .select('*')
          .eq('github_id', '113998831')
          .single();
        
        if (error) {
          info.specificUserLookup = `Error: ${error.message}`;
        } else {
          info.specificUserLookup = 'User found';
          info.userDetails = data;
        }
        console.log('Specific user lookup result:', { data, error });
      } catch (error) {
        console.error('Specific user lookup failed:', error);
        info.specificUserLookup = `Lookup failed: ${error}`;
      }

      // Test GitHub OAuth configuration
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'github',
          options: {
            redirectTo: `${window.location.origin}/admin`,
            skipBrowserRedirect: true
          }
        });
        info.githubOAuthTest = error ? `Error: ${error.message}` : 'OAuth config valid';
      } catch (error) {
        info.githubOAuthTest = `OAuth test failed: ${error}`;
      }

      setDebugInfo(info);
      setIsLoading(false);
    };

    checkEnvironment();
  }, []);

  const testGitHubAuth = async () => {
    try {
      console.log('🚀 Starting GitHub OAuth test...');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/admin`,
          scopes: 'read:user user:email'
        }
      });
      
      if (error) {
        console.error('GitHub OAuth error:', error);
        alert(`GitHub OAuth error: ${error.message}`);
      } else {
        console.log('GitHub OAuth initiated successfully');
      }
    } catch (error) {
      console.error('GitHub OAuth test failed:', error);
      alert(`GitHub OAuth test failed: ${error}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-lg">🔍 Loading debug information...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-white text-3xl font-bold mb-6">🔧 Admin Debug Panel</h1>
        
        <div className="grid gap-6">
          {/* Environment Info */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <h2 className="text-white text-xl font-semibold mb-4">🌍 Environment Variables</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Supabase URL:</span>
                <span className="text-green-400">{debugInfo.supabaseUrl || 'Not Set'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Supabase Anon Key:</span>
                <span className="text-green-400">{debugInfo.supabaseAnonKey}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Current URL:</span>
                <span className="text-blue-400">{debugInfo.windowLocation}</span>
              </div>
            </div>
          </div>

          {/* Connection Status */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <h2 className="text-white text-xl font-semibold mb-4">🔌 Connection Status</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Supabase Connection:</span>
                <span className={debugInfo.supabaseConnection?.includes('Error') ? 'text-red-400' : 'text-green-400'}>
                  {debugInfo.supabaseConnection}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Current Session:</span>
                <span className="text-yellow-400">{debugInfo.currentSession}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Admin Table Access:</span>
                <span className={debugInfo.adminTableAccess?.includes('Error') ? 'text-red-400' : 'text-green-400'}>
                  {debugInfo.adminTableAccess}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">GitHub OAuth Test:</span>
                <span className={debugInfo.githubOAuthTest?.includes('Error') ? 'text-red-400' : 'text-green-400'}>
                  {debugInfo.githubOAuthTest}
                </span>
              </div>
            </div>
          </div>

          {/* Admin Users */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <h2 className="text-white text-xl font-semibold mb-4">👥 Admin Users ({debugInfo.adminUserCount || 0})</h2>
            {debugInfo.adminUsers && debugInfo.adminUsers.length > 0 ? (
              <div className="space-y-2">
                {debugInfo.adminUsers.map((user: any, index: number) => (
                  <div key={index} className="bg-slate-700/50 p-3 rounded">
                    <div className="text-green-400">@{user.username}</div>
                    <div className="text-gray-400 text-sm">GitHub ID: {user.github_id}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-red-400">⚠️ No admin users found</div>
            )}
          </div>

          {/* Your User Status */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <h2 className="text-white text-xl font-semibold mb-4">🔍 Your User Status (GitHub ID: 113998831)</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">User Lookup:</span>
                <span className={debugInfo.specificUserLookup?.includes('Error') ? 'text-red-400' : 'text-green-400'}>
                  {debugInfo.specificUserLookup}
                </span>
              </div>
              {debugInfo.userDetails && (
                <div className="mt-4 bg-green-900/20 border border-green-500/30 rounded p-4">
                  <div className="text-green-400 font-medium">✅ Admin User Found</div>
                  <div className="text-gray-300 text-sm mt-2">
                    <div>Username: {debugInfo.userDetails.username}</div>
                    <div>Email: {debugInfo.userDetails.email}</div>
                    <div>Created: {new Date(debugInfo.userDetails.created_at).toLocaleString()}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <h2 className="text-white text-xl font-semibold mb-4">🧪 Test Actions</h2>
            <div className="flex gap-4">
              <button
                onClick={testGitHubAuth}
                className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                </svg>
                Test GitHub OAuth
              </button>
              <a 
                href="/admin" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Back to Admin
              </a>
            </div>
          </div>

          {/* Raw Debug Data */}
          <details className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <summary className="text-white text-xl font-semibold mb-4 cursor-pointer">📊 Raw Debug Data (Click to expand)</summary>
            <pre className="text-green-400 text-xs overflow-x-auto bg-black/30 p-4 rounded mt-4">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    </div>
  );
};

export default DebugAdmin;