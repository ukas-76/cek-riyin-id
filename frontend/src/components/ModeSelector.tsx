import React from 'react';

export type CheckMode = 'number' | 'message' | 'link';

interface ModeSelectorProps {
  activeMode: CheckMode;
  onSelectMode: (mode: CheckMode) => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({ activeMode, onSelectMode }) => {
  return (
    <div className="flex items-center justify-center mb-component_gap w-full max-w-[800px] mx-auto">
      <div className="flex bg-surface-container p-[4px] rounded-lg w-full sm:w-auto">
        <button
          type="button"
          onClick={() => onSelectMode('number')}
          className={`flex-1 sm:flex-none px-[24px] py-[8px] rounded-DEFAULT font-label-md text-label-md transition-all ${
            activeMode === 'number'
              ? 'bg-surface-container-lowest text-primary shadow-sm'
              : 'text-secondary hover:text-primary'
          }`}
        >
          Nomor
        </button>
        <button
          type="button"
          onClick={() => onSelectMode('message')}
          className={`flex-1 sm:flex-none px-[24px] py-[8px] rounded-DEFAULT font-label-md text-label-md transition-all ${
            activeMode === 'message'
              ? 'bg-surface-container-lowest text-primary shadow-sm'
              : 'text-secondary hover:text-primary'
          }`}
        >
          Pesan
        </button>
        <button
          type="button"
          onClick={() => onSelectMode('link')}
          className={`flex-1 sm:flex-none px-[24px] py-[8px] rounded-DEFAULT font-label-md text-label-md transition-all ${
            activeMode === 'link'
              ? 'bg-surface-container-lowest text-primary shadow-sm'
              : 'text-secondary hover:text-primary'
          }`}
        >
          Tautan
        </button>
      </div>
    </div>
  );
};

export default ModeSelector;
