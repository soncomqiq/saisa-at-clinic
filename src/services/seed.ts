import { addDays, startOfDay } from 'date-fns';
import type { Appointment, ClinicData } from '../domain/types';
export function seededRandom(seed = 20261003) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
export function generateSeed(now = new Date()): ClinicData {
  const random = seededRandom();
  const today = startOfDay(now);
  const pick = <T>(items: T[]) => items[Math.floor(random() * items.length)];
  const staff: ClinicData['staff'] = [
    { id: 's1', name: 'พญ. ลลิน ใจละมุน', kind: 'doctor' },
    { id: 's2', name: 'นพ. ธารา รุ่งใส', kind: 'doctor' },
    { id: 's3', name: 'คุณมะลิ', kind: 'therapist' },
    { id: 's4', name: 'คุณพลอย', kind: 'therapist' },
    { id: 's5', name: 'คุณอิง', kind: 'therapist' },
    { id: 's6', name: 'คุณน้ำใส', kind: 'receptionist' },
    { id: 's7', name: 'คุณขวัญ', kind: 'receptionist' },
  ];
  const rooms = Array.from({ length: 4 }, (_, index) => ({
    id: 'r' + (index + 1),
    name: 'ห้อง ' + (index + 1),
  }));
  const retail = [
    'เจลล้างหน้าอ่อนโยน',
    'เซรั่มเติมความชุ่มชื้น',
    'ครีมบำรุงผิวหน้า',
    'ครีมกันแดดเนื้อบางเบา',
    'โทนเนอร์ผิวกระจ่างใส',
    'มาสก์ปลอบประโลมผิว',
    'น้ำมันบำรุงผิวกาย',
    'โลชั่นผิวนุ่ม',
    'บาล์มริมฝีปาก',
    'ครีมบำรุงรอบดวงตา',
    'สครับผิวละเอียด',
    'เซรั่มวิตามินผิว',
    'เจลแต้มผิว',
    'ครีมกลางคืน',
    'โฟมทำความสะอาด',
    'มาสก์ผิวชุ่มชื้น',
    'สเปรย์น้ำแร่',
    'ครีมบำรุงมือ',
  ];
  const supplies = [
    'สำลีแผ่น',
    'ถุงมือ',
    'เจลนำแสง',
    'มาสก์สำหรับทรีตเมนต์',
    'ผ้ารองเตียง',
    'น้ำมันนวด',
    'แอลกอฮอล์',
    'ผ้าก๊อซ',
    'ไม้พาย',
    'หมวกคลุมผม',
    'เจลอัลตราซาวด์',
    'สครับสำหรับสปา',
  ];
  const products: ClinicData['products'] = [...retail, ...supplies].map((name, index) => ({
    id: 'p' + (index + 1),
    name,
    kind: index < 18 ? 'retail' : 'consumable',
    unit: index < 18 ? 'ชิ้น' : 'หน่วย',
    price: (290 + (index % 7) * 130) * 100,
    stock: index % 7 === 0 ? 3 : 30 + Math.floor(random() * 80),
    minimum: index < 18 ? 8 : 15,
  }));
  const names = [
    'ดูแลผิวหน้าเติมน้ำ',
    'ทำความสะอาดผิวล้ำลึก',
    'ฟื้นฟูผิวกระจ่างใส',
    'ปลอบประโลมผิวแพ้ง่าย',
    'ดูแลผิวเป็นสิว',
    'ยกกระชับผิวหน้า',
    'บำรุงผิววิตามิน',
    'มาสก์ผิวอ่อนโยน',
    'ผลัดผิวอย่างอ่อนโยน',
    'นวดหน้าผ่อนคลาย',
    'เลเซอร์ลดรอยหมองคล้ำ',
    'เลเซอร์ผิวเรียบเนียน',
    'เลเซอร์กำจัดขนรักแร้',
    'เลเซอร์กำจัดขนแขน',
    'เลเซอร์กำจัดขนขา',
    'เลเซอร์ฟื้นฟูผิว',
    'เลเซอร์ลดรอยสิว',
    'เลเซอร์จุดด่างดำ',
    'นวดอโรมาผ่อนคลาย',
    'นวดคอบ่าไหล่',
    'สปาผิวกายชุ่มชื้น',
    'สครับผิวกาย',
    'นวดเท้าผ่อนคลาย',
    'สปามือและเล็บ',
    'สปาเท้าเนียนนุ่ม',
  ];
  const treatments: ClinicData['treatments'] = names.map((name, index) => ({
    id: 't' + (index + 1),
    name,
    category: index < 10 ? 'ทรีตเมนต์ผิวหน้า' : index < 18 ? 'เลเซอร์' : 'สปา',
    duration: [
      60, 45, 60, 30, 60, 60, 45, 30, 45, 60, 45, 60, 30, 45, 60, 45, 45, 30, 90, 60, 90, 60, 45,
      45, 45,
    ][index],
    price: (650 + (index % 9) * 250) * 100,
    consumables: [
      { productId: index < 10 ? 'p22' : index < 18 ? 'p21' : 'p24', quantity: 1 },
      { productId: 'p20', quantity: 1 },
    ],
  }));
  const first = [
    'ละออง',
    'พิมพ์ใส',
    'ดาวเหนือ',
    'น้ำค้าง',
    'เดือนฉาย',
    'อรุณ',
    'แพรวา',
    'สายฝน',
    'แก้วตา',
    'พฤกษ์',
    'ณิชา',
    'ทิวา',
    'รินรดา',
    'ปลายฟ้า',
    'ธาริน',
    'ขวัญข้าว',
    'จันทร์เจ้า',
    'ไออุ่น',
    'วาริน',
    'เมษา',
  ];
  const last = ['ใจสว่าง', 'ร่มเย็น', 'แสงละมุน', 'รุ่งอรุณ', 'งามผ่อง', 'สุขสงบ'];
  const customers: ClinicData['customers'] = Array.from({ length: 120 }, (_, index) => ({
    id: 'c' + (index + 1),
    name: first[index % 20] + ' ' + last[Math.floor(index / 20)],
    phone: '08' + String(10000000 + index * 137).padStart(8, '0'),
    precaution:
      index % 9 === 0
        ? 'แพ้น้ำหอม กรุณาใช้ผลิตภัณฑ์สูตรอ่อนโยน'
        : index % 13 === 0
          ? 'ผิวไวต่อแสง ควรหลีกเลี่ยงการสัมผัสแดดหลังบริการ'
          : 'ไม่มีข้อควรระวังที่แจ้งไว้',
    createdAt: addDays(today, -200 - index).toISOString(),
  }));
  const courses: ClinicData['courses'] = Array.from({ length: 80 }, (_, index) => ({
    id: 'co' + (index + 1),
    customerId: 'c' + ((index % 70) + 1),
    treatmentId: 't' + ((index % 25) + 1),
    total: 10,
    remaining: 10,
    purchasedAt: addDays(today, -15 - Math.floor(random() * 170)).toISOString(),
    expiresAt: addDays(today, index % 8 === 0 ? 10 + (index % 20) : 120 + index).toISOString(),
    saleId: 'sale-co' + (index + 1),
    usages: [],
  }));
  const sales: ClinicData['sales'] = courses.map((course) => {
    const treatment = treatments.find((item) => item.id === course.treatmentId)!;
    return {
      id: course.saleId,
      customerId: course.customerId,
      lines: [
        {
          kind: 'course',
          itemId: treatment.id,
          name: treatment.name,
          quantity: 1,
          unitPrice: Math.round(treatment.price! * 10 * 0.85),
          sessions: 10,
          months: 12,
        },
      ],
      total: Math.round(treatment.price! * 10 * 0.85),
      date: course.purchasedAt,
      payment: 'transfer',
    };
  });
  for (let index = 0; index < 220; index++) {
    const treatment = pick(treatments);
    const product = pick(products.filter((item) => item.kind === 'retail'));
    sales.push({
      id: 'sale' + index,
      customerId: pick(customers).id,
      lines: [
        {
          kind: 'treatment',
          itemId: treatment.id,
          name: treatment.name,
          quantity: 1,
          unitPrice: treatment.price!,
        },
        {
          kind: 'product',
          itemId: product.id,
          name: product.name,
          quantity: 1,
          unitPrice: product.price!,
        },
      ],
      total: treatment.price! + product.price!,
      date: addDays(today, index < 8 ? 0 : -Math.floor(random() * 180)).toISOString(),
      payment: pick(['cash', 'transfer', 'card']),
    });
  }
  const appointments: Appointment[] = [];
  function allocate(offset: number, customerId?: string, treatmentId?: string, courseId?: string) {
    for (let attempt = 0; attempt < 150; attempt++) {
      const treatment = treatments.find((item) => item.id === treatmentId) || pick(treatments);
      const practitioner = pick(staff.slice(0, 5));
      const room = pick(rooms);
      const start = addDays(today, offset);
      const hour = random() < 0.65 ? 16 + Math.floor(random() * 3) : 10 + Math.floor(random() * 6);
      start.setHours(hour, pick([0, 15, 30]), 0, 0);
      const end = new Date(start.getTime() + treatment.duration * 60000);
      if (end.getHours() > 20 || (end.getHours() === 20 && end.getMinutes() > 0)) continue;
      if (
        appointments.some(
          (item) =>
            item.status !== 'cancelled' &&
            item.status !== 'noShow' &&
            (item.practitionerId === practitioner.id || item.roomId === room.id) &&
            new Date(item.start) < end &&
            new Date(item.end) > start,
        )
      )
        continue;
      const status =
        offset < 0
          ? random() < 0.92
            ? 'completed'
            : pick(['cancelled', 'noShow'] as const)
          : 'scheduled';
      const appointment: Appointment = {
        id: 'a' + (appointments.length + 1),
        customerId: customerId || pick(customers).id,
        treatmentId: treatment.id,
        practitionerId: practitioner.id,
        roomId: room.id,
        start: start.toISOString(),
        end: end.toISOString(),
        status,
        courseId,
      };
      appointments.push(appointment);
      if (courseId && status === 'completed') {
        const course = courses.find((item) => item.id === courseId)!;
        course.remaining--;
        course.usages.push({ appointmentId: appointment.id, date: appointment.end });
      }
      return;
    }
  }
  courses.forEach((course, index) => {
    for (let visit = 0; visit < 3; visit++)
      allocate(-5 - visit * 14 - (index % 9), course.customerId, course.treatmentId, course.id);
    if (index < 24) allocate((index % 14) + 1, course.customerId, course.treatmentId, course.id);
  });
  for (let index = 0; appointments.length < 480 && index < 1500; index++) {
    let offset = -1 - Math.floor(random() * 180);
    if (random() < 0.5) {
      const day = addDays(today, offset).getDay();
      if (day !== 0 && day !== 6) offset -= day;
    }
    allocate(offset);
  }
  for (let index = 0; index < 12; index++) allocate(0);
  for (let index = 0; index < 50; index++) allocate(1 + Math.floor(random() * 14));
  const movements: ClinicData['movements'] = products.map((product, index) => ({
    id: 'm' + index,
    productId: product.id,
    quantity: product.stock,
    reason: 'ยอดตั้งต้น',
    date: addDays(today, -1).toISOString(),
  }));
  return {
    staff,
    rooms,
    treatments,
    products,
    customers,
    courses,
    appointments,
    history: appointments,
    sales,
    movements,
  };
}
