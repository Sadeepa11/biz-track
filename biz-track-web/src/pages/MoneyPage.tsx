import { useMemo } from 'react';
import type { Transaction, BusinessSettings } from '../types/biztrack.types';
import { MoneyIcon } from '../components/Icons';

interface MoneyPageProps {
  transactions: Transaction[];
  settings: BusinessSettings;
  onOpenIncomeDialog: () => void;
  onOpenExpenseDialog: () => void;
  onDeleteTransaction: (id: string) => void;
}

export function MoneyPage({
  transactions,
  settings,
  onOpenIncomeDialog,
  onOpenExpenseDialog,
  onDeleteTransaction,
}: MoneyPageProps) {
  const { totalIncome, totalExpense, balance } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    for (const t of transactions) {
      if (t.type === 'income') inc += Number(t.amount) || 0;
      else if (t.type === 'expense') exp += Number(t.amount) || 0;
    }
    return {
      totalIncome: inc,
      totalExpense: exp,
      balance: inc - exp,
    };
  }, [transactions]);

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions]);

  const fmt = (val: number) => {
    return `${settings.currency || 'LKR'} ${Number(val).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (d: string) => {
    if (!d) return 'Not set';
    const [y, m, day] = d.split('-').map(Number);
    return new Date(y, m - 1, day).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
  };

  return (
    <div className="space-y-5">
      {/* Heading */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[23px] font-bold text-[#153765]">Money Transactions</h2>
          <p className="text-[12px] text-[#71829e] mt-0.5">Keep track of your business finances</p>
        </div>
      </div>

      {/* Balance Card */}
      <div className="p-6 rounded-[19px] bg-gradient-to-br from-[#216ee2] to-[#124aab] text-white shadow-lg shadow-[#1769e829]">
        <small className="text-xs opacity-90 block font-medium">Account Balance</small>
        <strong className="block text-3xl sm:text-4xl font-extrabold tracking-tight mt-2.5 break-all">
          {fmt(balance)}
        </strong>
      </div>

      {/* Income / Expense Split Tiles */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-white border border-[#dbe9fa] shadow-xs">
          <small className="text-[11px] text-[#71829e] font-semibold block">Total Income</small>
          <strong className="block text-[#153765] text-base sm:text-lg font-bold mt-2 break-all">
            {fmt(totalIncome)}
          </strong>
        </div>
        <div className="p-3.5 rounded-2xl bg-white border border-[#dbe9fa] shadow-xs">
          <small className="text-[11px] text-[#71829e] font-semibold block">Total Expenses</small>
          <strong className="block text-[#153765] text-base sm:text-lg font-bold mt-2 break-all">
            {fmt(totalExpense)}
          </strong>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={onOpenIncomeDialog}
          className="py-3 px-4 rounded-xl bg-[#1769e8] hover:bg-[#1258c7] text-white text-xs font-bold shadow-md shadow-[#1769e829] transition-all cursor-pointer text-center"
        >
          + Add Income
        </button>
        <button
          onClick={onOpenExpenseDialog}
          className="py-3 px-4 rounded-xl bg-white hover:bg-[#edf5ff] text-[#1769e8] border border-[#1769e8] text-xs font-bold transition-all cursor-pointer text-center"
        >
          − Add Expense
        </button>
      </div>

      {/* Transaction History Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-[17px] font-bold text-[#153765]">Transaction History</h2>
          <small className="text-[11px] text-[#71829e] font-medium">
            {transactions.length} entries
          </small>
        </div>

        {sortedTransactions.length > 0 ? (
          <div className="bg-white border border-[#dbe9fa] rounded-2xl divide-y divide-[#edf2f9] overflow-hidden shadow-xs">
            {sortedTransactions.map((tx) => {
              const isIncome = tx.type === 'income';
              return (
                <div
                  key={tx.id}
                  className="flex items-center gap-3 p-3.5 sm:p-4 hover:bg-[#f6f9fe] transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#edf5ff] text-[#1769e8] flex items-center justify-center shrink-0">
                    <MoneyIcon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <b className="text-[13px] text-[#153765] font-bold block truncate">
                      {tx.description}
                    </b>
                    <small className="text-[11px] text-[#71829e] block mt-0.5">
                      {formatDate(tx.date)} · {isIncome ? 'Income' : 'Expense'}
                    </small>
                  </div>

                  <div className="text-right shrink-0">
                    <b className="block text-[13px] sm:text-[14px] text-[#153765] font-bold">
                      {isIncome ? '+' : '−'}
                      {fmt(tx.amount)}
                    </b>
                    <button
                      onClick={() => {
                        if (confirm(`Delete transaction "${tx.description}"?`)) {
                          onDeleteTransaction(tx.id);
                        }
                      }}
                      className="text-[11px] text-[#71829e] hover:text-[#c74855] transition-colors cursor-pointer pt-0.5"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 px-4 text-[#71829e] border border-dashed border-[#dbe9fa] rounded-2xl bg-white text-[13px]">
            No transactions yet. Add income or an expense to get started.
          </div>
        )}
      </div>
    </div>
  );
}

export default MoneyPage;
