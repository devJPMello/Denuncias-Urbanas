import * as Dialog from '@radix-ui/react-dialog';
import { MdClose } from 'react-icons/md';
import { ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function Modal({ open, onOpenChange, title, subtitle, children }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[800] animate-in fade-in" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background rounded-2xl shadow-2xl z-[810] w-[95vw] max-w-md max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 fade-in border border-border"
        >
          <div className="bg-gradient-to-r from-primary to-blue-600 text-white px-4 py-3 flex items-center justify-between">
            <div className="min-w-0">
              <Dialog.Title className="font-bold truncate">{title}</Dialog.Title>
              {subtitle && (
                <p className="text-white/80 text-xs truncate">{subtitle}</p>
              )}
            </div>
            <Dialog.Close className="p-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg transition-colors flex-shrink-0 ml-3">
              <MdClose className="w-5 h-5" />
            </Dialog.Close>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {children}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
