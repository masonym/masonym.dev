'use client';

import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { Mail, Loader2, CheckCircle, LogOut } from 'lucide-react';

export function LoginForm() {
  const { user, loading, signInWithEmail, signOut } = useAuth();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setSending(true);
    setError('');
    
    const { error: signInError } = await signInWithEmail(email);
    
    if (signInError) {
      setError(signInError.message);
    } else {
      setSent(true);
    }
    setSending(false);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-5 h-5 animate-spin text-[var(--primary-dim)]" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <span className="text-[var(--primary-dim)]">{user.email}</span>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-1 px-2 py-1 rounded bg-[var(--background)] text-[var(--primary-dim)] hover:text-[var(--primary)] transition"
        >
          <LogOut className="w-3 h-3" />
          Sign out
        </button>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4">
        <div className="flex items-center gap-2 text-green-400">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Check your email!</span>
        </div>
        <p className="text-green-400/70 text-sm mt-1">
          We sent a magic link to <strong>{email}</strong>. Click the link to sign in.
        </p>
        <button
          onClick={() => { setSent(false); setEmail(''); }}
          className="text-xs text-green-400/50 hover:text-green-400 mt-2"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[var(--background-bright)] rounded-lg p-4 border border-[var(--primary-dim)]">
      <div className="flex items-center gap-2 mb-3">
        <Mail className="w-5 h-5 text-[var(--secondary)]" />
        <h3 className="text-[var(--primary-bright)]">Sign in to track expeditions</h3>
      </div>
      <p className="text-[var(--primary-dim)] text-sm mb-4">
        Enter your email to receive a magic link. No password needed!
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full p-2 rounded bg-[var(--background)] border border-[var(--primary-dim)] text-[var(--primary)] placeholder:text-[var(--primary-dim)]"
          disabled={sending}
        />
        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}
        <button
          type="submit"
          disabled={sending || !email.trim()}
          className="w-full py-2 rounded bg-[var(--secondary)] text-[var(--background)] font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 transition"
        >
          {sending ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Sending...
            </span>
          ) : (
            'Send Magic Link'
          )}
        </button>
      </form>
    </div>
  );
}

export function LoginPrompt({ message }) {
  return (
    <div className="text-center py-8">
      <Mail className="w-12 h-12 text-[var(--primary-dim)] mx-auto mb-4" />
      <p className="text-[var(--primary-dim)] mb-4">{message || 'Sign in to continue'}</p>
      <LoginForm />
    </div>
  );
}
