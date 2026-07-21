import React from 'react';
import { createPortal } from 'react-dom';
import { useStore } from '../store';

import { THEMES } from '@/constants';

interface ConfirmConfig {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  title?: string;
  confirmText?: string;
  cancelText?: string;
  onSecondaryConfirm?: () => void;
  secondaryConfirmText?: string;
}

const ConfirmationModal: React.FC = () => {
  const { confirmConfig, closeConfirm, theme, backgroundColor, wallpaper, appThemeMode, isDarkMode: storeIsDarkMode, language } = useStore();
  const isArabic = language === 'ar';

  const config = confirmConfig as ConfirmConfig | null;

  // Detect if the action is specifically a log out or sign out action
  const isLogoutAction = (cfg: ConfirmConfig | null) => {
    if (!cfg) return false;
    const checkText = (text?: string) => {
      if (!text) return false;
      const lower = text.toLowerCase();
      return (
        lower.includes('logout') || 
        lower.includes('log out') || 
        lower.includes('signout') || 
        lower.includes('sign out') || 
        lower.includes('লগআউট') || 
        lower.includes('লগ আউট') ||
        lower.includes('লগ-আউট')
      );
    };
    return checkText(cfg?.title) || checkText(cfg?.message) || checkText(cfg?.confirmText);
  };

  const isLogout = isLogoutAction(config);
  const isDarkMode = !isLogout && (storeIsDarkMode || theme === 'night-mode' || appThemeMode === 'dark');
  const isLightWhite = appThemeMode === 'light';
  
  const currentThemeObj = THEMES.find(t => t.id === theme) || THEMES[0];

  if (typeof document === 'undefined') return null;

  // Detect if the action is destructive (e.g. log out, delete, remove, reset, etc.)
  const isDestructiveAction = (text?: string) => {
    if (!text) return false;
    const lower = text.toLowerCase();
    return (
      lower.includes('delete') || 
      lower.includes('remove') || 
      lower.includes('exit') || 
      lower.includes('logout') || 
      lower.includes('reset') ||
      lower.includes('clear') ||
      lower.includes('মুছে') || 
      lower.includes('লগআউট') || 
      lower.includes('বাহির') ||
      lower.includes('ডিলেট') ||
      lower.includes('মুছুন') ||
      lower.includes('রিসেট')
    );
  };

  const isConfirmDestructive = isDestructiveAction(config?.confirmText) || isDestructiveAction(config?.title) || isDestructiveAction(config?.message);

  return createPortal(
    <>
      {config?.isOpen && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6 font-sans select-none">
          {/* Overlay Background with smooth fade */}
          <div 
            
            
            
            
            className="absolute inset-0 bg-black/40 backdrop-blur-[5px]" 
            onClick={closeConfirm} 
          />

          {/* iOS Alert Dialog Box */}
          <div
            
            
            
            
            className={`relative w-[275px] max-w-[90%] mx-auto flex flex-col overflow-hidden rounded-[14px] shadow-[0_8px_30px_rgba(0,0,0,0.22)] border ${
              isDarkMode 
                ? 'border-white/10 bg-[#1c1c1e]/82 text-white' 
                : 'border-black/10 bg-[#f2f2f7]/85 text-black'
            } backdrop-blur-[20px]`}
          >
            {/* Header / Content Section */}
            <div className="px-4 pt-5 pb-4 text-center">
              <h3 className={`text-[17px] font-semibold leading-tight tracking-tight ${
                isDarkMode ? 'text-white' : 'text-black'
              }`}>
                {config.title || (isArabic ? 'تأكيد' : 'Confirmation')}
              </h3>
              <p className={`text-[13px] leading-snug mt-1.5 px-1 font-normal opacity-90 ${
                isDarkMode ? 'text-neutral-300' : 'text-neutral-600'
              }`}>
                {config.message}
              </p>
            </div>

            {/* Hairline top border for buttons */}
            <div className={`h-[0.5px] w-full ${isDarkMode ? 'bg-white/15' : 'bg-black/10'}`} />
            
            {/* Action Buttons Section */}
            {config.onSecondaryConfirm ? (
              // 3 Buttons -> Stacked vertically
              <div className={`flex flex-col w-full divide-y ${
                isDarkMode ? 'divide-white/15' : 'divide-black/10'
              }`}>
                <button
                  onClick={() => {
                    config.onConfirm();
                    closeConfirm();
                  }}
                  className={`w-full py-3 text-[17px] font-semibold transition-colors ${
                    isDarkMode ? 'active:bg-white/10' : 'active:bg-black/10'
                  } ${
                    isConfirmDestructive 
                      ? (isDarkMode ? 'text-[#ff453a]' : 'text-[#FF3B30]') 
                      : (isDarkMode ? 'text-[#0a84ff]' : 'text-[#007AFF]')
                  }`}
                >
                  {config.confirmText || 'Logout & Exit'}
                </button>
                <button
                  onClick={() => {
                    config.onSecondaryConfirm?.();
                    closeConfirm();
                  }}
                  className={`w-full py-3 text-[17px] font-normal transition-colors ${
                    isDarkMode ? 'text-[#0a84ff] active:bg-white/10' : 'text-[#007AFF] active:bg-black/10'
                  }`}
                >
                  {config.secondaryConfirmText || 'Just Exit'}
                </button>
                <button
                  onClick={closeConfirm}
                  className={`w-full py-3 text-[17px] font-semibold transition-colors ${
                    isDarkMode ? 'text-[#0a84ff] active:bg-white/10' : 'text-[#007AFF] active:bg-black/10'
                  }`}
                >
                  {config.cancelText || (isArabic ? 'إلغاء' : 'Cancel')}
                </button>
              </div>
            ) : (
              // 2 Buttons -> Side by side
              <div className="flex w-full h-[44px]">
                <button
                  onClick={closeConfirm}
                  className={`flex-1 h-full flex items-center justify-center text-[17px] font-normal transition-colors ${
                    isDarkMode ? 'text-[#0a84ff] active:bg-white/10' : 'text-[#007AFF] active:bg-black/10'
                  }`}
                >
                  {config.cancelText || (isArabic ? 'لا' : 'No')}
                </button>
                
                {/* Hairline vertical divider */}
                <div className={`w-[0.5px] h-full ${isDarkMode ? 'bg-white/15' : 'bg-black/10'}`} />
                
                <button
                  onClick={() => {
                    config.onConfirm();
                    closeConfirm();
                  }}
                  className={`flex-1 h-full flex items-center justify-center text-[17px] font-semibold transition-colors ${
                    isDarkMode ? 'active:bg-white/10' : 'active:bg-black/10'
                  } ${
                    isConfirmDestructive 
                      ? (isDarkMode ? 'text-[#ff453a]' : 'text-[#FF3B30]') 
                      : (isDarkMode ? 'text-[#0a84ff]' : 'text-[#007AFF]')
                  }`}
                >
                  {config.confirmText || (isArabic ? 'نعم' : 'Yes')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>,
    document.body
  );
};

export default ConfirmationModal;

