import React, { useState } from 'react';
import { useStore } from '../store';
import { ChevronDown } from 'lucide-react';
import GlobalFullscreenSelect from './GlobalFullscreenSelect';

interface Option {
  label: string;
  value: string;
  icon?: string;
  subLabel?: string;
  key?: string;
}

interface FullScreenDropdownProps {
  label?: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  renderOption?: (option: Option) => React.ReactNode;
  renderValue?: (option: Option) => React.ReactNode;
}

const FullScreenDropdown: React.FC<FullScreenDropdownProps> = ({
  label,
  value,
  options,
  onChange,
  placeholder = "Select option",
  renderValue
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <>
      <div className="relative w-full">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-full h-11 rounded-lg bg-theme-card px-3 flex items-center justify-between outline-none transition-all duration-300 focus:ring-4 focus:ring-green-500/20 shadow-lg shadow-green-500/10"
        >
          <div className="flex-1 text-left relative h-full flex items-center overflow-hidden">
            {label && (
              <span className={`absolute left-0 transition-all duration-200 pointer-events-none font-bold uppercase tracking-wider ${
                value 
                  ? 'top-2 text-[12px] text-text-main' 
                  : 'top-1/2 -translate-y-1/2 text-sm text-text-main'
              }`}>
                {label}
              </span>
            )}
            
            {selectedOption ? (
              <div className={`w-full ${label ? 'pt-4' : ''}`}>
                {renderValue ? renderValue(selectedOption) : (
                  <div className="flex items-center gap-3">
                    {selectedOption.icon && <span className="text-2xl">{selectedOption.icon}</span>}
                    <div className="flex flex-col items-start truncate">
                      <span className="font-bold text-sm text-text-main truncate">{selectedOption.label}</span>
                      {selectedOption.subLabel && <span className="text-[10px] text-text-muted font-bold truncate">{selectedOption.subLabel}</span>}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              !label && <span className="text-text-muted font-bold text-sm">{placeholder}</span>
            )}
          </div>
          <ChevronDown size={20} className="text-text-muted flex-shrink-0 ml-2" />
        </button>
      </div>

      <GlobalFullscreenSelect
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSelect={onChange}
        options={options}
        title={label || placeholder}
        selectedValue={value}
      />
    </>
  );
};

export default FullScreenDropdown;
