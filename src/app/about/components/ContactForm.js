'use client';

import { useMemo, useState } from 'react';

const isValidEmail = (value) => {
  if (typeof value !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

const ContactForm = () => {
  const startedAt = useMemo(() => Date.now(), []);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const [website, setWebsite] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();

    setErrorMessage('');

    if (!isValidEmail(email)) {
      setStatus('error');
      setErrorMessage('Please enter a valid email.');
      return;
    }

    if (!message || message.trim().length < 10) {
      setStatus('error');
      setErrorMessage('Please enter a message (at least 10 characters).');
      return;
    }

    setIsSubmitting(true);
    setStatus('sending');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          message,
          website,
          startedAt,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || 'Failed to send message.');
      }

      setStatus('success');
      setName('');
      setEmail('');
      setMessage('');
      setWebsite('');
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Failed to send message.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="w-full max-w-xl mt-6">
      <div className="mb-4 text-left">
        <label className="block text-sm mb-1" htmlFor="contact-name">
          Name (optional)
        </label>
        <input
          id="contact-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md px-3 py-2 bg-[var(--background-bright)] text-[var(--primary)] border border-[var(--primary-dim)]"
          autoComplete="name"
          maxLength={100}
        />
      </div>

      <div className="mb-4 text-left">
        <label className="block text-sm mb-1" htmlFor="contact-email">
          Your Email
        </label>
        <input
          id="contact-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md px-3 py-2 bg-[var(--background-bright)] text-[var(--primary)] border border-[var(--primary-dim)]"
          autoComplete="email"
          required
          maxLength={320}
        />
      </div>

      <div className="mb-4 text-left">
        <label className="block text-sm mb-1" htmlFor="contact-message">
          Message
        </label>
        <textarea
          id="contact-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full min-h-[140px] rounded-md px-3 py-2 bg-[var(--background-bright)] text-[var(--primary)] border border-[var(--primary-dim)]"
          required
          maxLength={4000}
        />
      </div>

      <div className="hidden" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          type="text"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn_blue rounded-md disabled:opacity-60"
      >
        {isSubmitting ? 'Sending…' : 'Send Message'}
      </button>

      {status === 'success' ? (
        <p className="mt-3 text-green-400">Message sent. I’ll get back to you soon.</p>
      ) : null}

      {status === 'error' ? (
        <p className="mt-3 text-red-400">{errorMessage || 'Failed to send message.'}</p>
      ) : null}
    </form>
  );
};

export default ContactForm;
