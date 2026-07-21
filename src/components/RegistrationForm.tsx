import React, { useState } from 'react';
import { User as UserIcon, Shield, MapPin, Globe, Home, Building2, Mail, Phone, Calendar, User, Lock, AlignLeft, CreditCard, FileText, Briefcase } from 'lucide-react';

import { useStore } from '@/store';
import { TRANSLATIONS } from '@/constants';
import InputField, { InputFieldThemeContext } from '@/components/InputField';
import GlobalFullscreenSelect from '@/components/GlobalFullscreenSelect';
import CountryCodeDropdown from '@/components/CountryCodeDropdown';
// Loaded with useStore instead

const FormSection: React.FC<{ title: string; icon: any; children: React.ReactNode; index?: number; style?: React.CSSProperties }> = ({ title, icon: Icon, children, index = 0, style }) => {
  const isLightMode = style?.color === '#000000';
  return (
    <InputFieldThemeContext.Provider value={isLightMode ? 'light' : 'dark'}>
      <div 
        
        
        
        className={`rounded-[10px] px-4 pt-1 pb-6 shadow-md space-y-4 relative group transition-all duration-300 border`}
        style={{ 
          backgroundColor: 'var(--section-bg, rgba(255, 255, 255, 0.05))', 
          borderColor: 'var(--section-border, rgba(255, 255, 255, 0.12))', 
          color: style?.color || 'var(--text-main, #ffffff)', 
          '--text-main': style?.color || 'var(--text-main, #ffffff)', 
          '--text-muted': isLightMode ? 'rgba(0, 0, 0, 0.6)' : 'var(--text-muted, rgba(255, 255, 255, 0.6))', 
          '--icon-bg': isLightMode ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.1)',
          ...style 
        } as React.CSSProperties}
      >
        <div className="flex items-center gap-3 mb-0">
          <div 
            className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm`}
            style={{ backgroundColor: 'var(--icon-bg, rgba(255, 255, 255, 0.1))', color: style?.color || 'inherit' }}
          >
            <Icon size={16} />
          </div>
          <h3 
            className={`font-black text-xs uppercase tracking-wider`}
            style={{ color: style?.color || 'inherit' }}
          >
            {title}
          </h3>
        </div>
        {children}
      </div>
    </InputFieldThemeContext.Provider>
  );
};

interface RegistrationFormProps {
  onSubmit: (formData: any) => void;
  isAdmin?: boolean;
  initialData?: any;
  cardStyle?: React.CSSProperties;
  secondaryButtonLabel?: string;
  onSecondaryClick?: () => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ 
  onSubmit, 
  isAdmin = false, 
  initialData = {}, 
  cardStyle,
  secondaryButtonLabel,
  onSecondaryClick
}) => {
  const { language, setLanguage, showFeedback, users, nationalities, countries, idTypes, companies, genders, religions, professions, postOffices, policeStations, cities, states } = useStore();
  const t = TRANSLATIONS[language];
  const refs = React.useRef<Record<string, HTMLInputElement | null>>({});
  
  const handleKeyDown = (e: React.KeyboardEvent, nextField: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      refs.current[nextField]?.focus();
    }
  };
  
  const [accountType, setAccountType] = useState<'PERSONAL' | 'COMPANY' | null>(null);
  const [showTypeSelection, setShowTypeSelection] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '', nationality: '', dob: '', religion: '', gender: '', profession: '', companyName: '', mobile: '', countryCode: '', email: '', loginEmail: '', userId: '', password: '', confirmPassword: '',
    idType: '', idNumber: '', idIssueCountry: '', idIssueDate: '', idExpiryDate: '',
    country: '', division: '', district: '', upazila: '', policeStation: '', postOffice: '', postalCode: '', area: '', building: '',
    state: '', zone: '', electricity: '',
    buildingNumber: '', streetNumber: '', zoneNumber: '', addressLine1: '', addressLine2: '', city: '', 
    postOfficeName: '', zipCode: '', manualAddress: '',
    price: '', ...initialData
  });

  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    field: string | null;
    title: string;
    options: any[];
  }>({
    isOpen: false,
    field: null,
    title: '',
    options: []
  });

  const handleOpenModal = (field: string, title: string, options: any[]) => {
    setModalConfig({
      isOpen: true,
      field,
      title,
      options
    });
  };

  const handleInputChange = (field: keyof typeof formData) => (value: string | React.ChangeEvent<HTMLInputElement>) => {
    const val = typeof value === 'string' ? value : value.target.value;
    
    const newData = { ...formData, [field]: val };
    // Sync loginEmail and userId with email if email is changed
    if (field === 'email') {
      newData.loginEmail = val;
      newData.userId = val;
    }
    setFormData(newData);

    // Real-time duplicate check
    let isDuplicate = false;
    if (val) {
      if (field === 'mobile') {
        isDuplicate = users.some(u => u.mobileNumber === val);
      } else if (field === 'idNumber') {
        isDuplicate = users.some(u => u.idNumber === val);
      } else if (field === 'email') {
        isDuplicate = users.some(u => u.email === val);
      } else if (field === 'userId') {
        isDuplicate = users.some(u => u.userId === val || u.id === val);
      }
    }

    setErrors(prev => {
      const newErrors = { ...prev };
      if (isDuplicate) {
        newErrors[field as string] = true;
      } else {
        delete newErrors[field as string];
      }

      // Real-time password mismatch check
      if (field === 'password' || field === 'confirmPassword') {
        const password = newData.password;
        const confirmPassword = newData.confirmPassword;
        
        if (password && confirmPassword && password !== confirmPassword) {
          newErrors.password = true;
          newErrors.confirmPassword = true;
        } else {
          // Only clear if they were set due to mismatch, not if they are empty and required
          if (password === confirmPassword) {
            delete newErrors.password;
            delete newErrors.confirmPassword;
          }
        }
      }

      return newErrors;
    });
  };

  const validate = () => {
    const newErrors: Record<string, boolean> = {};
    const mandatoryFields = [
      'fullName', 'gender', 'religion', 'nationality', 'dob', 'idIssueCountry',
      'idType', 'idNumber',
      'countryCode', 'mobile', 'email', 'userId', 'password', 'confirmPassword',
      'country', 'addressLine1', 'city', 'state', 'postalCode'
    ];

    mandatoryFields.forEach(field => {
      if (!formData[field as keyof typeof formData]) {
        newErrors[field] = true;
      }
    });

    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = true;
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      showFeedback("Please fill all required fields correctly.");
      return false;
    }
    return true;
  };

  const handleSelect = (value: string) => {
    if (modalConfig.field) {
      if (modalConfig.field === 'postOffice') {
        const found = postOffices.find(po => po.name === value);
        setFormData(prev => ({
          ...prev,
          postOffice: value,
          postalCode: found ? found.code : prev.postalCode
        }));
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.postOffice;
          delete newErrors.postalCode;
          return newErrors;
        });
      } else {
        setFormData(prev => ({ ...prev, [modalConfig.field as string]: value }));
        if (errors[modalConfig.field]) {
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[modalConfig.field as string];
            return newErrors;
          });
        }
      }
    }
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  const handleFormSubmit = () => {
    if (!validate()) return;

    // 1. Check Mobile Number
    if (users.some(u => u.mobileNumber === formData.mobile)) {
      showFeedback(t.MOBILE_EXISTS);
      return;
    }

    // 2. Check ID Number
    if (users.some(u => u.idNumber === formData.idNumber)) {
      showFeedback(t.ID_NUMBER_EXISTS);
      return;
    }

    // 3. Check Email ID
    if (users.some(u => u.email === formData.email)) {
      showFeedback(t.EMAIL_EXISTS);
      return;
    }

    // 4. Check User ID and Password
    const existingUser = users.find(u => u.userId === formData.userId || u.id === formData.userId);
    if (existingUser) {
      if (existingUser.password === formData.password) {
        showFeedback(t.USER_ID_PASSWORD_EXISTS);
      } else {
        showFeedback(t.USER_ID_EXISTS);
      }
      return;
    }

    const normalizedData = {
      ...formData,
      building: formData.buildingNumber,
      state: formData.streetNumber,
      zone: formData.zoneNumber,
      area: formData.addressLine1,
      district: formData.state,
      postOffice: formData.postOffice,
      postalCode: formData.postalCode,
      city: formData.city
    };

    onSubmit({ ...normalizedData, accountType });
  };

  if (showTypeSelection) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 space-y-6 login-page-header">
        <div className="text-center space-y-2">
          <h3 className="text-xl font-black uppercase text-text-main">{t.ACCOUNT_TYPE_QUESTION}</h3>
          <p className="text-xs text-text-muted font-bold uppercase tracking-widest">Select your preferred account type to continue</p>
        </div>

        <div className="grid grid-cols-1 gap-4 w-full max-w-md mx-auto">
          <button
            
            
            onClick={() => { setAccountType('PERSONAL'); setShowTypeSelection(false); }}
            className="p-6 rounded-lg flex items-center gap-4 transition-all border shadow-sm hover:shadow-md bg-white border-zinc-200 hover:border-blue-500"
          >
            <div className="w-12 h-12 rounded-lg bg-[var(--primary)] flex items-center justify-center text-white shadow-lg shrink-0">
              <UserIcon size={24} />
            </div>
            <div className="text-left">
              <p className="font-black uppercase text-sm text-zinc-900">{t.PERSONAL_ACCOUNT}</p>
              <p className="text-[10px] text-zinc-500 font-bold uppercase">{t.INDIVIDUAL_ACCOUNT}</p>
            </div>
          </button>

          <button
            
            
            onClick={() => { setAccountType('COMPANY'); setShowTypeSelection(false); }}
            className="p-6 rounded-lg flex items-center gap-4 transition-all border shadow-sm hover:shadow-md bg-white border-zinc-200 hover:border-indigo-500"
          >
            <div className="w-12 h-12 rounded-lg bg-[var(--primary)] flex items-center justify-center text-white shadow-lg opacity-80 shrink-0">
              <Building2 size={24} />
            </div>
            <div className="text-left">
              <p className="font-black uppercase text-sm text-zinc-900">{t.COMPANY_ACCOUNT}</p>
              <p className="text-[10px] text-zinc-500 font-bold uppercase">{t.BUSINESS_ACCOUNT}</p>
            </div>
          </button>
        </div>
      </div>
    );
  }

  let idNumberLabel = 'ID Number';
  let idNumberIcon = <CreditCard size={16} />;
  
  if (formData.idType) {
    const selectedIdType = formData.idType.toUpperCase();
    if (selectedIdType === 'PASSPORT') {
      idNumberLabel = 'Passport number';
      idNumberIcon = <Globe size={16} />;
    } else if (selectedIdType.includes('BIRTH') || selectedIdType.includes('REGISTRATION')) {
      idNumberLabel = 'Birth registration number';
      idNumberIcon = <FileText size={16} />;
    } else if (selectedIdType === 'NID' || selectedIdType.includes('NATIONAL')) {
      idNumberLabel = 'National id numbers';
      idNumberIcon = <Shield size={16} />;
    } else if (selectedIdType.includes('RESIDENT') || selectedIdType === 'VISA' || selectedIdType.includes('PERMIT') || selectedIdType === 'QID' || selectedIdType === 'IQAMA') {
      idNumberLabel = 'Resident id numbers';
      idNumberIcon = <CreditCard size={16} />;
    } else if (selectedIdType === 'DRIVING LICENSE' || selectedIdType.includes('LICENSE')) {
      idNumberLabel = 'License Number';
      idNumberIcon = <CreditCard size={16} />;
    } else {
      idNumberLabel = `${formData.idType} number`;
      idNumberIcon = <CreditCard size={16} />;
    }
  }

  return (
    <>
      <div className="registration-form-wrapper space-y-6 pb-[60px]">
      <div className="flex justify-between items-center px-1 login-page-header">
        <h2 className="text-sm font-black uppercase text-text-main tracking-widest opacity-40">
           {accountType === 'COMPANY' ? t.COMPANY_ACCOUNT : t.PERSONAL_ACCOUNT}
        </h2>
      </div>

      <FormSection title="Personal Info" icon={UserIcon} index={0} style={cardStyle}>
        <div className="grid grid-cols-10 gap-4">
          <div className="col-span-10">
            <InputField 
              label="Full Name" 
              name="fullName" 
              value={formData.fullName} 
              onChange={handleInputChange('fullName')} 
              error={errors.fullName}
              icon={<UserIcon size={16} />}
            />
          </div>
          <div className="col-span-5">
            <InputField 
              label="Gender" 
              name="gender" 
              value={formData.gender} 
              onChange={handleInputChange('gender')} 
              type="select" 
              options={(genders && genders.length > 0 ? genders : ['Male', 'Female', 'Other']).map(g => ({ value: g, label: g }))} 
              onOpenModal={(name, label, options) => handleOpenModal(name, label, options)} 
              error={errors.gender}
              icon={<UserIcon size={16} />}
            />
          </div>
          <div className="col-span-5">
            <InputField 
              label="Religion" 
              name="religion" 
              value={formData.religion} 
              onChange={handleInputChange('religion')} 
              type="select" 
              options={(religions && religions.length > 0 ? religions : ['Islam', 'Hinduism', 'Christianity', 'Buddhism', 'Other']).map(r => ({ value: r, label: r }))} 
              onOpenModal={(name, label, options) => handleOpenModal(name, label, options)} 
              error={errors.religion}
              icon={<Globe size={16} />}
            />
          </div>
          <div className="col-span-5">
            <InputField 
              label="Nationality" 
              name="nationality" 
              value={formData.nationality} 
              onChange={handleInputChange('nationality')} 
              type="select" 
              options={nationalities.map(n => ({ value: n.name, label: n.name, icon: n.flag }))} 
              onOpenModal={(name, label, options) => handleOpenModal(name, label, options)} 
              error={errors.nationality}
              icon={<Globe size={16} />}
            />
          </div>
          <div className="col-span-5">
            <InputField 
              label="Date of birth" 
              name="dob" 
              type="date" 
              value={formData.dob} 
              onChange={handleInputChange('dob')} 
              error={errors.dob}
              icon={<Calendar size={16} />}
            />
          </div>

          <div className="col-span-10">
            <InputField 
              label="Profession" 
              name="profession" 
              value={formData.profession} 
              onChange={handleInputChange('profession')} 
              type="select" 
              options={(professions && professions.length > 0 ? professions : ['Driver', 'Manager', 'Technician', 'Administrator', 'Other']).map(p => ({ value: p, label: p }))} 
              onOpenModal={(name, label, options) => handleOpenModal(name, label, options)} 
              error={errors.profession}
              icon={<UserIcon size={16} />}
            />
          </div>
          <div className="col-span-10">
            <InputField 
              label="Sponsor Name" 
              name="companyName" 
              value={formData.companyName} 
              onChange={handleInputChange('companyName')} 
              type="select" 
              options={companies.map(c => ({ value: c, label: c }))} 
              onOpenModal={(name, label, options) => handleOpenModal(name, label, options)} 
              error={errors.companyName}
              icon={<Building2 size={16} />}
            />
          </div>

          <div className="col-span-10">
            <InputField 
              label="ID Issue Country" 
              name="idIssueCountry"
              type="select" 
              options={countries.map(c => ({ value: c.name, label: c.name, icon: c.flag }))} 
              value={formData.idIssueCountry} 
              onChange={() => {}}
              onOpenModal={(name, label, options) => handleOpenModal(name, label, options)}
              error={errors.idIssueCountry}
              icon={<Globe size={16} />}
            />
          </div>

          <>
            {formData.idIssueCountry && (
              <div 
                 
                 
                
                className="col-span-10 grid grid-cols-10 gap-4 overflow-hidden p-1 -m-1"
              >
                <div className="col-span-4">
                  <InputField 
                    label="ID Type" 
                    name="idType"
                    type="select" 
                    options={idTypes.map(t => ({ value: t, label: t }))} 
                    value={formData.idType} 
                    onChange={() => {}}
                    onOpenModal={(name, label, options) => handleOpenModal(name, label, options)}
                    error={errors.idType}
                    icon={<Shield size={16} />}
                  />
                </div>
                <div className="col-span-6">
                  <InputField 
                    label={idNumberLabel}
                    placeholder={idNumberLabel}
                    name="idNumber" 
                    type="tel" 
                    inputMode="numeric" 
                    value={formData.idNumber} 
                    onChange={handleInputChange('idNumber')} 
                    error={errors.idNumber}
                    icon={idNumberIcon}
                  />
                </div>
                <div className="col-span-5">
                  <InputField label="ID Issue Date" name="idIssueDate" type="date" value={formData.idIssueDate} onChange={handleInputChange('idIssueDate')} icon={<Calendar size={16} />} />
                </div>
                <div className="col-span-5">
                  <InputField label="ID Expiry Date" name="idExpiryDate" type="date" value={formData.idExpiryDate} onChange={handleInputChange('idExpiryDate')} icon={<Calendar size={16} />} />
                </div>
              </div>
            )}
          </>

          <div className="col-span-10 flex gap-2">
            <CountryCodeDropdown 
              selectedCode={formData.countryCode} 
              onSelect={(code) => {
                setFormData(prev => ({ ...prev, countryCode: code }));
                if (errors.countryCode) {
                  setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.countryCode;
                    return newErrors;
                  });
                }
              }} 
              error={errors.countryCode}
            />
            <div className="flex-1">
              <InputField 
                label="Mobile Number" 
                name="mobile" 
                type="tel" 
                inputMode="tel" 
                value={formData.mobile} 
                onChange={handleInputChange('mobile')} 
                error={errors.mobile}
                icon={<Phone size={16} />}
              />
            </div>
          </div>
          <div className="col-span-10">
            <InputField 
              label="Email ID" 
              name="email" 
              type="email" 
              value={formData.email} 
              onChange={handleInputChange('email')} 
              error={errors.email}
              icon={<Mail size={16} />}
            />
          </div>
        </div>
      </FormSection>

      <FormSection title="User Login Details" icon={Shield} index={1} style={cardStyle}>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <InputField 
              label="User ID" 
              name="userId" 
              value={formData.userId} 
              onChange={handleInputChange('userId')} 
              error={errors.userId}
              icon={<UserIcon size={16} />}
            />
          </div>
          <div className="col-span-1">
            <InputField 
              label="Password" 
              name="password" 
              type="password" 
              value={formData.password} 
              onChange={handleInputChange('password')} 
              error={errors.password}
              icon={<Lock size={16} />}
            />
          </div>
          <div className="col-span-1">
            <InputField 
              label="Confirm Password" 
              name="confirmPassword" 
              type="password" 
              value={formData.confirmPassword} 
              onChange={handleInputChange('confirmPassword')} 
              error={errors.confirmPassword}
              icon={<Lock size={16} />}
            />
          </div>
        </div>
      </FormSection>

      <FormSection title="Address Information" icon={MapPin} index={2} style={cardStyle}>
        <div className="grid grid-cols-1 gap-4">
          <div className="col-span-1">
            <InputField 
              label="Country" 
              name="country" 
              value={formData.country} 
              onChange={handleInputChange('country')} 
              type="select" 
              options={countries.map(c => ({ value: c.name, label: c.name, icon: c.flag }))} 
              onOpenModal={(name, label, options) => handleOpenModal(name, label, options)} 
              error={errors.country}
              icon={<Globe size={16} />}
            />
          </div>
          <>
            {formData.country && (
              <div   className="col-span-1 grid grid-cols-2 gap-4">
                <InputField 
                  label="Building Number" 
                  name="buildingNumber" 
                  type="tel" 
                  inputMode="numeric" 
                  value={formData.buildingNumber} 
                  onChange={handleInputChange('buildingNumber')} 
                  error={errors.buildingNumber}
                  icon={<Building2 size={16} />}
                />
                <InputField 
                  label="Street Number" 
                  name="streetNumber" 
                  type="tel" 
                  inputMode="numeric" 
                  value={formData.streetNumber} 
                  onChange={handleInputChange('streetNumber')} 
                  error={errors.streetNumber}
                  icon={<AlignLeft size={16} />}
                />
                <InputField 
                  label="Postal code *" 
                  name="postalCode" 
                  type="tel" 
                  inputMode="numeric" 
                  value={formData.postalCode} 
                  onChange={handleInputChange('postalCode')} 
                  error={errors.postalCode}
                  icon={<MapPin size={16} />}
                />
                
                <div className="col-span-2">
                  <InputField 
                    label="Address *" 
                    name="addressLine1" 
                    value={formData.addressLine1} 
                    onChange={handleInputChange('addressLine1')} 
                    error={errors.addressLine1}
                    icon={<MapPin size={16} />}
                  />
                </div>
                
                <div className="col-span-2">
                  <InputField 
                    label="Police Station" 
                    name="policeStation"
                    type="select"
                    value={formData.policeStation} 
                    options={policeStations.filter((ps: any) => ps.country === formData.country).map((ps: any) => ({ value: ps.name, label: ps.name }))}
                    onOpenModal={(name, label, options) => handleOpenModal(name, label, options)} 
                    error={errors.policeStation}
                    icon={<MapPin size={16} />}
                  />
                </div>

                <InputField 
                  label="Ciyt / Town *" 
                  name="city" 
                  type="select"
                  value={formData.city} 
                  options={cities.filter((c: any) => c.country === formData.country).map((c: any) => ({ value: c.name, label: c.name }))}
                  onOpenModal={(name, label, options) => handleOpenModal(name, label, options)} 
                  error={errors.city}
                  icon={<MapPin size={16} />}
                />

                <InputField 
                  label="State / Region *" 
                  name="state" 
                  type="select"
                  value={formData.state} 
                  options={states.filter((s: any) => s.country === formData.country).map((s: any) => ({ value: s.name, label: s.name }))}
                  onOpenModal={(name, label, options) => handleOpenModal(name, label, options)} 
                  error={errors.state}
                  icon={<MapPin size={16} />}
                />

                <div className="col-span-2">
                  <InputField 
                    label="Post office Name" 
                    name="postOffice" 
                    type="select"
                    value={formData.postOffice} 
                    options={postOffices.filter((po: any) => !po.country || po.country === formData.country).map((po: any) => ({ value: po.name, label: `${po.name} (${po.code})` }))}
                    onOpenModal={(name, label, options) => handleOpenModal(name, label, options)} 
                    error={errors.postOffice}
                    icon={<MapPin size={16} />}
                  />
                </div>
              </div>
            )}
          </>
        </div>
      </FormSection>
      
      <div className="flex gap-4">
        {secondaryButtonLabel && onSecondaryClick && (
          <button 
            
            onClick={onSecondaryClick} 
            className="flex-1 h-14 bg-blue-500 !text-white font-black uppercase tracking-widest text-xs rounded-lg transition-all shadow-lg hover:brightness-110 flex items-center justify-center"
          >
            {secondaryButtonLabel}
          </button>
        )}
        <button 
          
          onClick={handleFormSubmit} 
          className="flex-1 h-14 bg-[var(--primary)] !text-white font-black uppercase tracking-widest text-xs rounded-lg transition-all shadow-lg hover:brightness-110 flex items-center justify-center"
        >
          Submit
        </button>
      </div>
      
      <GlobalFullscreenSelect
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        onSelect={handleSelect}
        options={modalConfig.options}
        title={modalConfig.title}
        selectedValue={modalConfig.field ? (formData as any)[modalConfig.field] : ''}
      />
    </div>
  </>
  );
};

export default RegistrationForm;
