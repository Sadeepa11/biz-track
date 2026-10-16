import { HomeIcon, OrdersIcon, MoneyIcon, SettingsIcon } from './Icons';

interface BottomNavProps {
  activeTab: 'home' | 'orders' | 'money' | 'settings';
  setActiveTab: (tab: 'home' | 'orders' | 'money' | 'settings') => void;
}

export default function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
  const tabs = [
    { key: 'home' as const, label: 'Home', icon: HomeIcon },
    { key: 'orders' as const, label: 'Orders', icon: OrdersIcon },
    { key: 'money' as const, label: 'Money', icon: MoneyIcon },
    { key: 'settings' as const, label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#dbe9fa] grid grid-cols-4 px-2 py-2 pb-[max(8px,env(safe-area-inset-bottom))]"
      aria-label="App navigation"
    >
      {tabs.map((tab) => {
        const active = activeTab === tab.key;
        const Icon = tab.icon;
        return (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center justify-center gap-1 py-1.5 px-1 rounded-xl text-[10px] font-semibold transition-colors cursor-pointer ${
              active
                ? 'text-[#1769e8] bg-[#f1f7ff]'
                : 'text-[#8a99b0] hover:text-[#203653]'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
