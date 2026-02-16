import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <div
        className="absolute inset-0 bg-sand-900/25 backdrop-blur-sm animate-backdrop"
        onClick={onClose}
      />
      <div className="absolute bottom-0 left-0 right-0 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-lg md:w-full md:rounded-2xl max-h-[85vh] bg-white rounded-t-2xl shadow-2xl overflow-hidden animate-slide-up md:animate-fade-in">
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-sand-100 px-5 py-4 flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-sand-800">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-sand-100 transition-colors text-sand-400 hover:text-sand-600"
          >
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto max-h-[calc(85vh-60px)] px-5 py-5">
          {children}
        </div>
      </div>
    </div>
  );
}
