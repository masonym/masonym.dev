'use client';

import { useState } from 'react';
import { Mail, Loader2, CheckCircle, LogOut } from 'lucide-react';
import { useAuth } from './AuthProvider';

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
    const { error: signInError } = await signInWithEmail(email.trim());
    if (signInError) setError(signInError.message);
    else setSent(true);
    setSending(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-5 h-5 animate-spin text-primary-dim" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <span className="text-primary-dim truncate max-w-[220px]">{user.email}</span>
        <button
          onClick={signOut}
          className="flex items-center gap-1 px-2 py-1 rounded bg-background text-primary-dim hover:text-primary transition"
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
          <span className="font-medium">Check your email</span>
        </div>
        <p className="text-green-400/70 text-sm mt-1">
          Magic link sent to <strong>{email}</strong>.
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
    <div className="bg-background-bright rounded-lg p-4 border border-primary-dim max-w-md">
      <div className="flex items-center gap-2 mb-3">
        <Mail className="w-5 h-5 text-secondary" />
        <h3 className="text-primary-bright">Sign in to log burning</h3>
      </div>
      <p className="text-primary-dim text-sm mb-4">
        Enter your email for a magic link. No password needed. Anyone can read a
        group they belong to, but only signed-in members can log.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full p-2 rounded bg-background border border-primary-dim text-primary placeholder:text-primary-dim"
          disabled={sending}
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={sending || !email.trim()}
          className="w-full py-2 rounded bg-secondary text-background font-bold disabled:opacity-50 hover:brightness-110 transition"
        >
          {sending ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Sending...
            </span>
          ) : 'Send Magic Link'}
        </button>
      </form>
    </div>
  );
}
