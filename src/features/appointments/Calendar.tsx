import { addDays, isSameDay, startOfWeek } from 'date-fns';
import { useLayoutEffect, useRef } from 'react';
import type { Appointment, ClinicData } from '../../domain/types';
import { statusLabels } from '../../domain/types';
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
  const scroll = useRef<HTMLDivElement>(null);
  const todayRow = useRef<HTMLButtonElement>(null);
  useLayoutEffect(() => {
    const element = scroll.current;
    if (!element) return;
    const tokens = getComputedStyle(element);
    const header = parseFloat(tokens.getPropertyValue('--calendar-header-height'));
    if (view === 'week') {
      element.scrollTop = todayRow.current ? Math.max(0, todayRow.current.offsetTop - header) : 0;
      return;
    }
    const starts = data.appointments
      .filter(
        (item) =>
          isSameDay(new Date(item.start), date) &&
          !['cancelled', 'noShow'].includes(item.status) &&
          (!staffId || item.practitionerId === staffId),
      )
      .map((item) => {
        const time = new Date(item.start);
        return (time.getHours() - 10) * 60 + time.getMinutes();
      });
    const hour = parseFloat(tokens.getPropertyValue('--calendar-hour-height'));
    element.scrollTop = starts.length
      ? Math.max(0, (Math.min(...starts) / 60) * hour - hour / 4)
      : 0;
  }, [date, view, staffId, data.appointments]);
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
        className={
          'calendar-event ' +
          item.status +
          (compact ? ' compact' : '') +
          (new Date(item.end).getTime() - new Date(item.start).getTime() <= 30 * 60000
            ? ' short-event'
            : '')
        }
        aria-label={[
          clock(item.start) + ' ถึง ' + clock(item.end),
          data.customers.find((customer) => customer.id === item.customerId)?.name,
          data.treatments.find((treatment) => treatment.id === item.treatmentId)?.name,
          data.rooms.find((room) => room.id === item.roomId)?.name,
          statusLabels[item.status],
        ].join(' ')}
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
        <span className="event-context">
          <span>
            {view === 'room'
              ? data.staff.find((staff) => staff.id === item.practitionerId)?.name
              : data.rooms.find((room) => room.id === item.roomId)?.name}
          </span>
          <span>{statusLabels[item.status]}</span>
        </span>
      </button>
    );
  }
  if (view === 'week') {
    const days = Array.from({ length: 7 }, (_, index) =>
      addDays(startOfWeek(date, { weekStartsOn: 1 }), index),
    );
    return (
      <div className={'calendar-scroll ' + (staffId ? 'personal-book' : '')} ref={scroll}>
        <div
          className="week-grid"
          style={{
            gridTemplateColumns: `var(--calendar-time-width) repeat(${practitioners.length},minmax(var(--calendar-column-min),1fr))`,
          }}
        >
          <div className="calendar-corner">วันที่</div>
          {practitioners.map((item) => (
            <div className="calendar-column" key={item.id}>
              <strong>{item.name}</strong>
            </div>
          ))}
          {days.map((day) => (
            <div key={day.toISOString()} className="week-row">
              <button
                className={'week-date ' + (isSameDay(day, new Date()) ? 'today' : '')}
                ref={isSameDay(day, new Date()) ? todayRow : undefined}
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
  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60 - 10;
  return (
    <>
      <div className={'calendar-scroll ' + (staffId ? 'personal-book' : '')} ref={scroll}>
        <div
          className="day-calendar"
          style={{
            gridTemplateColumns: `var(--calendar-time-width) repeat(${columns.length},minmax(var(--calendar-column-min),1fr))`,
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
              <span key={index} style={{ top: `calc(var(--calendar-hour-height) * ${index})` }}>
                {index + 10}:00
              </span>
            ))}
          </div>
          {columns.map((column) => (
            <div className="day-lane" key={column.id}>
              {Array.from({ length: 40 }, (_, index) => (
                <div
                  className={
                    index % 4 === 0
                      ? 'hour-line'
                      : index % 2 === 0
                        ? 'half-hour-line'
                        : 'quarter-hour-line'
                  }
                  key={index}
                  style={{ top: `calc(var(--calendar-hour-height) * ${index / 4})` }}
                />
              ))}
              {isSameDay(date, now) && currentHour >= 0 && currentHour <= 10 && (
                <div
                  className="current-time-line"
                  role="img"
                  aria-label={'ขณะนี้ ' + clock(now.toISOString())}
                  style={{ top: `calc(var(--calendar-hour-height) * ${currentHour})` }}
                />
              )}
              {dayEvents
                .filter((item) => matches(item, column.id))
                .map((item) => {
                  const start = new Date(item.start);
                  const top = `calc(var(--calendar-hour-height) * ${((start.getHours() - 10) * 60 + start.getMinutes()) / 60})`;
                  const height = `calc(var(--calendar-hour-height) * ${(new Date(item.end).getTime() - start.getTime()) / 3600000})`;
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
          <Empty
            text="ไม่มีนัดหมายในวันที่เลือก"
            hint={staffId ? 'เลือกวันอื่น' : 'เลือกวันอื่น หรือจองคิวใหม่'}
          />
        </div>
      )}
    </>
  );
}
