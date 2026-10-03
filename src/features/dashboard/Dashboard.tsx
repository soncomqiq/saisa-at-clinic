import { useState } from 'react';
import { Link } from 'react-router-dom';
import { endOfMonth, isSameDay, startOfMonth, subMonths } from 'date-fns';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Plus, ArrowUpRight, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { statusLabels } from '../../domain/types';
import { useClinic } from '../../services/useClinic';
import { getService } from '../../services';
import { Confirm, Empty, PageTitle, Skeleton } from '../../components/ui';
import { errorMessage, money, thaiDate } from '../../lib/format';
import { DailyBook } from './DailyBook';
export function Dashboard() {
  const { data, error, refresh } = useClinic();
  const [topKind, setTopKind] = useState('treatment');
  const [reset, setReset] = useState(false);
  const [busy, setBusy] = useState(false);
  if (error) return <p className="error">{error}</p>;
  if (!data) return <Skeleton />;
  const now = new Date();
  const appointments = data.appointments
    .filter((item) => isSameDay(new Date(item.start), now))
    .sort((first, second) => first.start.localeCompare(second.start));
  const todaySales = data.sales.filter((item) => isSameDay(new Date(item.date), now));
  const revenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);
  const months = Array.from({ length: 6 }, (_, index) => {
    const month = subMonths(now, 5 - index);
    return {
      name: thaiDate(month, 'MMM'),
      value: data.sales
        .filter(
          (sale) =>
            new Date(sale.date) >= startOfMonth(month) && new Date(sale.date) <= endOfMonth(month),
        )
        .reduce((sum, sale) => sum + sale.total / 100, 0),
    };
  });
  const expiry = new Date(now.getTime() + 30 * 86400000);
  const expiring = data.courses
    .filter(
      (course) =>
        course.remaining > 0 &&
        new Date(course.expiresAt) >= now &&
        new Date(course.expiresAt) <= expiry,
    )
    .sort((first, second) => first.expiresAt.localeCompare(second.expiresAt));
  const followup = data.customers.filter(
    (customer) =>
      data.courses.some(
        (course) =>
          course.customerId === customer.id &&
          course.remaining > 0 &&
          new Date(course.expiresAt) > now,
      ) &&
      !data.appointments.some(
        (item) =>
          item.customerId === customer.id &&
          new Date(item.start) >= now &&
          ['scheduled', 'arrived', 'inService'].includes(item.status),
      ),
  );
  const low = data.products.filter((item) => item.stock <= item.minimum);
  const top = data.treatments
    .map((treatment) => ({
      name: treatment.name,
      count: data.sales
        .flatMap((sale) => sale.lines)
        .filter((line) => line.itemId === treatment.id && line.kind === topKind)
        .reduce((sum, line) => sum + line.quantity, 0),
    }))
    .sort((first, second) => second.count - first.count)
    .slice(0, 4);
  async function doReset() {
    setBusy(true);
    try {
      await getService().reset();
      await refresh();
      toast.success('คืนข้อมูลตัวอย่างแล้ว');
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setBusy(false);
      setReset(false);
    }
  }
  return (
    <div data-ready="true">
      <PageTitle title="ภาพรวมคลินิก" subtitle={thaiDate(now, 'EEEE d MMM yyyy')}>
        <button
          className="icon-button bordered"
          title="คืนข้อมูลตัวอย่าง"
          disabled={busy}
          onClick={() => setReset(true)}
        >
          <RefreshCw size={17} />
        </button>
        <Link className="button" to="/appointments">
          <Plus size={18} />
          จองคิวใหม่
        </Link>
      </PageTitle>
      <DailyBook data={data} appointments={appointments} now={now} />
      <div className="today-statuses">
        {Object.entries(statusLabels).map(([status, label]) => (
          <div className="today-status" key={status}>
            <span className={'badge ' + status}>{label}</span>
            <strong>{appointments.filter((item) => item.status === status).length}</strong>
          </div>
        ))}
      </div>
      <section className="financial-band">
        <div className="daily-revenue">
          <h2>รายรับวันนี้</h2>
          <strong className="stat-number">{money(revenue)}</strong>
          <span className="muted">{todaySales.length} ใบเสร็จ</span>
        </div>
        <div className="financial-grid">
          <section className="revenue-section">
            <div className="section-heading">
              <h2>รายรับย้อนหลัง 6 เดือน</h2>
              <span className="small muted">บาท</span>
            </div>
            <div className="chart-box">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={months} margin={{ top: 15, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="var(--rule)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--ink-muted)' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--ink-muted)' }}
                    tickFormatter={(value) =>
                      Number(value) >= 1000
                        ? Math.round(Number(value) / 1000) + ' พัน'
                        : String(value)
                    }
                  />
                  <Tooltip
                    content={({ active, payload, label }) =>
                      active && payload?.length ? (
                        <div className="chart-tooltip">
                          <strong>{label}</strong>
                          <p>รายรับ {money(Number(payload[0].value) * 100)}</p>
                        </div>
                      ) : null
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="var(--clinic-jade)"
                    strokeWidth={2.5}
                    fill="var(--canvas)"
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>
          <section className="popular-section">
            <div className="section-heading">
              <h3>บริการและคอร์สยอดนิยม</h3>
              <div className="segmented">
                <button
                  className={topKind === 'treatment' ? 'active' : ''}
                  onClick={() => setTopKind('treatment')}
                >
                  บริการ
                </button>
                <button
                  className={topKind === 'course' ? 'active' : ''}
                  onClick={() => setTopKind('course')}
                >
                  คอร์ส
                </button>
              </div>
            </div>
            <div className="top-treatments">
              {top.map((item, index) => (
                <div className="top-treatment" key={item.name}>
                  <span className="rank">{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <strong>{item.name}</strong>
                  </div>
                  <span>
                    {item.count} {topKind === 'course' ? 'คอร์ส' : 'ครั้ง'}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
      <div className="dashboard-attention">
        <section>
          <div className="section-heading">
            <h3 className="actions">คอร์สใกล้หมดอายุ</h3>
            <span className="badge arrived">{expiring.length}</span>
          </div>
          <p className="small muted">ภายใน 30 วัน</p>
          {expiring.length ? (
            expiring.slice(0, 4).map((course) => (
              <Link className="list-row" key={course.id} to={'/customers/' + course.customerId}>
                <div>
                  <strong>
                    {data.customers.find((item) => item.id === course.customerId)?.name}
                  </strong>
                  <p>{data.treatments.find((item) => item.id === course.treatmentId)?.name}</p>
                </div>
                <div className="attention-value">
                  <strong>{course.remaining} ครั้ง</strong>
                  <p>{thaiDate(course.expiresAt, 'd MMM')}</p>
                </div>
              </Link>
            ))
          ) : (
            <Empty text="ไม่มีคอร์สใกล้หมดอายุ" />
          )}
          <Link className="link small" to="/courses">
            ดูคอร์สทั้งหมด
          </Link>
        </section>
        <section>
          <div className="section-heading">
            <h3 className="actions">ลูกค้าที่ควรติดตาม</h3>
            <span className="badge neutral">{followup.length}</span>
          </div>
          <p className="small muted">มีครั้งคงเหลือ แต่ยังไม่มีนัดหมาย</p>
          {followup.length ? (
            followup.slice(0, 4).map((customer) => (
              <Link className="list-row" key={customer.id} to={'/customers/' + customer.id}>
                <div>
                  <strong>{customer.name}</strong>
                  <p>{customer.phone}</p>
                </div>
                <ArrowUpRight size={15} />
              </Link>
            ))
          ) : (
            <Empty text="ลูกค้าทุกคนมีนัดหมายแล้ว" />
          )}
          <Link className="link small" to="/customers">
            ดูลูกค้าทั้งหมด
          </Link>
        </section>
        <section>
          <div className="section-heading">
            <h3 className="actions">สต็อกที่ต้องเติม</h3>
            <span className="badge low">{low.length}</span>
          </div>
          <p className="small muted">ต่ำกว่าหรือเท่ากับจำนวนขั้นต่ำ</p>
          {low.length ? (
            low.slice(0, 4).map((product) => (
              <Link className="list-row" key={product.id} to="/inventory">
                <div>
                  <strong>{product.name}</strong>
                  <p>
                    ขั้นต่ำ {product.minimum} {product.unit}
                  </p>
                </div>
                <span className="badge low">
                  {product.stock} {product.unit}
                </span>
              </Link>
            ))
          ) : (
            <Empty text="สต็อกทุกรายการเพียงพอ" />
          )}
          <Link className="link small" to="/inventory">
            จัดการสต็อก
          </Link>
        </section>
      </div>
      <Confirm
        open={reset}
        onClose={() => setReset(false)}
        onConfirm={() => void doReset()}
        title="คืนข้อมูลตัวอย่าง"
        description="รายการที่เพิ่มหรือแก้ไขทั้งหมดจะถูกลบและแทนที่ด้วยข้อมูลสมมติชุดตั้งต้น"
      />
    </div>
  );
}
