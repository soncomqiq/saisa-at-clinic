import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './components/context';
import { Shell } from './components/Shell';
import { Login } from './features/auth/Login';
import { lazy, Suspense } from 'react';
import { Skeleton } from './components/ui';
const Inventory = lazy(() =>
  import('./features/inventory/Inventory').then((module) => ({ default: module.Inventory })),
);
const Treatments = lazy(() =>
  import('./features/inventory/Treatments').then((module) => ({ default: module.Treatments })),
);
const Customers = lazy(() =>
  import('./features/customers/Customers').then((module) => ({ default: module.Customers })),
);
const Profile = lazy(() =>
  import('./features/customers/Profile').then((module) => ({ default: module.Profile })),
);
const Courses = lazy(() =>
  import('./features/courses/Courses').then((module) => ({ default: module.Courses })),
);
const Appointments = lazy(() =>
  import('./features/appointments/Appointments').then((module) => ({
    default: module.Appointments,
  })),
);
const Sales = lazy(() =>
  import('./features/sales/Sales').then((module) => ({ default: module.Sales })),
);
const Dashboard = lazy(() =>
  import('./features/dashboard/Dashboard').then((module) => ({ default: module.Dashboard })),
);
export function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <Suspense fallback={<Skeleton />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<Shell />}>
              <Route path="inventory" element={<Inventory />} />
              <Route path="treatments" element={<Treatments />} />
              <Route path="customers" element={<Customers />} />
              <Route path="customers/:id" element={<Profile />} />
              <Route path="courses" element={<Courses />} />
              <Route path="appointments" element={<Appointments />} />
              <Route path="sales" element={<Sales />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </Suspense>
        <Toaster position="bottom-right" richColors closeButton />
      </AuthProvider>
    </HashRouter>
  );
}
