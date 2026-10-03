import { useId, useState, type FormEvent } from 'react';
import { Search, Download, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { toast } from 'sonner';
import { useClinic } from '../../services/useClinic';
import { getService } from '../../services';
import type { Product } from '../../domain/types';
import { Empty, Modal, PageTitle, Skeleton } from '../../components/ui';
import { errorMessage, money, thaiDate } from '../../lib/format';
import { exportExcel } from '../../lib/export';
export function Inventory() {
  const formId = useId();
  const { data, error, refresh } = useClinic();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [tab, setTab] = useState('stock');
  const [product, setProduct] = useState<Product | null>(null);
  const [direction, setDirection] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');
  const [warning, setWarning] = useState('');
  const [busy, setBusy] = useState(false);
  if (error) return <p className="error">{error}</p>;
  if (!data) return <Skeleton />;
  const items = data.products.filter(
    (item) =>
      item.name.includes(search) &&
      (filter === 'all' ||
        (filter === 'low' && item.stock <= item.minimum) ||
        item.kind === filter),
  );
  function open(item: Product, sign: number) {
    setProduct(item);
    setDirection(sign);
    setQuantity(1);
    setReason('');
    setWarning('');
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      await getService().stock(product!.id, quantity * direction, reason);
      toast.success('บันทึกการเคลื่อนไหวสต็อกแล้ว');
      setProduct(null);
      await refresh();
    } catch (error) {
      setWarning(errorMessage(error));
      toast.error(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  const controls = (item: Product) => (
    <div className="actions">
      <button
        className="icon-button stock-tool"
        title={'รับเข้าสินค้า ' + item.name}
        onClick={() => open(item, 1)}
      >
        <ArrowDownToLine size={18} />
        <span>รับเข้า</span>
      </button>
      <button
        className="icon-button stock-tool"
        title={'เบิกออกสินค้า ' + item.name}
        onClick={() => open(item, -1)}
      >
        <ArrowUpFromLine size={18} />
        <span>เบิกออก</span>
      </button>
    </div>
  );
  return (
    <div data-ready="true">
      <PageTitle title="สินค้าและสต็อก">
        <button
          className="button secondary"
          onClick={() =>
            exportExcel(
              items.map((item) => ({
                สินค้า: item.name,
                ประเภท: item.kind === 'retail' ? 'ขายปลีก' : 'วัสดุสิ้นเปลือง',
                คงเหลือ: item.stock,
                ขั้นต่ำ: item.minimum,
                หน่วย: item.unit,
                'ราคา (บาท)': (item.price || 0) / 100,
              })),
              'สต็อกสินค้า',
            )
          }
        >
          <Download size={17} />
          ส่งออก Excel
        </button>
      </PageTitle>
      <div className="stock-exceptions actions">
        <span>
          สต็อกต่ำ {data.products.filter((item) => item.stock <= item.minimum).length} รายการ
        </span>
        <button className="link" onClick={() => setFilter('low')}>
          ดูสต็อกต่ำ
        </button>
      </div>
      <div className="toolbar">
        <div className="segmented">
          <button className={tab === 'stock' ? 'active' : ''} onClick={() => setTab('stock')}>
            สินค้าคงเหลือ
          </button>
          <button className={tab === 'history' ? 'active' : ''} onClick={() => setTab('history')}>
            ประวัติการเคลื่อนไหว
          </button>
        </div>
      </div>
      {tab === 'stock' ? (
        <>
          <div className="toolbar">
            <div className="search">
              <Search size={17} />
              <input
                placeholder="ค้นหาสินค้า..."
                aria-label="ค้นหาสินค้า"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <select
              aria-label="กรองสินค้า"
              className="stock-filter"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            >
              <option value="all">สินค้าทั้งหมด</option>
              <option value="retail">สินค้าขายปลีก</option>
              <option value="consumable">วัสดุสิ้นเปลือง</option>
              <option value="low">สต็อกต่ำ</option>
            </select>
            <span className="ready-label">{items.length} รายการ</span>
          </div>
          {items.length ? (
            <>
              <div className="table-wrap desktop-only">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>สินค้า</th>
                      <th>ประเภท</th>
                      <th className="numeric">ราคา</th>
                      <th className="numeric">คงเหลือ</th>
                      <th className="numeric">ขั้นต่ำ</th>
                      <th>สถานะ</th>
                      <th>จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <strong>{item.name}</strong>
                          <p className="small muted">{item.id.toUpperCase()}</p>
                        </td>
                        <td>{item.kind === 'retail' ? 'ขายปลีก' : 'วัสดุสิ้นเปลือง'}</td>
                        <td className="numeric">{money(item.price)}</td>
                        <td className="numeric">
                          <strong>{item.stock}</strong> {item.unit}
                        </td>
                        <td className="numeric">
                          {item.minimum} {item.unit}
                        </td>
                        <td>
                          {item.stock <= item.minimum ? (
                            <span className={'badge ' + (item.stock === 0 ? 'cancelled' : 'low')}>
                              {item.stock === 0 ? 'หมด' : 'สต็อกต่ำ'}
                            </span>
                          ) : (
                            <span className="muted">พร้อมใช้งาน</span>
                          )}
                        </td>
                        <td>{controls(item)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mobile-list">
                {items.map((item) => (
                  <article className="card-row" key={item.id}>
                    <div className="card-row-head">
                      <strong>{item.name}</strong>
                      {item.stock <= item.minimum && <span className="badge low">สต็อกต่ำ</span>}
                    </div>
                    <div className="card-row-meta">
                      <span>{item.kind === 'retail' ? 'ขายปลีก' : 'วัสดุสิ้นเปลือง'}</span>
                      <span className="numeric">{money(item.price)}</span>
                    </div>
                    <div className="card-row-head">
                      <dl className="stock-quantities">
                        <div>
                          <dt>คงเหลือ</dt>
                          <dd className="numeric">
                            <strong>{item.stock}</strong> {item.unit}
                          </dd>
                        </div>
                        <div>
                          <dt>ขั้นต่ำ</dt>
                          <dd className="numeric">
                            {item.minimum} {item.unit}
                          </dd>
                        </div>
                      </dl>
                    </div>
                    <div className="stock-actions">{controls(item)}</div>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <Empty
              text={
                filter === 'low' && !search
                  ? 'ไม่มีสินค้าที่ต่ำกว่าขั้นต่ำ'
                  : 'ไม่พบสินค้าที่ตรงกับคำค้น'
              }
              hint="ล้างคำค้นหรือเปลี่ยนประเภทสินค้า"
            >
              <button
                className="button secondary"
                onClick={() => {
                  setSearch('');
                  setFilter('all');
                }}
              >
                ดูสินค้าทั้งหมด
              </button>
            </Empty>
          )}
        </>
      ) : (
        <div className="panel">
          {[...data.movements].reverse().map((item) => (
            <div className="list-row" key={item.id}>
              <div>
                <strong>
                  {data.products.find((product) => product.id === item.productId)?.name}
                </strong>
                <p>
                  {item.reason}
                  <br />
                  {thaiDate(item.date, 'd MMM HH:mm')}
                </p>
              </div>
              <span className={'badge ' + (item.quantity > 0 ? 'completed' : 'low')}>
                {item.quantity > 0 ? '+' : ''}
                {item.quantity}
              </span>
            </div>
          ))}
        </div>
      )}
      <Modal
        title={direction > 0 ? 'รับเข้าสินค้า' : 'เบิกออกสินค้า'}
        open={!!product}
        onClose={() => setProduct(null)}
        summary={
          <>
            <strong>{product?.name}</strong>
            <span>
              คงเหลือ {product?.stock} {product?.unit}
            </span>
          </>
        }
        footer={
          <button className="button" type="submit" form={formId} disabled={busy}>
            {busy ? 'กำลังบันทึก' : direction > 0 ? 'บันทึกรับเข้า' : 'บันทึกเบิกออก'}
          </button>
        }
      >
        <form id={formId} onSubmit={submit}>
          <label>
            จำนวน
            <input
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value))}
              required
            />
          </label>
          <label>
            เหตุผล
            <input
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              required
              placeholder="เช่น รับจากผู้จำหน่าย / ใช้งานภายใน"
            />
          </label>
          {warning && (
            <p role="alert" className="error">
              {warning}
            </p>
          )}
        </form>
      </Modal>
    </div>
  );
}
