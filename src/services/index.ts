import type { ClinicService } from './contracts';
let implementation: ClinicService;
export function configureService(service: ClinicService) { implementation = service; }
export function getService(): ClinicService {
  if (!implementation) throw new Error('ยังไม่ได้เชื่อมต่อบริการ');
  return implementation;
}