interface ToastProps {
  message: string | null;
  onClose?: () => void;
}

export default function Toast({ message, onClose }: ToastProps) {
  if (!message) return null;

  return (
    <div
      role="status"
      onClick={onClose}
      className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[#163968] text-white px-5 py-2.5 rounded-xl shadow-xl text-xs font-medium max-w-[90%] text-center animate-fade-in cursor-pointer select-none"
    >
      {message}
    </div>
  );
}
