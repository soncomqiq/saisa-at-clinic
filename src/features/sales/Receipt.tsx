import { useRef, useState } from 'react';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import type { Customer, Sale } from '../../domain/types';
import { Modal } from '../../components/ui';
import { errorMessage, money, thaiDate } from '../../lib/format';
const paymentLabels = { cash: 'เงินสด', transfer: 'โอนเงิน', card: 'บัตรเครดิต' };
export function Receipt({
  sale,
  customer,
  onClose,
}: {
  sale: Sale;
  customer?: Customer;
  onClose: () => void;
}) {
  const receipt = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  async function download() {
    setBusy(true);
    try {
      await document.fonts.ready;
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);
      const canvas = await html2canvas(receipt.current!, {
        scale: 2,
        backgroundColor: getComputedStyle(document.documentElement)
          .getPropertyValue('--surface')
          .trim(),
        useCORS: true,
      });
      const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
      const width = 190;
      const height = (canvas.height / canvas.width) * width;
      const image = canvas.toDataURL('image/png');
      let offset = 0;
      do {
        if (offset) pdf.addPage();
        pdf.addImage(image, 'PNG', 10, 10 - offset, width, height);
        offset += 277;
      } while (offset < height);
      pdf.save('ใบเสร็จ-' + sale.id.slice(0, 8) + '.pdf');
      toast.success('ดาวน์โหลดใบเสร็จแล้ว');
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      title="ใบเสร็จรับเงิน"
      open
      onClose={onClose}
      wide
      footer={
        <button className="button" disabled={busy} onClick={() => void download()}>
          <Download size={17} />
          {busy ? 'กำลังสร้างเอกสาร' : 'ดาวน์โหลด PDF'}
        </button>
      }
    >
      <div className="receipt" ref={receipt} data-testid="receipt">
        <div className="receipt-brand">
          <h2>คลินิกใสสะอาด</h2>
          <p>บิวตี้แอนด์สปา</p>
          <p className="small">ใบเสร็จรับเงิน</p>
        </div>
        <div className="receipt-meta">
          <div>
            <p>เลขที่ {sale.id.slice(0, 8).toUpperCase()}</p>
            <p>วันที่ {thaiDate(sale.date, 'd MMM yyyy HH:mm')}</p>
          </div>
          <div>
            <p>ลูกค้า {customer?.name || 'ลูกค้าทั่วไป'}</p>
            <p>{customer?.phone}</p>
          </div>
        </div>
        <table className="receipt-table">
          <thead>
            <tr>
              <th>รายการ</th>
              <th>จำนวน</th>
              <th>รวม</th>
            </tr>
          </thead>
          <tbody>
            {sale.lines.map((line, index) => (
              <tr key={index}>
                <td>
                  {line.name}
                  {line.kind === 'course' && (
                    <p className="small muted">
                      คอร์ส {line.sessions} ครั้ง อายุ {line.months} เดือน
                    </p>
                  )}
                </td>
                <td>{line.quantity}</td>
                <td>{money(line.unitPrice * line.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="receipt-total">
          <span>ยอดชำระสุทธิ</span>
          <strong>{money(sale.total)}</strong>
        </div>
        <p className="small">ชำระโดย {paymentLabels[sale.payment]}</p>
        <div className="receipt-thanks">
          <p className="small muted">เอกสารตัวอย่าง ไม่ใช่ใบกำกับภาษี</p>
        </div>
      </div>
    </Modal>
  );
}
