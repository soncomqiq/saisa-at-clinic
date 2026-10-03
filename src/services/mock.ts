import type { BookingInput, ClinicService } from './contracts';
import type { ClinicData, Customer, Payment, Role, SaleLine, Session, Status } from '../domain/types';
import { roleLabels, transitions } from '../domain/types';
import { addMonths, format } from 'date-fns';
import { generateSeed } from './seed';
const SESSION_KEY = 'saisaath-session-v1';
const DATA_KEY = 'saisaath-data-v1';
const active = (status:Status) => !['completed','cancelled','noShow'].includes(status);
export class MockClinicService implements ClinicService {
  private queue:Promise<unknown> = Promise.resolve();
  constructor(private storage:Storage = localStorage, private latency = 120, private now:()=>Date = ()=>new Date()) {}
  private async wait() { if(this.latency) await new Promise(resolve=>setTimeout(resolve,this.latency)); }
  private read():ClinicData {
    const day = format(this.now(),'yyyy-MM-dd');
    try { const stored = JSON.parse(this.storage.getItem(DATA_KEY)||'null');if(stored?.day===day) return stored.data; } catch { this.storage.removeItem(DATA_KEY); }
    const data=generateSeed(this.now());this.save(data);return data;
  }
  private save(data:ClinicData) { data.history=data.appointments;this.storage.setItem(DATA_KEY,JSON.stringify({day:format(this.now(),'yyyy-MM-dd'),data})); }
  private async authorized(roles:Role[]) {const session=await this.session();if(!session || !roles.includes(session.role))throw new Error('บทบาทนี้ไม่มีสิทธิ์ทำรายการนี้');return session;}
  private async transaction<T>(roles:Role[],work:(data:ClinicData,session:Session)=>T):Promise<T> {
    const execute=async()=>{await this.wait();const session=await this.authorized(roles);const data=this.read();const result=work(data,session);this.save(data);return result;};
    const locked=()=>typeof navigator!=='undefined'&&navigator.locks?navigator.locks.request(DATA_KEY,execute):execute();
    const result=this.queue.then(locked,locked);this.queue=result.catch(()=>undefined);return result;
  }
  async session() { try {const session=JSON.parse(this.storage.getItem(SESSION_KEY)||'null') as Session|null;if(session&&['owner','receptionist','practitioner'].includes(session.role))return session;}catch{this.storage.removeItem(SESSION_KEY);}return null; }
  async login(role: Role, staffId: string, email: string, password: string) {
    await this.wait();
    if (email !== 'demo@clinic.test' || password !== 'demo1234') throw new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    if(!['owner','receptionist','practitioner'].includes(role))throw new Error('บทบาทไม่ถูกต้อง');
    const staff=this.read().staff.find(item=>item.id===staffId&&item.kind!=='receptionist');
    if(role==='practitioner'&&!staff)throw new Error('กรุณาเลือกผู้ให้บริการ');
    const session = { role, staffId:role==='practitioner'?staffId:role==='receptionist'?'s6':'owner', name:role==='practitioner'?staff!.name:roleLabels[role] };
    this.storage.setItem(SESSION_KEY,JSON.stringify(session));
    return session;
  }
  async logout() { this.storage.removeItem(SESSION_KEY); }
  async snapshot() {
    await this.wait(); const session=await this.authorized(['owner','receptionist','practitioner']);const data=this.read();
    if(session.role==='receptionist'){data.customers=data.customers.map(({precaution: _precaution,...customer})=>{void _precaution;return customer;});data.sales=[];data.products=data.products.filter(item=>item.kind==='retail');data.movements=[];}
    if(session.role==='practitioner') {
      data.appointments=data.appointments.filter(item=>item.practitionerId===session.staffId).map(({courseId: _courseId,...item})=>{void _courseId;return item;});
      const ids=new Set(data.appointments.map(item=>item.customerId));data.customers=data.customers.filter(item=>ids.has(item.id));
      data.history=data.history.filter(item=>ids.has(item.customerId)).map(({courseId: _courseId,...item})=>{void _courseId;return item;});
      data.treatments=data.treatments.map(({price: _price,...item})=>{void _price;return {...item,consumables:[]};});data.courses=[];data.products=[];data.sales=[];data.movements=[];
    }
    return data;
  }
  async book(input:BookingInput,id?:string) {
    return this.transaction(['owner','receptionist'],data=>{
      const existing=id?data.appointments.find(item=>item.id===id):undefined;
      if(id&&!existing)throw new Error('ไม่พบนัดหมาย');if(existing&&existing.status!=='scheduled')throw new Error('แก้ไขได้เฉพาะคิวที่ยังไม่มาถึง');
      const treatment=data.treatments.find(item=>item.id===input.treatmentId);if(!treatment||!data.customers.some(item=>item.id===input.customerId)||!data.staff.some(item=>item.id===input.practitionerId&&item.kind!=='receptionist')||!data.rooms.some(item=>item.id===input.roomId))throw new Error('ข้อมูลการจองไม่ครบถ้วน');
      const start=new Date(input.start);const end=new Date(start.getTime()+treatment.duration*60000);
      if(!Number.isFinite(start.getTime())||start.getHours()<10||format(start,'yyyy-MM-dd')!==format(end,'yyyy-MM-dd')||end.getHours()>20||(end.getHours()===20&&(end.getMinutes()>0||end.getSeconds()>0)))throw new Error('นัดหมายต้องอยู่ในเวลาเปิดบริการ 10:00–20:00');
      if(start<this.now())throw new Error('ไม่สามารถจองหรือเลื่อนคิวไปยังเวลาที่ผ่านมาแล้ว');
      const conflict=data.appointments.find(item=>item.id!==id&&active(item.status)&&(item.practitionerId===input.practitionerId||item.roomId===input.roomId)&&new Date(item.start)<end&&new Date(item.end)>start);
      if(conflict)throw new Error('เวลานี้มีนัดหมายแล้ว ผู้ให้บริการหรือห้องซ้อนกับคิว '+format(new Date(conflict.start),'HH:mm')+'–'+format(new Date(conflict.end),'HH:mm')+' กรุณาเลือกเวลา ผู้ให้บริการ หรือห้องอื่น');
      if(input.courseId){const course=data.courses.find(item=>item.id===input.courseId);if(!course||course.customerId!==input.customerId||course.treatmentId!==input.treatmentId)throw new Error('คอร์สนี้ไม่ตรงกับลูกค้าหรือบริการ');if(new Date(course.expiresAt)<end)throw new Error('คอร์สหมดอายุก่อนวันรับบริการ');const reserved=data.appointments.filter(item=>item.id!==id&&item.courseId===course.id&&active(item.status)).length;if(course.remaining<=reserved)throw new Error('ครั้งคงเหลือในคอร์สถูกจองไว้ครบแล้ว');}
      const appointment={...input,id:id||crypto.randomUUID(),start:start.toISOString(),end:end.toISOString(),status:'scheduled' as const};
      if(existing)data.appointments[data.appointments.indexOf(existing)]=appointment;else data.appointments.push(appointment);return appointment;
    });
  }
  async transition(id:string,status:Status) {
    return this.transaction(['owner','receptionist','practitioner'],(data,session)=>{
      const appointment=data.appointments.find(item=>item.id===id);if(!appointment)throw new Error('ไม่พบนัดหมาย');if(session.role==='practitioner'&&(appointment.practitionerId!==session.staffId||['cancelled','noShow'].includes(status)))throw new Error('เปลี่ยนสถานะได้เฉพาะการรับบริการของตนเอง');
      if(!transitions[appointment.status].includes(status))throw new Error('ไม่สามารถเปลี่ยนสถานะตามลำดับนี้ได้');
      if(status==='completed') {
        const treatment=data.treatments.find(item=>item.id===appointment.treatmentId)!;
        for(const supply of treatment.consumables){const product=data.products.find(item=>item.id===supply.productId)!;if(product.stock<supply.quantity)throw new Error('สต็อก '+product.name+' ไม่เพียงพอ กรุณารับเข้าก่อนจบบริการ');}
        if(appointment.courseId){const course=data.courses.find(item=>item.id===appointment.courseId)!;if(course.remaining<1)throw new Error('คอร์สไม่มีครั้งคงเหลือ');if(new Date(course.expiresAt)<this.now())throw new Error('คอร์สหมดอายุแล้ว ไม่สามารถหักครั้งได้');course.remaining--;course.usages.push({appointmentId:id,date:this.now().toISOString()});}
        for(const supply of treatment.consumables){data.products.find(item=>item.id===supply.productId)!.stock-=supply.quantity;data.movements.push({id:crypto.randomUUID(),productId:supply.productId,quantity:-supply.quantity,reason:'ใช้บริการ '+treatment.name,date:this.now().toISOString()});}
      }
      appointment.status=status;
    });
  }
  async addCustomer(input:Pick<Customer,'name'|'phone'|'precaution'>) {
    return this.transaction(['owner','receptionist'],(data,session)=>{if(input.name.trim().length<2||!/^0\d{8,9}$/.test(input.phone))throw new Error('กรุณากรอกชื่อและเบอร์โทรศัพท์ให้ถูกต้อง');if(session.role==='receptionist'&&input.precaution)throw new Error('ไม่มีสิทธิ์บันทึกข้อควรระวัง');const customer={...input,name:input.name.trim(),id:crypto.randomUUID(),createdAt:this.now().toISOString()};data.customers.push(customer);return customer;});
  }
  async checkout(customerId:string,lines:SaleLine[],payment:Payment) {
    return this.transaction(['owner','receptionist'],data=>{
      if(!data.customers.some(item=>item.id===customerId)||!lines.length||!['cash','transfer','card'].includes(payment))throw new Error('กรุณาเลือกลูกค้า รายการขาย และวิธีชำระเงิน');
      const canonical=lines.map(line=>{
        if(!Number.isInteger(line.quantity)||line.quantity<1||line.quantity>100)throw new Error('จำนวนต้องเป็นจำนวนเต็ม 1–100');
        if(!['product','course','treatment'].includes(line.kind))throw new Error('ประเภทรายการไม่ถูกต้อง');
        const item=line.kind==='product'?data.products.find(item=>item.id===line.itemId&&item.kind==='retail'):data.treatments.find(item=>item.id===line.itemId);if(!item)throw new Error('ไม่พบรายการขาย');
        if(line.kind==='course'&&(!Number.isInteger(line.sessions)||line.sessions!<1||line.sessions!>50||!Number.isInteger(line.months)||line.months!<1||line.months!>36))throw new Error('คอร์สต้องมี 1–50 ครั้ง และอายุ 1–36 เดือน');
        return {...line,name:item.name,unitPrice:line.kind==='course'?Math.round(item.price!*line.sessions!*.85):item.price!};
      });
      const sold=new Map<string,number>();for(const line of canonical.filter(item=>item.kind==='product'))sold.set(line.itemId,(sold.get(line.itemId)||0)+line.quantity);
      for(const [id,quantity] of sold){const product=data.products.find(item=>item.id===id)!;if(product.stock<quantity)throw new Error('สินค้า '+product.name+' คงเหลือ '+product.stock+' '+product.unit+' ไม่เพียงพอ');}
      const sale={id:crypto.randomUUID(),customerId,lines:canonical,payment,total:canonical.reduce((sum,line)=>sum+line.quantity*line.unitPrice,0),date:this.now().toISOString()};
      for(const [id,quantity] of sold){data.products.find(item=>item.id===id)!.stock-=quantity;data.movements.push({id:crypto.randomUUID(),productId:id,quantity:-quantity,reason:'ขายสินค้า ใบเสร็จ '+sale.id.slice(0,8),date:sale.date});}
      for(const line of canonical.filter(item=>item.kind==='course'))for(let count=0;count<line.quantity;count++)data.courses.push({id:crypto.randomUUID(),customerId,treatmentId:line.itemId,total:line.sessions!,remaining:line.sessions!,purchasedAt:sale.date,expiresAt:addMonths(this.now(),line.months!).toISOString(),saleId:sale.id,usages:[]});
      data.sales.push(sale);return sale;
    });
  }
  async stock(productId:string,quantity:number,reason:string) {
    return this.transaction(['owner'],data=>{const product=data.products.find(item=>item.id===productId);if(!product)throw new Error('ไม่พบสินค้า');if(!Number.isInteger(quantity)||quantity===0||!reason.trim())throw new Error('กรุณากรอกจำนวนเต็มที่ไม่ใช่ศูนย์และเหตุผล');if(product.stock+quantity<0)throw new Error('สต็อกไม่เพียงพอ เบิกออกได้ไม่เกิน '+product.stock+' '+product.unit);product.stock+=quantity;data.movements.push({id:crypto.randomUUID(),productId,quantity,reason:reason.trim(),date:this.now().toISOString()});});
  }
  async reset() { return this.transaction(['owner'],data=>Object.assign(data,generateSeed(this.now()))).then(()=>undefined); }
}