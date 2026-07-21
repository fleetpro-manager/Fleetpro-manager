import React, { useState } from 'react';
import { useStore } from '../store';


const UserAccountResetView: React.FC = () => {
  const { users, setView, showFeedback } = useStore();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const toggleUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const resetSelectedUsers = () => {
    showFeedback(`Accounts reset for ${selectedUsers.length} users successfully!`);
    setSelectedUsers([]);
  };

  const resetUserAccount = (userId: string) => {
    const user = users.find(u => u.id === userId);
    showFeedback(`Account reset for ${user?.name || userId} successfully!`);
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
        {users.map(user => (
          <div 
            key={user.id} 
            
            className="flex items-center justify-between p-5 reset-option-card rounded-[8px] min-h-[80px]"
          >
            <div className="flex items-center gap-4">
              <input 
                type="checkbox" 
                checked={selectedUsers.includes(user.id)}
                onChange={() => toggleUser(user.id)}
                className="w-5 h-5"
                style={{ accentColor: 'var(--success)' }}
              />
              <div className="flex flex-col">
                <span className="font-bold text-sm text-text-main">{user.name || 'Unknown User'}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">ID: {user.id}</span>
              </div>
            </div>
            <button
              onClick={() => resetUserAccount(user.id)}
              className="px-4 py-2 text-white font-black rounded-[8px] transition-all uppercase tracking-widest text-xs"
              style={{ background: 'var(--danger)' }}
            >
              Reset
            </button>
          </div>
        ))}
      </div>

      <div  className="flex gap-4">
        <button
          onClick={() => setView('RESET_BREAKDOWN')}
          className="flex-1 py-4 bg-gray-500 text-white font-black rounded-[8px] hover:bg-gray-600 transition-all uppercase tracking-widest"
        >
          Back
        </button>
        <button
          onClick={resetSelectedUsers}
          disabled={selectedUsers.length === 0}
          className="flex-1 py-4 text-white font-black rounded-[8px] transition-all uppercase tracking-widest disabled:opacity-50"
          style={{ background: 'var(--danger)' }}
        >
          Reset Selected ({selectedUsers.length})
        </button>
      </div>
    </div>
  );
};

export default UserAccountResetView;
