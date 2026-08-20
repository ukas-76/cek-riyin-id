import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ResultView from '../components/ResultView';
import { useAuth } from '../hooks/useAuth';
import {
  getCheckHistoryApi,
  getUserCommentsApi,
  deleteUserCommentApi,
  CheckHistoryItem,
  UserCommentItem,
} from '../services/dashboardApi';
import {
  getSavedNumbersApi,
  unsaveNumberApi,
  SavedNumberItem,
} from '../services/savedNumbersApi';
import { checkInput, CheckApiResponse } from '../services/checkApi';

type DashboardTab = 'riwayat' | 'tersimpan' | 'komentar';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<DashboardTab>('riwayat');

  // Selected Result Modal View
  const [selectedResult, setSelectedResult] = useState<CheckApiResponse | null>(null);

  // History State
  const [historyList, setHistoryList] = useState<CheckHistoryItem[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState<boolean>(false);
  const [historyFilter, setHistoryFilter] = useState<string>('all');
  const [historySearch, setHistorySearch] = useState<string>('');

  // Saved Numbers State
  const [savedList, setSavedList] = useState<SavedNumberItem[]>([]);
  const [isSavedLoading, setIsSavedLoading] = useState<boolean>(false);

  // User Comments State
  const [userCommentsList, setUserCommentsList] = useState<UserCommentItem[]>([]);
  const [isCommentsLoading, setIsCommentsLoading] = useState<boolean>(false);

  // Fetch All Dashboard Data on Component Mount
  useEffect(() => {
    fetchAllDashboardData();
  }, []);

  const fetchAllDashboardData = async () => {
    setIsHistoryLoading(true);
    setIsSavedLoading(true);
    setIsCommentsLoading(true);

    try {
      const [history, saved, comments] = await Promise.all([
        getCheckHistoryApi().catch((err) => {
          console.error('Error fetching check history:', err);
          return [];
        }),
        getSavedNumbersApi().catch((err) => {
          console.error('Error fetching saved numbers:', err);
          return [];
        }),
        getUserCommentsApi().catch((err) => {
          console.error('Error fetching user comments:', err);
          return [];
        }),
      ]);

      setHistoryList(history);
      setSavedList(saved);
      setUserCommentsList(comments);
    } finally {
      setIsHistoryLoading(false);
      setIsSavedLoading(false);
      setIsCommentsLoading(false);
    }
  };

  // Re-check Saved Number
  const handleRecheckNumber = async (phone: string) => {
    try {
      const res = await checkInput({ type: 'number', input: phone });
      setSelectedResult(res);
    } catch (err: any) {
      alert(err.message || 'Pengecekan gagal.');
    }
  };

  // View Past Check Result
  const handleViewHistoryResult = (item: CheckHistoryItem) => {
    if (item.result) {
      setSelectedResult(item.result as CheckApiResponse);
    } else {
      handleRecheckNumber(item.input);
    }
  };

  // View Comment Target Result
  const handleViewCommentTarget = async (item: UserCommentItem) => {
    try {
      const res = await checkInput({ type: item.target_type, input: item.target_reference });
      setSelectedResult(res);
    } catch (err: any) {
      alert(err.message || 'Gagal memuat hasil pengecekan target.');
    }
  };

  // Delete Saved Number Handler
  const handleDeleteSavedNumber = async (phoneNumber: string) => {
    if (!window.confirm(`Hapus nomor ${phoneNumber} dari daftar tersimpan?`)) return;
    try {
      await unsaveNumberApi(phoneNumber);
      setSavedList((prev) => prev.filter((item) => item.phone_number !== phoneNumber));
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus nomor tersimpan.');
    }
  };

  // Delete User Comment Handler
  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Hapus komentar ini secara permanen?')) return;
    try {
      await deleteUserCommentApi(commentId);
      setUserCommentsList((prev) => prev.filter((item) => item.id !== commentId));
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus komentar.');
    }
  };

  // Format Phone Display Helper
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

  // Filtered History
  const filteredHistory = historyList.filter((item) => {
    const matchesType = historyFilter === 'all' || item.type === historyFilter;
    const matchesSearch = item.input.toLowerCase().includes(historySearch.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="bg-background min-h-screen text-on-surface flex flex-col font-body-md selection:bg-primary-container">
      <Header />

      <main className="flex-grow max-w-[1200px] w-full mx-auto px-page_margin py-section_gap flex flex-col gap-section_gap">
        {selectedResult ? (
          <div className="flex flex-col gap-4">
            <button
              onClick={() => setSelectedResult(null)}
              className="self-start font-label-md text-label-md text-primary hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Kembali ke Dashboard Akun
            </button>
            <ResultView result={selectedResult} onReset={() => setSelectedResult(null)} />
          </div>
        ) : (
          <>
            {/* User Account Profile Banner */}
            <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-display font-bold text-[24px]">
                  {user?.email ? user.email.substring(0, 2).toUpperCase() : 'CK'}
                </div>
                <div>
                  <h1 className="font-display text-[24px] md:text-[28px] font-bold text-on-surface">
                    Dashboard Akun
                  </h1>
                  <p className="font-body-md text-body-md text-secondary mt-0.5">
                    {user?.email}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-outline-variant">
                <div className="flex-1 md:flex-none bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/60 min-w-[120px] text-center">
                  <span className="font-display text-[22px] font-bold text-primary block">
                    {historyList.length}
                  </span>
                  <span className="font-caption text-caption text-secondary">Total Pengecekan</span>
                </div>
                <div className="flex-1 md:flex-none bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/60 min-w-[120px] text-center">
                  <span className="font-display text-[22px] font-bold text-primary block">
                    {savedList.length}
                  </span>
                  <span className="font-caption text-caption text-secondary">Nomor Tersimpan</span>
                </div>
                <div className="flex-1 md:flex-none bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/60 min-w-[120px] text-center">
                  <span className="font-display text-[22px] font-bold text-primary block">
                    {userCommentsList.length}
                  </span>
                  <span className="font-caption text-caption text-secondary">Komentar Saya</span>
                </div>
              </div>
            </section>

            {/* Dashboard Navigation Tabs */}
            <section className="flex flex-col gap-component_gap">
              <div className="flex border-b border-outline-variant overflow-x-auto gap-2">
                <button
                  onClick={() => setActiveTab('riwayat')}
                  className={`py-3 px-6 font-label-md text-label-md transition-all whitespace-nowrap inline-flex items-center gap-2 border-b-2 cursor-pointer ${
                    activeTab === 'riwayat'
                      ? 'border-primary text-primary font-bold'
                      : 'border-transparent text-secondary hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">history</span>
                  Riwayat Pengecekan ({historyList.length})
                </button>

                <button
                  onClick={() => setActiveTab('tersimpan')}
                  className={`py-3 px-6 font-label-md text-label-md transition-all whitespace-nowrap inline-flex items-center gap-2 border-b-2 cursor-pointer ${
                    activeTab === 'tersimpan'
                      ? 'border-primary text-primary font-bold'
                      : 'border-transparent text-secondary hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">bookmark</span>
                  Nomor Tersimpan ({savedList.length})
                </button>

                <button
                  onClick={() => setActiveTab('komentar')}
                  className={`py-3 px-6 font-label-md text-label-md transition-all whitespace-nowrap inline-flex items-center gap-2 border-b-2 cursor-pointer ${
                    activeTab === 'komentar'
                      ? 'border-primary text-primary font-bold'
                      : 'border-transparent text-secondary hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">chat_bubble_outline</span>
                  Komentar Saya ({userCommentsList.length})
                </button>
              </div>

              {/* TAB 1: RIWAYAT PENGECEKAN */}
              {activeTab === 'riwayat' && (
                <div className="flex flex-col gap-component_gap">
                  {/* Filter & Search Bar */}
                  <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-surface-container-lowest p-4 rounded-xl border border-outline-variant">
                    <div className="relative w-full sm:w-[320px]">
                      <span className="material-symbols-outlined absolute left-3 top-2.5 text-secondary text-[20px]">
                        search
                      </span>
                      <input
                        type="text"
                        value={historySearch}
                        onChange={(e) => setHistorySearch(e.target.value)}
                        placeholder="Cari dalam riwayat..."
                        className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-body-md text-[14px] text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto">
                      {['all', 'number', 'message', 'link'].map((f) => (
                        <button
                          key={f}
                          onClick={() => setHistoryFilter(f)}
                          className={`px-3 py-1.5 rounded-lg text-caption font-caption transition-all cursor-pointer ${
                            historyFilter === f
                              ? 'bg-primary text-on-primary font-semibold'
                              : 'bg-surface-container-high text-secondary hover:text-on-surface'
                          }`}
                        >
                          {f === 'all' ? 'Semua' : f === 'number' ? 'Nomor' : f === 'message' ? 'Pesan' : 'Tautan'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* History Table / Card List */}
                  {isHistoryLoading ? (
                    <div className="p-12 text-center text-secondary font-body-md flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined animate-spin text-[24px]">progress_activity</span>
                      Memuat riwayat pengecekan...
                    </div>
                  ) : filteredHistory.length > 0 ? (
                    <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left font-body-md text-[14px]">
                          <thead className="bg-surface-container-low border-b border-outline-variant text-secondary font-label-md text-caption uppercase">
                            <tr>
                              <th className="p-4">Input Pengecekan</th>
                              <th className="p-4">Mode</th>
                              <th className="p-4">Tingkat Risiko</th>
                              <th className="p-4">Tanggal</th>
                              <th className="p-4 text-right">Aksi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-outline-variant/60">
                            {filteredHistory.map((item) => (
                              <tr key={item.id} className="hover:bg-surface-container-low/50 transition-colors">
                                <td className="p-4 font-semibold text-on-surface max-w-[300px] truncate">
                                  {item.type === 'number' ? formatPhoneDisplay(item.input) : item.input}
                                </td>
                                <td className="p-4">
                                  <span className="bg-surface-container-high text-on-surface-variant font-caption text-caption px-3 py-1 rounded-full border border-outline-variant uppercase">
                                    {item.type}
                                  </span>
                                </td>
                                <td className="p-4">
                                  <span
                                    className={`font-label-md text-caption px-3 py-1 rounded-md inline-flex items-center gap-1 ${
                                      item.risk_level === 'HIGH'
                                        ? 'bg-error-container text-on-error-container'
                                        : item.risk_level === 'MEDIUM'
                                        ? 'bg-[#fef7e0] text-[#b06000]'
                                        : item.risk_level === 'LOW'
                                        ? 'bg-[#e6f4ea] text-[#137333]'
                                        : 'bg-surface-container-high text-secondary'
                                    }`}
                                  >
                                    {item.risk_level === 'HIGH'
                                      ? 'Risiko Tinggi'
                                      : item.risk_level === 'MEDIUM'
                                      ? 'Perlu Waspada'
                                      : item.risk_level === 'LOW'
                                      ? 'Risiko Rendah'
                                      : 'Belum Ada Laporan'}
                                  </span>
                                </td>
                                <td className="p-4 text-secondary text-caption">
                                  {new Date(item.created_at).toLocaleDateString('id-ID', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </td>
                                <td className="p-4 text-right">
                                  <button
                                    onClick={() => handleViewHistoryResult(item)}
                                    className="bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-md font-label-md text-caption transition-colors inline-flex items-center gap-1 cursor-pointer"
                                  >
                                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                                    Lihat Hasil
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="p-12 border border-dashed border-outline-variant rounded-2xl text-center text-secondary font-body-md flex flex-col items-center gap-3">
                      <span className="material-symbols-outlined text-[36px] text-secondary-fixed-dim">history</span>
                      <span>Belum ada riwayat pengecekan tersimpan.</span>
                      <button
                        onClick={() => navigate('/')}
                        className="bg-primary text-on-primary font-label-md px-4 py-2 rounded-lg hover:opacity-90 transition-all mt-2 cursor-pointer"
                      >
                        Lakukan Pengecekan Sekarang
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: NOMOR TERSIMPAN */}
              {activeTab === 'tersimpan' && (
                <div className="flex flex-col gap-component_gap">
                  {isSavedLoading ? (
                    <div className="p-12 text-center text-secondary font-body-md flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined animate-spin text-[24px]">progress_activity</span>
                      Memuat nomor tersimpan...
                    </div>
                  ) : savedList.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                      {savedList.map((item) => (
                        <div
                          key={item.id}
                          className="bg-surface-container-lowest border border-outline-variant p-5 rounded-xl flex items-center justify-between gap-4 shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary text-[28px]">phone_in_talk</span>
                            <div>
                              <h3 className="font-display font-bold text-[18px] text-on-surface">
                                {formatPhoneDisplay(item.phone_number)}
                              </h3>
                              <span className="font-caption text-caption text-secondary block mt-0.5">
                                Disimpan pada {new Date(item.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleRecheckNumber(item.phone_number)}
                              className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-caption font-label-md transition-colors inline-flex items-center gap-1 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[16px]">refresh</span>
                              Cek Ulang
                            </button>

                            <button
                              onClick={() => handleDeleteSavedNumber(item.phone_number)}
                              className="p-2 text-error hover:bg-error-container/20 rounded-lg transition-colors cursor-pointer"
                              title="Hapus dari tersimpan"
                            >
                              <span className="material-symbols-outlined text-[20px]">delete</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-12 border border-dashed border-outline-variant rounded-2xl text-center text-secondary font-body-md flex flex-col items-center gap-3">
                      <span className="material-symbols-outlined text-[36px] text-secondary-fixed-dim">bookmark_border</span>
                      <span>Belum ada nomor yang disimpan.</span>
                      <p className="font-caption text-caption text-secondary max-w-[400px]">
                        Anda dapat menyimpan nomor telepon penting atau mencurigakan melalui halaman hasil pengecekan.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: KOMENTAR SAYA */}
              {activeTab === 'komentar' && (
                <div className="flex flex-col gap-component_gap">
                  {isCommentsLoading ? (
                    <div className="p-12 text-center text-secondary font-body-md flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined animate-spin text-[24px]">progress_activity</span>
                      Memuat komentar Anda...
                    </div>
                  ) : userCommentsList.length > 0 ? (
                    <div className="flex flex-col gap-gutter">
                      {userCommentsList.map((item) => (
                        <div
                          key={item.id}
                          className="bg-surface-container-lowest border border-outline-variant p-5 rounded-xl flex flex-col gap-3 shadow-sm"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="bg-surface-container-high text-on-surface-variant font-caption text-caption px-2.5 py-0.5 rounded-full uppercase border border-outline-variant">
                                {item.target_type}
                              </span>
                              <span className="font-semibold text-on-surface text-[14px] truncate max-w-[300px]">
                                {item.target_reference}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleViewCommentTarget(item)}
                                className="text-primary hover:underline text-caption font-caption inline-flex items-center gap-1 p-1 hover:bg-primary/10 rounded cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[16px]">visibility</span>
                                Lihat Halaman
                              </button>

                              <button
                                onClick={() => handleDeleteComment(item.id)}
                                className="text-error hover:text-on-error-container text-caption font-caption inline-flex items-center gap-1 p-1 hover:bg-error-container/20 rounded cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[16px]">delete</span>
                                Hapus
                              </button>
                            </div>
                          </div>

                          <blockquote className="font-body-md text-on-surface bg-surface-container-low p-3.5 rounded-lg border-l-4 border-primary text-[14px]">
                            "{item.content}"
                          </blockquote>

                          <span className="font-caption text-caption text-secondary self-end">
                            {new Date(item.created_at).toLocaleDateString('id-ID', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-12 border border-dashed border-outline-variant rounded-2xl text-center text-secondary font-body-md flex flex-col items-center gap-3">
                      <span className="material-symbols-outlined text-[36px] text-secondary-fixed-dim">chat_bubble_outline</span>
                      <span>Belum ada komentar yang Anda tulis.</span>
                    </div>
                  )}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default DashboardPage;
