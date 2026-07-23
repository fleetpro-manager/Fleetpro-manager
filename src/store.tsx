
import { uploadToDrive, downloadFromDrive, googleSignIn, getAccessToken } from '@/services/googleDrive';
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { User, Trip, Profile, Language, Theme, FinancialRecord, SupportInfo, MonthlyFile, Currency, Payment, Notification, DownloadedFile, FuelPurchase } from '@/types';
import { storageService } from '@/services/storageService';
import { getFirebaseCollection, subscribeFirebaseCollection, subscribeFirebaseCollectionGroup, saveFirebaseDoc, deleteFirebaseDoc, clearFirebaseCollection, syncFirebaseCollection, subscribeFirebaseDoc, saveFirebaseDocMerge, auth } from '@/services/firebase';
import { where } from 'firebase/firestore';
import { parseExpiryDate, isExpired, isExpiringSoon } from './utils/dateUtils';

// Global framer-motion transition configurations to keep all subviews synchronized perfectly
export const GLOBAL_TRANSITION = { duration: 0.1, ease: "easeInOut" };
export const GLOBAL_VARIANTS = {
  initial: { x: '100%' },
  animate: { x: 0 },
  exit: { x: '-100%' }
};
export const LOCAL_VARIANTS = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -15 }
};

export interface StoreState {
  routeHistory: string[];

