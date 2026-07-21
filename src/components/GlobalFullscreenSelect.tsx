
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, Check, Search, X } from 'lucide-react';
import { useStore } from '@/store';
import { THEMES, TRANSLATIONS } from '@/constants';
import { getContrastColor } from '../utils/colorUtils';
import FloatingInput from './FloatingInput';

interface Option {
  label: string;
  value: string;
  icon?: string;
  subLabel?: string;
}

interface GlobalFullscreenSelectProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (value: string) => void;
  options: (string | Option)[];
  title: string;
  selectedValue?: string;
  searchable?: boolean;
}

const GlobalFullscreenSelect: React.FC<GlobalFullscreenSelectProps> = ({
  isOpen,
  onClose,
  onSelect,
  options,
  title,
  selectedValue,
  searchable = true
}) => {
  const { 
    theme, user, currentView, wallpaper, backgroundColor, 
    loginWallpaper, loginBackgroundColor, language,
    appThemeMode, isDarkMode: storeIsDarkMode, setIsDropdownOpen 
  } = useStore();
  const t = TRANSLATIONS[language];
  const [search, setSearch] = useState('');
  const [localSelectedValue, setLocalSelectedValue] = useState(selectedValue);

  useEffect(() => {
    if (isOpen) {
      setLocalSelectedValue(selectedValue);
    }
  }, [selectedValue, isOpen]);
  
  const hasBottomNav = !!user;
  
  const effectiveWallpaper = (currentView === 'LOGIN') ? (loginWallpaper || wallpaper) : wallpaper;
  const effectiveBgColor = (currentView === 'LOGIN') ? (loginBackgroundColor || backgroundColor) : backgroundColor;
  
  const currentThemeObj = THEMES.find(t => t.id === theme) || THEMES[1];
  const isLightWhite = appThemeMode === 'light';
  const isDarkMode = storeIsDarkMode || theme === 'night-mode' || appThemeMode === 'dark';
  const hasCustomBackground = !isDarkMode && !!(effectiveBgColor || effectiveWallpaper);

  const textColor = effectiveWallpaper 
      ? '#ffffff'
      : (isDarkMode 
          ? '#ffffff' 
          : (effectiveBgColor 
              ? getContrastColor(effectiveBgColor) 
              : '#000000'));

  const isEffectiveLight = textColor === '#000000';

  const layoutStyle = {};

  const addOpacityToHex = (hex: any, opacity: number) => {
    if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) return hex;
    const r = parseInt(hex.length === 4 ? hex[1]+hex[1] : hex.substr(1, 2), 16);
    const g = parseInt(hex.length === 4 ? hex[2]+hex[2] : hex.substr(3, 2), 16);
    const b = parseInt(hex.length === 4 ? hex[3]+hex[3] : hex.substr(5, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const appBgStyle = {
    background: effectiveWallpaper 
      ? `url(${effectiveWallpaper}) center/cover no-repeat` 
      : (isDarkMode ? 'var(--app-bg)' : (effectiveBgColor || 'var(--app-bg)')),
  };

  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reset search when opening
  useEffect(() => {
    if (!isOpen) return;

    setSearch('');
    document.body.classList.add('global-select-open');
    setIsDropdownOpen(true);
    // Hide bottom nav
    const nav = document.querySelector('nav');
    if (nav) nav.style.display = 'none';
    
    return () => {
      document.body.classList.remove('global-select-open');
      setIsDropdownOpen(false);
      // Ensure nav is shown on unmount
      const nav = document.querySelector('nav');
      if (nav) nav.style.display = '';
    };
  }, [isOpen, setIsDropdownOpen]);

  if (!isOpen || typeof window === 'undefined') return null;

  const normalizedOptions: Option[] = (options || []).map(opt => 
    typeof opt === 'string' ? { label: opt, value: opt } : { label: opt.label || '', value: opt.value || opt.label || '', icon: opt.icon, subLabel: opt.subLabel || '' }
  );

  const filteredOptions = normalizedOptions.filter(opt => 
    opt.label.toLowerCase().includes(search.toLowerCase()) ||
    opt.subLabel?.toLowerCase().includes(search.toLowerCase())
  );

  return createPortal(
    <>
      <div 
        className={`fixed top-0 left-0 right-0 bottom-0 ${(currentView === 'LOGIN' || currentView === 'SIGNUP') ? 'bg-black/30 backdrop-blur-[1px]' : (isDarkMode ? 'bg-black/60' : 'bg-black/15')} z-[10000] global-select-backdrop animate-none`}
        style={{ transition: 'none' }}
        onClick={onClose}
      />
      <div
        className={`fixed ${isDesktop ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-lg' : 'left-0 right-0 bottom-0 h-[75vh] rounded-t-[13px] rounded-b-none'} z-[10001] flex flex-col ${isDarkMode ? 'dark' : ''} overflow-hidden shadow-[0_-10px_40px_rgba(0,0,0,0.15)] global-select-modal ${(currentView === 'LOGIN' || currentView === 'SIGNUP') ? 'login-view-modal' : ''} animate-none`}
        style={{
          ...appBgStyle,
          '--text-main': textColor,
          color: textColor,
          ...layoutStyle,
          transition: 'none'
        } as any}
      >
          {/* Main Content Wrapper - Handles Background */}
          <div 
            className="flex flex-col min-h-0 relative h-full bg-transparent"
          >
            {/* iOS Drag Handle */}
            {!isDesktop && (
              <div className="flex-none pt-3 flex justify-center z-30">
                <div className="w-12 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700/80 cursor-pointer" />
              </div>
            )}

            {/* Inner Wrapper for Background */}
            <div 
              className="absolute inset-0 z-0"
              style={{
                backgroundColor: 'transparent'
              }}
            />
            
            {/* Dynamic Header - Replaces App Header */}
            <div 
              className={`flex-none z-20 bg-transparent pt-0 pb-0 ${isDesktop ? 'rounded-t-lg' : 'rounded-t-[13px]'}`}
              style={{ backgroundColor: 'transparent' }}
            >
              <div className="relative flex items-center justify-center px-4 safe-top">
                <h2 className="text-[12px] font-black uppercase tracking-widest truncate max-w-[85%] text-[var(--text-main)]">
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  className="absolute right-4 px-3 py-0.5 -mt-3 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-[var(--text-main)] active:scale-90 transition-transform text-[10px] font-bold"
                >
                  Done
                </button>
              </div>
            </div>

            {/* Search Bar - Positioned below the header */}
            {searchable && (
              <div 
                className="flex-none px-4 mt-4 mb-4 pt-0 bg-transparent"
                style={{ backgroundColor: 'transparent' }}
              >
                <FloatingInput 
                  id="search"
                  label={t.SEARCH || 'Search'}
                  value={search}
                  onChange={setSearch}
                  icon={<Search size={18} />}
                  className="h-12 !rounded-[13px]"
                  textColor={textColor}
                />
              </div>
            )}

            {/* Scrollable List */}
            <div 
              className={`flex-1 overflow-y-auto min-h-0 px-4 py-2 space-y-2 touch-pan-y overscroll-contain bg-transparent ${isDesktop ? 'max-h-[70vh]' : 'pb-36'}`}
              style={{ backgroundColor: 'transparent' }}
            >
              {filteredOptions.length > 0 ? (
                <>
                  {filteredOptions.map((option, index) => {
                    const isSelected = localSelectedValue === option.value;
                    return (
                      <button
                        key={`${option.value}-${option.label}-${index}`}
                        onClick={() => {
                          setLocalSelectedValue(option.value);
                          onSelect(option.value);
                          onClose();
                        }}
                        className={`w-full flex items-center justify-between h-14 px-3 rounded-lg transition-all text-left relative overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.05)]
                          ${isSelected 
                            ? 'text-white shadow-[0_0_10px_rgba(59,130,246,0.2)] bg-[var(--primary)]' 
                            : 'hover:opacity-80'
                          }`}
                        style={!isSelected ? { backgroundColor: textColor === '#000000' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.06)' } : {}}
                      >
                        {isSelected && (
                          <div
                            className="absolute inset-0 bg-[var(--primary)] z-0"
                            style={{ transition: 'none' }}
                          />
                        )}
                        <div className="flex items-center gap-3 relative z-10 w-full">
                          {option.icon && (
                            typeof option.icon === 'string' && (option.icon.startsWith('http') || option.icon.startsWith('https') || option.icon.startsWith('data:')) ? (
                              <img src={option.icon} alt="" className="w-5 h-auto rounded-sm" />
                            ) : (
                              <span className="text-xl">{option.icon}</span>
                            )
                          )}
                          <div className="flex flex-col flex-1">
                            <span className={`text-[12px] ${isSelected ? 'font-bold text-white' : 'font-semibold'}`}>{option.label}</span>
                            {option.subLabel && (
                              <span className={`text-[9px] mt-0.5 ${isSelected ? 'text-white/70' : 'opacity-70'}`}>{option.subLabel}</span>
                            )}
                          </div>
                        </div>
                        {isSelected && (
                          <div className="bg-white/20 rounded-full p-0.5 relative z-10">
                            <Check size={12} strokeWidth={3} className="text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 opacity-40">
                  <p className="font-black uppercase tracking-widest text-xs text-text-muted">No results found</p>
                </div>
              )}
            </div>
          </div>
        </div>
    </>
    ,
    document.body
  );
};

export default GlobalFullscreenSelect;
