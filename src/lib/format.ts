import { format } from 'date-fns';
import { th } from 'date-fns/locale';
export const money = (satang = 0) => new Intl.NumberFormat('th-TH',{style:'currency',currency:'THB',minimumFractionDigits:2}).format(satang / 100);
export const thaiDate = (date: string | Date, pattern = 'd MMM yyyy') => format(new Date(date),pattern,{locale:th});
export const localDate = (date: Date) => format(date,'yyyy-MM-dd');
export const clock = (date: string) => format(new Date(date),'HH:mm');
export const errorMessage = (error: unknown) => error instanceof Error ? error.message : 'เกิดข้อผิดพลาด กรุณาลองใหม่';