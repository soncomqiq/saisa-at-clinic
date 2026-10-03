import { useEffect, useState } from 'react';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ReceiptText,
  Download,
  ShoppingBag,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Payment, Sale, SaleLine } from '../../domain/types';
import { useClinic } from '../../services/useClinic';
import { getService } from '../../services';
import { Confirm, Empty, PageTitle, Skeleton } from '../../components/ui';
import { errorMessage, money, thaiDate } from '../../lib/format';
import { exportExcel } from '../../lib/export';
import { Receipt } from './Receipt';
export function Sales() {
  const { data, error, refresh } = useClinic();
  const [tab, setTab] = useState('bill');
  const [kind, setKind] = useState<SaleLine['kind']>('treatment');
  const [customerId, setCustomerId] = useState('c1');
  const [search, setSearch] = useState('');
  const [lines, setLines] = useState<SaleLine[]>([]);
  const [payment, setPayment] = useState<Payment>('transfer');
  const [warning, setWarning] = useState('');
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState<Sale | null>(null);
  const [history, setHistory] = useState<Sale[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [remove, setRemove] = useState<number | null>(null);
  const [clear, setClear] = useState(false);
  useEffect(() => {
    setHistoryLoading(true);
    getService()
      .customerSales(customerId)
      .then(setHistory)
      .catch((error) => setWarning(errorMessage(error)))
      .finally(() => setHistoryLoading(false));
  }, [customerId, data]);
  if (error) return <p className="error">{error}</p>;
  if (!data) return <Skeleton />;
  const catalog = (
    kind === 'product' ? data.products.filter((item) => item.kind === 'retail') : data.treatments
  ).filter((item) => item.name.includes(search));
  const total = lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
  function add(itemId: string, name: string, price: number) {
    setWarning('');
    const existing = lines.findIndex((line) => line.kind === kind && line.itemId === itemId);
    if (existing >= 0)
      setLines(
        lines.map((line, index) =>
          index === existing ? { ...line, quantity: line.quantity + 1 } : line,
        ),
      );
    else
      setLines([
        ...lines,
        {
          kind,
          itemId,
          name,
          quantity: 1,
          unitPrice: kind === 'course' ? Math.round(price * 10 * 0.85) : price,
          ...(kind === 'course' ? { sessions: 10, months: 12 } : {}),
        },
      ]);
  }
  async function checkout() {
    setBusy(true);
    setWarning('');
    try {
      const sale = await getService().checkout(customerId, lines, payment);
      setReceipt(sale);
      setLines([]);
      toast.success('ชำระเงินและบันทึกใบเสร็จแล้ว');
      await refresh();
    } catch (error) {
      setWarning(errorMessage(error));
      toast.error(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  function exportHistory() {
    exportExcel(
      history.map((sale) => ({
        เลขที่: sale.id.slice(0, 8).toUpperCase(),
        วันที่: thaiDate(sale.date, 'd MMM yyyy HH:mm'),
        ลูกค้า: data!.customers.find((item) => item.id === sale.customerId)?.name || '',
        รายการ: sale.lines.map((line) => line.name).join(', '),
        'ยอดชำระ (บาท)': sale.total / 100,
        ชำระโดย:
          sale.payment === 'cash'
            ? 'เงินสด'
            : sale.payment === 'transfer'
              ? 'โอนเงิน'
              : 'บัตรเครดิต',
      })),
      'รายการขาย',
    );
  }
  return (
    <div data-ready={!historyLoading}>
      <PageTitle title="ขายและใบเสร็จ" subtitle="บริการ คอร์ส และสินค้าหน้าร้าน ในใบเสร็จเดียว">
        <button className="button secondary" disabled={!history.length} onClick={exportHistory}>
          <Download size={17} />
          ส่งออก Excel
        </button>
      </PageTitle>
      <div className="toolbar">
        <div className="segmented">
          <button className={tab === 'bill' ? 'active' : ''} onClick={() => setTab('bill')}>
            สร้างบิล
          </button>
          <button className={tab === 'history' ? 'active' : ''} onClick={() => setTab('history')}>
            ประวัติใบเสร็จ
          </button>
        </div>
      </div>
      {tab === 'bill' ? (
        <div className="sales-layout">
          <section className="sales-catalog">
            <div className="toolbar">
              <div className="search">
                <Search size={17} />
                <input
                  aria-label="ค้นหารายการขาย"
                  placeholder="ค้นหาบริการ หรือสินค้า..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            </div>
            <div className="segmented sales-kind">
              {[
                ['treatment', 'บริการ'],
                ['course', 'คอร์ส'],
                ['product', 'สินค้า'],
              ].map(([value, label]) => (
                <button
                  key={value}
                  className={kind === value ? 'active' : ''}
                  onClick={() => {
                    setKind(value as SaleLine['kind']);
                    setSearch('');
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            {catalog.length ? (
              <div className="sale-items">
                {catalog.map((item) => (
                  <button
                    className="sale-item"
                    key={item.id}
                    onClick={() => add(item.id, item.name, item.price || 0)}
                  >
                    <div className="sale-item-icon">
                      {kind === 'product' ? <ShoppingBag size={20} /> : <ReceiptText size={20} />}
                    </div>
                    <strong>{item.name}</strong>
                    <p className="small muted">
                      {kind === 'course'
                        ? '10 ครั้ง · อายุ 12 เดือน'
                        : 'duration' in item
                          ? item.duration + ' นาที'
                          : 'คงเหลือ ' + item.stock + ' ' + item.unit}
                    </p>
                    <div>
                      <span>
                        {money(
                          kind === 'course'
                            ? Math.round((item.price || 0) * 10 * 0.85)
                            : item.price,
                        )}
                      </span>
                      <Plus size={17} />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <Empty text="ไม่พบรายการที่ค้นหา" />
            )}
          </section>
          <section className="bill">
            <div className="section-heading">
              <h2>รายการขาย</h2>
              <button
                className="icon-button"
                title="ล้างบิล"
                disabled={!lines.length}
                onClick={() => setClear(true)}
              >
                <Trash2 size={18} />
              </button>
            </div>
            <label>
              ลูกค้า
              <select value={customerId} onChange={(event) => setCustomerId(event.target.value)}>
                {data.customers.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="bill-lines">
              {lines.length ? (
                lines.map((line, index) => (
                  <div className="bill-line" key={line.kind + line.itemId}>
                    <div className="bill-line-heading">
                      <strong>{line.name}</strong>
                      <button
                        className="icon-button"
                        title={'ลบ ' + line.name}
                        onClick={() => setRemove(index)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <p className="small muted">
                      {line.kind === 'course'
                        ? 'คอร์ส 10 ครั้ง · 12 เดือน'
                        : line.kind === 'product'
                          ? 'สินค้า'
                          : 'บริการ'}{' '}
                      · {money(line.unitPrice)}
                    </p>
                    <div className="bill-line-bottom">
                      <div className="quantity-stepper">
                        <button
                          className="icon-button"
                          title="ลดจำนวน"
                          disabled={line.quantity === 1}
                          onClick={() =>
                            setLines(
                              lines.map((item, position) =>
                                position === index
                                  ? { ...item, quantity: item.quantity - 1 }
                                  : item,
                              ),
                            )
                          }
                        >
                          <Minus size={14} />
                        </button>
                        <span>{line.quantity}</span>
                        <button
                          className="icon-button"
                          title="เพิ่มจำนวน"
                          onClick={() =>
                            setLines(
                              lines.map((item, position) =>
                                position === index
                                  ? { ...item, quantity: item.quantity + 1 }
                                  : item,
                              ),
                            )
                          }
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <strong>{money(line.unitPrice * line.quantity)}</strong>
                    </div>
                  </div>
                ))
              ) : (
                <Empty text="ยังไม่มีรายการในบิล" />
              )}
            </div>
            <div className="bill-total">
              <span>ยอดรวมสุทธิ</span>
              <strong>{money(total)}</strong>
            </div>
            <label>
              วิธีชำระเงิน
              <select
                value={payment}
                onChange={(event) => setPayment(event.target.value as Payment)}
              >
                <option value="transfer">โอนเงิน</option>
                <option value="cash">เงินสด</option>
                <option value="card">บัตรเครดิต</option>
              </select>
            </label>
            {warning && (
              <p role="alert" className="error">
                {warning}
              </p>
            )}
            <button
              className="button checkout"
              disabled={!lines.length || busy}
              onClick={() => void checkout()}
            >
              <Check size={18} />
              {busy ? 'กำลังบันทึก' : 'รับชำระเงิน'}
            </button>
          </section>
        </div>
      ) : (
        <>
          <label style={{ maxWidth: 350, marginBottom: 20 }}>
            ลูกค้า
            <select value={customerId} onChange={(event) => setCustomerId(event.target.value)}>
              {data.customers.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          {historyLoading ? (
            <Skeleton />
          ) : history.length ? (
            <div className="panel">
              {[...history]
                .sort((first, second) => second.date.localeCompare(first.date))
                .map((sale) => (
                  <div className="list-row" key={sale.id}>
                    <div>
                      <strong>ใบเสร็จ {sale.id.slice(0, 8).toUpperCase()}</strong>
                      <p>
                        {thaiDate(sale.date, 'd MMM yyyy HH:mm')} · {sale.lines.length} รายการ
                      </p>
                    </div>
                    <div className="actions">
                      <strong>{money(sale.total)}</strong>
                      <button
                        className="icon-button"
                        title="ดูใบเสร็จ"
                        onClick={() => setReceipt(sale)}
                      >
                        <ReceiptText size={18} />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <Empty text="ลูกค้านี้ยังไม่มีใบเสร็จ" />
          )}
        </>
      )}
      {receipt && (
        <Receipt
          sale={receipt}
          customer={data.customers.find((item) => item.id === receipt.customerId)}
          onClose={() => setReceipt(null)}
        />
      )}
      <Confirm
        open={remove !== null || clear}
        onClose={() => {
          setRemove(null);
          setClear(false);
        }}
        title={clear ? 'ล้างรายการขายทั้งหมด' : 'ลบรายการขาย'}
        description="รายการที่เลือกจะถูกนำออกจากบิลที่ยังไม่ชำระเงิน"
        onConfirm={() => {
          if (clear) setLines([]);
          else setLines(lines.filter((_, index) => index !== remove));
          setRemove(null);
          setClear(false);
        }}
      />
    </div>
  );
}
