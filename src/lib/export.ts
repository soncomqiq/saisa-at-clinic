import { toast } from 'sonner';
import { errorMessage } from './format';
export async function exportExcel(rows: Record<string, string | number>[], filename: string) {
  try {
    const { default: ExcelJS } = await import('exceljs');
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('ข้อมูล');
    const headers = Object.keys(rows[0] || {});
    sheet.columns = headers.map((key) => ({ header: key, key, width: 26 }));
    sheet.addRows(rows);
    sheet.getRow(1).font = { bold: true };
    sheet.views = [{ state: 'frozen', ySplit: 1 }];
    const buffer = await workbook.xlsx.writeBuffer();
    const bytes = new Uint8Array(buffer);
    const url = URL.createObjectURL(
      new Blob([bytes], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = filename + '.xlsx';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast.success('ส่งออก Excel แล้ว');
  } catch (error) {
    toast.error(errorMessage(error));
  }
}
