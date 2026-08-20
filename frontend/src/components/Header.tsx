import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface HeaderProps {
  onResetSearch?: () => void;
  onOpenDownloadModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onResetSearch, onOpenDownloadModal }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="bg-surface-container-lowest/90 backdrop-blur-md h-[68px] w-full sticky top-0 z-50 border-b border-outline-variant/60 shadow-sm transition-all">
      <div className="flex justify-between items-center max-w-[1200px] mx-auto px-page_margin h-full">
        {/* Brand Logo & Title */}
        <Link
          className="flex items-center gap-2.5 hover:opacity-90 transition-all group"
          to="/"
          onClick={() => {
            if (onResetSearch) onResetSearch();
          }}
        >
          <img
            src="/logo.jpg"
            alt="Cekriyin.id Logo"
            className="h-10 w-auto object-contain rounded-lg shadow-sm group-hover:scale-105 transition-transform"
          />
          <span className="font-display text-[22px] md:text-[24px] font-extrabold tracking-tight bg-gradient-to-r from-emerald-700 via-emerald-600 to-amber-600 bg-clip-text text-transparent">
            Cekriyin.id
          </span>
        </Link>

        <div className="flex items-center gap-2 md:gap-3">
          {/* Unduh App Button */}
          {onOpenDownloadModal && (
            <button
              type="button"
              onClick={onOpenDownloadModal}
              className="bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700/60 text-emerald-800 dark:text-emerald-300 font-label-md text-label-md px-[12px] py-[7px] rounded-xl transition-all flex items-center gap-1.5 active:scale-[0.98] shadow-xs"
              title="Unduh Aplikasi Mobile Cekriyin (APK)"
            >
              <span className="material-symbols-outlined text-[18px] text-emerald-600 dark:text-emerald-400">smartphone</span>
              <span className="hidden xs:inline font-semibold">Unduh App</span>
            </button>
          )}

          {isAuthenticated && user ? (
            <div className="flex items-center gap-2 md:gap-3">
              <Link
                to="/dashboard"
                className="bg-primary-container text-on-primary-container font-label-md text-label-md px-[14px] py-[7px] rounded-xl hover:opacity-90 transition-opacity flex items-center gap-1 shadow-xs"
              >
                <span className="material-symbols-outlined text-[18px]">dashboard</span>
                Dashboard
              </Link>
              <span className="hidden md:inline-block font-caption text-caption text-secondary bg-surface-container-high px-3 py-1.5 rounded-full border border-outline-variant">
                {user.email}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="bg-surface-container-lowest border border-outline text-secondary font-label-md text-label-md px-[14px] py-[7px] rounded-xl hover:bg-surface-container-low transition-colors"
              >
                Keluar
              </button>
            </div>
          ) : (
            <Link
              to="/masuk"
              className="bg-surface-container-lowest border border-on-surface-variant text-on-surface font-label-md text-label-md px-[16px] py-[8px] rounded-xl hover:bg-surface-container-low transition-colors active:scale-[0.98] shadow-xs"
            >
              Masuk
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;
