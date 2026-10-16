import { QtyIcon, PersonIcon, PhoneIcon, LocationIcon, MapsIcon } from './Icons';
import type { Order } from '../types/biztrack.types';

interface OrderCardProps {
  order: Order;
  compact?: boolean;
  onToggleStatus?: (order: Order) => void;
  onEdit?: (order: Order) => void;
  onDelete?: (order: Order) => void;
}

export default function OrderCard({
  order,
  compact = false,
  onToggleStatus,
  onEdit,
  onDelete,
}: OrderCardProps) {
  const isDone = order.status === 'delivered';
  const mapsQuery = encodeURIComponent(order.address);

  return (
    <article className="border border-[#dbe9fa] rounded-2xl overflow-hidden mb-3.5 bg-white shadow-xs hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-center gap-2.5 px-4 py-3 bg-[#f2f7ff] border-b border-[#e5effc]">
        <strong className="text-[15px] font-bold text-[#153765] truncate">
          {order.customer}
        </strong>
        <span
          className={`text-[11px] font-bold px-2.5 py-1 rounded-lg shrink-0 whitespace-nowrap ${
            isDone ? 'bg-[#edf2fa] text-[#4a6a93]' : 'bg-[#e2efff] text-[#1769e8]'
          }`}
        >
          {isDone ? 'Delivered' : 'Pending'} · #{order.id.slice(-5)}
        </span>
      </div>

      {/* Body Details */}
      <div className="p-4 pt-1">
        <div className="flex items-center gap-2.5 py-2.5 border-b border-[#edf2f9] text-[12px]">
          <QtyIcon className="w-4 h-4 text-[#1769e8] shrink-0" />
          <span className="text-[#71829e] flex-1">Quantity</span>
          <b className="text-[#153765] font-semibold">{order.quantity} items</b>
        </div>

        <div className="flex items-center gap-2.5 py-2.5 border-b border-[#edf2f9] text-[12px]">
          <PersonIcon className="w-4 h-4 text-[#1769e8] shrink-0" />
          <span className="text-[#71829e] flex-1">Customer</span>
          <b className="text-[#153765] font-semibold truncate max-w-[60%]">{order.customer}</b>
        </div>

        <div className="flex items-center gap-2.5 py-2.5 border-b border-[#edf2f9] text-[12px]">
          <PhoneIcon className="w-4 h-4 text-[#1769e8] shrink-0" />
          <span className="text-[#71829e] flex-1">Phone</span>
          <b className="text-[#153765] font-semibold">{order.phone}</b>
        </div>

        <div className="flex items-start gap-2.5 py-2.5 text-[12px]">
          <LocationIcon className="w-4 h-4 text-[#1769e8] shrink-0 mt-0.5" />
          <span className="text-[#71829e] flex-1">Address</span>
          <b className="text-[#153765] font-semibold text-right max-w-[65%] break-words">
            {order.address}
          </b>
        </div>

        {/* Action Links */}
        <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-[#edf2f9]">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-[#1769e8] text-[#1769e8] hover:bg-[#edf5ff] rounded-xl py-2 px-3 text-[12px] font-bold inline-flex items-center justify-center gap-1.5 transition-colors"
          >
            <MapsIcon className="w-4 h-4" />
            <span>Google Maps</span>
          </a>

          <a
            href={`tel:${encodeURIComponent(order.phone)}`}
            className="border border-[#dbe9fa] bg-[#f6f9fe] hover:bg-[#edf5ff] text-[#153765] rounded-xl py-2 px-3 text-[12px] font-bold inline-flex items-center justify-center gap-1.5 transition-colors"
          >
            <PhoneIcon className="w-4 h-4" />
            <span>Call</span>
          </a>
        </div>

        {/* Full Action Buttons */}
        {!compact && (
          <div className="flex flex-wrap gap-2 mt-3 pt-2.5 border-t border-[#edf2f9]">
            <button
              onClick={() => onToggleStatus?.(order)}
              className={`flex-1 py-2 px-3 rounded-xl text-[12px] font-bold transition-colors cursor-pointer ${
                isDone
                  ? 'border border-[#dbe9fa] bg-[#f6f9fe] text-[#153765] hover:bg-[#edf5ff]'
                  : 'bg-[#1769e8] hover:bg-[#1258c7] text-white'
              }`}
            >
              {isDone ? 'Mark Pending' : '✓ Mark Delivered'}
            </button>

            <button
              onClick={() => onEdit?.(order)}
              className="border border-[#1769e8] text-[#1769e8] hover:bg-[#edf5ff] py-2 px-4 rounded-xl text-[12px] font-bold transition-colors cursor-pointer"
            >
              Edit
            </button>

            <button
              onClick={() => onDelete?.(order)}
              className="border border-[#f4d2d8] bg-[#fff8f9] hover:bg-[#ffebee] text-[#c74855] py-2 px-3 rounded-xl text-[12px] font-bold transition-colors cursor-pointer"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
