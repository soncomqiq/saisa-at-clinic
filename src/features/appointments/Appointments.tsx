import { useState } from 'react';
import { Link } from 'react-router-dom';
import { addDays, startOfDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Pencil, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';
import type { Appointment, Status } from '../../domain/types';
import { statusLabels, transitions } from '../../domain/types';
import { useAuth } from '../../components/context';
import { Confirm, Modal, PageTitle, Skeleton } from '../../components/ui';
import { getService } from '../../services';
import { useClinic } from '../../services/useClinic';
import { clock, errorMessage, localDate, thaiDate } from '../../lib/format';
import { BookingForm } from './BookingForm';
import { Calendar } from './Calendar';
export function Appointments() {
  const { session } = useAuth();
  const { data, error, refresh } = useClinic();
  const [date, setDate] = useState(startOfDay(new Date()));
  const [view, setView] = useState('day');
  const [booking, setBooking] = useState<Appointment | 'new' | null>(null);
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [warning, setWarning] = useState('');
  const [pending, setPending] = useState<Status | null>(null);
  const [busy, setBusy] = useState(false);
  if (error) return <p className="error">{error}</p>;
  if (!data) return <Skeleton />;
  const practitioner = session?.role === 'practitioner';
  async function change(status: Status) {
    setBusy(true);
    setPending(null);
    try {
      await getService().transition(selected!.id, status);
      toast.success('เปลี่ยนสถานะเป็น ' + statusLabels[status]);
      await refresh();
      setSelected(null);
      setWarning('');
    } catch (error) {
      setWarning(errorMessage(error));
      toast.error(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div data-ready="true">
      <PageTitle
        title={practitioner ? 'ตารางนัดหมายของฉัน' : 'จองคิว'}
        subtitle={practitioner ? session.name : undefined}
      >
        {!practitioner && (
          <button className="button" onClick={() => setBooking('new')}>
            <Plus size={18} />
            จองคิวใหม่
          </button>
        )}
      </PageTitle>
      <div className="toolbar calendar-toolbar">
        <div className="actions">
          <button
            className="icon-button bordered"
            title="ก่อนหน้า"
            onClick={() => setDate(addDays(date, view === 'week' ? -7 : -1))}
          >
            <ChevronLeft size={18} />
          </button>
          <button className="button secondary" onClick={() => setDate(startOfDay(new Date()))}>
            วันนี้
          </button>
          <button
            className="icon-button bordered"
            title="ถัดไป"
            onClick={() => setDate(addDays(date, view === 'week' ? 7 : 1))}
          >
            <ChevronRight size={18} />
          </button>
        </div>
        <label className="calendar-date">
          <input
            aria-label="เลือกวันที่"
            type="date"
            value={localDate(date)}
            onChange={(event) =>
              event.target.value && setDate(new Date(event.target.value + 'T00:00:00'))
            }
          />
        </label>
        <div className="segmented">
          {[['day', 'วัน'], ['week', 'สัปดาห์'], ...(!practitioner ? [['room', 'ห้อง']] : [])].map(
            ([value, label]) => (
              <button
                key={value}
                className={view === value ? 'active' : ''}
                onClick={() => setView(value)}
              >
                {label}
              </button>
            ),
          )}
        </div>
      </div>
      <div className="calendar-legend">
        <span className="small muted">{thaiDate(date, 'd MMM yyyy')}</span>
      </div>
      <Calendar
        data={data}
        date={date}
        view={view}
        staffId={practitioner ? session.staffId : undefined}
        onSelect={(item) => {
          setSelected(item);
          setWarning('');
        }}
        onDay={(day) => {
          setDate(day);
          setView('day');
        }}
      />
      {booking && (
        <BookingForm
          key={typeof booking === 'string' ? 'new' : booking.id}
          data={data}
          date={date}
          appointment={typeof booking === 'string' ? undefined : booking}
          onClose={() => setBooking(null)}
          onSuccess={refresh}
        />
      )}
      <Modal title="รายละเอียดนัดหมาย" open={!!selected} onClose={() => setSelected(null)}>
        {selected && (
          <>
            <span className={'badge ' + selected.status}>{statusLabels[selected.status]}</span>
            <h2 className="detail-customer">
              {data.customers.find((item) => item.id === selected.customerId)?.name}
            </h2>
            <p className="muted">
              {data.treatments.find((item) => item.id === selected.treatmentId)?.name}
            </p>
            <div className="divider" />
            <dl className="details-grid">
              <div>
                <dt>วันและเวลา</dt>
                <dd>
                  {thaiDate(selected.start)}
                  <br />
                  {clock(selected.start)}–{clock(selected.end)}
                </dd>
              </div>
              <div>
                <dt>ผู้ให้บริการ</dt>
                <dd>{data.staff.find((item) => item.id === selected.practitionerId)?.name}</dd>
              </div>
              <div>
                <dt>ห้องบริการ</dt>
                <dd>{data.rooms.find((item) => item.id === selected.roomId)?.name}</dd>
              </div>
            </dl>
            {selected.courseId && (
              <p className="small accent section">ใช้คอร์ส หัก 1 ครั้งเมื่อจบบริการ</p>
            )}
            <div className="actions section">
              <Link className="button secondary" to={'/customers/' + selected.customerId}>
                <ArrowUpRight size={16} />
                ข้อมูลลูกค้า
              </Link>
              {!practitioner && selected.status === 'scheduled' && (
                <button
                  className="button secondary"
                  onClick={() => {
                    setBooking(selected);
                    setSelected(null);
                  }}
                >
                  <Pencil size={16} />
                  แก้ไขนัดหมาย
                </button>
              )}
            </div>
            <div className="actions section">
              {transitions[selected.status]
                .filter((status) => !practitioner || !['cancelled', 'noShow'].includes(status))
                .map((status) => (
                  <button
                    key={status}
                    disabled={busy}
                    className={
                      'button ' + (['cancelled', 'noShow'].includes(status) ? 'secondary' : '')
                    }
                    onClick={() =>
                      ['cancelled', 'noShow'].includes(status)
                        ? setPending(status)
                        : void change(status)
                    }
                  >
                    {
                      {
                        arrived: 'บันทึกการมาถึง',
                        inService: 'เริ่มบริการ',
                        completed: 'จบบริการ',
                        cancelled: 'ยกเลิกนัดหมาย',
                        noShow: 'บันทึกไม่มาตามนัด',
                        scheduled: 'นัดแล้ว',
                      }[status]
                    }
                  </button>
                ))}
            </div>
            {warning && (
              <p className="error section" role="alert">
                {warning}
              </p>
            )}
          </>
        )}
      </Modal>
      <Confirm
        open={!!pending}
        onClose={() => setPending(null)}
        onConfirm={() => pending && void change(pending)}
        title={pending ? statusLabels[pending] : ''}
        actionLabel={pending === 'noShow' ? 'บันทึกไม่มาตามนัด' : 'ยกเลิกนัดหมาย'}
        description="ยืนยันเปลี่ยนสถานะนัดหมาย รายการนี้จะคืนสิทธิ์การจองคอร์สและไม่สามารถย้อนกลับได้"
      />
    </div>
  );
}
