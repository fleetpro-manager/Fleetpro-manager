
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from '../store';
import { TRANSLATIONS, APP_MODULES, DASHBOARD_ICONS } from '@/constants';
import { saveFirebaseDoc, subscribeFirebaseCollection, deleteFirebaseDoc } from '@/services/firebase';
import { 
  Plus, 
  Trash2, 
  Globe, 
  MapPin, 
  Building, 
  Landmark,
  Package, 
  Truck,
  Flag,
  CreditCard,
  ChevronDown,
  ChevronLeft,
  User,
  Edit2,
  AlertCircle,
  UserPlus,
  Settings,
  Folder,
  Clock,
  Search,
  LayoutDashboard,
  Home,
  Activity,
  BarChart2,
  DollarSign,
  ShoppingCart,
  Wallet,
  Hash
} from 'lucide-react';

import InputField from '@/components/InputField';
import FloatingInput from '@/components/FloatingInput';

const iconMap: Record<string, any> = {
  Home,
  LayoutDashboard,
  Activity,
  BarChart2
};

const ControlPanel: React.FC = () => {
  const { 
    language, setView, goBack,
    locations, addLocation, removeLocation, updateLocation,
    countries, addCountry, removeCountry, updateCountry,
    banks, addBank, removeBank, updateBank,
    branches, addBranch, removeBranch, updateBranch,
    routingNumbers, addRoutingNumber, removeRoutingNumber, updateRoutingNumber,
    companies, addCompany, removeCompany, updateCompany,
    nationalities, addNationality, removeNationality, updateNationality,
    containerTypes, addContainerType, removeContainerType, updateContainerType,
    loadingTypes, addLoadingType, removeLoadingType, updateLoadingType,
    idTypes, addIdType, removeIdType, updateIdType,
    extraDieselReasons, addExtraDieselReason, removeExtraDieselReason, updateExtraDieselReason,
    advanceReasons, addAdvanceReason, removeAdvanceReason, updateAdvanceReason,
    emptyReturnYards, addEmptyReturnYard, removeEmptyReturnYard, updateEmptyReturnYard,
    genders, addGender, removeGender, updateGender,
    religions, addReligion, removeReligion, updateReligion,
    professions, addProfession, removeProfession, updateProfession,
    policeStations, addPoliceStation, removePoliceStation, updatePoliceStation,
    cities, addCity, removeCity, updateCity,
    states, addState, removeState, updateState,
    postOffices, addPostOffice, removePostOffice, updatePostOffice,
    walletIncomeSources, addWalletIncomeSource, removeWalletIncomeSource, updateWalletIncomeSource,
    walletDeductionReasons, addWalletDeductionReason, removeWalletDeductionReason, updateWalletDeductionReason,
    walletPaymentMethods, addWalletPaymentMethod, removeWalletPaymentMethod, updateWalletPaymentMethod,
    showFeedback,
    publicMenuItems, setPublicMenuItems, setSelectedUser,
    activeSection: activeCategory, setActiveSection: setActiveCategory,
    activeDetailView: activeTab, setActiveDetailView: setActiveTab,
    dashboardIcon, setDashboardIcon,
    dashboardIconColor, setDashboardIconColor,
    setCustomBackAction,
    setCustomHeaderTitle
  } = useStore();
  
  const t = TRANSLATIONS[language];
  const [newItems, setNewItems] = useState([{ value: '', extra: '', extra2: '', extra3: '', extra4: '', extra5: '' }]);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);

  useEffect(() => {
    if (duplicateError) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [duplicateError]);
  const [selectedCountryForAddress, setSelectedCountryForAddress] = useState<string | null>(null);
  const [selectedCountryForBank, setSelectedCountryForBank] = useState<string | null>(null);
  const [selectedBankForBranch, setSelectedBankForBranch] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editValue, setEditValue] = useState('');
  const [editValueExtra, setEditValueExtra] = useState('');
  const [editValueExtra2, setEditValueExtra2] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [tempBranches, setTempBranches] = useState<any[]>([]);
  const [countrySearch, setCountrySearch] = useState('');
  const [openBankOptions, setOpenBankOptions] = useState<string | null>(null);
  const [newBranchName, setNewBranchName] = useState('');
  const [newRoutingNumber, setNewRoutingNumber] = useState('');
  const [showAddBankForm, setShowAddBankForm] = useState(false);
  const [newBankLogo, setNewBankLogo] = useState<string | null>(null);

  useEffect(() => {
    if (selectedBankForBranch) {
      setCustomBackAction(() => {
        setSelectedBankForBranch(null);
      });
    } else if (selectedCountryForBank) {
      setCustomBackAction(() => {
        setSelectedCountryForBank(null);
      });
    } else if (selectedCountryForAddress) {
      setCustomBackAction(() => {
        setSelectedCountryForAddress(null);
      });
    } else if (activeTab) {
      setCustomBackAction(() => {
        setActiveTab(null);
      });
    } else if (activeCategory) {
      setCustomBackAction(() => {
        setActiveCategory(null);
      });
    } else {
      setCustomBackAction(null);
    }

    return () => {
      setCustomBackAction(null);
    };
  }, [selectedBankForBranch, selectedCountryForBank, selectedCountryForAddress, activeTab, activeCategory, setCustomBackAction, setActiveTab, setActiveCategory]);
  const { removeUser, users } = useStore();
  const [globalItems, setGlobalItems] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribeItems = subscribeFirebaseCollection('items', (data) => setGlobalItems(data));
    return () => unsubscribeItems();
  }, []);

  const handleLogoUpload = (bankId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateBank(bankId, { logo: reader.result as string });
        showFeedback('Logo updated successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = () => {
    if (!activeTab) return;

    let duplicateItemName = '';
    const hasDuplicate = newItems.some(item => {
      const val = item.value.trim().toUpperCase();
      if (!val) return false;

      switch (activeTab) {
        case 'LOCATIONS':
          const isDupLoc = locations.some(l => 
            l.country === selectedCountryForAddress && 
            l.name.trim().toUpperCase() === val
          );
          if (isDupLoc) {
            duplicateItemName = item.value;
            return true;
          }
          break;
        case 'COUNTRIES':
          const isDupCountry = countries.some(c => 
            c.name.trim().toUpperCase() === val || 
            c.code.trim().toUpperCase() === val
          );
          if (isDupCountry) {
            duplicateItemName = item.value;
            return true;
          }
          break;
        case 'COMPANIES':
          const isDupComp = companies.some(c => c.trim().toUpperCase() === val);
          if (isDupComp) {
            duplicateItemName = item.value;
            return true;
          }
          break;
        case 'ITEMS':
          const isDupItem = globalItems.some(i => i.name.trim().toUpperCase() === val);
          if (isDupItem) {
            duplicateItemName = item.value;
            return true;
          }
          break;
        case 'NATIONALITIES':
          const isDupNat = nationalities.some(n => n.name.trim().toUpperCase() === val);
          if (isDupNat) {
            duplicateItemName = item.value;
            return true;
          }
          break;
        case 'CONTAINERS':
          const isDupCont = containerTypes.some(c => c.trim().toUpperCase() === val);
          if (isDupCont) {
            duplicateItemName = item.value;
            return true;
          }
          break;
        case 'LOADING':
          const isDupLoad = loadingTypes.some(l => l.trim().toUpperCase() === val);
          if (isDupLoad) {
            duplicateItemName = item.value;
            return true;
          }
          break;
        case 'ID_TYPES':
          const isDupId = idTypes.some(i => i.trim().toUpperCase() === val);
          if (isDupId) {
            duplicateItemName = item.value;
            return true;
          }
          break;
        case 'GENDERS':
          const isDupGen = genders.some(g => g.trim().toUpperCase() === val);
          if (isDupGen) {
            duplicateItemName = item.value;
            return true;
          }
          break;
        case 'RELIGIONS':
          const isDupRel = religions.some(r => r.trim().toUpperCase() === val);
          if (isDupRel) {
            duplicateItemName = item.value;
            return true;
          }
          break;
        case 'PROFESSIONS':
          const isDupProf = professions.some(p => p.trim().toUpperCase() === val);
          if (isDupProf) {
            duplicateItemName = item.value;
            return true;
          }
          break;
        case 'POLICE_STATIONS':
          const isDupPS = policeStations.some(ps => ps.country === selectedCountryForAddress && ps.name.trim().toUpperCase() === val);
          if (isDupPS) {
            duplicateItemName = item.value;
            return true;
          }
          break;
        case 'CITIES':
          const isDupCity = cities.some(c => c.country === selectedCountryForAddress && c.name.trim().toUpperCase() === val);
          if (isDupCity) {
            duplicateItemName = item.value;
            return true;
          }
          break;
        case 'STATES':
          const isDupState = states.some(s => s.country === selectedCountryForAddress && s.name.trim().toUpperCase() === val);
          if (isDupState) {
            duplicateItemName = item.value;
            return true;
          }
          break;
        case 'POST_OFFICES':
          const isDupPO = postOffices.some(po => (!po.country || po.country === selectedCountryForAddress) && po.name.trim().toUpperCase() === val);
          if (isDupPO) {
            duplicateItemName = item.value;
            return true;
          }
          break;
        case 'EXTRA_DIESEL':
          const isDupExD = extraDieselReasons.some(e => e.trim().toUpperCase() === val);
          if (isDupExD) {
            duplicateItemName = item.value;
            return true;
          }
          break;
        case 'ADVANCE_REASONS':
          const isDupAdv = advanceReasons.some(e => e.trim().toUpperCase() === val);
          if (isDupAdv) {
            duplicateItemName = item.value;
            return true;
          }
          break;
        case 'EMPTY_YARDS':
          const isDupEY = emptyReturnYards.some(e => e.trim().toUpperCase() === val);
          if (isDupEY) {
            duplicateItemName = item.value;
            return true;
          }
          break;
        case 'BANKS':
        case 'HIERARCHICAL_BANKS':
          const isDupBank = banks.some(b => b.name.trim().toUpperCase() === val);
          if (isDupBank) {
            duplicateItemName = item.value;
            return true;
          }
          break;
        case 'BRANCHES':
          const isDupBranch = branches.some(b => b.name.trim().toUpperCase() === val);
          if (isDupBranch) {
            duplicateItemName = item.value;
            return true;
          }
          break;
        case 'ROUTING_NUMBERS':
          const isDupRoute = routingNumbers.some(r => r.number.trim() === item.value.trim());
          if (isDupRoute) {
            duplicateItemName = item.value;
            return true;
          }
          break;
        case 'WALLET_INCOME_SOURCES':
          const isDupWIS = walletIncomeSources.some(w => w.trim().toUpperCase() === val);
          if (isDupWIS) {
            duplicateItemName = item.value;
            return true;
          }
          break;
        case 'WALLET_DEDUCTION_REASONS':
          const isDupWDR = walletDeductionReasons.some(w => w.trim().toUpperCase() === val);
          if (isDupWDR) {
            duplicateItemName = item.value;
            return true;
          }
          break;
        case 'WALLET_PAYMENT_METHODS':
          const isDupWPM = walletPaymentMethods.some(w => w.trim().toUpperCase() === val);
          if (isDupWPM) {
            duplicateItemName = item.value;
            return true;
          }
          break;
      }
      return false;
    });

    if (hasDuplicate) {
      setDuplicateError(duplicateItemName);
      return;
    }

    let addedCount = 0;

    newItems.forEach(item => {
      if (!item.value.trim()) return;

      switch (activeTab) {
        case 'LOCATIONS':
          addLocation({ country: selectedCountryForAddress!, name: item.value.toUpperCase() });
          addedCount++;
          break;
        case 'COUNTRIES':
          addCountry({ code: item.extra2.toUpperCase() || 'XX', name: item.value.toUpperCase(), flag: item.extra || '🏳️' });
          addedCount++;
          break;
        case 'COMPANIES':
          addCompany(item.value.toUpperCase());
          addedCount++;
          break;
        case 'ITEMS':
          const newItemId = Date.now().toString() + Math.random().toString(36).substring(7);
          saveFirebaseDoc('items', newItemId, { id: newItemId, name: item.value.toUpperCase() });
          addedCount++;
          break;
        case 'NATIONALITIES':
          addNationality({ name: item.value.toUpperCase(), flag: item.extra || '🏳️' });
          addedCount++;
          break;
        case 'CONTAINERS':
          addContainerType(item.value.toUpperCase());
          addedCount++;
          break;
        case 'LOADING':
          addLoadingType(item.value.toUpperCase());
          addedCount++;
          break;
        case 'ID_TYPES':
          addIdType(item.value.toUpperCase());
          addedCount++;
          break;
        case 'GENDERS':
          addGender(item.value.toUpperCase());
          addedCount++;
          break;
        case 'RELIGIONS':
          addReligion(item.value.toUpperCase());
          addedCount++;
          break;
        case 'PROFESSIONS':
          addProfession(item.value.toUpperCase());
          addedCount++;
          break;
        case 'POLICE_STATIONS':
          addPoliceStation({ country: selectedCountryForAddress!, name: item.value.toUpperCase() });
          addedCount++;
          break;
        case 'CITIES':
          addCity({ country: selectedCountryForAddress!, name: item.value.toUpperCase() });
          addedCount++;
          break;
        case 'STATES':
          addState({ country: selectedCountryForAddress!, name: item.value.toUpperCase() });
          addedCount++;
          break;
        case 'POST_OFFICES':
          addPostOffice({ country: selectedCountryForAddress!, name: item.value, code: item.extra });
          addedCount++;
          break;
        case 'EXTRA_DIESEL':
          addExtraDieselReason(item.value.toUpperCase());
          addedCount++;
          break;
        case 'ADVANCE_REASONS':
          addAdvanceReason(item.value.toUpperCase());
          addedCount++;
          break;
        case 'EMPTY_YARDS':
          addEmptyReturnYard(item.value.toUpperCase());
          addedCount++;
          break;
        case 'BANKS':
        case 'HIERARCHICAL_BANKS':
          addBank({ 
            id: item.extra || item.value.toUpperCase().replace(/\s+/g, '_'), 
            name: item.value.toUpperCase(), 
            countryCode: selectedCountryForBank || undefined 
          });
          addedCount++;
          break;
        case 'BRANCHES':
          addBranch({ 
            id: item.extra || item.value.toUpperCase().replace(/\s+/g, '_'), 
            name: item.value.toUpperCase(),
            routingNumber: item.extra2
          });
          addedCount++;
          break;
        case 'ROUTING_NUMBERS':
          addRoutingNumber({ id: item.extra || item.value.toUpperCase().replace(/\s+/g, '_'), number: item.value });
          addedCount++;
          break;
        case 'WALLET_INCOME_SOURCES':
          addWalletIncomeSource(item.value);
          addedCount++;
          break;
        case 'WALLET_DEDUCTION_REASONS':
          addWalletDeductionReason(item.value);
          addedCount++;
          break;
        case 'WALLET_PAYMENT_METHODS':
          addWalletPaymentMethod(item.value);
          addedCount++;
          break;
      }
    });

    if (addedCount > 0) {
      showFeedback(`Successfully added ${addedCount} item(s)!`);
      setNewItems([{ value: '', extra: '', extra2: '' }]);
    }
  };

  const AUTOF_COUNTRIES = [
    { names: ['saudi arabia', 'saudi', 'ksa', 'সৌদি আরব', 'সৌদি', 'কেএসএ', 'saudiarabia'], code: '+966', flag: '🇸🇦' },
    { names: ['bangladesh', 'bd', 'বাংলাদেশ', 'বিডি', 'বাংলা'], code: '+880', flag: '🇧🇩' },
    { names: ['qatar', 'qat', 'qa', 'কাতার', 'কাতার দেশ'], code: '+974', flag: '🇶🇦' },
    { names: ['united arab emirates', 'uae', 'dubai', 'abu dhabi', 'sharjah', 'ইউএই', 'দুবাই', 'সংযুক্ত আরব আমিরাত', 'সংযুক্ত আরব'], code: '+971', flag: '🇦🇪' },
    { names: ['kuwait', 'কুয়েত', 'কুয়েত'], code: '+965', flag: '🇰🇼' },
    { names: ['oman', 'ওমান', 'কমন', 'মাস্কাট'], code: '+968', flag: '🇴🇲' },
    { names: ['bahrain', 'বাহরাইন'], code: '+973', flag: '🇧🇭' },
    { names: ['egypt', 'মিসর', 'মিশর'], code: '+20', flag: '🇪🇬' },
    { names: ['india', 'भारत', 'ইন্ডিয়া', 'ইন্ডিয়া', 'ভারত'], code: '+91', flag: '🇮🇳' },
    { names: ['pakistan', 'পাকিস্তান', 'পাক'], code: '+92', flag: '🇵🇰' },
    { names: ['nepal', 'নেপাল'], code: '+977', flag: '🇳🇵' },
    { names: ['sri lanka', 'lanka', 'শ্রীলঙ্কা', 'শ্রীলংকা'], code: '+94', flag: '🇱🇰' },
    { names: ['yemen', 'ইয়েমেন', 'ইয়েমেন'], code: '+967', flag: '🇾🇪' },
    { names: ['jordan', 'জর্ডান', 'জردন'], code: '+962', flag: '🇯🇴' },
    { names: ['lebanon', 'লেবানন'], code: '+961', flag: '🇱🇧' },
    { names: ['syria', 'সিরিয়া', 'সিরিয়া'], code: '+963', flag: '🇸🇾' },
    { names: ['iraq', 'ইরাক'], code: '+964', flag: '🇮🇶' },
    { names: ['iran', 'ইরান'], code: '+98', flag: '🇮🇷' },
    { names: ['turkey', 'turkiye', 'তুরস্ক'], code: '+90', flag: '🇹🇷' },
    { names: ['united states', 'usa', 'us', 'america', 'আমেরিকা', 'যুক্তরাষ্ট্র', 'ইউএসএ', 'আমেরিকার যুক্তরাষ্ট্র'], code: '+1', flag: '🇺🇸' },
    { names: ['united kingdom', 'uk', 'gb', 'england', 'britain', 'যুক্তরাজ্য', 'লন্ডন', 'ইউকে', 'ইংল্যান্ড'], code: '+44', flag: '🇬🇧' },
    { names: ['canada', 'কানাডা'], code: '+1', flag: '🇨🇦' },
    { names: ['australia', 'অস্ট্রেলিয়া', 'অস্ট্রেলিয়া'], code: '+61', flag: '🇦🇺' },
    { names: ['singapore', 'সিঙ্গাপুর'], code: '+65', flag: '🇸🇬' },
    { names: ['malaysia', 'মালয়েশিয়া', 'মালয়েশিয়া'], code: '+60', flag: '🇲🇾' },
    { names: ['germany', 'জার্মানি', 'জার্মানী', 'জার্মান'], code: '+49', flag: '🇩🇪' },
    { names: ['france', 'ফ্রান্স', 'ফরাসি'], code: 'FR', flag: '🇫🇷' },
    { names: ['italy', 'ইতালি', 'ইতালী'], code: 'IT', flag: '🇮🇹' },
    { names: ['japan', 'জাপান'], code: 'JP', flag: '🇯🇵' },
    { names: ['china', 'চীন', 'চীন দেশ'], code: 'CN', flag: '🇨🇳' },
    { names: ['maldives', 'মালদ্বীপ', 'মালদ্বিপ'], code: 'MV', flag: '🇲🇻' },
    { names: ['bhutan', 'ভুটান'], code: 'BT', flag: '🇧🇹' },
    { names: ['myanmar', 'বার্মা', 'মিয়ানমার'], code: 'MM', flag: '🇲🇲' },
    { names: ['indonesia', 'ইন্দোনেশিয়া', 'ইন্দোনেশিয়া'], code: 'ID', flag: '🇮🇩' },
    { names: ['philippines', 'ফিলিপাইন'], code: 'PH', flag: '🇵🇭' },
    { names: ['thailand', 'থাইল্যান্ড', 'থাইল্যান্ড দেশ'], code: 'TH', flag: '🇹🇭' },
    { names: ['vietnam', 'ভয়তনাম', 'ভিয়েতনাম', 'ভিয়েতনাম'], code: 'VN', flag: '🇻🇳' },
    { names: ['russia', 'রাশিয়া', 'রাশিয়া'], code: 'RU', flag: '🇷🇺' },
    { names: ['south africa', 'দক্ষিণ আফ্রিকা'], code: 'ZA', flag: '🇿🇦' },
    { names: ['brazil', 'ব্রাজিল'], code: 'BR', flag: '🇧🇷' },
    { names: ['argentina', 'আর্জেন্টিনা'], code: 'AR', flag: '🇦🇷' },
    { names: ['spain', 'স্পেন'], code: 'ES', flag: '🇪🇸' },
    { names: ['portugal', 'পর্তুগাল'], code: 'PT', flag: '🇵🇹' },
    { names: ['switzerland', 'সুইজারল্যান্ড', 'সুইজারল্যান্ড দেশ'], code: 'CH', flag: '🇨🇭' },
    { names: ['sweden', 'সুইডেন'], code: 'SE', flag: '🇸🇪' },
    { names: ['norway', 'নরওয়ে', 'নরওয়ে'], code: 'NO', flag: '🇳🇴' },
    { names: ['netherlands', 'নেদারল্যান্ডস', 'হল্যান্ড'], code: 'NL', flag: '🇳🇱' },
    { names: ['new zealand', 'নিউজিল্যান্ড', 'নিউজিল্যান্ড দেশ'], code: 'NZ', flag: '🇳🇿' },
  ];

  const lookupCountryDetails = (inputText: string) => {
    const cleanInput = inputText.trim().toLowerCase();
    if (!cleanInput) return null;

    // First try exact match
    let matched = AUTOF_COUNTRIES.find(c => 
      c.names.some(name => name.toLowerCase() === cleanInput)
    );

    // If not found, try starting-with match if input length >= 2
    if (!matched && cleanInput.length >= 2) {
      matched = AUTOF_COUNTRIES.find(c => 
        c.names.some(name => name.toLowerCase().startsWith(cleanInput))
      );
    }

    // If still not found, try containing match if input length >= 3
    if (!matched && cleanInput.length >= 3) {
      matched = AUTOF_COUNTRIES.find(c => 
        c.names.some(name => name.toLowerCase().includes(cleanInput))
      );
    }

    return matched || null;
  };

  const handleNewItemChange = (index: number, field: 'value' | 'extra' | 'extra2' | 'extra3' | 'extra4' | 'extra5', val: string) => {
    const updated = [...newItems];
    const upperVal = val.toUpperCase();

    if (activeTab === 'COUNTRIES') {
      if (field === 'value') {
        updated[index]['value'] = upperVal;
        const match = lookupCountryDetails(val);
        if (match) {
          updated[index]['extra2'] = match.code;
          updated[index]['extra'] = match.flag;
        } else if (!val.trim()) {
          updated[index]['extra2'] = '';
          updated[index]['extra'] = '';
        }
      } else if (field === 'extra2') {
        const match = lookupCountryDetails(val);
        if (match) {
          updated[index]['extra2'] = match.code;
          if (!updated[index]['value']) {
            updated[index]['value'] = match.names[0].toUpperCase();
          }
          if (!updated[index]['extra']) {
            updated[index]['extra'] = match.flag;
          }
        } else {
          updated[index]['extra2'] = upperVal;
        }
      } else if (field === 'extra') {
        const match = lookupCountryDetails(val);
        if (match) {
          updated[index]['extra'] = match.flag;
          if (!updated[index]['value']) {
            updated[index]['value'] = match.names[0].toUpperCase();
          }
          if (!updated[index]['extra2']) {
            updated[index]['extra2'] = match.code;
          }
        } else {
          updated[index]['extra'] = upperVal;
        }
      }
    } else {
      updated[index][field] = upperVal;
    }

    setNewItems(updated);
  };

  const addNewItemRow = () => {
    if (newItems.length < 20) {
      setNewItems([...newItems, { value: '', extra: '', extra2: '', extra3: '', extra4: '', extra5: '' }]);
    }
  };

  const removeNewItemRow = (index: number) => {
    setNewItems(newItems.filter((_, i) => i !== index));
  };

  const toggleMenuVisibility = (id: string) => {
    if (publicMenuItems.includes(id)) {
      setPublicMenuItems(publicMenuItems.filter(item => item !== id));
    } else {
      setPublicMenuItems([...publicMenuItems, id]);
    }
  };

  const handleUpdate = () => {
    if (!editValue.trim() || !activeTab || !editingItem) return;

    const val = editValue.trim().toUpperCase();
    let isDup = false;
    let originalName = typeof editingItem === 'string' ? editingItem : (editingItem.name || editingItem.number || '');
    
    if (val !== originalName.trim().toUpperCase()) {
      switch (activeTab) {
        case 'LOCATIONS':
          isDup = locations.some(l => 
            l.country === selectedCountryForAddress && 
            l.name.trim().toUpperCase() === val
          );
          break;
        case 'COUNTRIES':
          isDup = countries.some(c => 
            c.name.trim().toUpperCase() === val || 
            c.code.trim().toUpperCase() === val
          );
          break;
        case 'COMPANIES':
          isDup = companies.some(c => c.trim().toUpperCase() === val);
          break;
        case 'ITEMS':
          isDup = globalItems.some(i => i.name.trim().toUpperCase() === val);
          break;
        case 'NATIONALITIES':
          isDup = nationalities.some(n => n.name.trim().toUpperCase() === val);
          break;
        case 'CONTAINERS':
          isDup = containerTypes.some(c => c.trim().toUpperCase() === val);
          break;
        case 'LOADING':
          isDup = loadingTypes.some(l => l.trim().toUpperCase() === val);
          break;
        case 'ID_TYPES':
          isDup = idTypes.some(i => i.trim().toUpperCase() === val);
          break;
        case 'GENDERS':
          isDup = genders.some(g => g.trim().toUpperCase() === val);
          break;
        case 'RELIGIONS':
          isDup = religions.some(r => r.trim().toUpperCase() === val);
          break;
        case 'PROFESSIONS':
          isDup = professions.some(p => p.trim().toUpperCase() === val);
          break;
        case 'POLICE_STATIONS':
          isDup = policeStations.some(ps => ps.country === (editingItem.country || selectedCountryForAddress) && ps.name.trim().toUpperCase() === val);
          break;
        case 'CITIES':
          isDup = cities.some(c => c.country === (editingItem.country || selectedCountryForAddress) && c.name.trim().toUpperCase() === val);
          break;
        case 'STATES':
          isDup = states.some(s => s.country === (editingItem.country || selectedCountryForAddress) && s.name.trim().toUpperCase() === val);
          break;
        case 'POST_OFFICES':
          isDup = postOffices.some(po => (!po.country || po.country === (editingItem.country || selectedCountryForAddress)) && po.name.trim().toUpperCase() === val);
          break;
        case 'EXTRA_DIESEL':
          isDup = extraDieselReasons.some(e => e.trim().toUpperCase() === val);
          break;
        case 'ADVANCE_REASONS':
          isDup = advanceReasons.some(e => e.trim().toUpperCase() === val);
          break;
        case 'EMPTY_YARDS':
          isDup = emptyReturnYards.some(e => e.trim().toUpperCase() === val);
          break;
        case 'BANKS':
        case 'HIERARCHICAL_BANKS':
          isDup = banks.some(b => b.name.trim().toUpperCase() === val);
          break;
        case 'BRANCHES':
          isDup = branches.some(b => b.name.trim().toUpperCase() === val);
          break;
        case 'ROUTING_NUMBERS':
          isDup = routingNumbers.some(r => r.number.trim() === val);
          break;
        case 'WALLET_INCOME_SOURCES':
          isDup = walletIncomeSources.some(w => w.trim().toUpperCase() === val);
          break;
        case 'WALLET_DEDUCTION_REASONS':
          isDup = walletDeductionReasons.some(w => w.trim().toUpperCase() === val);
          break;
        case 'WALLET_PAYMENT_METHODS':
          isDup = walletPaymentMethods.some(w => w.trim().toUpperCase() === val);
          break;
      }
    }

    if (isDup) {
      setDuplicateError(editValue);
      return;
    }

    switch (activeTab) {
      case 'LOCATIONS':
        updateLocation(selectedCountryForAddress!, editingItem.name, editValue.toUpperCase());
        break;
      case 'COUNTRIES':
        updateCountry(editingItem.code, { code: editValueExtra2.toUpperCase() || editingItem.code, name: editValue.toUpperCase(), flag: editValueExtra || editingItem.flag });
        break;
      case 'COMPANIES':
        updateCompany(editingItem, editValue.toUpperCase());
        break;
      case 'ITEMS':
        saveFirebaseDoc('items', editingItem.id, { ...editingItem, name: editValue.toUpperCase() });
        break;
      case 'NATIONALITIES':
        updateNationality(editingItem.name, { name: editValue.toUpperCase(), flag: editValueExtra || editingItem.flag });
        break;
      case 'CONTAINERS':
        updateContainerType(editingItem, editValue.toUpperCase());
        break;
      case 'LOADING':
        updateLoadingType(editingItem, editValue.toUpperCase());
        break;
      case 'ID_TYPES':
        updateIdType(editingItem, editValue.toUpperCase());
        break;
      case 'GENDERS':
        updateGender(editingItem, editValue.toUpperCase());
        break;
      case 'RELIGIONS':
        updateReligion(editingItem, editValue.toUpperCase());
        break;
      case 'PROFESSIONS':
        updateProfession(editingItem, editValue.toUpperCase());
        break;
      case 'POLICE_STATIONS':
        updatePoliceStation(editingItem.country || selectedCountryForAddress!, editingItem.name, editValue.toUpperCase());
        break;
      case 'CITIES':
        updateCity(editingItem.country || selectedCountryForAddress!, editingItem.name, editValue.toUpperCase());
        break;
      case 'STATES':
        updateState(editingItem.country || selectedCountryForAddress!, editingItem.name, editValue.toUpperCase());
        break;
      case 'POST_OFFICES':
        updatePostOffice(editingItem.country || selectedCountryForAddress!, editingItem.name, { country: editingItem.country || selectedCountryForAddress!, name: editValue, code: editValueExtra2 });
        break;
      case 'EXTRA_DIESEL':
        updateExtraDieselReason(editingItem, editValue.toUpperCase());
        break;
      case 'ADVANCE_REASONS':
        updateAdvanceReason(editingItem, editValue.toUpperCase());
        break;
      case 'EMPTY_YARDS':
        updateEmptyReturnYard(editingItem, editValue.toUpperCase());
        break;
      case 'BANKS':
        updateBank(editingItem.id, { name: editValue.toUpperCase() });
        break;
      case 'BRANCHES':
        updateBranch(editingItem.id, { name: editValue.toUpperCase(), routingNumber: editValueExtra2 });
        break;
      case 'ROUTING_NUMBERS':
        updateRoutingNumber(editingItem.id, editValue.toUpperCase());
        break;
      case 'WALLET_INCOME_SOURCES':
        updateWalletIncomeSource(editingItem, editValue.toUpperCase());
        break;
      case 'WALLET_DEDUCTION_REASONS':
        updateWalletDeductionReason(editingItem, editValue.toUpperCase());
        break;
      case 'WALLET_PAYMENT_METHODS':
        updateWalletPaymentMethod(editingItem, editValue.toUpperCase());
        break;
    }
    showFeedback(`${activeTab} updated successfully!`);
    setEditingItem(null);
    setEditValue('');
    setEditValueExtra('');
    setEditValueExtra2('');
  };

  const startEdit = (item: any) => {
    setEditingItem(item);
    if (typeof item === 'string') {
      setEditValue(item);
    } else {
      setEditValue(item.name || item.number || '');
      setEditValueExtra(item.flag || '');
      setEditValueExtra2(item.code || item.routingNumber || '');
    }
  };

  const CATEGORIES = [
    {
      id: 'ACCOUNT',
      label: 'ACCOUNT FORM',
      icon: <UserPlus size={20} className="text-cyan-500" />,
      lists: ['GENDERS', 'RELIGIONS', 'NATIONALITIES', 'COUNTRIES', 'ID_TYPES', 'PROFESSIONS', 'POST_OFFICES', 'POLICE_STATIONS', 'CITIES', 'STATES']
    },
    {
      id: 'WALLET',
      label: 'WALLET SETTINGS',
      icon: <Wallet size={20} className="text-cyan-500" />,
      lists: ['WALLET_INCOME_SOURCES', 'WALLET_DEDUCTION_REASONS', 'WALLET_PAYMENT_METHODS']
    },
    {
      id: 'NEW_TRIP',
      label: 'NEW TRIP FORM',
      icon: <Truck size={20} className="text-cyan-500" />,
      lists: ['COUNTRIES', 'LOCATIONS', 'COMPANIES', 'LOADING', 'CONTAINERS', 'EXTRA_DIESEL', 'EMPTY_YARDS']
    },
    {
      id: 'SYSTEM',
      label: 'SYSTEM SETTINGS',
      icon: <Settings size={20} className="text-cyan-500" />,
      lists: ['MENU_VISIBILITY', 'USERS', 'PRAYER_SETTINGS', 'DASHBOARD_ICON']
    },
    {
      id: 'PAYMENT',
      label: 'PAYMENT SETTINGS',
      icon: <CreditCard size={20} className="text-cyan-500" />,
      lists: ['HIERARCHICAL_BANKS', 'ADVANCE_REASONS']
    },
    {
      id: 'PURCHASE',
      label: 'PURCHASE FORM',
      icon: <ShoppingCart size={20} className="text-cyan-500" />,
      lists: ['ITEMS']
    },
    {
      id: 'ADD_MONEY',
      label: 'ADD MONEY FORM',
      icon: <DollarSign size={20} className="text-cyan-500" />,
      lists: ['COMPANIES']
    }
  ];

  const tabs = [
    { id: 'LOCATIONS', label: 'LOCATIONS', icon: <MapPin size={18} /> },
    { id: 'COUNTRIES', label: 'COUNTRIES', icon: <Globe size={18} /> },
    { id: 'COMPANIES', label: 'COMPANIES', icon: <Building size={18} /> },
    { id: 'NATIONALITIES', label: 'NATIONALITIES', icon: <Flag size={18} /> },
    { id: 'CONTAINERS', label: 'CONTAINERS', icon: <Package size={18} /> },
    { id: 'LOADING', label: 'LOADING TYPES', icon: <Truck size={18} /> },
    { id: 'ID_TYPES', label: 'ID TYPES', icon: <CreditCard size={18} /> },
    { id: 'GENDERS', label: 'GENDERS', icon: <User size={18} /> },
    { id: 'RELIGIONS', label: 'RELIGIONS', icon: <Globe size={18} /> },
    { id: 'PROFESSIONS', label: 'PROFESSIONS', icon: <User size={18} /> },
    { id: 'POST_OFFICES', label: 'POST OFFICES', icon: <MapPin size={18} /> },
    { id: 'POLICE_STATIONS', label: 'POLICE STATIONS', icon: <MapPin size={18} /> },
    { id: 'CITIES', label: 'CITIES', icon: <MapPin size={18} /> },
    { id: 'STATES', label: 'STATES', icon: <MapPin size={18} /> },
    { id: 'EXTRA_DIESEL', label: 'EXTRA DIESEL REASONS', icon: <AlertCircle size={18} /> },
    { id: 'ADVANCE_REASONS', label: 'ADVANCE REASONS', icon: <AlertCircle size={18} /> },
    { id: 'EMPTY_YARDS', label: 'EMPTY RETURN YARDS', icon: <MapPin size={18} /> },
    { id: 'ITEMS', label: 'PURCHASE ITEMS', icon: <Package size={18} /> },
    { id: 'MENU_VISIBILITY', label: 'MENU VISIBILITY', icon: <Plus size={18} /> },
    { id: 'USERS', label: 'USERS', icon: <User size={18} /> },
    { id: 'PRAYER_SETTINGS', label: 'PRAYER SETTINGS', icon: <Clock size={18} /> },
    { id: 'DASHBOARD_ICON', label: 'DASHBOARD ICON', icon: <LayoutDashboard size={18} /> },
    { id: 'BANKS', label: 'BANKS', icon: <Landmark size={18} /> },
    { id: 'BRANCHES', label: 'BRANCHES', icon: <MapPin size={18} /> },
    { id: 'ROUTING_NUMBERS', label: 'ROUTING NUMBERS', icon: <CreditCard size={18} /> },
    { id: 'HIERARCHICAL_BANKS', label: 'ADD BANK', icon: <Landmark size={18} /> },
    { id: 'WALLET_INCOME_SOURCES', label: 'WALLET INCOME SOURCES', icon: <DollarSign size={18} /> },
    { id: 'WALLET_DEDUCTION_REASONS', label: 'WALLET DEDUCTION REASONS', icon: <DollarSign size={18} /> },
    { id: 'WALLET_PAYMENT_METHODS', label: 'WALLET PAYMENT METHODS', icon: <CreditCard size={18} /> },
  ];



  const currentTab = tabs.find(t => t.id === activeTab);
  const currentCategory = CATEGORIES.find(c => c.id === activeCategory);
  const { prayerTimeOffsets, setPrayerTimeOffset } = useStore();
  const [prayerTimes, setPrayerTimes] = useState<any>(null);
  const [loadingTimes, setLoadingTimes] = useState(false);

  React.useEffect(() => {
    if (activeTab === 'PRAYER_SETTINGS') {
      setLoadingTimes(true);
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          const res = await fetch(`https://api.aladhan.com/v1/timings/${Math.floor(Date.now() / 1000)}?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&method=2`);
          const data = await res.json();
          if (data.code === 200) setPrayerTimes(data.data.timings);
        } catch (e) {
          console.error(e);
        } finally {
          setLoadingTimes(false);
        }
      }, () => setLoadingTimes(false));
    }
  }, [activeTab]);

  const formatTimeWithOffset = (time24: string, prayerId: string) => {
    if (!time24) return '--:--';
    const offset = prayerTimeOffsets[prayerId] || 0;
    const [hours, minutes] = time24.split(':');
    const date = new Date();
    date.setHours(parseInt(hours));
    date.setMinutes(parseInt(minutes) + offset);
    let h = date.getHours();
    const m = date.getMinutes().toString().padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12;
    return `${h}:${m} ${ampm}`;
  };


  useEffect(() => {
    let title: string | null = null;
    if (selectedBankForBranch) {
      title = `${selectedBankForBranch} BRANCHES`;
    } else if (selectedCountryForBank) {
      title = `${selectedCountryForBank} BANKS`;
    } else if (selectedCountryForAddress) {
      title = `${selectedCountryForAddress} REGIONS`;
    } else if (activeTab && currentTab) {
      title = currentTab.label;
    } else if (activeCategory && currentCategory) {
      title = currentCategory.label;
    }
    
    setCustomHeaderTitle(title);
    return () => {
      setCustomHeaderTitle(null);
    };
  }, [selectedBankForBranch, selectedCountryForBank, selectedCountryForAddress, activeTab, currentTab, activeCategory, currentCategory, setCustomHeaderTitle]);


  return (
    <div className="pb-[60px] px-0.5 w-full mx-auto">

      {!activeCategory && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATEGORIES.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className="bg-theme-card px-4 h-16 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-4 text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center">
                {category.icon}
              </div>
              <div>
                <h3 className="font-black text-sm text-text-main uppercase tracking-wide">{category.label}</h3>
                <p className="text-[10px] font-bold text-text-muted mt-0.5">{category.lists.length} Dropdown Lists</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {activeCategory && !activeTab && currentCategory && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {currentCategory.lists.map(listId => {
            const tab = tabs.find(t => t.id === listId);
            if (!tab) return null;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
              className="bg-theme-card p-3 min-h-[56px] rounded-lg shadow-sm hover:shadow-md transition-all flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-white/5 flex items-center justify-center text-text-main group-hover:text-cyan-500 group-hover:bg-cyan-50 transition-colors">
                    {tab.icon}
                  </div>
                  <span className="font-bold text-sm text-text-main uppercase tracking-wide">{tab.label}</span>
                </div>
                <ChevronDown size={18} className="text-text-muted -rotate-90" />
              </button>
            );
          })}
        </div>
      )}

      {activeTab && (
        <>
          {activeTab === 'DASHBOARD_ICON' ? (
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Select Dashboard Icon</h3>
              <div className="bg-theme-card p-4 rounded-lg shadow-sm space-y-4">
                <div className="flex items-center gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Upload Icon</label>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setDashboardIcon(reader.result as string);
                            showFeedback('Icon updated successfully!');
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="block w-full text-[10px] text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-black transition-all"
                      style={{ '--file-bg': 'var(--primary)' } as any}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Icon Color</label>
                    <input 
                      type="color" 
                      value={dashboardIconColor}
                      onChange={(e) => setDashboardIconColor(e.target.value)}
                      className="block w-16 h-10 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...DASHBOARD_ICONS, ...(dashboardIcon && typeof dashboardIcon === 'string' && dashboardIcon.startsWith('data:image/') ? [{ id: dashboardIcon, label: 'Custom' }] : [])].map((icon) => {
                  const isCustom = icon.id.startsWith('data:image/');
                  const IconComponent = isCustom ? null : iconMap[icon.id];
                  return (
                    <button
                      key={icon.id}
                      onClick={() => setDashboardIcon(icon.id)}
                      className={`p-4 rounded-lg flex flex-col items-center gap-2 transition-all ${
                        dashboardIcon === icon.id
                          ? 'bg-cyan-50 shadow-sm'
                          : 'bg-theme-card hover:border-cyan-500'
                      }`}
                    >
                      {isCustom ? (
                        <div 
                          className="w-6 h-6"
                          style={{ 
                            maskImage: `url(${icon.id})`, 
                            maskSize: 'contain', 
                            maskRepeat: 'no-repeat',
                            backgroundColor: dashboardIconColor 
                          }} 
                        />
                      ) : (
                        IconComponent && <IconComponent size={24} style={{ color: dashboardIconColor }} />
                      )}
                      <span className={`text-xs font-bold ${dashboardIcon === icon.id ? 'text-cyan-600' : 'text-text-main'}`}>
                        {icon.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : activeTab === 'PRAYER_SETTINGS' ? (
            <div className="space-y-4">
              <div className="bg-theme-card p-4 rounded-lg shadow-sm">
                <h3 className="text-xs font-black text-text-main uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Clock size={16} className="text-cyan-500" />
                  Adjust Adhan Times (Minutes)
                </h3>
                <div className="space-y-4">
                  {['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((prayer) => (
                    <div key={prayer} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-text-main uppercase tracking-wide">{prayer}</span>
                        <span className="text-[10px] font-black text-cyan-600">
                          {loadingTimes ? '...' : prayerTimes ? formatTimeWithOffset(prayerTimes[prayer], prayer) : '--:--'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => setPrayerTimeOffset(prayer, (prayerTimeOffsets[prayer] || 0) - 1)}
                          className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold hover:bg-red-200 transition-colors"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-black text-sm text-cyan-600">
                          {prayerTimeOffsets[prayer] > 0 ? `+${prayerTimeOffsets[prayer]}` : prayerTimeOffsets[prayer]}
                        </span>
                        <button 
                          onClick={() => setPrayerTimeOffset(prayer, (prayerTimeOffsets[prayer] || 0) + 1)}
                          className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold hover:bg-green-200 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-[10px] text-gray-400 italic">
                  * These offsets will be added to the automatically fetched Adhan times.
                </p>
              </div>
            </div>
          ) : activeTab === 'HIERARCHICAL_BANKS' ? (
            <div className="space-y-6">
              {!selectedCountryForBank ? (
                <div className="space-y-4">
                  {/* Country Search */}
                  <div>
                    <FloatingInput
                      id="countrySearchBank"
                      label="Search country..."
                      value={countrySearch}
                      onChange={setCountrySearch}
                      icon={<Search size={18} />}
                    />
                  </div>

                  <div className="space-y-2">
                    {countries
                      .filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase()))
                      .map((country, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedCountryForBank(country.code)}
                        className="w-full bg-theme-card p-3 h-14 rounded-lg flex items-center justify-between shadow-sm hover:border-cyan-500 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{country.flag}</span>
                          <span className="font-bold text-xs text-text-main uppercase tracking-wide">{country.name}</span>
                        </div>
                        <ChevronDown size={18} className="text-gray-400 -rotate-90" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                      Banks in {countries.find(c => c.code === selectedCountryForBank)?.name}
                    </h3>
                    <button onClick={() => setSelectedCountryForBank(null)} className="text-[10px] font-bold text-cyan-500 uppercase">Change Country</button>
                  </div>

                  {/* Add New Bank - Only show if no bank is selected/expanded */}
                  {!selectedBankForBranch && (
                    <div className="space-y-4">
                      <button
                        onClick={() => setShowAddBankForm(!showAddBankForm)}
                        className="w-full h-14 bg-theme-card rounded-lg shadow-sm flex items-center justify-center gap-2 text-cyan-500 font-black text-sm uppercase tracking-wide"
                      >
                        <Plus size={18} /> Add Bank
                      </button>
                      {showAddBankForm && (
                        <div className="bg-theme-card p-4 rounded-lg shadow-sm space-y-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Bank Logo</label>
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    setNewBankLogo(reader.result as string);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="block w-full text-[10px] text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-cyan-500 file:text-white hover:file:bg-cyan-600 transition-all"
                            />
                          </div>
                          <InputField 
                            label="Bank Name"
                            name="newBank"
                            value={newItems[0].value}
                            onChange={(e) => handleNewItemChange(0, 'value', e.target.value)}
                            icon={<Landmark size={16} className="text-gray-400" />}
                          />
                          <InputField 
                            label="Branch Name"
                            name="newBranch"
                            value={newItems[0].extra}
                            onChange={(e) => handleNewItemChange(0, 'extra', e.target.value)}
                            icon={<MapPin size={16} className="text-gray-400" />}
                          />
                          <InputField 
                            label="Routing Number"
                            name="newRouting"
                            type="tel"
                            inputMode="numeric"
                            value={newItems[0].extra2}
                            onChange={(e) => handleNewItemChange(0, 'extra2', e.target.value)}
                            icon={<Hash size={16} className="text-gray-400" />}
                          />
                          <InputField 
                            label="SWIFT Code"
                            name="newSwift"
                            value={newItems[0].extra3 || ''}
                            onChange={(e) => handleNewItemChange(0, 'extra3', e.target.value)}
                            icon={<Globe size={16} className="text-gray-400" />}
                          />
                          <InputField 
                            label="Account Title"
                            name="newAccountTitle"
                            type="text"
                            value={newItems[0].extra4 || ''}
                            onChange={(e) => handleNewItemChange(0, 'extra4', e.target.value)}
                            icon={<User size={16} className="text-gray-400" />}
                          />
                          <InputField 
                            label="Account Number"
                            name="newAccountNumber"
                            type="tel"
                            inputMode="numeric"
                            value={newItems[0].extra5 || ''}
                            onChange={(e) => handleNewItemChange(0, 'extra5', e.target.value)}
                            icon={<CreditCard size={16} className="text-gray-400" />}
                          />
                          <button 
                            onClick={() => {
                              if (!newItems[0].value.trim()) return;
                              const bankId = Date.now().toString();
                              addBank({ 
                                id: bankId, 
                                name: newItems[0].value,
                                countryCode: selectedCountryForBank,
                                logo: newBankLogo || undefined
                              });
                              if (newItems[0].extra.trim()) {
                                  addBranch({
                                      id: Date.now().toString() + 'b',
                                      name: newItems[0].extra,
                                      routingNumber: newItems[0].extra2,
                                      swiftCode: newItems[0].extra3,
                                      accountTitle: newItems[0].extra4,
                                      accountNumber: newItems[0].extra5,
                                      bankId: bankId
                                  });
                              }
                              setNewItems([{ value: '', extra: '', extra2: '', extra3: '', extra4: '', extra5: '' }]);
                              setNewBankLogo(null);
                              setShowAddBankForm(false);
                              showFeedback('Bank and branch added successfully!');
                            }}
                            className="w-full h-11 text-white font-black rounded-lg shadow-lg active:scale-95 transition-all uppercase tracking-widest text-xs"
                            style={{ background: 'var(--primary)' }}
                          >
                            Save Bank
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Bank Cards List */}
                  <div className="space-y-3">
                    {banks
                      .filter(b => b.countryCode === selectedCountryForBank)
                      .filter(b => !selectedBankForBranch || b.id === selectedBankForBranch)
                      .map((bank) => (
                        <div key={bank.id} className="bg-theme-card rounded-lg shadow-sm overflow-hidden border border-zinc-200 dark:border-zinc-800">
                        <div
                          onClick={() => setSelectedBankForBranch(selectedBankForBranch === bank.id ? null : bank.id)}
                          className={`w-full p-4 flex items-center justify-between transition-colors cursor-pointer ${selectedBankForBranch === bank.id ? 'bg-black/5 dark:bg-white/5 border-b border-zinc-200 dark:border-zinc-800' : 'hover:bg-gray-50 dark:hover:bg-white/5'}`}
                        >
                          <span className={`font-bold text-sm tracking-wide ${selectedBankForBranch === bank.id ? 'text-cyan-500' : 'text-text-main'}`}>
                            {bank.name}
                          </span>
                          <div className="flex items-center gap-3">
                            {!isEditingBank && selectedBankForBranch === bank.id && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsEditingBank(true);
                                  setEditingItem(bank);
                                  setEditValue(bank.name);
                                  setTempBranches(branches.filter(br => br.bankId === bank.id));
                                }}
                                className="flex items-center gap-1.5 text-cyan-500 text-xs font-black uppercase tracking-widest hover:bg-cyan-50 dark:hover:bg-zinc-800 p-2 rounded-lg transition-colors cursor-pointer"
                              >
                                <Edit2 size={12} />
                                <span>{language === 'bn' ? 'এডিট' : (language === 'ar' ? 'تعديل' : 'Edit')}</span>
                              </button>
                            )}
                            <ChevronDown size={18} className={`text-gray-400 transition-transform ${selectedBankForBranch === bank.id ? 'rotate-180' : ''}`} />
                          </div>
                        </div>

                        <>
                          {selectedBankForBranch === bank.id && (
                            <div
                              
                              
                              
                              
                              className="p-4 space-y-6"
                            >
                              {isEditingBank ? (
                                /* Focused Bank Edit View */
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Bank Logo</label>
                                    <input 
                                      type="file" 
                                      accept="image/*" 
                                      onChange={(e) => handleLogoUpload(bank.id, e)}
                                      className="block w-full text-[10px] text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-cyan-500 file:text-white hover:file:bg-cyan-600 transition-all"
                                    />
                                  </div>
                                  
                                  <InputField 
                                    label="Bank Name"
                                    name={`editBankName-${bank.id}`}
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    icon={<Landmark size={16} className="text-gray-400" />}
                                  />

                                  {/* Edit Branches Section */}
                                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest pt-2">Edit Branches</h4>
                                  {tempBranches.map((branch, bIdx) => (
                                    <div key={branch.id} className="space-y-3">
                                      <InputField 
                                        label={tempBranches.length > 1 ? `Branch ${bIdx + 1} Name` : "Branch Name"}
                                        name={`tempBranchName-${branch.id}`}
                                        value={branch.name}
                                        onChange={(e) => {
                                          const newTemp = [...tempBranches];
                                          newTemp[bIdx] = { ...newTemp[bIdx], name: e.target.value };
                                          setTempBranches(newTemp);
                                        }}
                                        icon={<MapPin size={16} className="text-gray-400" />}
                                      />
                                      <InputField 
                                        label="Routing Number"
                                        name={`tempBranchRouting-${branch.id}`}
                                        type="tel"
                                        inputMode="numeric"
                                        value={branch.routingNumber}
                                        onChange={(e) => {
                                          const newTemp = [...tempBranches];
                                          newTemp[bIdx] = { ...newTemp[bIdx], routingNumber: e.target.value };
                                          setTempBranches(newTemp);
                                        }}
                                        icon={<Hash size={16} className="text-gray-400" />}
                                      />
                                      <InputField 
                                        label="SWIFT Code"
                                        name={`tempBranchSwift-${branch.id}`}
                                        value={branch.swiftCode || ''}
                                        onChange={(e) => {
                                          const newTemp = [...tempBranches];
                                          newTemp[bIdx] = { ...newTemp[bIdx], swiftCode: e.target.value };
                                          setTempBranches(newTemp);
                                        }}
                                        icon={<Globe size={16} className="text-gray-400" />}
                                      />
                                      <InputField 
                                        label="Account Title"
                                        name={`tempBranchAccountTitle-${branch.id}`}
                                        type="text"
                                        value={branch.accountTitle || ''}
                                        onChange={(e) => {
                                          const newTemp = [...tempBranches];
                                          newTemp[bIdx] = { ...newTemp[bIdx], accountTitle: e.target.value };
                                          setTempBranches(newTemp);
                                        }}
                                        icon={<User size={16} className="text-gray-400" />}
                                      />
                                      <InputField 
                                        label="Account Number"
                                        name={`tempBranchAccountNumber-${branch.id}`}
                                        type="tel"
                                        inputMode="numeric"
                                        value={branch.accountNumber || ''}
                                        onChange={(e) => {
                                          const newTemp = [...tempBranches];
                                          newTemp[bIdx] = { ...newTemp[bIdx], accountNumber: e.target.value };
                                          setTempBranches(newTemp);
                                        }}
                                        icon={<CreditCard size={16} className="text-gray-400" />}
                                      />
                                    </div>
                                  ))}

                                  <div className="flex gap-2 pt-4 pb-1">
                                    <button 
                                      onClick={() => {
                                        // Update Bank
                                        updateBank(bank.id, { name: editValue });
                                        // Update all branches
                                        tempBranches.forEach(br => {
                                          updateBranch(br.id, { name: br.name, routingNumber: br.routingNumber, swiftCode: br.swiftCode, accountTitle: br.accountTitle, accountNumber: br.accountNumber });
                                        });
                                        setIsEditingBank(false);
                                        showFeedback('Bank and branches updated!');
                                      }}
                                      className="flex-1 h-11 text-white font-black rounded-lg shadow-lg active:scale-95 transition-all uppercase tracking-widest text-xs"
                                      style={{ background: 'var(--primary)' }}
                                    >
                                      Update
                                    </button>
                                    <button 
                                      onClick={() => {
                                        setIsEditingBank(false);
                                      }}
                                      className="px-6 h-11 bg-red-100 hover:bg-red-200 text-red-700 font-black rounded-lg uppercase tracking-widest text-xs transition-colors"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                /* Branch Management View */
                                <div className="space-y-6">
                                  {/* Branch List */}
                                  <div className="space-y-3 pt-2">
                                    {branches.filter(br => br.bankId === bank.id).map(branch => (
                                      <div key={branch.id} className="border-t border-b border-zinc-300 dark:border-zinc-700 divide-y divide-zinc-300 dark:divide-zinc-700 my-4 bg-zinc-50/30 dark:bg-zinc-900/10 rounded-md">
                                        {/* Bank Name */}
                                        <div className="flex items-center justify-between py-2.5 px-2">
                                          <div className="flex items-center gap-2">
                                            <Landmark className="text-cyan-500" size={15} />
                                            <span className="text-xs font-semibold text-text-muted">
                                              {language === 'bn' ? 'ব্যাংক নাম' : (language === 'ar' ? 'اسم البنك' : 'Bank Name')}
                                            </span>
                                          </div>
                                          <div className="text-xs font-bold text-text-main">
                                             <span>{bank.name}</span>
                                          </div>
                                        </div>

                                        {/* Branch Name */}
                                        <div className="flex items-center justify-between py-2.5 px-2">
                                          <div className="flex items-center gap-2">
                                            <MapPin className="text-cyan-500" size={15} />
                                            <span className="text-xs font-semibold text-text-muted">
                                              {language === 'bn' ? 'শাখার নাম' : (language === 'ar' ? 'اسم الفرع' : 'Branch Name')}
                                            </span>
                                          </div>
                                          <div className="text-xs font-bold text-text-main">
                                             <span>{branch.name}</span>
                                          </div>
                                        </div>

                                        {/* Account Title */}
                                        <div className="flex items-center justify-between py-2.5 px-2">
                                          <div className="flex items-center gap-2">
                                            <User className="text-cyan-500" size={15} />
                                            <span className="text-xs font-semibold text-text-muted">
                                              {language === 'bn' ? 'একাউন্ট টাইটেল' : (language === 'ar' ? 'عنوان الحساب' : 'Account Title')}
                                            </span>
                                          </div>
                                          <div className="text-xs font-bold text-text-main">
                                             <span className="uppercase">{branch.accountTitle || 'N/A'}</span>
                                          </div>
                                        </div>

                                        {/* Account Number */}
                                        <div className="flex items-center justify-between py-2.5 px-2">
                                          <div className="flex items-center gap-2">
                                            <CreditCard className="text-cyan-500" size={15} />
                                            <span className="text-xs font-semibold text-text-muted">
                                              {language === 'bn' ? 'একাউন্ট নাম্বার' : (language === 'ar' ? 'رقم الحساب' : 'Account Number')}
                                            </span>
                                          </div>
                                          <div className="text-xs font-bold text-text-main font-mono">
                                             <span>{branch.accountNumber || 'N/A'}</span>
                                          </div>
                                        </div>

                                        {/* Routing Number */}
                                        <div className="flex items-center justify-between py-2.5 px-2">
                                          <div className="flex items-center gap-2">
                                            <Hash className="text-cyan-500" size={15} />
                                            <span className="text-xs font-semibold text-text-muted">
                                              {language === 'bn' ? 'রাউটিং নাম্বার' : (language === 'ar' ? 'رقم التوجيه' : 'Routing Number')}
                                            </span>
                                          </div>
                                          <div className="text-xs font-bold text-text-main font-mono">
                                             <span>{branch.routingNumber || 'N/A'}</span>
                                          </div>
                                        </div>

                                        {/* Swift Code */}
                                        <div className="flex items-center justify-between py-2.5 px-2">
                                          <div className="flex items-center gap-2">
                                            <Globe className="text-cyan-500" size={15} />
                                            <span className="text-xs font-semibold text-text-muted">
                                              {language === 'bn' ? 'সুইফট কোড' : (language === 'ar' ? 'رمز سويفت' : 'Swift Code')}
                                            </span>
                                          </div>
                                          <div className="text-xs font-bold text-text-main font-mono">
                                             <span>{branch.swiftCode || 'N/A'}</span>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : ['LOCATIONS', 'POLICE_STATIONS', 'CITIES', 'STATES', 'POST_OFFICES'].includes(activeTab) && !selectedCountryForAddress ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Select Country</h3>
              </div>
              
              {/* Country Search */}
              <div>
                <FloatingInput
                  id="countrySearchLoc"
                  label="Search country..."
                  value={countrySearch}
                  onChange={setCountrySearch}
                  icon={<Search size={18} />}
                />
              </div>

              <div className="space-y-2">
                {countries
                  .filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase()))
                  .map((country, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedCountryForAddress(country.name)}
                    className="w-full bg-theme-card p-3 h-14 rounded-lg flex items-center justify-between shadow-sm hover:border-cyan-500 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{country.flag}</span>
                      <span className="font-bold text-xs text-text-main uppercase tracking-wide">{country.name}</span>
                    </div>
                    <ChevronDown size={18} className="text-gray-400 -rotate-90" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Add New Item */}
              <div className="bg-theme-card p-5 pt-7 pb-6 rounded-xl shadow-md border border-gray-200 dark:border-white/10 mb-6 space-y-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Plus size={18} className="text-cyan-500" />
                    <h3 className="text-xs font-black text-text-main uppercase tracking-widest">
                      Add New {['LOCATIONS', 'POLICE_STATIONS', 'CITIES', 'STATES', 'POST_OFFICES'].includes(activeTab) ? `${activeTab.replace('_', ' ')} in ${selectedCountryForAddress}` : activeTab.replace('_', ' ').toLowerCase()}
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400">{newItems.length}/20</span>
                </div>
                
                <div className="flex flex-col gap-3">
                  {newItems.map((item, index) => (
                    <div key={index} className="flex flex-col gap-4 p-5 bg-white border border-gray-100 dark:bg-[#1a1a1c] dark:border-white/10 rounded-xl relative shadow-sm">
                      {newItems.length > 1 && (
                        <button 
                          onClick={() => removeNewItemRow(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-100 text-red-500 rounded-full flex items-center justify-center shadow-sm z-10"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                      {activeTab === 'COUNTRIES' ? (
                        <div className="flex flex-col gap-4">
                          <InputField 
                            label={language === 'bn' ? "দেশের নাম (Country Name)" : "Country Name"}
                            placeholder={language === 'bn' ? "দেশের নাম লিখুন" : "Enter country name..."}
                            name={`f_val_${index}`}
                            value={item.value}
                            onChange={(e) => handleNewItemChange(index, 'value', e.target.value)}
                            className="w-full h-14"
                          />
                          
                          <div className="grid grid-cols-2 gap-3">
                            <InputField 
                              label="Country Code"
                              placeholder="Country Code"
                              name={`f_ext2_${index}`}
                              value={item.extra2}
                              onChange={(e) => handleNewItemChange(index, 'extra2', e.target.value)}
                              className="h-14"
                            />
                            <InputField 
                              label={language === 'bn' ? "দেশের পতাকা (Flag)" : "Country Flag"}
                              placeholder={language === 'bn' ? "পতাকা" : "Flag"}
                              name={`f_ext_${index}`}
                              value={item.extra}
                              onChange={(e) => handleNewItemChange(index, 'extra', e.target.value)}
                              className="h-14"
                            />
                          </div>
                        </div>
                      ) : (
                        <>
                          <InputField 
                            label={`Enter ${activeTab === 'LOCATIONS' ? 'location' : activeTab.toLowerCase()} name...`}
                            name={`newItem-${index}`}
                            value={item.value}
                            onChange={(e) => handleNewItemChange(index, 'value', e.target.value)}
                          />
                          
                          {(activeTab === 'NATIONALITIES' || activeTab === 'BANKS' || activeTab === 'BRANCHES' || activeTab === 'ROUTING_NUMBERS' || activeTab === 'POST_OFFICES') && (
                            <div className={`grid gap-2 ${activeTab === 'BRANCHES' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                              <InputField 
                                label={activeTab === 'POST_OFFICES' ? "Postal Code" : (activeTab === 'BANKS' || activeTab === 'BRANCHES' || activeTab === 'ROUTING_NUMBERS') ? "ID (Optional)" : "Flag emoji"}
                                name={`newItemExtra-${index}`}
                                type={activeTab === 'POST_OFFICES' ? "tel" : "text"}
                                inputMode={activeTab === 'POST_OFFICES' ? "numeric" : undefined}
                                value={item.extra}
                                onChange={(e) => handleNewItemChange(index, 'extra', e.target.value)}
                              />
                              {activeTab === 'BRANCHES' && (
                                <InputField 
                                  label="Routing Number"
                                  name={`newItemExtra2-${index}`}
                                  type="tel"
                                  inputMode="numeric"
                                  value={item.extra2}
                                  onChange={(e) => handleNewItemChange(index, 'extra2', e.target.value)}
                                />
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}

                  {newItems.length < 20 && (
                    <button 
                      onClick={addNewItemRow}
                      className="w-full h-10 font-bold rounded-lg flex items-center justify-center gap-2 transition-colors text-xs uppercase tracking-wider border"
                      style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}
                    >
                      <Plus size={16} /> Add Another Item
                    </button>
                  )}

                    <button 
                    onClick={handleAdd}
                    className="w-full h-11 text-white font-black rounded-lg shadow-lg active:scale-95 transition-all uppercase tracking-widest text-xs mt-2"
                    style={{ background: 'var(--primary)' }}
                  >
                    Save All Items
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Items</h3>
                  <span className="text-[10px] font-black text-cyan-500 bg-cyan-50 px-2 py-0.5 rounded-full">
                    {activeTab === 'LOCATIONS' ? locations.filter(l => l.country === selectedCountryForAddress).length : 
                     activeTab === 'POLICE_STATIONS' ? policeStations.filter(p => p.country === selectedCountryForAddress).length :
                     activeTab === 'CITIES' ? cities.filter(c => c.country === selectedCountryForAddress).length :
                     activeTab === 'STATES' ? states.filter(s => s.country === selectedCountryForAddress).length :
                     activeTab === 'POST_OFFICES' ? postOffices.filter(p => !p.country || p.country === selectedCountryForAddress).length :
                     activeTab === 'COUNTRIES' ? countries.length :
                     activeTab === 'COMPANIES' ? companies.length :
                     activeTab === 'NATIONALITIES' ? nationalities.length :
                     activeTab === 'CONTAINERS' ? containerTypes.length :
                     activeTab === 'ID_TYPES' ? idTypes.length :
                     activeTab === 'GENDERS' ? genders.length :
                     activeTab === 'RELIGIONS' ? religions.length :
                     activeTab === 'PROFESSIONS' ? professions.length :
                     activeTab === 'POLICE_STATIONS' ? policeStations.length :
                     activeTab === 'CITIES' ? cities.length :
                     activeTab === 'STATES' ? states.length :
                     activeTab === 'POST_OFFICES' ? postOffices.length :
                     activeTab === 'EXTRA_DIESEL' ? extraDieselReasons.length :
                     activeTab === 'ADVANCE_REASONS' ? advanceReasons.length :
                     activeTab === 'EMPTY_YARDS' ? emptyReturnYards.length :
                     activeTab === 'USERS' ? users.length :
                     activeTab === 'WALLET_INCOME_SOURCES' ? walletIncomeSources.length :
                     activeTab === 'WALLET_DEDUCTION_REASONS' ? walletDeductionReasons.length :
                     activeTab === 'WALLET_PAYMENT_METHODS' ? walletPaymentMethods.length :
                     loadingTypes.length} Items
                  </span>
                </div>
                {(() => {
                  let items: any[] = [];
                  let removeFn: (id: any) => void = () => {};

                  switch (activeTab) {
                    case 'LOCATIONS': items = locations.filter(l => l.country === selectedCountryForAddress); removeFn = (l: any) => removeLocation(l.country, l.name); break;
                    case 'COUNTRIES': items = countries; removeFn = (c: any) => removeCountry(c.code); break;
                    case 'COMPANIES': items = companies; removeFn = removeCompany; break;
                    case 'NATIONALITIES': items = nationalities; removeFn = (n: any) => removeNationality(n.name); break;
                    case 'CONTAINERS': items = containerTypes; removeFn = removeContainerType; break;
                    case 'LOADING': items = loadingTypes; removeFn = removeLoadingType; break;
                    case 'ID_TYPES': items = idTypes; removeFn = removeIdType; break;
                    case 'GENDERS': items = genders; removeFn = removeGender; break;
                    case 'RELIGIONS': items = religions; removeFn = removeReligion; break;
                    case 'PROFESSIONS': items = professions; removeFn = removeProfession; break;
                    case 'POLICE_STATIONS': items = policeStations.filter(p => p.country === selectedCountryForAddress); removeFn = (p: any) => removePoliceStation(p.country, p.name); break;
                    case 'CITIES': items = cities.filter(c => c.country === selectedCountryForAddress); removeFn = (c: any) => removeCity(c.country, c.name); break;
                    case 'STATES': items = states.filter(s => s.country === selectedCountryForAddress); removeFn = (s: any) => removeState(s.country, s.name); break;
                    case 'POST_OFFICES': items = postOffices.filter(po => !po.country || po.country === selectedCountryForAddress); removeFn = (po: any) => removePostOffice(po.country || selectedCountryForAddress!, po.name); break;
                    case 'EXTRA_DIESEL': items = extraDieselReasons; removeFn = removeExtraDieselReason; break;
                    case 'ADVANCE_REASONS': items = advanceReasons; removeFn = removeAdvanceReason; break;
                    case 'EMPTY_YARDS': items = emptyReturnYards; removeFn = removeEmptyReturnYard; break;
                    case 'ITEMS': items = globalItems; removeFn = (i: any) => deleteFirebaseDoc('items', i.id); break;
                    case 'USERS': items = users; removeFn = (u: any) => removeUser(u.id); break;
                    case 'BANKS': items = banks; removeFn = (b: any) => removeBank(b.id); break;
                    case 'BRANCHES': items = branches; removeFn = (b: any) => removeBranch(b.id); break;
                    case 'ROUTING_NUMBERS': items = routingNumbers; removeFn = (r: any) => removeRoutingNumber(r.id); break;
                    case 'WALLET_INCOME_SOURCES': items = walletIncomeSources; removeFn = removeWalletIncomeSource; break;
                    case 'WALLET_DEDUCTION_REASONS': items = walletDeductionReasons; removeFn = removeWalletDeductionReason; break;
                    case 'WALLET_PAYMENT_METHODS': items = walletPaymentMethods; removeFn = removeWalletPaymentMethod; break;
                  }

                  return (
                    <div className="space-y-2">
                      {items.map((item, idx) => (
                        <div key={idx} className="bg-theme-card p-4 rounded-xl flex flex-col gap-3 shadow-sm border border-black/5 dark:border-white/5 group transition-all hover:shadow-md">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3.5 flex-1 text-left">
                              {(activeTab === 'COUNTRIES' || activeTab === 'NATIONALITIES') && (
                                <div className="w-9 h-9 rounded-lg bg-gray-50 dark:bg-white/5 flex items-center justify-center shadow-sm border border-black/5 dark:border-white/10 shrink-0 text-xl leading-none">
                                  {item.flag}
                                </div>
                              )}
                              <div className="flex flex-col gap-0.5">
                                <span className="font-bold text-xs text-text-main uppercase tracking-wide">
                                  {activeTab === 'USERS' ? item.name : (typeof item === 'string' ? item : (item.name || item.number))}
                                </span>
                                {activeTab === 'COUNTRIES' && <span className="text-[9px] font-bold text-gray-400 tracking-wider">CODE: {item.code}</span>}
                                {activeTab === 'POST_OFFICES' && item.code && <span className="text-[9px] font-bold text-cyan-500 tracking-wider">POSTAL CODE: {item.code}</span>}
                                {activeTab === 'BRANCHES' && item.routingNumber && <span className="text-[9px] font-bold text-cyan-500 tracking-wider">RT: {item.routingNumber}</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {activeTab !== 'USERS' && activeTab !== 'MENU_VISIBILITY' && (
                                <button 
                                  onClick={() => startEdit(item)}
                                  className="w-8 h-8 flex items-center justify-center text-cyan-500 bg-cyan-50 dark:bg-cyan-500/10 hover:bg-cyan-100 dark:hover:bg-cyan-500/20 rounded-lg transition-colors"
                                >
                                  <Edit2 size={14} />
                                </button>
                              )}
                              <button 
                                onClick={() => removeFn(item)}
                                className="w-8 h-8 flex items-center justify-center text-red-500 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>

                          {/* Edit Mode Inline */}
                          {editingItem === item && (
                            <div 
                              
                              
                              className="pt-2 space-y-3"
                            >
                              <InputField 
                                label="New Value"
                                name="editValue"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value.toUpperCase())}
                              />
                              {(activeTab === 'COUNTRIES' || activeTab === 'NATIONALITIES') && (
                                <div className="grid grid-cols-2 gap-2">
                                  <InputField 
                                    label="Flag Emoji"
                                    name="editValueExtra"
                                    value={editValueExtra}
                                    onChange={(e) => setEditValueExtra(e.target.value.toUpperCase())}
                                  />
                                  {activeTab === 'COUNTRIES' && (
                                    <InputField 
                                      label="Country Code"
                                      name="editValueExtra2"
                                      value={editValueExtra2}
                                      onChange={(e) => setEditValueExtra2(e.target.value.toUpperCase())}
                                    />
                                  )}
                                  {activeTab === 'BRANCHES' && (
                                    <InputField 
                                      label="Routing Number"
                                      name="editValueExtra2"
                                      type="tel"
                                      inputMode="numeric"
                                      value={editValueExtra2}
                                      onChange={(e) => setEditValueExtra2(e.target.value)}
                                    />
                                  )}
                                </div>
                              )}
                              {activeTab === 'POST_OFFICES' && (
                                <InputField 
                                  label="Postal Code"
                                  name="editValueExtra2"
                                  type="tel"
                                  inputMode="numeric"
                                  value={editValueExtra2}
                                  onChange={(e) => setEditValueExtra2(e.target.value)}
                                />
                              )}
                              <div className="flex gap-2 pt-4 pb-1">
                                <button 
                                  onClick={handleUpdate}
                                  className="flex-1 h-9 bg-green-500 text-white font-bold rounded-lg text-[10px] uppercase tracking-wider"
                                >
                                  Update
                                </button>
                                <button 
                                  onClick={() => setEditingItem(null)}
                                  className="flex-1 h-9 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-lg text-[10px] uppercase tracking-wider transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </>
          )}
        </>
      )}

      {typeof document !== 'undefined' && createPortal(
        <>
          {duplicateError && (
            <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4 overflow-hidden select-none">
              <div
                
                
                
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                onClick={() => setDuplicateError(null)}
              />
              <div
                
                
                
                
                className="relative bg-white dark:bg-zinc-900 border border-red-500/30 w-full max-w-sm rounded-2xl p-8 shadow-2xl overflow-hidden z-10"
                style={{ contentVisibility: 'auto' }}
              >
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 via-amber-500 to-red-500" />
                
                <div className="flex flex-col items-center text-center space-y-5">
                  <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-500/15 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                    <AlertCircle size={28} />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-text-main">
                      {language === 'bn' ? 'ডুপ্লিকেট এন্ট্রি সনাক্ত হয়েছে' : 'Duplicate Entry Detected'}
                    </h3>
                    <div className="max-w-full">
                      <p className="text-sm font-semibold text-red-500 bg-red-50 dark:bg-red-500/5 px-3.5 py-2 rounded-lg border border-red-500/10 inline-block uppercase break-all max-w-full">
                        "{duplicateError}"
                      </p>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed pt-1">
                      {language === 'bn' ? 'ইতিমধ্যেই এই নামটি অ্যাড করা আছে।' : 'This item is already added.'}
                    </p>
                  </div>

                  <button
                    onClick={() => setDuplicateError(null)}
                    className="w-full h-11 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-red-500/20 transition-all duration-200"
                  >
                    {language === 'bn' ? 'ঠিক আছে' : 'OK'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>,
        document.body
      )}
    </div>
  );
};

export default ControlPanel;
