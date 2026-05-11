import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { StockMovement } from '../types';
import { Search, History, ArrowDownCircle, ArrowUpCircle, ClipboardList, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const InventoryLog = () => {
  const [logs, setLogs] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Note: If you add stock movements during POS or other operations, they will appear here.
    // For now, it lists the global movements collection.
    const q = query(collection(db, 'stockMovements'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs: StockMovement[] = [];
      snapshot.forEach((doc) => docs.push({ id: doc.id, ...doc.data() } as StockMovement));
      setLogs(docs);
      setLoading(false);
    }, (error) => {
      console.error(error);
      setLoading(false);
      // It might fail if collection doesn't exist yet, we handle gracefully
    });
    return () => unsubscribe();
  }, []);

  const filtered = logs.filter(l => 
    l.productName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.reason?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">سجل حركات المخزون</h1>
          <p className="text-sm text-slate-500">تتبع جميع عمليات الإضافة، الحذف، والجرد للمنتجات</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          <input 
            type="text" 
            placeholder="البحث باسم المنتج أو السبب..." 
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
                <th className="px-6 py-3 tracking-wider">العملية</th>
                <th className="px-6 py-3 tracking-wider">المنتج</th>
                <th className="px-6 py-3 tracking-wider">الكمية</th>
                <th className="px-6 py-3 tracking-wider">السبب</th>
                <th className="px-6 py-3 tracking-wider">بواسطة</th>
                <th className="px-6 py-3 tracking-wider">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400">جاري تحميل البيانات...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400">لا توجد حركات مسجلة حالياً</td></tr>
              ) : filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3 whitespace-nowrap">
                    {log.type === 'in' ? (
                      <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                        <ArrowDownCircle className="w-4 h-4" />
                        توريد
                      </span>
                    ) : log.type === 'out' ? (
                      <span className="flex items-center gap-1.5 text-red-500 font-bold">
                        <ArrowUpCircle className="w-4 h-4" />
                        صرف
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-amber-500 font-bold">
                        <ClipboardList className="w-4 h-4" />
                        تعديل جرد
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap font-bold text-slate-900">
                    {log.productName}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <span className={`font-black text-sm ${log.type === 'in' ? 'text-emerald-600' : 'text-red-500'}`}>
                      {log.type === 'in' ? '+' : '-'}{log.quantity}
                    </span>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-slate-500 text-xs">
                    {log.reason}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <span className="text-slate-600 text-xs font-medium bg-slate-100 px-2 py-0.5 rounded">
                      {log.userName}
                    </span>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-slate-400 text-[10px]">
                    <span className="flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3" />
                      {log.createdAt?.toDate ? format(log.createdAt.toDate(), 'yyyy/MM/dd HH:mm', { locale: ar }) : '-'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryLog; 

