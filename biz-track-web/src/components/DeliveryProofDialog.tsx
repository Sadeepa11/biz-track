import React, { useState, useRef } from 'react';
import type { Order } from '../types/biztrack.types';

interface DeliveryProofDialogProps {
  order: Order | null;
  mode: 'capture' | 'view';
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelivery?: (orderId: string, imageBase64: string) => Promise<void>;
}

export default function DeliveryProofDialog({
  order,
  mode,
  isOpen,
  onClose,
  onConfirmDelivery,
}: DeliveryProofDialogProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !order) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirm = async () => {
    if (!previewImage) {
      alert('Please take or choose a photo of the delivered package as proof.');
      return;
    }
    try {
      setIsSubmitting(true);
      if (onConfirmDelivery) {
        await onConfirmDelivery(order.id, previewImage);
      }
      setPreviewImage(null);
      onClose();
    } catch {
      alert('Failed to upload proof photo and complete delivery.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setPreviewImage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-[#dbe9fa] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#f8fbff] border-b border-[#e5effc]">
          <div>
            <h3 className="text-base font-bold text-[#153765]">
              {mode === 'capture' ? '📸 Complete Delivery with Photo' : '📸 Proof of Delivery Photo'}
            </h3>
            <p className="text-[11.5px] text-[#71829e] mt-0.5">
              {order.customer} · #{order.id.slice(-5)}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-[#edf5ff] hover:bg-[#dcebfd] text-[#1769e8] font-bold text-sm flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {mode === 'capture' ? (
            <div className="space-y-4">
              <div className="p-3 bg-[#f0f7ff] border border-[#cce3ff] rounded-xl text-xs text-[#2a4d7c]">
                <p className="font-semibold text-[#153765] mb-1">Take or upload delivery proof</p>
                <p>Attach a clear photo of the package delivered to complete this order. The photo will be saved to Cloudflare R2 and linked to Neon PostgreSQL.</p>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />

              {previewImage ? (
                <div className="relative rounded-xl overflow-hidden border border-[#cce3ff] bg-[#f8fbff] aspect-4/3 flex items-center justify-center">
                  <img
                    src={previewImage}
                    alt="Captured proof"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-3 right-3 bg-white/90 hover:bg-white text-[#153765] px-3 py-1.5 rounded-lg text-xs font-bold shadow-md transition-colors cursor-pointer"
                  >
                    Retake Photo 🔄
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#b9d5ff] bg-[#f8fbff] hover:bg-[#edf5ff] rounded-xl p-8 text-center cursor-pointer transition-colors"
                >
                  <div className="text-3xl mb-2">📸</div>
                  <p className="text-sm font-bold text-[#153765]">Tap to Take Photo / Choose File</p>
                  <p className="text-xs text-[#71829e] mt-1">Camera will open on mobile devices</p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-[#dbe9fa] text-[#526783] hover:bg-[#f6f9fe] text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={!previewImage || isSubmitting}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-white text-xs font-bold transition-colors cursor-pointer ${
                    !previewImage || isSubmitting
                      ? 'bg-[#a3c3f9] cursor-not-allowed'
                      : 'bg-[#059669] hover:bg-[#047857]'
                  }`}
                >
                  {isSubmitting ? 'Uploading to R2...' : '✓ Confirm & Complete'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {order.orderImage ? (
                <div className="rounded-xl overflow-hidden border border-[#dbe9fa] bg-[#f8fbff]">
                  <img
                    src={order.orderImage}
                    alt="Proof of delivery"
                    className="w-full max-h-80 object-contain bg-[#0b1c30]"
                  />
                </div>
              ) : (
                <p className="text-center py-8 text-xs text-[#71829e]">No photo attached to this order.</p>
              )}

              <div className="p-3.5 bg-[#f8fbff] border border-[#e5effc] rounded-xl text-xs space-y-1.5">
                <p className="font-bold text-[#153765] border-b border-[#e5effc] pb-1.5">
                  Delivery Details
                </p>
                <p className="text-[#526783]">
                  Customer: <strong className="text-[#153765]">{order.customer}</strong>
                </p>
                <p className="text-[#526783]">
                  Address: <strong className="text-[#153765]">{order.address}</strong>
                </p>
                <p className="text-[#526783]">
                  Phone: <strong className="text-[#153765]">{order.phone}</strong>
                </p>
                <p className="text-[#526783]">
                  Date: <strong className="text-[#153765]">{order.date}</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="w-full py-2.5 px-4 rounded-xl bg-[#1769e8] hover:bg-[#1258c7] text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
