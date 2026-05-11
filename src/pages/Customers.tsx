import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Customer } from '../types';
import { Plus, Search, User as UserIcon, Edit2, Trash2, Phone, Mail, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    const q = query(collection(db, 'customers'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs: Customer[] = [];
      snapshot.forEach((doc) => docs.push({ id: doc.id, ...doc.data() } as Customer));
      setCustomers(docs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await updateDoc(doc(db, 'customers', editingCustomer.id), formData);
      } else {
        await addDoc(collection(db, 'customers'), formData);
      }
      setIsModalOpen(false);
      setEditingCustomer(null);
      setFormData({ name: '', email: '', phone: '', address: '' });
    } catch (error) {
      console.error(error);
      alert('حدث خطأ أثناء حفظ البيانات');
    }
  };

  const deleteCustomer = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا العميل؟')) {
      await deleteDoc(doc(db, 'customers', id));
    }
  };

  const openEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || ''
    });
    setIsModalOpen(true);
  };

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">إدارة العملاء</h1>
          <p className="text-sm text-slate-500">سجل العملاء والتعاملات الخاصة بهم</p>
        </div>
        <button 
          onClick={() => { setEditingCustomer(null); setIsModalOpen(true); }}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-md hover:bg-indigo-700 transition-all text-sm"
        >
          <Plus className="w-5 h-5" />
          <span>إضافة عميل</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          <input 
            type="text" 
            placeholder="البحث بالاسم أو رقم الهاتف..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
              <tr className="border-b border-slate-100">
                <th className="px-6 py-3 tracking-wider">العميل</th>
                <th className="px-6 py-3 tracking-wider text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={2} className="px-6 py-10 text-center text-slate-400">جاري تحميل البيانات...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={2} className="px-6 py-10 text-center text-slate-400">لا يوجد عملاء مضافين</td></tr>
              ) : filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                        <UserIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{c.name}</p>
                        <div className="flex items-center gap-4 mt-0.5">
                           {c.phone && <span className="flex items-center gap-1 text-[10px] text-slate-400"><Phone className="w-3 h-3" /> {c.phone}</span>}
                           {c.email && <span className="flex items-center gap-1 text-[10px] text-slate-400"><Mail className="w-3 h-3" /> {c.email}</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-left">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(c)} className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteCustomer(c.id)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">{editingCustomer ? 'تعديل بيانات عميل' : 'إضافة عميل جديد'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-xl">×</button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">الاسم الكامل</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">رقم الهاتف</label>
                  <input 
                    type="text" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">البريد الإلكتروني</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">العنوان</label>
                  <textarea 
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none h-20 resize-none"
                  />
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="submit" className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg font-bold hover:bg-indigo-700 transition-colors text-sm shadow-md shadow-indigo-100">
                    حفظ العميل
                  </button>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-100 text-slate-600 py-2.5 rounded-lg font-bold hover:bg-slate-200 transition-colors text-sm">
                    إلغاء
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Customers; 

