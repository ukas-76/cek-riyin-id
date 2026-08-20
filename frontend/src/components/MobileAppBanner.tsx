import React from 'react';

interface MobileAppBannerProps {
  onOpenModal: () => void;
}

export const MobileAppBanner: React.FC<MobileAppBannerProps> = ({ onOpenModal }) => {
  return (
    <section className="w-full bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white py-section_gap border-t border-emerald-800/40 relative overflow-hidden">
      {/* Subtle Background Glow Circles */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

      <div className="max-w-[1200px] mx-auto px-page_margin relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Text Content & Features */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/60 border border-emerald-600/50 text-emerald-300 text-xs font-semibold mb-4">
              <span className="material-symbols-outlined text-[16px]">verified_user</span>
              Proteksi Real-Time Di Genggaman Anda
            </div>

            <h2 className="font-display text-[28px] md:text-[36px] font-bold tracking-tight text-white mb-4 leading-tight">
              Unduh Aplikasi Mobile Cekriyin <br className="hidden sm:inline" /> (APK Android & iOS)
            </h2>

            <p className="font-body-md text-[15px] md:text-[16px] text-emerald-100/80 mb-6 max-w-[580px] leading-relaxed">
              Dapatkan deteksi penipuan otomatis saat ada telepon atau SMS masuk. Tanpa perlu copy-paste manual, sistem Cekriyin akan memperingatkan Anda secara otomatis.
            </p>

            {/* Features Bullet Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mb-8 text-left">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-900/40 border border-emerald-700/40">
                <span className="material-symbols-outlined text-emerald-400 text-[20px] shrink-0 mt-0.5">call</span>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">Pop-up Panggilan</span>
                  <span className="text-[11px] text-emerald-200/70">Peringatan saat hp berdering</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-900/40 border border-emerald-700/40">
                <span className="material-symbols-outlined text-emerald-400 text-[20px] shrink-0 mt-0.5">sms</span>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">Filter SMS Spam</span>
                  <span className="text-[11px] text-emerald-200/70">Deteksi link phising pesan</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-900/40 border border-emerald-700/40">
                <span className="material-symbols-outlined text-emerald-400 text-[20px] shrink-0 mt-0.5">speed</span>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">Ringan & Cepat</span>
                  <span className="text-[11px] text-emerald-200/70">Hemat baterai & RAM</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 w-full">
              <button
                type="button"
                onClick={onOpenModal}
                className="px-6 py-3 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-bold text-[14px] rounded-xl transition-all shadow-lg hover:shadow-emerald-400/20 active:scale-[0.98] flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">download</span>
                Download APK Android
              </button>

              <button
                type="button"
                onClick={onOpenModal}
                className="px-5 py-3 bg-emerald-900/80 hover:bg-emerald-800/80 text-white font-semibold text-[14px] rounded-xl border border-emerald-600/50 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">phone_iphone</span>
                iOS App Store
              </button>
            </div>
          </div>

          {/* Right Column: Visual Device Mockup Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[340px] p-6 rounded-3xl bg-emerald-900/50 border border-emerald-600/40 backdrop-blur-md shadow-2xl flex flex-col items-center text-center">
              {/* Top Sensor Notch */}
              <div className="w-20 h-4 bg-emerald-950 rounded-full mb-6 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-emerald-800" />
              </div>

              {/* Screen Mockup Content */}
              <div className="w-full bg-emerald-950/80 rounded-2xl p-4 border border-emerald-700/50 mb-4 text-left">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold mb-2">
                  <span className="material-symbols-outlined text-[16px]">warning</span>
                  Peringatan Panggilan Masuk!
                </div>
                <div className="text-white font-bold text-sm mb-1">+62 812-3456-7890</div>
                <div className="inline-block px-2 py-0.5 rounded bg-red-950 text-red-300 text-[11px] font-semibold border border-red-700/50">
                  Risiko Tinggi — Terindikasi Penipuan CS Bank
                </div>
              </div>

              <div className="flex items-center gap-2 text-emerald-300/80 text-xs">
                <span className="material-symbols-outlined text-[16px]">shield</span>
                Cekriyin Mobile Guard System v1.0
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MobileAppBanner;
