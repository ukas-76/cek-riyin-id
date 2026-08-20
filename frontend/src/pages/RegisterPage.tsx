import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
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

    if (password.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }

    setSubmitting(true);
    try {
      await register(email.trim(), password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Registrasi gagal.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col md:flex-row antialiased">
      {/* Left Pane: Branding / Hero Graphic */}
      <div className="hidden md:flex flex-1 relative bg-surface-container overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px]"></div>
        <div className="relative z-10 flex flex-col justify-between p-section_gap h-full w-full text-on-primary">
          <Link to="/" className="flex items-center gap-3 text-white tracking-tight group">
            <img src="/logo.jpg" alt="Cekriyin.id Logo" className="h-12 w-auto object-contain rounded-xl shadow-lg group-hover:scale-105 transition-transform" />
            <span className="font-display text-[26px] font-extrabold bg-gradient-to-r from-emerald-300 via-emerald-200 to-amber-300 bg-clip-text text-transparent">
              Cekriyin.id
            </span>
          </Link>
          <div className="max-w-md bg-black/40 p-6 rounded-xl backdrop-blur-md">
            <h2 className="font-headline-lg text-[28px] font-bold text-white mb-component_gap">
              Verifikasi informasi dengan percaya diri.
            </h2>
            <p className="font-body-md text-body-lg text-white/90">
              Bergabunglah dengan platform yang mengutamakan kejelasan, keamanan, dan utilitas praktis untuk kebutuhan digital Anda.
            </p>
          </div>
        </div>
      </div>

      {/* Right Pane: Registration Form */}
      <div className="flex-1 flex items-center justify-center p-page_margin relative w-full max-w-md mx-auto md:max-w-none">
        <div className="w-full max-w-[400px]">
          {/* Header */}
          <div className="mb-8">
            <Link to="/" className="flex items-center gap-2 mb-6 md:hidden group">
              <img src="/logo.jpg" alt="Cekriyin.id Logo" className="h-10 w-auto object-contain rounded-lg shadow-sm" />
              <span className="font-display text-[22px] font-extrabold bg-gradient-to-r from-emerald-700 via-emerald-600 to-amber-600 bg-clip-text text-transparent">
                Cekriyin.id
              </span>
            </Link>
            <h1 className="font-headline-lg text-headline-lg text-on-surface mb-base font-bold">
              Buat akun Cekriyin
            </h1>
            <p className="font-body-md text-body-md text-secondary">
              Masukkan detail Anda untuk memulai perjalanan verifikasi.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-error-container/30 border-l-4 border-error text-on-error-container font-body-md text-[14px] rounded-r">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email Field */}
            <div className="flex flex-col gap-base">
              <label className="font-label-md text-label-md text-on-surface" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@contoh.com"
                disabled={submitting}
                className="h-[44px] px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded font-body-md text-body-md text-on-surface placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-base">
              <label className="font-label-md text-label-md text-on-surface" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                disabled={submitting}
                className="h-[44px] px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded font-body-md text-body-md text-on-surface placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="mt-4 h-[44px] w-full bg-primary text-on-primary rounded font-label-md text-label-md font-bold flex items-center justify-center hover:opacity-90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin mr-2">progress_activity</span>
                  Memproses...
                </>
              ) : (
                'Daftar'
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-8 text-center">
            <p className="font-body-md text-body-md text-on-surface-variant">
              Sudah punya akun?{' '}
              <Link to="/masuk" className="font-label-md text-label-md font-bold text-primary hover:underline">
                Masuk
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
