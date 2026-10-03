import * as Dialog from '@radix-ui/react-dialog';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { X, Inbox } from 'lucide-react';
import type { ReactNode } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
export const cn = (...values: Parameters<typeof clsx>) => twMerge(clsx(...values));
export function Modal({
  title,
  open,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={(value) => !value && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay" />
        <Dialog.Content className={cn('modal', wide && 'modal-wide')} aria-describedby={undefined}>
          <div className="modal-heading">
            <Dialog.Title>{title}</Dialog.Title>
            <Dialog.Close className="icon-button" title="ปิด">
              <X size={20} />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
export function Confirm({
  open,
  onClose,
  onConfirm,
  title,
  description,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
}) {
  return (
    <AlertDialog.Root open={open} onOpenChange={(value) => !value && onClose()}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="modal-overlay" />
        <AlertDialog.Content className="modal">
          <AlertDialog.Title>{title}</AlertDialog.Title>
          <AlertDialog.Description className="muted">{description}</AlertDialog.Description>
          <div className="actions">
            <AlertDialog.Cancel className="button secondary">กลับ</AlertDialog.Cancel>
            <AlertDialog.Action className="button danger" onClick={onConfirm}>
              ยืนยัน
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
export function Empty({ text = 'ยังไม่มีข้อมูลในรายการนี้' }: { text?: string }) {
  return (
    <div className="empty">
      <Inbox size={32} />
      <p>{text}</p>
    </div>
  );
}
export function Skeleton() {
  return (
    <div className="skeleton-layout" aria-label="กำลังโหลด" data-loading="true">
      <div className="skeleton tall" />
      <div className="skeleton" />
      <div className="skeleton" />
      <div className="skeleton tall" />
    </div>
  );
}
export function PageTitle({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <h1>{title}</h1>
        {subtitle && <p className="muted">{subtitle}</p>}
      </div>
      <div className="actions">{children}</div>
    </div>
  );
}
