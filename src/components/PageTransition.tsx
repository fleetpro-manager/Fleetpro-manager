import React from 'react';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  direction?: 'forward' | 'backward' | 'subpage' | 'none';
  isDashboard?: boolean;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ 
  children, 
  className = "w-full h-full flex flex-col",
  style,
}) => {
  const isAbsolute = className?.includes('absolute') || style?.position === 'absolute';

  return (
    <div
      className={className}
      style={{
        backfaceVisibility: 'hidden',
        WebkitFontSmoothing: 'subpixel-antialiased',
        ...(isAbsolute ? {
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        } : {}),
        ...style
      }}
    >
      {children}
    </div>
  );
};

export default PageTransition;
