import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'husband' | 'wife'>('husband');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [inviteFamilyId, setInviteFamilyId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const invite = params.get('invite');
    if (invite) {
      setInviteFamilyId(invite);
      setIsSignUp(true);
      setRole('wife'); // Second user joining via invite
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    let err: string | null;
    if (isSignUp) {
      err = await signUp(email, password, role, inviteFamilyId ?? undefined);
    } else {
      err = await signIn(email, password);
    }

    if (err) setError(err);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-dark-text mb-2">
            Family<span className="text-blue-400">Sync</span>
          </h1>
          <p className="text-dark-muted text-sm">Family finance, together</p>
        </div>

        {inviteFamilyId && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 mb-4">
            <p className="text-sm text-blue-400 text-center">
              You've been invited to join a family. Create your account below.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-dark-muted mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-dark-surface border border-dark-border rounded-lg px-4 py-3 text-dark-text focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-dark-muted mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-dark-surface border border-dark-border rounded-lg px-4 py-3 text-dark-text focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••"
            />
          </div>

          {isSignUp && (
            <div>
              <label className="block text-xs font-medium text-dark-muted mb-1">I am the</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRole('husband')}
                  className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${
                    role === 'husband'
                      ? 'bg-blue-600 text-white'
                      : 'bg-dark-surface text-dark-muted border border-dark-border'
                  }`}
                >
                  👨 Husband
                </button>
                <button
                  type="button"
                  onClick={() => setRole('wife')}
                  className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${
                    role === 'wife'
                      ? 'bg-pink-600 text-white'
                      : 'bg-dark-surface text-dark-muted border border-dark-border'
                  }`}
                >
                  👩 Wife
                </button>
              </div>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <button
          onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
          className="w-full mt-4 text-center text-sm text-dark-muted hover:text-dark-text"
        >
          {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
        </button>
      </div>
    </div>
  );
}
