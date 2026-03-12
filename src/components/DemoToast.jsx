import { useState, useCallback, createContext, useContext } from 'react';
import { Lock } from 'lucide-react';

const DemoToastContext = createContext(null);

export function DemoToastProvider({ children }) {
  const [visible, setVisible] = useState(false);
  const [timer, setTimer] = useState(null);

  const showDemoToast = useCallback(() => {
    if (timer) clearTimeout(timer);
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 2500);
    setTimer(t);
  }, [timer]);

  return (
    <DemoToastContext.Provider value={showDemoToast}>
      {children}
      {visible && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[9999] animate-fade-in">
          <div className="bg-sand-900 text-white text-sm font-medium px-5 py-3 rounded-xl shadow-lg flex items-center gap-2">
            <Lock size={14} />
            Sign up to start tracking your puppy!
          </div>
        </div>
      )}
    </DemoToastContext.Provider>
  );
}

export function useDemoToast() {
  return useContext(DemoToastContext);
}
