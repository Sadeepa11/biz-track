import type { BusinessSettings } from '../types/biztrack.types';

interface HeaderProps {
  activeTab?: 'home' | 'orders' | 'money' | 'settings';
  settings: BusinessSettings;
  isBackendConnected?: boolean;
  onOpenOrderDialog?: () => void;
  onOpenTransactionDialog?: (type: 'income' | 'expense') => void;
}

export default function Header({
  settings,
}: HeaderProps) {
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

  return (
    /* --- Mobile View Top Header Only (Hidden on Desktop) --- */
    <header className="md:hidden flex justify-between items-center gap-2.5 mb-6">
      <div className="flex flex-col min-w-0">
        <img
          src="/BizTrackGrowthLogoHorizontal.png"
          alt="Biz Track"
          className="h-10 w-auto object-contain max-w-[175px]"
        />
        {settings.businessName ? (
          <p className="text-[10px] text-[#71829e] mt-0.5 truncate font-medium">
            {settings.businessName}
          </p>
        ) : null}
      </div>

      <div className="bg-[#f2f7ff] border border-[#d5e6ff] px-2.5 py-2 rounded-xl text-left shrink-0">
        <small className="block text-[#6a80a0] text-[9px] uppercase tracking-wider font-semibold">
          Next delivery batch
        </small>
        <strong className="block text-[#153765] text-[12px] font-bold">
          {formatDate(settings.nextBatch)}
        </strong>
        <span className="block text-[#1769e8] text-[10px] font-medium">
          {getWeekday(settings.nextBatch)}
        </span>
      </div>
    </header>
  );
}
