import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './components/context';
import { Shell } from './components/Shell';
import { Login } from './features/auth/Login';
import { Empty, PageTitle } from './components/ui';
import { Inventory } from './features/inventory/Inventory';
import { Treatments } from './features/inventory/Treatments';
import { Customers } from './features/customers/Customers';
import { Profile } from './features/customers/Profile';
import { Courses } from './features/courses/Courses';
import { Appointments } from './features/appointments/Appointments';
import { Sales } from './features/sales/Sales';
function Placeholder({title}:{title:string}) {return <><PageTitle title={title}/><Empty text="กำลังเตรียมพื้นที่ทำงาน"/></>;}
export function App() {return <HashRouter><AuthProvider><Routes><Route path="/login" element={<Login/>}/><Route element={<Shell/>}><Route path="inventory" element={<Inventory/>}/><Route path="treatments" element={<Treatments/>}/><Route path="customers" element={<Customers/>}/><Route path="customers/:id" element={<Profile/>}/><Route path="courses" element={<Courses/>}/><Route path="appointments" element={<Appointments/>}/><Route path="sales" element={<Sales/>}/><Route path="dashboard" element={<Placeholder title="ภาพรวมคลินิก"/>}/><Route path="*" element={<Navigate to="/dashboard" replace/>}/></Route></Routes><Toaster position="top-right" richColors closeButton/></AuthProvider></HashRouter>;}