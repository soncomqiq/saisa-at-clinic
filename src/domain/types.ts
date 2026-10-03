export type Role = 'owner' | 'receptionist' | 'practitioner';
export type Status = 'scheduled' | 'arrived' | 'inService' | 'completed' | 'cancelled' | 'noShow';
export type Payment = 'cash' | 'transfer' | 'card';
export interface Session { role: Role; staffId: string; name: string }
export interface Staff { id: string; name: string; kind: 'doctor' | 'therapist' | 'receptionist' }
export interface Treatment { id: string; name: string; category: string; duration: number; price?: number; consumables: { productId: string; quantity: number }[] }
export interface Product { id: string; name: string; kind: 'retail' | 'consumable'; unit: string; stock: number; minimum: number; price?: number }
export interface Customer { id: string; name: string; phone: string; precaution?: string; createdAt: string }
export interface CourseUsage { appointmentId: string; date: string }
export interface Course { id: string; customerId: string; treatmentId: string; total: number; remaining: number; purchasedAt: string; expiresAt: string; saleId: string; usages: CourseUsage[] }
export interface Appointment { id: string; customerId: string; treatmentId: string; practitionerId: string; roomId: string; start: string; end: string; status: Status; courseId?: string }
export interface SaleLine { kind: 'treatment' | 'course' | 'product'; itemId: string; name: string; quantity: number; unitPrice: number; sessions?: number; months?: number }
export interface Sale { id: string; customerId: string; lines: SaleLine[]; payment: Payment; total: number; date: string }
export interface StockMovement { id: string; productId: string; quantity: number; reason: string; date: string }
export interface ClinicData { staff: Staff[]; rooms: { id: string; name: string }[]; treatments: Treatment[]; products: Product[]; customers: Customer[]; courses: Course[]; appointments: Appointment[]; sales: Sale[]; movements: StockMovement[] }
export const statusLabels: Record<Status,string> = {scheduled:'นัดแล้ว',arrived:'มาถึงแล้ว',inService:'กำลังรับบริการ',completed:'เสร็จสิ้น',cancelled:'ยกเลิก',noShow:'ไม่มาตามนัด'};
export const transitions: Record<Status,Status[]> = {scheduled:['arrived','cancelled','noShow'],arrived:['inService','cancelled'],inService:['completed'],completed:[],cancelled:[],noShow:[]};
export const roleLabels: Record<Role,string> = {owner:'เจ้าของ',receptionist:'พนักงานต้อนรับ',practitioner:'แพทย์/เทอราพิสต์'};
export const routesFor: Record<Role,string[]> = {owner:['dashboard','appointments','customers','courses','sales','inventory','treatments'],receptionist:['appointments','customers','courses','sales','treatments'],practitioner:['appointments','customers']};