import type { ClinicData, Course } from '../../domain/types';
import { thaiDate } from '../../lib/format';
import { Empty } from '../../components/ui';
export const reservedSessions = (data: ClinicData, id: string) =>
  data.appointments.filter(
    (item) => item.courseId === id && ['scheduled', 'arrived', 'inService'].includes(item.status),
  ).length;
export function CourseCards({
  courses,
  data,
  onSelect,
  showCustomer = true,
}: {
  courses: Course[];
  data: ClinicData;
  onSelect?: (course: Course) => void;
  showCustomer?: boolean;
}) {
  if (!courses.length)
    return <Empty text="ไม่มีคอร์สที่ใช้งานได้" hint="ขายคอร์สเพื่อบันทึกสิทธิ์รับบริการใหม่" />;
  return (
    <>
      <div className="table-wrap desktop-only">
        <table className="data-table">
          <thead>
            <tr>
              <th>คอร์ส</th>
              {showCustomer && <th>ลูกค้า</th>}
              <th className="numeric">คงเหลือ / ทั้งหมด</th>
              <th className="numeric">จองไว้</th>
              <th>หมดอายุ</th>
              {onSelect && <th>ประวัติ</th>}
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => {
              const expiry = new Date(course.expiresAt);
              const expired = expiry < new Date();
              const soon = !expired && expiry.getTime() - Date.now() <= 30 * 86400000;
              return (
                <tr className="course-card" key={course.id}>
                  <td>
                    <strong>
                      {data.treatments.find((item) => item.id === course.treatmentId)?.name}
                    </strong>
                  </td>
                  {showCustomer && (
                    <td>{data.customers.find((item) => item.id === course.customerId)?.name}</td>
                  )}
                  <td className="numeric">
                    <strong>{course.remaining}</strong> / {course.total} ครั้ง
                  </td>
                  <td className="numeric">{reservedSessions(data, course.id)} ครั้ง</td>
                  <td>
                    <time>{thaiDate(course.expiresAt)}</time>
                    {(expired || soon) && (
                      <p>
                        <span className={'badge ' + (expired ? 'cancelled' : 'arrived')}>
                          {expired ? 'หมดอายุ' : 'ใกล้หมดอายุ'}
                        </span>
                      </p>
                    )}
                  </td>
                  {onSelect && (
                    <td>
                      <button className="link" onClick={() => onSelect(course)}>
                        ดูประวัติการใช้
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mobile-list">
        {courses.map((course) => {
          const expiry = new Date(course.expiresAt);
          const expired = expiry < new Date();
          const soon = !expired && expiry.getTime() - Date.now() <= 30 * 86400000;
          return (
            <article className="course-card" key={course.id}>
              <div className="card-row-head">
                <h3>{data.treatments.find((item) => item.id === course.treatmentId)?.name}</h3>
                {(expired || soon) && (
                  <span className={'badge ' + (expired ? 'cancelled' : 'arrived')}>
                    {expired ? 'หมดอายุ' : 'ใกล้หมดอายุ'}
                  </span>
                )}
              </div>
              {showCustomer && (
                <p className="muted">
                  {data.customers.find((item) => item.id === course.customerId)?.name}
                </p>
              )}
              <dl className="course-fields">
                <div>
                  <dt>คงเหลือ / ทั้งหมด</dt>
                  <dd className="numeric">
                    <strong>{course.remaining}</strong> / {course.total} ครั้ง
                  </dd>
                </div>
                <div>
                  <dt>จองไว้</dt>
                  <dd className="numeric">{reservedSessions(data, course.id)} ครั้ง</dd>
                </div>
                <div>
                  <dt>หมดอายุ</dt>
                  <dd>
                    <time>{thaiDate(course.expiresAt)}</time>
                  </dd>
                </div>
              </dl>
              {onSelect && (
                <button className="link" onClick={() => onSelect(course)}>
                  ดูประวัติการใช้
                </button>
              )}
            </article>
          );
        })}
      </div>
    </>
  );
}
