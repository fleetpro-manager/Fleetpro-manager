import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';

import { Menu, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '@/store';

interface GlobalDateTimePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (value: string) => void;
  type: 'date' | 'time';
  value?: string;
  title?: string;
}

const GlobalDateTimePicker: React.FC<GlobalDateTimePickerProps> = ({
  isOpen,
  onClose,
  onSelect,
  type,
  value,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Date Picker States
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectionStart, setSelectionStart] = useState<Date | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<Date | null>(null);
  const [isRangeMode, setIsRangeMode] = useState(false);

  // Time Picker States
  const [selectedHour, setSelectedHour] = useState('09');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [selectedPeriod, setSelectedPeriod] = useState('AM');
  const [seconds, setSeconds] = useState(new Date().getSeconds());

  const TEAL_COLOR = '#2B7A78';

  useEffect(() => {
    if (isOpen && type === 'time') {
      const updateClock = () => {
        setSeconds(new Date().getSeconds());
      };
      updateClock();
      const tick = setInterval(updateClock, 1000);
      return () => clearInterval(tick);
    }
  }, [isOpen, type]);

  useEffect(() => {
    if (isOpen) {
      if (type === 'date') {
        let date = new Date();
        if (value) {
          if (value.includes(' to ')) {
            const parts = value.split(' to ');
            const date1 = new Date(parts[0]);
            const startLocal = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
            const date2 = new Date(parts[1]);
            const endLocal = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
            setSelectionStart(startLocal);
            setSelectionEnd(endLocal);
            setIsRangeMode(true);
            date = startLocal;
          } else {
            // Check DD-MM-YYYY vs YYYY-MM-DD
            const parts = value.split('-');
            if (parts.length === 3 && parts[1] && parts[2]) {
              if (parts[0].length <= 2) {
                date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
              } else {
                date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
              }
            } else {
              date = new Date(value);
            }
            if (!isNaN(date.getTime())) {
                const startLocal = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                setSelectionStart(startLocal);
                setSelectionEnd(null);
                date = startLocal;
            }
            setIsRangeMode(false);
          }
        } else {
          // Select today's date by default if no value is provided
          const today = new Date();
          const localToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          setSelectionStart(localToday);
          setSelectionEnd(null);
          setIsRangeMode(false);
          date = localToday;
        }
        if (!isNaN(date.getTime())) {
            setCurrentMonth(date.getMonth());
            setCurrentYear(date.getFullYear());
        }
      } else if (type === 'time') {
        const now = new Date();
        let h = now.getHours();
        let m = now.getMinutes();
        let p = h >= 12 ? 'PM' : 'AM';
        
        if (value) {
          const lowerVal = value.toLowerCase();
          if (lowerVal.includes('am') || lowerVal.includes('pm')) {
            const [timeStr, periodStr] = lowerVal.split(' ');
            const [hh, mm] = timeStr.split(':').map(Number);
            if (!isNaN(hh) && !isNaN(mm)) {
                h = hh;
                m = mm;
                p = periodStr.toUpperCase();
            }
          } else {
            const [hh, mm] = value.split(':').map(Number);
            if (!isNaN(hh) && !isNaN(mm)) {
                h = hh;
                m = mm;
                p = h >= 12 ? 'PM' : 'AM';
            }
          }
        }
        const dispH = h % 12 || 12;
        setSelectedHour(dispH.toString().padStart(2, '0'));
        setSelectedMinute(m.toString().padStart(2, '0'));
        setSelectedPeriod(p);
      }
    }
  }, [isOpen, type, value]);

  const daysInMonth = useMemo(() => new Date(currentYear, currentMonth + 1, 0).getDate(), [currentYear, currentMonth]);
  const firstDayOfMonth = useMemo(() => new Date(currentYear, currentMonth, 1).getDay(), [currentYear, currentMonth]);
  
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentYear, currentMonth, day);
    
    if (isRangeMode) {
      if (!selectionStart) {
        setSelectionStart(clickedDate);
        setSelectionEnd(null);
      } else if (selectionStart && !selectionEnd) {
        if (clickedDate < selectionStart) {
          setSelectionEnd(selectionStart);
          setSelectionStart(clickedDate);
        } else {
          setSelectionEnd(clickedDate);
        }
      } else {
        // Both selected, reset to new start
        setSelectionStart(clickedDate);
        setSelectionEnd(null);
      }
    } else {
      // Single Date Selection mode: always clear end date
      setSelectionStart(clickedDate);
      setSelectionEnd(null);
    }
  };

  const isSelected = (day: number) => {
    if (!selectionStart) return false;
    const date = new Date(currentYear, currentMonth, day);
    if (!selectionEnd) return date.getTime() === selectionStart.getTime();
    return date.getTime() === selectionStart.getTime() || date.getTime() === selectionEnd.getTime();
  };

  const isBetween = (day: number) => {
    if (!selectionStart || !selectionEnd) return false;
    const date = new Date(currentYear, currentMonth, day);
    return date > selectionStart && date < selectionEnd;
  };

  const formatDateString = (date: Date) => {
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  };

  const handleDateConfirm = () => {
    if (selectionStart && selectionEnd) {
        onSelect(`${formatDateString(selectionStart)} to ${formatDateString(selectionEnd)}`);
    } else if (selectionStart) {
        onSelect(formatDateString(selectionStart));
    }
    onClose();
  };

  const handleTimeConfirm = () => {
    onSelect(`${selectedHour}:${selectedMinute} ${selectedPeriod}`);
    onClose();
  };

  // Render Days Grid
  const renderCalendar = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);
    const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
      <div className="px-4 py-2">
        <div className="grid grid-cols-7 mb-2">
          {days.map(d => (
            <div key={d} className="text-center text-[11px] font-semibold text-gray-500 uppercase">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-1">
          {blanks.map(b => <div key={`blank-${b}`} className="h-8 md:h-10 text-center" />)}
          {monthDays.map(day => {
            const isStart = selectionStart && new Date(currentYear, currentMonth, day).getTime() === selectionStart.getTime();
            const isEnd = selectionEnd && new Date(currentYear, currentMonth, day).getTime() === selectionEnd.getTime();
            const between = isBetween(day);
            const selected = isSelected(day);

            let bgClass = "bg-transparent";
            let rounding = "rounded-full";
            
            if (between) {
              bgClass = "bg-[#2B7A78]/15";
              rounding = "rounded-none";
            }
            if (selectionEnd && isStart) {
              rounding = "rounded-l-full";
              bgClass = "bg-[#2B7A78]/15";
            }
            if (selectionEnd && isEnd) {
              rounding = "rounded-r-full";
              bgClass = "bg-[#2B7A78]/15";
            }

            return (
              <div key={day} className={`h-8 md:h-10 flex items-center justify-center relative my-0.5 ${bgClass} ${rounding}`}>
                <button
                  type="button"
                  onClick={() => handleDateClick(day)}
                  className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-[13px] font-medium transition-all ${
                    selected 
                      ? 'bg-[#2B7A78] text-white rounded-full shadow-md z-10' 
                      : 'text-gray-700 hover:bg-gray-100 rounded-full z-10'
                  }`}
                >
                  {day.toString().padStart(2, '0')}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDatePicker = () => {
    return (
      <div className="flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <Menu className="w-6 h-6 text-gray-600" />
          <h2 className="text-lg font-bold text-gray-800">Select Date</h2>
          <CalendarIcon className="w-6 h-6 text-orange-500 opacity-90" />
        </div>
        
        {/* Month Selector */}
        <div className="bg-gray-100/70 border-y border-gray-100 flex justify-between items-center px-4 py-2 gap-2">
          <button onClick={handlePrevMonth} className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm border border-gray-200 shrink-0">
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <div className="flex items-center gap-1.5 overflow-hidden">
            <select
              value={currentMonth}
              onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
              className="bg-white text-gray-800 font-bold px-2 py-1 text-[13px] rounded-lg border border-gray-200 outline-none cursor-pointer focus:border-[#2B7A78] hover:bg-gray-50"
              style={{ WebkitAppearance: 'menulist-button' }}
            >
              {[
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
              ].map((m, i) => (
                <option key={i} value={i}>
                  {m}
                </option>
              ))}
            </select>
            <select
              value={currentYear}
              onChange={(e) => setCurrentYear(parseInt(e.target.value))}
              className="bg-white text-gray-800 font-bold px-2 py-1 text-[13px] rounded-lg border border-gray-200 outline-none cursor-pointer focus:border-[#2B7A78] hover:bg-gray-50"
              style={{ WebkitAppearance: 'menulist-button' }}
            >
              {(() => {
                const maxYear = new Date().getFullYear() + 10;
                const minYear = 1920;
                const years = [];
                for (let y = maxYear; y >= minYear; y--) {
                  years.push(y);
                }
                return years.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ));
              })()}
            </select>
          </div>
          <button onClick={handleNextMonth} className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm border border-gray-200 shrink-0">
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="min-h-[260px]">
           {renderCalendar()}
        </div>

        {/* Actions */}
        <div className="px-5 pt-2 pb-5 flex flex-col gap-2">
          <button
            onClick={handleDateConfirm}
            className="w-full py-3.5 bg-[#2B7A78] text-white rounded-xl font-semibold text-[15px] shadow-sm active:scale-[0.98] transition-transform"
          >
            Set Date
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 text-gray-500 font-medium text-[14px] hover:text-gray-700 active:scale-[0.98] transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

  const renderClock = () => {
    let h = parseInt(selectedHour);
    const m = parseInt(selectedMinute);
    // Convert to 12-hour analog representation
    // Hour hand rotates 30 deg per hour, plus 0.5 deg per minute
    const hourDeg = (h % 12) * 30 + m * 0.5;
    // Minute hand rotates 6 deg per minute
    const minuteDeg = m * 6;
    // Ticking seconds
    const secondDeg = seconds * 6;

    return (
      <div className="relative w-[210px] h-[210px] mx-auto my-6 flex items-center justify-center">
        {/* Outer Metallic Steel Bezel with subtle brass accent */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-950 p-[6px] shadow-xl border border-slate-700/50">
          {/* Inner chrome trim line */}
          <div className="w-full h-full rounded-full bg-gradient-to-bl from-slate-800 via-slate-900 to-slate-950 p-[4px] shadow-inner flex items-center justify-center">
            {/* Clock Face Dial */}
            <div className="w-full h-full rounded-full bg-gradient-to-b from-white to-slate-100 relative overflow-hidden shadow-inner flex items-center justify-center">
              {/* Radial gradient glow overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_35%,rgba(255,255,255,0.85)_0%,transparent_60%)] pointer-events-none" />

              {/* 12, 3, 6, 9 Numerals */}
              <span className="absolute top-2.5 text-[12px] font-extrabold text-slate-800 select-none tracking-tight">12</span>
              <span className="absolute right-3.5 text-[12px] font-extrabold text-slate-800 select-none tracking-tight">3</span>
              <span className="absolute bottom-2.5 text-[12px] font-extrabold text-slate-800 select-none tracking-tight">6</span>
              <span className="absolute left-3.5 text-[12px] font-extrabold text-slate-800 select-none tracking-tight">9</span>

              {/* Clock Tick Marks */}
              {Array.from({ length: 12 }).map((_, i) => {
                // Skip 12, 3, 6, 9 ticks since they have numerals
                if (i % 3 === 0) return null;
                return (
                  <div
                    key={i}
                    className="absolute left-[calc(50%-1px)] top-[6px] w-[2px] h-[8px] bg-slate-400 origin-[1px_93px]"
                    style={{ transform: `rotate(${i * 30}deg)` }}
                  />
                );
              })}
              {Array.from({ length: 60 }).map((_, i) => {
                if (i % 5 === 0) return null;
                return (
                  <div
                    key={`m-${i}`}
                    className="absolute left-[calc(50%-0.5px)] top-[6px] w-[1px] h-[4px] bg-slate-300 origin-[0.5px_93px]"
                    style={{ transform: `rotate(${i * 6}deg)` }}
                  />
                );
              })}

              {/* Drop Shadow applied once across all elements */}
              <div className="absolute inset-0 pointer-events-none filter drop-shadow-[0_2.5px_4px_rgba(0,0,0,0.22)]">
                {/* Hour Hand */}
                <div 
                  className="absolute w-[4.5px] h-[52px] bg-slate-900 rounded-full origin-bottom transition-transform duration-250 ease-out"
                  style={{ 
                    left: 'calc(50% - 2.25px)', 
                    top: 'calc(50% - 52px)',
                    transform: `rotate(${hourDeg}deg)` 
                  }}
                >
                  {/* Subtle dial element */}
                  <div className="absolute top-0.5 left-[1.25px] w-0.5 h-3 bg-teal-500 rounded-full opacity-60" />
                </div>
                
                {/* Minute Hand */}
                <div 
                  className="absolute w-[3px] h-[72px] bg-slate-800 rounded-full origin-bottom transition-transform duration-250 ease-out"
                  style={{ 
                    left: 'calc(50% - 1.5px)', 
                    top: 'calc(50% - 72px)',
                    transform: `rotate(${minuteDeg}deg)` 
                  }}
                >
                  <div className="absolute top-1 left-[0.5px] w-[1px] h-4 bg-teal-400 rounded-full opacity-55" />
                </div>

                {/* Ticking Second Hand (Ticking live!) */}
                <div 
                  className="absolute w-[1.5px] h-[84px] bg-red-500 origin-bottom transition-transform duration-150"
                  style={{ 
                    left: 'calc(50% - 0.75px)', 
                    top: 'calc(50% - 84px)',
                    transform: `rotate(${secondDeg}deg)` 
                  }}
                >
                  {/* Lollipop Circle Counterweight Balance */}
                  <div className="absolute -bottom-2.5 -left-[4.25px] w-[10px] h-[10px] bg-red-500 rounded-full" />
                </div>
              </div>
              
              {/* Premium Center Core Wheel Pivot Accent */}
              <div className="absolute w-[14px] h-[14px] rounded-full bg-slate-900 border-2 border-amber-400 flex items-center justify-center shadow-md z-20">
                <div className="w-[4px] h-[4px] rounded-full bg-amber-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTimePicker = () => {
    return (
      <div className="flex flex-col">
        {/* Header */}
        <div className="flex items-center px-5 py-4 border-b border-gray-100">
          <Menu className="w-6 h-6 text-gray-600" />
          <h2 className="flex-1 text-center pr-6 text-lg font-bold text-gray-800">Set Time</h2>
        </div>

        {/* Clock View */}
        {renderClock()}

        {/* Dropdowns */}
        <div className="flex justify-center gap-3 px-5 mb-6">
          <div className="relative">
            <select
              value={selectedHour}
              onChange={(e) => setSelectedHour(e.target.value)}
              className="appearance-none bg-gray-100 text-gray-800 font-medium py-3 pl-4 pr-10 rounded-lg outline-none cursor-pointer border border-transparent focus:border-gray-300"
            >
              {Array.from({ length: 12 }, (_, i) => {
                const val = (i + 1).toString().padStart(2, '0');
                return <option key={`h-${val}`} value={val}>{val}</option>;
              })}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>

          <div className="relative">
            <select
              value={selectedMinute}
              onChange={(e) => setSelectedMinute(e.target.value)}
              className="appearance-none bg-gray-100 text-gray-800 font-medium py-3 pl-4 pr-10 rounded-lg outline-none cursor-pointer border border-transparent focus:border-gray-300"
            >
              {Array.from({ length: 60 }, (_, i) => {
                const val = i.toString().padStart(2, '0');
                return <option key={`m-${val}`} value={val}>{val}</option>;
              })}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>

          <div className="relative">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="appearance-none bg-gray-100 text-gray-800 font-medium py-3 pl-4 pr-10 rounded-lg outline-none cursor-pointer border border-transparent focus:border-gray-300"
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-5 pb-5 flex flex-col gap-2">
          <button
            onClick={handleTimeConfirm}
            className="w-full py-3.5 bg-[#2B7A78] text-white rounded-xl font-semibold text-[15px] shadow-sm active:scale-[0.98] transition-transform"
          >
            Set Time
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 text-gray-500 font-medium text-[14px] hover:text-gray-700 active:scale-[0.98] transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

  if (typeof window === 'undefined') return null;

  return createPortal(
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[9000] flex items-center justify-center p-4 sm:p-6"
        >
          {/* Backdrop */}
          <div 
            
            
            
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={onClose}
          />
          
          {/* Card Container */}
          <div
            
            
            
            
            className="w-full max-w-[340px] bg-white rounded-[24px] shadow-xl overflow-hidden relative z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {type === 'date' ? renderDatePicker() : renderTimePicker()}
          </div>
        </div>
      )}
    </>,
    document.body
  );
};

export default GlobalDateTimePicker;
