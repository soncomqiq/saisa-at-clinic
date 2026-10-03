import { useState } from 'react';
import { Search } from 'lucide-react';
import { useClinic } from '../../services/useClinic';
import { Empty, PageTitle, Skeleton, LoadError } from '../../components/ui';
import { money } from '../../lib/format';
export function Treatments() {
  const { data, error, refresh } = useClinic();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ทั้งหมด');
  if (error) return <LoadError message={error} onRetry={refresh} />;
  if (!data) return <Skeleton />;
  const items = data.treatments.filter(
    (item) => item.name.includes(search) && (category === 'ทั้งหมด' || item.category === category),
  );
  return (
    <div data-ready="true">
      <PageTitle title="รายการบริการ" />
      <div className="toolbar">
        <div className="search">
          <Search size={17} />
          <input
            aria-label="ค้นหาบริการ"
            placeholder="ค้นหาบริการ..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="segmented">
          {['ทั้งหมด', 'ทรีตเมนต์ผิวหน้า', 'เลเซอร์', 'สปา'].map((value) => (
            <button
              key={value}
              className={category === value ? 'active' : ''}
              onClick={() => setCategory(value)}
            >
              {value}
            </button>
          ))}
        </div>
      </div>
      {items.length ? (
        <>
          {[...new Set(items.map((item) => item.category))].map((group) => (
            <section className="service-group" key={group}>
              <h2>{group}</h2>
              <div className="table-wrap desktop-only">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>บริการ</th>
                      <th className="numeric">ระยะเวลา</th>
                      <th className="numeric">ราคา</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items
                      .filter((item) => item.category === group)
                      .map((item) => (
                        <tr key={item.id}>
                          <td>{item.name}</td>
                          <td className="numeric">{item.duration} นาที</td>
                          <td className="numeric">{money(item.price)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              <div className="mobile-list">
                {items
                  .filter((item) => item.category === group)
                  .map((item) => (
                    <article className="service-row" key={item.id}>
                      <div>
                        <strong>{item.name}</strong>
                        <p className="small muted">{item.duration} นาที</p>
                      </div>
                      <span className="numeric">{money(item.price)}</span>
                    </article>
                  ))}
              </div>
            </section>
          ))}
        </>
      ) : (
        <Empty text="ไม่พบบริการที่ตรงกับคำค้น" hint="ล้างคำค้นหรือเลือกประเภทอื่น">
          <button
            className="button secondary"
            onClick={() => {
              setSearch('');
              setCategory('ทั้งหมด');
            }}
          >
            ล้างตัวกรอง
          </button>
        </Empty>
      )}
    </div>
  );
}
