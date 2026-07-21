import React from 'react';
import { useStore } from '../store';
import { Check, X } from 'lucide-react';

const AdminPendingUsers: React.FC = () => {
  const { users, approveUser, removeUser } = useStore();
  const pendingUsers = users.filter(u => u.status === 'PENDING');

  return (
    <div className="p-6">
      <h2 className="text-2xl font-black mb-4">Pending Users</h2>
      {pendingUsers.length === 0 ? (
        <p>No pending users.</p>
      ) : (
        <div className="space-y-4">
          {pendingUsers.map(user => (
            <div key={user.id} className="glass-card p-4 flex justify-between items-center">
              <div>
                <p className="font-bold">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
                <p className="text-[10px] text-gray-400 mt-1 uppercase font-black tracking-widest">
                  Registered: {user.registrationDate}
                </p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => approveUser(user.id)}
                  className="p-2 bg-green-500 text-white rounded"
                >
                  <Check size={16} />
                </button>
                <button 
                  onClick={() => removeUser(user.id)}
                  className="p-2 bg-red-500 text-white rounded"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPendingUsers;
