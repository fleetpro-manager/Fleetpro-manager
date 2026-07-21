import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

import { User as UserIcon, Shield, ChevronLeft, CreditCard, Calendar, Zap, UserCheck } from 'lucide-react';
import { useStore } from '../store';
import { APP_MODULES, THEMES } from '@/constants';

const UserProfileModal: React.FC = () => {
  const { selectedUser, setSelectedUser, theme, backgroundColor, wallpaper, appThemeMode, isDarkMode: storeIsDarkMode, selectedCurrency } = useStore();

  const isDarkMode = storeIsDarkMode || theme === 'night-mode' || appThemeMode === 'dark';
  const isLightWhite = appThemeMode === 'light';
  const hasCustomBackground = !!(backgroundColor || wallpaper);

  const appBgStyle = {
    background: wallpaper 
      ? `url(${wallpaper}) center/cover no-repeat fixed` 
      : (backgroundColor || 'var(--app-bg)'),
  };

  // Close on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedUser(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [setSelectedUser]);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (selectedUser) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedUser]);

  return (
    <>
      {selectedUser && createPortal(
        <div 
          className="fixed inset-0 z-[5000] flex items-end sm:items-center justify-center sm:p-4 pb-[60px] sm:pb-4"
          style={{ background: wallpaper ? `url(${wallpaper}) center/cover no-repeat fixed` : (backgroundColor || 'var(--theme-bg)') }}
        >
          {/* Backdrop with elegant iOS-style blur */}
          <div
            
            
            
            
            onClick={() => setSelectedUser(null)}
            className="absolute inset-0 bg-black/45 backdrop-blur-[5px]"
          />

          {/* Modal Content */}
          <div
            
            
            
            
            className={`relative w-full max-w-lg rounded-t-lg sm:rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] global-select-modal ${isDarkMode ? 'dark' : ''}`}
            style={{ background: '#ffffff' }}
          >
            {/* Inner Wrapper for Blur */}
            <div 
              className="absolute inset-0 z-0"
              style={{
                backgroundColor: isDarkMode ? 'rgba(17, 24, 39, 0.7)' : 'transparent',
                backdropFilter: isDarkMode ? 'blur(16px)' : 'none',
                WebkitBackdropFilter: isDarkMode ? 'blur(16px)' : 'none'
              }}
            />

            {/* Header */}
            <div className="flex items-center justify-between px-2 py-6 bg-transparent relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                  <UserIcon size={24} />
                </div>
                <div>
                  <h3 className={`text-lg font-black uppercase tracking-tight text-text-main`}>User Details</h3>
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${isLightWhite ? 'text-gray-600' : 'text-text-muted'}`}>Profile Overview</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 rounded-full text-gray-400 transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-2 py-6 space-y-6 relative z-10">
              {/* Profile Card */}
              <div className={`${isLightWhite ? 'bg-white shadow-sm' : 'bg-white/5 shadow-sm'} rounded-[8px] p-5 space-y-4`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <UserCheck size={18} />
                  </div>
                  <h4 className={`font-black text-xs uppercase tracking-wider text-text-main`}>General Information</h4>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[9px] text-gray-400 font-bold uppercase mb-1">Full Name</p>
                    <p className={`text-sm font-bold text-text-main`}>{selectedUser.name}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-gray-400 font-bold uppercase mb-1">User ID</p>
                    <p className={`text-sm font-bold text-text-main`}>{selectedUser.id}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[9px] text-gray-400 font-bold uppercase mb-1">Email Address</p>
                    <p className={`text-sm font-bold text-text-main`}>{selectedUser.email}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-gray-400 font-bold uppercase mb-1">Account Role</p>
                    <span className="inline-block px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-[10px] font-bold uppercase">
                      {selectedUser.role}
                    </span>
                  </div>
                  <div>
                    <p className="text-[9px] text-gray-400 font-bold uppercase mb-1">Status</p>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${selectedUser.status === 'ENABLED' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                      }`}>
                      {selectedUser.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Subscription Card */}
              <div className={`${isLightWhite ? 'bg-white shadow-sm' : 'bg-white/5 shadow-sm'} rounded-lg p-5 space-y-4`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                    <Zap size={18} />
                  </div>
                  <h4 className={`font-black text-xs uppercase tracking-wider text-text-main`}>Subscription Info</h4>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[9px] text-gray-400 font-bold uppercase mb-1">Plan Duration</p>
                    <p className={`text-sm font-bold text-text-main`}>{selectedUser.duration || '1 Month'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-gray-400 font-bold uppercase mb-1">Package Price</p>
                    <p className={`text-sm font-bold text-text-main`}>{selectedUser.price ? `${selectedUser.price} ${selectedCurrency}` : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-gray-400 font-bold uppercase mb-1">Last Renewal</p>
                    <div className={`flex items-center gap-1.5 text-text-main`}>
                      <Calendar size={14} className="text-gray-400" />
                      <p className="text-sm font-bold">24 Feb 2024</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] text-gray-400 font-bold uppercase mb-1">Next Renewal</p>
                    <div className="flex items-center gap-1.5 text-red-500">
                      <Calendar size={14} className="text-red-400" />
                      <p className="text-sm font-bold">24 Mar 2024</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Card */}
              <div className={`${isLightWhite ? 'bg-white shadow-sm' : 'bg-white/5 shadow-sm'} rounded-lg p-5 space-y-4`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
                    <CreditCard size={18} />
                  </div>
                  <h4 className={`font-black text-xs uppercase tracking-wider text-text-main`}>Payment Details</h4>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <div>
                      <p className="text-[9px] text-gray-400 font-bold uppercase">Last Payment Date</p>
                      <p className={`text-sm font-bold text-text-main`}>20 Feb 2024</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] text-gray-400 font-bold uppercase">Amount</p>
                      <p className="text-sm font-black text-green-500">500 {selectedCurrency}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <div>
                      <p className="text-[9px] text-gray-400 font-bold uppercase">Payment Method</p>
                      <p className={`text-sm font-bold text-text-main`}>bKash Personal</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] text-gray-400 font-bold uppercase">Status</p>
                      <span className="text-[10px] font-black text-green-500 uppercase">Paid</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Permissions Card */}
              <div className={`${isLightWhite ? 'bg-white shadow-sm' : 'bg-white/5 shadow-sm'} rounded-lg p-5 space-y-4`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                    <Shield size={18} />
                  </div>
                  <h4 className={`font-black text-xs uppercase tracking-wider text-text-main`}>Access Permissions</h4>
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedUser.permissions?.length > 0 ? (
                    selectedUser.permissions.map((perm: string) => {
                      const module = APP_MODULES.find(m => m.id === perm);
                      return (
                        <span key={perm} className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase ${isLightWhite ? 'bg-gray-100 text-text-muted' : 'bg-gray-100 dark:bg-white/5 text-text-muted'}`}>
                          {module ? module.label : perm}
                        </span>
                      );
                    })
                  ) : (
                    <p className="text-xs text-gray-400 font-bold uppercase italic">No special permissions</p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-2 py-6 bg-transparent relative z-10">
              <button
                onClick={() => setSelectedUser(null)}
                className={`w-full h-11 font-black rounded-lg active:scale-95 transition-all uppercase tracking-widest text-xs bg-gray-100 dark:bg-white/5 text-text-main hover:bg-gray-200 dark:hover:bg-white/10`}
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default UserProfileModal;
