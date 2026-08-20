import React, { useState } from 'react';

interface DownloadAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadAppModal: React.FC<DownloadAppModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.trim()) {
      setError('Masukkan email Anda untuk menerima notifikasi rilis.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Masukkan alamat email yang valid.');
      return;
    }

    setError(null);
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setEmail('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface-container-lowest border border-outline-variant w-full max-w-[500px] rounded-[24px] shadow-2xl overflow-hidden relative flex flex-col">
        {/* Header decoration bar */}
        <div className="bg-gradient-to-r from-primary to-primary-container h-3 w-full" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleReset}
          className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant transition-colors"
          aria-label="Tutup modal"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        <div className="p-6 md:p-8 flex flex-col items-center text-center">
          {/* Mobile Badge Icon */}
          <div className="w-16 h-16 rounded-2xl bg-primary-container/20 border border-primary/30 flex items-center justify-center mb-5 text-primary shadow-inner">
            <span className="material-symbols-outlined text-[36px]">smartphone</span>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/50 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Dalam Tahap Pengujian Akhir
          </span>

          <h3 className="font-display text-[22px] md:text-[26px] font-bold text-on-surface mb-2 leading-tight">
            Aplikasi Mobile Cekriyin <br className="hidden sm:inline" /> Segera Hadir!
          </h3>

          <p className="font-body-md text-secondary text-[14px] md:text-[15px] mb-6 leading-relaxed">
            Dapatkan proteksi otomatis secara real-time terhadap penipuan SMS, telepon tidak dikenal, dan link phishing langsung di smartphone Android & iOS Anda.
          </p>

          {/* OS Platform Status Badges */}
          <div className="grid grid-cols-2 gap-3 w-full mb-6">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-surface border border-outline-variant/80 text-left">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                <span className="material-symbols-outlined text-[22px]">android</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[13px] font-semibold text-on-surface truncate">Android APK</span>
                <span className="text-[11px] text-secondary">Rilis Q3 2026</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-surface border border-outline-variant/80 text-left">
              <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold shrink-0">
                <span className="material-symbols-outlined text-[22px]">phone_iphone</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[13px] font-semibold text-on-surface truncate">iOS App Store</span>
                <span className="text-[11px] text-secondary">Segera Menyusul</span>
              </div>
            </div>
          </div>

          {/* Form / Success Notification */}
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
              <div className="flex flex-col text-left">
                <label htmlFor="early-access-email" className="text-xs font-semibold text-secondary mb-1">
                  Dapatkan Notifikasi Rilis Perdana:
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-secondary text-[20px]">mail</span>
                  <input
                    id="early-access-email"
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(null);
                    }}
                    className="w-full pl-10 pr-4 py-2.5 text-[14px] bg-surface-container-high border border-outline-variant rounded-xl text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                {error && <span className="text-error text-xs mt-1">{error}</span>}
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-primary text-on-primary font-semibold text-[14px] rounded-xl hover:opacity-95 transition-all shadow-md hover:shadow-lg active:scale-[0.99] flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
                Ingatkan Saya Saat APK Rilis
              </button>
            </form>
          ) : (
            <div className="w-full p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700/60 text-center animate-fade-in">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300 flex items-center justify-center mx-auto mb-2">
                <span className="material-symbols-outlined text-[24px]">mark_email_read</span>
              </div>
              <h4 className="font-semibold text-emerald-900 dark:text-emerald-200 text-[15px] mb-1">
                Terima Kasih!
              </h4>
              <p className="text-xs text-emerald-800 dark:text-emerald-300 mb-3">
                Kami akan mengirimkan link download APK perdana langsung ke <strong>{email}</strong> begitu aplikasi dipublikasikan.
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
              >
                Tutup Jendela
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DownloadAppModal;
