import { HomeIcon, OrdersIcon, MoneyIcon, SettingsIcon } from './Icons';
import type { BusinessSettings } from '../types/biztrack.types';

interface SidebarProps {
  activeTab: 'home' | 'orders' | 'money' | 'settings';
  setActiveTab: (tab: 'home' | 'orders' | 'money' | 'settings') => void;
  settings: BusinessSettings;
  pendingOrdersCount: number;
  isBackendConnected: boolean;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  settings,
  pendingOrdersCount,
  isBackendConnected,
}: SidebarProps) {
  const formatDate = (d: string) => {
    if (!d) return 'Not set';
    const [y, m, day] = d.split('-').map(Number);
    return new Date(y, m - 1, day).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
  };

  const getWeekday = (d: string) => {
    if (!d) return '';
    const [y, m, day] = d.split('-').map(Number);
    return new Date(y, m - 1, day).toLocaleDateString('en-GB', { weekday: 'long' });
  };

  const navItems = [
    { key: 'home' as const, label: 'Home', icon: HomeIcon, sub: 'Weekly Overview' },
    { key: 'orders' as const, label: 'Orders', icon: OrdersIcon, sub: 'Customer Queue', badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined },
    { key: 'money' as const, label: 'Money', icon: MoneyIcon, sub: 'Income & Expense' },
    { key: 'settings' as const, label: 'Settings', icon: SettingsIcon, sub: 'Preferences & Data' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-[260px] bg-white border-r border-[#dbe9fa] h-screen shrink-0 select-none overflow-hidden">
      {/* Top Brand */}
      <div className="p-5 border-b border-[#edf5ff]">
        <div className="flex flex-col">
          <img
            src="/BizTrackGrowthLogoHorizontal.png"
            alt="Biz Track"
            className="h-11 w-auto object-contain max-w-[195px] self-start"
          />
          {settings.businessName ? (
            <p className="text-[11px] text-[#71829e] mt-1.5 truncate font-medium">
              {settings.businessName}
            </p>
          ) : null}
        </div>

        {/* Next Batch Box */}
        <div className="mt-4 bg-[#f2f7ff] border border-[#d5e6ff] p-3 rounded-xl">
          <span className="text-[10px] text-[#6a80a0] block uppercase tracking-wider font-semibold">
            Next Delivery Batch
          </span>
          <strong className="text-[13px] text-[#153765] block mt-0.5">
            {formatDate(settings.nextBatch)}
          </strong>
          <span className="text-[11px] text-[#1769e8] font-medium block">
            {getWeekday(settings.nextBatch)}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3.5 space-y-1.5 overflow-hidden">
        {navItems.map((item) => {
          const active = activeTab === item.key;
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-left transition-all cursor-pointer ${
                active
                  ? 'bg-[#edf5ff] text-[#1769e8] font-bold shadow-xs'
                  : 'text-[#5d7291] hover:bg-[#f8faff] hover:text-[#153765]'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-[#1769e8]' : 'text-[#71829e]'}`} />
                <div className="min-w-0">
                  <div className="text-[13px] leading-tight font-semibold">{item.label}</div>
                  <div className="text-[10px] text-[#71829e] font-normal truncate">{item.sub}</div>
                </div>
              </div>

              {item.badge !== undefined && (
                <span className="bg-[#1769e8] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-[#edf5ff] bg-[#fafcff]">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isBackendConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
            }`}
          />
          <span className="text-[11px] text-[#71829e]">
            {isBackendConnected ? 'Backend Connected' : 'Local Browser Mode'}
          </span>
        </div>
      </div>
    </aside>
  );
}
