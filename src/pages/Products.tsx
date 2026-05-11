import React, { useState, useEffect } from 'react';
import { 
  collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product, Category } from '../types';
import { 
  Plus, Search, Filter, MoreVertical, Edit2, Trash2, Package, Image as ImageIcon 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { isAdmin } = useAuth();

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    purchasePrice: 0,
    sellingPrice: 0,
    stock: 0,
    barcode: '',
    minStockAlert: 5
  });

  useEffect(() => {
    const q = query(collection(db, 'products'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const prods: Product[] = [];
      snapshot.forEach((doc) => prods.push({ id: doc.id, ...doc.data() } as Product));
      setProducts(prods);
      setLoading(false);
    });

    const catQuery = query(collection(db, 'categories'));
    onSnapshot(catQuery, (snapshot) => {
      const cats: Category[] = [];
      snapshot.forEach((doc) => cats.push({ id: doc.id, ...doc.data() } as Category));
      setCategories(cats);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return alert('غير مسموح لك بهذه العملية');

    try {
      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), {
          ...formData,
          updatedAt: new Date().toISOString()
        });
      } else {
        await addDoc(collection(db, 'products'), {
          ...formData,
          updatedAt: new Date().toISOString()
        });
      }
      setIsModalOpen(false);
      setEditingProduct(null);
      setFormData({ name: '', categoryId: '', purchasePrice: 0, sellingPrice: 0, stock: 0, barcode: '', minStockAlert: 5 });
    } catch (error) {
      console.error(error);
      alert('حدث خطأ أثناء حفظ المنتج');
    }
  };

  const deleteProduct = async (id: string) => {
    if (!isAdmin) return alert('غير مسموح لك بهذه العملية');
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      await deleteDoc(doc(db, 'products', id));
    }
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      categoryId: product.categoryId,
      purchasePrice: product.purchasePrice,
      sellingPrice: product.sellingPrice,
      stock: product.stock,
      barcode: product.barcode || '',
      minStockAlert: product.minStockAlert || 5
    });
    setIsModalOpen(true);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.barcode?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">إدارة المنتجات</h1>
          <p className="text-gray-500">عرض وإدارة جميع المنتجات في المخزن</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-md hover:bg-indigo-700 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>منتج جديد</span>
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          <input 
            type="text" 
            placeholder="البحث بالاسم أو الباركود..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
        <button className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-slate-50 text-slate-600">
          <Filter className="w-4 h-4" />
          <span>تصفية</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
              <tr className="border-b border-slate-100">
                <th className="px-6 py-3 tracking-wider">المنتج</th>
                <th className="px-6 py-3 tracking-wider">التصنيف</th>
                <th className="px-6 py-3 tracking-wider">سعر الشراء</th>
                <th className="px-6 py-3 tracking-wider">سعر البيع</th>
                <th className="px-6 py-3 tracking-wider">المخزون</th>
                <th className="px-6 py-3 tracking-wider text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400">جاري تحميل البيانات...</td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400">لا توجد منتجات مطابقة للبحث</td></tr>
              ) : filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center text-slate-300">
                        {product.image ? <img src={product.image} className="w-full h-full object-cover rounded" /> : <Package className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{product.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono tracking-tight">{product.barcode || 'NO BARCODE'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors">
                      {categories.find(c => c.id === product.categoryId)?.name || 'عام'}
                    </span>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap font-medium text-slate-600 italic">
                    {product.purchasePrice} ر.س
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap font-bold text-slate-900">
                    {product.sellingPrice} ر.س
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <span className={`font-bold transition-colors ${
                      product.stock <= product.minStockAlert ? 'text-amber-600' : 'text-emerald-600'
                    }`}>
                      {product.stock} قِطع
                    </span>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-left">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(product)} className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteProduct(product.id)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">{editingProduct ? 'تعديل منتج' : 'إضافة منتج جديد'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 font-bold">×</button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">اسم المنتج</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">التصنيف</label>
                  <select 
                    value={formData.categoryId}
                    onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="">اختر تصنيف</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">الباركود</label>
                  <input 
                    type="text" 
                    value={formData.barcode}
                    onChange={(e) => setFormData({...formData, barcode: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    placeholder="امسح الباركود..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">سعر الشراء</label>
                  <input 
                    required
                    type="number" 
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({...formData, purchasePrice: Number(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">سعر البيع</label>
                  <input 
                    required
                    type="number" 
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({...formData, sellingPrice: Number(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">الكمية الحالية</label>
                  <input 
                    required
                    type="number" 
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">تنبيه المخزون المنخفض</label>
                  <input 
                    type="number" 
                    value={formData.minStockAlert}
                    onChange={(e) => setFormData({...formData, minStockAlert: Number(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div className="col-span-2 mt-4 flex gap-3">
                  <button type="submit" className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
                    حفظ المنتج
                  </button>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-bold hover:bg-gray-200 transition-colors">
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

export default Products;
