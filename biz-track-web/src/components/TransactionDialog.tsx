import { useState } from 'react';
import type { FormEvent } from 'react';
import type { TransactionType } from '../types/biztrack.types';
import { IconClose } from './Icons';

interface TransactionDialogProps {
  isOpen: boolean;
  type: TransactionType;
  currency: string;
  onClose: () => void;
  onSubmit: (data: { type: TransactionType; description: string; amount: number; date: string }) => void;
}

const todayDate = (): string => {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
};

export function TransactionDialog({
  isOpen,
  type,
  onClose,
  onSubmit,
}: TransactionDialogProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayDate());

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!description.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;

    onSubmit({
      type,
      description: description.trim(),
      amount: parsedAmount,
      date: date || todayDate(),
    });

    setDescription('');
    setAmount('');
    onClose();
  };

  const isIncome = type === 'income';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#10284478] backdrop-blur-xs">
      <div className="bg-white border border-[#dbe9fa] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#dbe9fa] bg-white sticky top-0">
          <h3 className="font-bold text-[#153765] text-lg">
            {isIncome ? 'Add Income' : 'Add Expense'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#edf5ff] text-[#1769e8] hover:bg-[#dbe9fa] flex items-center justify-center font-bold transition-colors cursor-pointer"
            aria-label="Close"
          >
            <IconClose className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#526783] mb-1.5">
              Description
            </label>
            <input
              type="text"
              required
              autoFocus
              maxLength={120}
              placeholder={isIncome ? 'e.g. Customer payment, Advance' : 'e.g. Packaging, Transport, Raw materials'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#dbe9fa] text-[#203653] bg-white placeholder-[#8a99b0] text-sm focus:outline-none focus:ring-2 focus:ring-[#1769e8]/30 focus:border-[#1769e8]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#526783] mb-1.5">
                Amount
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#dbe9fa] text-[#203653] bg-white placeholder-[#8a99b0] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#1769e8]/30 focus:border-[#1769e8]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#526783] mb-1.5">
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#dbe9fa] text-[#203653] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1769e8]/30 focus:border-[#1769e8]"
              />
            </div>
          </div>

          <div className="flex gap-2.5 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-[#dbe9fa] text-[#153765] bg-[#f6f9fe] hover:bg-[#edf5ff] text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 py-2.5 px-4 rounded-xl text-white text-xs font-bold shadow-sm transition-all cursor-pointer ${
                isIncome
                  ? 'bg-[#1769e8] hover:bg-[#1258c7]'
                  : 'bg-[#c74855] hover:bg-[#a63b46]'
              }`}
            >
              {isIncome ? 'Save Income' : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TransactionDialog;
