
import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store';

import { Check } from 'lucide-react';

interface FloatingInputProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  id?: string;
  className?: string;
  inputMode?: "none" | "text" | "tel" | "url" | "email" | "numeric" | "decimal" | "search";
  pattern?: string;
  icon?: React.ReactNode;
  error?: boolean;
  readOnly?: boolean;
  textColor?: string;
}

const FloatingInput: React.FC<FloatingInputProps> = ({ label, value, onChange, type = "text", required = false, id, className, inputMode, pattern, icon, error, readOnly = false, textColor }) => {
  const { theme, backgroundColor, wallpaper, appThemeMode, currentView, loginBackgroundColor } = useStore();
  const inputId = id || (label || '').replace(/\s+/g, '-').toLowerCase();

  const [isFocused, setIsFocused] = useState(false);
  const [dynamicColor, setDynamicColor] = useState('#ffffff');
  const [isDarkBg, setIsDarkBg] = useState(true);
  const [dynamicBgColor, setDynamicBgColor] = useState('transparent');
  
  const containerRef = useRef<HTMLDivElement>(null);

  const isSearchInput = (label?.toLowerCase() || '').includes('search') || (label || '').includes('সার্চ') || id?.toLowerCase().includes('search');
  const isLightMode = appThemeMode === 'light';
  const isLoginView = currentView === 'LOGIN' || currentView === 'SIGNUP';
  const hasValue = value !== '' && value !== null && value !== undefined;

  useEffect(() => {
    if (textColor) {
      setDynamicColor(textColor);
      
      const getLuminance = (colorStr: string): number => {
        let clean = (colorStr || '').trim().toLowerCase();
        if (!clean) return 1;
        if (clean === 'white' || clean === '#ffffff' || clean === '#fff') return 1;
        if (clean === 'black' || clean === '#000000' || clean === '#000') return 0;

        const rgbMatch = clean.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
        if (rgbMatch) {
          const r = parseInt(rgbMatch[1], 10);
          const g = parseInt(rgbMatch[2], 10);
          const b = parseInt(rgbMatch[3], 10);
          return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
        }

        if (clean.startsWith('#')) {
          let hex = clean.replace('#', '');
          if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
          }
          if (hex.length === 6) {
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
          }
        }
        return 1;
      };

      const textLuminance = getLuminance(textColor);
      const bgIsDark = textLuminance > 0.5;
      setIsDarkBg(bgIsDark);
      setDynamicBgColor(bgIsDark ? '#121214' : '#ffffff');
      return;
    }

    let active = true;
    const calculateColor = () => {
      if (!active || !containerRef.current) return;
      
      let bg = 'rgba(0,0,0,0)';
      
      // 1. Check custom background state from store
      const effectiveBgProp = (currentView === 'LOGIN' || currentView === 'SIGNUP') 
        ? (loginBackgroundColor || backgroundColor) 
        : backgroundColor;
      if (effectiveBgProp && typeof effectiveBgProp === 'string' && effectiveBgProp.trim() !== '' && effectiveBgProp !== 'transparent') {
        bg = effectiveBgProp;
      }
      
      // 2. Fall back to current root --app-bg variable set on documentElement
      if (bg === 'rgba(0,0,0,0)' || bg === 'transparent') {
        const rootBg = document.documentElement.style.getPropertyValue('--app-bg') || 
                       window.getComputedStyle(document.documentElement).getPropertyValue('--app-bg');
        if (rootBg && rootBg.trim() && rootBg !== 'transparent' && !rootBg.includes('var(')) {
          bg = rootBg.trim();
        }
      }
      
      // 3. Fall back to walking up the parent tree
      if (bg === 'rgba(0,0,0,0)' || bg === 'transparent') {
        let cur: HTMLElement | null = containerRef.current;
        while (cur) {
          const computedBg = window.getComputedStyle(cur).backgroundColor;
          if (computedBg && computedBg !== 'transparent' && computedBg !== 'rgba(0, 0, 0, 0)' && computedBg !== 'rgba(0,0,0,0)') {
            bg = computedBg;
            break;
          }
          
          const appBg = window.getComputedStyle(cur).getPropertyValue('--app-bg');
          if (appBg && appBg.trim() && appBg !== 'transparent' && !appBg.includes('var(')) {
            bg = appBg.trim();
            break;
          }
          
          cur = cur.parentElement;
        }
      }

      const getLuminance = (colorStr: string): number => {
        let clean = (colorStr || '').trim().toLowerCase();
        if (!clean || clean === 'transparent' || clean === 'rgba(0, 0, 0, 0)' || clean === 'rgba(0,0,0,0)') {
          return 0; // default to dark background
        }
        if (clean === 'white' || clean === '#ffffff' || clean === '#fff') return 1;
        if (clean === 'black' || clean === '#000000' || clean === '#000') return 0;

        const rgbMatch = clean.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
        if (rgbMatch) {
          const r = parseInt(rgbMatch[1], 10);
          const g = parseInt(rgbMatch[2], 10);
          const b = parseInt(rgbMatch[3], 10);
          const [rN, gN, bN] = [r / 255, g / 255, b / 255].map(v => {
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
          });
          return 0.2126 * rN + 0.7152 * gN + 0.0722 * bN;
        }

        if (clean.includes('gradient')) {
          const match = clean.match(/#([0-9a-fA-F]{3,6})/);
          if (match) clean = match[0];
        }

        if (clean.startsWith('#')) {
          let hex = clean.replace('#', '');
          if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
          }
          if (hex.length === 6) {
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            const [rN, gN, bN] = [r / 255, g / 255, b / 255].map(v => {
              return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
            });
            return 0.2126 * rN + 0.7152 * gN + 0.0722 * bN;
          }
        }
        return 0; // Default to dark background
      };

      const luminance = getLuminance(bg);
      const dark = luminance < 0.5;

      setIsDarkBg(dark);
      setDynamicColor(dark ? '#ffffff' : '#000000');
      setDynamicBgColor(bg);
    };

    calculateColor();
    const t1 = setTimeout(calculateColor, 50);
    const t2 = setTimeout(calculateColor, 250);

    window.addEventListener('resize', calculateColor);
    return () => {
      active = false;
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', calculateColor);
    };
  }, [isSearchInput, backgroundColor, loginBackgroundColor, wallpaper, value, currentView, theme, appThemeMode, textColor]);

  const shakeVariants = {
    shake: {
      x: [0, -5, 5, -5, 5, 0],
      transition: { duration: 0 }
    }
  };

  return (
    <div 
      ref={containerRef}
      
      
      className={`input-field-container relative w-full transition-colors duration-200 rounded-lg border ${isFocused ? 'z-50' : 'z-10'} ${isSearchInput ? 'search-field-container' : ''} ${className?.includes('h-') ? '' : 'h-14'} ${className || ''}`}
      style={{
        backgroundColor: error ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
        borderWidth: isFocused ? '2px' : '1px',
        borderColor: error ? 'rgb(239, 68, 68)' : undefined,
        '--search-text-color': isSearchInput ? dynamicColor : undefined,
        '--search-placeholder-color': isSearchInput ? (isDarkBg ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)') : undefined,
        '--search-label-color': isSearchInput ? (isDarkBg ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)') : undefined,
        '--search-icon-color': isSearchInput ? (isDarkBg ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)') : undefined,
        '--search-border-color': isSearchInput ? (isDarkBg ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.3)') : undefined,
        '--search-focus-border-color': isSearchInput ? (isDarkBg ? '#ffffff' : 'var(--primary, #3b82f6)') : undefined,
        '--search-label-active-color': isSearchInput ? dynamicColor : '#000000',
      } as React.CSSProperties}
      data-login={isLoginView ? "true" : "false"}
    >
      <input
        id={inputId}
        type={type}
        required={required}
        value={value}
        readOnly={readOnly}
        tabIndex={readOnly ? -1 : undefined}
        inputMode={readOnly ? "none" : (inputMode || (type === 'number' || type === 'tel' ? 'numeric' : undefined))}
        pattern={pattern || (inputMode === 'decimal' ? '[0-9]*[.,]?[0-9]*' : (type === 'number' || type === 'tel' ? '[0-9]*' : undefined))}
        placeholder=" "
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => {
          if (readOnly) {
            const el = document.getElementById(inputId);
            if (el) el.blur();
          } else {
            setIsFocused(true);
          }
        }}
        onBlur={() => setIsFocused(false)}
        className={`peer w-full ${icon ? 'pl-9' : 'pl-3'} ${className?.includes('rounded-') ? '' : 'rounded-lg'} bg-transparent outline-none transition-all h-full text-[12px] ${error ? 'pr-10' : ''}
          ${isSearchInput ? '' : 'placeholder:text-gray-400 focus:placeholder:text-gray-500'}
          ${readOnly ? 'cursor-pointer select-none pointer-events-none' : ''}
        `}
        style={{ 
          color: isSearchInput ? dynamicColor : undefined,
          caretColor: readOnly ? 'transparent' : undefined,
        } as React.CSSProperties}
      />
      {icon && (
        <div className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200`}
             style={{ color: isFocused ? (isSearchInput ? dynamicColor : undefined) : (isSearchInput ? (isDarkBg ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)') : undefined) }}>
          {icon}
        </div>
      )}
      {hasValue && !isSearchInput && !error && type !== 'select' && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded-full bg-green-500 text-white pointer-events-none">
          <Check size={12} strokeWidth={3} />
        </div>
      )}
      <label 
        htmlFor={inputId}
        className={`absolute font-extrabold tracking-wider text-[12px] transition-all duration-700 ease-in-out pointer-events-none z-20 rounded-none origin-left
          ${isFocused || hasValue ? 'left-3 top-0 -translate-y-1/2 scale-[0.83] px-1.5' : `top-1/2 -translate-y-1/2 scale-100 px-0 ${icon ? 'left-9' : 'left-3'}`}
          ${error ? '!text-red-500' : ''}
        `}
        style={{
          color: error ? 'rgb(239, 68, 68)' : undefined,
          backgroundColor: (isFocused || hasValue) ? dynamicBgColor : 'transparent',
        }}
      >
        {label}
      </label>
    </div>
  );
};

export default FloatingInput;
