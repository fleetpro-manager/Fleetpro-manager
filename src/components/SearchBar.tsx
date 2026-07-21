
import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { useStore } from '../store';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ placeholder = "Search...", value, onChange }) => {
  const { theme, backgroundColor, wallpaper, appThemeMode } = useStore();
  const [isFocused, setIsFocused] = useState(false);
  const [dynamicColor, setDynamicColor] = useState('#ffffff');
  const [isDarkBg, setIsDarkBg] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const hasValue = value !== undefined && value !== null && value.toString().length > 0;

  useEffect(() => {
    let active = true;
    const calculateColor = () => {
      if (!active || !containerRef.current) return;
      
      let bg = 'rgba(0,0,0,0)';
      
      // 1. Check custom background state from store
      if (backgroundColor && backgroundColor.trim() !== '' && backgroundColor !== 'transparent') {
        bg = backgroundColor;
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
          return 0; // default to dark
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
        return 0; // Default to dark background (safe fallback: white text)
      };

      const luminance = getLuminance(bg);
      const dark = luminance < 0.5;

      setIsDarkBg(dark);
      setDynamicColor(dark ? '#ffffff' : '#000000');
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
  }, [backgroundColor, wallpaper, value]);

  const labelColor = isDarkBg 
    ? (isFocused ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.4)') 
    : (isFocused ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)');

  return (
    <div ref={containerRef} className="relative w-full mt-6 mb-6 group">
      {/* Floating Label */}
      <label 
        className={`absolute left-10 transition-all duration-300 pointer-events-none font-black uppercase tracking-widest z-10 px-1
          ${(isFocused || hasValue) 
            ? 'top-1 left-12 text-[10px]' 
            : 'top-1/2 -translate-y-1/2 text-sm'
          }`}
        style={{ color: labelColor }}
      >
        {placeholder}
      </label>

      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
        <Search 
          size={22} 
          className="transition-colors" 
          style={{ color: isFocused ? (isDarkBg ? '#22d3ee' : '#0891b2') : (isDarkBg ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)') }}
        />
      </div>
      <input
        type="text"
        value={value}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onChange={(e) => onChange?.(e.target.value)}
        className={`block w-full h-14 pl-12 pr-4 pt-5 pb-1 rounded-lg transition-all duration-300 shadow-sm font-bold text-base outline-none
          ${isFocused 
            ? 'border-cyan-500' 
            : 'border-[var(--search-border-color)]'
          }
        `}
        style={{ 
          backgroundColor: 'var(--app-bg)', 
          backgroundAttachment: 'fixed',
          color: dynamicColor,
          '--search-text-color': dynamicColor,
          '--search-placeholder-color': 'var(--text-muted, rgba(128,128,128,0.6))',
          '--search-label-color': labelColor,
          '--search-icon-color': 'var(--text-main, rgba(128,128,128,0.8))',
          '--search-border-color': 'var(--text-muted, rgba(128,128,128,0.5))',
          '--search-focus-border-color': '#06b6d4',
          borderWidth: '1.5px',
          borderStyle: 'solid'
        } as React.CSSProperties}
      />
    </div>
  );
};

export default SearchBar;
