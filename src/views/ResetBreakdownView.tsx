import React, { useState } from 'react';
import { useStore } from '../store';

import { RefreshCw, Banknote, Truck, Users, UserCircle, PieChart, Settings, LayoutGrid, UserX } from 'lucide-react';

const SECTIONS = [
  { id: 'Payments', icon: <Banknote size={20} /> },
  { id: 'Trips', icon: <Truck size={20} /> },
  { id: 'Users', icon: <Users size={20} /> },
  { id: 'Profiles', icon: <UserCircle size={20} /> },
  { id: 'Finances', icon: <PieChart size={20} /> },
  { id: 'Settings', icon: <Settings size={20} /> },
  { id: 'Others', icon: <LayoutGrid size={20} /> },
  { id: 'User Accounts', icon: <UserX size={20} /> }
];

const ResetBreakdownView: React.FC = () => {
  const { resetSections, resetSystem, confirmAction, setView } = useStore();
  const [selectedSections, setSelectedSections] = useState<string[]>([]);

  const toggleSection = (section: string) => {
    if (section === 'User Accounts') {
      setView('USER_ACCOUNT_RESET');
      return;
    }
    setSelectedSections(prev => 
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0
      }
    },
    exit: { 
      opacity: 0, 
      transition: {
        duration: 0
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0
      }
    }
  };

  return (
    <div 
      
      
      
      
      className="pb-[60px]"
    >
      <div  className="space-y-3 mb-8">
        {SECTIONS.map(section => (
          <label 
            key={section.id} 
            
            
            className="flex items-center justify-start p-5 reset-option-card rounded-[8px] cursor-pointer gap-4 transition-all"
          >
            <input 
              type="checkbox" 
              checked={selectedSections.includes(section.id)}
              onChange={() => toggleSection(section.id)}
              className="w-5 h-5 accent-green-500"
            />
            <div className="flex items-center gap-3">
              <span className="text-cyan-500">{section.icon}</span>
              <span className="font-bold text-sm text-text-main">{section.id}</span>
            </div>
          </label>
        ))}
      </div>

      <div  className="flex gap-4">
        <button
          onClick={() => {
            resetSections(selectedSections);
          }}
          disabled={selectedSections.length === 0}
          className="flex-1 py-4 bg-rose-500 text-white font-black rounded-[8px] hover:bg-rose-600 transition-all uppercase tracking-widest disabled:opacity-50"
        >
          Reset Selected
        </button>
        <button
          onClick={() => {
            confirmAction(
              'Are you sure you want to reset the entire system? This will clear all data and settings.',
              () => resetSystem()
            );
          }}
          className="flex-1 py-4 bg-rose-700 text-white font-black rounded-[8px] hover:bg-rose-800 transition-all uppercase tracking-widest"
        >
          Reset All
        </button>
      </div>
    </div>
  );
};

export default ResetBreakdownView;
