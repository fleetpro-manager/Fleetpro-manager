
import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import { TRANSLATIONS, THEMES, PRESET_BACKGROUNDS, LIGHT_THEME_PRESETS } from '../constants';
import MultiColorCreator from '@/components/MultiColorCreator';
import { Moon, Sun, Diamond, Globe, Check, ChevronDown, Palette, LogOut, Settings as SettingsIcon, ZoomIn, ZoomOut, Image as ImageIcon, CreditCard, Lock, Shield, Smartphone, Copy, ChevronLeft, ChevronRight, User as UserIcon, X, Plus, Download, Upload, Database, LayoutGrid, RefreshCw, ArrowLeft } from 'lucide-react';

import { Theme, Language } from '../types';
import InputField from '../components/InputField';
import { QRCodeSVG } from 'qrcode.react';
import { storageService } from '@/services/storageService';
import GlobalFullscreenSelect from '@/components/GlobalFullscreenSelect';
import * as OTPAuth from 'otpauth';

const Settings: React.FC = () => {
  const { theme, setTheme, language, setLanguage, user, setUser, updateUser, logout, setView, zoom, setZoom, wallpaper, setWallpaper, loginWallpaper, setLoginWallpaper, loginBackgroundColor, setLoginBackgroundColor, backgroundColor, setBackgroundColor, fontStyle, setFontStyle, fontSize, setFontSize, fontBold, setFontBold, currencies, selectedCurrency, setSelectedCurrency, showFeedback, setSelectedUser, headerBg, setHeaderBg, setNavBg, appThemeMode, setAppThemeMode, appGrid, setAppGrid, activeSection, setActiveSection, logo, setLogo, exportData, importData, exportLocalData, importLocalData, currentThemeObj, adminPin, setAdminPin, confirmAction, primaryColor: storePrimaryColor, setPrimaryColor, setNavigationDirection, navigationDirection } = useStore();
  const t = TRANSLATIONS[language];
  const primaryColor = storePrimaryColor || currentThemeObj?.primary || '#3b82f6';
  
  const handleLogout = () => {
    confirmAction(
      language === 'bn' ? 'আপনি কি লগআউট করতে চান?' : 'Are you sure you want to log out?',
      () => {
        logout();
      },
      {
        title: language === 'bn' ? 'লগআউট' : 'Logout',
        confirmText: language === 'bn' ? 'হ্যাঁ' : 'Yes',
        cancelText: language === 'bn' ? 'না' : 'No'
      }
    );
  };
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Force SECURITY section if first login password change is required
  useEffect(() => {
    if (user?.isFirstLogin && activeSection !== 'SECURITY') {
      setActiveSection('SECURITY');
    }
  }, [user?.isFirstLogin, activeSection, setActiveSection]);
  const [newAdminPin, setNewAdminPin] = useState('');
  const [is2FAEnabled, setIs2FAEnabled] = useState(user?.is2FAEnabled || false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [authCode, setAuthCode] = useState('');
  const [twoFASecret, setTwoFASecret] = useState('');
  const [twoFAUrl, setTwoFAUrl] = useState('');
  const [isFontSelectOpen, setIsFontSelectOpen] = useState(false);
  const [tempApiUrl, setTempApiUrl] = useState(() => localStorage.getItem('API_BASE_URL') || '');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLocalFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (content) {
        await importLocalData(content);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset selection
  };

  const generateSecret = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 16; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return secret;
  };

  const handlePasswordChange = async () => {
    if (newPassword.trim() !== confirmPassword.trim()) {
      showFeedback('New passwords do not match');
      return;
    }
    if (!currentPassword.trim() || !newPassword.trim()) {
      showFeedback('Please fill all password fields');
      return;
    }
    if (user) {
      const bcrypt = await import('bcryptjs');
      const coll = user.role === 'ADMIN' ? 'admins' : 'users';
      
      // Fetch latest user data from Firestore to evaluate Single Source of Truth
      try {
        const { getDocFromServer, doc } = await import('firebase/firestore');
        const { db } = await import('@/services/firebase');
        
        const userDocRef = doc(db, coll, user.id);
        const userDocSnap = await getDocFromServer(userDocRef);
        
        if (!userDocSnap.exists()) {
          showFeedback('User not found in database');
          return;
        }

        const latestUserData = userDocSnap.data();
        const storedPassword = (latestUserData.password || user.password || '').toString();
        const isHashed = storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$') || storedPassword.startsWith('$2y$');
        
        let isPasswordCorrect = false;

        // Try standard Firebase Auth reauthenticateWithCredential if we have an active Auth user
        // to conform with instructions, otherwise fallback to database single-source verification.
        try {
          const { EmailAuthProvider, reauthenticateWithCredential } = await import('firebase/auth');
          const { auth } = await import('@/services/firebase');
          if (auth.currentUser && auth.currentUser.email) {
            const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword.trim());
            await reauthenticateWithCredential(auth.currentUser, credential);
            isPasswordCorrect = true;
          }
        } catch (firebaseErr: any) {
          console.log("Firebase Auth reauthentication skipped/unavailable, falling back to database verification:", firebaseErr?.message);
        }
        
        // Log the validation context for debugging (without exposing the actual password strings)
        console.log('Firebase Auth Re-authentication Logic Check:', { 
           hasStoredPassword: !!storedPassword, 
           isHashed 
        });

        if (!isPasswordCorrect) {
          if (isHashed) {
            isPasswordCorrect = await bcrypt.compare(currentPassword.trim(), storedPassword);
            // Default password fallback for admin first-time logins
            if (!isPasswordCorrect && user.role === 'ADMIN' && (user.isFirstLogin !== false) && currentPassword.trim().toLowerCase() === 'admin') {
              isPasswordCorrect = true;
            }
          } else {
            isPasswordCorrect = storedPassword.trim() === currentPassword.trim() || 
                                storedPassword === currentPassword.trim() ||
                                (user.role === 'ADMIN' && currentPassword.trim().toLowerCase() === 'admin');
          }
        }

        if (!isPasswordCorrect) {
          showFeedback('Incorrect Password');
          return;
        }
        
        const hashedPassword = await bcrypt.hash(newPassword.trim(), 10);
        const { saveFirebaseDocMerge } = await import('@/services/firebase');
        
        await saveFirebaseDocMerge(coll, user.id, { 
          password: hashedPassword,
          isFirstLogin: false 
        });
        
        const updatedUser = { ...user, ...latestUserData, password: hashedPassword, isFirstLogin: false };
        updateUser(updatedUser);
        setUser(updatedUser);
        
        showFeedback('Password updated successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } catch (err) {
        console.error('Failed to update password:', err);
        showFeedback('Failed to update password in database');
      }
    }
  };

  const handleAdminPinUpdate = async () => {
    if (newAdminPin.length !== 4) {
      showFeedback('PIN must be 4 digits');
      return;
    }
    
    try {
      const { saveFirebaseDocMerge } = await import('@/services/firebase');
      const adminDocId = user?.id || 'Admin';
      await saveFirebaseDocMerge('admins', adminDocId, { adminPin: newAdminPin });
      setAdminPin(newAdminPin);
      showFeedback('Admin PIN updated successfully');
      setNewAdminPin('');
    } catch (e) {
      console.error('Failed to update Admin PIN to Firestore', e);
      showFeedback('Failed to update PIN to remote database');
    }
  };

  const handleToggle2FA = () => {
    if (!is2FAEnabled) {
      const secret = generateSecret();
      setTwoFASecret(secret);
      const email = user?.email || 'user';
      const totp = new OTPAuth.TOTP({
        issuer: 'FleetPro',
        label: email,
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(secret)
      });
      setTwoFAUrl(totp.toString());
      setShow2FASetup(true);
    } else {
      if (user) {
        const updatedUser = { ...user, is2FAEnabled: false, twoFASecret: undefined };
        updateUser(updatedUser);
        setIs2FAEnabled(false);
        showFeedback('Google Authenticator disabled');
      }
    }
  };

  const handleConfirm2FA = () => {
    if (authCode.length === 6) {
      if (user) {
        const totp = new OTPAuth.TOTP({
          issuer: 'FleetPro',
          label: user.email || 'user',
          algorithm: 'SHA1',
          digits: 6,
          period: 30,
          secret: OTPAuth.Secret.fromBase32(twoFASecret)
        });
        const delta = totp.validate({ token: authCode, window: 1 });
        if (delta !== null) {
          const updatedUser = { ...user, is2FAEnabled: true, twoFASecret: twoFASecret };
          updateUser(updatedUser);
          setIs2FAEnabled(true);
          setShow2FASetup(false);
          setAuthCode('');
          showFeedback('Google Authenticator enabled successfully');
        } else {
          showFeedback('Invalid or expired code. Please try again.');
        }
      }
    } else {
      showFeedback('Please enter a valid 6-digit code');
    }
  };

  const languages: { id: Language; label: string; flag: string }[] = [
    { id: 'en', label: 'English', flag: '🇺🇸' },
    { id: 'bn', label: 'বাংলা', flag: '🇧🇩' },
    { id: 'ar', label: 'العربية', flag: '🇶🇦' },
  ];

  const handleThemeClick = (themeId: Theme) => {
    setTheme(themeId);
    showFeedback('Theme updated successfully');
  };

  const availableThemes = THEMES;

  const isWhiteBg = appThemeMode === 'light' && (!backgroundColor || (backgroundColor?.toLowerCase() || '') === '#ffffff');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 1 },
    visible: { opacity: 1 }
  };

  const MenuItem = ({ icon, title, onClick, color = "var(--text-main)" }: { icon: React.ReactNode, title: string, onClick: () => void, color?: string }) => (
    <button 
      
      
      onClick={onClick} 
      className="w-full flex items-center justify-between p-3 bg-theme-card rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
    >
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-lg bg-transparent flex items-center justify-center`} style={{ color: color }}>
          {icon}
        </div>
        <span className="font-bold text-sm text-text-main">{title}</span>
      </div>
      <ChevronRight size={20} className={"text-text-muted"} />
    </button>
  );

  return (
    <div className="w-full h-full relative">
        {!activeSection ? (
          <div 
            key="main-list"
            className="absolute inset-0 w-full h-full flex flex-col overflow-y-auto px-4 sm:px-6 lg:px-8 pt-global pb-[calc(76px+env(safe-area-inset-bottom)+16px)] space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <MenuItem 
                icon={<UserIcon size={20} />} 
                title="My Profile" 
                onClick={() => {
                  setSelectedUser(null);
                  setView('USER_PROFILE');
                }} 
                color={primaryColor}
              />
              <MenuItem 
                icon={<Palette size={20} />} 
                title="App Theme" 
                onClick={() => {
                  setNavigationDirection('forward');
                  setActiveSection('THEME');
                }} 
                color={primaryColor}
              />
              <MenuItem 
                icon={<ImageIcon size={20} />} 
                title={t.THEME_SETTINGS} 
                onClick={() => {
                  setNavigationDirection('forward');
                  setActiveSection('THEME_SETTINGS');
                }} 
                color={primaryColor}
              />
              <MenuItem 
                icon={<Shield size={20} />} 
                title="Security & Password" 
                onClick={() => {
                  setNavigationDirection('forward');
                  setActiveSection('SECURITY');
                }} 
                color={primaryColor}
              />
              <MenuItem 
                icon={<ZoomIn size={20} />} 
                title="Screen Zoom" 
                onClick={() => {
                  setNavigationDirection('forward');
                  setActiveSection('ZOOM');
                }} 
                color={primaryColor}
              />
              <MenuItem 
                icon={<SettingsIcon size={20} />} 
                title="Typography" 
                onClick={() => {
                  setNavigationDirection('forward');
                  setActiveSection('TYPOGRAPHY');
                }} 
                color={primaryColor}
              />
              <MenuItem 
                icon={<Globe size={20} />} 
                title="Language" 
                onClick={() => {
                  setNavigationDirection('forward');
                  setActiveSection('LANGUAGE');
                }} 
                color={primaryColor}
              />
              <MenuItem 
                icon={<CreditCard size={20} />} 
                title="Currency" 
                onClick={() => {
                  setNavigationDirection('forward');
                  setActiveSection('CURRENCY');
                }} 
                color={primaryColor}
              />
              {user?.role === 'ADMIN' && (
                <MenuItem 
                  icon={<Diamond size={20} />} 
                  title="App Logo" 
                  onClick={() => {
                    setNavigationDirection('forward');
                    setActiveSection('LOGO');
                  }} 
                  color={primaryColor}
                />
              )}
              <MenuItem 
                icon={<Database size={20} />} 
                title="Data Backup" 
                onClick={() => {
                  setNavigationDirection('forward');
                  setActiveSection('BACKUP');
                }} 
                color={primaryColor}
              />
              <MenuItem 
                icon={<Smartphone size={20} />} 
                title="Server Connection (APK)" 
                onClick={() => {
                  setNavigationDirection('forward');
                  setActiveSection('SERVER_CONNECTION');
                }} 
                color={primaryColor}
              />
            </div>

             <div className="mt-8">
              <button
                
                onClick={handleLogout}
                className="w-full p-3 flex items-center justify-between rounded-lg bg-white hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-transparent text-red-500 group-hover:text-red-600">
                    <LogOut size={20} />
                  </div>
                  <span className="font-bold text-sm text-red-600">{t.LOGOUT}</span>
                </div>
              </button>
            </div>

          </div>
        ) : (
          <div 
            key={activeSection}
            className={`absolute inset-0 w-full h-full flex flex-col overflow-y-auto px-4 sm:px-6 lg:px-8 pt-global pb-[calc(76px+env(safe-area-inset-bottom)+16px)] space-y-4 settings-active-container`}
          >

            {activeSection === 'SERVER_CONNECTION' && (
              <div className="space-y-6">
                <div className="p-4 bg-theme-card rounded-lg space-y-6">
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="w-16 h-16 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mb-2" style={{ color: primaryColor, backgroundColor: `${primaryColor}10` }}>
                      <Smartphone size={32} />
                    </div>
                    <h2 className="text-lg font-black text-text-main uppercase">Server Connection</h2>
                    <p className="text-xs text-text-muted font-bold max-w-[280px]">
                      Configure the remote backend API address for document scanning (OCR) and Gemini AI Chat inside the Release APK.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-black text-text-main mb-2 uppercase tracking-wide">
                        API Base URL / Server Domain
                      </label>
                      <input
                        type="url"
                        placeholder="https://your-cloudrun-url.run.app"
                        value={tempApiUrl}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTempApiUrl(val);
                          if (val.trim()) {
                            localStorage.setItem('API_BASE_URL', val.trim());
                          } else {
                            localStorage.removeItem('API_BASE_URL');
                          }
                          showFeedback('API Base URL updated');
                        }}
                        className="w-full bg-gray-50 dark:bg-zinc-800 text-text-main rounded-xl px-4 py-3 border border-gray-200 dark:border-zinc-700 font-medium focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-colors outline-none"
                      />
                      <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-2 font-black uppercase">
                        Current Effective API Endpoint:
                        <code className="block bg-gray-100 dark:bg-zinc-850 p-2 rounded mt-1 font-mono break-all text-xs text-[var(--primary)] font-normal normal-case">
                          {tempApiUrl.trim() || 'https://transport-manager-560593056744.europe-west1.run.app'}
                        </code>
                      </p>
                    </div>

                    <div className="flex gap-2 bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded-lg border border-yellow-100 dark:border-yellow-900/30">
                      <p className="text-[10px] text-yellow-700 dark:text-yellow-500 font-bold leading-normal">
                        Note: Leave empty to automatically fallback to FleetPro's default system servers. If you host a private backend server, enter its full secure address starting with https://.
                      </p>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        
                        type="button"
                        onClick={() => {
                          setTempApiUrl('');
                          localStorage.removeItem('API_BASE_URL');
                          showFeedback('Reset to Default Server URL');
                        }}
                        className="text-xs font-black uppercase tracking-wider text-red-500 bg-red-500/10 hover:bg-red-500/20 h-10 px-4 rounded-lg flex items-center gap-1 transition-colors"
                      >
                        <X size={14} />
                        Reset to Default
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'BACKUP' && (
              <div className="space-y-6">
                <div className="p-5 bg-theme-card rounded-xl border border-black/5 dark:border-white/5 space-y-6 shadow-sm">
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="w-16 h-16 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mb-2" style={{ color: primaryColor, backgroundColor: `${primaryColor}10` }}>
                      <Database size={32} />
                    </div>
                    <h2 className="text-lg font-black text-text-main uppercase">Backup & Restore</h2>
                    <p className="text-xs text-text-muted font-bold max-w-[280px]">
                      Securely export or restore your application data offline or to the cloud.
                    </p>
                  </div>

                  {/* 2. Google Drive Backup Option */}
                  <div className="p-4 rounded-xl border border-dashed border-emerald-500/30 bg-theme-card/50 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1 px-2.5 rounded text-[10px] uppercase font-black tracking-widest bg-emerald-500 text-white">
                          Cloud
                        </div>
                        <h3 className="text-xs font-black uppercase text-text-main">Google Drive Cloud</h3>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
                        Active
                      </span>
                    </div>
                    <p className="text-[11px] text-text-muted font-bold leading-relaxed">
                      Save your backup file directly in a secure, hidden folder in your Google Drive cloud storage. Firestore serves as the application's real-time sync database, while Google Drive acts as standard file-level cloud backups.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        
                        onClick={exportData}
                        className="h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-md cursor-pointer transition-colors"
                      >
                        <Download size={16} />
                        Cloud Export
                      </button>

                      <button
                        
                        onClick={importData}
                        className="h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-md cursor-pointer transition-colors"
                      >
                        <Upload size={16} />
                        Cloud Import
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-200 dark:border-yellow-900/20">
                    <p className="text-[10px] text-yellow-700 dark:text-yellow-500 font-bold leading-relaxed">
                      <span className="uppercase block mb-1">Important:</span>
                      Restoring data will overwrite your current local data and reload the application. Please ensure you have backed up your current data securely if needed.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'THEME' && (
              <>
                <div className="grid grid-cols-1 gap-4 allow-animation">
                  {[
                    { id: 'dark', label: 'Dark Mode', icon: <Sun size={20} />, color: 'bg-orange-500' },
                    { id: 'light', label: 'Light Mode', icon: <Diamond size={20} />, color: 'bg-[var(--primary)]' }
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      
                      onClick={() => {
                        setAppThemeMode(mode.id as any);
                        showFeedback(`${mode.label} activated`);
                      }}
                      className={`relative flex items-center justify-between h-16 px-4 rounded-lg shadow-sm border ${
                        appThemeMode === mode.id
                          ? 'border-[var(--primary)] bg-white dark:bg-zinc-800 text-[var(--primary)]'
                          : 'border-transparent bg-theme-card hover:bg-gray-50 dark:hover:bg-white/5 text-text-main'
                      }`}
                    >
                      {appThemeMode === mode.id && (
                        <div
                          
                          className="absolute inset-0 bg-[var(--primary)]/10 rounded-lg z-0"
                          
                        />
                      )}
                      <div className="flex items-center gap-4 relative z-10">
                        <div className={`p-2 rounded-lg ${appThemeMode === mode.id ? 'text-[var(--primary)]' : 'text-primary'}`}>
                          {mode.icon}
                        </div>
                        <span className={`font-black text-sm uppercase tracking-tight`}>
                          {mode.label}
                        </span>
                      </div>
                      {appThemeMode === mode.id && (
                        <div className="w-6 h-6 rounded-full bg-transparent flex items-center justify-center text-[var(--primary)] relative z-10">
                          <Check size={14} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}

            {activeSection === 'SECURITY' && (
              <div className="space-y-6">
                {user?.isFirstLogin && (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/50 rounded-lg">
                    <p className="text-amber-500 font-bold text-sm">
                      {language === 'bn' 
                        ? 'নিরাপত্তার জন্য অনুগ্রহ করে আপনার পাসওয়ার্ড পরিবর্তন করুন। নতুন পাসওয়ার্ড সেট না করা পর্যন্ত আপনি ড্যাশবোর্ডে প্রবেশ করতে পারবেন না।' 
                        : 'For security reasons, please change your password. You will not be able to access the dashboard until a new password is set.'}
                    </p>
                  </div>
                )}
                <div className="p-3 bg-theme-card rounded-lg space-y-2">
                  <p className="text-xs font-black text-text-main uppercase mb-3">Change Password</p>
                  <div className="grid grid-cols-1 gap-4">
                    <InputField 
                      label="Current Password" 
                      type="password" 
                      value={currentPassword} 
                      onChange={(e) => setCurrentPassword(e.target.value)} 
                      icon={<Lock size={16} />}
                    />
                    <InputField 
                      label="New Password" 
                      type="password" 
                      value={newPassword} 
                      onChange={(e) => setNewPassword(e.target.value)} 
                      icon={<Lock size={16} />}
                    />
                    <InputField 
                      label="Confirm Password" 
                      type="password" 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                      icon={<Lock size={16} />}
                    />
                  </div>
                  <div className="pt-4">
                    <button 
                      
                      onClick={handlePasswordChange}
                      className="w-full h-14 rounded-lg font-bold text-xs shadow-sm transition-colors uppercase tracking-widest text-white"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Update Password
                    </button>
                  </div>
                </div>

                {user?.role === 'ADMIN' && (
                  <div className="p-3 bg-theme-card rounded-lg space-y-6">
                    <p className="text-xs font-black text-text-main uppercase mb-3">Update Admin PIN</p>
                    <InputField 
                      label="New 4-Digit PIN" 
                      type="password" 
                      value={newAdminPin} 
                      onChange={(e) => {
                        const val = e.target.value;
                        if (/^\d{0,4}$/.test(val)) setNewAdminPin(val);
                      }}
                      icon={<Lock size={16} />}
                    />
                    <button 
                      
                      onClick={handleAdminPinUpdate}
                      className="w-full h-14 rounded-lg font-bold text-xs shadow-sm transition-colors uppercase tracking-widest text-white"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Update PIN
                    </button>
                  </div>
                )}

                <div className="p-4 bg-theme-card rounded-lg space-y-4 mt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone size={16} style={{ color: 'var(--text-main)' }} />
                      <p className="text-xs font-black text-text-main uppercase">Google Authenticator</p>
                    </div>
                    <button 
                      onClick={handleToggle2FA}
                      className={`w-12 h-6 rounded-full transition-colors relative ${is2FAEnabled ? '' : 'bg-gray-300 dark:bg-gray-600'}`}
                      style={is2FAEnabled ? { backgroundColor: primaryColor } : {}}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${is2FAEnabled ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                  
                  {show2FASetup && !is2FAEnabled && (
                    <div className="mt-4 space-y-4">
                      <p className="text-xs font-black text-text-main text-center">Scan this QR code with your Google Authenticator app</p>
                      <div className="flex justify-center bg-white p-2 rounded-lg inline-block mx-auto shadow-sm">
                        {twoFAUrl && <QRCodeSVG value={twoFAUrl} size={150} />}
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-text-main uppercase font-black mb-1">Or enter this code manually</p>
                        <div className="flex items-center justify-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-lg">
                          <p className="text-xs font-mono font-black text-text-main tracking-widest">{twoFASecret}</p>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(twoFASecret);
                              showFeedback('Secret key copied to clipboard');
                            }}
                            className={`p-1 text-text-main hover:text-[var(--primary)] transition-colors`}
                          >
                            <Copy size={14} />
                          </button>
                        </div>
                      </div>
                      <InputField 
                        label="Authentication Code" 
                        type="tel" 
                        inputMode="numeric" 
                        value={authCode} 
                        onChange={(e) => setAuthCode(e.target.value)} 
                      />
                      <div className="flex gap-2 pb-2">
                        <button 
                          onClick={() => setShow2FASetup(false)}
                          className="flex-1 h-14 bg-red-500 text-white rounded-lg font-bold text-xs active:scale-95 transition-colors uppercase tracking-widest"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={handleConfirm2FA}
                          className="flex-1 h-14 text-white rounded-lg font-bold text-xs shadow-sm active:scale-95 transition-colors uppercase tracking-widest"
                          style={{ backgroundColor: primaryColor }}
                        >
                          Verify & Enable
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                </div>
            )}

            {activeSection === 'ZOOM' && (
              <div className="flex items-center justify-between p-4 bg-theme-card rounded-lg">
                <button 
                  
                  onClick={() => {
                    setZoom(Math.max(0.5, zoom - 0.1));
                    showFeedback('Zoom level decreased');
                  }}
                  className={`w-16 h-16 flex items-center justify-center bg-transparent rounded-full text-text-main transition-colors shadow-sm`}
                >
                  <ZoomOut size={24} />
                </button>
                <div className="text-center">
                  <p className="text-4xl font-black" style={{ color: primaryColor }}>{Math.round(zoom * 100)}%</p>
                  <p className="text-xs font-black text-text-main uppercase mt-2">Zoom</p>
                </div>
                <button 
                  
                  onClick={() => {
                    setZoom(Math.min(1.5, zoom + 0.1));
                    showFeedback('Zoom level increased');
                  }}
                  className={`w-16 h-16 flex items-center justify-center bg-transparent rounded-full text-text-main transition-colors shadow-sm`}
                >
                  <ZoomIn size={24} />
                </button>
              </div>
            )}

            {activeSection === 'TYPOGRAPHY' && (
              <div className="space-y-4">
                <div className="p-3 bg-theme-card rounded-lg space-y-2">
                  <div>
                    <label className="text-xs font-black text-text-main uppercase mb-2 block">Font Style</label>
                    <button
                      type="button"
                      onClick={() => setIsFontSelectOpen(true)}
                      className="w-full h-14 px-4 rounded-lg bg-white dark:bg-gray-800 border border-neutral-200 dark:border-zinc-850 flex items-center justify-between font-bold text-sm text-text-main transition-colors active:scale-[0.99]"
                    >
                      <span>{fontStyle}</span>
                      <ChevronDown size={16} className="text-text-muted" />
                    </button>

                    <GlobalFullscreenSelect
                      isOpen={isFontSelectOpen}
                      onClose={() => setIsFontSelectOpen(false)}
                      onSelect={(val) => {
                        setFontStyle(val);
                        setIsFontSelectOpen(false);
                      }}
                      options={["Inter", "Roboto", "Open Sans", "Lato", "Montserrat", "Calibri"].map(f => ({ label: f, value: f }))}
                      title={language === 'bn' ? 'ফন্ট স্টাইল নির্বাচন' : 'Select Font Style'}
                      selectedValue={fontStyle}
                      searchable={false}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-black text-text-main uppercase">Font Size</label>
                      <span className="text-xs font-bold" style={{ color: primaryColor }}>{fontSize}px</span>
                    </div>
                    <input 
                      type="range" 
                      min="10" 
                      max="24" 
                      value={fontSize}
                      onChange={(e) => setFontSize(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      style={{ accentColor: primaryColor }}
                    />
                    <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-bold">
                      <span>Small</span>
                      <span>Large</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <label className="text-xs font-black text-text-main uppercase">Bold Font</label>
                    <button 
                      onClick={() => setFontBold(!fontBold)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${fontBold ? '' : 'bg-gray-300 dark:bg-gray-600'}`}
                      style={fontBold ? { backgroundColor: primaryColor } : {}}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${fontBold ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                </div>
                
                <div className="p-4 bg-theme-card rounded-lg">
                  <p className="text-xs font-bold text-text-muted uppercase mb-2">Preview</p>
                  <p className="text-text-main mt-2">The quick brown fox jumps over the lazy dog.</p>
                  <p className="text-text-main mt-2">১২৩৪৫৬৭৮৯০</p>
                </div>
              </div>
            )}

            {activeSection === 'THEME_SETTINGS' && (
              <div className="space-y-3">
                {/* App Theme Mode Selector Card */}
                <div className="p-4 bg-theme-card rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <Palette size={18} style={{ color: primaryColor }} />
                    <p className="text-xs font-black text-text-main uppercase">
                      {language === 'bn' ? 'অ্যাপ থিম মোড' : 'App Theme Mode'}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'dark', label: language === 'bn' ? 'ডার্ক মোড' : 'Dark Mode', icon: <Moon size={18} /> },
                      { id: 'light', label: language === 'bn' ? 'লাইট মোড' : 'Light Mode', icon: <Sun size={18} /> }
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        
                        onClick={() => {
                          setAppThemeMode(mode.id as any);
                          showFeedback(`${mode.label} activated`);
                        }}
                        className={`relative flex items-center justify-center gap-2 h-12 px-3 rounded-lg shadow-sm transition-colors border ${
                          appThemeMode === mode.id
                            ? `border-emerald-500 bg-emerald-500/10 font-bold ${(appThemeMode === 'dark' || theme === 'night-mode') ? 'text-emerald-400' : 'text-emerald-700'}`
                            : (appThemeMode === 'dark' || theme === 'night-mode')
                              ? 'border-white/10 bg-white/5 hover:bg-white/10 text-white'
                              : 'border-black/10 bg-black/5 hover:bg-black/10 text-text-main'
                        }`}
                      >
                        {mode.icon}
                        <span className="text-xs uppercase tracking-tight">{mode.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Default Preset Themes Card */}
                <div className="p-4 bg-theme-card rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <Palette size={18} style={{ color: primaryColor }} />
                    <p className="text-xs font-black text-text-main uppercase">
                      {language === 'bn' ? 'ডিফল্ট থিম কালার' : 'Default Theme Colors'}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {LIGHT_THEME_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        
                        onClick={() => {
                          setPrimaryColor(preset.primary);
                          setBackgroundColor(preset.bg);
                          setHeaderBg(preset.header);
                          setNavBg(preset.header);
                          setWallpaper('');
                          showFeedback(
                            language === 'bn' 
                              ? `${preset.name} থিম সেট করা হয়েছে` 
                              : `${preset.name} theme activated`
                          );
                        }}
                        className={`p-2.5 rounded-lg border flex flex-col items-center gap-1.5 transition-colors text-center group cursor-pointer shadow-sm ${
                          primaryColor === preset.primary && backgroundColor === preset.bg
                            ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)] font-bold'
                            : (appThemeMode === 'dark' || theme === 'night-mode')
                              ? 'border-white/10 bg-white/5 hover:bg-white/10 text-white'
                              : 'border-black/10 bg-black/5 hover:bg-black/10 text-text-main'
                        }`}
                        >
                        {/* Sample Color Bubbles */}
                        <div className="flex gap-1">
                          <span className="w-5 h-5 rounded-full border border-black/10 shadow-inner" style={{ background: preset.header }} />
                          <span className="w-5 h-5 rounded-full border border-black/10 shadow-inner" style={{ background: preset.bg }} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-tight">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Layout Color Selector */}
                <MenuItem 
                  icon={<LayoutGrid size={20} />} 
                  title="Layout Color" 
                  onClick={() => setActiveSection('LAYOUT_COLOR_SETTINGS')} 
                  color={primaryColor}
                />

                {/* Multiple Color Menu Item */}
                <MenuItem 
                  icon={<Palette size={20} />} 
                  title={t.MULTI_COLOR_THEME} 
                  onClick={() => setActiveSection('MULTI_COLOR_SETTINGS')} 
                  color="var(--primary)"
                />

                {/* Main App Background Image */}
                <div className="p-3 bg-theme-card rounded-lg space-y-2 !border-0">
                  <div className="flex items-center gap-2 mb-2">
                    <ImageIcon size={18} style={{ color: primaryColor }} />
                    <p className="text-xs font-black text-text-main uppercase">App Background Image</p>
                  </div>
                  
                  <div className="space-y-2">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setWallpaper(reader.result as string);
                            showFeedback('App wallpaper updated');
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full text-xs text-text-main file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[var(--primary)] file:text-white hover:file:opacity-90 cursor-pointer file:cursor-pointer transition-colors !border-0 !outline-none"
                    />
                  </div>

                  {wallpaper && (
                    <button 
                      onClick={() => {
                        setWallpaper('');
                        showFeedback('App wallpaper removed');
                      }}
                      className="w-full py-2 text-red-500 font-bold text-xs rounded-lg hover:bg-red-50 active:scale-[0.98] transition-colors border border-red-500/10"
                    >
                      Remove App Wallpaper
                    </button>
                  )}
                </div>

                {/* Login Page Background Image */}
                <div className="p-3 bg-theme-card rounded-lg space-y-2 !border-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock size={18} style={{ color: primaryColor }} />
                    <p className="text-xs font-black text-text-main uppercase">Login Page Background Image</p>
                  </div>
                  
                  <div className="space-y-2">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setLoginWallpaper(reader.result as string);
                            showFeedback('Login wallpaper updated');
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full text-xs text-text-main file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[var(--primary)] file:text-white hover:file:opacity-90 cursor-pointer file:cursor-pointer transition-colors !border-0 !outline-none"
                    />
                  </div>

                  {loginWallpaper && (
                    <button 
                      
                      onClick={() => {
                        setLoginWallpaper('');
                        showFeedback('Login wallpaper removed');
                      }}
                      className="w-full py-2 text-red-500 font-bold text-xs rounded-lg hover:bg-red-50 transition-colors border border-red-500/10"
                    >
                      Remove Login Wallpaper
                    </button>
                  )}
                </div>
              </div>
            )}

            {activeSection === 'LAYOUT_COLOR_SETTINGS' && (
              <div className="space-y-6">
                <div className="p-4 bg-theme-card rounded-lg !border-0 shadow-xl">
                  <div className="flex items-center gap-2 mb-6 pb-2 border-b border-gray-100 dark:border-white/5">
                    <Plus size={20} style={{ color: primaryColor }} />
                    <p className="text-sm font-black uppercase tracking-widest" style={{ color: primaryColor }}>Custom Layout Color</p>
                  </div>
                  <MultiColorCreator 
                    onApply={(gradient) => {
                      setHeaderBg(gradient);
                      setNavBg(gradient);
                      showFeedback('Custom  color applied');
                    }} 
                    showFeedback={showFeedback} 
                    initialGradient={headerBg}
                    hidePresets={true}
                  />
                </div>
              </div>
            )}

            {(activeSection === 'MULTI_COLOR_SETTINGS' || activeSection === 'MULTI_COLOR_SETTINGS_APP') && (
              <div className="space-y-6">
                <div className="p-6 bg-white dark:bg-[#121214] rounded-2xl space-y-4 dashboard-card-glow relative z-10 scale-[1.02] transition-colors duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <Smartphone size={18} className="text-[var(--primary)]" />
                    <p className="text-xs font-black text-text-main uppercase">
                      {language === 'bn' ? 'কাস্টম মাল্টি-কালার মিক্সার' : language === 'ar' ? 'مزيج متعدد الألوان مخصص' : 'Custom Multi-Color Mixer'}
                    </p>
                  </div>
                  <MultiColorCreator 
                    onApply={(gradient) => {
                      setBackgroundColor(gradient);
                      setHeaderBg(gradient);
                      setNavBg(gradient);
                      setWallpaper('');
                      showFeedback(
                        language === 'bn'
                          ? 'অ্যাপ ব্যাকগ্রাউন্ড, হেডার ও নেভিগেশন একই সাথে আপডেট করা হয়েছে'
                          : 'App background, header, and navigation updated together'
                      );
                    }} 
                    showFeedback={showFeedback} 
                    initialGradient={backgroundColor}
                    hidePresets={true}
                  />
                  <div className="pt-2">
                    <button 
                      
                      onClick={() => {
                        setBackgroundColor('');
                        setHeaderBg('');
                        setNavBg('');
                        showFeedback(
                          language === 'bn'
                            ? 'অ্যাপ ব্যাকগ্রাউন্ড ও লেআউট কালার রিসেট করা হয়েছে'
                            : 'App background and  colors reset'
                        );
                      }}
                      className="w-full py-2 bg-transparent text-text-muted rounded text-xs font-bold hover:bg-gray-100 dark:hover:bg-white/5 transition-colors border border-dashed border-gray-300 dark:border-white/10"
                    >
                      {language === 'bn' ? 'রিসেট অ্যাপ কালার' : 'Reset App Color'}
                    </button>
                  </div>
                </div>

                {/* Popular Presets in a SEPARATE Card */}
                <div className="p-6 bg-white dark:bg-[#121214] rounded-2xl space-y-4 dashboard-card-glow relative z-10 scale-[1.02] transition-colors duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <Palette size={18} className="text-[var(--primary)]" />
                    <p className="text-xs font-black text-text-main uppercase">
                      {language === 'bn' ? 'পপুলার প্রিসেটস' : language === 'ar' ? 'الإعدادات المسبقة الشائعة' : 'Popular Presets'}
                    </p>
                  </div>
                  <p className="text-[10px] text-text-muted font-semibold leading-relaxed">
                    {language === 'bn' 
                      ? 'নিচের যেকোনো একটি ব্যাকগ্রাউন্ড সিলেক্ট করে অ্যাপে সরাসরি মাল্টি-কালার থিম যুক্ত করুন:' 
                      : 'Select any of the gradients below to apply a beautiful preset theme directly to your app:'}
                  </p>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-2">
                    {PRESET_BACKGROUNDS.filter(p => p.color.includes('gradient')).map((preset, idx) => (
                      <button
                        key={idx}
                        
                        onClick={() => {
                          setBackgroundColor(preset.color);
                          setHeaderBg(preset.color);
                          setNavBg(preset.color);
                          setWallpaper('');
                          showFeedback(
                            language === 'bn'
                              ? `${preset.name} প্রিসেট থিম সফলভাবে সেট করা হয়েছে`
                              : `${preset.name} preset theme applied successfully`
                          );
                        }}
                        className="aspect-square rounded-lg shadow-sm border border-black/5 dark:border-white/10 overflow-hidden relative group"
                        style={{ background: preset.color }}
                        title={preset.name}
                      >
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Plus size={16} className="text-white" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'LANGUAGE' && (
              <>
                <div className="grid grid-cols-1 gap-4 allow-animation">
                  {languages.map((item) => (
                    <button
                      key={item.id}
                      
                      onClick={() => {
                        setLanguage(item.id);
                        showFeedback(`Language changed to ${item.label}`);
                      }}
                      className={`relative flex items-center justify-between h-14 px-4 rounded-lg transition-colors duration-300 ${
                        language === item.id
                          ? 'text-cyan-600 dark:text-cyan-400 shadow-sm'
                          : 'bg-theme-card hover:bg-gray-50 dark:hover:bg-white/5 text-text-main'
                      }`}
                    >
                      {language === item.id && (
                        <div
                          
                          className="absolute inset-0 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg z-0"
                          
                        />
                      )}
                      <div className="flex items-center gap-4 relative z-10">
                        <span className="text-2xl">{item.flag}</span>
                        <span className={`font-black text-sm`}>
                          {item.label}
                        </span>
                      </div>
                      {language === item.id && <Check size={20} className="text-cyan-500 relative z-10" />}
                    </button>
                  ))}
                </div>
              </>
            )}

            {activeSection === 'CURRENCY' && (
              <>
                <div className="grid grid-cols-1 gap-4 allow-animation">
                  {currencies.map((item) => (
                    <button
                      key={item.code}
                      
                      onClick={() => {
                        setSelectedCurrency(item.code);
                        showFeedback(`Currency changed to ${item.code}`);
                      }}
                      className={`relative flex items-center justify-between h-14 px-4 rounded-lg transition-colors duration-300 ${
                        selectedCurrency === item.code
                          ? 'text-cyan-600 dark:text-cyan-400 shadow-sm'
                          : 'bg-theme-card hover:bg-gray-50 dark:hover:bg-white/5 text-text-main'
                      }`}
                    >
                      {selectedCurrency === item.code && (
                        <div
                          
                          className="absolute inset-0 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg z-0"
                          
                        />
                      )}
                      <div className="flex items-center gap-3 relative z-10">
                        <span className={`font-black text-sm tracking-widest`}>
                          {item.code}
                        </span>
                        <span className={`text-xs font-bold ${
                          selectedCurrency === item.code 
                            ? 'text-cyan-500/70 dark:text-cyan-400/70' 
                            : 'text-gray-500'
                        }`}>
                          {item.name}
                        </span>
                      </div>
                      {selectedCurrency === item.code && <Check size={20} className="text-cyan-500 relative z-10" />}
                    </button>
                  ))}
                </div>
              </>
            )}

            {activeSection === 'LOGO' && (
              <div className="space-y-6">
                <div className="p-6 bg-theme-card rounded-lg flex flex-col items-center gap-6">
                  <div className="relative w-32 h-32 p-4 bg-black/5 dark:bg-white/5 rounded-lg flex items-center justify-center">
                    <img src={logo} alt="Logo" className="w-full h-full object-contain" />
                  </div>
                  <div className="w-full space-y-4">
                    <p className="text-xs font-black text-text-main uppercase text-center">Change App Logo</p>
                    <div className="relative group">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setLogo(reader.result as string);
                              showFeedback('App logo updated successfully');
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="w-full py-3 px-4 text-white font-black text-[10px] uppercase tracking-widest rounded-lg text-center flex items-center justify-center gap-2 transition-colors"
                        style={{ background: 'var(--primary)' }}
                      >
                        <Plus size={16} />
                        Upload New Logo
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setLogo('/logo.svg');
                        showFeedback('Logo reset to default');
                      }}
                      className="w-full py-3 text-red-500 font-black text-[10px] uppercase tracking-widest rounded-lg hover:bg-red-500/10 transition-colors border border-red-500/20"
                    >
                      Reset to Default
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
    </div>
  );

};

export default Settings;
