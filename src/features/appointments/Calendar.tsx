import { addDays, isSameDay, startOfWeek } from 'date-fns';
import type { Appointment, ClinicData } from '../../domain/types';
import { clock, thaiDate } from '../../lib/format';
import { Empty } from '../../components/ui';
export function Calendar({
  data,
  date,
  view,
  staffId,
  onSelect,
  onDay,
}: {
  data: ClinicData;
  date: Date;
  view: string;
  staffId?: string;
  onSelect: (appointment: Appointment) => void;
  onDay: (date: Date) => void;
}) {
  const practitioners = data.staff.filter(
    (item) => item.kind !== 'receptionist' && (!staffId || item.id === staffId),
  );
  const columns = view === 'room' ? data.rooms : practitioners;
  const matches = (item: Appointment, columnId: string) =>
    view === 'room' ? item.roomId === columnId : item.practitionerId === columnId;
  const events = data.appointments.filter(
    (item) => item.status !== 'cancelled' && item.status !== 'noShow',
  );
  function eventCard(item: Appointment, compact = false) {
    return (
      <button
        key={item.id}
        className={'calendar-event ' + item.status + (compact ? ' compact' : '')}
        title={
          data.customers.find((customer) => customer.id === item.customerId)?.name +
          ' · ' +
          data.treatments.find((treatment) => treatment.id === item.treatmentId)?.name
        }
        onClick={() => onSelect(item)}
      >
        <span className="event-time">
          {clock(item.start)}–{clock(item.end)}
        </span>
        <strong>{data.customers.find((customer) => customer.id === item.customerId)?.name}</strong>
        {!compact && (
          <span className="event-treatment">
            {data.treatments.find((treatment) => treatment.id === item.treatmentId)?.name}
          </span>
        )}
      </button>
    );
  }
  if (view === 'week') {
    const days = Array.from({ length: 7 }, (_, index) =>
      addDays(startOfWeek(date, { weekStartsOn: 1 }), index),
    );
    return (
      <div className="calendar-scroll">
        <div
          className="week-grid"
          style={{
            gridTemplateColumns: `90px repeat(${practitioners.length},minmax(145px,1fr))`,
            minWidth: staffId ? 280 : 850,
          }}
        >
          <div className="calendar-corner">วันที่</div>
          {practitioners.map((item) => (
            <div className="calendar-column" key={item.id}>
              <div className="avatar small">
                {item.name.replace('พญ. ', '').replace('นพ. ', '').slice(0, 1)}
              </div>
              <strong>{item.name}</strong>
            </div>
          ))}
          {days.map((day) => (
            <div key={day.toISOString()} className="week-row">
              <button
                className={'week-date ' + (isSameDay(day, new Date()) ? 'today' : '')}
                onClick={() => onDay(day)}
              >
                <strong>{thaiDate(day, 'EEE')}</strong>
                <span>{thaiDate(day, 'd MMM')}</span>
              </button>
              {practitioners.map((practitioner) => {
                const items = events
                  .filter(
                    (item) =>
                      isSameDay(new Date(item.start), day) &&
                      item.practitionerId === practitioner.id,
                  )
                  .sort((first, second) => first.start.localeCompare(second.start));
                return (
                  <div key={practitioner.id} className="week-cell">
                    {items.slice(0, 2).map((item) => eventCard(item, true))}
                    {items.length > 2 && (
                      <button className="small link" onClick={() => onDay(day)}>
                        อีก {items.length - 2} นัดหมาย
                      </button>
                    )}
                    {!items.length && <span className="week-empty">—</span>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }
  const dayEvents = events.filter((item) => isSameDay(new Date(item.start), date));
  return (
    <>
      <div className="calendar-scroll">
        <div
          className="day-calendar"
          style={{
            gridTemplateColumns: `54px repeat(${columns.length},minmax(160px,1fr))`,
            minWidth: columns.length * 160 + 54,
          }}
        >
          <div className="calendar-corner">เวลา</div>
          {columns.map((item) => (
            <div className="calendar-column" key={item.id}>
              <strong>{item.name}</strong>
              <span>{dayEvents.filter((event) => matches(event, item.id)).length} นัดหมาย</span>
            </div>
          ))}
          <div className="time-column">
            {Array.from({ length: 11 }, (_, index) => (
              <span key={index} style={{ top: index * 76 }}>
                {index + 10}:00
              </span>
            ))}
          </div>
          {columns.map((column) => (
            <div className="day-lane" key={column.id}>
              {Array.from({ length: 10 }, (_, index) => (
                <div className="hour-line" key={index} style={{ top: index * 76 }} />
              ))}
              {dayEvents
                .filter((item) => matches(item, column.id))
                .map((item) => {
                  const start = new Date(item.start);
                  const top = (((start.getHours() - 10) * 60 + start.getMinutes()) / 60) * 76;
                  const height = ((new Date(item.end).getTime() - start.getTime()) / 3600000) * 76;
                  return (
                    <div className="positioned-event" key={item.id} style={{ top, height }}>
                      {eventCard(item)}
                    </div>
                  );
                })}
            </div>
          ))}
        </div>
      </div>
      {!dayEvents.length && (
        <div className="section">
          <Empty text="วันนี้ยังไม่มีนัดหมาย" />
        </div>
      )}
    </>
  );
}
