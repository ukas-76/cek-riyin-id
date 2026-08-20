import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !email.trim()) {
      setError('Email wajib diisi.');
      return;
    }

    if (!password || !password.trim()) {
      setError('Password wajib diisi.');
      return;
    }

    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login gagal.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col items-center justify-center p-page_margin antialiased">
      <main className="w-full max-w-[420px]">
        {/* Header Section */}
        <div className="text-center mb-8 flex flex-col items-center">
          <Link to="/" className="flex flex-col items-center group mb-2">
            <img src="/logo.jpg" alt="Cekriyin.id Logo" className="h-16 w-auto object-contain rounded-xl shadow-md mb-2 group-hover:scale-105 transition-transform" />
            <span className="font-display text-[28px] font-extrabold bg-gradient-to-r from-emerald-700 via-emerald-600 to-amber-600 bg-clip-text text-transparent tracking-tight">
              Cekriyin.id
            </span>
          </Link>
          <p className="font-body-lg text-body-lg text-on-surface-variant">Masuk ke Cekriyin</p>
        </div>

        {/* Form Card */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>

          {error && (
            <div className="mb-6 p-3 bg-error-container/30 border-l-4 border-error text-on-error-container font-body-md text-[14px] rounded-r">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-2" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                disabled={submitting}
                className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface placeholder:text-secondary focus:ring-2 focus:ring-primary focus:border-primary transition-shadow outline-none"
              />
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block font-label-md text-label-md text-on-surface" htmlFor="password">
                  Password
                </label>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={submitting}
                className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface placeholder:text-secondary focus:ring-2 focus:ring-primary focus:border-primary transition-shadow outline-none"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary hover:opacity-90 text-on-primary font-label-md text-label-md py-3 px-4 rounded-lg transition-all flex justify-center items-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                    Memproses...
                  </>
                ) : (
                  <>
                    <span>Masuk</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer Links */}
          <div className="mt-8 text-center pt-6 border-t border-outline-variant">
            <p className="font-body-md text-body-md text-on-surface-variant">
              Belum punya akun?{' '}
              <Link to="/daftar" className="text-primary font-bold hover:underline underline-offset-4">
                Daftar
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
