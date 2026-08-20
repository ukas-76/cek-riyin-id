import React from 'react';

export const CaraKerjaSection: React.FC = () => {
  return (
    <section className="w-full bg-surface-container-low/40 py-section_gap border-t border-outline-variant/60" id="cara-kerja">
      <div className="max-w-[1200px] mx-auto px-page_margin">
        <div className="text-center md:text-left mb-[40px]">
          <span className="font-caption text-caption text-primary font-bold uppercase tracking-wider mb-1 block">
            Panduan Penggunaan
          </span>
          <h2 className="font-display text-[28px] md:text-[36px] text-on-surface font-extrabold tracking-tight">
            Cara kerja Cekriyin.id
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Step 1 */}
          <div className="flex flex-col p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/80 shadow-sm relative group hover:border-primary/50 transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-lg">
                <span className="material-symbols-outlined text-[24px]">content_copy</span>
              </div>
              <span className="font-display text-[28px] font-black text-outline/40 group-hover:text-primary/30 transition-colors">01</span>
            </div>
            <h3 className="font-headline-lg text-lg text-on-surface font-bold mb-2">
              1. Salin / Copy Data
            </h3>
            <p className="font-body-md text-sm text-secondary leading-relaxed">
              Salin teks pesan mencurigakan, link URL asing, atau nomor telepon tak dikenal dari WhatsApp, SMS, atau Medsos.
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/80 shadow-sm relative group hover:border-primary/50 transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-lg">
                <span className="material-symbols-outlined text-[24px]">search</span>
              </div>
              <span className="font-display text-[28px] font-black text-outline/40 group-hover:text-amber-500/30 transition-colors">02</span>
            </div>
            <h3 className="font-headline-lg text-lg text-on-surface font-bold mb-2">
              2. Cek Reputasi Instan
            </h3>
            <p className="font-body-md text-sm text-secondary leading-relaxed">
              Tempelkan data pada kotak pencarian di atas dan klik <strong>"Cek Sekarang"</strong> untuk memicu analisis AI & TeleSign.
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/80 shadow-sm relative group hover:border-primary/50 transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-lg">
                <span className="material-symbols-outlined text-[24px]">verified_user</span>
              </div>
              <span className="font-display text-[28px] font-black text-outline/40 group-hover:text-teal-500/30 transition-colors">03</span>
            </div>
            <h3 className="font-headline-lg text-lg text-on-surface font-bold mb-2">
              3. Dapatkan Skor Risiko
            </h3>
            <p className="font-body-md text-sm text-secondary leading-relaxed">
              Dapatkan laporan transparan tingkat risiko (Rendah / Waspada / Tinggi) lengkap dengan riwayat laporan masyarakat.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CaraKerjaSection;
