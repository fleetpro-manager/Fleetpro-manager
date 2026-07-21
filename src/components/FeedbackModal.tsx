
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { Check, AlertCircle } from 'lucide-react';
import { useStore } from '@/store';
import { THEMES } from '@/constants';
import { getContrastColor } from '@/utils/colorUtils';

const FeedbackModal: React.FC = () => {
  const { isFeedbackOpen, feedbackMessage, feedbackType, setIsFeedbackOpen, theme, backgroundColor, wallpaper, appThemeMode, isNightMode, isDarkMode: storeIsDarkMode, language, primaryColor } = useStore();
  const [showCheck, setShowCheck] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [isRotating, setIsRotating] = useState(false);

  const isDarkMode = storeIsDarkMode || theme === 'night-mode' || isNightMode || appThemeMode === 'dark';
  const isLightWhite = appThemeMode === 'light' && !isNightMode;
  const hasCustomBackground = !!(backgroundColor || wallpaper);

  const effectiveBg = wallpaper 
    ? '#000000' // Assume dark for wallpaper for safety or use a default
    : (isLightWhite ? '#ffffff' : (backgroundColor || '#000000'));

  const textColor = getContrastColor(effectiveBg);

  const modalStyle = {
    color: isDarkMode ? '#ffffff' : '#000000'
  } as React.CSSProperties;

  useEffect(() => {
    if (isFeedbackOpen) {
      // Disable scroll
      document.body.style.overflow = 'hidden';
      
      const isError = feedbackType === 'error' || feedbackType === 'warning' || (/error|failed|too large|full|invalid|incorrect|required|fill|expired/i.test(feedbackMessage) && !/success/i.test(feedbackMessage));
      
      if (!isError) {
        setShowCheck(false);
        setShowWarning(false);
        setIsRotating(true);
        // Rotate for 0.8 seconds then show check
        const timer = setTimeout(() => {
          setIsRotating(false);
          setShowCheck(true);
        }, 850);
        return () => {
          document.body.style.overflow = 'unset';
          clearTimeout(timer);
        };
      } else {
        setShowCheck(false);
        setShowWarning(true);
        setIsRotating(false);
      }

      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isFeedbackOpen, feedbackMessage, feedbackType]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <>
      {isFeedbackOpen && (
        <div 
          className="fixed inset-0 z-[5000] flex items-center justify-center p-4 pointer-events-none font-sans select-none"
        >
          {/* iOS Dimmer Overlay Background */}
          <div
            
            
            
            
            className="absolute inset-0 pointer-events-auto bg-black/15 dark:bg-black/35 backdrop-blur-[3px]"
            onClick={() => setIsFeedbackOpen(false)}
          />
          
          {/* iOS Authentic Square HUD Card */}
          <div
            
            
            
            
            className={`relative p-6 flex flex-col items-center justify-center w-[250px] min-h-[170px] pointer-events-auto z-[9995] rounded-[24px] shadow-[0_12px_38px_rgba(0,0,0,0.18)] border border-black/5 dark:border-white/10 allow-animation ${
              isDarkMode 
                ? 'bg-[#1c1c1e]/85 text-white' 
                : 'bg-[#f2f2f7]/85 text-black'
            } backdrop-blur-[24px]`}
            style={modalStyle}
          >

            {/* Success/Error Animation Container */}
            <div className="relative w-16 h-16 mb-4 flex items-center justify-center allow-animation">
              {/* Rotating Progress Ring (Before Check) */}
              <>
                {isRotating && (
                  <div
                    key="rotating-ring"
                    className="absolute inset-0 flex items-center justify-center"
                    
                    
                    exit={{ opacity: 0, scale: 1.1, transition: { duration: 0.15 } }}
                  >
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      {/* Background Track */}
                      <circle
                        cx="50"
                        cy="50"
                        r="44"
                        fill="none"
                        stroke={isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)'}
                        strokeWidth="8"
                      />
                      {/* Animated Progress Ring with Rotation */}
                      <circle
                        cx="50"
                        cy="50"
                        r="44"
                        fill="none"
                        stroke="#34C759"
                        strokeWidth="8"
                        strokeLinecap="round"
                        
                        
                        
                      />
                    </svg>
                  </div>
                )}
              </>
              
              {/* Check Mark with Drawing Animation (Success State) */}
              <>
                {showCheck && (
                  <div
                    key="check-mark"
                    
                    
                    
                    className="relative flex items-center justify-center w-full h-full"
                  >
                    {/* Filled Circle Background with Soft Glow */}
                    <div 
                      
                      
                      
                      className="absolute inset-0 bg-[#34C759] dark:bg-[#30d158] rounded-full shadow-[0_4px_16px_rgba(52,199,89,0.35)]"
                    />
                    
                    {/* Tick Mark SVG */}
                    <svg 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      className="w-8 h-8 text-white relative z-10"
                      stroke="currentColor" 
                      strokeWidth="3.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path
                        d="M4.5 12.5L9.5 17.5L19.5 7.5"
                        
                        
                        
                      />
                    </svg>
                  </div>
                )}
              </>

              {/* Error/Warning Icon (Error State) */}
              <>
                {(!isRotating && !showCheck && showWarning) && (
                  <div
                    key="error-mark"
                    
                    
                    
                    className="relative flex items-center justify-center w-full h-full"
                  >
                    <div 
                      
                      
                      className="absolute inset-0 bg-[#FF3B30] dark:bg-[#ff453a] rounded-full shadow-[0_4px_16px_rgba(255,59,48,0.35)]"
                    />
                    <AlertCircle size={32} className="text-white relative z-10" strokeWidth={3} />
                  </div>
                )}
              </>
            </div>

            {/* Message Text */}
            <h3
              
              
              
              className={`text-[14px] font-semibold text-center leading-snug px-1 tracking-tight ${
                isDarkMode ? 'text-white' : 'text-black'
              }`}
            >
              {feedbackMessage || 'Success!'}
            </h3>
            
            <p
              
              
              
              className={`text-[9px] text-center uppercase font-bold tracking-widest mt-1 opacity-60 ${
                isDarkMode ? 'text-neutral-400' : 'text-neutral-500'
              }`}
            >
              {showWarning ? (language === 'bn' ? 'আবার চেষ্টা করুন' : 'Try again') : (language === 'bn' ? 'সম্পন্ন হয়েছে' : 'Done')}
            </p>

          </div>
        </div>
      )}
    </>,
    document.body
  );
};

export default FeedbackModal;
