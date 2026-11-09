// src\components\shared\ToastQueueProvider\index.tsx
'use client';

import { Alert, type AlertColor, Snackbar } from '@mui/material';
import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react';

interface Toast {
  id: number;
  message: string;
  severity: AlertColor;
}

interface ToastQueueContextValue {
  showToast: (message: string, severity?: AlertColor) => void;
}

const ToastQueueContext = createContext<ToastQueueContextValue | null>(null);

const AUTO_HIDE_MS = 4000;

/** Queues toasts and shows them one at a time. */
export const ToastQueueProvider = ({ children }: { children: ReactNode }) => {
  const [queue, setQueue] = useState<Toast[]>([]);
  const [open, setOpen] = useState(true);
  const current = queue[0];

  const showToast = useCallback((message: string, severity: AlertColor = 'info') => {
    setQueue((q) => [...q, { id: Date.now() + Math.random(), message, severity }]);
  }, []);

  /** Starts the exit animation for the current toast. */
  const handleClose = (_event?: unknown, reason?: string) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  };

  /** After exit, drop the toast and open the next. */
  const handleExited = () => {
    setQueue((q) => q.slice(1));
    setOpen(true);
  };

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastQueueContext.Provider value={value}>
      {children}
      <Snackbar
        key={current?.id}
        open={Boolean(current) && open}
        autoHideDuration={AUTO_HIDE_MS}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        slotProps={{ transition: { onExited: handleExited } }}
      >
        {current ? (
          <Alert onClose={handleClose} severity={current.severity} variant="filled">
            {current.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </ToastQueueContext.Provider>
  );
};

/** Access the toast queue. Must be used under ToastQueueProvider. */
export const useToastQueue = (): ToastQueueContextValue => {
  const ctx = useContext(ToastQueueContext);
  if (!ctx) throw new Error('useToastQueue must be used inside ToastQueueProvider');
  return ctx;
};
