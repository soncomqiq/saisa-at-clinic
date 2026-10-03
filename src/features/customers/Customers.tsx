import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../components/context';
import { Empty, Modal, PageTitle, Skeleton } from '../../components/ui';
import { getService } from '../../services';
import { useClinic } from '../../services/useClinic';
import { errorMessage, thaiDate } from '../../lib/format';
export function Customers() {
  const { session } = useAuth();
  const { data, error, refresh } = useClinic();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [precaution, setPrecaution] = useState('');
  const [warning, setWarning] = useState('');
  const [busy, setBusy] = useState(false);
  if (error) return <p className="error">{error}</p>;
  if (!data) return <Skeleton />;
  const items = data.customers.filter((item) => (item.name + ' ' + item.phone).includes(search));
  const visible = items.slice(page * 12, page * 12 + 12);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      await getService().addCustomer({
        name,
        phone,
        precaution: session?.role === 'owner' ? precaution : undefined,
      });
      setOpen(false);
      setName('');
      setPhone('');
      setPrecaution('');
      toast.success('เพิ่มลูกค้าแล้ว');
      await refresh();
    } catch (error) {
      setWarning(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div data-ready="true">
      <PageTitle
        title="ลูกค้า"
        subtitle={
          session?.role === 'practitioner'
            ? 'ลูกค้าที่มีนัดหมายกับคุณ'
            : 'ข้อมูลลูกค้าและประวัติการดูแลทั้งหมด'
        }
      >
        {session?.role !== 'practitioner' && (
          <button
            className="button"
            onClick={() => {
              setWarning('');
              setOpen(true);
            }}
          >
            <Plus size={18} />
            เพิ่มลูกค้า
          </button>
        )}
      </PageTitle>
      <div className="toolbar">
        <div className="search">
          <Search size={17} />
          <input
            placeholder="ค้นหาชื่อ หรือเบอร์โทรศัพท์..."
            aria-label="ค้นหาลูกค้า"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(0);
            }}
          />
        </div>
        <span className="ready-label">{items.length} คน</span>
      </div>
      {visible.length ? (
        <>
          <div className="table-wrap desktop-only">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ลูกค้า</th>
                  <th>เบอร์โทรศัพท์</th>
                  <th>รับบริการล่าสุด</th>
                  {session?.role !== 'practitioner' && <th>คอร์สที่ใช้งานได้</th>}
                  <th />
                </tr>
              </thead>
              <tbody>
                {visible.map((item) => {
                  const latest = data.history
                    .filter((visit) => visit.customerId === item.id && visit.status === 'completed')
                    .sort((first, second) => second.start.localeCompare(first.start))[0];
                  return (
                    <tr key={item.id}>
                      <td>
                        <Link to={'/customers/' + item.id} className="actions">
                          <div className="avatar">{item.name.slice(0, 1)}</div>
                          <strong>{item.name}</strong>
                        </Link>
                      </td>
                      <td>{item.phone}</td>
                      <td>{latest ? thaiDate(latest.start) : 'ยังไม่มีประวัติ'}</td>
                      {session?.role !== 'practitioner' && (
                        <td>
                          {
                            data.courses.filter(
                              (course) =>
                                course.customerId === item.id &&
                                new Date(course.expiresAt) > new Date() &&
                                course.remaining > 0,
                            ).length
                          }{' '}
                          คอร์ส
                        </td>
                      )}
                      <td>
                        <Link
                          className="icon-button"
                          title="ดูข้อมูลลูกค้า"
                          to={'/customers/' + item.id}
                        >
                          <ArrowUpRight size={18} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mobile-list">
            {visible.map((item) => (
              <Link key={item.id} to={'/customers/' + item.id} className="card-row">
                <div className="card-row-head">
                  <div className="actions">
                    <div className="avatar">{item.name.slice(0, 1)}</div>
                    <strong>{item.name}</strong>
                  </div>
                  <ArrowUpRight size={17} />
                </div>
                <div className="card-row-meta">
                  <span>{item.phone}</span>
                  {session?.role !== 'practitioner' && (
                    <span>
                      {
                        data.courses.filter(
                          (course) => course.customerId === item.id && course.remaining > 0,
                        ).length
                      }{' '}
                      คอร์ส
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </>
      ) : (
        <Empty text="ไม่พบลูกค้าที่ค้นหา" />
      )}
      <div className="pagination">
        <span>
          หน้า {page + 1} / {Math.max(1, Math.ceil(items.length / 12))}
        </span>
        <div className="actions">
          <button className="button secondary" disabled={!page} onClick={() => setPage(page - 1)}>
            ก่อนหน้า
          </button>
          <button
            className="button secondary"
            disabled={(page + 1) * 12 >= items.length}
            onClick={() => setPage(page + 1)}
          >
            ถัดไป
          </button>
        </div>
      </div>
      <Modal title="เพิ่มลูกค้าใหม่" open={open} onClose={() => setOpen(false)}>
        <form onSubmit={submit}>
          <label>
            ชื่อและนามสกุล
            <input value={name} onChange={(event) => setName(event.target.value)} required />
          </label>
          <label>
            เบอร์โทรศัพท์
            <input
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              required
            />
          </label>
          {session?.role === 'owner' && (
            <label>
              ข้อควรระวัง
              <textarea
                value={precaution}
                onChange={(event) => setPrecaution(event.target.value)}
              />
            </label>
          )}
          {warning && (
            <p className="error" role="alert">
              {warning}
            </p>
          )}
          <button className="button" disabled={busy}>
            {busy ? 'กำลังบันทึก' : 'บันทึกลูกค้า'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
