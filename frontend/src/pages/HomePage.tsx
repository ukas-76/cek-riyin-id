import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CheckForm from '../components/CheckForm';
import ResultView from '../components/ResultView';
import CaraKerjaSection from '../components/CaraKerjaSection';
import MobileAppBanner from '../components/MobileAppBanner';
import DownloadAppModal from '../components/DownloadAppModal';
import { checkInput, CheckApiResponse } from '../services/checkApi';
import { CheckMode } from '../components/ModeSelector';

export const HomePage: React.FC = () => {
  const [result, setResult] = useState<CheckApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState<boolean>(false);

  const handleCheck = async (type: CheckMode, input: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await checkInput({ type, input });
      setResult(res);
      // Scroll smoothly to result header
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.message || 'Pengecekan gagal. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSearch = () => {
    setResult(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenDownloadModal = () => {
    setIsDownloadModalOpen(true);
  };

  const handleCloseDownloadModal = () => {
    setIsDownloadModalOpen(false);
  };

  return (
    <div className="bg-background text-on-background font-sans antialiased min-h-screen flex flex-col">
      <Header onResetSearch={handleResetSearch} onOpenDownloadModal={handleOpenDownloadModal} />

      <main className="flex-grow flex flex-col">
        {result ? (
          <ResultView result={result} onReset={handleResetSearch} />
        ) : (
          <>
            <CheckForm onCheck={handleCheck} isLoading={isLoading} error={error} />
            <CaraKerjaSection />
            <MobileAppBanner onOpenModal={handleOpenDownloadModal} />
          </>
        )}
      </main>

      <Footer onOpenDownloadModal={handleOpenDownloadModal} />

      <DownloadAppModal isOpen={isDownloadModalOpen} onClose={handleCloseDownloadModal} />
    </div>
  );
};

export default HomePage;
