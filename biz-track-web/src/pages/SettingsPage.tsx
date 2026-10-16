import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import type { BusinessSettings, Currency } from '../types/biztrack.types';
import { DownloadIcon, TrashIcon } from '../components/Icons';

interface SettingsPageProps {
  settings: BusinessSettings;
  onSaveSettings: (settings: BusinessSettings) => Promise<void>;
  onExportBackup: () => void;
  onResetData: () => Promise<void>;
}

export function SettingsPage({
  settings,
  onSaveSettings,
  onExportBackup,
  onResetData,
}: SettingsPageProps) {
  const [businessName, setBusinessName] = useState(settings.businessName);
  const [nextBatch, setNextBatch] = useState(settings.nextBatch);
  const [currency, setCurrency] = useState(settings.currency);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setBusinessName(settings.businessName);
    setNextBatch(settings.nextBatch);
    setCurrency(settings.currency);
  }, [settings]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSaveSettings({
        businessName: businessName.trim(),
        nextBatch,
        currency,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetConfirm = async () => {
    if (
      confirm(
        'Delete ALL orders, transactions, and settings from this browser? This cannot be undone.'
      )
    ) {
      await onResetData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[23px] font-bold text-[#153765]">Settings</h2>
          <p className="text-[12px] text-[#71829e] mt-0.5">Customize Biz Track preferences & data</p>
        </div>
      </div>

      {/* Two-Column Layout on Desktop: Left side = Business Preferences, Right side = Backup & Danger Zone */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Side (Next to Sidebar): Business Preferences */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#dbe9fa] shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#f1f6fd]">
            <h3 className="text-[16px] font-bold text-[#153765]">
              Business Preferences
            </h3>
            <span className="text-[11px] text-[#71829e]">General settings</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#526783] mb-1.5">
                Business Name
              </label>
              <input
                type="text"
                maxLength={60}
                placeholder="My Business"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#dbe9fa] text-[#203653] bg-white placeholder-[#8a99b0] text-sm focus:outline-none focus:ring-2 focus:ring-[#1769e8]/30 focus:border-[#1769e8] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#526783] mb-1.5">
                Next Batch Date
              </label>
              <input
                type="date"
                required
                value={nextBatch}
                onChange={(e) => setNextBatch(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#dbe9fa] text-[#203653] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1769e8]/30 focus:border-[#1769e8] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#526783] mb-1.5">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#dbe9fa] text-[#203653] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1769e8]/30 focus:border-[#1769e8] transition-all"
              >
                <option value="LKR">LKR — Sri Lankan Rupee</option>
                <option value="USD">USD — US Dollar</option>
                <option value="INR">INR — Indian Rupee</option>
                <option value="EUR">EUR — Euro</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3 px-4 rounded-xl bg-[#1769e8] hover:bg-[#1258c7] text-white text-xs font-bold shadow-md shadow-[#1769e829] transition-all cursor-pointer disabled:opacity-50 mt-3"
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        </div>

        {/* Right Side: Bottom Two Sections (Backup & Data + Danger Zone) */}
        <div className="space-y-6">
          {/* Backup & Data Card */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#dbe9fa] shadow-xs space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-[#f1f6fd]">
              <h3 className="text-[16px] font-bold text-[#153765]">Backup & Data</h3>
              <span className="text-[11px] text-[#71829e]">Export & Sync</span>
            </div>

            <button
              type="button"
              onClick={onExportBackup}
              className="w-full py-3 px-4 rounded-xl bg-white hover:bg-[#edf5ff] text-[#1769e8] border border-[#1769e8] text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <DownloadIcon size={16} />
              <span>Download Data Backup (JSON)</span>
            </button>

            <p className="text-[11px] text-[#71829e] leading-relaxed">
              Orders, transactions and settings are saved locally and synced with the cloud backend. Export a backup anytime before clearing your browser.
            </p>
          </div>

          {/* Danger Zone Card */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#f5d0d6] shadow-xs space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-[#fceced]">
              <h3 className="text-[16px] font-bold text-[#c74855]">Danger Zone</h3>
              <span className="text-[11px] text-[#e06674]">Permanent action</span>
            </div>

            <button
              type="button"
              onClick={handleResetConfirm}
              className="w-full py-3 px-4 rounded-xl bg-[#fff8f9] hover:bg-[#ffeef1] text-[#c74855] border border-[#f4d2d8] text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <TrashIcon size={16} />
              <span>Delete All App Data</span>
            </button>

            <p className="text-[11px] text-[#71829e] leading-relaxed">
              This permanently resets all saved orders, customer details, and transaction history.
            </p>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-[#71829e] text-center pt-4">
        Biz Track · General business management
      </p>
    </div>
  );
}

export default SettingsPage;
