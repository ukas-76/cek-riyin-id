import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckApiResponse } from '../services/checkApi';
import { useAuth } from '../hooks/useAuth';
import { saveNumberApi, unsaveNumberApi, checkIsSavedApi } from '../services/savedNumbersApi';
import { getCommentsApi, postCommentApi, CommentItem } from '../services/commentsApi';

interface ResultViewProps {
  result: CheckApiResponse;
  onReset: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({ result, onReset }) => {
  const { type, input, normalizedInput, riskLevel, title, description, source, providerScore, data, indicators } = result;
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Save Number State
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isSaveLoading, setIsSaveLoading] = useState<boolean>(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState<boolean>(false);

  // Community Comments State
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [isCommentsLoading, setIsCommentsLoading] = useState<boolean>(false);
  const [newComment, setNewComment] = useState<string>('');
  const [isPostingComment, setIsPostingComment] = useState<boolean>(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  // Initial Data Fetching
  useEffect(() => {
    // Check if number is saved by logged-in user
    if (type === 'number' && isAuthenticated) {
      checkIsSavedApi(normalizedInput).then((saved) => setIsSaved(saved));
    } else {
      setIsSaved(false);
    }

    // Fetch community comments for current item
    setIsCommentsLoading(true);
    getCommentsApi(type, normalizedInput)
      .then((data) => setComments(data))
      .catch((err) => console.error('Error fetching comments:', err))
      .finally(() => setIsCommentsLoading(false));
  }, [type, normalizedInput, isAuthenticated]);

  // Handle Save Number Toggle
  const handleToggleSaveNumber = async () => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }

    setIsSaveLoading(true);
    try {
      if (isSaved) {
        await unsaveNumberApi(normalizedInput);
        setIsSaved(false);
      } else {
        await saveNumberApi(normalizedInput);
        setIsSaved(true);
      }
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah status simpan nomor.');
    } finally {
      setIsSaveLoading(false);
    }
  };