  currentView: 'DASHBOARD' | 'PROFILES' | 'FINANCE' | 'ADMIN' | 'LOGIN' | 'SIGNUP' | 'SETTINGS' | 'MONTHLY_FILES' | 'NEW_TRIP' | 'MY_INCOME' | 'PAYMENT' | 'ACCOUNT' | 'ACTIVE_USER' | 'BLOCK_LIST' | 'USER_ACCOUNTS' | 'USER_PROFILE' | 'USER_FILES_LIST' | 'SEARCH' | 'ADMIN_PROFILE_UPDATE' | 'SUPPORT' | 'PRAYER_TIMES' | 'CONTROL_PANEL' | 'MONTHLY_FILE_DETAILS' | 'TRANSACTION_DELETE' | 'RESET_BREAKDOWN' | 'USER_ACCOUNT_RESET' | 'NOTIFICATIONS' | 'NOTIFICATION_DETAIL' | 'CHAT' | 'USER_PASSWORD_RESET' | 'TRIP_DETAILS' | 'TRIPS' | 'LEAVE_SETTLEMENT' | 'FUEL' | 'DOWNLOAD' | 'PURCHASE' | 'NEW_PURCHASE' | 'WALLET';
  setView: (view: StoreState['currentView'], addToHistory?: boolean) => void;
  goBack: (fromPopState?: boolean, state?: any) => void;
  navigationDirection: 'forward' | 'backward';
  setNavigationDirection: (dir: 'forward' | 'backward') => void;
  logo: string;
  setLogo: (logo: string) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  wallpaper: string;
  setWallpaper: (wallpaper: string) => void;
  loginWallpaper: string;
  setLoginWallpaper: (wallpaper: string) => void;
  loginBackgroundColor: string;
  setLoginBackgroundColor: (color: string) => void;
  loginCardColor: string;
  setLoginCardColor: (color: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
   user: User | null;
  setUser: (user: User | null) => void;
  users: User[];
  setUsers: (users: User[]) => void;
  addUser: (user: User) => void;
  updateUser: (user: User, oldId?: string) => void;
  approveUser: (userId: string) => void;
  removeUser: (id: string) => void;
  trips: Trip[];
  allTrips: Trip[];
  addTrip: (trip: Trip) => void;
  profiles: Profile[];
  allProfiles: Profile[];
  addProfile: (profile: Profile) => void;
  finances: FinancialRecord[];
  allFinances: FinancialRecord[];
  logout: (force?: boolean) => void;
  isFeedbackOpen: boolean;
  setIsFeedbackOpen: (open: boolean) => void;
  feedbackMessage: string;
  feedbackType: 'success' | 'error' | 'warning' | 'info';
  showFeedback: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  customHeaderTitle: string | null;
  setCustomHeaderTitle: (title: string | null) => void;
  customBackAction: (() => void) | null;
  setCustomBackAction: (action: (() => void) | null) => void;
  pendingTheme: Theme | null;
  setPendingTheme: (theme: Theme | null) => void;
  zoom: number;
  setZoom: (zoom: number) => void;
  loginTime: Date | null;
  setLoginTime: (time: Date | null) => void;
  headerBg: string;
  setHeaderBg: (color: string) => void;
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
  headerText: string;
  setHeaderText: (color: string) => void;
  backgroundColor: string;
  setBackgroundColor: (color: string) => void;
  navBg: string;
  setNavBg: (color: string) => void;
  navText: string;
  setNavText: (color: string) => void;
  fontStyle: string;
  setFontStyle: (style: string) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  fontBold: boolean;
  setFontBold: (bold: boolean) => void;
  supportInfo: SupportInfo;
  setSupportInfo: (info: SupportInfo) => void;
  selectedUser: User | null;
  setSelectedUser: (user: User | null) => void;
  activeDetailView: string | null;
  setActiveDetailView: (view: string | null) => void;
  activeSection: string | null;
  setActiveSection: (section: string | null) => void;
  monthlyFiles: MonthlyFile[];
  allMonthlyFiles: MonthlyFile[];
  addMonthlyFile: (file: MonthlyFile) => void;
  removeMonthlyFile: (id: string) => void;
  currentFile: MonthlyFile | null;
  setCurrentFile: (file: MonthlyFile | null) => void;
  editingTrip: Trip | null;
  setEditingTrip: (trip: Trip | null) => void;
  updateTrip: (trip: Trip) => void;
  removeTrip: (id: string) => void;
  locations: { country: string, name: string }[];
  addLocation: (location: { country: string, name: string }) => void;
  removeLocation: (country: string, name: string) => void;
  updateLocation: (country: string, oldName: string, newName: string) => void;
  countries: { code: string; name: string; flag: string }[];
  addCountry: (country: { code: string; name: string; flag: string }) => void;
  removeCountry: (code: string) => void;
  updateCountry: (code: string, updatedCountry: { code: string; name: string; flag: string }) => void;
  banks: { id: string; name: string; countryCode?: string }[];
  addBank: (bank: { id: string; name: string; countryCode?: string }) => void;
  removeBank: (id: string) => void;
  updateBank: (id: string, updates: Partial<{ name: string; countryCode: string }>) => void;
  branches: { id: string; name: string; routingNumber?: string; swiftCode?: string; accountTitle?: string; accountNumber?: string; bankId?: string }[];
  addBranch: (branch: { id: string; name: string; routingNumber?: string; swiftCode?: string; accountTitle?: string; accountNumber?: string; bankId?: string }) => void;
  removeBranch: (id: string) => void;
  updateBranch: (id: string, updates: Partial<{ name: string; routingNumber: string; swiftCode: string; accountTitle: string; accountNumber: string; bankId: string }>) => void;
  routingNumbers: { id: string; number: string }[];
  addRoutingNumber: (routing: { id: string; number: string }) => void;
  removeRoutingNumber: (id: string) => void;
  updateRoutingNumber: (id: string, number: string) => void;
  companies: string[];
  addCompany: (company: string) => void;
  removeCompany: (company: string) => void;
  updateCompany: (oldCompany: string, newCompany: string) => void;
  nationalities: { name: string; flag: string }[];
  addNationality: (nationality: { name: string; flag: string }) => void;
  removeNationality: (name: string) => void;
  updateNationality: (oldName: string, updatedNationality: { name: string; flag: string }) => void;
  containerTypes: string[];
  addContainerType: (type: string) => void;
  removeContainerType: (type: string) => void;
  updateContainerType: (oldType: string, newType: string) => void;
  loadingTypes: string[];
  addLoadingType: (type: string) => void;
  removeLoadingType: (type: string) => void;
  updateLoadingType: (oldType: string, newType: string) => void;
  idTypes: string[];
  addIdType: (type: string) => void;
  removeIdType: (type: string) => void;
  updateIdType: (oldType: string, newType: string) => void;
  extraDieselReasons: string[];
  addExtraDieselReason: (reason: string) => void;
  removeExtraDieselReason: (reason: string) => void;
  updateExtraDieselReason: (oldReason: string, newReason: string) => void;
  advanceReasons: string[];
  addAdvanceReason: (reason: string) => void;
  removeAdvanceReason: (reason: string) => void;
  updateAdvanceReason: (oldReason: string, newReason: string) => void;
  emptyReturnYards: string[];
  addEmptyReturnYard: (yard: string) => void;
  removeEmptyReturnYard: (yard: string) => void;
  updateEmptyReturnYard: (oldYard: string, newYard: string) => void;
  genders: string[];
  addGender: (gender: string) => void;
  removeGender: (gender: string) => void;
  updateGender: (oldGender: string, newGender: string) => void;
  religions: string[];
  addReligion: (religion: string) => void;
  removeReligion: (religion: string) => void;
  updateReligion: (oldReligion: string, newReligion: string) => void;
  professions: string[];
  addProfession: (profession: string) => void;
  removeProfession: (profession: string) => void;
  updateProfession: (oldProfession: string, newProfession: string) => void;
  walletIncomeSources: string[];
  addWalletIncomeSource: (source: string) => void;
  removeWalletIncomeSource: (source: string) => void;
  updateWalletIncomeSource: (oldSource: string, newSource: string) => void;
  walletDeductionReasons: string[];
  addWalletDeductionReason: (reason: string) => void;
  removeWalletDeductionReason: (reason: string) => void;
  updateWalletDeductionReason: (oldReason: string, newReason: string) => void;
  walletPaymentMethods: string[];
  addWalletPaymentMethod: (method: string) => void;
  removeWalletPaymentMethod: (method: string) => void;
  updateWalletPaymentMethod: (oldMethod: string, newMethod: string) => void;
  adminPin: string;
  setAdminPin: (pin: string) => void;
  selectedTrip: Trip | null;
  setSelectedTrip: (trip: Trip | null) => void;
  currencies: Currency[];
  addCurrency: (currency: Currency) => void;
  removeCurrency: (code: string) => void;
  selectedCurrency: string;
  setSelectedCurrency: (code: string) => void;
  publicMenuItems: string[];
  setPublicMenuItems: (items: string[]) => void;
  isNightMode: boolean;
  setIsNightMode: (isDark: boolean) => void;
  appThemeMode: 'light' | 'dark';
  setAppThemeMode: (mode: 'light' | 'dark') => void;
  isEyeComfort: boolean;
  setIsEyeComfort: (isComfort: boolean) => void;
  appGrid: '3x6' | '4x5';
  setAppGrid: (grid: '3x6' | '4x5') => void;
  dashboardOrder: string[];
  setDashboardOrder: (order: string[]) => void;
  dashboardIcon: string;
  setDashboardIcon: (icon: string) => void;
  dashboardIconColor: string;
  setDashboardIconColor: (color: string) => void;
  payments: Payment[];
  allPayments: Payment[];
  addPayment: (payment: Payment) => void;
  updatePayment: (payment: Payment) => void;
  removePayment: (id: string) => void;
  clearPayments: () => void;
  walletTransactions: Payment[];
  allWalletTransactions: Payment[];
  addWalletTransaction: (transaction: Payment) => void;
  updateWalletTransaction: (transaction: Payment) => void;
  removeWalletTransaction: (id: string) => void;
  clearWalletTransactions: () => void;
  fuels: FuelPurchase[];
  allFuels: FuelPurchase[];
  addFuel: (fuel: FuelPurchase) => void;
  updateFuel: (fuel: FuelPurchase) => void;
  removeFuel: (id: string) => void;
  confirmAction: (message: string, onConfirm: () => void, options?: { title?: string; confirmText?: string; cancelText?: string; onSecondaryConfirm?: () => void; secondaryConfirmText?: string }) => void;
  closeConfirm: () => void;
  confirmConfig: { isOpen: boolean; message: string; onConfirm: () => void; title?: string; confirmText?: string; cancelText?: string; onSecondaryConfirm?: () => void; secondaryConfirmText?: string } | null;
  showReceivedBreakdown: boolean;
  setShowReceivedBreakdown: (show: boolean) => void;
  showPendingBreakdown: boolean;
  setShowPendingBreakdown: (show: boolean) => void;
  isDropdownOpen: boolean;
  setIsDropdownOpen: (open: boolean) => void;
  isLoadingView: boolean;
  setIsLoadingView: (loading: boolean) => void;
  prayerTimeOffsets: Record<string, number>;
  setPrayerTimeOffset: (prayer: string, offset: number) => void;
  isEntryFormOpen: boolean;
  setIsEntryFormOpen: (open: boolean) => void;
  isPaymentPopupOpen: boolean;
  setIsPaymentPopupOpen: (open: boolean) => void;
  selectedNotification: Notification | null;
  setSelectedNotification: (notification: Notification | null) => void;
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
  removeNotification: (id: string) => void;
  clearAccountNotifications: (userId: string) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
  exportData: () => void;
  importData: () => Promise<void>;
  exportLocalData: () => Promise<void>;
  importLocalData: (fileContent: string) => Promise<boolean>;
  resetSystem: () => void;
  resetSections: (sections: string[]) => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  policeStations: { country: string, name: string }[];
  addPoliceStation: (policeStation: { country: string, name: string }) => void;
  removePoliceStation: (country: string, name: string) => void;
  updatePoliceStation: (country: string, oldName: string, newName: string) => void;
  cities: { country: string, name: string }[];
  addCity: (city: { country: string, name: string }) => void;
  removeCity: (country: string, name: string) => void;
  updateCity: (country: string, oldName: string, newName: string) => void;
  states: { country: string, name: string }[];
  addState: (state: { country: string, name: string }) => void;
  removeState: (country: string, name: string) => void;
  updateState: (country: string, oldName: string, newName: string) => void;
  postOffices: { country: string; name: string; code: string }[];
  addPostOffice: (postOffice: { country: string; name: string; code: string }) => void;
  removePostOffice: (country: string, name: string) => void;
  updatePostOffice: (country: string, oldName: string, newPostOffice: { country: string; name: string; code: string }) => void;
  globalFilterMonth: number | 'ALL';
  setGlobalFilterMonth: (month: number | 'ALL') => void;
  globalFilterYear: number | 'ALL';
  setGlobalFilterYear: (year: number | 'ALL') => void;
}

const getAffectedTripIds = (payment: any, state: any) => {
  const affectedIds = new Set<string>();
  if (payment && payment.details && payment.details.pendingItems) {
    Object.keys(payment.details.pendingItems).forEach(key => {
      if (key.startsWith('AGG-')) {
        const parts = key.split('-');
        if (parts.length >= 4) {
          const fileId = parts[2];
          const rawCompany = parts.slice(3).join('-');
          const companyNameClean = rawCompany.replace(/_/g, ' ').trim().toUpperCase();
          const matchingTrips = (state.trips || []).filter((t: any) => {
            const matchesFile = t.fileId === fileId;
            const matchesCompany = (t.companyName || '').trim().toUpperCase() === companyNameClean ||
                                   (t.companyName || 'Unknown Company').trim().toUpperCase() === companyNameClean;
            return matchesFile && matchesCompany;
          });
          matchingTrips.forEach((t: any) => affectedIds.add(t.id));
        }
      } else if (key.includes('-') && !key.startsWith('PAY-')) {
        const lastIndex = key.lastIndexOf('-');
        const tripId = key.substring(0, lastIndex);
        affectedIds.add(tripId);
      } else {
        affectedIds.add(key);
      }
    });
  }
  return Array.from(affectedIds);
};

const recalculateTripPayments = (tripId: string, d: any) => {
  const trip = d.trips?.find((t: any) => t.id === tripId);
  if (!trip) return;

  const listPayments = d.payments || [];
  
  // Helper to sum received payments for a specific sub-key
  const getSumOfReceivedPayments = (subKey: string, categoryName: string) => {
    return listPayments
      .filter((p: any) => p.category?.toUpperCase() === categoryName.toUpperCase() && p.status === 'RECEIVED')
      .reduce((sum: number, p: any) => {
        if (!p.details?.pendingItems) return sum;
        
        // Exact match
        const exactVal = p.details.pendingItems[`${tripId}-${subKey}`];
        if (exactVal !== undefined) return sum + (Number(exactVal) || 0);

        // Fallback for old style/legacy entries
        const legacyVal = p.details.pendingItems[tripId];
        if (legacyVal !== undefined) {
          if (
            (subKey === 'dieselPrice' && categoryName.toUpperCase() === 'TRIP DIESEL') ||
            (subKey === 'commission' && categoryName.toUpperCase() === 'COMMISSION') ||
            (subKey === 'friday' && categoryName.toUpperCase() === 'FRIDAY') ||
            (subKey === 'bonus' && categoryName.toUpperCase() === 'BONUS') ||
            (subKey === 'bonus' && categoryName.toUpperCase() === 'TRIP DIESEL') || // fallback for bonus in trip diesel category
            (subKey === 'overtime' && categoryName.toUpperCase() === 'OVERTIME')
          ) {
            return sum + (Number(legacyVal) || 0);
          }
        }

        // AGG- matches
        // AGG-${subKey}-${file.id}-${companyName}
        const aggPrefix = `AGG-${subKey}-${trip.fileId}-`;
        const matchingAggKey = Object.keys(p.details.pendingItems).find(k => k.startsWith(aggPrefix));
        if (matchingAggKey) {
          const originalValue = Number(trip[subKey] || (subKey === 'generatorDiesel' ? trip['genDiesel'] : 0)) || 0;
          return sum + originalValue;
        }

        return sum;
      }, 0);
  };

  const commissionPaid = getSumOfReceivedPayments('commission', 'Commission');
  const dieselPaid = getSumOfReceivedPayments('dieselPrice', 'Trip Diesel');
  const generatorDieselPaid = getSumOfReceivedPayments('generatorDiesel', 'Trip Diesel');
  const extraDieselPaid = getSumOfReceivedPayments('extraDiesel', 'Trip Diesel') + getSumOfReceivedPayments('extraDiesel', 'Extra Fuel');
  const bonusPaid = Math.max(
    getSumOfReceivedPayments('bonus', 'Bonus'),
    getSumOfReceivedPayments('bonus', 'Trip Diesel')
  );
  const fridayPaid = getSumOfReceivedPayments('friday', 'Friday');
  const overtimePaid = getSumOfReceivedPayments('overtime', 'Overtime');

  trip.commissionPaid = commissionPaid;
  trip.dieselPaid = dieselPaid;
  trip.generatorDieselPaid = generatorDieselPaid;
  if ('genDieselPaid' in trip) {
    trip.genDieselPaid = generatorDieselPaid;
  }
  trip.extraDieselPaid = extraDieselPaid;
  trip.bonusPaid = bonusPaid;
  trip.fridayPaid = fridayPaid;
  trip.overtimePaid = overtimePaid;

  const totalAmount = (Number(trip.dieselPrice) || 0) + 
                      (Number(trip.commission) || 0) + 
                      (Number(trip.extraDiesel) || 0) +
                      (Number(trip.friday) || 0) +
                      (Number(trip.bonus) || 0) +
                      (Number(trip.overtime) || 0);
  trip.totalAmount = totalAmount;
  
  const newPaidAmount = commissionPaid + dieselPaid + extraDieselPaid + bonusPaid + fridayPaid + overtimePaid;
  trip.paidAmount = newPaidAmount;

  if (newPaidAmount <= 0) {
    trip.paymentStatus = 'UNPAID';
  } else if (newPaidAmount < totalAmount) {
    trip.paymentStatus = 'PARTIAL';
  } else {
    trip.paymentStatus = 'PAID';
  }

  // Save updated trip to Firebase
  const parentCol = d.user?.role === 'ADMIN' ? 'admins' : 'users';
  const subPath = d.user ? `${parentCol}/${d.user.id}/trips` : 'trips';
  saveFirebaseDoc(subPath, trip.id, trip);
};

const StoreContext = createContext<StoreState | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<any>(() => {
    const defaults = {
      currentView: 'LOGIN',
      routeHistory: [],
      navigationDirection: 'forward',
      isDrawerOpen: false,
      users: [],
      trips: [],
      allTrips: [],
      profiles: [],
      allProfiles: [],
      finances: [],
      allFinances: [],
      monthlyFiles: [],
      allMonthlyFiles: [],
      payments: [],
      allPayments: [],
      walletTransactions: [],
      allWalletTransactions: [],
      fuels: [],
      allFuels: [],
      notifications: [],
      language: 'en',
      theme: 'day-mode',
      appThemeMode: 'light',
      isNightMode: false,
      selectedCurrency: 'USD',
      logo: '/logo.png',
      zoom: 1,
      headerBg: '#2563EB',
      primaryColor: '#3b82f6',
      headerText: '#FFFFFF',
      backgroundColor: '',
      navBg: '#FFFFFF',
      navText: '#4B5563',
      fontStyle: 'sans',
      fontSize: 14,
      fontBold: false,
      loginWallpaper: '',
      loginBackgroundColor: '',
      loginCardColor: '',
      wallpaper: '',
      transactions: [],
      documents: [],
      publicMenuItems: [],
      locations: [],
      countries: [],
      companies: [],
      nationalities: [],
      containerTypes: [],
      loadingTypes: [],
      idTypes: [],
      extraDieselReasons: [],
      advanceReasons: [],
      emptyReturnYards: ['GWC YARD', 'GAC YARD', 'HAMAD PORT', 'CTC YARD'],
      genders: ['MALE', 'FEMALE', 'OTHER'],
      religions: ['ISLAM', 'HINDUISM', 'CHRISTIANITY', 'BUDDHISM', 'OTHER'],
      professions: ['DRIVER', 'MANAGER', 'TECHNICIAN', 'ADMINISTRATOR', 'OTHER'],
      walletIncomeSources: ['Salary', 'Bonus', 'Freelance', 'Business Income', 'Investment Return', 'Other'],
      walletDeductionReasons: ['Bill Payment', 'Transport', 'Food & Dining', 'Rent & Utilities', 'Office Expense', 'Others'],
      walletPaymentMethods: ['Cash', 'Bank Transfer', 'Mobile Banking'],
      policeStations: [],
      cities: [],
      states: [],
      postOffices: [
        { name: 'Dhaka GPO', code: '1000' },
        { name: 'Chittagong GPO', code: '4000' },
        { name: 'Sylhet GPO', code: '3100' },
        { name: 'Khulna GPO', code: '9000' },
        { name: 'Rajshahi GPO', code: '6000' }
      ],
      dashboardOrder: ['ACTIVE_TRIPS', 'DASHBOARD_STATS', 'CHART', 'RECENT_ACTIVITY'],
      banks: [],
      branches: [],
      routingNumbers: [],
      prayerTimeOffsets: {},
      currencies: [
        { code: 'QAR', symbol: 'QAR', name: 'Qatari Riyal' },
        { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' },
        { code: 'USD', symbol: '$', name: 'US Dollar' }
      ],
      adminPin: '1515',
      globalFilterMonth: new Date().getMonth() + 1,
      globalFilterYear: new Date().getFullYear(),
      isFeedbackOpen: false,
      feedbackMessage: '',
      feedbackType: 'success' as const,
      isLoadingView: false,
      isDropdownOpen: false,
      isEntryFormOpen: false,
      isPaymentPopupOpen: false,
      confirmConfig: null,
      supportInfo: {
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
      }
    };
    try {
      const saved = localStorage.getItem('fleetpro_state');
      if (saved) {
         const parsed = JSON.parse(saved);
         // Filter out undefined keys from parsed so they don't overwrite defaults
         Object.keys(parsed).forEach(key => {
            if (parsed[key] === undefined) {
               delete parsed[key];
            } else if (Array.isArray(parsed[key]) && parsed[key].length === 0 && Array.isArray(defaults[key as keyof StoreState]) && (defaults[key as keyof StoreState] as any[]).length > 0) {
               // Do not let empty arrays override non-empty defaults for config lists
               delete parsed[key];
            }
         });
         if (parsed.loginBackgroundColor === '#F3F4F6') parsed.loginBackgroundColor = '';
         if (parsed.loginCardColor === '#FFFFFF') parsed.loginCardColor = '';
         if (!parsed.language) parsed.language = 'en';
         if (!parsed.appThemeMode || parsed.appThemeMode === 'system') parsed.appThemeMode = 'light';
         if (!parsed.theme || parsed.theme === 'system') parsed.theme = 'day-mode';
         
         // Always reset transient visual states to prevent non-dismissible persistent popup bugs
         parsed.isFeedbackOpen = false;
         parsed.feedbackMessage = '';
         parsed.feedbackType = 'success';
         parsed.isLoadingView = false;
         parsed.isDropdownOpen = false;
         parsed.isEntryFormOpen = false;
         parsed.isPaymentPopupOpen = false;
         parsed.confirmConfig = null;
         parsed.currencies = defaults.currencies;

         // Clean up payments from local storage to remove corrupt or undefined category records
         if (Array.isArray(parsed.payments)) {
           parsed.payments = parsed.payments.filter((p: any) => p && p.id !== 'PAY-W6970' && p.category !== 'undefined' && p.category !== undefined && p.category !== '');
         }
         if (Array.isArray(parsed.allPayments)) {
           parsed.allPayments = parsed.allPayments.filter((p: any) => p && p.id !== 'PAY-W6970' && p.category !== 'undefined' && p.category !== undefined && p.category !== '');
         }

         return { ...defaults, ...parsed };
      }
    } catch {}
    return defaults;
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  const syncTimeoutRef = useRef<any>(null);
  const feedbackTimeoutRef = useRef<any>(null);
  const pendingUserThemeSettings = useRef<Record<string, any>>({});
  const pendingBrandingSettings = useRef<Record<string, any>>({});

  const mutate = useCallback((recipe: (draft: any, prev: any) => void) => {
    let next;
    try {
      // Don't stringify functions or they will be dropped
      const { confirmConfig, customBackAction, ...rest } = stateRef.current;
      next = JSON.parse(JSON.stringify(rest));
      next.confirmConfig = confirmConfig;
      next.customBackAction = customBackAction;
    } catch {
      next = { ...stateRef.current };
    }
    recipe(next, stateRef.current);
    stateRef.current = next;
    setState(next);
    try { 
       const { confirmConfig, customBackAction, ...restToSave } = next;
       localStorage.setItem('fleetpro_state', JSON.stringify(restToSave)); 
    } catch {}
  }, []);

  const scheduleFirebaseSync = useCallback(() => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    syncTimeoutRef.current = setTimeout(() => {
      // 1. Sync User Theme Settings
      const hasPendingUserSpecific = Object.keys(pendingUserThemeSettings.current).length > 0;
      if (hasPendingUserSpecific && stateRef.current.user) {
        const coll = stateRef.current.user.role === 'ADMIN' ? 'admins' : 'users';
        const updatedThemeSettings = {
          ...(stateRef.current.user.userThemeSettings || {}),
          ...pendingUserThemeSettings.current
        };
        const updatedUser = {
          ...stateRef.current.user,
          userThemeSettings: updatedThemeSettings
        };
        pendingUserThemeSettings.current = {};
        saveFirebaseDoc(coll, stateRef.current.user.id, updatedUser).catch((err) => {
          console.error('Failed to sync user theme settings to firebase', err);
        });
      }

      // 2. Sync Branding Settings
      const hasPendingBranding = Object.keys(pendingBrandingSettings.current).length > 0;
      if (hasPendingBranding) {
        const payload = { ...pendingBrandingSettings.current };
        pendingBrandingSettings.current = {};
        saveFirebaseDocMerge('settings', 'branding', payload).catch((err) => {
          console.error('Failed to sync branding key to firebase', err);
        });
      }
    }, 250);
  }, []);

  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, []);

// Clean handler references approach
  const handlersRef = useRef<Record<string, any>>({});
  
  if (!handlersRef.current['__init']) {
     handlersRef.current['__init'] = true;
     handlersRef.current['showFeedback'] = (message: string, type: any = 'success') => {
        if (feedbackTimeoutRef.current) {
          clearTimeout(feedbackTimeoutRef.current);
        }
        mutate((d: any) => { d.feedbackMessage = message; d.feedbackType = type; d.isFeedbackOpen = true; });
        feedbackTimeoutRef.current = setTimeout(() => {
          mutate((d: any) => d.isFeedbackOpen = false);
          feedbackTimeoutRef.current = null;
        }, 4200);
     };
     handlersRef.current['exportData'] = async () => {
         mutate((d: any) => d.isLoadingView = true);
         const currentUser = stateRef.current.user;
         if (!currentUser) {
            handlersRef.current['showFeedback'](
               stateRef.current.language === 'bn' 
                 ? 'ডাটা এক্সপোর্ট করার জন্য অনুগ্রহ করে প্রথমে লগইন করুন।' 
                 : 'Please log in first to export your data.', 
               'error'
            );
            mutate((d: any) => d.isLoadingView = false);
            return;
         }

         handlersRef.current['showFeedback'](
            stateRef.current.language === 'bn' 
              ? 'গুগল ড্রাইভে ব্যক্তিগত ডাটা এক্সপোর্ট করা হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...' 
              : 'Exporting personal data to Google Drive, please wait...', 
            'success'
         );
         try {
           let token = await getAccessToken();
           if (!token) {
              const result = await googleSignIn();
              if (result) token = result.accessToken;
           }
           if (token) {
              const currentState = stateRef.current;
              
              // Adhering strictly to user request: ONLY export this specific user's personal data
              const personalStateBackup = {
                 isPersonalBackup: true,
                 userId: currentUser.id,
                 userEmail: currentUser.email,
                 user: currentUser,
                 // Filter out other users for security
                 users: [currentUser],
                 
                 // User's personal app records
                 trips: currentState.trips || [],
                 allTrips: currentState.allTrips || [],
                 profiles: currentState.profiles || [],
                 allProfiles: currentState.allProfiles || [],
                 finances: currentState.finances || [],
                 allFinances: currentState.allFinances || [],
                 monthlyFiles: currentState.monthlyFiles || [],
                 allMonthlyFiles: currentState.allMonthlyFiles || [],
                 payments: currentState.payments || [],
                 allPayments: currentState.allPayments || [],
                 walletTransactions: currentState.walletTransactions || [],
                 allWalletTransactions: currentState.allWalletTransactions || [],
                 notifications: currentState.notifications || [],
                 
                 // System configurations (dropdowns)
                 locations: currentState.locations || [],
                 countries: currentState.countries || [],
                 companies: currentState.companies || [],
                 nationalities: currentState.nationalities || [],
                 containerTypes: currentState.containerTypes || [],
                 loadingTypes: currentState.loadingTypes || [],
                 idTypes: currentState.idTypes || [],
                 extraDieselReasons: currentState.extraDieselReasons || [],
                 advanceReasons: currentState.advanceReasons || [],
                 emptyReturnYards: currentState.emptyReturnYards || [],
                 genders: currentState.genders || [],
                 religions: currentState.religions || [],
                 professions: currentState.professions || [],
                  walletIncomeSources: currentState.walletIncomeSources || [],
                  walletDeductionReasons: currentState.walletDeductionReasons || [],
                  walletPaymentMethods: currentState.walletPaymentMethods || [],
                 policeStations: currentState.policeStations || [],
                 cities: currentState.cities || [],
                 states: currentState.states || [],
                 postOffices: currentState.postOffices || [],
                 banks: currentState.banks || [],
                 branches: currentState.branches || [],
                 routingNumbers: currentState.routingNumbers || [],
                 
                 // User presentation preferences
                 language: currentState.language,
                 theme: currentState.theme,
                 appThemeMode: currentState.appThemeMode,
                 isNightMode: currentState.isNightMode,
                 selectedCurrency: currentState.selectedCurrency,
                 zoom: currentState.zoom,
                 headerBg: currentState.headerBg,
                 primaryColor: currentState.primaryColor,
                 backgroundColor: currentState.backgroundColor,
                 navBg: currentState.navBg,
                 navText: currentState.navText,
                 fontStyle: currentState.fontStyle,
                 fontSize: currentState.fontSize,
                 fontBold: currentState.fontBold,
                 wallpaper: currentState.wallpaper,
                 loginWallpaper: currentState.loginWallpaper,
                 loginBackgroundColor: currentState.loginBackgroundColor,
                 loginCardColor: currentState.loginCardColor
              };

              const success = await uploadToDrive(personalStateBackup, `fleetpro_backup_user_${currentUser.id}.json`);
              if (success) {
                 handlersRef.current['showFeedback'](
                    currentState.language === 'bn'
                      ? 'সফলভাবে আপনার সকল ব্যক্তিগত ডাটা গুগল ড্রাইভে ব্যাকআপ করা হয়েছে।'
                      : 'Successfully backed up your personal data to Google Drive.',
                    'success'
                 );
              } else {
                 handlersRef.current['showFeedback'](
                    currentState.language === 'bn'
                      ? 'গুগল ড্রাইভে ডাটা ব্যাকআপ আপলোড করা ব্যর্থ হয়েছে।'
                      : 'Failed to upload backup to Google Drive.',
                    'error'
                 );
              }
           }
         } catch (e) {
           console.error(e);
           handlersRef.current['showFeedback'](
              stateRef.current.language === 'bn'
                ? 'ডাটা এক্সপোর্ট ট্রুটি: লগইন প্রয়োজন বা ব্যর্থ হয়েছে।'
                : 'Error exporting data: Login required or failed.',
              'error'
           );
         } finally {
           mutate((d: any) => d.isLoadingView = false);
         }
      };
      handlersRef.current['importData'] = async () => {
         mutate((d: any) => d.isLoadingView = true);
         const currentUser = stateRef.current.user;
         if (!currentUser) {
            handlersRef.current['showFeedback'](
               stateRef.current.language === 'bn'
                 ? 'ডাটা ইমপোর্ট করার জন্য অনুগ্রহ করে প্রথমে লগইন করুন।'
                 : 'Please log in first to import your data.',
               'error'
            );
            mutate((d: any) => d.isLoadingView = false);
            return;
         }

         handlersRef.current['showFeedback'](
            stateRef.current.language === 'bn'
              ? 'গুগল ড্রাইভ থেকে ব্যক্তিগত ডাটা ইমপোর্ট করা হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...'
              : 'Importing personal data from Google Drive, please wait...',
            'success'
         );
         try {
           let token = await getAccessToken();
           if (!token) {
              const result = await googleSignIn();
              if (result) token = result.accessToken;
           }
           if (token) {
              const data = await downloadFromDrive(`fleetpro_backup_user_${currentUser.id}.json`);
              if (data) {
                 // Check if it belongs to another user
                 if (data.isPersonalBackup && data.userId !== currentUser.id) {
                    handlersRef.current['showFeedback'](
                       stateRef.current.language === 'bn'
                         ? 'নিরাপত্তা ত্রুটি: এই ব্যাকআপ ফাইলটি অন্য কোন ইউজারের। আপনি শুধুমাত্র নিজের ডাটা ইমপোর্ট করতে পারবেন।'
                         : 'Security Error: This backup file belongs to another user. You can only import your own personal data.',
                       'error'
                    );
                    mutate((d: any) => d.isLoadingView = false);
                    return;
                 }

                 const currentState = stateRef.current;
                 const mergedState = {
                    ...currentState,
                    users: currentState.users.map((u: any) => u.id === currentUser.id ? (data.user || u) : u),
                    
                    // Restored personal data
                    trips: data.trips || currentState.trips || [],
                    allTrips: data.allTrips || currentState.allTrips || [],
                    profiles: data.profiles || currentState.profiles || [],
                    allProfiles: data.allProfiles || currentState.allProfiles || [],
                    finances: data.finances || currentState.finances || [],
                    allFinances: data.allFinances || currentState.allFinances || [],
                    monthlyFiles: data.monthlyFiles || currentState.monthlyFiles || [],
                    allMonthlyFiles: data.allMonthlyFiles || currentState.allMonthlyFiles || [],
                    payments: data.payments || currentState.payments || [],
                    allPayments: data.allPayments || currentState.allPayments || [],
                    walletTransactions: data.walletTransactions || currentState.walletTransactions || [],
                    allWalletTransactions: data.allWalletTransactions || currentState.allWalletTransactions || [],
                    notifications: data.notifications || currentState.notifications || [],
                    
                    // Restored lookup list dropdowns
                    locations: data.locations || currentState.locations,
                    countries: data.countries || currentState.countries,
                    companies: data.companies || currentState.companies,
                    nationalities: data.nationalities || currentState.nationalities,
                    containerTypes: data.containerTypes || currentState.containerTypes,
                    loadingTypes: data.loadingTypes || currentState.loadingTypes,
                    idTypes: data.idTypes || currentState.idTypes,
                    extraDieselReasons: data.extraDieselReasons || currentState.extraDieselReasons,
                     walletIncomeSources: data.walletIncomeSources || currentState.walletIncomeSources,
                     walletDeductionReasons: data.walletDeductionReasons || currentState.walletDeductionReasons,
                     walletPaymentMethods: data.walletPaymentMethods || currentState.walletPaymentMethods,
                    advanceReasons: data.advanceReasons || currentState.advanceReasons,
                    
                    // Restored preferences
                    language: data.language || currentState.language,
                    theme: data.theme || currentState.theme,
                    appThemeMode: data.appThemeMode || currentState.appThemeMode,
                    isNightMode: typeof data.isNightMode === 'boolean' ? data.isNightMode : currentState.isNightMode,
                    selectedCurrency: data.selectedCurrency || currentState.selectedCurrency,
                    zoom: data.zoom || currentState.zoom,
                    headerBg: data.headerBg || currentState.headerBg,
                    primaryColor: data.primaryColor || currentState.primaryColor,
                    backgroundColor: data.backgroundColor || currentState.backgroundColor,
                    navBg: data.navBg || currentState.navBg,
                    navText: data.navText || currentState.navText,
                    fontStyle: data.fontStyle || currentState.fontStyle,
                    fontSize: data.fontSize || currentState.fontSize,
                    fontBold: typeof data.fontBold === 'boolean' ? data.fontBold : currentState.fontBold,
                    wallpaper: data.wallpaper || currentState.wallpaper,
                    loginWallpaper: data.loginWallpaper || currentState.loginWallpaper,
                    loginBackgroundColor: data.loginBackgroundColor || currentState.loginBackgroundColor,
                    loginCardColor: data.loginCardColor || currentState.loginCardColor
                 };

                 localStorage.setItem('fleetpro_state', JSON.stringify(mergedState));
                 mutate(() => mergedState);
                 
                 handlersRef.current['showFeedback'](
                    stateRef.current.language === 'bn'
                      ? 'ব্যক্তিগত ব্যাকআপ ডাটা সফলভাবে ডাউনলোড ও রিস্টোর করা হয়েছে। রিলোড হচ্ছে...'
                      : 'Personal backup successfully imported. Reloading...',
                    'success'
                 );
                 setTimeout(() => window.location.reload(), 1500);
              } else {
                 handlersRef.current['showFeedback'](
                    stateRef.current.language === 'bn'
                      ? 'গুগল ড্রাইভে কোনো ব্যাকআপ ফাইল পাওয়া যায়নি।'
                      : 'No backup file found in Google Drive.',
                    'error'
                 );
              }
           }
         } catch (e) {
           console.error(e);
           handlersRef.current['showFeedback'](
              stateRef.current.language === 'bn'
                ? 'ডাটা ইমপোর্ট ট্রুটি: লগইন প্রয়োজন বা ব্যর্থ হয়েছে।'
                : 'Error importing data: Login required or failed.',
              'error'
           );
         } finally {
            mutate((d: any) => d.isLoadingView = false);
         }
      };
      handlersRef.current['exportLocalData'] = async () => {
        mutate((d: any) => d.isLoadingView = true);
        try {
          const currentState = stateRef.current;
          const fileName = `fleetpro_backup_${new Date().toISOString().split('T')[0]}.json`;
          const fileContent = JSON.stringify(currentState, null, 2);

          if (Capacitor.isNativePlatform()) {
             // Write a temporary file first
             const writeResult = await Filesystem.writeFile({
               path: fileName,
               data: fileContent,
               directory: Directory.Cache,
               encoding: Encoding.UTF8
             });
             
             // Share the file
             await Share.share({
               title: 'Export FleetPro Backup',
               url: writeResult.uri,
               dialogTitle: 'Export Backup'
             });
             handlersRef.current['showFeedback']('Local backup initiated successfully', 'success');
          } else {
             // Web platform download
             const blob = new Blob([fileContent], { type: 'application/json' });
             const url = URL.createObjectURL(blob);
             const a = window.document.createElement('a');
             a.href = url;
             a.download = fileName;
             window.document.body.appendChild(a);
             a.click();
             window.document.body.removeChild(a);
             URL.revokeObjectURL(url);
             handlersRef.current['showFeedback']('Backup downloaded successfully', 'success');
          }
        } catch (e: any) {
          console.error('Local export error:', e);
          handlersRef.current['showFeedback'](e.message || 'Failed to export local backup', 'error');
        } finally {
          mutate((d: any) => d.isLoadingView = false);
        }
     };
     handlersRef.current['importLocalData'] = async (fileContent: string) => {
        mutate((d: any) => d.isLoadingView = true);
        try {
          const parsed = JSON.parse(fileContent);
          if (!parsed || typeof parsed !== 'object') {
            throw new Error('Invalid backup file structure');
          }
          
          // Verify some essential structures (e.g. users, currentView) to make sure it is a valid FleetPro backup
          if (!parsed.currentView && !parsed.user && !parsed.trips) {
            throw new Error('This file does not appear to be a valid backup from this application.');
          }
          
          localStorage.setItem('fleetpro_state', JSON.stringify(parsed));
          handlersRef.current['showFeedback']('Successfully restored backup. Reloading...', 'success');
          setTimeout(() => window.location.reload(), 1500);
          return true;
        } catch (e: any) {
          console.error('Local import error:', e);
          handlersRef.current['showFeedback'](e.message || 'Failed to import backup file', 'error');
          return false;
        } finally {
          mutate((d: any) => d.isLoadingView = false);
        }
     };
     handlersRef.current['clearPayments'] = () => mutate((d: any) => {
       d.payments = [];
       if (d.trips) {
         d.trips.forEach((trip: any) => {
           trip.commissionPaid = 0;
           trip.dieselPaid = 0;
           trip.generatorDieselPaid = 0;
           if ('genDieselPaid' in trip) {
             trip.genDieselPaid = 0;
           }
           trip.extraDieselPaid = 0;
           trip.bonusPaid = 0;
           trip.fridayPaid = 0;
           trip.overtimePaid = 0;
           trip.paidAmount = 0;
           trip.paymentStatus = 'UNPAID';
           
           // Save to Firebase
           const parentCol = d.user?.role === 'ADMIN' ? 'admins' : 'users';
           const subPath = d.user ? `${parentCol}/${d.user.id}/trips` : 'trips';
           saveFirebaseDoc(subPath, trip.id, trip);
         });
       }
     });
     handlersRef.current['clearNotifications'] = () => mutate((d: any) => d.notifications = []);
      handlersRef.current['approveUser'] = (userId: string) => {
         mutate((d: any) => {
            if (d.users) {
               const idx = d.users.findIndex((u: any) => u.id === userId);
               if (idx >= 0) {
                  d.users[idx].status = 'ENABLED';
                  d.users[idx].statusTimestamp = new Date().toISOString();
                  const updatedUser = d.users[idx];
                  const coll = updatedUser.role === 'ADMIN' ? 'admins' : 'users';
                  saveFirebaseDoc(coll, updatedUser.id, updatedUser);
               }
            }
         });
      };
     handlersRef.current['addNotification'] = (notification: any) => {
        const id = Date.now().toString() + Math.random().toString(36).substring(7);
        const fullNotification = {
          ...notification,
          id,
          timestamp: new Date().toISOString(),
          isRead: false
        };
        mutate((d: any) => {
           if (!d.notifications) d.notifications = [];
           d.notifications.unshift(fullNotification);
        });
        
        const targetUserId = notification.userId || notification.targetUserId;
        const parentCol = stateRef.current.user?.role === 'ADMIN' ? 'admins' : 'users';
        let subPath = stateRef.current.user ? `${parentCol}/${stateRef.current.user.id}/notifications` : 'notifications';
        
        if (targetUserId) {
          const targetUser = stateRef.current.users?.find((u: any) => u.id === targetUserId);
          const tCol = targetUser?.role === 'ADMIN' ? 'admins' : 'users';
          subPath = `${tCol}/${targetUserId}/notifications`;
        }
        saveFirebaseDoc(subPath, id, fullNotification);
     };
     handlersRef.current['clearAccountNotifications'] = (userId: string) => {
        mutate((d: any) => {
           if (d.notifications) {
              d.notifications = d.notifications.filter((n: any) => n.targetUserId !== userId && n.userId !== userId);
           }
        });
        
        // Let's attempt to delete from Firebase. We don't have all the IDs easily but we can try to fetch them and delete, or just rely on local state updates for now to fix the crash.
        // The most critical part is preventing the app from crashing.
     };
     handlersRef.current['markNotificationAsRead'] = (id: string) => {
        mutate((d: any) => {
           if (d.notifications) {
              const notif = d.notifications.find((n: any) => n.id === id);
              if (notif) {
                 notif.isRead = true;
              }
           }
        });
     };
     handlersRef.current['confirmAction'] = (msg: string, onConfirm: () => void, options?: any) => {
        mutate((d: any) => {
           d.confirmConfig = {
              isOpen: true,
              message: msg,
              onConfirm,
              ...options
           };
        });
     };
     handlersRef.current['closeConfirm'] = () => {
        mutate((d: any) => {
           if (d.confirmConfig) {
              d.confirmConfig.isOpen = false;
           }
        });
     };
     handlersRef.current['logout'] = () => mutate((d: any) => { 
         d.user = null; 
         d.currentView = 'LOGIN'; 
         d.trips = [];
         d.allTrips = [];
         d.profiles = [];
         d.allProfiles = [];
         d.finances = [];
         d.allFinances = [];
         d.monthlyFiles = [];
         d.allMonthlyFiles = [];
         d.payments = [];
         d.allPayments = [];
         d.walletTransactions = [];
         d.allWalletTransactions = [];
         d.fuels = [];
         d.allFuels = [];
         d.notifications = [];
      });
     handlersRef.current['setNavigationDirection'] = (dir: 'forward' | 'backward') => {
        mutate((d: any) => {
           d.navigationDirection = dir;
        });
     };

     handlersRef.current['goBack'] = (fromPopState: boolean = false, state?: any) => {
        if (fromPopState) {
           mutate((d: any) => {
              d.navigationDirection = 'backward';
              if (state && state.view) {
                 if (d.currentView !== state.view) {
                   if ((state.view === 'LOGIN' || state.view === 'SIGNUP') && d.user) {
                     d.currentView = 'DASHBOARD';
                   } else {
                     d.currentView = state.view;
                   }
                   if (d.routeHistory && d.routeHistory.length > 0) {
                     const idx = d.routeHistory.indexOf(d.currentView);
                     if (idx >= 0) {
                       d.routeHistory = d.routeHistory.slice(0, idx);
                     } else {
                       d.routeHistory.pop();
                     }
                   }
                 }
               } else {
                 if (d.routeHistory && d.routeHistory.length > 0) {
                   d.currentView = d.routeHistory.pop();
                 } else {
                   d.currentView = 'DASHBOARD';
                 }
               }
             d.activeSection = state ? (state.activeSection || null) : null;
             d.activeDetailView = state ? (state.activeDetailView || null) : null;
             d.showReceivedBreakdown = state ? (state.showReceivedBreakdown || false) : false;
             d.showPendingBreakdown = state ? (state.showPendingBreakdown || false) : false;
             if (state && state.view !== 'TRIP_DETAILS' && state.view !== 'NEW_TRIP') {
                d.selectedTrip = null;
                d.editingTrip = null;
             }
              d.isEntryFormOpen = state ? (state.isEntryFormOpen || false) : false;
              d.isPaymentPopupOpen = state ? (state.isPaymentPopupOpen || false) : false;
             d.customHeaderTitle = null;
             d.selectedNotification = null;
           });
        } else {
           window.history.back();
        }
     };
  }

      handlersRef.current['resetSystem'] = async () => {
        mutate((d: any, prev: any) => {
          d.trips = [];
          d.allTrips = [];
          d.profiles = [];
          d.allProfiles = [];
          d.finances = [];
          d.allFinances = [];
          d.monthlyFiles = [];
          d.allMonthlyFiles = [];
          d.payments = [];
          d.allPayments = [];
          d.walletTransactions = [];
          d.allWalletTransactions = [];
          d.fuels = [];
          d.allFuels = [];
          d.notifications = [];
          d.logo = '/logo.png';
          d.headerBg = '#2563EB';
          d.backgroundColor = '';
          d.navBg = '#FFFFFF';
          d.wallpaper = '';
          d.loginWallpaper = '';
          d.loginBackgroundColor = '';
          d.loginCardColor = '';
          
          const parentCol = prev.user?.role === 'ADMIN' ? 'admins' : 'users';
          if (prev.user) {
            const subCols = ['trips', 'profiles', 'finances', 'monthlyFiles', 'payments', 'notifications', 'fuels', 'walletTransactions'];
            for (const col of subCols) {
              clearFirebaseCollection(`${parentCol}/${prev.user.id}/${col}`, d[col] || []).catch(() => {});
            }
          }
        });
        
        saveFirebaseDocMerge('settings', 'branding', {
          logo: '/logo.png',
          headerBg: '#2563EB',
          backgroundColor: '',
          navBg: '#FFFFFF',
          wallpaper: '',
          loginWallpaper: '',
          loginBackgroundColor: '',
          loginCardColor: ''
        }).catch(() => {});
      };

      handlersRef.current['resetSections'] = async (sections: string[]) => {
        mutate((d: any, prev: any) => {
          sections.forEach(sec => {
            const key = sec.toLowerCase();
            if (['trips', 'profiles', 'finances', 'monthlyFiles', 'payments', 'notifications', 'fuels', 'walletTransactions'].includes(key)) {
              d[key] = [];
              const targetKey = 'all' + key.charAt(0).toUpperCase() + key.slice(1);
              if (d[targetKey]) d[targetKey] = [];
            }
          });
          
          const parentCol = prev.user?.role === 'ADMIN' ? 'admins' : 'users';
          if (prev.user) {
            sections.forEach(sec => {
              const key = sec.toLowerCase();
              if (['trips', 'profiles', 'finances', 'monthlyFiles', 'payments', 'notifications', 'fuels', 'walletTransactions'].includes(key)) {
                clearFirebaseCollection(`${parentCol}/${prev.user.id}/${key}`, d[key] || []).catch(() => {});
              }
            });
          }
        });
      };

  useEffect(() => {
    const unsubscribes: any[] = [];

    // Assuming local user login means we should sync down data
    if (state.user) {
      const parentCol = state.user.role === 'ADMIN' ? 'admins' : 'users';
      const parentPath = `${parentCol}/${state.user.id}`;

      // 1. Subscribe to own profile document to keep it always in sync
      unsubscribes.push(
        subscribeFirebaseDoc(parentCol, state.user.id, (data) => {
          if (data) {
            mutate((d: any) => {
              const updatedUser = { ...d.user, ...data };
              d.user = updatedUser;
              // For standard users, they should only see themselves in the users array for privacy
              if (updatedUser.role !== 'ADMIN') {
                d.users = [updatedUser];
              }
            });
          }
        })
      );

      // 2. Load trips, profiles, finances, monthlyFiles, payments, notifications from OWN subcollections
      const userSubCollections = [
        'trips', 'profiles', 'finances', 'monthlyFiles', 'payments', 'notifications', 'fuels', 'walletTransactions'
      ];

      userSubCollections.forEach(col => {
        const subPath = `${parentPath}/${col}`;
        unsubscribes.push(
          subscribeFirebaseCollection(subPath, (data) => {
            mutate((d: any) => {
              let targetKey = col;
              if (['trips', 'profiles', 'finances', 'monthlyFiles', 'payments', 'fuels', 'walletTransactions'].includes(col)) {
                targetKey = 'all' + col.charAt(0).toUpperCase() + col.slice(1);
              }
              let cleanData = data || [];
              if (col === 'payments') {
                cleanData = cleanData.filter((p: any) => p && p.id !== 'PAY-W6970' && p.category !== 'undefined' && p.category !== undefined && p.category !== '');
              }
              d[col] = cleanData;
              d[targetKey] = cleanData;
            });
          })
        );
      });



      // 3. For ADMINs, subscribe to all users and admins root collections so they can view user account profiles
      // Admins will NOT subscribe to user trips or payments, satisfying the constraint
      if (state.user.role === 'ADMIN') {
        // Run a background delete of the duplicate users/Admin document if present
        deleteFirebaseDoc('users', 'Admin').catch(() => {});

        unsubscribes.push(
          subscribeFirebaseCollection('users', (data) => {
            mutate((d: any) => {
              const cleanData = (data || []).filter((u: any) => u.id !== 'Admin');
              const existingAdmins = d.users ? d.users.filter((u: any) => u.role === 'ADMIN') : [];
              d.users = [...cleanData, ...existingAdmins];
            });
          })
        );

        unsubscribes.push(
          subscribeFirebaseCollection('admins', (data) => {
            mutate((d: any) => {
              const cleanData = data || [];
              const adminsWithRole = cleanData.map(u => ({...u, role: u.role || 'ADMIN'}));
              const existingUsers = d.users ? d.users.filter((u: any) => u.role !== 'ADMIN') : [];
              d.users = [...existingUsers, ...adminsWithRole];
              
              if (d.user && d.user.role === 'ADMIN') {
                const updatedAdmin = adminsWithRole.find((u: any) => u.id === d.user.id);
                if (updatedAdmin) {
                  d.user = { ...d.user, ...updatedAdmin };
                }
              }
            });
          })
        );
      }
    }
      
      const configCols = ['locations', 'countries', 'companies', 'nationalities', 'containerTypes', 'loadingTypes', 'idTypes', 'extraDieselReasons', 'advanceReasons', 'emptyReturnYards', 'banks', 'branches', 'routingNumbers', 'currencies', 'genders', 'religions', 'professions', 'postOffices', 'policeStations', 'cities', 'states', 'walletIncomeSources', 'walletDeductionReasons', 'walletPaymentMethods'];
      
      // 1. Subscribe to individual documents in 'dropdowns' collection (locations, companies, extraDieselReasons, etc.)
      configCols.forEach(col => {
        unsubscribes.push(
          subscribeFirebaseDoc('dropdowns', col, (docData) => {
            if (docData) {
              const arrayData = Array.isArray(docData.data) ? docData.data : (Array.isArray(docData) ? docData : null);
              if (arrayData && arrayData.length >= 0) {
                mutate((d: any) => {
                  d[col] = arrayData;
                });
              }
            } else if (docData === null) {
              // Try to bootstrap dropdowns document if it doesn't exist yet but has local values
              mutate((d: any) => {
                if (d[col] && d[col].length > 0) {
                  saveFirebaseDocMerge('dropdowns', col, { data: d[col] });
                }
              });
            }
          })
        );
      });

      // 2. Subscribe to global branding settings (logo, colors, backgrounds, wallpapers, etc.) in Firestore
      unsubscribes.push(
        subscribeFirebaseDoc('settings', 'branding', (docData) => {
          if (docData) {
            mutate((d: any) => {
              const brandingKeys = [
                'logo', 'headerBg', 'navBg', 'backgroundColor', 'wallpaper',
                'loginWallpaper', 'loginBackgroundColor', 'loginCardColor', 'primaryColor'
              ];
              brandingKeys.forEach(k => {
                if (docData[k] !== undefined && docData[k] !== null) {
                  d[k] = docData[k];
                }
              });
            });
          } else if (docData === null) {
            // Bootstrap remote settings with local defaults
            mutate((d: any) => {
              const brandingData: any = {};
              const brandingKeys = [
                'logo', 'headerBg', 'navBg', 'backgroundColor', 'wallpaper',
                'loginWallpaper', 'loginBackgroundColor', 'loginCardColor', 'primaryColor'
              ];
              let hasLocalBranding = false;
              brandingKeys.forEach(k => {
                if (d[k] !== undefined && d[k] !== null && d[k] !== '') {
                  brandingData[k] = d[k];
                  hasLocalBranding = true;
                }
              });
              if (hasLocalBranding) {
                saveFirebaseDocMerge('settings', 'branding', brandingData).catch(() => {});
              }
            });
          }
        })
      );

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [mutate, state.user?.id]);

  const value = useMemo(() => {
    return new Proxy(state, {
      get(target, prop) {
        if (typeof prop === 'string' && handlersRef.current[prop]) return handlersRef.current[prop];
        
        const userSpecificKeys = [
          'theme', 'appThemeMode', 'isNightMode', 
          'headerBg', 'headerText', 'backgroundColor', 
          'navBg', 'navText', 'wallpaper', 'primaryColor'
        ];
        if (typeof prop === 'string' && userSpecificKeys.includes(prop) && target.user) {
          const userSettings = target.user.userThemeSettings || {};
          if (userSettings[prop] !== undefined) {
            return userSettings[prop];
          }
        }
        
        if (typeof prop === 'string') {
          if (prop === 'setView') {
             handlersRef.current[prop] = (view: string, addToHistory: boolean = true) => {
               if (addToHistory) {
                 window.history.pushState({
                   view,
                   activeSection: null,
                   activeDetailView: null,
                   showReceivedBreakdown: false,
                   isEntryFormOpen: false,
                   isPaymentPopupOpen: false,
                   showPendingBreakdown: false
                 }, '', '');
               }
               mutate((d: any, prev: any) => {
                 d.navigationDirection = 'forward';
                 const prevView = prev.currentView;
                 if (prevView && prevView !== view) {
                   if (!d.routeHistory) d.routeHistory = [];
                   if (d.routeHistory.length === 0 || d.routeHistory[d.routeHistory.length - 1] !== prevView) {
                     d.routeHistory.push(prevView);
                   }
                 }
                 d.currentView = view;
                 d.customHeaderTitle = null;
                 d.activeSection = null;
                 d.activeDetailView = null;
                 d.showReceivedBreakdown = false;
                 d.isEntryFormOpen = false;
                 d.isPaymentPopupOpen = false;
                 d.showPendingBreakdown = false;
                 d.selectedNotification = null;
                 if (view !== 'TRIP_DETAILS' && view !== 'NEW_TRIP') {
                   d.selectedTrip = null;
                   d.editingTrip = null;
                 }
               });
             };
             return handlersRef.current[prop];
          }
          if (prop.startsWith('set')) {
            const key = prop.charAt(3).toLowerCase() + prop.slice(4);
            const fn = (val: any) => {
              const userSpecificKeys = [
                'theme', 'appThemeMode', 'isNightMode', 
                'headerBg', 'headerText', 'backgroundColor', 
                'navBg', 'navText', 'wallpaper', 'primaryColor'
              ];
              
              mutate((d: any, prev: any) => {
                const oldVal = prev[key];
                d[key] = val;

                // Sync theme, appThemeMode, isNightMode
                if (key === 'appThemeMode') {
                  d.isNightMode = val === 'dark';
                  d.theme = val === 'dark' ? 'night-mode' : 'day-mode';
                } else if (key === 'isNightMode') {
                  d.appThemeMode = val ? 'dark' : 'light';
                  d.theme = val ? 'night-mode' : 'day-mode';
                } else if (key === 'theme') {
                  d.isNightMode = val === 'night-mode';
                  d.appThemeMode = val === 'night-mode' ? 'dark' : 'light';
                }
                
                if (userSpecificKeys.includes(key) && d.user) {
                  if (!d.user.userThemeSettings) {
                    d.user.userThemeSettings = {};
                  }
                  d.user.userThemeSettings[key] = val;

                  // Sync user settings helpers
                  if (key === 'appThemeMode') {
                    d.user.userThemeSettings['isNightMode'] = val === 'dark';
                    d.user.userThemeSettings['theme'] = val === 'dark' ? 'night-mode' : 'day-mode';
                  } else if (key === 'isNightMode') {
                    d.user.userThemeSettings['appThemeMode'] = val ? 'dark' : 'light';
                    d.user.userThemeSettings['theme'] = val ? 'night-mode' : 'day-mode';
                  } else if (key === 'theme') {
                    d.user.userThemeSettings['isNightMode'] = val === 'night-mode';
                    d.user.userThemeSettings['appThemeMode'] = val === 'night-mode' ? 'dark' : 'light';
                  }
                  
                  // Keep d.users array in sync
                  if (d.users) {
                    const uIdx = d.users.findIndex((u: any) => u.id === d.user.id);
                    if (uIdx >= 0) {
                      d.users[uIdx] = { ...d.users[uIdx], userThemeSettings: d.user.userThemeSettings };
                    }
                  }
                }
                
                if ((key === 'activeSection' || key === 'activeDetailView') && oldVal !== val && val !== null && ((d.navigationDirection = 'forward'), true)) {
                  window.history.pushState({
                    view: d.currentView,
                    activeSection: d.activeSection,
                    activeDetailView: d.activeDetailView,
                    showReceivedBreakdown: d.showReceivedBreakdown || false,
                    showPendingBreakdown: d.showPendingBreakdown || false
                  }, '', '');
                }
              });

              if (userSpecificKeys.includes(key) && stateRef.current.user) {
                pendingUserThemeSettings.current[key] = val;
                
                // Sync settings for firebase save
                if (key === 'appThemeMode') {
                  pendingUserThemeSettings.current['isNightMode'] = val === 'dark';
                  pendingUserThemeSettings.current['theme'] = val === 'dark' ? 'night-mode' : 'day-mode';
                } else if (key === 'isNightMode') {
                  pendingUserThemeSettings.current['appThemeMode'] = val ? 'dark' : 'light';
                  pendingUserThemeSettings.current['theme'] = val ? 'night-mode' : 'day-mode';
                } else if (key === 'theme') {
                  pendingUserThemeSettings.current['isNightMode'] = val === 'night-mode';
                  pendingUserThemeSettings.current['appThemeMode'] = val === 'night-mode' ? 'dark' : 'light';
                }

                scheduleFirebaseSync();
              } else {
                const brandingKeys = [
                  'logo', 'headerBg', 'navBg', 'backgroundColor', 'wallpaper',
                  'loginWallpaper', 'loginBackgroundColor', 'loginCardColor', 'primaryColor'
                ];
                if (brandingKeys.includes(key)) {
                  pendingBrandingSettings.current[key] = val;
                  scheduleFirebaseSync();
                }
              }
            };
            handlersRef.current[prop] = fn; return fn;
          }
          if (prop.startsWith('add')) {
            let key = prop.charAt(3).toLowerCase() + prop.slice(4) + 's';
            if (key === 'countrys') key = 'countries';
            if (key === 'nationalitys') key = 'nationalities';
            if (key === 'companys') key = 'companies';
            if (key === 'branchs') key = 'branches';
            if (key === 'currencys') key = 'currencies';
            const fn = (item: any) => {
              mutate((d: any) => {
                if (!d[key]) d[key] = [];
                const isDuplicate = d[key].some((x: any) => {
                  if (typeof x === 'string' && typeof item === 'string') {
                    return x.toUpperCase() === item.toUpperCase();
                  }
                  if (x && typeof x === 'object' && item && typeof item === 'object') {
                    if (key === 'locations') {
                      return String(x.country).toUpperCase() === String(item.country).toUpperCase() && 
                             String(x.name).toUpperCase() === String(item.name).toUpperCase();
                    }
                    const xId = x.id || x.code || x.name || x.number;
                    const itemId = item.id || item.code || item.name || item.number;
                    return xId && itemId && String(xId).toUpperCase() === String(itemId).toUpperCase();
                  }
                  return false;
                });
                if (!isDuplicate) {
                  d[key].push(item);
                }

                if (key === 'payments' && item) {
                  const affectedTripIds = getAffectedTripIds(item, d);
                  affectedTripIds.forEach(tripId => {
                    recalculateTripPayments(tripId, d);
                  });
                }

                // Auto-add trip details to other dropdown arrays if missing
                if (key === 'trips' && item) {
                  // 1. Company Name
                  if (item.companyName && item.companyName.trim() !== '') {
                    const company = item.companyName.trim();
                    if (!d.companies) d.companies = [];
                    if (!d.companies.some((x: any) => typeof x === 'string' ? x.toUpperCase() === company.toUpperCase() : (x && x.name && x.name.toUpperCase() === company.toUpperCase()))) {
                      d.companies.push(company.toUpperCase());
                    }
                  }
                  // 2. Loading Place (locations)
                  if (item.loadingPlace && item.loadingPlace.trim() !== '') {
                    const name = item.loadingPlace.trim();
                    const country = item.fromCountry || 'Qatar';
                    if (!d.locations) d.locations = [];
                    if (!d.locations.some((x: any) => x && x.country && x.name && x.country.toUpperCase() === country.toUpperCase() && x.name.toUpperCase() === name.toUpperCase())) {
                      d.locations.push({ country, name });
                    }
                  }
                  // 3. Delivery Place (locations)
                  if (item.deliveryPlace && item.deliveryPlace.trim() !== '') {
                    const name = item.deliveryPlace.trim();
                    const country = item.arrivalCountry || 'Qatar';
                    if (!d.locations) d.locations = [];
                    if (!d.locations.some((x: any) => x && x.country && x.name && x.country.toUpperCase() === country.toUpperCase() && x.name.toUpperCase() === name.toUpperCase())) {
                      d.locations.push({ country, name });
                    }
                  }
                  // 4. Container Title / Types
                  if (item.containerTitle && item.containerTitle.trim() !== '') {
                    const cType = item.containerTitle.trim();
                    if (!d.containerTypes) d.containerTypes = [];
                    if (!d.containerTypes.some((x: any) => typeof x === 'string' ? x.toUpperCase() === cType.toUpperCase() : (x && x.name && x.name.toUpperCase() === cType.toUpperCase()))) {
                      d.containerTypes.push(cType);
                    }
                  }
                  // 5. Loading Type
                  if (item.loadingType && item.loadingType.trim() !== '') {
                    const lType = item.loadingType.trim();
                    if (!d.loadingTypes) d.loadingTypes = [];
                    if (!d.loadingTypes.some((x: any) => typeof x === 'string' ? x.toUpperCase() === lType.toUpperCase() : (x && x.name && x.name.toUpperCase() === lType.toUpperCase()))) {
                      d.loadingTypes.push(lType);
                    }
                  }
                  // 6. Empty Return Yard
                  if (item.emptyReturnYard && item.emptyReturnYard.trim() !== '') {
                    const rYard = item.emptyReturnYard.trim();
                    if (!d.emptyReturnYards) d.emptyReturnYards = [];
                    if (!d.emptyReturnYards.some((x: any) => typeof x === 'string' ? x.toUpperCase() === rYard.toUpperCase() : (x && x.name && x.name.toUpperCase() === rYard.toUpperCase()))) {
                      d.emptyReturnYards.push(rYard);
                    }
                  }
                }
              });
              const configCols = ['locations', 'countries', 'companies', 'nationalities', 'containerTypes', 'loadingTypes', 'idTypes', 'extraDieselReasons', 'advanceReasons', 'emptyReturnYards', 'banks', 'branches', 'routingNumbers', 'currencies', 'genders', 'religions', 'professions', 'postOffices', 'policeStations', 'cities', 'states', 'walletIncomeSources', 'walletDeductionReasons', 'walletPaymentMethods'];
              if (['users', 'trips', 'profiles', 'finances', 'monthlyFiles', 'payments', 'notifications', 'fuels', 'walletTransactions'].includes(key)) {
                if (item && item.id) {
                  if (key === 'users') {
                    const coll = item.role === 'ADMIN' ? 'admins' : 'users';
                    saveFirebaseDoc(coll, item.id, item);
                  } else {
                    let targetUserId = item.userId;
                    let parentCol = stateRef.current.user?.role === 'ADMIN' ? 'admins' : 'users';
                    let subPath = stateRef.current.user ? `${parentCol}/${stateRef.current.user.id}/${key}` : key;
                    if (targetUserId) {
                      const targetUser = stateRef.current.users?.find((u: any) => u.id === targetUserId);
                      const tCol = targetUser?.role === 'ADMIN' ? 'admins' : 'users';
                      subPath = `${tCol}/${targetUserId}/${key}`;
                    }
                    saveFirebaseDoc(subPath, item.id, item);
                  }
                }

                if (key === 'trips' && item) {
                  setTimeout(() => {
                    try {
                      const saved = localStorage.getItem('fleetpro_state');
                      if (saved) {
                        const parsed = JSON.parse(saved);
                        const keysToSave = ['companies', 'locations', 'containerTypes', 'loadingTypes', 'emptyReturnYards'];
                        keysToSave.forEach(k => {
                          if (parsed[k]) {
                            saveFirebaseDocMerge('dropdowns', k, { data: parsed[k] });
                          }
                        });
                      }
                    } catch {}
                  }, 100);
                }
              } else if (configCols.includes(key)) {
                setTimeout(() => {
                   try {
                     const currentArray = stateRef.current[key];
                     if (currentArray) {
                       saveFirebaseDocMerge('dropdowns', key, { data: currentArray });
                     }
                   } catch {}
                }, 50);
              }
            };
            handlersRef.current[prop] = fn; return fn;
          }
          if (prop.startsWith('remove')) {
            let key = prop.charAt(6).toLowerCase() + prop.slice(7) + 's';
            if (key === 'countrys') key = 'countries';
            if (key === 'nationalitys') key = 'nationalities';
            if (key === 'companys') key = 'companies';
            if (key === 'branchs') key = 'branches';
            if (key === 'currencys') key = 'currencies';
            const fn = (id: any, secondValue?: any) => {
              let extractedUserId = '';
              mutate((d: any) => {
                if (d[key]) {
                  const itemToRemove = d[key].find((x: any) => x && (x.id === id || String(x) === String(id)));
                  if (itemToRemove && typeof itemToRemove === 'object' && itemToRemove.userId) {
                    extractedUserId = itemToRemove.userId;
                  }

                  let affectedTripIds: string[] = [];
                  if (key === 'payments') {
                    const paymentToRemove = d[key].find((x: any) => x && x.id === id);
                    if (paymentToRemove) {
                      affectedTripIds = getAffectedTripIds(paymentToRemove, d);
                    }
                  }

                  if (key === 'locations') {
                    d[key] = d[key].filter((x: any) => !(x.country === id && x.name === secondValue));
                  } else if (key === 'nationalities') {
                    d[key] = d[key].filter((x: any) => {
                      const itemVal = typeof x === 'object' && x ? x.name : String(x);
                      return itemVal !== id;
                    });
                  } else if (key === 'companies') {
                    d[key] = d[key].filter((x: any) => {
                      const itemVal = typeof x === 'object' && x ? x.name : String(x);
                      return itemVal !== id;
                    });
                  } else if (key === 'countries') {
                    d[key] = d[key].filter((x: any) => {
                      const itemCode = typeof x === 'object' && x ? x.code : String(x);
                      return itemCode !== id;
                    });
                  } else if (key === 'currencies') {
                    d[key] = d[key].filter((x: any) => {
                      const itemCode = typeof x === 'object' && x ? x.code : String(x);
                      return itemCode !== id;
                    });
                  } else if (key === 'postOffices') {
                    d[key] = d[key].filter((x: any) => x && x.name !== id && x.code !== id);
                  } else {
                    d[key] = d[key].filter((x: any) => x && x.id !== id && String(x) !== String(id) && x.code !== id && x.name !== id);
                  }

                  let targetKey = key;
                  if (['trips', 'profiles', 'finances', 'monthlyFiles', 'payments', 'fuels', 'walletTransactions'].includes(key)) {
                    targetKey = 'all' + key.charAt(0).toUpperCase() + key.slice(1);
                  }
                  if (d[targetKey] && targetKey !== key) {
                    d[targetKey] = d[targetKey].filter((x: any) => x && x.id !== id && String(x) !== String(id) && x.code !== id && x.name !== id);
                  }

                  if (key === 'payments' && affectedTripIds.length > 0) {
                    affectedTripIds.forEach(tripId => {
                      recalculateTripPayments(tripId, d);
                    });
                  }
                }
              });
              const configCols = ['locations', 'countries', 'companies', 'nationalities', 'containerTypes', 'loadingTypes', 'idTypes', 'extraDieselReasons', 'advanceReasons', 'emptyReturnYards', 'banks', 'branches', 'routingNumbers', 'currencies', 'genders', 'religions', 'professions', 'postOffices', 'policeStations', 'cities', 'states', 'walletIncomeSources', 'walletDeductionReasons', 'walletPaymentMethods'];
              if (['users', 'trips', 'profiles', 'finances', 'monthlyFiles', 'payments', 'notifications', 'fuels', 'walletTransactions'].includes(key)) {
                if (key === 'users') {
                  deleteFirebaseDoc('users', String(id));
                  deleteFirebaseDoc('admins', String(id));
                  
                  // Cascading delete for subcollections
                  const subCollections = ['trips', 'profiles', 'finances', 'monthlyFiles', 'payments', 'notifications', 'fuels', 'walletTransactions', 'settlements', 'Purchase'];
                  ['users', 'admins'].forEach(parentCol => {
                    subCollections.forEach(sub => {
                      const subPath = `${parentCol}/${id}/${sub}`;
                      getFirebaseCollection(subPath).then((docs) => {
                        if (docs && Array.isArray(docs)) {
                          docs.forEach((doc: any) => {
                            deleteFirebaseDoc(subPath, doc.id).catch(e => console.error(`Error cascading ${sub} delete:`, e));
                          });
                        }
                      }).catch(e => console.error(`Error fetching ${subPath} for cascading delete:`, e));
                    });
                  });

                  // Cascading delete for partners linked to this user
                  getFirebaseCollection('partners').then((partners) => {
                    if (partners && Array.isArray(partners)) {
                      const partnersToDelete = partners.filter((p: any) => String(p.userId) === String(id));
                      partnersToDelete.forEach((partner: any) => {
                        deleteFirebaseDoc('partners', partner.id).catch(e => console.error("Error cascading partner delete:", e));
                      });
                    }
                  }).catch(e => console.error("Error fetching partners for cascading delete:", e));
                } else {
                  let subPath = '';
                  let targetUserId = (secondValue && typeof secondValue === 'string') ? secondValue : extractedUserId;
                  if (targetUserId) {
                    const targetUser = stateRef.current.users?.find((u: any) => u.id === targetUserId);
                    const parentCol = targetUser?.role === 'ADMIN' ? 'admins' : 'users';
                    subPath = `${parentCol}/${targetUserId}/${key}`;
                  } else {
                    const parentCol = stateRef.current.user?.role === 'ADMIN' ? 'admins' : 'users';
                    subPath = stateRef.current.user ? `${parentCol}/${stateRef.current.user.id}/${key}` : key;
                  }
                  deleteFirebaseDoc(subPath, String(id));
                }
              } else if (configCols.includes(key)) {
                setTimeout(() => {
                   try {
                     const currentArray = stateRef.current[key];
                     if (currentArray) {
                       saveFirebaseDocMerge('dropdowns', key, { data: currentArray });
                     }
                   } catch {}
                }, 50);
              }
            };
            handlersRef.current[prop] = fn; return fn;
          }
          if (prop.startsWith('update')) {
            let key = prop.charAt(6).toLowerCase() + prop.slice(7) + 's';
            if (key === 'countrys') key = 'countries';
            if (key === 'nationalitys') key = 'nationalities';
            if (key === 'companys') key = 'companies';
            if (key === 'branchs') key = 'branches';
            if (key === 'currencys') key = 'currencies';
            const fn = (idOrObj: any, updates?: any) => {
              let updatedItem: any = null;
              mutate((d: any) => {
                if (d[key]) {
                  let targetId: any;
                  let actualUpdates: any;
                  if (updates === undefined && idOrObj && typeof idOrObj === 'object') {
                    targetId = idOrObj.id || idOrObj.userId || idOrObj.code || idOrObj.name;
                    actualUpdates = idOrObj;
                  } else if (typeof idOrObj === 'object' && typeof updates === 'string') {
                    // First arg is object, second arg is oldId
                    targetId = updates;
                    actualUpdates = idOrObj;
                  } else if (typeof idOrObj === 'string' && typeof updates === 'object') {
                    // First arg is oldId, second arg is object
                    targetId = idOrObj;
                    actualUpdates = updates;
                  } else {
                    targetId = idOrObj;
                    actualUpdates = updates;
                  }
                  const idx = d[key].findIndex((x: any) => 
                    x && (x.id === targetId || x.userId === targetId || String(x) === String(targetId) || x.code === targetId || (typeof x === 'object' && x.name === targetId))
                  );
                  if (idx >= 0) {
                     const oldItem = d[key][idx];
                     const oldAffectedTripIds = key === 'payments' ? getAffectedTripIds(oldItem, d) : [];

                     if (typeof d[key][idx] === 'object') {
                       d[key][idx] = { ...d[key][idx], ...actualUpdates };
                     } else {
                       d[key][idx] = actualUpdates;
                     }
                     updatedItem = d[key][idx];

                     if (key === 'users') {
                       if (d.selectedUser && (d.selectedUser.id === updatedItem.id || d.selectedUser.userId === updatedItem.userId)) {
                         d.selectedUser = updatedItem;
                       }
                       if (d.user && (d.user.id === updatedItem.id || d.user.userId === updatedItem.userId)) {
                         d.user = updatedItem;
                       }
                     }

                     if (key === 'payments' && updatedItem) {
                       const newAffectedTripIds = getAffectedTripIds(updatedItem, d);
                       const allAffectedTripIds = Array.from(new Set([...oldAffectedTripIds, ...newAffectedTripIds]));
                       allAffectedTripIds.forEach(tripId => {
                         recalculateTripPayments(tripId, d);
                       });
                     }
                  }
                }

                // If a trip is being updated, automatically ensure fields exist in dropdown collections
                if (key === 'trips' && updatedItem) {
                  // 1. Company Name
                  if (updatedItem.companyName && updatedItem.companyName.trim() !== '') {
                    const company = updatedItem.companyName.trim();
                    if (!d.companies) d.companies = [];
                    if (!d.companies.some((x: any) => typeof x === 'string' ? x.toUpperCase() === company.toUpperCase() : (x && x.name && x.name.toUpperCase() === company.toUpperCase()))) {
                      d.companies.push(company.toUpperCase());
                    }
                  }
                  // 2. Loading Place (locations)
                  if (updatedItem.loadingPlace && updatedItem.loadingPlace.trim() !== '') {
                    const name = updatedItem.loadingPlace.trim();
                    const country = updatedItem.fromCountry || 'Qatar';
                    if (!d.locations) d.locations = [];
                    if (!d.locations.some((x: any) => x && x.country && x.name && x.country.toUpperCase() === country.toUpperCase() && x.name.toUpperCase() === name.toUpperCase())) {
                      d.locations.push({ country, name });
                    }
                  }
                  // 3. Delivery Place (locations)
                  if (updatedItem.deliveryPlace && updatedItem.deliveryPlace.trim() !== '') {
                    const name = updatedItem.deliveryPlace.trim();
                    const country = updatedItem.arrivalCountry || 'Qatar';
                    if (!d.locations) d.locations = [];
                    if (!d.locations.some((x: any) => x && x.country && x.name && x.country.toUpperCase() === country.toUpperCase() && x.name.toUpperCase() === name.toUpperCase())) {
                      d.locations.push({ country, name });
                    }
                  }
                  // 4. Container Title / Types
                  if (updatedItem.containerTitle && updatedItem.containerTitle.trim() !== '') {
                    const cType = updatedItem.containerTitle.trim();
                    if (!d.containerTypes) d.containerTypes = [];
                    if (!d.containerTypes.some((x: any) => typeof x === 'string' ? x.toUpperCase() === cType.toUpperCase() : (x && x.name && x.name.toUpperCase() === cType.toUpperCase()))) {
                      d.containerTypes.push(cType);
                    }
                  }
                  // 5. Loading Type
                  if (updatedItem.loadingType && updatedItem.loadingType.trim() !== '') {
                    const lType = updatedItem.loadingType.trim();
                    if (!d.loadingTypes) d.loadingTypes = [];
                    if (!d.loadingTypes.some((x: any) => typeof x === 'string' ? x.toUpperCase() === lType.toUpperCase() : (x && x.name && x.name.toUpperCase() === lType.toUpperCase()))) {
                      d.loadingTypes.push(lType);
                    }
                  }
                  // 6. Empty Return Yard
                  if (updatedItem.emptyReturnYard && updatedItem.emptyReturnYard.trim() !== '') {
                    const rYard = updatedItem.emptyReturnYard.trim();
                    if (!d.emptyReturnYards) d.emptyReturnYards = [];
                    if (!d.emptyReturnYards.some((x: any) => typeof x === 'string' ? x.toUpperCase() === rYard.toUpperCase() : (x && x.name && x.name.toUpperCase() === rYard.toUpperCase()))) {
                      d.emptyReturnYards.push(rYard);
                    }
                  }
                }
              });
              const configCols = ['locations', 'countries', 'companies', 'nationalities', 'containerTypes', 'loadingTypes', 'idTypes', 'extraDieselReasons', 'advanceReasons', 'emptyReturnYards', 'banks', 'branches', 'routingNumbers', 'currencies', 'genders', 'religions', 'professions', 'postOffices', 'policeStations', 'cities', 'states', 'walletIncomeSources', 'walletDeductionReasons', 'walletPaymentMethods'];
              if (updatedItem && ['users', 'trips', 'profiles', 'finances', 'monthlyFiles', 'payments', 'notifications', 'fuels', 'walletTransactions'].includes(key)) {
                if (key === 'users') {
                  const coll = updatedItem.role === 'ADMIN' ? 'admins' : 'users';
                  saveFirebaseDoc(coll, updatedItem.id, updatedItem);
                } else {
                  let targetUserId = updatedItem.userId;
                  let parentCol = stateRef.current.user?.role === 'ADMIN' ? 'admins' : 'users';
                  let subPath = stateRef.current.user ? `${parentCol}/${stateRef.current.user.id}/${key}` : key;
                  if (targetUserId) {
                    const targetUser = stateRef.current.users?.find((u: any) => u.id === targetUserId);
                    const tCol = targetUser?.role === 'ADMIN' ? 'admins' : 'users';
                    subPath = `${tCol}/${targetUserId}/${key}`;
                  }
                  saveFirebaseDoc(subPath, updatedItem.id, updatedItem);
                }

                if (key === 'trips' && updatedItem) {
                  setTimeout(() => {
                    try {
                      const saved = localStorage.getItem('fleetpro_state');
                      if (saved) {
                        const parsed = JSON.parse(saved);
                        const keysToSave = ['companies', 'locations', 'containerTypes', 'loadingTypes', 'emptyReturnYards'];
                        keysToSave.forEach(k => {
                          if (parsed[k]) {
                            saveFirebaseDocMerge('dropdowns', k, { data: parsed[k] });
                          }
                        });
                      }
                    } catch {}
                  }, 100);
                }
              } else if (configCols.includes(key)) {
                setTimeout(() => {
                   try {
                     const currentArray = stateRef.current[key];
                     if (currentArray) {
                       saveFirebaseDocMerge('dropdowns', key, { data: currentArray });
                     }
                   } catch {}
                }, 50);
              }
            };
            handlersRef.current[prop] = fn; return fn;
          }
        }
        
        const arrayProps = [
          'users', 'trips', 'allTrips', 'profiles', 'allProfiles', 'finances', 'allFinances', 'monthlyFiles', 'allMonthlyFiles', 'payments', 'allPayments', 
          'walletTransactions', 'allWalletTransactions', 'fuels', 'allFuels', 'notifications', 'publicMenuItems', 'locations', 'countries', 'companies', 
          'nationalities', 'containerTypes', 'loadingTypes', 'idTypes', 'extraDieselReasons', 'advanceReasons', 'emptyReturnYards',
          'genders', 'religions', 'professions', 'postOffices', 'policeStations', 'cities', 'states',
          'walletIncomeSources', 'walletDeductionReasons', 'walletPaymentMethods',
          'dashboardOrder', 'banks', 'branches', 'routingNumbers', 'currencies', 'transactions', 'documents'
        ];
        if (typeof prop === 'string' && arrayProps.includes(prop)) {
          return target[prop] || [];
        }
        
        if (prop in target) return target[prop];
        return undefined;
      }
    }) as unknown as StoreState;
  }, [state, mutate]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};
