import React, { useState, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';

import GlobalFullscreenSelect from '@/components/GlobalFullscreenSelect';
import { useStore } from '@/store';

interface CountryCodeDropdownProps {
  selectedCode: string;
  onSelect: (dialCode: string) => void;
  error?: boolean;
}

const CountryCodeDropdown: React.FC<CountryCodeDropdownProps> = ({ selectedCode, onSelect, error }) => {
  const { appThemeMode, currentView, countries } = useStore();
  const isLightWhite = appThemeMode === 'light';
  const isLoginView = currentView === 'LOGIN' || currentView === 'SIGNUP';
  const [isOpen, setIsOpen] = useState(false);
  const currentCountry = useMemo(() => 
    countries.find(c => c.code === selectedCode), 
    [countries, selectedCode]
  );

  const shakeVariants = {
    shake: {
      x: [0, -5, 5, -5, 5, 0],
      transition: { duration: 0 }
    }
  };

  const options = countries.map(c => ({
    label: c.code,
    value: c.code,
    icon: c.flag,
    subLabel: c.name
  }));

  return (
    <div 
      
      
      className={`input-field-container relative group transition-all duration-300 rounded-lg border w-24 flex-shrink-0 h-14 ${isOpen ? 'z-50' : 'z-20'}`}
      data-login={isLoginView ? "true" : "false"}
      style={{ 
        backgroundColor: error 
          ? (isLightWhite ? '#fee2e2' : '#450a0a') 
          : 'transparent',
        borderWidth: '1px',
        borderColor: error ? 'rgb(239, 68, 68)' : (isOpen ? 'var(--primary)' : (isLoginView ? 'rgba(0, 0, 0, 0.4)' : 'var(--input-border-color)'))
      }}
    >
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="country-code-btn relative flex items-center justify-between w-full h-full px-3 pt-4 pb-1 rounded-lg text-sm bg-transparent text-text-main focus:outline-none transition-shadow"
      >
        <label
          className={`absolute font-normal tracking-wider transition-all duration-200 pointer-events-none z-10 left-3
            ${isOpen || selectedCode ? 'top-[4px] text-[10px]' : 'top-1/2 -translate-y-1/2 text-sm'}
          `}
          style={{
            color: error ? 'rgb(239, 68, 68)' : (isOpen || selectedCode ? 'var(--primary)' : 'var(--text-muted, #6b7280)')
          }}
        >
          Code
        </label>
        <div className="flex items-center justify-start w-full">
          <span className={`font-medium text-text-main`}>{selectedCode}</span>
        </div>
        <ChevronDown size={16} className="text-text-muted" />
      </button>

      <GlobalFullscreenSelect
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Select Country Code"
        options={options}
        onSelect={(val) => {
          onSelect(val);
          setIsOpen(false);
        }}
        selectedValue={selectedCode}
      />
    </div>
  );
};

export default CountryCodeDropdown;
