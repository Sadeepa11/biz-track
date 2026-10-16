import type { HTMLAttributes } from 'react';

export interface IconProps extends HTMLAttributes<HTMLSpanElement> {
  size?: number | string;
}

const baseClasses = 'inline-flex items-center justify-center leading-none select-none shrink-0';

// 🏠 Home Icon
export function HomeIcon({ size, style, className = '', ...props }: IconProps) {
  return (
    <span
      role="img"
      aria-label="home"
      style={{ fontSize: size || undefined, ...style }}
      className={`${baseClasses} text-[19px] ${className}`}
      {...props}
    >
      🏠
    </span>
  );
}

// 📋 Orders Icon
export function OrdersIcon({ size, style, className = '', ...props }: IconProps) {
  return (
    <span
      role="img"
      aria-label="orders"
      style={{ fontSize: size || undefined, ...style }}
      className={`${baseClasses} text-[19px] ${className}`}
      {...props}
    >
      📋
    </span>
  );
}

// 💰 Money Icon
export function MoneyIcon({ size, style, className = '', ...props }: IconProps) {
  return (
    <span
      role="img"
      aria-label="money"
      style={{ fontSize: size || undefined, ...style }}
      className={`${baseClasses} text-[19px] ${className}`}
      {...props}
    >
      💰
    </span>
  );
}

// ⚙️ Settings Icon
export function SettingsIcon({ size, style, className = '', ...props }: IconProps) {
  return (
    <span
      role="img"
      aria-label="settings"
      style={{ fontSize: size || undefined, ...style }}
      className={`${baseClasses} text-[19px] ${className}`}
      {...props}
    >
      ⚙️
    </span>
  );
}

// 📦 Qty Icon
export function QtyIcon({ size, style, className = '', ...props }: IconProps) {
  return (
    <span
      role="img"
      aria-label="quantity"
      style={{ fontSize: size || undefined, ...style }}
      className={`${baseClasses} text-[18px] ${className}`}
      {...props}
    >
      📦
    </span>
  );
}

// 🚚 Delivered Icon
export function DeliveredIcon({ size, style, className = '', ...props }: IconProps) {
  return (
    <span
      role="img"
      aria-label="delivered"
      style={{ fontSize: size || undefined, ...style }}
      className={`${baseClasses} text-[18px] ${className}`}
      {...props}
    >
      🚚
    </span>
  );
}

// 📍 Location Icon
export function LocationIcon({ size, style, className = '', ...props }: IconProps) {
  return (
    <span
      role="img"
      aria-label="location"
      style={{ fontSize: size || undefined, ...style }}
      className={`${baseClasses} text-[18px] ${className}`}
      {...props}
    >
      📍
    </span>
  );
}

// 👤 Customer / Person Icon
export function PersonIcon({ size, style, className = '', ...props }: IconProps) {
  return (
    <span
      role="img"
      aria-label="customer"
      style={{ fontSize: size || undefined, ...style }}
      className={`${baseClasses} text-[17px] ${className}`}
      {...props}
    >
      👤
    </span>
  );
}

// 📞 Phone Icon
export function PhoneIcon({ size, style, className = '', ...props }: IconProps) {
  return (
    <span
      role="img"
      aria-label="phone"
      style={{ fontSize: size || undefined, ...style }}
      className={`${baseClasses} text-[17px] ${className}`}
      {...props}
    >
      📞
    </span>
  );
}

// 🗺️ Maps Icon
export function MapsIcon({ size, style, className = '', ...props }: IconProps) {
  return (
    <span
      role="img"
      aria-label="maps"
      style={{ fontSize: size || undefined, ...style }}
      className={`${baseClasses} text-[16px] ${className}`}
      {...props}
    >
      🗺️
    </span>
  );
}

// 📊 Logo Icon
export function LogoIcon({ size, style, className = '', ...props }: IconProps) {
  return (
    <span
      role="img"
      aria-label="logo"
      style={{ fontSize: size || undefined, ...style }}
      className={`${baseClasses} text-[22px] ${className}`}
      {...props}
    >
      📊
    </span>
  );
}

// ➕ Plus Icon
export function PlusIcon({ size, style, className = '', ...props }: IconProps) {
  return (
    <span
      role="img"
      aria-label="plus"
      style={{ fontSize: size || undefined, ...style }}
      className={`${baseClasses} text-[15px] font-bold ${className}`}
      {...props}
    >
      +
    </span>
  );
}

// 🗑️ Trash Icon
export function TrashIcon({ size, style, className = '', ...props }: IconProps) {
  return (
    <span
      role="img"
      aria-label="delete"
      style={{ fontSize: size || undefined, ...style }}
      className={`${baseClasses} text-[16px] ${className}`}
      {...props}
    >
      🗑️
    </span>
  );
}

// ✓ Check Icon
export function CheckIcon({ size, style, className = '', ...props }: IconProps) {
  return (
    <span
      role="img"
      aria-label="check"
      style={{ fontSize: size || undefined, ...style }}
      className={`${baseClasses} text-[16px] font-bold ${className}`}
      {...props}
    >
      ✓
    </span>
  );
}

// ⏱️ Clock Icon
export function ClockIcon({ size, style, className = '', ...props }: IconProps) {
  return (
    <span
      role="img"
      aria-label="clock"
      style={{ fontSize: size || undefined, ...style }}
      className={`${baseClasses} text-[16px] ${className}`}
      {...props}
    >
      ⏱️
    </span>
  );
}

// 🔍 Search Icon
export function SearchIcon({ size, style, className = '', ...props }: IconProps) {
  return (
    <span
      role="img"
      aria-label="search"
      style={{ fontSize: size || undefined, ...style }}
      className={`${baseClasses} text-[15px] ${className}`}
      {...props}
    >
      🔍
    </span>
  );
}

// ✕ Close Icon
export function CloseIcon({ size, style, className = '', ...props }: IconProps) {
  return (
    <span
      role="img"
      aria-label="close"
      style={{ fontSize: size || undefined, ...style }}
      className={`${baseClasses} text-[15px] font-bold ${className}`}
      {...props}
    >
      ✕
    </span>
  );
}

// 💾 Download Icon
export function DownloadIcon({ size, style, className = '', ...props }: IconProps) {
  return (
    <span
      role="img"
      aria-label="download"
      style={{ fontSize: size || undefined, ...style }}
      className={`${baseClasses} text-[16px] ${className}`}
      {...props}
    >
      💾
    </span>
  );
}

// Aliases for unified mobile-web compatibility
export const IconLogo = LogoIcon;
export const IconHome = HomeIcon;
export const IconOrders = OrdersIcon;
export const IconMoney = MoneyIcon;
export const IconSettings = SettingsIcon;
export const IconQty = QtyIcon;
export const IconDelivered = DeliveredIcon;
export const IconLocation = LocationIcon;
export const IconCustomer = PersonIcon;
export const IconPerson = PersonIcon;
export const IconPhone = PhoneIcon;
export const IconMaps = MapsIcon;
export const IconPlus = PlusIcon;
export const IconTrash = TrashIcon;
export const IconCheck = CheckIcon;
export const IconClock = ClockIcon;
export const IconSearch = SearchIcon;
export const IconClose = CloseIcon;
export const IconDownload = DownloadIcon;
