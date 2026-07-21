import React, { useRef, useLayoutEffect, useState } from 'react';

interface DynamicTextProps {
  children: React.ReactNode;
  className?: string;
  minSize?: number;
  maxSize?: number;
}

const DynamicText: React.FC<DynamicTextProps> = ({ children, className = '', minSize = 8, maxSize = 12 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [fontSize, setFontSize] = useState(maxSize);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const text = textRef.current;
    if (!container || !text) return;

    const adjMaxSize = isNaN(maxSize) ? 12 : maxSize;
    const adjMinSize = isNaN(minSize) ? 8 : minSize;

    const adjust = () => {
      requestAnimationFrame(() => {
        if (!container || !text) return;
        // Start at max size to check if it fits
        let current = adjMaxSize;
        text.style.fontSize = `${current}px`;
        
        const containerWidth = container.getBoundingClientRect().width;
        
        // If container is hidden or not laid out, skip
        if (containerWidth <= 0) return;

        // Decrease until it fits
        while (current > adjMinSize && text.getBoundingClientRect().width > containerWidth) {
          current -= 0.5;
          text.style.fontSize = `${current}px`;
        }
        
        setFontSize(current);
      });
    };

    // Initial adjustment
    adjust();
    
    // Adjust on resize
    const observer = new ResizeObserver(adjust);
    observer.observe(container);
    
    return () => observer.disconnect();
  }, [children, minSize, maxSize, className]);

  return (
    <div 
      ref={containerRef} 
      className={`w-full flex justify-center overflow-hidden ${className}`}
      style={{ maxWidth: '100%' }}
    >
      <span 
        ref={textRef} 
        style={{ 
          fontSize: `${fontSize}px`,
          whiteSpace: 'nowrap',
          display: 'inline-block',

        }}
      >
        { (typeof children === 'number' && isNaN(children)) ? "0" : children }
      </span>
    </div>
  );
};

export default DynamicText;
