import type { ClinicService } from './contracts';
import type { Role, Session } from '../domain/types';
import { roleLabels } from '../domain/types';
const SESSION_KEY = 'saisaath-session-v1';
export class MockClinicService implements ClinicService {
  async session() { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null') as Session | null; }
  async login(role: Role, staffId: string, email: string, password: string) {
    if (email !== 'demo@clinic.test' || password !== 'demo1234') throw new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    const session = { role, staffId, name: roleLabels[role] };
    localStorage.setItem(SESSION_KEY,JSON.stringify(session));
    return session;
  }
  async logout() { localStorage.removeItem(SESSION_KEY); }
  async snapshot(): ReturnType<ClinicService['snapshot']> { throw new Error('กำลังเตรียมข้อมูล'); }
  async book(): ReturnType<ClinicService['book']> { throw new Error('กำลังเตรียมข้อมูล'); }
  async transition() { throw new Error('กำลังเตรียมข้อมูล'); }
  async addCustomer(): ReturnType<ClinicService['addCustomer']> { throw new Error('กำลังเตรียมข้อมูล'); }
  async checkout(): ReturnType<ClinicService['checkout']> { throw new Error('กำลังเตรียมข้อมูล'); }
  async stock() { throw new Error('กำลังเตรียมข้อมูล'); }
  async reset() { throw new Error('กำลังเตรียมข้อมูล'); }
}