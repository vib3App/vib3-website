/**
 * Confirm dialog store — replaces native window.confirm()
 * Usage: const confirm = useConfirmStore();
 *        const ok = await confirm.show({ title: '...', message: '...' });
 */
import { create } from 'zustand';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'default';
}

interface ConfirmState {
  isOpen: boolean;
  options: ConfirmOptions | null;
  resolve: ((value: boolean) => void) | null;
  show: (options: ConfirmOptions) => Promise<boolean>;
  close: (result: boolean) => void;
}

export const useConfirmStore = create<ConfirmState>((set, get) => ({
  isOpen: false,
  options: null,
  resolve: null,
  show: (options) => {
    return new Promise<boolean>((resolve) => {
      set({ isOpen: true, options, resolve });
    });
  },
  close: (result) => {
    const { resolve } = get();
    resolve?.(result);
    set({ isOpen: false, options: null, resolve: null });
  },
}));
