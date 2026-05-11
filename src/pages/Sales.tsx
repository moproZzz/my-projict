import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Sale } from '../types';
import { Search, ShoppingBag, Eye, Calendar, User as UserIcon, Receipt as ReceiptIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const Sales = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'sales'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs: Sale[] = [];
      snapshot.forEach((doc) => docs.push({ id: doc.id, ...doc.data() } as Sale));
      setSales(docs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filtered = sales.filter(s => 
    s.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">سجل المبيعات</h1>
          <p className="text-sm text-slate-500">استعرض جميع الفواتير والعمليات السابقة</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          <input 
            type="text" 
            placeholder="البحث برقم الفاتورة أو اسم العميل..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
              <tr className="border-b border-slate-100">
                <th className="px-6 py-3 tracking-wider">رقم الفاتورة</th>
                <th className="px-6 py-3 tracking-wider">التاريخ</th>
                <th className="px-6 py-3 tracking-wider">العميل</th>
                <th className="px-6 py-3 tracking-wider">المبلغ الإجمالي</th>
                <th className="px-6 py-3 tracking-wider">دفع بواسطة</th>
                <th className="px-6 py-3 tracking-wider text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400">جاري تحميل البيانات...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400">لا توجد مبيعات مسجلة</td></tr>
              ) : filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-3 whitespace-nowrap font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <ReceiptIcon className="w-4 h-4 text-indigo-500" />
                      {s.invoiceNumber}
                    </div>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-slate-500">
                    {s.createdAt?.toDate ? format(s.createdAt.toDate(), 'yyyy/MM/dd HH:mm', { locale: ar }) : 'غير محدد'}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <span className="flex items-center gap-2 text-slate-700">
                      <UserIcon className="w-3 h-3" />
                      {s.customerName || 'عميل نقدي'}
                    </span>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap font-black text-indigo-600">
                    {s.finalAmount.toFixed(2)} ر.س
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold">
                      {s.paymentMethod}
                    </span>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-left">
                    <button 
                      onClick={() => setSelectedSale(s)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"
                      title="عرض التفاصيل"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedSale && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-indigo-600 text-white">
                <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
                  <ReceiptIcon className="w-5 h-5" />
                  تفاصيل الفاتورة {selectedSale.invoiceNumber}
                </h2>
                <button onClick={() => setSelectedSale(null)} className="text-white hover:text-indigo-100 font-bold text-xl">×</button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-slate-400 uppercase font-bold mb-1">العميل</p>
                    <p className="font-bold text-slate-800">{selectedSale.customerName || 'عميل نقدي'}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-slate-400 uppercase font-bold mb-1">التاريخ</p>
                    <p className="font-bold text-slate-800">
                      {selectedSale.createdAt?.toDate ? format(selectedSale.createdAt.toDate(), 'PPP p', { locale: ar }) : '-'}
                    </p>
                  </div>
                </div>
                
                <div className="border border-slate-100 rounded-lg overflow-hidden">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold">
                      <tr className="border-b border-slate-100">
                        <th className="px-4 py-2">الصنف</th>
                        <th className="px-4 py-2 text-center">الكمية</th>
                        <th className="px-4 py-2 text-left">المجموع</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {selectedSale.items.map((item, i) => (
                        <tr key={i}>
                          <td className="px-4 py-2 text-slate-700">{item.productName}</td>
                          <td className="px-4 py-2 text-center font-bold">{item.quantity}</td>
                          <td className="px-4 py-2 text-left font-black text-slate-900">{item.total.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="space-y-1 text-sm border-t border-slate-100 pt-4">
                  <div className="flex justify-between text-slate-500">
                    <span>المجموع الفرعي</span>
                    <span className="font-bold">{selectedSale.totalAmount.toFixed(2)} ر.س</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>الضريبة (١٥٪)</span>
                    <span className="font-bold">{selectedSale.taxAmount.toFixed(2)} ر.س</span>
                  </div>
                  <div className="flex justify-between text-indigo-600 text-lg font-black pt-2">
                    <span>الإجمالي النهائي</span>
                    <span>{selectedSale.finalAmount.toFixed(2)} ر.س</span>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedSale(null)}
                  className="w-full bg-slate-100 text-slate-600 py-2.5 rounded-lg font-bold hover:bg-slate-200 transition-colors text-sm mt-4"
                >
                  إغلاق
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Sales; 

