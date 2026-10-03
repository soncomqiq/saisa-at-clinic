import { Link } from 'react-router-dom';
import type { Appointment, ClinicData } from '../../domain/types';
import { statusLabels } from '../../domain/types';
import { clock } from '../../lib/format';
import { Empty } from '../../components/ui';
export function DailyBook({
  data,
  appointments,
  now,
}: {
  data: ClinicData;
  appointments: Appointment[];
  now: Date;
}) {
  const next = appointments.find(
    (item) => item.status === 'scheduled' && new Date(item.start) >= now,
  );
  return (
    <div className="daily-book">
      <section className="appointment-ledger">
        <div className="section-heading">
          <h2>นัดหมายวันนี้</h2>
          <Link className="link" to="/appointments">
            เปิดตารางนัดหมาย
          </Link>
        </div>
        <p className="book-next">
          {next ? (
            <>
              นัดถัดไป <time>{clock(next.start)}</time>{' '}
              <strong>{data.customers.find((item) => item.id === next.customerId)?.name}</strong>
            </>
          ) : (
            'ไม่มีนัดถัดไปในวันนี้'
          )}
          <span>
            ขณะนี้ <time>{clock(now.toISOString())}</time>
          </span>
        </p>
        {appointments.length ? (
          <div className="appointment-ledger-body">
            {appointments.map((item) => (
              <Link
                className={
                  'day-record ' + item.status + (next?.id === item.id ? ' next-record' : '')
                }
                key={item.id}
                to="/appointments"
              >
                <div className="record-time">
                  <time>{clock(item.start)}</time>
                  <span className="small muted">ถึง {clock(item.end)}</span>
                </div>
                <div className="record-person">
                  <strong>
                    {data.customers.find((customer) => customer.id === item.customerId)?.name}
                  </strong>
                  <p>
                    {data.treatments.find((treatment) => treatment.id === item.treatmentId)?.name}
                  </p>
                  <div className="record-context">
                    <span>
                      {data.staff.find((staff) => staff.id === item.practitionerId)?.name}
                    </span>
                    <span>{data.rooms.find((room) => room.id === item.roomId)?.name}</span>
                  </div>
                </div>
                <span className={'badge ' + item.status}>{statusLabels[item.status]}</span>
              </Link>
            ))}
          </div>
        ) : (
          <Empty text="ไม่มีนัดหมายในวันที่เลือก" hint="จองคิวใหม่เพื่อเพิ่มนัดหมาย">
            <Link to="/appointments" className="button">
              จองคิวใหม่
            </Link>
          </Empty>
        )}
      </section>
      <section className="room-book">
        <h2>ห้องบริการ</h2>
        <dl>
          {data.rooms.map((room) => {
            const service = appointments.find(
              (item) => item.roomId === room.id && item.status === 'inService',
            );
            const current = appointments.find(
              (item) =>
                item.roomId === room.id &&
                ['scheduled', 'arrived'].includes(item.status) &&
                new Date(item.start) <= now &&
                new Date(item.end) > now,
            );
            const upcoming = appointments.find(
              (item) =>
                item.roomId === room.id &&
                ['scheduled', 'arrived'].includes(item.status) &&
                new Date(item.start) > now,
            );
            const item = service || current || upcoming;
            return (
              <div className="room-record" key={room.id}>
                <dt>{room.name}</dt>
                <dd>
                  {item ? (
                    <>
                      <span className={'badge ' + item.status}>
                        {service
                          ? 'กำลังรับบริการ'
                          : current
                            ? 'มีนัดในช่วงเวลานี้'
                            : 'นัดถัดไป ' + clock(item.start)}
                      </span>
                      <strong>
                        {data.customers.find((customer) => customer.id === item.customerId)?.name}
                      </strong>
                      <span className="small muted">
                        {data.staff.find((staff) => staff.id === item.practitionerId)?.name}
                      </span>
                    </>
                  ) : (
                    <span className="muted">ไม่มีนัดในช่วงเวลานี้</span>
                  )}
                </dd>
              </div>
            );
          })}
        </dl>
      </section>
    </div>
  );
}
