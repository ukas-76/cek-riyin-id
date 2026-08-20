import React, { useState } from 'react';
import ModeSelector, { CheckMode } from './ModeSelector';

interface CheckFormProps {
  onCheck: (type: CheckMode, input: string) => Promise<void>;
  isLoading: boolean;
  error?: string | null;
}

export const CheckForm: React.FC<CheckFormProps> = ({ onCheck, isLoading, error }) => {
  const [activeMode, setActiveMode] = useState<CheckMode>('number');
  const [input, setInput] = useState<string>('');
  const [localError, setLocalError] = useState<string | null>(null);

  const getPlaceholder = () => {
    switch (activeMode) {
      case 'number':
        return 'Masukkan/tempel nomor telepon (contoh: +62 812-3456-7890 atau 081234567890)...';
      case 'message':
        return 'Tempel pesan WhatsApp atau SMS mencurigakan di sini...';
      case 'link':
        return 'Tempel link/tautan yang ingin kamu cek (contoh: https://...)...';
      default:
        return 'Tempel data yang ingin kamu cek...';
    }
  };

  const handleInsertPrefix = (prefix: string) => {
    if (!input || input.trim() === '') {
      setInput(prefix);
    } else if (!input.startsWith(prefix) && !input.startsWith('+')) {
      setInput(prefix + input.replace(/^0/, ''));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!input || !input.trim()) {
      const fieldName =
        activeMode === 'number'
          ? 'nomor telepon'
          : activeMode === 'message'
          ? 'isi pesan'
          : 'link / URL';
      setLocalError(`Masukkan ${fieldName} yang ingin dicek.`);
      return;
    }

    onCheck(activeMode, input.trim());
  };

  return (
    <section className="max-w-[1200px] mx-auto w-full px-page_margin py-[50px] md:py-[80px] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Graphic Glow Accents */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-emerald-500/15 via-teal-500/10 to-amber-500/10 rounded-full blur-3xl pointer-events-none -z-0" />

      {/* Hero Badge & Heading */}
      <div className="text-center max-w-[800px] w-full mb-[36px] z-10 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-4 shadow-xs">
          <span className="material-symbols-outlined text-[18px] text-emerald-600 dark:text-emerald-400">verified</span>
          <span>Platform Proteksi Scam & Penipuan #1 Indonesia</span>
        </div>

        <h1 className="font-display text-[32px] sm:text-[44px] md:text-[52px] font-extrabold text-on-surface mb-3 tracking-tight leading-tight">
          Dapat pesan mencurigakan?
        </h1>
        <p className="font-headline-lg text-[18px] md:text-[22px] text-secondary font-medium">
          Cek dulu reputasinya sebelum percaya & bertransaksi.
        </p>
      </div>

      <ModeSelector
        activeMode={activeMode}
        onSelectMode={(mode) => {
          setActiveMode(mode);
          setLocalError(null);
        }}
      />

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[800px] relative z-10 flex flex-col gap-component_gap bg-surface-container-lowest p-[12px] md:p-[16px] rounded-2xl border border-outline-variant shadow-lg"
      >
        {activeMode === 'number' && (
          <div className="px-3 pt-1 flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant/40 pb-2.5">
            <span className="font-caption text-caption text-secondary flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-primary">public</span>
              Format Kode Negara:
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleInsertPrefix('+62 ')}
                className="font-caption text-caption px-3 py-1 rounded-lg bg-primary-container text-on-primary-container font-semibold hover:opacity-90 transition-opacity"
              >
                +62 (Indonesia)
              </button>
              <button
                type="button"
                onClick={() => handleInsertPrefix('+')}
                className="font-caption text-caption px-3 py-1 rounded-lg bg-surface-container-high text-secondary hover:text-on-surface transition-colors"
              >
                + Kode Luar Negeri
              </button>
            </div>
          </div>
        )}

        <div className="relative w-full group">
          <textarea
            disabled={isLoading}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (localError) setLocalError(null);
            }}
            className="w-full h-[150px] resize-none bg-transparent text-on-surface font-body-md text-body-md p-[16px] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface-container-lowest rounded-xl border-none placeholder:text-secondary-fixed-dim"
            placeholder={getPlaceholder()}
          />
          {input && !isLoading && (
            <button
              type="button"
              onClick={() => setInput('')}
              className="absolute top-3 right-3 text-secondary hover:text-on-surface font-caption text-caption px-2.5 py-1 bg-surface-container hover:bg-surface-container-high rounded-lg transition-colors"
            >
              Hapus
            </button>
          )}
        </div>

        {(localError || error) && (
          <div className="mx-2 p-3 bg-error-container/30 border-l-4 border-error rounded-r text-on-error-container font-body-md text-[14px]">
            {localError || error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-component_gap px-[8px] pt-2 border-t border-outline-variant/40">
          <span className="font-caption text-caption text-secondary flex items-center gap-[4px]">
            <span className="material-symbols-outlined text-[16px] text-emerald-600">shield_lock</span>
            Tidak perlu login untuk melakukan pengecekan gratis.
          </span>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-on-primary font-label-md text-label-md px-[32px] py-[12px] rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-[8px] disabled:opacity-50 active:scale-[0.98]"
          >
            {isLoading ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                Sedang menganalisis...
              </>
            ) : (
              <>
                Cek Sekarang
                <span className="material-symbols-outlined text-[18px]">search</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Feature Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-[800px] w-full mt-8 relative z-10 text-center sm:text-left">
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-surface-container-lowest/80 border border-outline-variant/60 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">bolt</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-on-surface">Analisis Instan</span>
            <span className="text-[11px] text-secondary">Hasil keluar dalam hitungan detik</span>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-surface-container-lowest/80 border border-outline-variant/60 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">database</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-on-surface">Database TeleSign & AI</span>
            <span className="text-[11px] text-secondary">Terhubung sinyal intelijen global</span>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-surface-container-lowest/80 border border-outline-variant/60 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">groups</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-on-surface">Laporan Komunitas</span>
            <span className="text-[11px] text-secondary">Verifikasi kolektif dari pengguna</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CheckForm;
