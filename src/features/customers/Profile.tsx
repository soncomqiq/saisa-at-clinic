import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import type { Sale } from '../../domain/types';
import { statusLabels } from '../../domain/types';
import { useAuth } from '../../components/context';
import { Empty, PageTitle, Skeleton } from '../../components/ui';
import { getService } from '../../services';
import { useClinic } from '../../services/useClinic';
import { money, thaiDate, errorMessage } from '../../lib/format';
import { CourseCards } from '../courses/CourseCards';
import { SellCourse } from '../courses/SellCourse';
export function Profile() {
  const { id } = useParams();
  const { session } = useAuth();
  const { data, error, refresh } = useClinic();
  const [tab, setTab] = useState('courses');
  const [sell, setSell] = useState(false);
  const [sales, setSales] = useState<Sale[]>([]);
  const [salesError, setSalesError] = useState('');
  const [salesLoading, setSalesLoading] = useState(true);
  useEffect(() => {
    if (id && session?.role !== 'practitioner') {
      setSalesLoading(true);
      getService()
        .customerSales(id)
        .then(setSales)
        .catch((error) => setSalesError(errorMessage(error)))
        .finally(() => setSalesLoading(false));
    }
  }, [id, session?.role, data]);
  if (error) return <p className="error">{error}</p>;
  if (!data) return <Skeleton />;
  const customer = data.customers.find((item) => item.id === id);
  if (!customer) return <Empty text="ไม่พบลูกค้า หรือไม่มีสิทธิ์เข้าถึงข้อมูล" />;
  const visits = data.history
    .filter((item) => item.customerId === id)
    .sort((first, second) => second.start.localeCompare(first.start));
  const courses = data.courses.filter(
    (item) =>
      item.customerId === id && item.remaining > 0 && new Date(item.expiresAt) >= new Date(),
  );
  const actualTab = session?.role === 'practitioner' ? 'visits' : tab;
  return (
    <div data-ready={!salesLoading || session?.role === 'practitioner'}>
      <Link to="/customers" className="actions small muted profile-back">
        <ArrowLeft size={16} />
        กลับไปหน้าลูกค้า
      </Link>
      <PageTitle title={customer.name} subtitle={'โทร ' + customer.phone}>
        {session?.role !== 'practitioner' && (
          <button className="button" onClick={() => setSell(true)}>
            <Plus size={17} />
            ขายคอร์ส
          </button>
        )}
      </PageTitle>
      {session?.role !== 'receptionist' && (
        <div
          className={
            customer.precaution && customer.precaution !== 'ไม่มีข้อควรระวังที่แจ้งไว้'
              ? 'warning-note precaution-note'
              : 'precaution-note neutral-note'
          }
        >
          <strong>ข้อควรระวัง</strong>
          <p>{customer.precaution || 'ไม่มีข้อควรระวังที่แจ้งไว้'}</p>
        </div>
      )}
      <div className="toolbar profile-tabs">
        <div className="segmented">
          {(session?.role === 'practitioner'
            ? [['visits', 'ประวัติการรับบริการ']]
            : [
                ['courses', 'คอร์สที่ใช้งานได้'],
                ['visits', 'ประวัติการรับบริการ'],
                ['purchases', 'ประวัติการซื้อ'],
              ]
          ).map(([value, label]) => (
            <button
              key={value}
              className={actualTab === value ? 'active' : ''}
              onClick={() => setTab(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      {actualTab === 'courses' ? (
        <CourseCards courses={courses} data={data} showCustomer={false} />
      ) : actualTab === 'visits' ? (
        visits.length ? (
          <div className="panel">
            {visits.map((item) => (
              <div className="list-row" key={item.id}>
                <div>
                  <strong>
                    {data.treatments.find((treatment) => treatment.id === item.treatmentId)?.name}
                  </strong>
                  <p>
                    {thaiDate(item.start, 'd MMM yyyy HH:mm')}
                    <br />
                    {data.staff.find((staff) => staff.id === item.practitionerId)?.name}
                  </p>
                </div>
                <span className={'badge ' + item.status}>{statusLabels[item.status]}</span>
              </div>
            ))}
          </div>
        ) : (
          <Empty text="ยังไม่มีประวัติการรับบริการ" />
        )
      ) : salesLoading ? (
        <Skeleton />
      ) : salesError ? (
        <p className="error">{salesError}</p>
      ) : sales.length ? (
        <div className="panel">
          {sales
            .sort((first, second) => second.date.localeCompare(first.date))
            .map((sale) => (
              <div className="list-row" key={sale.id}>
                <div>
                  <strong>{sale.lines.map((line) => line.name).join(', ')}</strong>
                  <p>
                    {thaiDate(sale.date)}
                    <br />
                    ใบเสร็จ {sale.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
                <strong className="numeric">{money(sale.total)}</strong>
              </div>
            ))}
        </div>
      ) : (
        <Empty text="ยังไม่มีประวัติการซื้อ" />
      )}
      <dl className="details-grid profile-metadata">
        <div>
          <dt>รหัสลูกค้า</dt>
          <dd>{customer.id.toUpperCase()}</dd>
        </div>
        <div>
          <dt>เป็นลูกค้าตั้งแต่</dt>
          <dd>{thaiDate(customer.createdAt)}</dd>
        </div>
        <div>
          <dt>รับบริการแล้ว</dt>
          <dd className="numeric">
            {visits.filter((item) => item.status === 'completed').length} ครั้ง
          </dd>
        </div>
      </dl>
      {sell && (
        <SellCourse
          open={sell}
          onClose={() => setSell(false)}
          data={data}
          onSuccess={refresh}
          customerId={customer.id}
        />
      )}
    </div>
  );
}
