
import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';

import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { Camera } from '@capacitor/camera';
import { Filesystem } from '@capacitor/filesystem';
import { App as CapacitorApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { useStore, StoreProvider, GLOBAL_TRANSITION, GLOBAL_VARIANTS } from '@/store';
import { ShoppingCart, Wallet as WalletIcon } from 'lucide-react';
import { getContrastColor } from './utils/colorUtils';
import Layout from '@/components/Layout';
import PageHeader from '@/components/PageHeader';
import { THEMES, TRANSLATIONS } from '@/constants';
import Dashboard from '@/views/Dashboard';
import Profiles from '@/views/Profiles';
import Trips from '@/views/Trips';
import NewTrip from '@/views/NewTrip';
import Login from '@/views/Login';
import Settings from '@/views/Settings';
import UserProfile from '@/views/UserProfile';
import UserFilesList from '@/views/UserFilesList';
import Search from '@/views/Search';
import NewAccount from '@/views/NewAccount';
import ActiveUser from '@/views/ActiveUser';
import BlockList from '@/views/BlockList';
import UserAccounts from '@/views/UserAccounts';
import MonthlyFiles from '@/views/MonthlyFiles';
import AdminProfileUpdate from '@/views/AdminProfileUpdate';
import AdminPendingUsers from '@/components/AdminPendingUsers';
import Support from '@/views/Support';
import PrayerTimes from '@/views/PrayerTimes';
import ControlPanel from '@/views/ControlPanel';
import ResetBreakdownView from '@/views/ResetBreakdownView';
import UserAccountResetView from '@/views/UserAccountResetView';
import UserPasswordReset from '@/views/UserPasswordReset';
import PaymentView from '@/views/Payment';
import MyIncome from '@/views/MyIncome';
import LeaveSettlement from '@/views/LeaveSettlement';
import FuelView from '@/views/Fuel';
import PurchaseView from '@/views/Purchase';
import WalletView from '@/views/Wallet';
import ManagerProfile from '@/views/ManagerProfile';
import UserRenew from '@/views/UserRenew';
import TransactionDelete from '@/views/TransactionDelete';
import { NotificationsView, NotificationDetailView } from '@/views/Notifications';
import ThemeConfirmation from '@/components/ThemeConfirmation';
import MonthlyFileDetails from '@/views/MonthlyFileDetails';
import TripDetails from '@/views/TripDetails';
import Chat from '@/views/Chat';
import Statement from '@/views/Statement';
import InvoiceView from '@/views/Invoice';
import FeedbackModal from '@/components/FeedbackModal';
import ConfirmationModal from '@/components/ConfirmationModal';

const ViewContainer: React.FC = () => {
    const [isAppLoading, setIsAppLoading] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const { 
      currentView, user, setView, theme, selectedUser, fontStyle, fontSize, fontBold, 
      backgroundColor, wallpaper, isNightMode, isEyeComfort, appThemeMode, isLoadingView, editingTrip,
      logo, logout, activeSection, activeDetailView, headerBg, goBack, confirmAction, language,
      monthlyFiles, addMonthlyFile, setCurrentFile, primaryColor, isEntryFormOpen, isPaymentPopupOpen, setIsPaymentPopupOpen, customBackAction, navigationDirection,
      showReceivedBreakdown, showPendingBreakdown, customHeaderTitle
    } = useStore();

    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [prevView, setPrevView] = useState<typeof currentView | null>(null);
    const customBackActionRef = useRef(customBackAction);

    useEffect(() => {
      customBackActionRef.current = customBackAction;
    }, [customBackAction]);

    // Auto-redirect Monthly Files to the current month's Trip Details page
    useEffect(() => {
      if (currentView === 'MONTHLY_FILES' && user) {
        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        const currentYear = today.getFullYear();
        
        let file = monthlyFiles.find(f => f.month === currentMonth && f.year === currentYear);
        if (!file) {
          const newFileId = `MF-${Date.now()}`;
          file = {
            id: newFileId,
            month: currentMonth,
            year: currentYear,
            status: 'OPEN',
            createdAt: today.toISOString(),
            userId: user.id
          };
          addMonthlyFile(file);
        }
        setCurrentFile(file);
        setView('MONTHLY_FILE_DETAILS', false);
      }
    }, [currentView, monthlyFiles, user, addMonthlyFile, setCurrentFile, setView]);

    useEffect(() => {
      setIsInitialLoad(false);
    }, []);

    useEffect(() => {
      document.dir = language === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = language;
    }, [language]);

    useEffect(() => {
      setPrevView(currentView);
    }, [currentView]);

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({ top: 0, behavior: 'instant' as any });
      }
    }, [currentView, activeSection, activeDetailView, showReceivedBreakdown, showPendingBreakdown]);

    useEffect(() => {
      const handlePopState = (event: PopStateEvent) => {
        const state = event.state;
        
        if (customBackActionRef.current) {
          window.history.pushState(state, '', ''); // Restore popped state
          customBackActionRef.current();
          return;
        }

        console.log('PopState event:', { currentView, activeSection, state });
        
        // If we are at the root view and try to go back
        // Or if the popped state is LOGIN/SIGNUP, we should treat it as an exit attempt from Dashboard
        const isLoginView = currentView === 'LOGIN' || currentView === 'SIGNUP';
        const isDashboardView = currentView === 'DASHBOARD' && !activeSection && !isLoadingView && !activeDetailView && !showReceivedBreakdown && !showPendingBreakdown;
        
        if (isDashboardView || isLoginView || (state && (state.view === 'LOGIN' || state.view === 'SIGNUP') && (currentView === 'DASHBOARD' || currentView === 'LOGIN' || currentView === 'SIGNUP') && !activeSection && !activeDetailView && !showReceivedBreakdown && !showPendingBreakdown)) {
          console.log('Exit condition met');
          const isBengali = language === 'bn';
          const title = isBengali ? "অ্যাপ থেকে প্রস্থান" : "Exit App";
          const message = isBengali 
            ? "আপনি কি অ্যাপ থেকে বের হতে চান?"
            : "Are you sure you want to exit the app?";
          const confirmText = isBengali ? "হ্যাঁ (Yes)" : "Yes";
          const cancelText = isBengali ? "না (No)" : "No";

          confirmAction(
            message,
            () => {
              if (Capacitor.isNativePlatform()) {
                CapacitorApp.exitApp();
              } else if ((window as any).Telegram?.WebApp) {
                (window as any).Telegram.WebApp.close();
              } else {
                window.close();
              }
            },
            {
              title,
              confirmText,
              cancelText,
            }
          );

          // Push current state back so the user can try again or cancel
          window.history.pushState({ 
            view: currentView,
            activeSection: activeSection,
            activeDetailView: activeDetailView,
            showReceivedBreakdown: showReceivedBreakdown || false,
            showPendingBreakdown: showPendingBreakdown || false
          }, '', '');
          return;
        }
        
        // Otherwise, use our unified back logic with the popped state
        goBack(true, state);
      };

      window.addEventListener('popstate', handlePopState);
      
      let cleanupNative = false;
      let nativeBackListener: any;
      if (Capacitor.isNativePlatform()) {
        CapacitorApp.addListener('backButton', ({ canGoBack }) => {
          if (customBackActionRef.current) {
             customBackActionRef.current();
             return;
          }

          const isLoginView = currentView === 'LOGIN' || currentView === 'SIGNUP';
          const isDashboardView = currentView === 'DASHBOARD' && !activeSection && !isLoadingView && !activeDetailView && !showReceivedBreakdown && !showPendingBreakdown;
          
          if (isDashboardView || isLoginView) {
            const isBengali = language === 'bn';
            const title = isBengali ? "অ্যাপ থেকে প্রস্থান" : "Exit App";
            const message = isBengali 
              ? "আপনি কি অ্যাপ থেকে বের হতে চান?"
              : "Are you sure you want to exit the app?";
            const confirmText = isBengali ? "হ্যাঁ (Yes)" : "Yes";
            const cancelText = isBengali ? "না (No)" : "No";

            confirmAction(
              message,
              () => {
                if (Capacitor.isNativePlatform()) {
                  CapacitorApp.exitApp();
                } else if ((window as any).Telegram?.WebApp) {
                  (window as any).Telegram.WebApp.close();
                } else {
                  window.close();
                }
              },
              {
                title,
                confirmText,
                cancelText,
              }
            );
          } else {
            goBack(false);
          }
        }).then(listener => {
          if (cleanupNative) {
            listener.remove();
          } else {
            nativeBackListener = listener;
          }
        });
      }
      
      // Initial state push to enable back button handling from the start
      if (!window.history.state) {
        window.history.pushState({ 
          view: currentView,
          activeSection: null,
          activeDetailView: null,
          showReceivedBreakdown: false,
          showPendingBreakdown: false
        }, '', '');
      }

      return () => {
        cleanupNative = true;
        window.removeEventListener('popstate', handlePopState);
        if (nativeBackListener) {
          nativeBackListener.remove();
        }
      };
    }, [currentView, activeSection, isLoadingView, goBack, confirmAction, language, logout, setView, activeDetailView, showReceivedBreakdown, showPendingBreakdown]);

    useEffect(() => {
      const requestPermissions = async () => {
        if (Capacitor.isNativePlatform()) {
          // Add a small delay to ensure the app is fully in the foreground 
          // before triggering native OS dialogs, preventing them from being swallowed.
          await new Promise(resolve => setTimeout(resolve, 1000));

          try {
            const geoStatus = await Geolocation.checkPermissions();
            if (geoStatus.location !== 'granted') {
              await Geolocation.requestPermissions({ permissions: ['location', 'coarseLocation'] });
            }
          } catch (error) {
            console.error('Error requesting Geolocation permissions:', error);
          }
          
          try {
            const camStatus = await Camera.checkPermissions();
            if (camStatus.camera !== 'granted' || camStatus.photos !== 'granted') {
              await Camera.requestPermissions({ permissions: ['camera', 'photos'] });
            }
          } catch (error) {
            console.error('Error requesting Camera permissions:', error);
          }
          
          try {
            const fsStatus = await Filesystem.checkPermissions();
            if (fsStatus.publicStorage !== 'granted') {
              await Filesystem.requestPermissions();
            }
          } catch (error) {
            console.error('Error requesting Filesystem permissions:', error);
          }
        }
      };
      requestPermissions();
    }, []);

    useEffect(() => {
      // Control Status Bar style specifically during splash screen to keep network/battery visible
      if (isAppLoading) {
        if (Capacitor.isNativePlatform()) {
          try {
            StatusBar.setOverlaysWebView({ overlay: true }).catch(console.warn);
            StatusBar.setStyle({ style: Style.Dark }).catch(console.warn);
          } catch (e) {
            console.warn('Error setting status bar style during loading:', e);
          }
        }
      }
    }, [isAppLoading]);

    useEffect(() => {
      // Balanced simulated progress loader that is smooth, fast, but gives a beautiful visual experience
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          const next = prev + 4; // smooth loading
          if (next >= 100) {
            clearInterval(interval);
            setIsAppLoading(false);
            return 100;
          }
          return next;
        });
      }, 40);
      return () => clearInterval(interval);
    }, []);

    useEffect(() => {
      if (user && currentView === 'LOGIN') {
        setView('DASHBOARD');
      }
    }, [user, currentView, setView]);



    useEffect(() => {
        const root = document.documentElement;
        
        // Apply Theme Mode Class
        if (isNightMode) {
          root.classList.add('dark');
          root.classList.add('dark-mode');
        } else {
          root.classList.remove('dark');
          root.classList.remove('dark-mode');
        }

        // Apply Eye Comfort Shield (Night Mode)
        if (isEyeComfort) {
          root.classList.add('eye-comfort');
        } else {
          root.classList.remove('eye-comfort');
        }

        const currentThemeObj = THEMES.find(t => t.id === theme) || THEMES[0];
        root.style.setProperty('--primary', currentThemeObj.primary, 'important');
        
        // Apply Font Settings
        root.style.setProperty('--font-sans', `"${fontStyle}", ui-sans-serif, system-ui, sans-serif`, 'important');
        root.style.fontSize = `${fontSize}px`;
        
        if (fontBold) {
            document.body.classList.add('font-bold-override');
        } else {
            document.body.classList.remove('font-bold-override');
        }

        const addOpacityToHex = (hex: any, opacity: number) => {
          if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) return hex;
          const r = parseInt(hex.length === 4 ? hex[1]+hex[1] : hex.substr(1, 2), 16);
          const g = parseInt(hex.length === 4 ? hex[2]+hex[2] : hex.substr(3, 2), 16);
          const b = parseInt(hex.length === 4 ? hex[3]+hex[3] : hex.substr(5, 2), 16);
          return `rgba(${r}, ${g}, ${b}, ${opacity})`;
        };

        const adjustColor = (color: any, amount: number, opacity: number = 1) => {
          if (!color || typeof color !== 'string' || color.startsWith('url') || color.includes('gradient')) return color;
          
          let hex = color;
          if (color.startsWith('rgb')) {
            const match = color.match(/\d+/g);
            if (match && match.length >= 3) {
              const r = Math.max(0, Math.min(255, parseInt(match[0]) + amount));
              const g = Math.max(0, Math.min(255, parseInt(match[1]) + amount));
              const b = Math.max(0, Math.min(255, parseInt(match[2]) + amount));
              return `rgba(${r}, ${g}, ${b}, ${opacity})`;
            }
            return color;
          }

          hex = hex.replace('#', '');
          if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
          if (hex.length !== 6) return color;

          let r = parseInt(hex.substring(0, 2), 16);
          let g = parseInt(hex.substring(2, 4), 16);
          let b = parseInt(hex.substring(4, 6), 16);

          r = Math.max(0, Math.min(255, r + amount));
          g = Math.max(0, Math.min(255, g + amount));
          b = Math.max(0, Math.min(255, b + amount));

          return `rgba(${r}, ${g}, ${b}, ${opacity})`;
        };

        const blendColors = (baseHex: any, overlayRgb: { r: number, g: number, b: number }, opacity: number, fallbackHex = '#ffffff') => {
          if (!baseHex || typeof baseHex !== 'string') return fallbackHex;
          let hex = baseHex.trim();
          if (hex.includes('gradient')) {
            const match = hex.match(/#([0-9a-fA-F]{3,6})/);
            if (match) hex = match[0];
            else return fallbackHex;
          }
          hex = hex.replace('#', '');
          if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
          if (hex.length !== 6) return fallbackHex;
          
          const r1 = parseInt(hex.substring(0, 2), 16);
          const g1 = parseInt(hex.substring(2, 4), 16);
          const b1 = parseInt(hex.substring(4, 6), 16);
          
          const rCombined = Math.round(r1 * (1 - opacity) + overlayRgb.r * opacity);
          const gCombined = Math.round(g1 * (1 - opacity) + overlayRgb.g * opacity);
          const bCombined = Math.round(b1 * (1 - opacity) + overlayRgb.b * opacity);
          
          const toHex = (c: number) => {
            const h = Math.max(0, Math.min(255, c)).toString(16);
            return h.length === 1 ? '0' + h : h;
          };
          return `#${toHex(rCombined)}${toHex(gCombined)}${toHex(bCombined)}`;
        };

        const isNightModeActive = isNightMode || appThemeMode === 'dark' || theme === 'night-mode';

        let effectiveBg = backgroundColor;
        if (!effectiveBg) {
          effectiveBg = wallpaper ? '#000000' : (isNightModeActive ? '#09090b' : '#f8fafc');
        }
        
        // Force effective background to pure black if night mode is active for contrast calculations
        if (isNightModeActive) {
          effectiveBg = '#000000';
        }
        
        // Explicit logic for dynamic text color based on background brightness
        let customContrast = '#000000';
        try {
          let testHex = effectiveBg;
          if (testHex.includes('gradient')) {
            const match = testHex.match(/#([0-9a-fA-F]{3,6})/);
            if (match) testHex = match[0];
          }
          testHex = testHex.replace('#', '');
          if (testHex.length === 3) {
            testHex = testHex[0] + testHex[0] + testHex[1] + testHex[1] + testHex[2] + testHex[2];
          }
          if (testHex.length === 6) {
            const r = parseInt(testHex.substr(0, 2), 16);
            const g = parseInt(testHex.substr(2, 2), 16);
            const b = parseInt(testHex.substr(4, 2), 16);
            // YIQ calculation to determine brightness
            const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
            // If background is light (high YIQ), text should be dark/black
            // If background is dark (low YIQ), text should be white
            customContrast = (yiq >= 128) ? '#000000' : '#ffffff';
          } else {
            customContrast = getContrastColor(effectiveBg) || '#000000';
          }
        } catch (e) {
          customContrast = getContrastColor(effectiveBg) || '#000000';
        }

        const isDarkBg = customContrast === '#ffffff';
         
        // Calculate distinct header and nav backgrounds
        const headerBgBase = isDarkBg ? adjustColor(effectiveBg, 15, 0.85) : adjustColor(effectiveBg, -10, 0.85);
        const navBgBase = isDarkBg ? adjustColor(effectiveBg, 10, 0.85) : adjustColor(effectiveBg, -5, 0.85);

        const activePrimaryColor = primaryColor || currentThemeObj.primary || '#3b82f6';
        const layoutColor = 
          headerBg && headerBg !== '#2563EB' 
            ? headerBg 
            : backgroundColor && backgroundColor !== '#F3F4F6' 
              ? backgroundColor 
              : activePrimaryColor;
        const layoutContrast = getContrastColor(layoutColor) || '#ffffff';
        root.style.setProperty('--primary', activePrimaryColor);
        root.style.setProperty('--header-text', layoutContrast);
         
        // Update StatusBar for mobile devices
        if (!isAppLoading && Capacitor.isNativePlatform()) {
          try {
            StatusBar.setOverlaysWebView({ overlay: true }).catch(console.warn);
            const statusBarStyle = layoutContrast === '#000000' ? Style.Light : Style.Dark;
            StatusBar.setStyle({ style: statusBarStyle }).catch(console.warn);
          } catch (e) {
            console.warn('Error setting status bar:', e);
          }
        }
         
        // Use layoutColor directly if it's set by the user, otherwise use the theme's default gradient logic
        const headerGradient = headerBg ? headerBg : (isNightModeActive ? 
          `linear-gradient(135deg, ${adjustColor(layoutColor, -40)} 0%, ${adjustColor(layoutColor, -20)} 50%, ${layoutColor} 100%)` :
          `linear-gradient(135deg, ${layoutColor} 0%, ${adjustColor(layoutColor, 20)} 50%, ${adjustColor(layoutColor, 40)} 100%)`
        );

        const lightAppGradient = 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)';
        const darkAppGradient = 'linear-gradient(135deg, #09090b 0%, #111111 100%)';
         
        // Ensure the active nav item has a solid, distinct color from the background
        let navActiveBg = activePrimaryColor;
        // If the primary color is too similar to the background (e.g. both are light or both are dark),
        // we use the contrast color of the background to guarantee it is completely different.
        if (getContrastColor(activePrimaryColor) === getContrastColor(effectiveBg)) {
            navActiveBg = customContrast;
        }
        const navActiveText = getContrastColor(navActiveBg) || '#ffffff';
         
        root.style.setProperty('--nav-active-bg', navActiveBg);
        root.style.setProperty('--nav-active-text', navActiveText);
         
        // Set root text main contrast colors
        root.style.setProperty('--root-text-main', customContrast);
        root.style.setProperty('--root-text-muted', customContrast === '#000000' ? '#4b5563' : '#94a3b8');
         
        // Dynamically set search border & text colors on root to respond perfectly to background contrast
        root.style.setProperty('--search-border-color', customContrast === '#000000' ? 'rgba(0, 0, 0, 0.22)' : '#ffffff');
        root.style.setProperty('--search-text-color', customContrast === '#000000' ? '#111827' : '#ffffff');
        root.style.setProperty('--search-label-color', customContrast === '#000000' ? '#4b5563' : 'rgba(255, 255, 255, 0.7)');
        root.style.setProperty('--search-focus-border-color', isDarkBg ? '#ffffff' : activePrimaryColor);
        root.style.setProperty('--search-label-active-color', isDarkBg ? '#ffffff' : activePrimaryColor);
        root.style.setProperty('--input-label-active-color', isDarkBg ? '#ffffff' : activePrimaryColor);
         
        // Semantic Colors
        root.style.setProperty('--success', '#10b981'); // emerald-500
        root.style.setProperty('--danger', '#f43f5e');  // rose-500
        root.style.setProperty('--warning', '#f59e0b'); // amber-500
        root.style.setProperty('--info', '#3b82f6');    // blue-500

        if (isNightModeActive) {
          root.style.setProperty('--app-bg', '#000000', 'important');
          root.style.setProperty('--theme-bg', '#000000', 'important');
          // Flutter cardTheme color: const Color(0xFF002843)
          root.style.setProperty('--card-bg', '#002843', 'important');
          root.style.setProperty('--nested-card-bg', '#001F35', 'important');
          root.style.setProperty('--theme-card', '#002843', 'important');
          root.style.setProperty('--card-dark', '#002843', 'important');
          root.style.setProperty('--card-blur', '0px', 'important');
          
          root.style.setProperty('--card-bg-solid', '#002843', 'important');
          root.style.setProperty('--page-bg-solid', '#000000', 'important');
          
          root.style.setProperty('--input-border-color', '#333333', 'important');
          root.style.setProperty('--sidebar-bg', '#002843', 'important');
          root.style.setProperty('--sidebar-text', '#ffffff', 'important');
          root.style.setProperty('--form-bg', '#002843', 'important');
          root.style.setProperty('--header-bg', '#000000', 'important');
          root.style.setProperty('--nav-bg', '#000000', 'important');
          root.style.setProperty('--text-main', '#ffffff', 'important');
          root.style.setProperty('--text-muted', '#a1a1aa', 'important');
          root.style.setProperty('--text-inverse', '#000000', 'important');
          root.style.setProperty('--hover-bg', 'rgba(255, 255, 255, 0.1)', 'important');
          root.style.setProperty('--active-bg', addOpacityToHex(currentThemeObj.primary, 0.25), 'important');
          root.style.setProperty('--input-bg', 'rgba(255, 255, 255, 0.05)', 'important');
          document.documentElement.classList.remove('light');
          document.documentElement.classList.remove('dark-theme');
          document.documentElement.classList.add('dark');
          document.documentElement.classList.add('dark-mode');
        } else if (appThemeMode === 'light') {
          root.style.setProperty('--app-bg', wallpaper ? `url(${wallpaper}) center/cover no-repeat fixed` : (backgroundColor || lightAppGradient));
          root.style.setProperty('--theme-bg', wallpaper ? `url(${wallpaper}) center/cover no-repeat fixed` : (backgroundColor || lightAppGradient));
          
          root.style.setProperty('--card-bg-solid', '#ffffff');
          root.style.setProperty('--input-border-color', 'rgba(0, 0, 0, 0.22)');
          
          root.style.setProperty('--page-bg-solid', backgroundColor || '#f8fafc');
          
          root.style.setProperty('--card-bg', `#ffffff`);
          root.style.setProperty('--nested-card-bg', `#f3f4f6`);
          root.style.setProperty('--theme-card', `#ffffff`);
          root.style.setProperty('--card-dark', `#ffffff`);
          root.style.setProperty('--card-blur', `0px`);
          root.style.setProperty('--sidebar-bg', headerGradient);
          root.style.setProperty('--sidebar-text', layoutContrast);
          root.style.setProperty('--form-bg', `#ffffff`);
          root.style.setProperty('--header-bg', headerGradient);
          root.style.setProperty('--nav-bg', headerGradient);
          root.style.setProperty('--text-main', customContrast);
          root.style.setProperty('--text-muted', customContrast === '#000000' ? '#4b5563' : '#94a3b8');
          root.style.setProperty('--text-inverse', customContrast === '#000000' ? '#ffffff' : '#000000');
          root.style.setProperty('--hover-bg', 'rgba(0, 0, 0, 0.05)');
          root.style.setProperty('--active-bg', addOpacityToHex(currentThemeObj.primary, 0.15));
          root.style.setProperty('--input-bg', '#F4F6F8');
          document.documentElement.classList.add('light');
          document.documentElement.classList.remove('dark');
          document.documentElement.classList.remove('dark-mode');
          document.documentElement.classList.remove('dark-theme');
        } else {
          // dark mode (old light mode)
          // Flutter cardTheme color: const Color(0xFF002843)
          const diamondHeaderGradient = headerBg ? headerBg : `linear-gradient(135deg, ${layoutColor} 0%, ${adjustColor(layoutColor, -20)} 100%)`;
          const diamondAppGradient = 'linear-gradient(135deg, #020617 0%, #0f172a 100%)';
          
          root.style.setProperty('--app-bg', wallpaper ? `url(${wallpaper}) center/cover no-repeat fixed` : (backgroundColor || diamondAppGradient));
          root.style.setProperty('--theme-bg', wallpaper ? `url(${wallpaper}) center/cover no-repeat fixed` : (backgroundColor || diamondAppGradient));
          
          root.style.setProperty('--card-bg-solid', '#002843');
          root.style.setProperty('--page-bg-solid', effectiveBg);
          
          root.style.setProperty('--input-border-color', '#333333');
          root.style.setProperty('--card-bg', `#002843`);
          root.style.setProperty('--nested-card-bg', `#001F35`);
          root.style.setProperty('--theme-card', `#002843`);
          root.style.setProperty('--card-dark', `#002843`);
          root.style.setProperty('--card-blur', `0px`);
          root.style.setProperty('--sidebar-bg', diamondHeaderGradient);
          root.style.setProperty('--sidebar-text', layoutContrast);
          root.style.setProperty('--form-bg', `#002843`);
          root.style.setProperty('--header-bg', diamondHeaderGradient);
          root.style.setProperty('--nav-bg', diamondHeaderGradient);
          root.style.setProperty('--text-main', customContrast);
          root.style.setProperty('--text-muted', customContrast === '#000000' ? '#4b5563' : '#94a3b8');
          root.style.setProperty('--text-inverse', customContrast === '#000000' ? '#ffffff' : '#000000');
          root.style.setProperty('--hover-bg', 'rgba(255, 255, 255, 0.1)');
          root.style.setProperty('--active-bg', 'rgba(255, 255, 255, 0.2)');
          root.style.setProperty('--input-bg', 'rgba(255, 255, 255, 0.1)');
          document.documentElement.classList.remove('light');
          document.documentElement.classList.remove('dark');
          document.documentElement.classList.remove('dark-mode');
          document.documentElement.classList.add('dark-theme');
        }
    }, [theme, fontStyle, fontSize, fontBold, backgroundColor, wallpaper, isNightMode, isEyeComfort, appThemeMode, headerBg, primaryColor]);

    const isFirstLoginRequired = user?.isFirstLogin;

    if (isAppLoading) {
      return (
        <div className="fixed inset-0 z-[999999999] flex flex-col items-center justify-center bg-[#050515] transition-colors duration-350 overflow-hidden allow-animation">
          {/* Ambient Glowing Color Orbs (Beautiful Multiple Design Background Colors) */}
          <div className="absolute top-[-10%] left-[-10%] w-[80vw] h-[80vw] bg-cyan-500/10 rounded-full blur-[100px] animate-pulse pointer-events-none" style={{ animationDuration: '8s' }} />
          <div className="absolute bottom-[-10%] right-[-10%] w-[80vw] h-[80vw] bg-violet-600/10 rounded-full blur-[100px] animate-pulse pointer-events-none" style={{ animationDuration: '10s' }} />
          <div className="absolute top-[30%] left-[10%] w-[60vw] h-[60vw] bg-fuchsia-500/8 rounded-full blur-[120px] animate-pulse pointer-events-none" style={{ animationDuration: '12s' }} />

          <div className="relative flex flex-col items-center justify-center animate-scale-in">
            {/* Concentric Rotating Multi-Colored Rings around the centered Logo */}
            <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
              {/* Core Pulse Glow */}
              <div className="absolute w-[100px] h-[100px] bg-cyan-500/10 rounded-full blur-xl animate-pulse-ring" />

              {/* Ring 1 (Outer Ring - Amber & Rose Accented) */}
              <div className="absolute w-[164px] h-[164px] rounded-full border border-t-amber-400 border-b-rose-500 border-l-transparent border-r-transparent animate-spin-cw-slow opacity-80" />

              {/* Ring 2 (Middle Ring - Fuchsia & Purple Accent) */}
              <div className="absolute w-[136px] h-[136px] rounded-full border-2 border-l-fuchsia-500 border-r-violet-500 border-t-transparent border-b-transparent animate-spin-ccw opacity-90" />

              {/* Ring 3 (Inner Ring - Cyan & Emerald Accent) */}
              <div className="absolute w-[108px] h-[108px] rounded-full border border-t-cyan-400 border-b-emerald-400 border-l-transparent border-r-transparent animate-spin-cw opacity-95" />

              {/* Centered Floating Application Logo */}
              <div className="relative w-20 h-20 rounded-[14px] overflow-hidden flex items-center justify-center animate-float bg-transparent">
                <img 
                  src={logo} 
                  alt="FleetPro Logo" 
                  className="w-20 h-20 object-contain rounded-[14px] bg-transparent drop-shadow-[0_4px_12px_rgba(34,211,238,0.4)]" 
                />
              </div>
            </div>

            {/* Glowing Text Header */}
            <div className="relative mb-1">
              <h1 className="text-4xl font-extrabold tracking-[0.25em] text-white uppercase bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
                FleetPro
              </h1>
            </div>
            
            <p className="text-xs font-black tracking-[0.6em] text-cyan-400 uppercase opacity-90 mb-10">
              Manager
            </p>

            {/* Premium Illuminated Progress Indicator */}
            <div className="flex flex-col items-center w-60">
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden relative shadow-inner">
                <div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500 transition-all duration-300 ease-out shadow-[0_0_12px_rgba(6,182,212,0.8)]"
                  style={{ width: `${loadingProgress}%` }}
                >
                  <div className="absolute inset-0 animate-shimmer opacity-40"></div>
                </div>
              </div>
              <div className="mt-3.5 flex items-center justify-between w-full px-1">
                <span className="text-[9px] font-black tracking-widest text-slate-500 uppercase">
                  Connecting...
                </span>
                <span className="text-[10px] font-black tracking-widest text-cyan-400">
                  {loadingProgress}%
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Attribution */}
          <div className="absolute bottom-10 flex flex-col items-center gap-2">
            <div className="w-6 h-[1px] bg-slate-800"></div>
            <div className="text-[9px] font-black tracking-[0.3em] text-slate-500 uppercase">
              Powering Logistics Excellence
            </div>
          </div>
        </div>
      );
    }

    // STRICT LOGIN PROTECTION: If no user, ALWAYS return Login view
    if (!user && currentView !== 'SIGNUP' && currentView !== 'SUPPORT' && currentView !== 'PRAYER_TIMES') {
      return (
        <>
          <Login />
          <FeedbackModal />
        </>
      );
    }

  if (currentView === 'LOGIN') {
    return (
      <>
        <Login />
        <FeedbackModal />
      </>
    );
  }

    const renderView = () => {
      if (isFirstLoginRequired) return <Settings />;
      switch (currentView) { case 'DASHBOARD': return <Dashboard />;
      case 'TRIPS': return <Trips />;
      case 'PROFILES': return <Profiles />;
      case 'MONTHLY_FILES': return <MonthlyFiles />;
      case 'NEW_TRIP': return <NewTrip />;
      case 'FINANCE': return <div className="text-center py-20 font-black uppercase text-gray-400 opacity-50">{TRANSLATIONS[language]?.COMING_SOON || 'Coming Soon...'}</div>;
      case 'FUEL': return <FuelView />;
      case 'DOWNLOAD': return <div className="text-center py-20 font-black uppercase text-gray-400 opacity-50">{TRANSLATIONS[language]?.COMING_SOON || 'Coming Soon...'}</div>;
      case 'PURCHASE':
      case 'NEW_PURCHASE': return <PurchaseView />;
      case 'WALLET': return <WalletView />;
      case 'ADMIN': return <AdminPendingUsers />;
      case 'SETTINGS': return <Settings />;
      case 'USER_PROFILE': return <UserProfile />;
      case 'USER_FILES_LIST': return <UserFilesList />;
      case 'MY_INCOME': return <MyIncome />;
      case 'LEAVE_SETTLEMENT': return <LeaveSettlement />;
      case 'USER_RENEW': return <UserRenew />;
      case 'PAYMENT': return <PaymentView />;
      case 'STATEMENT': return <Statement />;
      case 'INVOICE': return <InvoiceView />;
      case 'ACCOUNT': return <NewAccount />;
      case 'ACTIVE_USER': return <ActiveUser />;
      case 'BLOCK_LIST': return <BlockList />;
      case 'USER_ACCOUNTS': return <UserAccounts />;
      case 'MANAGER_PROFILE': return <ManagerProfile />;
      case 'SEARCH': return <Search />;
      case 'ADMIN_PROFILE_UPDATE': return <AdminProfileUpdate />;
      case 'SUPPORT': return <Support />;
      case 'PRAYER_TIMES': return <PrayerTimes />;
      case 'CONTROL_PANEL': return <ControlPanel />;
      case 'MONTHLY_FILE_DETAILS': return <MonthlyFileDetails />;
      case 'TRIP_DETAILS': return <TripDetails />;
      case 'CHAT': return <Chat />;
      case 'TRANSACTION_DELETE': return <TransactionDelete />;
      case 'RESET_BREAKDOWN': return <ResetBreakdownView />;
      case 'USER_ACCOUNT_RESET': return <UserAccountResetView />;
      case 'USER_PASSWORD_RESET': return <UserPasswordReset />;
      case 'NOTIFICATIONS': return <NotificationsView />;
      case 'NOTIFICATION_DETAIL': return <NotificationDetailView />;
      default: return <Dashboard />;
    }
  };

  const isFullscreenView = [
    'MONTHLY_FILE_DETAILS',
    'CHAT',
    'NEW_TRIP',
    'NEW_PURCHASE',
    'MONTHLY_FILES',
    'SETTINGS',
    'USER_FILES_LIST',
    'ACTIVE_USER',
    'USER_RENEW',
    'BLOCK_LIST',
    'USER_ACCOUNTS',
    'SEARCH',
    'ADMIN_PROFILE_UPDATE',
    'SUPPORT',
    'PRAYER_TIMES',
    'CONTROL_PANEL',
    'RESET_BREAKDOWN',
    'USER_ACCOUNT_RESET',
    'USER_PASSWORD_RESET',
    'NOTIFICATIONS',
    'NOTIFICATION_DETAIL'
  ].includes(currentView);

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

  const isPendingIncome = localStorage.getItem('pendingAction') === 'ADD_INCOME';
  const shouldHideHeader = (currentView === 'MY_INCOME' && (activeSection === 'PENDING_PAGE' || (typeof activeSection === 'string' && (activeSection.startsWith('CATEGORY_') || activeSection.startsWith('PENDING_CATEGORY_'))))) || (currentView === 'PAYMENT' && (isEntryFormOpen || isPendingIncome)) || currentView === 'CHAT';
  const shouldBeFullWidth = (currentView === 'MY_INCOME' && (activeSection === 'PENDING_PAGE' || activeSection === 'INCOME' || activeSection === 'DEDUCTION' || (typeof activeSection === 'string' && (activeSection.startsWith('CATEGORY_') || activeSection.startsWith('PENDING_CATEGORY_'))) || activeSection === 'ADD_INCOME')) || currentView === 'CHAT' || currentView === 'SETTINGS' || currentView === 'WALLET';

  const mainNavViews = ['DASHBOARD', 'SEARCH', 'PAYMENT', 'USER_PROFILE', 'TRIPS', 'PROFILES', 'MONTHLY_FILES', 'SETTINGS', 'FINANCE', 'ADMIN', 'MY_INCOME', 'CHAT', 'NOTIFICATIONS', 'FUEL', 'DOWNLOAD'];
  const isNavTransition = prevView && mainNavViews.includes(prevView) && mainNavViews.includes(currentView);

  const isBottomNavHidden = !user || isFirstLoginRequired || currentView === 'CHAT' || isPaymentPopupOpen;

  return (
    <Layout 
      title={getTitle()}
      hideBottomNav={isBottomNavHidden}
      hideHeader={true}
      fullWidth={true}
    >
      <div 
        className="w-full h-full flex flex-col relative z-20 overflow-hidden app-container"
        style={{ background: wallpaper ? 'transparent' : ((isNightMode || appThemeMode === 'dark' || theme === 'night-mode') ? '#000000' : (backgroundColor || 'var(--app-bg)')) }}
      >
        <div
          key={currentView}
          className="w-full h-full flex flex-col absolute inset-0"
          style={{ background: wallpaper ? 'transparent' : ((isNightMode || appThemeMode === 'dark' || theme === 'night-mode') ? '#000000' : (backgroundColor || 'var(--app-bg)')) }}
        >
          <div 
            className={`z-30 relative shrink-0 ${
              shouldHideHeader ? 'hidden' : 'block'
            }`}
            style={{ background: wallpaper ? 'transparent' : ((isNightMode || appThemeMode === 'dark' || theme === 'night-mode') ? '#000000' : (backgroundColor || 'var(--app-bg)')) }}
          >
            <PageHeader />
          </div>
          
          <div className="flex-1 relative overflow-hidden">
            <div 
              className={`w-full h-full flex flex-col ${isNightMode || appThemeMode === 'dark' || theme === 'night-mode' ? 'dark' : ''}`}
              style={{ background: wallpaper ? 'transparent' : ((isNightMode || appThemeMode === 'dark' || theme === 'night-mode') ? '#000000' : (backgroundColor || 'var(--app-bg)')) }}
            >
              <div 
                ref={scrollContainerRef}
                className={`w-full h-full ${shouldBeFullWidth ? 'flex flex-col' : `overflow-y-auto px-global pt-global ${isBottomNavHidden ? 'pb-[calc(1.2rem+env(safe-area-inset-bottom))]' : 'pb-[calc(76px+env(safe-area-inset-bottom)+16px)]'}`}`}
              >
                {renderView()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isLoadingView && createPortal(
        <div
          className="fixed inset-0 z-[99999999] flex items-center justify-center bg-white/40 dark:bg-black/40 backdrop-blur-md"
        >
          <div className="flex items-center space-x-2 h-12">
            <div className="w-2 h-full rounded-sm animate-wave-1" style={{ backgroundColor: 'var(--primary)' }}></div>
            <div className="w-2 h-full rounded-sm animate-wave-2" style={{ backgroundColor: 'var(--primary)' }}></div>
            <div className="w-2 h-full rounded-sm animate-wave-3" style={{ backgroundColor: 'var(--primary)' }}></div>
            <div className="w-2 h-full rounded-sm animate-wave-4" style={{ backgroundColor: 'var(--primary)' }}></div>
          </div>
        </div>,
        document.body
      )}
      <ThemeConfirmation />
      <FeedbackModal />
      <ConfirmationModal />
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <StoreProvider>
      <>
        <ViewContainer />
      </>
    </StoreProvider>
  );
};

export default App;
