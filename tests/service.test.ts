import { beforeEach, describe, expect, it } from 'vitest';
import { MockClinicService } from '../src/services/mock';
import { generateSeed } from '../src/services/seed';
import type { BookingInput } from '../src/services/contracts';
class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  get length() {
    return this.values.size;
  }
  clear() {
    this.values.clear();
  }
  getItem(key: string) {
    return this.values.get(key) ?? null;
  }
  key(index: number) {
    return [...this.values.keys()][index] ?? null;
  }
  removeItem(key: string) {
    this.values.delete(key);
  }
  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}
const now = new Date(2026, 9, 3, 9);
let service: MockClinicService;
beforeEach(async () => {
  service = new MockClinicService(new MemoryStorage(), 0, () => now);
  await service.login('owner', 's1', 'demo@clinic.test', 'demo1234');
});
describe('seed and stock transactions', () => {
  it('reproduces fictional data with relative dates', () => {
    const data = generateSeed(now);
    expect(data).toEqual(generateSeed(now));
    expect(data.customers).toHaveLength(120);
    expect(data.products).toHaveLength(30);
    expect(data.treatments).toHaveLength(25);
    expect(data.courses).toHaveLength(80);
    expect(data.appointments.length).toBeGreaterThanOrEqual(500);
  });
  it('does not persist insufficient stock', async () => {
    const before = await service.snapshot();
    await expect(service.stock('p1', -1000, 'ทดสอบ')).rejects.toThrow('สต็อกไม่เพียงพอ');
    expect(await service.snapshot()).toEqual(before);
  });
  it('rejects a conflicting practitioner or room and outside opening hours', async () => {
    const data = await service.snapshot();
    const existing = data.appointments.find(
      (item) => new Date(item.start) > now && item.status === 'scheduled',
    )!;
    const input: BookingInput = { ...existing };
    await expect(service.book(input)).rejects.toThrow('มีนัดหมายแล้ว');
    const start = new Date(now);
    start.setDate(start.getDate() + 16);
    start.setHours(19, 45);
    await expect(
      service.book({ ...input, start: start.toISOString(), treatmentId: 't1' }),
    ).rejects.toThrow('เวลาเปิดบริการ');
  });
  it('redacts practitioner financial data and enforces mutation permissions', async () => {
    await service.login('practitioner', 's1', 'demo@clinic.test', 'demo1234');
    const data = await service.snapshot();
    expect(data.sales).toEqual([]);
    expect(data.products).toEqual([]);
    expect(data.courses).toEqual([]);
    expect(data.treatments.every((item) => item.price === undefined)).toBe(true);
    expect(data.appointments.every((item) => item.practitionerId === 's1')).toBe(true);
    await expect(service.stock('p1', 2, 'รับเข้า')).rejects.toThrow('สิทธิ์');
  });
  it('redacts receptionist precautions and aggregate revenue', async () => {
    await service.login('receptionist', 's1', 'demo@clinic.test', 'demo1234');
    const data = await service.snapshot();
    expect(data.customers.every((item) => item.precaution === undefined)).toBe(true);
    expect(data.sales).toEqual([]);
  });
  it('rescheduling still rejects conflicts and preserves the original appointment', async () => {
    const before = await service.snapshot();
    const future = before.appointments.filter(
      (item) => new Date(item.start) > now && item.status === 'scheduled',
    );
    const first = future[0],
      second = future[1];
    await expect(
      service.book(
        {
          ...first,
          start: second.start,
          practitionerId: second.practitionerId,
          roomId: second.roomId,
        },
        first.id,
      ),
    ).rejects.toThrow('มีนัดหมายแล้ว');
    expect(await service.snapshot()).toEqual(before);
  });
  it('deducts course and supplies only on completion, never twice', async () => {
    const before = await service.snapshot();
    const course = before.courses[25];
    const start = new Date(now);
    start.setDate(start.getDate() + 16);
    start.setHours(10);
    const booking = await service.book({
      customerId: course.customerId,
      treatmentId: course.treatmentId,
      courseId: course.id,
      practitionerId: 's1',
      roomId: 'r1',
      start: start.toISOString(),
    });
    expect((await service.snapshot()).courses[25].remaining).toBe(course.remaining);
    await expect(service.transition(booking.id, 'completed')).rejects.toThrow('ลำดับ');
    await service.transition(booking.id, 'arrived');
    await service.transition(booking.id, 'inService');
    await service.transition(booking.id, 'completed');
    const after = await service.snapshot();
    expect(after.courses[25].remaining).toBe(course.remaining - 1);
    for (const supply of before.treatments[0].consumables)
      expect(after.products.find((item) => item.id === supply.productId)!.stock).toBe(
        before.products.find((item) => item.id === supply.productId)!.stock - supply.quantity,
      );
    await expect(service.transition(booking.id, 'completed')).rejects.toThrow('ลำดับ');
    expect(await service.snapshot()).toEqual(after);
  });
  it('rolls back course and stock if supplies are exhausted', async () => {
    const data = await service.snapshot();
    const course = data.courses[25];
    const supply = data.treatments[0].consumables[0];
    const product = data.products.find((item) => item.id === supply.productId)!;
    await service.stock(product.id, -product.stock, 'ทดสอบหมด');
    const start = new Date(now);
    start.setDate(start.getDate() + 16);
    start.setHours(10);
    const appointment = await service.book({
      customerId: course.customerId,
      treatmentId: course.treatmentId,
      courseId: course.id,
      practitionerId: 's1',
      roomId: 'r1',
      start: start.toISOString(),
    });
    await service.transition(appointment.id, 'arrived');
    await service.transition(appointment.id, 'inService');
    const before = await service.snapshot();
    await expect(service.transition(appointment.id, 'completed')).rejects.toThrow('ไม่เพียงพอ');
    expect(await service.snapshot()).toEqual(before);
  });
  it('reserves all remaining course sessions and releases cancelled reservations', async () => {
    const course = (await service.snapshot()).courses[30];
    const start = new Date(now);
    start.setDate(start.getDate() + 15);
    start.setHours(10);
    const input = {
      customerId: course.customerId,
      treatmentId: course.treatmentId,
      courseId: course.id,
      practitionerId: 's1',
      roomId: 'r1',
      start: start.toISOString(),
    };
    const booked = [];
    for (let index = 0; index < course.remaining; index++) {
      const time = new Date(start);
      time.setDate(time.getDate() + index);
      booked.push(await service.book({ ...input, start: time.toISOString() }));
    }
    const excess = new Date(start);
    excess.setDate(excess.getDate() + course.remaining);
    await expect(service.book({ ...input, start: excess.toISOString() })).rejects.toThrow(
      'ถูกจองไว้ครบ',
    );
    await service.transition(booked[0].id, 'cancelled');
    await expect(service.book({ ...input, start: excess.toISOString() })).resolves.toBeTruthy();
  });
  it('rejects a course expired on the booking date', async () => {
    const course = (await service.snapshot()).courses[0];
    const start = new Date(now);
    start.setDate(start.getDate() + 40);
    start.setHours(10);
    await expect(
      service.book({
        customerId: course.customerId,
        treatmentId: course.treatmentId,
        courseId: course.id,
        practitionerId: 's1',
        roomId: 'r1',
        start: start.toISOString(),
      }),
    ).rejects.toThrow('หมดอายุ');
  });
  it('aggregates duplicate product quantities and rolls back an oversell', async () => {
    const before = await service.snapshot();
    const line = {
      kind: 'product' as const,
      itemId: 'p1',
      name: 'ปลอม',
      quantity: 2,
      unitPrice: 1,
    };
    await expect(service.checkout('c1', [line, line], 'cash')).rejects.toThrow('ไม่เพียงพอ');
    expect(await service.snapshot()).toEqual(before);
  });
  it('uses authoritative prices and atomically creates course, sale and stock movements', async () => {
    const before = await service.snapshot();
    const sale = await service.checkout(
      'c1',
      [
        { kind: 'product', itemId: 'p1', name: 'ปลอม', quantity: 1, unitPrice: 1 },
        {
          kind: 'course',
          itemId: 't1',
          name: 'ปลอม',
          quantity: 1,
          unitPrice: 1,
          sessions: 10,
          months: 12,
        },
      ],
      'card',
    );
    const after = await service.snapshot();
    expect(sale.total).toBe(
      before.products[0].price! + Math.round(before.treatments[0].price! * 10 * 0.85),
    );
    expect(after.products[0].stock).toBe(before.products[0].stock - 1);
    expect(after.courses.length).toBe(before.courses.length + 1);
    expect(after.movements.length).toBe(before.movements.length + 1);
    expect((await service.customerSales('c1')).some((item) => item.id === sale.id)).toBe(true);
  });
});
