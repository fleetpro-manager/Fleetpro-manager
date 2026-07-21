import bcrypt from 'bcryptjs';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from '../store';
import { User } from '../types';
import { Truck, User as UserIcon, Shield, Menu, ChevronLeft, Home, Clock, Calendar, Cloud, LifeBuoy, Info, Globe, Check, Diamond, Phone, Mail, Facebook, Instagram, Youtube, MessageCircle, User as UserProfileIcon, ChevronDown, Eye, EyeOff, MapPin, Building, Zap, ShieldAlert, Loader2, Palette, Image as ImageIcon, Sun, Moon, Lock, Copy, ExternalLink, Sparkles, Camera } from 'lucide-react';

import { TRANSLATIONS, THEMES } from '../constants';
import { isExpired } from '../utils/dateUtils';
import InputField from '@/components/InputField';
import GlobalFullscreenSelect from '@/components/GlobalFullscreenSelect';
import RegistrationForm from '@/components/RegistrationForm';
import LoginMenuItems from '@/components/LoginMenuItems';
import PrayerTimes from '@/views/PrayerTimes';
import { getContrastColor } from '../utils/colorUtils';
import * as OTPAuth from 'otpauth';
import { getFirebaseCollection, deleteFirebaseDoc } from '../services/firebase';

const WhatsAppIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = "" }) => (
  <svg 
    viewBox="0 0 24 24" 
    width={size} 
    height={size} 
    className={className}
    fill="currentColor"
  >
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.725 1.451 5.486 0 9.95-4.46 9.954-9.94.002-2.657-1.033-5.155-2.915-7.037C16.53 1.745 14.036.712 11.41.712 5.923.712 1.46 5.174 1.456 10.66c-.001 1.708.452 3.374 1.312 4.842l-.993 3.63 3.717-.975zm10.156-5.416c-.28-.141-1.66-.82-1.916-.914-.258-.094-.446-.141-.634.141-.188.281-.727.914-.891 1.102-.164.187-.328.21-.607.07-.28-.141-1.18-.435-2.249-1.39-1.291-1.152-1.34-1.242-1.425-1.336-.086-.094-.01-.11.062-.181.063-.063.14-.164.21-.247.072-.082.095-.141.143-.235.047-.094.024-.176-.012-.247-.035-.071-.634-1.528-.868-2.09-.228-.549-.46-.474-.634-.482-.164-.008-.352-.01-.54-.01-.188 0-.493.07-.75.352-.259.282-.987.962-.987 2.348 0 1.387 1.008 2.72 1.149 2.91.14.187 1.984 3.029 4.809 4.244.672.29 1.198.463 1.608.593.676.215 1.29.185 1.777.113.543-.08 1.66-.679 1.895-1.336.235-.656.235-1.22.164-1.336-.07-.117-.258-.188-.539-.329z" />
  </svg>
);

