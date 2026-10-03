import { useState, type FormEvent } from 'react';
import { Flower2, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Role } from '../../domain/types';
import { roleLabels, routesFor } from '../../domain/types';
import { getService } from '../../services';
import { useAuth } from '../../components/context';
import { errorMessage } from '../../lib/format';
import { Button } from '../../components/ui/button';
export function Login() {
  const [role, setRole] = useState<Role>('owner');
  const [staffId, setStaffId] = useState('s1');
  const [email, setEmail] = useState('demo@clinic.test');
  const [password, setPassword] = useState('demo1234');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { setSession } = useAuth();
  const navigate = useNavigate();
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const session = await getService().login(role, staffId, email, password);
      setSession(session);
      navigate('/' + routesFor[role][0]);
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  const screenshot =
    new URLSearchParams(window.location.search).get('screenshot') === '1' ||
    new URLSearchParams(window.location.hash.split('?')[1]).get('screenshot') === '1';
  return (
    <>
      {!screenshot && (
        <div className="demo-banner">ระบบตัวอย่าง — ข้อมูลทั้งหมดเป็นข้อมูลสมมติ</div>
      )}
      <main className="login">
        <div className="login-brand">
          <Flower2 size={44} />
          <h1>คลินิกใสสะอาด</h1>
          <p>บิวตี้แอนด์สปา</p>
          <div className="brand-line" />
          <p>ความใส่ใจ เริ่มต้นในทุกวัน</p>
        </div>
        <form className="login-form" onSubmit={submit}>
          <ShieldCheck className="accent" size={28} />
          <h2>เข้าสู่ระบบ</h2>
          <p className="muted">คลินิกใสสะอาด บิวตี้แอนด์สปา</p>
          <label>
            บทบาท
            <select value={role} onChange={(event) => setRole(event.target.value as Role)}>
              {Object.entries(roleLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          {role === 'practitioner' && (
            <label>
              ผู้ให้บริการ
              <select value={staffId} onChange={(event) => setStaffId(event.target.value)}>
                {['พญ. ลลิน ใจละมุน', 'นพ. ธารา รุ่งใส', 'คุณมะลิ', 'คุณพลอย', 'คุณอิง'].map(
                  (name, index) => (
                    <option key={name} value={'s' + (index + 1)}>
                      {name}
                    </option>
                  ),
                )}
              </select>
            </label>
          )}
          <label>
            อีเมล
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label>
            รหัสผ่าน
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
          <Button disabled={busy}>
            {busy ? 'กำลังเข้าสู่ระบบ' : 'เข้าสู่ระบบ'}
            <ArrowRight size={18} />
          </Button>
        </form>
      </main>
    </>
  );
}
