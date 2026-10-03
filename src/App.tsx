import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './components/context';
import { Shell } from './components/Shell';
import { Login } from './features/auth/Login';
import { Empty, PageTitle } from './components/ui';
function Placeholder({title}:{title:string}) {return <><PageTitle title={title}/><Empty text="กำลังเตรียมพื้นที่ทำงาน"/></>;}
export function App() {return <HashRouter><AuthProvider><Routes><Route path="/login" element={<Login/>}/><Route element={<Shell/>}>{[['dashboard','ภาพรวมคลินิก'],['appointments','จองคิว'],['customers','ลูกค้า'],['courses','คอร์ส'],['sales','ขายและใบเสร็จ'],['inventory','สินค้าและสต็อก'],['treatments','รายการบริการ']].map(([path,title])=><Route key={path} path={path} element={<Placeholder title={title}/>}/>)}<Route path="*" element={<Navigate to="/dashboard" replace/>}/></Route></Routes><Toaster position="top-right" richColors closeButton/></AuthProvider></HashRouter>;}