import { useState } from 'react';
import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import {
  Flower2,
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
  return (
    <div className="app-shell">
      {mobile && (
        <button className="drawer-backdrop" aria-label="ปิดเมนู" onClick={() => setMobile(false)} />
      )}
      <aside className={'sidebar ' + (mobile ? 'mobile-open' : '')}>
        <div className="brand">
          <Flower2 size={32} />
          <div>
            <strong>คลินิกใสสะอาด</strong>
            <span>บิวตี้แอนด์สปา</span>
          </div>
          <button
            className="icon-button mobile-only"
            title="ปิดเมนู"
            onClick={() => setMobile(false)}
          >
            <X size={20} />
          </button>
        </div>
        <p className="nav-caption">พื้นที่ทำงาน</p>
        <nav>
          {navigation
            .filter((item) => allowed.includes(item.path))
            .map((item) => (
              <NavLink key={item.path} to={'/' + item.path} onClick={() => setMobile(false)}>
                <item.icon size={20} />
                {item.label}
              </NavLink>
            ))}
        </nav>
        <div className="sidebar-footer">
          <div className="avatar">{session.name.slice(0, 1)}</div>
          <div>
            <strong>{session.name}</strong>
            <span>{roleLabels[session.role]}</span>
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
      </aside>
      <div className="main-shell">
        <header>
          <button
            className="icon-button mobile-only"
            title="เปิดเมนู"
            onClick={() => setMobile(true)}
          >
            <Menu size={22} />
          </button>
          <span className="header-location">
            คลินิกใสสะอาด{' '}
            <span className="muted">
              {' '}
              / {navigation.find((item) => item.path === location.pathname.split('/')[1])?.label}
            </span>
          </span>
          <span className="header-date">{thaiDate(new Date(), 'EEEE d MMM yyyy')}</span>
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
  );
}
