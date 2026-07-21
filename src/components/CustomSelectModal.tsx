import React, { useState, useMemo } from 'react';

import { ChevronLeft, Search } from 'lucide-react';
import { useStore } from '@/store';
import { THEMES, TRANSLATIONS } from '@/constants';
import { getContrastColor } from '@/utils/colorUtils';
import FloatingInput from './FloatingInput';

export interface SelectOption {
  value: string;
  label: string;
  flag?: string;
}

interface CustomSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (option: SelectOption) => void;
  options: SelectOption[];
  title: string;
}

const CustomSelectModal: React.FC<CustomSelectModalProps> = ({ isOpen, onClose, onSelect, options, title }) => {
  const { user, wallpaper, backgroundColor, theme, appThemeMode, isDarkMode: storeIsDarkMode, language } = useStore();
  const t = TRANSLATIONS[language];
  const [searchTerm, setSearchTerm] = useState('');
  const isDarkMode = storeIsDarkMode || theme === 'night-mode' || appThemeMode === 'dark';
  const isLightWhite = appThemeMode === 'light' && !wallpaper;
  const hasCustomBackground = !isDarkMode && !!(backgroundColor || wallpaper);

  const appBgStyle = {
    background: wallpaper 
      ? `url(${wallpaper}) center/cover no-repeat fixed` 
      : (isDarkMode ? 'var(--app-bg)' : (backgroundColor || 'var(--app-bg)')),
  };
  
  const textColor = wallpaper 
      ? '#ffffff'
      : (isDarkMode 
          ? '#ffffff' 
          : (backgroundColor 
              ? getContrastColor(backgroundColor) 
              : '#000000'));

  const filteredOptions = useMemo(() => {
    const list = options || [];
    if (!searchTerm) return list;
    return list.filter(opt =>
      opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, options]);

  return (
    <>
      {isOpen && (
        <>
          <div 
            
            
            
            className="fixed inset-0 bg-black/60 z-[100]"
            onClick={onClose}
          />
          <div
            
            
            
            
            className={`fixed left-4 right-4 bottom-[calc(110px+env(safe-area-inset-bottom))] h-[55vh] rounded-[10px] z-[9000] flex flex-col global-select-modal ${isDarkMode ? 'dark' : ''}`}
            style={isLightWhite ? { ...appBgStyle, '--text-main': textColor, color: textColor } as any : {
              ...appBgStyle,
              '--text-main': textColor,
              color: textColor,
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)'
            } as any}
          >
            {/* iOS Drag Handle */}
            <div className="flex-none pt-3 flex justify-center z-10">
              <div className="w-12 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700/80 cursor-pointer" />
            </div>

            {/* Inner Wrapper for Blur */}
            <div 
              className="absolute inset-0 z-0"
              style={{
                backgroundColor: 'transparent'
              }}
            />
            
            {/* Header */}
            <div 
              className={`flex items-center gap-3 p-4 bg-transparent relative z-10 text-[var(--text-main)]`}
            >
              <button onClick={onClose} className="p-1 rounded-full transition-colors hover:bg-black/5 dark:hover:bg-white/10 text-[var(--text-main)]">
                <ChevronLeft size={24} />
              </button>
              <h3 className="font-bold text-lg text-[var(--text-main)]">{title}</h3>
            </div>

            {/* Search */}
            <div 
              className="p-[18px] bg-transparent relative z-10"
              style={{ backgroundColor: 'transparent' }}
            >
              <FloatingInput 
                id="search"
                label={t.SEARCH || 'SEARCH...'}
                value={searchTerm}
                onChange={setSearchTerm}
                icon={<Search size={18} />}
                className="h-14 rounded-lg"
                textColor={textColor}
              />
            </div>

            {/* Options List */}
            <div 
              className="flex-1 overflow-y-auto p-[18px] pb-32 space-y-2 bg-transparent relative z-10"
              style={{ backgroundColor: 'transparent' }}
            >
              {filteredOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        onSelect(option);
                        onClose();
                      }}
                      className={`w-full flex items-center gap-3 px-3 h-14 text-left hover:opacity-80 rounded-lg shadow-sm transition-colors`}
                      style={{ color: 'inherit', backgroundColor: textColor === '#000000' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.06)' }}
                    >
                    {option.flag && <span className="text-xl">{option.flag}</span>}
                    <span className="font-semibold text-sm">{option.label}</span>
                  </button>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default CustomSelectModal;