const FormSection: React.FC<{ title: string; icon: any; children: React.ReactNode; style?: React.CSSProperties }> = ({ title, icon: Icon, children, style }) => {
  return (
    <div className="rounded-xl p-4 shadow-sm space-y-3 relative group transition-all " style={style}>
      <div className="flex items-center gap-3 border-b border-white/10 pb-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-transparent flex items-center justify-center shadow-sm" style={{ color: 'var(--primary)' }}>
          <Icon size={16} />
        </div>
        <h3 
          className="font-black text-xs uppercase tracking-wider text-text-main"
        >
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
};

const SignupForm: React.FC<{ setActiveTab: (tab: 'signin' | 'signup') => void; cardStyle?: React.CSSProperties }> = ({ setActiveTab, cardStyle }) => {
  const { addUser, showFeedback, language } = useStore();
  const t = TRANSLATIONS[language];

  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (formData: any) => {
    const hashedPassword = await bcrypt.hash(formData.password, 10);
    
    const newUser: User = {
      id: formData.fullName,
      name: formData.fullName,
      email: formData.email,
      userId: formData.userId,
      password: hashedPassword,
      role: formData.accountType === 'COMPANY' ? 'ADMIN' : 'USER',
      status: 'PENDING',
      nationality: formData.nationality,
      religion: formData.religion,
      gender: formData.gender,
      dob: formData.dob,
      mobileNumber: formData.mobile,
      presentCountry: formData.country,
      division: formData.division,
      district: formData.district,
      upazila: formData.upazila,
      policeStation: formData.policeStation,
      postOffice: formData.postOffice,
      postalCode: formData.postalCode,
      area: formData.area,
      buildingNumber: formData.building,
      stateNumber: formData.state,
      zoomNumber: formData.zone,
      electricityNumber: formData.electricity,
      registrationDate: new Date().toLocaleString(),
    };
    addUser(newUser);
    setShowSuccess(true);
  };

  if (showSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 space-y-8 animate-fade-in">
        <div className="relative">
            <div
            
            
            className="w-24 h-24 rounded-full border-4 border-t-[var(--primary)]"
            style={{ borderColor: 'rgba(var(--primary-rgb), 0.2)', borderTopColor: 'var(--primary)' }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              
              
              
            >
              <Check size={48} strokeWidth={4} style={{ color: 'var(--primary)' }} />
            </div>
          </div>
        </div>
        
        <div className="text-center space-y-3">
          <h3 className="text-2xl font-black uppercase text-text-main">Registration Sent</h3>
          <p className="text-sm text-text-muted font-bold uppercase tracking-widest leading-relaxed max-w-xs mx-auto">
            Your application is currently under review. Login will be possible after Admin approval.
          </p>
        </div>
        
        <button 
          
          onClick={() => { setShowSuccess(false); setActiveTab('signin'); }}
          className="w-full max-w-xs h-14 bg-[var(--primary)] text-white font-black rounded-lg shadow-lg uppercase tracking-widest text-sm"
        >
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <RegistrationForm 
      onSubmit={handleSubmit} 
      cardStyle={cardStyle} 
      secondaryButtonLabel={language === 'bn' ? 'লগইন' : (language === 'ar' ? 'تسجيل الدخول' : 'Login')}
      onSecondaryClick={() => setActiveTab('signin')}
    />
  );
};

const Login: React.FC = () => {
  const { 
    setView, setUser, setLoginTime, loginWallpaper, setLoginWallpaper, 
    loginBackgroundColor, setLoginBackgroundColor, loginCardColor, setLoginCardColor, 
    backgroundColor, wallpaper, language, setLanguage, headerBg,
    supportInfo: supportInfoFromStore, setSupportInfo, theme, setTheme, showFeedback,
    isDarkMode, setIsDarkMode, isEyeComfort, setIsEyeComfort,
    appThemeMode, setAppThemeMode, adminPin: storedAdminPin, confirmAction, users, setUsers, updateUser, addUser,
    logo
  } = useStore();

  const supportInfo = supportInfoFromStore || {
    developerName: '',
    mobile: '',
    whatsapp: '',
    nationality: '',
    email: '',
    facebookProfile: '',
    facebookPage: '',
    instagram: '',
    youtube: '',
    mobileCountryCode: '',
    whatsappCountryCode: '',
    showDeveloperName: false,
    showMobile: false,
    showWhatsapp: false,
    showNationality: false,
    showEmail: false,
    showFacebookProfile: false,
    showFacebookPage: false,
    showInstagram: false,
    showYoutube: false,
  };
  const isAdmin = false;
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: 'spring', 
        stiffness: 100, 
        damping: 14 
      } 
    }
  };
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLoginSheet, setShowLoginSheet] = useState(false);
  const [isPinError, setIsPinError] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleCameraClick = () => {
    setIsActionSheetOpen(false);
    cameraInputRef.current?.click();
  };

  const handleGalleryClick = () => {
    setIsActionSheetOpen(false);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setSupportInfo({
          ...supportInfo,
          developerPhoto: base64String
        });
        showFeedback(language === 'bn' ? 'ফটো পরিবর্তন করা হয়েছে!' : 'Photo updated successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopyToClipboard = (text: string, fieldKey: string) => {
    if (!text) return;
    try {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedField(fieldKey);
        showFeedback(language === 'bn' ? 'কপি করা হয়েছে!' : language === 'ar' ? 'تم النسخ!' : 'Copied successfully!');
        setTimeout(() => setCopiedField(null), 2000);
      }).catch(() => {
        // Fallback for sandboxed iframes
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        setCopiedField(fieldKey);
        showFeedback(language === 'bn' ? 'কপি করা হয়েছে!' : language === 'ar' ? 'تم النسخ!' : 'Copied successfully!');
        setTimeout(() => setCopiedField(null), 2000);
      });
    } catch (err) {
      showFeedback('Failed to copy');
    }
  };
  const [showPrayerTimesModal, setShowPrayerTimesModal] = useState(false);
  const [showWeatherModal, setShowWeatherModal] = useState(false);
  const [showRamadanModal, setShowRamadanModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showAdminPinError, setShowAdminPinError] = useState(false);
  const [adminPinErrorMessage, setAdminPinErrorMessage] = useState('');

  const openModal = (modal: 'menu' | 'login' | 'support' | 'prayer_times' | 'weather' | 'ramadan' | 'about') => {
    if (modal === 'menu') {
      setIsMenuOpen(true);
      return;
    }
    
    setIsMenuOpen(false);
    setShowLoginSheet(false);
    setIsExpanded(false);
    setShowSupportModal(false);
    setShowPrayerTimesModal(false);
    setShowWeatherModal(false);
    setShowRamadanModal(false);
    setShowAboutModal(false);
    
    setTimeout(() => {
      if (modal === 'login') setShowLoginSheet(true);
      if (modal === 'support') setShowSupportModal(true);
      if (modal === 'prayer_times') setShowPrayerTimesModal(true);
      if (modal === 'weather') setShowWeatherModal(true);
      if (modal === 'ramadan') setShowRamadanModal(true);
      if (modal === 'about') setShowAboutModal(true);
    }, 300);
  };
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem('fleetpro_remember_me') === 'true';
  });

  useEffect(() => {
    const isRemembered = localStorage.getItem('fleetpro_remember_me') === 'true';
    if (isRemembered) {
      const savedUser = localStorage.getItem('fleetpro_saved_username') || '';
      const savedPass = localStorage.getItem('fleetpro_saved_password') || '';
      if (savedUser) setUsername(savedUser);
      if (savedPass) setPassword(savedPass);
    }
  }, []);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [recoveryUsername, setRecoveryUsername] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [recoveryStep, setRecoveryStep] = useState<1 | 2>(1);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [showLoginError, setShowLoginError] = useState(false);
  const [loginErrorMessage, setLoginErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAdminPinStep, setShowAdminPinStep] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [pendingAdminUser, setPendingAdminUser] = useState<any>(null);
  const t = TRANSLATIONS[language];

  const handleLogin = async () => {
    if (!username.trim()) {
      setLoginErrorMessage(t.USERNAME_REQUIRED || 'Please enter your User ID or Email');
      setShowLoginError(true);
      return;
    }
    if (!password.trim()) {
      setLoginErrorMessage(t.PASSWORD_REQUIRED || 'Please enter your password');
      setShowLoginError(true);
      return;
    }

    if (isLocked) {
      setLoginErrorMessage('Your account is temporarily locked due to too many failed attempts. Please try again later or contact support.');
      setShowLoginError(true);
      return;
    }

    const inputPassword = password.trim();

    setIsLoading(true);

    let latestUsers: any[] = [];
    try {
      const usersCol = await getFirebaseCollection('users') || [];
      const adminsCol = await getFirebaseCollection('admins') || [];
      
      // Permanently remove any old/redundant Admin accounts not matching our specific email
      for (const a of adminsCol) {
        if (a.email && a.email.toLowerCase() !== 'mdhassanahamed15@gmail.com') {
          console.log('Removing old admin from admins collection:', a.id);
          deleteFirebaseDoc('admins', a.id).catch(e => console.warn(e));
        }
      }
      for (const u of usersCol) {
        if (u.role === 'ADMIN' && u.email && u.email.toLowerCase() !== 'mdhassanahamed15@gmail.com') {
          console.log('Removing old admin from users collection:', u.id);
          deleteFirebaseDoc('users', u.id).catch(e => console.warn(e));
        }
      }

      const cleanUsersCol = usersCol.filter((u: any) => !(u.role === 'ADMIN' && u.email && u.email.toLowerCase() !== 'mdhassanahamed15@gmail.com'));
      const cleanAdminsCol = adminsCol.filter((a: any) => !(a.email && a.email.toLowerCase() !== 'mdhassanahamed15@gmail.com'));

      latestUsers = [...cleanUsersCol.filter((u: any) => u.id !== 'Admin'), ...cleanAdminsCol.map(a => ({ ...a, role: 'ADMIN' }))];
      if (latestUsers.length > 0) {
        setUsers(latestUsers);
      }
    } catch (error: any) {
      console.warn("[LOGIN FIRESTORE FETCH ERROR] - falling back to local users", error);
      setLoginErrorMessage('FIRESTORE ERROR: ' + (error?.message || String(error)));
      setShowLoginError(true);
      setIsLoading(false);
      return;
    }

    setTimeout(async () => {
      // Get users from localStorage
      const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
      let allAvailableUsers = (latestUsers && latestUsers.length > 0) 
        ? latestUsers 
        : ((users && users.length > 0) ? users : storedUsers);
      
      // Filter out old admin accounts to ensure new credentials are used
      allAvailableUsers = allAvailableUsers.filter((u: any) => 
        !(u.role === 'ADMIN' && u.email && u.email.toLowerCase() !== 'mdhassanahamed15@gmail.com')
      );
      
      const input = username.trim().toLowerCase();
      // Find user by userId or email or loginEmail or id case-insensitively
      let foundUser = allAvailableUsers.find((u: any) => {
        const uId = (u.id || '').toString().toLowerCase();
        const uUserId = (u.userId || '').toString().toLowerCase();
        const uEmail = (u.email || '').toString().toLowerCase();
        const uLoginEmail = (u.loginEmail || '').toString().toLowerCase();
        return uUserId === input || uEmail === input || uLoginEmail === input || uId === input;
      });

      if (!foundUser && (input === 'admin' || input === 'mdhassanahamed15@gmail.com')) {
        foundUser = {
          id: 'Admin',
          name: 'Admin',
          email: 'mdhassanahamed15@gmail.com',
          role: 'ADMIN',
          status: 'ENABLED',
          password: 'Admin',
          avatar: 'https://picsum.photos/seed/admin/200',
          isFirstLogin: true
        };
      }

      if (!foundUser) {
        setIsLoading(false);
        setLoginErrorMessage(t.USER_NOT_FOUND || 'User not found');
        setShowLoginError(true);
        return;
      }

      const storedPassword = (foundUser.password || '').toString();
      const inputPasswordTrimmed = inputPassword;

      const isHashed = storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$') || storedPassword.startsWith('$2y$');
      
      let isPasswordCorrect = false;
      if (isHashed) {
        isPasswordCorrect = await bcrypt.compare(inputPasswordTrimmed, storedPassword);
        // Robust fallback for default password if already hashed on first-time login
        if (!isPasswordCorrect && foundUser.role === 'ADMIN' && (foundUser.isFirstLogin !== false) && inputPasswordTrimmed.toLowerCase() === 'admin') {
          isPasswordCorrect = true;
        }
      } else {
        // Fallback or legacy plain text check
        isPasswordCorrect = storedPassword.trim() === inputPasswordTrimmed || 
                            storedPassword === inputPasswordTrimmed ||
                            (foundUser.role === 'ADMIN' && inputPasswordTrimmed.toLowerCase() === 'admin');
        
        // Migrate to hashed if plain text matches
        if (isPasswordCorrect) {
          const hashedPassword = await bcrypt.hash(inputPasswordTrimmed, 10);
          updateUser({ ...foundUser, password: hashedPassword });
        }
      }

      if (!isPasswordCorrect) {
        setIsLoading(false);
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        
        if (newAttempts >= 4) {
          setIsLocked(true);
          setLoginErrorMessage(t.ACCOUNT_LOCKED || 'Account locked');
        } else {
          setLoginErrorMessage(`${t.WRONG_PASSWORD || 'Incorrect password'}\nAttempt ${newAttempts}/4. You have ${4 - newAttempts} ${t.ATTEMPTS_LEFT || 'attempts left'}.`);
        }
        setShowLoginError(true);
        return;
      }

      if (rememberMe) {
        localStorage.setItem('fleetpro_remember_me', 'true');
        localStorage.setItem('fleetpro_saved_username', username);
        localStorage.setItem('fleetpro_saved_password', password);
      } else {
        localStorage.setItem('fleetpro_remember_me', 'false');
        localStorage.removeItem('fleetpro_saved_username');
        localStorage.removeItem('fleetpro_saved_password');
      }

      if (foundUser.role === 'ADMIN' || input === 'admin' || foundUser.id === 'Admin') {
        const adminDocId = foundUser.id === 'Admin' ? 'Admin' : (foundUser.id || 'Admin');
        
        setLoginTime(new Date());
        
        // Clean up redundant default template documents
        deleteFirebaseDoc('users', 'Admin').catch(e => console.warn('Could not delete redundant users/Admin:', e));

        const existingAdmin = allAvailableUsers.find((u: any) => u.email && u.email.toLowerCase() === 'mdhassanahamed15@gmail.com');
        const adminToLogin = existingAdmin ? { ...existingAdmin, role: 'ADMIN' } : {
          id: adminDocId,
          name: 'Admin',
          email: 'mdhassanahamed15@gmail.com',
          role: 'ADMIN',
          status: 'ENABLED',
          password: foundUser.password || 'Admin',
          avatar: 'https://picsum.photos/seed/admin/200',
          isFirstLogin: foundUser.isFirstLogin !== false
        };

        if (!existingAdmin) {
          addUser(adminToLogin);
        }
        
        setUser(adminToLogin);
        showFeedback(t.ADMIN_LOGIN_SUCCESS || 'Admin login successful');
        setView('DASHBOARD');
        setIsLoading(false);
        setShowAdminPinStep(false);
        return;
      }

      if (foundUser.status === 'PENDING') {
        setIsLoading(false);
        setLoginErrorMessage('Your account is pending admin approval. Please wait.');
        setShowLoginError(true);
        return;
      }

      // Account Expiry Check First
      if (foundUser.role !== 'ADMIN' && foundUser.expiryDate) {
        if (isExpired(foundUser.expiryDate)) {
          setIsLoading(false);
          const expiryErrorMsg = language === 'bn' 
            ? 'আপনার অ্যাকাউন্টটি এক্সপায়ার হয়েছে। অনুগ্রহ করে এডমিনের সাথে যোগাযোগ করে আপনার একাউন্ট রিনিউ করে পুনরায় চেষ্টা করুন।' 
            : language === 'ar' 
                ? 'لقد انتهت صلاحية حسابك. يرجى الاتصال بالمسؤول لتجديد حسابك والمحاولة مرة أخرى.' 
                : 'Your account has expired. Please contact the admin to renew your account and try again.';
          setLoginErrorMessage(expiryErrorMsg);
          setShowLoginError(true);
          return;
        }
      }

      if (foundUser.status === 'BLOCKED' || foundUser.status === 'DISABLED') {
        setIsLoading(false);
        const errorMsg = language === 'bn' 
            ? 'আপনার অ্যাকাউন্টটি ব্লক অথবা ডিজেবল করা হয়েছে। অনুগ্রহ করে অ্যাডমিনের সাথে যোগাযোগ করুন।' 
            : language === 'ar' 
                ? 'تم حظر أو تعطيل حسابك. يرجى الاتصال بالمسؤول.' 
                : 'Your account has been blocked or disabled. Please contact the admin.';
        setLoginErrorMessage(errorMsg);
        setShowLoginError(true);
        return;
      }


      setLoginTime(new Date());
      setUser(foundUser);
      showFeedback(t.LOGIN_SUCCESS);
      setView('DASHBOARD');
      setIsLoading(false);
    }, 1500);
  };

  const handleRecoverySubmit = async () => {
    if (recoveryStep === 1) {
      if (!recoveryUsername || !recoveryCode) {
        showFeedback('Please enter username and authenticator code', 'error');
        return;
      }
      if (recoveryCode.length !== 6) {
        showFeedback('Invalid authenticator code', 'error');
        return;
      }
      
      const targetUser = users.find(u => 
        (u.loginEmail && u.loginEmail.toLowerCase() === recoveryUsername.toLowerCase()) || 
        (u.email && u.email.toLowerCase() === recoveryUsername.toLowerCase()) ||
        (u.name && u.name.toLowerCase() === recoveryUsername.toLowerCase())
      );
      
      if (!targetUser) {
        showFeedback(t.USER_NOT_FOUND || 'User not found', 'error');
        return;
      }
      
      if (!targetUser.twoFASecret) {
        showFeedback('2FA has not been set up for this user', 'error');
        return;
      }

      const totp = new OTPAuth.TOTP({
        issuer: 'FleetPro',
        label: targetUser.email || 'user',
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(targetUser.twoFASecret)
      });
      const delta = totp.validate({ token: recoveryCode, window: 1 });
      
      if (delta !== null) {
        setRecoveryStep(2);
      } else {
        showFeedback('Invalid or expired code. Please try again.', 'error');
      }
    } else {
      if (newPassword !== confirmNewPassword) {
        showFeedback(t.PASSWORDS_DONT_MATCH || 'Passwords do not match', 'error');
        return;
      }
      if (!newPassword) {
        showFeedback(t.PASSWORD_REQUIRED || 'Please enter a new password', 'error');
        return;
      }
      
      const targetUser = users.find(u => 
        (u.loginEmail && u.loginEmail.toLowerCase() === recoveryUsername.toLowerCase()) || 
        (u.email && u.email.toLowerCase() === recoveryUsername.toLowerCase()) ||
        (u.name && u.name.toLowerCase() === recoveryUsername.toLowerCase())
      );
      
      if (targetUser) {
        try {
          const bcrypt = await import('bcryptjs');
          const hashedPassword = await bcrypt.hash(newPassword, 10);
          const { saveFirebaseDocMerge } = await import('@/services/firebase');
          const coll = targetUser.role === 'ADMIN' ? 'admins' : 'users';
          await saveFirebaseDocMerge(coll, targetUser.id, { password: hashedPassword });
          
          updateUser({ ...targetUser, password: hashedPassword });
          showFeedback(language === 'bn' ? 'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে' : language === 'ar' ? 'تم تغيير كلمة المرور بنجاح' : 'Password changed successfully');
          setShowForgotPassword(false);
          setRecoveryStep(1);
          setRecoveryUsername('');
          setRecoveryCode('');
          setNewPassword('');
          setConfirmNewPassword('');
        } catch (err) {
           console.error("Failed to recover password", err);
           showFeedback("Failed to update password in database", "error");
        }
      } else {
        showFeedback('Error: User not found during password update', 'error');
        setRecoveryStep(1);
      }
    }
  };

  const handleAdminPinSubmit = async () => {
    setIsPinError(false);
    setIsLoading(true);
    
    let actualPin = pendingAdminUser?.adminPin || storedAdminPin || '1133';
    const adminDocId = pendingAdminUser?.id || 'Admin';
    try {
      const { getDocFromServer, doc } = await import('firebase/firestore');
      const { db } = await import('@/services/firebase');
      const adminDoc = await getDocFromServer(doc(db, 'admins', adminDocId));
      if (adminDoc.exists() && adminDoc.data().adminPin) {
        actualPin = adminDoc.data().adminPin;
      }
    } catch (err) {
      console.warn('Could not fetch admin PIN from firestore, using local copy');
    }

    if (adminPin === actualPin) {
      
      let latestUsers: any[] = [];
      try {
        const usersCol = await getFirebaseCollection('users') || [];
        const adminsCol = await getFirebaseCollection('admins') || [];
        latestUsers = [...usersCol.filter((u: any) => u.id !== 'Admin'), ...adminsCol.map(a => ({ ...a, role: 'ADMIN' }))];
      } catch (err) {
        console.warn('Could not fetch users directly, falling back to store users');
      }
      const allAvailableUsers = latestUsers.length > 0 ? latestUsers : users;
      
      setTimeout(() => {
        setLoginTime(new Date());
        // Clean up redundant users/Admin document from Firestore
        deleteFirebaseDoc('users', 'Admin').catch(e => console.warn('Could not delete redundant users/Admin:', e));

        const existingAdmin = allAvailableUsers.find((u: any) => u.id === adminDocId || u.role === 'ADMIN');
        if (existingAdmin) {
          setUser(existingAdmin);
        } else {
          // Create the admin and explicitly add it to the state and Firebase, so it persists!
          const newAdminUser = {
            id: adminDocId,
            name: adminDocId,
            email: 'mdhassanahamed15@gmail.com',
            role: 'ADMIN',
            status: 'ENABLED',
            password: 'Admin',
            avatar: 'https://picsum.photos/seed/admin/200',
            isFirstLogin: true
          };
          addUser(newAdminUser);
          setUser(newAdminUser);
        }
        showFeedback(t.ADMIN_LOGIN_SUCCESS);
        setView('DASHBOARD');
        setIsLoading(false);
        setShowAdminPinStep(false);
      }, 500);
    } else {
      setIsLoading(false);
      setIsPinError(true);
      setTimeout(() => setIsPinError(false), 500);
      const pinErrorMsg = language === 'bn' 
        ? `ভুল সিকিউরিটি পিন! সঠিক পিন হলো: ${actualPin}` 
        : (language === 'ar' ? `رمز حماية خاطئ! الدبوس الصحيح هو: ${actualPin}` : `Invalid PIN! The correct PIN is: ${actualPin}`);
        setAdminPinErrorMessage(pinErrorMsg);
        setShowAdminPinError(true);
    }
  };

  const languages = [
    { id: 'en', label: 'English', flag: '🇺🇸' },
    { id: 'bn', label: 'Bangla', flag: '🇧🇩' },
    { id: 'ar', label: 'Arabic', flag: '🇶🇦' },
  ];

  const effectiveWallpaper = loginWallpaper || wallpaper || '';
  const effectiveBgColor = loginBackgroundColor || backgroundColor || '';
  const currentThemeObj = THEMES.find(t => t.id === theme) || THEMES[0];
  const effectiveHeaderBg = headerBg || currentThemeObj.primary;
  
  const isBackgroundLight = effectiveWallpaper ? false : (effectiveBgColor ? getContrastColor(effectiveBgColor) === '#000000' : false);
  const finalTextColor = isBackgroundLight ? '#000000' : '#ffffff';

  const layoutStyle = {
    '--primary': '#18181b', // Fixed neutral charcoal brand color for Login / Signup UI (no colorful theme color)
    '--theme-bg': effectiveBgColor || '#09090b', 
    '--theme-card': '#ffffff', // Fixed white card background
    '--text-main': finalTextColor,
    '--text-muted': isBackgroundLight ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)',
    '--text-color': finalTextColor,
  } as React.CSSProperties;

  const opaqueBgColor = activeTab === 'signup' ? '#ffffff' : '#18181b';

  const bgStyle: React.CSSProperties = {
    background: effectiveWallpaper 
      ? `url(${effectiveWallpaper}) center/cover no-repeat fixed` 
      : (effectiveBgColor || '#09090b'),
    color: finalTextColor,
    minHeight: '100vh', // Ensure it fills the screen
    height: '100%', 
  };

  const darkerBgStyle: React.CSSProperties = {
    ...bgStyle,
  };

  const cardContentColor = activeTab === 'signup' ? '#000000' : '#111827'; // Dark charcoal text as card background is WHITE
  const cardMutedColor = 'rgba(0, 0, 0, 0.6)';
  const loginCardIsDark = false;
  const inputBgSolid = '#ffffff';

  const cardBgStyle: React.CSSProperties = {
    backgroundColor: activeTab === 'signup' ? 'transparent' : '#ffffff', 
    border: activeTab === 'signup' ? 'none' : '1px solid rgba(0, 0, 0, 0.08)',
    boxShadow: activeTab === 'signup' ? 'none' : '0 10px 40px -10px rgba(0, 0, 0, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.6)',
  };

  const loginCardStyle: React.CSSProperties = {
    ...cardBgStyle,
    '--text-main': activeTab === 'signup' ? finalTextColor : '#111827',
    '--text-muted': activeTab === 'signup'
      ? (isBackgroundLight ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)')
      : 'rgba(17, 24, 39, 0.65)',
    '--text-color': activeTab === 'signup' ? finalTextColor : '#111827',
  } as React.CSSProperties;

  return (
    <>
      <div 
      
      
      
      className={`fixed inset-0 w-full h-full flex flex-col px-0 pb-0 ${activeTab === 'signup' ? 'pt-0 justify-start overflow-y-auto overflow-x-hidden' : 'justify-between pt-6 md:pt-6 overflow-hidden'} login-page modern-app-bg text-text-main ${isEyeComfort ? 'eye-comfort' : ''} ${language === 'ar' ? 'rtl' : 'ltr'}`}
      style={{ 
        ...bgStyle,
        ...layoutStyle
      }}
    >
      {/* Main Content Wrapper - Handles Background */}
      <div 
        className={`absolute inset-0 overflow-hidden pointer-events-none z-0 ${activeTab === 'signup' || effectiveWallpaper ? 'hidden' : ''}`}
        style={{
          background: effectiveBgColor || '#09090b'
        }}
      >
        {/* Fine gold micro-dots pattern Layer - subtle starry feel */}
        <div 
          className="absolute inset-0 opacity-[0.045]" 
          style={{
            backgroundImage: `radial-gradient(#f1f5f9 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}
        />
      </div>

      {/* Floating Header Controls */}
      <>
        {activeTab !== 'signup' && (
          <div
            
            
            
            
          >
            {/* Menu Button */}
            <button 
              
              
              onClick={() => openModal('menu')}
              className={`absolute top-safe left-6 p-3 rounded-lg shadow-lg z-50 border ${
                isBackgroundLight 
                  ? 'bg-white text-black border-black/5' 
                  : 'bg-[#18181b]/95 text-white border-white/5'
              }`}
            >
              <Menu size={24} />
            </button>
          </div>
        )}
      </>



      {/* Menu Drawer */}
      <>
        {isMenuOpen && (
          <>
            <div 
              
              
              
              
              className="fixed inset-0 bg-black/60 z-[110]"
              onClick={() => setIsMenuOpen(false)}
            />
            <div 
              
              
              
              variants={{
                hidden: { opacity: 0, scale: 0.98 },
                visible: { opacity: 1, scale: 1, transition: { type: 'tween', duration: 0, ease: [0.16, 1, 0.3, 1] } },
                exit: { opacity: 0, scale: 0.98, transition: { type: 'tween', duration: 0, ease: 'easeIn' } }
              }}
              className={`fixed top-0 ${language === 'ar' ? 'right-0 rounded-l-[13px]' : 'left-0 rounded-r-[13px]'} h-full w-[280px] shadow-2xl z-[120] flex flex-col overflow-hidden ${(!effectiveBgColor && !effectiveWallpaper) ? 'modern-app-bg' : ''} border-r ${effectiveBgColor && getContrastColor(effectiveBgColor) === '#000000' ? 'border-black/10' : 'border-white/10'}`}
              style={{ 
                ...bgStyle,
                ...layoutStyle,
                '--text-main': finalTextColor,
                '--text-muted': effectiveBgColor ? `${getContrastColor(effectiveBgColor)}99` : 'rgba(255, 255, 255, 0.6)',
                color: finalTextColor,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'scroll'
              } as any}
            >
              <div className="safe-top bg-black/20">
                <div className="h-20 px-6 flex flex-col justify-center">
                  <h2 className="text-xl font-black text-text-main uppercase tracking-tighter">FLEETPRO</h2>
                  <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest -mt-1">Control Center</p>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto py-4">
                <LoginMenuItems 
                  t={t} 
                  openModal={openModal} 
                  setActiveTab={setActiveTab} 
                  setView={setView} 
                  setIsMenuOpen={setIsMenuOpen} 
                  isLight={isBackgroundLight}
                />
              </div>
              
              <div className={`p-6 bg-black/20 border-t ${effectiveBgColor && getContrastColor(effectiveBgColor) === '#000000' ? 'border-black/10' : 'border-white/5'}`}>
                <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest opacity-40">Enterprise Edition • v2.6.0</p>
              </div>
            </div>
          </>
        )}
      </>

      {/* Login Error Modal */}
      <>
        {showLoginError && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div
              
              
              
              onClick={() => setShowLoginError(false)}
              className="absolute inset-0 bg-black/60"
            />
            <div
              
              
              
              className="relative bg-card-bg rounded-lg p-6 shadow-2xl max-w-sm w-full overflow-hidden"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div 
                  
                  
                  className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-500/30"
                >
                  <ShieldAlert size={32} />
                </div>
                <h3 className="text-xl font-black text-text-main">Login Failed</h3>
                <p className="text-sm font-bold text-text-main whitespace-pre-line">
                  {loginErrorMessage}
                </p>
                <button
                  
                  onClick={() => setShowLoginError(false)}
                  className="w-full py-3 mt-4 bg-red-500 text-white font-black rounded-lg hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </>

      {/* Admin PIN Error Modal */}
      <>
        {showAdminPinError && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div
              
              
              
              onClick={() => setShowAdminPinError(false)}
              className="absolute inset-0 bg-black/60"
            />
            <div
              
              
              
              className="relative bg-card-bg rounded-lg p-6 shadow-2xl max-w-sm w-full overflow-hidden"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div 
                  
                  
                  className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-500/30"
                >
                  <ShieldAlert size={32} />
                </div>
                <h3 className="text-xl font-black text-text-main">Access Denied</h3>
                <p className="text-sm font-bold text-text-main whitespace-pre-line">
                  {adminPinErrorMessage}
                </p>
                <button
                  
                  onClick={() => setShowAdminPinError(false)}
                  className="w-full py-3 mt-4 bg-red-500 text-white font-black rounded-lg hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </>



      {/* Support Modal */}
      <>
        {showSupportModal && (
          <>
            <div 
              
              
              
              className="fixed inset-0 bg-black/60 z-[80]"
              onClick={() => setShowSupportModal(false)}
            />
            <div 
              
              
              
              
              className={`fixed inset-0 z-[130] overflow-hidden flex flex-col ${(!effectiveBgColor && !effectiveWallpaper) ? 'modern-app-bg text-text-main' : ''}`}
              style={{ 
                ...bgStyle,
                ...layoutStyle
              }}
            >
              <div className="text-white primary-bg-text shadow-md z-10 safe-top" style={{ background: effectiveHeaderBg }}>
                <div className="h-16 px-4 flex items-center gap-3">
                  <button onClick={() => setShowSupportModal(false)} className="p-2 rounded-full active:scale-90 transition-all">
                    <ChevronLeft size={24} />
                  </button>
                  <h2 className="text-xl font-black tracking-tight uppercase tracking-widest">{t.SUPPORT}</h2>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-6 w-full max-w-lg mx-auto">
                <div 
                  
                  
                  
                  className="space-y-6"
                >
                  {/* Live Support Hub Header Banner */}
                  <div 
                    
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 p-5 text-white shadow-lg shadow-indigo-500/10"
                  >
                    <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 -ml-6 -mb-6 w-24 h-24 bg-cyan-400/20 rounded-full blur-xl pointer-events-none" />
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Sparkles size={14} className="text-cyan-300 animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-cyan-200">
                            {language === 'bn' ? 'সাপোর্ট ডেস্ক' : language === 'ar' ? 'مكتب المساعدة المباشر' : 'Live Support Hub'}
                          </span>
                        </div>
                        <h2 className="text-lg font-black tracking-tight">
                          {language === 'bn' ? 'আমরা কীভাবে সাহায্য করতে পারি?' : language === 'ar' ? 'كيف يمكننا مساعدتك اليوم؟' : 'How Can We Help You Today?'}
                        </h2>
                        <p className="text-xs text-indigo-100 max-w-md font-medium">
                          {language === 'bn' ? 'যেকোনো জিজ্ঞাসা বা সহায়তার জন্য আমাদের সাথে সরাসরি যোগাযোগ করুন।' : language === 'ar' ? 'اتصل بنا مباشرة لأي استفسارات أو دعم فني للمؤسسة.' : 'Get in touch with our official support channels directly for instant support.'}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 self-start sm:self-center bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20 shadow-inner">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                        </span>
                        <span className="text-[9px] font-extrabold uppercase tracking-widest text-white">
                          {language === 'bn' ? 'অনলাইন সহায়তা' : language === 'ar' ? 'الدعم المباشر متصل' : 'Active Support'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Details Cards Grid - Compact and Standardized Height of 130px */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-1.5 h-4 rounded bg-cyan-500" />
                      <h3 className="text-xs font-black text-text-muted uppercase tracking-widest">
                        {language === 'bn' ? 'যোগাযোগের বিস্তারিত' : language === 'ar' ? 'تفاصيل الاتصال' : 'Contact Details'}
                      </h3>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Developer / Owner Card */}
                      {supportInfo.developerName && (supportInfo.showDeveloperName || isAdmin) && (
                        <div 
                          
                          className="bg-theme-card rounded-xl p-3 border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 min-h-[190px] flex flex-col justify-between relative overflow-hidden group col-span-1 sm:col-span-2"
                        >
                          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          
                          {/* Hidden File Inputs */}
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*" 
                            onChange={handleFileChange} 
                          />
                          <input 
                            type="file" 
                            ref={cameraInputRef} 
                            className="hidden" 
                            accept="image/*" 
                            capture="user"
                            onChange={handleFileChange} 
                          />

                          {/* Profile Header Block: Centered Photo frame with custom label under it */}
                          <div className="flex flex-col items-center justify-center pt-1.5 pb-2">
                            {/* Photo Frame Container (8px radius) */}
                            <div 
                              onClick={() => setIsActionSheetOpen(true)}
                              className="relative w-16 h-16 rounded-[8px] bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-neutral-800 dark:to-neutral-900 border-2 border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center cursor-pointer overflow-hidden shadow-inner hover:scale-105 transition-transform group/frame"
                            >
                              {supportInfo.developerPhoto ? (
                                <img 
                                  src={supportInfo.developerPhoto} 
                                  alt={supportInfo.developerName} 
                                  className="w-full h-full object-cover rounded-[6px]"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <UserProfileIcon size={24} className="text-indigo-400 dark:text-indigo-500/75 group-hover/frame:text-indigo-500 transition-colors" />
                              )}
                              {/* Hover Indicator */}
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/frame:opacity-100 transition-opacity duration-200">
                                <Camera size={14} className="text-white animate-pulse" />
                              </div>
                            </div>

                            {/* Status Badge directly under photo frame */}
                            <div className="mt-1.5">
                              {supportInfo.showDeveloperName ? (
                                <div className="flex items-center gap-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest">
                                  <span>{language === 'bn' ? 'ডেভেলপার' : language === 'ar' ? 'المطور' : 'Developer'}</span>
                                </div>
                              ) : (
                                isAdmin && (
                                  <div className="flex items-center gap-1 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest">
                                    <ShieldAlert size={10} />
                                    <span>{language === 'bn' ? 'লুকানো' : language === 'ar' ? 'মখফি' : 'Hidden'}</span>
                                  </div>
                                )
                              )}
                            </div>

                            {/* Name directly below the frame & status */}
                            <div className="text-center mt-2">
                              <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">{t.DEVELOPER_NAME || 'Developer Name'}</p>
                              <p className="font-extrabold text-sm text-text-main mt-0.5 select-all">
                                {supportInfo.developerName}
                              </p>
                            </div>
                          </div>

                          {/* Footer: Nationality & Copy Button */}
                          <div className="flex items-center justify-between gap-3 pt-2 mt-1 border-t border-gray-100 dark:border-white/5 w-full">
                            <div className="flex items-center gap-1 text-[11px] text-text-muted font-extrabold uppercase tracking-wider">
                              <Globe size={12} className="text-indigo-500" />
                              <span>{supportInfo.nationality || (language === 'bn' ? 'গ্লোবাল' : language === 'ar' ? 'عالمي' : 'Global')}</span>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyToClipboard(supportInfo.developerName || '', 'developerName');
                              }}
                              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold border transition-all duration-200 ${
                                copiedField === 'developerName'
                                  ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-500/10 dark:border-indigo-500/20 dark:text-indigo-400'
                                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 dark:bg-white/5 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/10'
                              }`}
                            >
                              {copiedField === 'developerName' ? <Check size={11} className="text-indigo-500" /> : <Copy size={11} />}
                              <span>{copiedField === 'developerName' ? (language === 'bn' ? 'কপি হয়েছে' : language === 'ar' ? 'تم' : 'Copied') : (language === 'bn' ? 'কপি' : language === 'ar' ? 'নকল' : 'Copy')}</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* WhatsApp Card */}
                      {supportInfo.whatsapp && (supportInfo.showWhatsapp || isAdmin) && (
                        <div 
                          
                          className="bg-theme-card rounded-xl p-2.5 border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 h-[100px] flex flex-col justify-between relative overflow-hidden group"
                        >
                          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          
                          <div>
                            {/* Aligned Title and Live Status */}
                            <div className="flex items-center justify-between mb-1 gap-2 min-w-0">
                              <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">{t.WHATSAPP || 'WhatsApp'}</p>
                              
                              {supportInfo.showWhatsapp ? (
                                <div className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest shrink-0">
                                  <span className="relative flex h-1.5 w-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                                  </span>
                                  <span>{language === 'bn' ? 'সক্রিয় চ্যাট' : language === 'ar' ? 'نشط الآن' : 'Active Chat'}</span>
                                </div>
                              ) : (
                                isAdmin && (
                                  <div className="flex items-center gap-1 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest shrink-0">
                                    <ShieldAlert size={10} />
                                    <span>{language === 'bn' ? 'লুকানো' : language === 'ar' ? 'مখফি' : 'Hidden'}</span>
                                  </div>
                                )
                              )}
                            </div>

                            <div className="flex items-center gap-2 mt-0.5 min-w-0">
                              <div className="w-[26px] h-[26px] rounded-[8px] bg-gradient-to-br from-[#29E06D] to-[#19B958] flex items-center justify-center text-white shrink-0 shadow-sm">
                                <WhatsAppIcon size={14} />
                              </div>
                              <p className="font-extrabold text-sm text-text-main mt-0.5 truncate select-all">
                                {supportInfo.whatsappCountryCode ? `${supportInfo.whatsappCountryCode} ` : ''}{supportInfo.whatsapp}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-3 pt-1 border-t border-gray-100 dark:border-white/5">
                            <button
                              onClick={() => handleCopyToClipboard(`${supportInfo.whatsappCountryCode || ''}${supportInfo.whatsapp}`, 'whatsapp')}
                              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold border transition-all duration-200 ${
                                copiedField === 'whatsapp'
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400'
                                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 dark:bg-white/5 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/10'
                              }`}
                            >
                              {copiedField === 'whatsapp' ? <Check size={11} className="text-emerald-500 animate-pulse" /> : <Copy size={11} />}
                              <span>{copiedField === 'whatsapp' ? (language === 'bn' ? 'কপি হয়েছে' : language === 'ar' ? 'تم' : 'Copied') : (language === 'bn' ? 'কপি' : language === 'ar' ? 'نسখ' : 'Copy')}</span>
                            </button>

                            <a
                              href={`https://wa.me/${(supportInfo.whatsappCountryCode || '').replace('+', '')}${supportInfo.whatsapp?.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 px-3 py-1 rounded-md text-[11px] font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm shadow-emerald-500/10 active:scale-95 transition-all duration-200"
                            >
                              <WhatsAppIcon size={11} />
                              <span>{language === 'bn' ? 'চ্যাট করুন' : language === 'ar' ? 'محادثة' : 'Chat'}</span>
                            </a>
                          </div>
                        </div>
                      )}

                      {/* Mobile Support Card */}
                      {supportInfo.mobile && (supportInfo.showMobile || isAdmin) && (
                        <div 
                          
                          className="bg-theme-card rounded-xl p-2.5 border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 h-[100px] flex flex-col justify-between relative overflow-hidden group"
                        >
                          <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          
                          <div>
                            {/* Aligned Title and Live Status */}
                            <div className="flex items-center justify-between mb-1 gap-2 min-w-0">
                              <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">{t.MOBILE || 'Mobile Number'}</p>
                              
                              {supportInfo.showMobile ? (
                                <div className="flex items-center gap-1 bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest shrink-0">
                                  <span className="relative flex h-1.5 w-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500"></span>
                                  </span>
                                  <span>{language === 'bn' ? 'সরাসরি কল' : language === 'ar' ? 'اتصال مباشر' : 'Live Support'}</span>
                                </div>
                              ) : (
                                isAdmin && (
                                  <div className="flex items-center gap-1 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest shrink-0">
                                    <ShieldAlert size={10} />
                                    <span>{language === 'bn' ? 'লুকানো' : language === 'ar' ? 'মখফি' : 'Hidden'}</span>
                                  </div>
                                )
                              )}
                            </div>

                            <div className="flex items-center gap-2 mt-0.5 min-w-0">
                              <div className="w-[26px] h-[26px] rounded-[8px] bg-gradient-to-br from-[#1F8FFF] to-[#0062E0] flex items-center justify-center text-white shrink-0 shadow-sm">
                                <Phone size={13} />
                              </div>
                              <p className="font-extrabold text-sm text-text-main mt-0.5 truncate select-all">
                                {supportInfo.mobileCountryCode ? `${supportInfo.mobileCountryCode} ` : ''}{supportInfo.mobile}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-3 pt-1 border-t border-gray-100 dark:border-white/5">
                            <button
                              onClick={() => handleCopyToClipboard(`${supportInfo.mobileCountryCode || ''}${supportInfo.mobile}`, 'mobile')}
                              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold border transition-all duration-200 ${
                                copiedField === 'mobile'
                                  ? 'bg-cyan-50 border-cyan-200 text-cyan-600 dark:bg-cyan-500/10 dark:border-cyan-500/20 dark:text-cyan-400'
                                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 dark:bg-white/5 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/10'
                              }`}
                            >
                              {copiedField === 'mobile' ? <Check size={11} className="text-cyan-500 animate-pulse" /> : <Copy size={11} />}
                              <span>{copiedField === 'mobile' ? (language === 'bn' ? 'কপি হয়েছে' : language === 'ar' ? 'تم' : 'Copied') : (language === 'bn' ? 'কপি' : language === 'ar' ? 'نسখ' : 'Copy')}</span>
                            </button>

                            <a
                              href={`tel:${supportInfo.mobileCountryCode || ''}${supportInfo.mobile}`}
                              className="flex items-center gap-1 px-3 py-1 rounded-md text-[11px] font-bold bg-cyan-500 hover:bg-cyan-600 text-white shadow-sm shadow-cyan-500/10 active:scale-95 transition-all duration-200"
                            >
                              <Phone size={11} />
                              <span>{language === 'bn' ? 'কল করুন' : language === 'ar' ? 'اتصال' : 'Call'}</span>
                            </a>
                          </div>
                        </div>
                      )}

                      {/* Email Support Card */}
                      {supportInfo.email && (supportInfo.showEmail || isAdmin) && (
                        <div 
                          
                          className="bg-theme-card rounded-xl p-2.5 border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 h-[100px] flex flex-col justify-between relative overflow-hidden group"
                        >
                          <div className="absolute top-0 left-0 w-1 h-full bg-rose-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          
                          <div>
                            {/* Aligned Title and Live Status */}
                            <div className="flex items-center justify-between mb-1 gap-2 min-w-0">
                              <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">{t.EMAIL_ID || 'Email ID'}</p>
                              
                              {supportInfo.showEmail ? (
                                <div className="flex items-center gap-1 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest shrink-0">
                                  <span>{language === 'bn' ? '২৪/৭ সাপোর্ট' : language === 'ar' ? '٢٤/٧ دعم' : '24/7 Support'}</span>
                                </div>
                              ) : (
                                isAdmin && (
                                  <div className="flex items-center gap-1 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest shrink-0">
                                    <ShieldAlert size={10} />
                                    <span>{language === 'bn' ? 'লুকানো' : language === 'ar' ? 'মখফি' : 'Hidden'}</span>
                                  </div>
                                )
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2 mt-0.5 min-w-0">
                              <div className="w-[26px] h-[26px] rounded-[8px] bg-gradient-to-br from-[#FF5E55] to-[#E0241B] flex items-center justify-center text-white shrink-0 shadow-sm">
                                <Mail size={13} />
                              </div>
                              <p className="font-extrabold text-sm text-text-main mt-0.5 truncate select-all">
                                {supportInfo.email}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-3 pt-1 border-t border-gray-100 dark:border-white/5">
                            <button
                              onClick={() => handleCopyToClipboard(supportInfo.email || '', 'email')}
                              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold border transition-all duration-200 ${
                                copiedField === 'email'
                                  ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400'
                                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 dark:bg-white/5 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/10'
                              }`}
                            >
                              {copiedField === 'email' ? <Check size={11} className="text-rose-500 animate-pulse" /> : <Copy size={11} />}
                              <span>{copiedField === 'email' ? (language === 'bn' ? 'কপি হয়েছে' : language === 'ar' ? 'تم' : 'Copied') : (language === 'bn' ? 'কপি' : language === 'ar' ? 'نسখ' : 'Copy')}</span>
                            </button>

                            <a
                              href={`mailto:${supportInfo.email}`}
                              className="flex items-center gap-1 px-3 py-1 rounded-md text-[11px] font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-sm shadow-rose-500/10 active:scale-95 transition-all duration-200"
                            >
                              <Mail size={11} />
                              <span>{language === 'bn' ? 'ইমেইল করুন' : language === 'ar' ? 'إرسال بريد' : 'Email'}</span>
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>


                  {/* Social Links Hub - Staggered compact cards */}
                  {(() => {
                    const socialChannels = [
                      { icon: Facebook, label: 'Facebook', url: supportInfo.facebookProfile, show: supportInfo.showFacebookProfile, colorClass: 'text-blue-500 bg-blue-500/10 dark:bg-blue-500/20 dark:text-blue-400 hover:border-blue-500/40' },
                      { icon: Facebook, label: language === 'bn' ? 'এফবি পেজ' : language === 'ar' ? 'صفحة فيسبوك' : 'FB Page', url: supportInfo.facebookPage, show: supportInfo.showFacebookPage, colorClass: 'text-sky-600 bg-sky-500/10 dark:bg-sky-500/20 dark:text-sky-400 hover:border-sky-500/40' },
                      { icon: Instagram, label: 'Instagram', url: supportInfo.instagram, show: supportInfo.showInstagram, colorClass: 'text-pink-500 bg-pink-500/10 dark:bg-pink-500/20 dark:text-pink-400 hover:border-pink-500/40' },
                      { icon: Youtube, label: 'YouTube', url: supportInfo.youtube, show: supportInfo.showYoutube, colorClass: 'text-red-500 bg-red-500/10 dark:bg-red-500/20 dark:text-red-400 hover:border-red-500/40' },
                    ];
                    const hasVisibleSocials = socialChannels.some(s => s.url && (s.show || isAdmin));

                    if (!hasVisibleSocials) return null;

                    return (
                      <div  className="pt-2">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-1.5 h-4 rounded bg-indigo-500" />
                          <h3 className="text-xs font-black text-text-muted uppercase tracking-widest">
                            {language === 'bn' ? 'সোশ্যাল মিডিয়া হাব' : language === 'ar' ? 'قنوات التواصل الاجتماعي' : 'Social Media Hub'}
                          </h3>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {socialChannels.map((social, idx) => {
                            if (!social.url || (!social.show && !isAdmin)) return null;
                            const IconComponent = social.icon;
                            
                            return (
                              <a
                                key={idx}
                                href={social.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-col items-center justify-center gap-2 p-3 bg-theme-card rounded-xl border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md hover:-translate-y-1 active:scale-95 transition-all duration-300 group h-[95px] relative"
                              >
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${social.colorClass}`}>
                                  <IconComponent size={18} />
                                </div>
                                <span className="text-[10px] font-black tracking-wider text-text-main text-center group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                                  {social.label}
                                </span>
                                
                                {!social.show && isAdmin && (
                                  <span className="absolute top-1.5 right-1.5 bg-rose-50 dark:bg-rose-500/10 text-rose-500 p-0.5 rounded-full" title="Hidden from public">
                                    <ShieldAlert size={8} />
                                  </span>
                                )}
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </>
        )}
      </>

      {/* Prayer Times Modal */}
      <>
        {showPrayerTimesModal && (
          <>
            <div 
              
              
              
              className="fixed inset-0 bg-black/60 z-[120]"
              onClick={() => setShowPrayerTimesModal(false)}
            />
            <div 
              
              
              
              
              className={`fixed inset-0 z-[130] overflow-hidden flex flex-col text-text-main ${(!effectiveBgColor && !effectiveWallpaper) ? 'modern-app-bg text-text-main' : ''}`}
              style={{ 
                ...bgStyle,
                ...layoutStyle
              }}
            >
              <div className="text-white primary-bg-text shadow-md z-10 safe-top" style={{ background: effectiveHeaderBg }}>
                <div className="h-16 px-4 flex items-center gap-3">
                  <button onClick={() => setShowPrayerTimesModal(false)} className="p-2 rounded-full active:scale-90 transition-all">
                    <ChevronLeft size={24} />
                  </button>
                  <h2 className="text-xl font-black tracking-tight uppercase tracking-widest">{t.PRAYER_TIMES}</h2>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-6 w-full mx-auto">
                <PrayerTimes />
              </div>
            </div>
          </>
        )}
      </>

      {/* Weather Modal */}
      <>
        {showWeatherModal && (
          <>
            <div 
                
              className="fixed inset-0 bg-black/60 z-[120]"
              onClick={() => setShowWeatherModal(false)}
            />
            <div 
                
              
              className={`fixed inset-0 z-[130] overflow-hidden flex flex-col ${(!effectiveBgColor && !effectiveWallpaper) ? 'modern-app-bg text-text-main' : ''}`}
              style={{ ...bgStyle, ...layoutStyle }}
            >
              <div className="text-white primary-bg-text shadow-md z-10 safe-top" style={{ background: effectiveHeaderBg }}>
                <div className="h-16 px-4 flex items-center gap-3">
                  <button onClick={() => setShowWeatherModal(false)} className="p-2 rounded-full active:scale-90 transition-all">
                    <ChevronLeft size={24} />
                  </button>
                  <h2 className="text-xl font-black tracking-tight uppercase tracking-widest">{t.WEATHER}</h2>
                </div>
              </div>
              <div className="flex-1 flex items-center justify-center p-6 text-center">
                 <div className="space-y-4">
                    <Cloud size={64} className="mx-auto text-text-muted" />
                    <h3 className="text-2xl font-black text-text-main">Weather Service</h3>
                    <p className="text-text-muted font-bold text-sm">Service coming soon in version 2.7.0</p>
                 </div>
              </div>
            </div>
          </>
        )}
      </>

      {/* Ramadan Modal */}
      <>
        {showRamadanModal && (
          <>
            <div 
                
              className="fixed inset-0 bg-black/60 z-[120]"
              onClick={() => setShowRamadanModal(false)}
            />
            <div 
                
              
              className={`fixed inset-0 z-[130] overflow-hidden flex flex-col ${(!effectiveBgColor && !effectiveWallpaper) ? 'modern-app-bg text-text-main' : ''}`}
              style={{ ...bgStyle, ...layoutStyle }}
            >
              <div className="text-white primary-bg-text shadow-md z-10 safe-top" style={{ background: effectiveHeaderBg }}>
                <div className="h-16 px-4 flex items-center gap-3">
                  <button onClick={() => setShowRamadanModal(false)} className="p-2 rounded-full active:scale-90 transition-all">
                    <ChevronLeft size={24} />
                  </button>
                  <h2 className="text-xl font-black tracking-tight uppercase tracking-widest">{t.RAMADAN_SCHEDULE}</h2>
                </div>
              </div>
              <div className="flex-1 flex items-center justify-center p-6 text-center">
                 <div className="space-y-4">
                    <Calendar size={64} className="mx-auto text-text-muted" />
                    <h3 className="text-2xl font-black text-text-main">Ramadan 2026</h3>
                    <p className="text-text-muted font-bold text-sm">Schedule is being optimized</p>
                 </div>
              </div>
            </div>
          </>
        )}
      </>

      {/* About Modal */}
      <>
        {showAboutModal && (
          <>
            <div 
                
              className="fixed inset-0 bg-black/60 z-[120]"
              onClick={() => setShowAboutModal(false)}
            />
            <div 
                
              
              className={`fixed inset-0 z-[130] overflow-hidden flex flex-col ${(!effectiveBgColor && !effectiveWallpaper) ? 'modern-app-bg text-text-main' : ''}`}
              style={{ ...bgStyle, ...layoutStyle }}
            >
              <div className="text-white primary-bg-text shadow-md z-10 safe-top" style={{ background: effectiveHeaderBg }}>
                <div className="h-16 px-4 flex items-center gap-3">
                  <button onClick={() => setShowAboutModal(false)} className="p-2 rounded-full active:scale-90 transition-all">
                    <ChevronLeft size={24} />
                  </button>
                  <h2 className="text-xl font-black tracking-tight uppercase tracking-widest">{t.ABOUT}</h2>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                 <div className="text-center space-y-4">
                    <div className="w-24 h-24 bg-zinc-800 rounded-3xl mx-auto flex items-center justify-center shadow-2xl rotate-12">
                       <Truck size={48} className="text-white" />
                    </div>
                    <h3 className="text-3xl font-black text-text-main">FLEETPRO</h3>
                    <p className="text-text-muted font-bold text-[10px] tracking-widest uppercase">Version 2.6.0</p>
                 </div>
                 <div className="space-y-4 pt-6 border-t border-white/10">
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                       <h4 className="font-black text-xs uppercase text-text-main mb-2">Transport System</h4>
                       <p className="text-text-muted text-xs leading-relaxed font-bold">Standard transport management and logistics solution for modern fleets.</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                       <h4 className="font-black text-xs uppercase text-text-main mb-2">Security</h4>
                       <p className="text-text-muted text-xs leading-relaxed font-bold">Encrypted communication channel with cloud-based verification systems.</p>
                    </div>
                 </div>
              </div>
            </div>
          </>
        )}
      </>

      {/* Scrollable Core Layout in responsive  splits */}
      <div className="flex-grow flex flex-col md:flex-row min-h-0 w-full relative z-10 overflow-hidden md:h-full">
        {/* Left Branding Panel for Desktop Mode only */}
        <div className="hidden md:flex md:w-[50%] lg:w-[55%] flex-col justify-between p-12 bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e1b4b] text-white border-r border-white/5 relative overflow-hidden h-full">
          {/* Ambient Glowing Color Orbs */}
          <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-cyan-500/10 rounded-full blur-[100px] animate-pulse pointer-events-none" style={{ animationDuration: '8s' }} />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-violet-600/10 rounded-full blur-[100px] animate-pulse pointer-events-none" style={{ animationDuration: '10s' }} />
          
          <div className="absolute inset-0 opacity-[0.035]" 
            style={{
              backgroundImage: `radial-gradient(#f1f5f9 1px, transparent 0)`,
              backgroundSize: '24px 24px'
            }}
          />

          {/* Top Logo & Title bar */}
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/10 shadow-lg">
              <Truck size={20} className="text-cyan-400" />
            </div>
            <div>
              <span className="font-black tracking-[0.3em] text-xs text-white uppercase block">FleetPro</span>
              <span className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest">Enterprise Suite</span>
            </div>
          </div>

          {/* Centered Brand Panel */}
          <div className="my-auto flex flex-col items-center justify-center text-center relative z-10 py-12">
            <div className="relative w-56 h-56 mb-8 flex items-center justify-center">
              <div className="absolute w-[120px] h-[120px] bg-cyan-500/10 rounded-full blur-2xl animate-pulse" />
              <div className="absolute w-[180px] h-[180px] rounded-full border border-t-amber-400 border-b-rose-500 border-l-transparent border-r-transparent animate-spin opacity-80" style={{ animationDuration: '15s' }} />
              <div className="absolute w-[150px] h-[150px] rounded-full border-2 border-l-fuchsia-500 border-r-violet-500 border-t-transparent border-b-transparent animate-spin opacity-90" style={{ animationDuration: '10s' }} />
              <div className="absolute w-[120px] h-[120px] rounded-full border border-t-cyan-400 border-b-emerald-400 border-l-transparent border-r-transparent animate-spin opacity-95" style={{ animationDuration: '6s' }} />

              <div className="relative w-24 h-24 rounded-2xl overflow-hidden flex items-center justify-center bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl transition-transform duration-300 hover:scale-105">
                <img src={logo} alt="Logo" className="w-full h-full object-contain p-2 rounded-2xl" />
              </div>
            </div>

            <h2 className="text-5xl font-black text-white tracking-tight leading-none mb-3">
              FLEETPRO
            </h2>
            <p className="text-sm font-bold tracking-[0.35em] text-cyan-400 uppercase mb-8">
              Private Transport Manager
            </p>

            <div className="w-full max-w-md p-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent mb-8" />

            {/* Bento-style Features widgets */}
            <div className="grid grid-cols-3 gap-4 w-full max-w-lg mt-2 font-calibri">
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 backdrop-blur-md flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition-colors shadow-lg">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
                  <Shield size={16} className="text-teal-400" />
                </div>
                <span className="text-[9px] font-black uppercase text-teal-300 tracking-widest leading-none">Security</span>
                <span className="text-[10px] text-white/50 font-bold">100% Secure</span>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 backdrop-blur-md flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition-colors shadow-lg">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                  <Globe size={16} className="text-cyan-400" />
                </div>
                <span className="text-[9px] font-black uppercase text-cyan-300 tracking-widest leading-none">Sync</span>
                <span className="text-[10px] text-white/50 font-bold font-calibri">Cloud Live</span>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 backdrop-blur-md flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition-colors shadow-lg">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <span className="text-[9px] font-black uppercase text-emerald-300 tracking-widest leading-none">Status</span>
                <span className="text-[10px] text-emerald-400 font-extrabold flex items-center gap-1">● ONLINE</span>
              </div>
            </div>
          </div>

          {/* Bottom Footer block */}
          <div className="flex items-center justify-between text-[10px] text-white/40 font-bold relative z-10 border-t border-white/5 pt-4">
            <span>© 2026 FleetPro Enterprise</span>
            <div className="flex items-center gap-1.5 text-cyan-400/80">
              <Shield size={10} />
              <span>AES-256 SSL LINK</span>
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="w-full md:w-[50%] lg:w-[45%] h-full flex flex-col justify-center overflow-y-auto md:overflow-hidden relative scrollbar-none px-0">
          <div className={`flex-grow min-h-0 flex flex-col w-full mx-auto z-10 scrollbar-none ${activeTab === 'signup' ? 'h-auto overflow-y-visible' : 'min-h-full overflow-x-hidden'} ${
            activeTab === 'signup' 
              ? 'max-w-none px-0 py-0 justify-start items-stretch' 
              : `max-w-none sm:max-w-md items-stretch sm:items-center justify-end pt-20 pb-0 md:justify-center md:pt-0 md:pb-0 md:my-auto md:max-w-md overflow-y-visible md:overflow-y-auto`
          }`} style={{ WebkitOverflowScrolling: 'touch' }}>
            
              <>
                {activeTab !== 'signup' && (
                  <div 
                    
                    
                    
                    
                    className="text-center space-y-4 mb-6 px-4 flex-shrink-0 login-page-header md:hidden"
                  >
                    <div className={`inline-flex w-24 h-24 rounded-full items-center justify-center p-2 mb-2 shadow-2xl transition-all duration-300 ${
                      isBackgroundLight 
                        ? 'bg-white ring-4 ring-black/5 border border-black/5' 
                        : 'bg-white/10 backdrop-blur-md ring-2 ring-white/15 border border-white/10'
                    }`}>
                      <img src={logo} alt="Logo" className="w-full h-full object-contain rounded-full" />
                    </div>
                    <h1 className="text-4xl font-black text-text-main tracking-tight drop-shadow-lg">FLEETPRO</h1>
                    <p className="text-text-muted font-bold text-[10px] tracking-[0.35em] uppercase">Private Transport Manager</p>
                  </div>
                )}
              </>

            <div 
              style={loginCardStyle}
              className={`w-full transition-all ease-in-out login-card-container ${
                activeTab === 'signup'
                  ? 'min-h-screen border-0 rounded-none px-2 sm:px-4 pt-0 pb-12 flex flex-col md:min-h-0 md:rounded-2xl md:border md:border-white/10 md:shadow-2xl md:my-auto md:p-8 md:max-w-lh md:mx-auto'
                  : `border-t ${loginCardIsDark ? 'border-white/10 shadow-[0_-15px_50px_rgba(0,0,0,0.6)]' : 'border-black/10 shadow-[0_-10px_40px_rgba(0,0,0,0.08)]'} rounded-t-[24px] rounded-b-none border-x-0 border-b-0 p-6 sm:p-8 pb-[max(1.5rem,env(safe-area-inset-bottom))] mt-auto min-h-[400px] md:border-t-0 md:rounded-2xl md:border md:shadow-2xl md:my-auto md:min-h-0 md:max-w-md md:mx-auto`
              }`}
            >
              {/* iOS Bottom Sheet Drag Handle */}
              {activeTab !== 'signup' && !showForgotPassword && (
                <div className="flex justify-between items-start mb-5 -mt-2">
                  <div className="flex-1 invisible" />
                  <div className={`w-[36px] h-1.5 rounded-full ${loginCardIsDark ? 'bg-white/20' : 'bg-black/20'}`} />
                  <div className="flex-1 flex justify-end">
                    <button 
                      type="button"
                      onClick={() => {
                        const langs: any[] = ['en', 'bn', 'ar'];
                        const next = langs[(langs.indexOf(language) + 1) % langs.length];
                        setLanguage(next);
                      }}
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-black/5 rounded-full text-[9px] font-black uppercase tracking-wider text-black/60 hover:bg-black/10 transition-all border border-black/5"
                    >
                      <Globe size={10} className="text-zinc-500" />
                      <span>{language === 'bn' ? 'ল্যাঙ্গুয়েজ' : language === 'ar' ? 'اللغة' : 'Language'}</span>
                    </button>
                  </div>
                </div>
              )}
          
          {/* Tabs - Beautiful iOS Segmented Control */}
          {activeTab !== 'signup' && !showAdminPinStep && (
            <div className={`p-1 rounded-lg flex items-center mb-6 border ${loginCardIsDark ? 'bg-white/5 border-white/5' : 'bg-black/5 border-black/5'}`}>
              <button 
                onClick={() => {
                  setShowForgotPassword(false);
                  setActiveTab('signin');
                }}
                className={`flex-1 py-2.5 rounded-md text-xs font-black uppercase transition-all duration-200 active:scale-95 ${
                  activeTab === 'signin' && !showForgotPassword
                    ? 'tab-btn-active bg-white text-black shadow-sm font-extrabold scale-[1.01]' 
                    : `tab-btn-inactive ${loginCardIsDark ? 'text-white/40 hover:text-white/80' : 'text-black/40 hover:text-black/80'} font-black`
                }`}
                style={{
                  color: (activeTab === 'signin' && !showForgotPassword) ? '#000000' : (loginCardIsDark ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.45)')
                }}
              >
                {t.LOGIN}
              </button>
              <button 
                onClick={() => {
                  setShowForgotPassword(false);
                  setActiveTab('signup');
                }}
                className={`flex-1 py-2.5 rounded-md text-xs font-black uppercase transition-all duration-200 active:scale-95 ${
                  activeTab === 'signup' 
                    ? 'tab-btn-active bg-white text-black shadow-sm font-extrabold scale-[1.01]' 
                    : `tab-btn-inactive ${loginCardIsDark ? 'text-white/40 hover:text-white/80' : 'text-black/40 hover:text-black/80'} font-black`
                }`}
                style={{
                  color: (activeTab === 'signup') ? '#000000' : (loginCardIsDark ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.45)')
                }}
              >
                {t.SIGNUP}
              </button>
            </div>
          )}

          <>
            {showForgotPassword ? (
              <form 
                key="forgot-password"
                
                
                
                
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleRecoverySubmit();
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-black text-text-main">Reset Password</h3>
                  <button 
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setRecoveryStep(1);
                    }}
                    className="text-xs font-bold text-text-main hover:text-text-muted active:scale-95 transition-all"
                  >
                    Cancel
                  </button>
                </div>

                {recoveryStep === 1 ? (
                  <div className="space-y-5">
                    <p className="text-xs text-text-muted">Enter your username and the 6-digit code from your Google Authenticator app to reset your password.</p>
                    <InputField 
                      label="Username / Email"
                      name="recoveryUsername"
                      type="text"
                      value={recoveryUsername}
                      onChange={(e) => setRecoveryUsername(e.target.value)}
                      hideCheckmark={true}
                      style={{ backgroundColor: 'transparent' }}
                      icon={<UserIcon size={18} />}
                    />
                    <InputField 
                      label="Authenticator Code"
                      name="recoveryCode"
                      type="tel"
                      inputMode="numeric"
                      value={recoveryCode}
                      onChange={(e) => setRecoveryCode(e.target.value)}
                      hideCheckmark={true}
                      style={{ backgroundColor: 'transparent' }}
                      icon={<Shield size={18} />}
                    />
                  </div>
                ) : (
                  <div className="space-y-5">
                    <p className="text-xs text-text-muted">Enter your new password.</p>
                    <InputField 
                      label="New Password"
                      name="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      hideCheckmark={true}
                      style={{ backgroundColor: 'transparent' }}
                      icon={<Lock size={18} />}
                    />
                    <InputField 
                      label="Confirm New Password"
                      name="confirmNewPassword"
                      type="password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      hideCheckmark={true}
                      style={{ backgroundColor: 'transparent' }}
                      icon={<Lock size={18} />}
                    />
                  </div>
                )}

                <div className="pb-16">
                  <button 
                    type="submit"
                    className="w-full h-12 text-white primary-bg-text font-bold rounded-lg shadow-lg hover:brightness-110 active:scale-95 transition-all uppercase flex items-center justify-center gap-3"
                    style={{ backgroundColor: 'var(--primary)' }}
                  >
                    <Shield size={18} />
                    {recoveryStep === 1 ? 'Verify Code' : 'Reset Password'}
                  </button>
                </div>
              </form>
            ) : showAdminPinStep ? (
              <form
                key="admin-pin-step"
                
                
                
                
                className="space-y-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (adminPin.length === 4 && !isLoading) {
                    handleAdminPinSubmit();
                  }
                }}
              >
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-black text-[#000000]">
                    {language === 'bn' ? 'এডমিন সিকিউরিটি পিন' : 'Admin Security PIN'}
                  </h3>
                  <p className="text-xs text-[#000000]/70">
                    {language === 'bn' 
                      ? 'এডমিন একাউন্টে লগইন যাচাই করতে অনুগ্রহ করে ৪-ডিজিটের পিন দিন।' 
                      : 'Please enter the 4-digit security PIN to verify Admin log in.'}
                  </p>
                </div>

                <div
                  
                  
                >
                  <InputField 
                    label={language === 'bn' ? '৪-ডিজিটের পিন' : '4-Digit PIN'}
                    name="adminPin"
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={4}
                    value={adminPin}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val.length <= 4) setAdminPin(val);
                    }}
                    error={isPinError}
                    className="h-14"
                    inputClassName="tracking-[0.8em] font-black text-left pl-14 text-2xl"
                    inputSize="text-2xl text-left pl-14 pr-4"
                    labelSize="text-xs text-left pl-[44px]"
                    icon={<Shield size={20} />}
                    hideCheckmark={true}
                  />
                </div>

                <div className="pt-4 space-y-3">
                  <button 
                    onClick={handleAdminPinSubmit}
                    disabled={adminPin.length !== 4 || isLoading}
                    className={`w-full h-14 font-extrabold rounded-xl transition-all uppercase flex items-center justify-center gap-3 allow-animation ${adminPin.length !== 4 || isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-110 hover:shadow-[0_8px_30px_rgba(29,78,216,0.35)] active:scale-[0.98]'}`}
                    style={{ 
                      background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #1d4ed8 100%)', 
                      color: '#ffffff',
                      boxShadow: '0 8px 16px -4px rgba(29, 78, 216, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.25)',
                      textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                      letterSpacing: '0.12em',
                      border: '1px solid rgba(255, 255, 255, 0.15)'
                    }}
                  >
                    {isLoading ? (
                      <Loader2 size={20} className="animate-spin text-[#ffffff]" style={{ color: '#ffffff' }} />
                    ) : (
                      <Check size={20} className="text-[#ffffff]" style={{ color: '#ffffff', stroke: '#ffffff' }} />
                    )}
                    <span style={{ color: '#ffffff' }} className="tracking-widest">
                      {isLoading ? t.VERIFY : (language === 'bn' ? 'কন্টিনিউ' : (language === 'ar' ? 'متابعة' : 'Continue'))}
                    </span>
                  </button>

                  <button 
                    onClick={() => {
                      setShowAdminPinStep(false);
                      setAdminPin('');
                    }}
                    className="w-full text-center text-xs font-bold text-text-muted hover:text-text-main py-2 active:scale-95 transition-all"
                  >
                    {language === 'bn' ? 'পূর্বের ধাপে ফিরুন' : 'Back to Login'}
                  </button>
                </div>
              </form>
            ) : activeTab === 'signin' ? (
              <>
                <form 
                key="signin"
                
                
                
                
                className="space-y-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!isLocked && !isLoading) {
                    handleLogin();
                  }
                }}
              >
                <div className="space-y-4">
                  <div className="relative">
                    <InputField 
                      label={language === 'bn' ? 'ইউজার আইডি / ইমেইল' : 'User ID / Email'}
                      name="username"
                      type="text"
                      value={username}
                      onChange={(e) => {
                        const val = e.target.value;
                        setUsername(val);
                        if (rememberMe) {
                          localStorage.setItem('fleetpro_saved_username', val);
                        }
                      }}
                      inputSize="text-base"
                      labelSize="text-xs"
                      icon={<UserIcon size={18} />}
                      hideCheckmark={true}
                      themeMode="light"
                      inputClassName="pr-20"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 z-30 flex items-center gap-1.5 bg-zinc-100/90 hover:bg-zinc-200/95 px-2 py-1 rounded-md border border-zinc-300 shadow-sm transition-all">
                      <input 
                        id="rememberMeCheckbox"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setRememberMe(checked);
                          localStorage.setItem('fleetpro_remember_me', checked ? 'true' : 'false');
                          if (checked) {
                            localStorage.setItem('fleetpro_saved_username', username);
                            localStorage.setItem('fleetpro_saved_password', password);
                          } else {
                            localStorage.removeItem('fleetpro_saved_username');
                            localStorage.removeItem('fleetpro_saved_password');
                          }
                        }}
                        className="w-4 h-4 text-blue-600 border-zinc-300 rounded focus:ring-blue-500 cursor-pointer accent-blue-600"
                      />
                      <label htmlFor="rememberMeCheckbox" className="text-[10px] font-black tracking-wider text-blue-600 uppercase select-none cursor-pointer">
                        {language === 'bn' ? 'সেভ' : 'Save'}
                      </label>
                    </div>
                  </div>
                  <div>
                    <InputField 
                      label={language === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
                      name="password"
                      type="password"
                      value={password}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPassword(val);
                        if (rememberMe) {
                          localStorage.setItem('fleetpro_saved_password', val);
                        }
                      }}
                      inputSize="text-base"
                      labelSize="text-xs"
                      icon={<Shield size={18} />}
                      hideCheckmark={true}
                      themeMode="light"
                    />
                    <div className="flex justify-end mt-2">
                      <button 
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-[10px] font-bold text-text-muted hover:text-text-main hover:underline active:scale-95 transition-all uppercase tracking-wider"
                      >
                        {t.FORGOT_PASSWORD}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    type="submit"
                    onClick={handleLogin}
                    disabled={isLocked || isLoading}
                    className={`w-full h-14 font-extrabold rounded-xl transition-all uppercase flex items-center justify-center gap-3 allow-animation ${isLocked || isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-110 hover:shadow-[0_8px_30px_rgba(29,78,216,0.35)] active:scale-[0.98]'}`}
                    style={{ 
                      background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #1d4ed8 100%)', 
                      color: '#ffffff',
                      boxShadow: '0 8px 16px -4px rgba(29, 78, 216, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.25)',
                      textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                      letterSpacing: '0.12em',
                      border: '1px solid rgba(255, 255, 255, 0.15)'
                    }}
                  >
                    {isLoading ? (
                      <Loader2 size={18} className="animate-spin text-[#ffffff]" style={{ color: '#ffffff' }} />
                    ) : (
                      <UserIcon size={18} className="text-[#ffffff]" style={{ color: '#ffffff', stroke: '#ffffff' }} />
                    )}
                    <span style={{ color: '#ffffff' }} className="tracking-widest">
                      {isLoading ? t.VERIFY : (language === 'bn' ? 'কন্টিনিউ' : (language === 'ar' ? 'متابعة' : 'Continue'))}
                    </span>
                  </button>
                </div>
              </form>
            </>
            ) : (
              <div 
                key="signup"
                
                
                
                
                className="flex flex-col w-full"
                style={{ background: 'transparent' }}
              >
                {/* Signup Header */}
                <div className="shrink-0 -mx-2 sm:-mx-4 mb-6 pt-[env(safe-area-inset-top,0px)]">
                  <div className="h-16 px-4 flex items-center md:justify-center relative login-page-header">
                    <button onClick={() => setActiveTab('signin')} className="absolute left-4 p-1.5 rounded-full active:scale-90 transition-all text-text-main">
                      <ChevronLeft size={24} />
                    </button>
                    <h3 className="w-full text-center font-extrabold text-sm text-text-main uppercase tracking-wider">Registration Form</h3>
                  </div>
                </div>
                
                <div className="w-full px-1 pb-safe">
                  <SignupForm setActiveTab={setActiveTab} cardStyle={{ backgroundColor: '#ffffff', color: '#000000' }} />
                </div>
              </div>
            )}
          </>

          {activeTab !== 'signup' && (
            <p className="text-center text-[9px] text-text-muted uppercase font-bold tracking-widest mt-4 opacity-40">
              Version 2.6.0 • Secure Cloud System
            </p>
          )}
        </div>
      </div>
        </div>
      </div>
    </div>

    {createPortal(
      <>
        {isActionSheetOpen && (
          <div className="fixed inset-0 z-[9000] flex flex-col justify-end p-4 pb-[calc(16px+env(safe-area-inset-bottom,16px))]">
            {/* Backdrop */}
            <div 
              
              
              
              onClick={(e) => {
                e.stopPropagation();
                setIsActionSheetOpen(false);
              }}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs cursor-pointer pointer-events-auto"
            />
            
            {/* Sheet container */}
            <div 
              
              
              
              
              className="relative w-full z-10 flex flex-col gap-2 max-w-sm mx-auto pointer-events-auto"
            >
              {/* Options Group */}
              <div className="bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-xl rounded-[14px] overflow-hidden flex flex-col border border-black/5 dark:border-white/5 shadow-xl">
                <div className="p-3 border-b border-black/10 dark:border-white/10 text-center">
                  <p className="text-[13px] font-semibold text-gray-500 dark:text-gray-400">
                    {language === 'bn' ? 'প্রোফাইল ফটো পরিবর্তন' : language === 'ar' ? 'تغيير الصورة الشخصية' : 'Change Profile Photo'}
                  </p>
                </div>
                
                {/* Take Photo button */}
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleCameraClick();
                  }}
                  className="w-full py-4 px-6 flex items-center justify-center gap-2 text-[#007AFF] dark:text-[#0A84FF] font-normal active:bg-black/5 dark:active:bg-white/5 transition-colors border-b border-black/10 dark:border-white/10"
                >
                  <span className="text-[20px]">
                    {language === 'bn' ? 'ছবি তুলুন' : language === 'ar' ? 'التقاط صورة' : 'Take Photo'}
                  </span>
                </button>
                
                {/* Gallery button */}
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleGalleryClick();
                  }}
                  className="w-full py-4 px-6 flex items-center justify-center gap-2 text-[#007AFF] dark:text-[#0A84FF] font-normal active:bg-black/5 dark:active:bg-white/5 transition-colors"
                >
                  <span className="text-[20px]">
                    {language === 'bn' ? 'গ্যালারি থেকে পছন্দ করুন' : language === 'ar' ? 'اختر من المعرض' : 'Choose from Gallery'}
                  </span>
                </button>
              </div>
              
              {/* Cancel Group */}
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsActionSheetOpen(false);
                }}
                className="w-full mt-0 py-4 bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-xl rounded-[14px] font-semibold text-[#007AFF] dark:text-[#0A84FF] active:bg-black/5 dark:active:bg-white/5 transition-colors text-[20px] text-center border border-black/5 dark:border-white/5 shadow-xl"
              >
                {language === 'bn' ? 'বাতিল' : language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        )}
      </>
      , document.body
    )}
    </>
  );
};

export default Login;
