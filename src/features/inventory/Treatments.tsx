import { useState } from 'react';
import { Search, Sparkles, Clock } from 'lucide-react';
import { useClinic } from '../../services/useClinic';
import { Empty, PageTitle, Skeleton } from '../../components/ui';
import { money } from '../../lib/format';
export function Treatments() {
  const { data, error } = useClinic();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ทั้งหมด');
  if (error) return <p className="error">{error}</p>;
  if (!data) return <Skeleton />;
  const items = data.treatments.filter(
    (item) => item.name.includes(search) && (category === 'ทั้งหมด' || item.category === category),
  );
  return (
    <div data-ready="true">
      <PageTitle
        title="รายการบริการ"
        subtitle="ทรีตเมนต์ผิวหน้า เลเซอร์ และสปา · ดูแลอย่างใส่ใจในทุกขั้นตอน"
      />
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
        <div className="grid-3">
          {items.map((item) => (
            <article className="treatment-card" key={item.id}>
              <div className="treatment-icon">
                <Sparkles size={22} />
              </div>
              <span className="badge neutral">{item.category}</span>
              <h3>{item.name}</h3>
              <div className="actions small muted">
                <Clock size={15} />
                {item.duration} นาที
              </div>
              <p className="price">{money(item.price)}</p>
            </article>
          ))}
        </div>
      ) : (
        <Empty text="ไม่พบบริการที่ค้นหา" />
      )}
    </div>
  );
}
