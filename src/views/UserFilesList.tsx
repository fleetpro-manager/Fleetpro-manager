import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../store';
import { TRANSLATIONS } from '../constants';
import { Search, User, Trash2, Shield } from 'lucide-react';

import InputField from '../components/InputField';
import { subscribeFirebaseCollection } from '../services/firebase';

const UserFilesList: React.FC = () => {
  const { 
    language, setView, setSelectedUser, removeUser, confirmAction, showFeedback,
    primaryColor: storePrimaryColor, currentThemeObj 
  } = useStore();
  const primaryColor = storePrimaryColor || currentThemeObj?.primary || '#3b82f6';
  const t = TRANSLATIONS[language];
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ADMIN' | 'USER' | null>('USER');

  // Real-time local state synced directly with Firestore
  const [localUsers, setLocalUsers] = useState<any[]>([]);
  const [localAdmins, setLocalAdmins] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Directly subscribe to the "users" collection from Firestore
  useEffect(() => {
    setIsLoading(true);
    const unsubscribeUsers = subscribeFirebaseCollection('users', (data) => {
      const sanitized = (data || []).filter((u: any) => u.id !== 'Admin').map(u => ({
        ...u,
        role: u.role || 'USER',
        name: u.name || u.id || 'Unnamed User'
      }));
      setLocalUsers(sanitized);
      setIsLoading(false);
    });
    return () => unsubscribeUsers();
  }, []);

  // Directly subscribe to the "admins" collection from Firestore
  useEffect(() => {
    const unsubscribeAdmins = subscribeFirebaseCollection('admins', (data) => {
      const sanitized = (data || []).map(u => ({
        ...u,
        role: u.role || 'ADMIN',
        name: u.name || u.id || 'Unnamed Admin'
      }));
      setLocalAdmins(sanitized);
    });
    return () => unsubscribeAdmins();
  }, []);

  const adminCount = localAdmins.length;
  const userCount = localUsers.length;

  const normalizeDigits = (str: string) => {
    const bengaliToLatin: Record<string, string> = {
      '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
      '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
    };
    return str.replace(/[০-৯]/g, m => bengaliToLatin[m]);
  };

  const filteredUsers = useMemo(() => {
    const activeList = roleFilter === 'ADMIN' ? localAdmins : localUsers;
    return activeList.filter(user => {
      if (!user) return false;
      try {
        const searchQueryLower = normalizeDigits(searchQuery.toLowerCase()).trim();
        const cleanSearch = searchQueryLower.replace(/\D/g, '');

        const rawName = typeof user.name === 'string' ? user.name : '';
        const name = rawName.toLowerCase();
        const email = (user.email || '').toLowerCase();
        const id = normalizeDigits(String(user.id || '').toLowerCase());
        const mobile = normalizeDigits(String(user.mobileNumber || '').toLowerCase());
        const emergency = normalizeDigits(String(user.emergencyContact || '').toLowerCase());
        
        const cleanMobile = mobile.replace(/\D/g, '');
        const cleanEmergency = emergency.replace(/\D/g, '');
        
        const matchesSearch = searchQueryLower === '' || 
          name.includes(searchQueryLower) ||
          email.includes(searchQueryLower) ||
          id.includes(searchQueryLower) ||
          mobile.includes(searchQueryLower) ||
          emergency.includes(searchQueryLower) ||
          (cleanSearch !== '' && (
            cleanMobile.includes(cleanSearch) || 
            cleanEmergency.includes(cleanSearch) || 
            cleanSearch.includes(cleanMobile) || 
            cleanSearch.includes(cleanEmergency)
          ));
        
        return matchesSearch;
      } catch (err) {
        console.error("Search filter error:", err);
        return false;
      }
    });
  }, [localUsers, localAdmins, roleFilter, searchQuery]);

  const handleUserClick = (user: any) => {
    setSelectedUser(user);
    setView('USER_PROFILE');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0,
        delayChildren: 0
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: 'tween', duration: 0,
        stiffness: 300,
        damping: 25
      }
    }
  };

  return (
    <div className="pb-[60px] space-y-4">
      {/* Role Selector Tabs */}
      <div 
        className="bg-white dark:bg-theme-card p-1 rounded-[8px] shadow-sm h-14 relative flex items-center"
      >
        <div
          className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-[6px] shadow-lg transition-transform duration-300 ease-out z-0"
          style={{
            transform: roleFilter === 'USER' ? 'translateX(100%)' : 'translateX(0)',
            backgroundColor: primaryColor,
            boxShadow: `0 10px 15px -3px ${primaryColor}4d, 0 4px 6px -4px ${primaryColor}4d`
          }}
        />
        <div className="flex w-full h-full relative z-10 gap-1">
          <button
            onClick={() => setRoleFilter('ADMIN')}
            className={`flex-1 rounded-[6px] font-black text-[10px] uppercase tracking-widest transition-colors duration-300 flex items-center justify-center h-full ${
              roleFilter === 'ADMIN'
                ? 'text-white font-extrabold'
                : 'text-text-main hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            {t.ADMIN_LABEL} ({adminCount})
          </button>
          <button
            onClick={() => setRoleFilter('USER')}
            className={`flex-1 rounded-[6px] font-black text-[10px] uppercase tracking-widest transition-colors duration-300 flex items-center justify-center h-full ${
              roleFilter === 'USER'
                ? 'text-white font-extrabold'
                : 'text-text-main hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            {t.USER_LABEL} ({userCount})
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div 
        
        
        
        className="space-y-4"
      >
        <InputField 
          label="Search users..."
          name="search"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={<Search size={20} />}
          className="h-14"
        />

        {roleFilter !== null && (
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">
              {roleFilter === 'ADMIN' ? t.ADMIN_LABEL : t.USER_LABEL} Accounts
            </span>
            <span className="text-[10px] font-black text-white px-2 py-0.5 rounded-full" style={{ backgroundColor: primaryColor }}>
              {filteredUsers.length}
            </span>
          </div>
        )}
      </div>

      {/* Users List with Loading Indicator */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20 col-span-full">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent" style={{ borderLeftColor: primaryColor, borderBottomColor: primaryColor, borderRightColor: primaryColor }}></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {roleFilter === null ? (
            <div 
              className="text-center py-12 col-span-full"
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${primaryColor}1a`, color: primaryColor }}>
                <Shield size={32} />
              </div>
              <h3 className="text-lg font-bold text-text-main mb-1">{t.SELECT_ACCOUNT_TYPE}</h3>
              <p className="text-sm text-text-muted">
                {t.CHOOSE_ROLE_MESSAGE}
              </p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div 
              
              
              
              className="text-center py-12 col-span-full"
            >
              <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-text-muted">
                <User size={32} />
              </div>
              <h3 className="text-lg font-bold text-text-main mb-2">No Users Found</h3>
              <p className="text-sm text-text-muted">
                Try adjusting your search or add a new user.
              </p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                
                
                
                
                onClick={() => handleUserClick(user)}
                className="bg-white dark:bg-theme-card p-3 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden cursor-pointer group hover:shadow-md transition-all"
              >
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                  user.status === 'ENABLED' ? 'bg-green-500' : 
                  user.status === 'BLOCKED' ? 'bg-red-500' : 
                  'bg-gray-300'
                }`} />
                
                <div className="flex items-center gap-3 pl-2">
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center overflow-hidden shrink-0 border-2 border-white dark:border-gray-600 shadow-sm">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="text-md font-black text-gray-400 uppercase">
                        {String(user.name || '').charAt(0)}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black text-text-main truncate pr-2 uppercase">
                        {user.name}
                      </h3>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                        user.role === 'ADMIN' 
                          ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' 
                          : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-medium text-text-muted">
                      {user.id}
                    </span>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <div className={`w-2 h-2 rounded-full ${
                      user.status === 'ENABLED' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 
                      user.status === 'BLOCKED' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 
                      'bg-gray-300'
                    }`} />
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        confirmAction(`Are you sure you want to delete user ${user.name}?`, () => {
                          removeUser(user.id);
                          showFeedback(`User ${user.name} deleted successfully!`);
                        });
                      }}
                      className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default UserFilesList;
