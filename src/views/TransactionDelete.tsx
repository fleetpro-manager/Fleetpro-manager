import React, { useState, useMemo } from 'react';

import { 
  Trash2, 
  Edit2, 
  Search, 
  Filter, 
  ArrowLeft, 
  Calendar, 
  DollarSign, 
  Tag, 
  User, 
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Save,
  X
} from 'lucide-react';
import { useStore } from '@/store';
import { Payment } from '@/types';
import InputField from '@/components/InputField';

import { getContrastColor } from '../utils/colorUtils';

const TransactionDelete: React.FC = () => {
  const { 
    payments, 
    removePayment, 
    updatePayment, 
    setView, 
    appThemeMode, 
    backgroundColor, 
    wallpaper,
    confirmAction,
    theme,
    isDarkMode: storeIsDarkMode
  } = useStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'RECEIVED' | 'PENDING'>('ALL');
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [editForm, setEditForm] = useState<Partial<Payment>>({});

  const isDarkMode = storeIsDarkMode || theme === 'night-mode' || appThemeMode === 'dark';
  const textColor = getContrastColor(backgroundColor || (isDarkMode ? '#111827' : '#f9fafb'));

  const filteredTransactions = useMemo(() => {
    return payments
      .filter(p => {
        const matchesSearch = 
          (p.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.details?.serviceName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
          (p.details?.bankName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
          (p.details?.walletNumber?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
          p.amount.toString().includes(searchQuery);
        
        const matchesStatus = filterStatus === 'ALL' || p.status === filterStatus;
        
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [payments, searchQuery, filterStatus]);

  const handleDelete = (id: string) => {
    confirmAction('Are you sure you want to delete this transaction? This will revert any paid amounts to pending balances.', () => {
      removePayment(id);
    });
  };

  const handleEdit = (payment: Payment) => {
    setEditingPayment(payment);
    setEditForm({ ...payment });
  };

  const handleUpdate = () => {
    if (editingPayment && editForm.amount !== undefined) {
      const oldAmount = editingPayment.amount;
      const newAmount = editForm.amount;
      
      let updatedDetails = editForm.details;
      if (oldAmount !== newAmount && editForm.details?.pendingItems && oldAmount > 0) {
        const ratio = newAmount / oldAmount;
        const newPendingItems = { ...editForm.details.pendingItems };
        Object.keys(newPendingItems).forEach(tripId => {
          newPendingItems[tripId] = newPendingItems[tripId] * ratio;
        });
        updatedDetails = { ...editForm.details, pendingItems: newPendingItems };
      }
      
      updatePayment({ ...editingPayment, ...editForm, details: updatedDetails } as Payment);
      setEditingPayment(null);
      setEditForm({});
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Search and Filter */}
      <div className="px-1 pt-4 pb-2 space-y-4">
        <div className="mb-2">
          <InputField
            name="search"
            label="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search size={18} />}
            className="h-14"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {(['ALL', 'RECEIVED', 'PENDING'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                filterStatus === status 
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' 
                  : 'bg-theme-card text-text-muted hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction List */}
      <div className="flex-1 overflow-y-auto px-1 py-4 space-y-3 pb-[60px]">
        {filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-text-muted opacity-50">
            <AlertCircle size={48} className="mb-4" />
            <p className="text-xs font-black uppercase tracking-widest">No Transactions Found</p>
          </div>
        ) : (
          filteredTransactions.map((payment) => (
            <div
              
              
              
              key={payment.id}
              className="bg-theme-card px-2 py-3 rounded-[8px] shadow-sm border border-black/5 dark:border-white/5 group"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-[8px] ${
                    payment.type === 'RECEIVED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                  }`}>
                    {payment.type === 'RECEIVED' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                  </div>
                  <div>
                    <p className="text-xs font-black text-text-main uppercase tracking-widest">{payment.category}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock size={10} className="text-text-muted" />
                      <p className="text-[10px] font-bold text-text-muted">
                        {new Date(payment.date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-black ${
                    payment.type === 'RECEIVED' ? 'text-emerald-500' : 'text-rose-500'
                  }`}>
                    {payment.type === 'RECEIVED' ? '+' : '-'}{payment.amount.toLocaleString()}
                  </p>
                  <p className="text-[8px] font-bold text-text-muted uppercase tracking-tighter mt-1">{payment.type}</p>
                </div>
              </div>

              {payment.details && (
                <div className="text-[10px] font-medium text-text-muted bg-black/5 dark:bg-white/5 p-2 rounded-[4px] mb-3 italic space-y-1">
                  {payment.details.serviceName && <p>Service: {payment.details.serviceName}</p>}
                  {payment.details.bankName && <p>Bank: {payment.details.bankName}</p>}
                  {payment.details.walletNumber && <p>Wallet: {payment.details.walletNumber}</p>}
                  {!payment.details.serviceName && !payment.details.bankName && !payment.details.walletNumber && Object.keys(payment.details).length > 0 && (
                    <p>Details: {JSON.stringify(payment.details)}</p>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-3 border-t border-black/5 dark:border-white/5">
                <button
                  onClick={() => handleEdit(payment)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-500/10 text-blue-500 rounded-[6px] text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all"
                >
                  <Edit2 size={12} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(payment.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-rose-500/10 text-rose-500 rounded-[6px] text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all"
                >
                  <Trash2 size={12} />
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Modal */}
      <>
        {editingPayment && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
              
              
              
              onClick={() => setEditingPayment(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <div
              
              
              
              className="relative w-full max-w-md bg-theme-card rounded-[12px] shadow-2xl overflow-hidden"
            >
              <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-black uppercase tracking-widest text-text-main">Edit Transaction</h3>
                  <button onClick={() => setEditingPayment(null)} className="text-text-muted hover:text-text-main">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block mb-1.5 ml-1">Amount</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                      <input
                        type="number"
                        value={editForm.amount}
                        onChange={(e) => setEditForm({ ...editForm, amount: parseFloat(e.target.value) || 0 })}
                        className="w-full pl-10 pr-4 py-3 bg-black/5 dark:bg-white/5 rounded-[8px] text-sm font-bold text-text-main focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block mb-1.5 ml-1">Category</label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                      <input
                        type="text"
                        value={editForm.category}
                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-black/5 dark:bg-white/5 rounded-[8px] text-sm font-bold text-text-main focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block mb-1.5 ml-1">Service Name / Details</label>
                    <textarea
                      value={editForm.details?.serviceName || ''}
                      onChange={(e) => setEditForm({ 
                        ...editForm, 
                        details: { ...editForm.details, serviceName: e.target.value } 
                      })}
                      rows={3}
                      className="w-full p-4 bg-black/5 dark:bg-white/5 rounded-[8px] text-sm font-bold text-text-main focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2 pb-[60px]">
                  <button
                    onClick={() => setEditingPayment(null)}
                    className="flex-1 py-4 bg-black/5 dark:bg-white/5 text-text-muted rounded-[8px] text-[10px] font-black uppercase tracking-widest hover:bg-black/10 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdate}
                    className="flex-1 py-4 bg-blue-500 text-white rounded-[8px] text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Save size={14} />
                    Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    </div>
  );
};

export default TransactionDelete;