  // Handle Comment Submission
  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }

    if (!newComment || !newComment.trim()) {
      setCommentError('Tuliskan komentar terlebih dahulu.');
      return;
    }

    setCommentError(null);
    setIsPostingComment(true);

    try {
      const created = await postCommentApi(type, normalizedInput, newComment.trim());
      setComments((prev) => [created, ...prev]);
      setNewComment('');
    } catch (err: any) {
      setCommentError(err.message || 'Gagal mengirim komentar.');
    } finally {
      setIsPostingComment(false);
    }
  };

  // Format display phone number e.g. 0812-3456-7890 if length matches
  const formatPhoneDisplay = (phone: string) => {
    const clean = phone.replace(/\D/g, '');
    if (clean.length >= 10 && clean.length <= 13) {
      if (clean.startsWith('08')) {
        return `${clean.substring(0, 4)}-${clean.substring(4, 8)}-${clean.substring(8)}`;
      }
      if (clean.startsWith('628')) {
        return `+62 ${clean.substring(2, 5)}-${clean.substring(5, 9)}-${clean.substring(9)}`;
      }
    }
    return phone;
  };

  const getHeadingTitle = () => {
    if (type === 'number') {
      return formatPhoneDisplay(input);
    }
    if (type === 'link') {
      return input.length > 50 ? input.substring(0, 47) + '...' : input;
    }
    return 'Hasil Analisis Pesan';
  };

  const getSourceBadgeText = () => {
    switch (source) {
      case 'kredibel':
        return 'Kredibel.co.id Fraud DB';
      case 'veriphone':
        return 'Veriphone Intelligence API';
      case 'abstract_api':
        return 'AbstractAPI Phone Validation';
      case 'telesign':
        return 'Telesign Intelligence Cloud';
      case 'scamverify':
        return 'ScamVerify AI Analysis';
      case 'combined':
        return 'Sinyal API + Laporan Komunitas';
      case 'local_rules':
        return 'Analisis Aturan Heuristik';
      case 'unknown':
        return 'Sumber Eksternal Mengalami Kendala';
      case 'local_report':
      default:
        return 'Database Laporan Komunitas';
    }
  };

  const renderStatusBadge = () => {
    switch (riskLevel) {
      case 'HIGH':
        return (
          <span className="bg-error-container text-on-error-container font-label-md text-label-md px-4 py-2 rounded-lg inline-flex items-center gap-2 border border-error/20">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              warning
            </span>
            RISIKO TINGGI
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="bg-[#fef7e0] text-[#b06000] font-label-md text-label-md px-4 py-2 rounded-lg inline-flex items-center gap-2 border border-[#b06000]/20">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              warning
            </span>
            PERLU WASPADA
          </span>
        );
      case 'LOW':
        return (
          <span className="bg-[#e6f4ea] text-[#137333] font-label-md text-label-md px-4 py-2 rounded-lg inline-flex items-center gap-2 border border-[#137333]/20">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
            RISIKO RENDAH
          </span>
        );
      case 'NO_REPORT':
        return (
          <span className="bg-surface-container-high text-on-surface-variant font-label-md text-label-md px-4 py-2 rounded-lg inline-flex items-center gap-2 border border-outline-variant">
            <span className="material-symbols-outlined">info</span>
            BELUM ADA LAPORAN
          </span>
        );
      case 'UNKNOWN':
      default:
        return (
          <span className="bg-surface-container-high text-on-surface-variant font-label-md text-label-md px-4 py-2 rounded-lg inline-flex items-center gap-2 border border-outline-variant">
            <span className="material-symbols-outlined">help_outline</span>
            TIDAK DAPAT MENENTUKAN
          </span>
        );
    }
  };

  const getAlertStyle = () => {
    switch (riskLevel) {
      case 'HIGH':
        return 'bg-error-container/30 border-l-4 border-error text-on-error-container';
      case 'MEDIUM':
        return 'bg-[#fef7e0]/60 border-l-4 border-[#b06000] text-[#7c4300]';
      case 'LOW':
        return 'bg-[#e6f4ea]/60 border-l-4 border-[#137333] text-[#0d5224]';
      case 'NO_REPORT':
        return 'bg-surface-container-low border-l-4 border-secondary text-on-surface';
      case 'UNKNOWN':
      default:
        return 'bg-surface-container-high border-l-4 border-outline text-on-surface';
    }
  };

  return (
    <main className="flex-grow max-w-[1200px] w-full mx-auto px-page_margin py-section_gap flex flex-col gap-section_gap">
      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 max-w-[400px] w-full shadow-lg flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface">Masuk ke Cekriyin</h3>
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="text-secondary hover:text-on-surface p-1"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p className="font-body-md text-body-md text-secondary">
              Silakan masuk atau daftar akun terlebih dahulu untuk menyimpan nomor telepon atau menambahkan komentar komunitas.
            </p>
            <div className="flex gap-3 mt-2">
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-outline-variant text-on-surface font-label-md hover:bg-surface-container-high"
              >
                Batal
              </button>
              <button
                onClick={() => navigate('/masuk')}
                className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-on-primary font-label-md hover:opacity-90"
              >
                Masuk / Daftar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb & Header */}
      <section className="flex flex-col gap-component_gap">
        <div className="flex items-center gap-2 text-secondary font-body-md text-body-md">
          <button onClick={onReset} className="hover:text-primary transition-colors cursor-pointer">
            Home
          </button>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-on-surface">Hasil pengecekan</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-gutter pt-2">
          <div className="flex flex-col gap-2 max-w-full overflow-hidden">
            <h1 className="font-display text-[28px] md:text-[40px] font-bold tracking-tight text-on-surface break-words">
              {getHeadingTitle()}
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              {renderStatusBadge()}
              <span className="font-caption text-caption text-secondary bg-surface-container-high px-3 py-1.5 rounded-full border border-outline-variant inline-flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">insights</span>
                Sumber: {getSourceBadgeText()}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
            {/* Save Number Button (For Number Mode) */}
            {type === 'number' && (
              <button
                onClick={handleToggleSaveNumber}
                disabled={isSaveLoading}
                className={`font-label-md text-label-md px-5 py-3 rounded-lg border transition-all inline-flex items-center gap-2 ${
                  isSaved
                    ? 'bg-secondary-container text-on-secondary-container border-secondary/30'
                    : 'bg-surface-container-high hover:bg-surface-container-highest text-on-surface border-outline-variant'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0" }}>
                  bookmark
                </span>
                {isSaveLoading ? 'Memproses...' : isSaved ? 'Tersimpan' : 'Simpan Nomor'}
              </button>
            )}

            <button
              onClick={onReset}
              className="bg-primary text-on-primary hover:opacity-90 font-label-md text-label-md px-6 py-3 rounded-lg transition-opacity shadow-sm inline-flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">search</span>
              Cek Ulang
            </button>
          </div>
        </div>
      </section>

      {/* Message Input Snippet Preview (For Message Mode) */}
      {type === 'message' && (
        <section className="bg-surface-container-lowest border border-outline-variant p-5 rounded-xl">
          <h3 className="font-label-md text-label-md text-secondary uppercase tracking-wider mb-2">
            Isi Pesan Yang Diperiksa:
          </h3>
          <blockquote className="font-body-md text-on-surface bg-background p-4 rounded-lg border-l-4 border-primary italic font-serif text-[15px] whitespace-pre-wrap">
            "{input}"
          </blockquote>
        </section>
      )}

      {/* Message Alert Block */}
      <section>
        <div className={`p-gutter rounded-r-xl ${getAlertStyle()}`}>
          <h2 className="font-headline-md text-headline-md font-bold m-0">{title}</h2>
          <p className="font-body-md text-body-md mt-2 opacity-90">{description}</p>
        </div>
      </section>

      {/* Dynamic Bento Grid Details */}
      {type === 'number' ? (
        /* NUMBER MODE DETAILS */
        <section className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          <div className="col-span-1 border border-outline-variant rounded-xl p-gutter bg-surface-container-lowest flex flex-col justify-between h-full min-h-[140px]">
            <div>
              <span
                className={`material-symbols-outlined mb-2 text-[32px] ${
                  riskLevel === 'HIGH' ? 'text-error' : riskLevel === 'MEDIUM' ? 'text-[#b06000]' : 'text-primary'
                }`}
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                report
              </span>
              <h3 className="font-label-md text-label-md text-secondary uppercase tracking-wider mb-1">
                Total Laporan Komunitas
              </h3>
            </div>
            <div className="flex items-baseline gap-2">
              <span
                className={`font-display text-display font-bold ${
                  riskLevel === 'HIGH' ? 'text-error' : riskLevel === 'MEDIUM' ? 'text-[#b06000]' : 'text-primary'
                }`}
              >
                {data.reportCount ?? 0}
              </span>
              <span className="font-body-md text-body-md text-secondary">laporan ditemukan</span>
            </div>
          </div>

          <div className="col-span-1 md:col-span-2 border border-outline-variant rounded-xl p-gutter bg-surface-container-lowest flex flex-col justify-between h-full min-h-[140px]">
            <div>
              <span
                className="material-symbols-outlined text-primary mb-2 text-[32px]"
                style={{ fontVariationSettings: "'FILL' 0" }}
              >
                category
              </span>
              <h3 className="font-label-md text-label-md text-secondary uppercase tracking-wider mb-3">
                {providerScore !== null && providerScore !== undefined
                  ? `Skor Sinyal Risk: ${providerScore}/1000`
                  : 'Kategori Indikasi'}
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.categories && data.categories.length > 0 ? (
                data.categories.map((cat, idx) => (
                  <span
                    key={idx}
                    className="bg-surface-container-high border border-outline-variant text-on-surface-variant font-caption text-caption px-4 py-2 rounded-full inline-flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">label</span>
                    {cat}
                  </span>
                ))
              ) : (
                <span className="text-secondary font-body-md text-[14px] italic">
                  Tidak ada kategori laporan tercatat.
                </span>
              )}
            </div>
          </div>
        </section>
      ) : (
        /* MESSAGE & LINK MODE DETAILS */
        <section className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          <div className="col-span-1 border border-outline-variant rounded-xl p-gutter bg-surface-container-lowest flex flex-col justify-between h-full min-h-[140px]">
            <div>
              <span
                className={`material-symbols-outlined mb-2 text-[32px] ${
                  riskLevel === 'HIGH' ? 'text-error' : riskLevel === 'MEDIUM' ? 'text-[#b06000]' : 'text-primary'
                }`}
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {riskLevel === 'HIGH' ? 'warning' : riskLevel === 'MEDIUM' ? 'error_outline' : 'verified_user'}
              </span>
              <h3 className="font-label-md text-label-md text-secondary uppercase tracking-wider mb-1">
                Tingkat Risk & Skor
              </h3>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-[28px] font-bold text-on-surface">
                {riskLevel === 'HIGH'
                  ? 'Tinggi'
                  : riskLevel === 'MEDIUM'
                  ? 'Sedang'
                  : riskLevel === 'LOW'
                  ? 'Rendah'
                  : 'Tidak Diketahui'}
              </span>
              {providerScore !== null && providerScore !== undefined && (
                <span className="font-body-md text-body-md text-secondary">(Skor: {providerScore})</span>
              )}
            </div>
          </div>

          <div className="col-span-1 md:col-span-2 border border-outline-variant rounded-xl p-gutter bg-surface-container-lowest flex flex-col justify-between h-full min-h-[140px]">
            <div>
              <span className="material-symbols-outlined text-primary mb-2 text-[32px]">checklist</span>
              <h3 className="font-label-md text-label-md text-secondary uppercase tracking-wider mb-3">
                Indikator Ditemukan ({indicators.length})
              </h3>
            </div>
            <div className="flex flex-col gap-2">
              {indicators && indicators.length > 0 ? (
                indicators.map((ind, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2.5 bg-surface-container-low rounded-lg border border-outline-variant/60 text-on-surface font-body-md text-[14px]"
                  >
                    <span className="material-symbols-outlined text-error text-[18px]">warning</span>
                    <span>{ind}</span>
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-2 p-2.5 bg-surface-container-low rounded-lg text-secondary font-body-md text-[14px]">
                  <span className="material-symbols-outlined text-[18px]">info</span>
                  <span>Tidak ada indikator mencurigakan yang terdeteksi.</span>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Disclaimer Banner */}
      <section className="bg-surface-container-low border border-outline-variant p-4 rounded-lg flex items-start gap-3">
        <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5">info</span>
        <div className="font-caption text-caption text-secondary">
          <p className="font-semibold text-on-surface mb-0.5">Catatan Penting:</p>
          Hasil pengecekan Cekriyin.id berdasarkan sinyal penyedia reputasi & analisis heuristik. Tidak ditemukannya indikasi atau belum adanya laporan bukan jaminan 100% aman. Tetap selalu berhati-hati saat bertransaksi dan menjaga kerahasiaan data pribadi Anda.
        </div>
      </section>

      {/* COMMUNITY COMMENTS SECTION */}
      <section className="border border-outline-variant rounded-2xl bg-surface-container-lowest p-gutter flex flex-col gap-gutter">
        <div className="flex items-center justify-between border-b border-outline-variant/60 pb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">forum</span>
            <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
              Komentar Komunitas
            </h2>
            <span className="bg-surface-container-high text-on-surface-variant font-label-md text-caption px-2.5 py-0.5 rounded-full ml-1">
              {comments.length}
            </span>
          </div>
        </div>

        {/* Comment Input Form / Anonymous Login Banner */}
        {isAuthenticated ? (
          <form onSubmit={handlePostComment} className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-secondary font-caption text-caption">
              <span className="material-symbols-outlined text-[16px]">account_circle</span>
              <span>Berkomentar sebagai <strong>{user?.email}</strong></span>
            </div>
            <textarea
              rows={3}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Tuliskan catatan, kronologi, atau informasi tambahan untuk komunitas..."
              className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-secondary-fixed-dim resize-none"
            />

            {commentError && (
              <div className="p-2.5 bg-error-container/30 border-l-4 border-error text-on-error-container text-caption rounded-r font-body-md">
                {commentError}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isPostingComment}
                className="bg-primary text-on-primary font-label-md px-5 py-2.5 rounded-lg hover:opacity-90 transition-all inline-flex items-center gap-2 disabled:opacity-50"
              >
                {isPostingComment ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                    Mengirim...
                  </>
                ) : (
                  <>
                    Kirim Komentar
                    <span className="material-symbols-outlined text-[16px]">send</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary text-[24px]">lock</span>
              <p className="font-body-md text-body-md text-secondary">
                Masuk terlebih dahulu untuk menambahkan komentar dan membagikan kronologi ke komunitas.
              </p>
            </div>
            <button
              onClick={() => navigate('/masuk')}
              className="bg-primary text-on-primary font-label-md px-4 py-2 rounded-lg hover:opacity-90 transition-all whitespace-nowrap"
            >
              Masuk / Daftar
            </button>
          </div>
        )}

        {/* Comments List */}
        <div className="flex flex-col gap-3 mt-2">
          {isCommentsLoading ? (
            <div className="p-8 text-center text-secondary font-body-md flex items-center justify-center gap-2">
              <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
              Memuat komentar komunitas...
            </div>
          ) : comments.length > 0 ? (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/40 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between text-caption font-caption text-secondary">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-primary">account_circle</span>
                    <span className="font-semibold text-on-surface">{comment.author}</span>
                  </div>
                  <span>{new Date(comment.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="font-body-md text-body-md text-on-surface leading-relaxed pl-6">
                  {comment.content}
                </p>
              </div>
            ))
          ) : (
            <div className="p-8 border border-dashed border-outline-variant rounded-xl text-center text-secondary font-body-md flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-[32px] text-secondary-fixed-dim">chat_bubble_outline</span>
              <span>Belum ada komentar dari komunitas. Jadilah yang pertama memberikan catatan!</span>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default ResultView;
