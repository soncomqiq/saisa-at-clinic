import { beforeEach, describe, expect, it } from 'vitest';
import { MockClinicService } from '../src/services/mock';
import { generateSeed } from '../src/services/seed';
import type { BookingInput } from '../src/services/contracts';
class MemoryStorage implements Storage { private values=new Map<string,string>(); get length(){return this.values.size;} clear(){this.values.clear();}getItem(key:string){return this.values.get(key)??null;}key(index:number){return [...this.values.keys()][index]??null;}removeItem(key:string){this.values.delete(key);}setItem(key:string,value:string){this.values.set(key,value);} }
const now=new Date(2026,9,3,9);
let service:MockClinicService;
beforeEach(async()=>{service=new MockClinicService(new MemoryStorage(),0,()=>now);await service.login('owner','s1','demo@clinic.test','demo1234');});
describe('seed and stock transactions',()=>{
  it('reproduces fictional data with relative dates',()=>{const data=generateSeed(now);expect(data).toEqual(generateSeed(now));expect(data.customers).toHaveLength(120);expect(data.products).toHaveLength(30);expect(data.treatments).toHaveLength(25);expect(data.courses).toHaveLength(80);expect(data.appointments.length).toBeGreaterThanOrEqual(500);});
  it('does not persist insufficient stock',async()=>{const before=await service.snapshot();await expect(service.stock('p1',-1000,'ทดสอบ')).rejects.toThrow('สต็อกไม่เพียงพอ');expect(await service.snapshot()).toEqual(before);});
  it('rejects a conflicting practitioner or room and outside opening hours',async()=>{const data=await service.snapshot();const existing=data.appointments.find(item=>new Date(item.start)>now&&item.status==='scheduled')!;const input:BookingInput={...existing};await expect(service.book(input)).rejects.toThrow('มีนัดหมายแล้ว');const start=new Date(now);start.setDate(start.getDate()+16);start.setHours(19,45);await expect(service.book({...input,start:start.toISOString(),treatmentId:'t1'})).rejects.toThrow('เวลาเปิดบริการ');});
  it('redacts practitioner financial data and enforces mutation permissions',async()=>{await service.login('practitioner','s1','demo@clinic.test','demo1234');const data=await service.snapshot();expect(data.sales).toEqual([]);expect(data.products).toEqual([]);expect(data.courses).toEqual([]);expect(data.treatments.every(item=>item.price===undefined)).toBe(true);expect(data.appointments.every(item=>item.practitionerId==='s1')).toBe(true);await expect(service.stock('p1',2,'รับเข้า')).rejects.toThrow('สิทธิ์');});
  it('redacts receptionist precautions and aggregate revenue',async()=>{await service.login('receptionist','s1','demo@clinic.test','demo1234');const data=await service.snapshot();expect(data.customers.every(item=>item.precaution===undefined)).toBe(true);expect(data.sales).toEqual([]);});
});