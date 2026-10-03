import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import type { Course } from '../../domain/types';
import { useClinic } from '../../services/useClinic';
import { Empty, Modal, PageTitle, Skeleton, LoadError } from '../../components/ui';
import { thaiDate } from '../../lib/format';
import { CourseCards, reservedSessions } from './CourseCards';
import { SellCourse } from './SellCourse';
export function Courses() {
  const { data, error, refresh } = useClinic();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('active');
  const [sell, setSell] = useState(false);
  const [selected, setSelected] = useState<Course | null>(null);
  const [page, setPage] = useState(0);
  if (error) return <LoadError message={error} onRetry={refresh} />;
  if (!data) return <Skeleton />;
  const now = new Date();
  const expiry = new Date(now.getTime() + 30 * 86400000);
  const items = data.courses.filter((item) => {
    const matches = (
      data.customers.find((customer) => customer.id === item.customerId)?.name +
      ' ' +
      data.treatments.find((treatment) => treatment.id === item.treatmentId)?.name
    ).includes(search);
    return (
      matches &&
      (filter === 'all' ||
        (filter === 'active' && new Date(item.expiresAt) >= now && item.remaining > 0) ||
        (filter === 'expiring' &&
          new Date(item.expiresAt) >= now &&
          new Date(item.expiresAt) <= expiry))
    );
  });
  return (
    <div data-ready="true">
      <PageTitle title="คอร์สของลูกค้า">
        <button className="button" onClick={() => setSell(true)}>
          <Plus size={18} />
          ขายคอร์ส
        </button>
      </PageTitle>
      <div className="toolbar">
        <div className="search">
          <Search size={17} />
          <input
            placeholder="ค้นหาชื่อลูกค้า หรือคอร์ส..."
            aria-label="ค้นหาคอร์ส"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(0);
            }}
          />
        </div>
        <div className="segmented">
          {[
            ['active', 'ใช้งานได้'],
            ['expiring', 'ใกล้หมดอายุ'],
            ['all', 'ทั้งหมด'],
          ].map(([value, label]) => (
            <button
              key={value}
              className={filter === value ? 'active' : ''}
              onClick={() => {
                setFilter(value);
                setPage(0);
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      {items.length ? (
        <CourseCards
          courses={items.slice(page * 12, page * 12 + 12)}
          data={data}
          onSelect={setSelected}
        />
      ) : (
        <Empty text="ไม่พบคอร์สที่ตรงกับคำค้นหรือสถานะ" hint="ล้างคำค้นหรือเลือกสถานะอื่น">
          <button
            className="button secondary"
            onClick={() => {
              setSearch('');
              setFilter('active');
              setPage(0);
            }}
          >
            ล้างตัวกรอง
          </button>
        </Empty>
      )}
      <div className="pagination">
        <span>
          {items.length} คอร์ส หน้า {page + 1} / {Math.max(1, Math.ceil(items.length / 12))}
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
      {sell && (
        <SellCourse open={sell} onClose={() => setSell(false)} data={data} onSuccess={refresh} />
      )}
      <Modal title="ประวัติการใช้คอร์ส" open={!!selected} onClose={() => setSelected(null)}>
        <h3>{data.treatments.find((item) => item.id === selected?.treatmentId)?.name}</h3>
        <p className="small muted">
          คงเหลือ {selected?.remaining} / {selected?.total} ครั้ง
          <br />
          จองไว้ {selected ? reservedSessions(data, selected.id) : 0} ครั้ง
        </p>
        {selected?.usages.length ? (
          selected.usages.map((item, index) => (
            <div className="list-row" key={item.appointmentId}>
              <span>ครั้งที่ {index + 1}</span>
              <span>{thaiDate(item.date, 'd MMM yyyy HH:mm')}</span>
              <span className="badge completed">ใช้แล้ว</span>
            </div>
          ))
        ) : (
          <Empty text="ยังไม่มีประวัติการใช้คอร์ส" hint="ครั้งจะถูกบันทึกเมื่อจบบริการ" />
        )}
      </Modal>
    </div>
  );
}
