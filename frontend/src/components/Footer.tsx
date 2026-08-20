import React from 'react';

interface FooterProps {
  onOpenDownloadModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenDownloadModal }) => {
  return (
    <footer className="bg-surface-container-lowest w-full py-section_gap border-t border-outline-variant/70 mt-auto relative overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-page_margin flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Brand Info & Logo */}
        <div className="flex flex-col items-center md:items-start gap-2 text-center md:text-left">
          <div className="flex items-center gap-2.5">
            <img src="/logo.jpg" alt="Cekriyin.id Logo" className="h-9 w-auto object-contain rounded-md" />
            <span className="font-display text-[20px] font-bold text-primary">Cekriyin.id</span>
          </div>
          <p className="font-caption text-caption text-secondary max-w-[400px]">
            Platform verifikasi reputasi & perlindungan scam independen nomor #1 di Indonesia.
          </p>
        </div>

        {/* Links & Mobile App Action */}
        <div className="flex flex-wrap justify-center items-center gap-5 text-sm">
          <a className="text-on-surface-variant hover:text-primary transition-colors font-medium" href="#cara-kerja">
            Tentang Kami
          </a>
          {onOpenDownloadModal && (
            <button
              type="button"
              onClick={onOpenDownloadModal}
              className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700/60 px-3 py-1 rounded-full text-xs"
            >
              <span className="material-symbols-outlined text-[15px]">smartphone</span>
              Aplikasi Mobile (APK)
            </button>
          )}
          <a className="text-on-surface-variant hover:text-primary transition-colors font-medium" href="#">
            Kebijakan Privasi
          </a>
          <a className="text-on-surface-variant hover:text-primary transition-colors font-medium" href="#">
            Syarat & Ketentuan
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
