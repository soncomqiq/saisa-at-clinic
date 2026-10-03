import type { Appointment, ClinicData, Customer, Payment, Role, Sale, SaleLine, Session, Status } from '../domain/types';
export type BookingInput = Omit<Appointment,'id'|'end'|'status'>;
export interface ClinicService {
  session(): Promise<Session | null>;
  login(role: Role, staffId: string, email: string, password: string): Promise<Session>;
  logout(): Promise<void>;
  snapshot(): Promise<ClinicData>;
  customerSales(customerId: string): Promise<Sale[]>;
  book(input: BookingInput, id?: string): Promise<Appointment>;
  transition(id: string, status: Status): Promise<void>;
  addCustomer(input: Pick<Customer,'name'|'phone'|'precaution'>): Promise<Customer>;
  checkout(customerId: string, lines: SaleLine[], payment: Payment): Promise<Sale>;
  stock(productId: string, quantity: number, reason: string): Promise<void>;
  reset(): Promise<void>;
}