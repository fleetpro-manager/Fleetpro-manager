import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, 
  ChevronLeft, 
  Search, 
  Home, 
  Bell, 
  Moon, 
  Sun 
} from 'lucide-react';

import { useStore } from '../store';
import { TRANSLATIONS, THEMES } from '../constants';
import { getContrastColor } from '../utils/colorUtils';

const toTitleCase = (str: string | undefined | null): string => {
  if (!str) return '';
  const trimStr = String(str).trim();
  return trimStr.split(/\s+/).map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
};

const PageHeader: React.FC = () => {
  const store = useStore();
  const isPresent = true;
  const frozenState = useRef<any>(null);

  const [overrideTitle, setOverrideTitle] = useState<string | null>(null);

  useEffect(() => {
    setOverrideTitle(null);
  }, [store.currentView, store.activeSection, store.activeDetailView]);

  useEffect(() => {
    const handleTitleChange = (e: Event) => {
      setOverrideTitle((e as CustomEvent).detail);
    };
    window.addEventListener('change-title', handleTitleChange);
    return () => window.removeEventListener('change-title', handleTitleChange);
  }, []);

  if (isPresent || !frozenState.current) {
    frozenState.current = {
      currentView: store.currentView,
      setView: store.setView,
      goBack: store.goBack,
      user: store.user,
      language: store.language,
      activeSection: store.activeSection,
      activeDetailView: store.activeDetailView,
      showReceivedBreakdown: store.showReceivedBreakdown,
      showPendingBreakdown: store.showPendingBreakdown,
      notifications: store.notifications,
      selectedNotification: store.selectedNotification,
      customHeaderTitle: store.customHeaderTitle,
      customBackAction: store.customBackAction,
      appThemeMode: store.appThemeMode,
      setAppThemeMode: store.setAppThemeMode,
      headerBg: store.headerBg,
      theme: store.theme,
      backgroundColor: store.backgroundColor,
      wallpaper: store.wallpaper,
      isDrawerOpen: store.isDrawerOpen,
      setIsDrawerOpen: store.setIsDrawerOpen,
      selectedUser: store.selectedUser,
      editingTrip: store.editingTrip,
      isEntryFormOpen: store.isEntryFormOpen
    };
  }

  const { 
    currentView, setView, goBack, user, language,
    activeSection, activeDetailView,
    showReceivedBreakdown, showPendingBreakdown,
    notifications, selectedNotification,
    customHeaderTitle, customBackAction,
    appThemeMode, setAppThemeMode,
    headerBg, theme, backgroundColor, wallpaper,
    isDrawerOpen, setIsDrawerOpen,
    selectedUser, editingTrip, isEntryFormOpen
  } = frozenState.current;

  const handleBackClick = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (customBackAction) {
      customBackAction();
      return;
    }
    if (overrideTitle) {
      window.dispatchEvent(new CustomEvent('close-permissions-overlay'));
      return;
    }
    goBack();
  };

  const isFirstLoginRequired = user?.isFirstLogin;
  const t = TRANSLATIONS[language];
  const currentThemeObj = THEMES.find(t => t.id === theme) || THEMES[0];

  const isDarkMode = theme === 'night-mode' || appThemeMode === 'dark';
  const isCustomBg = !isDarkMode && backgroundColor && backgroundColor !== '#F3F4F6';
  const activePrimaryColor = currentThemeObj.primary || '#3b82f6';

  const effectiveHeaderBg = 
    isDarkMode
      ? '#000000'
      : (headerBg && headerBg !== '#2563EB'
          ? headerBg
          : (isCustomBg 
              ? backgroundColor 
              : (headerBg || activePrimaryColor || '#2563EB')));

  const headerTextColor = getContrastColor(effectiveHeaderBg);
  const isAdmin = user?.role === 'ADMIN';
  const unreadCount = (notifications || []).filter(n => !n.isRead).length;

  const getTitle = () => {
    if (isFirstLoginRequired) return 'SET_NEW_PASSWORD';
    if (currentView === 'USER_PROFILE') {
      const displayUser = selectedUser || user;
      const isViewingSelf = !selectedUser || selectedUser.id === user?.id;
      if (isViewingSelf) return 'MY_PROFILE';
      return displayUser?.role === 'ADMIN' ? 'ADMIN_PROFILE' : 'USER_PROFILE';
    }
    if (currentView === 'ADMIN_PROFILE_UPDATE') {
      const targetUser = (user?.role === 'ADMIN' && selectedUser) ? selectedUser : user;
      return targetUser?.id === user?.id ? 'ADMIN_EDIT_SELF_PROFILE' : 'USER_EDIT_OTHER_PROFILE';
    }
    if (currentView === 'NEW_TRIP' && editingTrip) {
      return 'EDIT_TRIP';
    }
    if (currentView === 'USER_RENEW') {
      return 'ACCOUNT_EXPIRED';
    }
    const isPendingIncome = localStorage.getItem('pendingAction') === 'ADD_INCOME';
    if (currentView === 'PAYMENT' && (isEntryFormOpen || isPendingIncome)) {
      return "New Transaction";
    }
    return currentView;
  };

  const title = getTitle();

  const isMainPage = (currentView === 'DASHBOARD' || !currentView || isFirstLoginRequired) && !selectedNotification && !activeDetailView && !activeSection && !showReceivedBreakdown && !showPendingBreakdown && !overrideTitle && !customHeaderTitle;

  return (
    <header 
      className="z-[100] w-full shadow-sm transition-colors flex flex-col safe-top shrink-0"
      style={{ 
        borderBottom: '1px solid rgba(0,0,0,0.05)',
        background: wallpaper ? `url(${wallpaper}) center/cover no-repeat fixed` : effectiveHeaderBg
      }}
    >
      <div className="h-16 flex items-center justify-between px-4 sm:px-6 md:px-8 lg:px-12 w-full gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {isMainPage ? (
            <button 
              onClick={() => !isFirstLoginRequired && setIsDrawerOpen(true)}
              className={`lg:hidden p-2 rounded-lg transition-colors shrink-0 ${isFirstLoginRequired ? 'opacity-0 pointer-events-none' : ''}`}
              style={{ color: headerTextColor }}
            >
              <Menu size={24} />
            </button>
          ) : !isFirstLoginRequired ? (
            <button 
              onClick={(e) => handleBackClick(e)}
              className="p-2 rounded-lg transition-colors flex items-center gap-1 cursor-pointer shrink-0"
              style={{ color: headerTextColor }}
            >
              <ChevronLeft size={24} />
            </button>
          ) : null}
          <h1 className="text-lg lg:text-xl font-black tracking-widest truncate" style={{ color: headerTextColor }}>
            {customHeaderTitle ? customHeaderTitle : overrideTitle ? overrideTitle : toTitleCase((() => {
              if (selectedNotification) return 'Notification Detail';
              if (showReceivedBreakdown) return 'Received breakdown';
              if (showPendingBreakdown) return 'Pending breakdown';
              if (activeDetailView === 'NEW') return t.NEW_PROFILE;
              if (activeSection) {
                if (activeSection === 'PAYMENT') {
                  return 'Payment Method';
                }
                if (activeSection === 'FULL_PROFILE') return 'Personal Details';
                if (activeSection === 'SUBSCRIPTION') return language === 'bn' ? 'সাবস্ক্রিপশন ডিটেলস' : 'Subscription Details';
                if (activeSection === 'BALANCE_SUBPAGE') return 'Available Balance';
                if (activeSection === 'DEPOSIT_SUBPAGE') return 'Total Deposit';
                if (activeSection === 'LINK_USER') return language === 'bn' ? 'ইউজার লিঙ্ক করুন' : 'Link User';
                if (activeSection === 'BIOMETRICS') return language === 'bn' ? 'বায়োমেট্রিক সিকিউরিটি' : 'Biometric Security';
                if (activeSection === 'INCOME' || activeSection === 'DEDUCTION') return t.MY_INCOME || 'My Income';
                return t[activeSection] || activeSection.split('_').join(' ');
              }
              if (activeDetailView) {
                return currentView === 'PROFILES' ? 'Profile details' : 'Details';
              }
              if (title === 'ADMIN_PROFILE') return t.ADMIN_PROFILE;
              if (title === 'USER_PROFILE') return t.USER_PROFILE;
              if (title === 'MY_PROFILE') return t.MY_PROFILE;
              if (title === 'CONTROL_PANEL') return t.CONTROL_PANEL;
              if (title === 'EDIT_TRIP') return t.EDIT_TRIP;
              if (title === 'SETTINGS') return t.SETTINGS || 'Settings';
              if (title === 'SET_NEW_PASSWORD') return language === 'bn' ? 'নতুন পাসওয়ার্ড সেট করুন' : 'Set New Password';
              if (title === 'MONTHLY_FILE_DETAILS') return t.MONTHLY_FILES;
              if (title === 'TRIP_DETAILS') return language === 'bn' ? 'ট্রিপ ডিটেইলস' : 'Trip Details';
              if (title === 'NEW_PURCHASE') return language === 'bn' ? 'নতুন পারচেস' : (language === 'ar' ? 'شراء جديد' : 'New Purchase');
              return t[title] || title;
            })())}
          </h1>
        </div>

        <div className="flex items-center gap-2 lg:gap-4 shrink-0">
          {/* Desktop Quick Search */}
          {isAdmin && (
            <div className="hidden lg:flex items-center border rounded-lg px-3 py-1.5 gap-2 w-64 shadow-sm quick-search-container" style={{ borderColor: headerTextColor === '#ffffff' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }}>
              <Search size={16} style={{ color: headerTextColor, opacity: 0.7 }} />
              <input 
                type="text" 
                placeholder="Quick Search..." 
                className="bg-transparent border-none outline-none text-xs w-full quick-search-input animate-none"
                style={{ color: headerTextColor } as React.CSSProperties}
                onFocus={() => setView('SEARCH')}
              />
              <style>{`
                .quick-search-input::placeholder {
                  color: ${headerTextColor};
                  opacity: 0.5;
                }
              `}</style>
            </div>
          )}

          {/* Desktop Quick Actions */}
          <div className="hidden md:flex items-center gap-2 mr-2" style={{ color: headerTextColor }}>
            <span className="text-[10px] font-black tracking-widest opacity-50 mr-2">Quick access</span>
            <button onClick={() => setView('DASHBOARD')} className={`p-2 rounded-lg transition-all ${currentView === 'DASHBOARD' ? 'text-white font-bold' : 'hover:bg-black/5 dark:hover:bg-white/5'}`} style={currentView === 'DASHBOARD' ? { background: 'var(--primary)' } : {}}><Home size={18} /></button>
            {isAdmin && (
              <button onClick={() => setView('SEARCH')} className={`p-2 rounded-lg transition-all ${currentView === 'SEARCH' ? 'text-white font-bold' : 'hover:bg-black/5 dark:hover:bg-white/5'}`} style={currentView === 'SEARCH' ? { background: 'var(--primary)' } : {}}><Search size={18} /></button>
            )}
          </div>

          {/* Notification Bell */}
          <div className="relative">
            <button 
              onClick={() => setView('NOTIFICATIONS')}
              className="p-2 rounded-lg transition-all opacity-70 relative"
              style={{ color: headerTextColor }}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold px-1 min-w-[16px] h-4 rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          <button 
            onClick={() => {
              if (appThemeMode === 'light') {
                setAppThemeMode('dark');
              } else {
                setAppThemeMode('light');
              }
            }}
            className="p-2 rounded-lg transition-all opacity-70"
            style={{ color: headerTextColor }}
            title="Toggle Theme Mode"
          >
            {appThemeMode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default PageHeader;
