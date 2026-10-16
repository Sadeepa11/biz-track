import { useEffect, useState } from 'react';
import type { Order } from '../types/biztrack.types';

interface OrderDialogProps {
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
  onSave: (orderData: Omit<Order, 'id'> & { id?: string }) => void;
}

const todayDate = (): string => {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
};

export default function OrderDialog({
  isOpen,
  order,
  onClose,
  onSave,
}: OrderDialogProps) {
  const [customer, setCustomer] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [date, setDate] = useState(todayDate());

  useEffect(() => {
    if (order) {
      setCustomer(order.customer);
      setPhone(order.phone);
      setAddress(order.address);
      setQuantity(String(order.quantity));
      setDate(order.date || todayDate());
    } else {
      setCustomer('');
      setPhone('');
      setAddress('');
      setQuantity('1');
      setDate(todayDate());
    }
  }, [order, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer.trim() || !phone.trim() || !address.trim() || Number(quantity) < 1) {
      return;
    }
    onSave({
      id: order?.id,
      customer: customer.trim(),
      phone: phone.trim(),
      address: address.trim(),
      quantity: Number(quantity),
      date,
      status: order?.status || 'pending',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs">
      <div className="bg-white border border-[#dbe9fa] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#dbe9fa] bg-[#fafcff]">
          <h3 className="text-[17px] font-bold text-[#153765]">
            {order ? 'Edit Order' : 'Add Order'}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#edf5ff] text-[#1769e8] font-bold flex items-center justify-center hover:bg-[#dbe9fa] transition-colors cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          <div>
            <label className="block text-[12px] font-semibold text-[#526783] mb-1.5">
              Customer Name
            </label>
            <input
              type="text"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              required
              maxLength={90}
              placeholder="Customer Name"
              className="w-full px-3.5 py-2.5 border border-[#dbe9fa] rounded-xl text-[13px] text-[#203653] focus:border-[#1769e8] focus:ring-2 focus:ring-[#1769e8]/15 outline-none"
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#526783] mb-1.5">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              maxLength={30}
              placeholder="e.g. 077 123 4567"
              className="w-full px-3.5 py-2.5 border border-[#dbe9fa] rounded-xl text-[13px] text-[#203653] focus:border-[#1769e8] focus:ring-2 focus:ring-[#1769e8]/15 outline-none"
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#526783] mb-1.5">
              Delivery Address
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              maxLength={250}
              rows={2}
              placeholder="e.g. 45 Galle Road, Colombo 03"
              className="w-full px-3.5 py-2.5 border border-[#dbe9fa] rounded-xl text-[13px] text-[#203653] focus:border-[#1769e8] focus:ring-2 focus:ring-[#1769e8]/15 outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-semibold text-[#526783] mb-1.5">
                Quantity (items)
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 border border-[#dbe9fa] rounded-xl text-[13px] text-[#203653] focus:border-[#1769e8] focus:ring-2 focus:ring-[#1769e8]/15 outline-none"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#526783] mb-1.5">
                Order Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 border border-[#dbe9fa] rounded-xl text-[13px] text-[#203653] focus:border-[#1769e8] focus:ring-2 focus:ring-[#1769e8]/15 outline-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex gap-2.5 pt-3 border-t border-[#edf2f9]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-[#dbe9fa] hover:bg-[#f6f9fe] text-[#153765] rounded-xl text-[13px] font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-[#1769e8] hover:bg-[#1258c7] text-white rounded-xl text-[13px] font-bold transition-colors shadow-xs cursor-pointer"
            >
              Save Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
