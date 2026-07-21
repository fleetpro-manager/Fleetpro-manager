import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from '../store';


const SECTIONS = ['Payments', 'Trips', 'Users', 'Profiles', 'Finances', 'Settings', 'Others'];

const ResetSystemModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { resetSections, theme, backgroundColor, wallpaper, appThemeMode, isDarkMode: storeIsDarkMode } = useStore();
  const [selectedSections, setSelectedSections] = useState<string[]>([]);

  const isDarkMode = storeIsDarkMode || theme === 'night-mode' || appThemeMode === 'dark';
  const isLightWhite = appThemeMode === 'light';
  
  const appBgStyle = {
    background: wallpaper 
      ? `url(${wallpaper}) center/cover no-repeat fixed` 
      : (backgroundColor || 'var(--app-bg)'),
  };

  const toggleSection = (section: string) => {
    setSelectedSections(prev => 
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <>
      {isOpen && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 pb-[60px]">
          <div 
            
            
            
            className={`absolute inset-0 ${isDarkMode ? 'bg-black/40 backdrop-blur-sm' : 'bg-black/20 backdrop-blur-sm'}`} 
            onClick={onClose} 
          />
          <div
            
            
            
            
            className={`relative p-6 rounded-lg shadow-2xl w-full max-w-sm global-select-modal ${isDarkMode ? 'dark' : ''}`}
            style={isLightWhite ? { ...appBgStyle } : appBgStyle}
          >
            <h3 className={`text-sm font-black mb-4 uppercase tracking-widest text-text-main`}>Select Data to Reset</h3>
            <div className="space-y-2 mb-6">
              {SECTIONS.map(section => (
                <label key={section} className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={selectedSections.includes(section)}
                    onChange={() => toggleSection(section)}
                    className="w-5 h-5 accent-green-500"
                  />
                  <span className={`text-xs font-bold text-text-main`}>{section}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className={`flex-1 py-3 font-bold rounded-lg transition-all text-xs uppercase tracking-widest bg-gray-100 dark:bg-gray-700 text-text-main hover:bg-gray-200 dark:hover:bg-gray-600`}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetSections(selectedSections);
                  onClose();
                }}
                disabled={selectedSections.length === 0}
                className="flex-1 py-3 bg-rose-500 text-white font-bold rounded-lg hover:bg-rose-600 transition-all text-xs uppercase tracking-widest disabled:opacity-50"
              >
                Reset Selected
              </button>
            </div>
          </div>
        </div>
      )}
    </>,
    document.body
  );
};

export default ResetSystemModal;
