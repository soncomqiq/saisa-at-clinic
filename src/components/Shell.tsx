import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Layers,
  Receipt,
  Package,
  Sparkles,
  Menu,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from './context';
import { routesFor, roleLabels } from '../domain/types';
import { getService } from '../services';
import { thaiDate } from '../lib/format';
const navigation = [
  { path: 'dashboard', label: 'ภาพรวมคลินิก', icon: LayoutDashboard },
  { path: 'appointments', label: 'จองคิว', icon: CalendarDays },
  { path: 'customers', label: 'ลูกค้า', icon: Users },
  { path: 'courses', label: 'คอร์ส', icon: Layers },
  { path: 'sales', label: 'ขายและใบเสร็จ', icon: Receipt },
  { path: 'inventory', label: 'สินค้าและสต็อก', icon: Package },
  { path: 'treatments', label: 'รายการบริการ', icon: Sparkles },
];
export function Shell() {
  const { session, setSession } = useAuth();
  const [mobile, setMobile] = useState(false);
  const location = useLocation();
  if (!session) return <Navigate to="/login" replace />;
  const allowed = routesFor[session.role];
  if (!allowed.includes(location.pathname.split('/')[1]))
    return <Navigate to={'/' + allowed[0]} replace />;
  const screenshot =
    new URLSearchParams(window.location.search).get('screenshot') === '1' ||
    new URLSearchParams(window.location.hash.split('?')[1]).get('screenshot') === '1';
  const links = (
    <nav aria-label="เมนูหลัก">
      {navigation
        .filter((item) => allowed.includes(item.path))
        .map((item) => (
          <NavLink key={item.path} to={'/' + item.path} onClick={() => setMobile(false)}>
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
    </nav>
  );
  const account = (
    <div className="sidebar-footer">
      <div>
        <strong>{session.name}</strong>
        {session.name !== roleLabels[session.role] && <span>{roleLabels[session.role]}</span>}
      </div>
      <button
        className="icon-button"
        title="ออกจากระบบ"
        onClick={async () => {
          await getService().logout();
          setSession(null);
        }}
      >
        <LogOut size={18} />
      </button>
    </div>
  );
  return (
    <Dialog.Root open={mobile} onOpenChange={setMobile}>
      <div className="app-shell">
        <aside className="sidebar desktop-sidebar">
          <div className="brand">
            <div>
              <strong>คลินิกใสสะอาด</strong>
              <span>บิวตี้แอนด์สปา</span>
            </div>
          </div>
          {links}
          {account}
        </aside>
        <div className="main-shell">
          <header className="workspace-header">
            <span className="header-location">คลินิกใสสะอาด</span>
            <span className="header-date">{thaiDate(new Date(), 'EEEE d MMM yyyy')}</span>
            <Dialog.Trigger asChild>
              <button className="icon-button mobile-only" title="เปิดเมนู">
                <Menu size={22} />
              </button>
            </Dialog.Trigger>
          </header>
          {!screenshot && (
            <div className="demo-banner">ระบบตัวอย่าง — ข้อมูลทั้งหมดเป็นข้อมูลสมมติ</div>
          )}
          <main className="page">
            <Outlet />
          </main>
          <footer className="page-footer">
            คลินิกใสสะอาด บิวตี้แอนด์สปา <span>เปิดบริการทุกวัน 10:00–20:00</span>
          </footer>
        </div>
      </div>
      <Dialog.Portal>
        <Dialog.Overlay className="drawer-backdrop" />
        <Dialog.Content className="sidebar mobile-drawer" aria-describedby={undefined}>
          <div className="brand">
            <div>
              <Dialog.Title>คลินิกใสสะอาด</Dialog.Title>
              <span>บิวตี้แอนด์สปา</span>
            </div>
            <Dialog.Close className="icon-button" title="ปิดเมนู">
              <X size={20} />
            </Dialog.Close>
          </div>
          {links}
          {account}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
