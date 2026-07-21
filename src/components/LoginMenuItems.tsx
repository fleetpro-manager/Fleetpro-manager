import React from 'react';

import { Home, Clock, Calendar, Cloud, LifeBuoy, Info, Palette } from 'lucide-react';

interface LoginMenuItemsProps {
  t: any;
  openModal: (modal: 'menu' | 'login' | 'support' | 'appearance') => void;
  setActiveTab: (tab: 'signin' | 'signup') => void;
  setView: (view: any) => void;
  setIsMenuOpen: (isOpen: boolean) => void;
  isLight?: boolean;
}

const LoginMenuItems: React.FC<LoginMenuItemsProps> = ({ t, openModal, setActiveTab, setView, setIsMenuOpen, isLight }) => {
  const menuItems = [
    { icon: <Home size={20} />, label: "Home", action: () => { openModal('login'); setActiveTab('signin'); } },
    { icon: <Clock size={20} />, label: t.PRAYER_TIMES, action: () => openModal('prayer_times') },
    { icon: <Calendar size={20} />, label: t.RAMADAN_SCHEDULE, action: () => openModal('ramadan') },
    { icon: <Cloud size={20} />, label: t.WEATHER, action: () => openModal('weather') },
    { icon: <LifeBuoy size={20} />, label: t.SUPPORT, action: () => openModal('support') },
    { icon: <Info size={20} />, label: t.ABOUT, action: () => openModal('about') },
  ];

  return (
    <>
      {menuItems.map((item, index) => (
        <button
          key={index}
          
          
          
          onClick={item.action}
          className={`w-full flex items-center gap-4 h-14 px-6 rounded-none font-medium text-[15px] bg-transparent text-text-main border-b ${isLight ? 'border-black/10' : 'border-white/10'}`}
        >
          <div className="text-text-main">
            {item.icon}
          </div>
          {item.label}
        </button>
      ))}
    </>
  );
};

export default LoginMenuItems;
