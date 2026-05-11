import React, { useState, useEffect, useRef } from 'react';
import { collection, query, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product, SaleItem, Sale, SystemSettings } from '../types';
import { Search, ShoppingCart, Plus, Minus, Trash2, CheckCircle, Package, Printer } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useReactToPrint } from 'react-to-print';
import { getDoc } from 'firebase/firestore';

const Receipt = React.forwardRef(({ sale, settings }: { sale: any, settings: any }, ref: any) => (
  <div ref={ref} className="p-8 text-right font-sans" dir="rtl">
    <div className="text-center mb-6">
      <h2 className="text-2xl font-bold">{settings?.companyName || 'هويدي'}</h2>
      <p className="text-gray-500">فاتورة مبيعات مبسطة</p>
      <p className="text-sm">رقم الفاتورة: {sale?.invoiceNumber}</p>
      <p className="text-sm">التاريخ: {new Date().toLocaleString('ar-SA')}</p>
    </div>
    <table className="w-full mb-6 border-collapse">
      <thead>
        <tr className="border-b-2 border-black">
          <th className="py-2 text-right">الصنف</th>
          <th className="py-2 text-center">الكمية</th>
          <th className="py-2 text-left">السعر</th>
        </tr>
      </thead>
      <tbody>
        {sale?.items.map((item: any, i: number) => (
          <tr key={i} className="border-b border-gray-200">
            <td className="py-2">{item.productName}</td>
            <td className="py-2 text-center">{item.quantity}</td>
            <td className="py-2 text-left">{item.total.toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
    <div className="space-y-1 text-left">
      <p>المجموع: {sale?.totalAmount.toFixed(2)} {sale?.currency || 'ر.س'}</p>
      <p>الضريبة ({sale?.taxRate || 0}٪): {sale?.taxAmount.toFixed(2)} {sale?.currency || 'ر.س'}</p>
      <h3 className="text-xl font-bold">الإجمالي: {sale?.finalAmount.toFixed(2)} {sale?.currency || 'ر.س'}</h3>
    </div>
    <div className="mt-10 text-center text-xs text-gray-400">
      <p>شكراً لزيارتكم</p>
    </div>
  </div>
));

const Pos = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [discount, setDiscount] = useState(0);
  const [settings, setSettings] = useState<SystemSettings>({
    companyName: 'هويدي',
    currency: 'جنية مصري',
    taxRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [lastSale, setLastSale] = useState<any>(null);
  const { profile } = useAuth();
  const componentRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });

  useEffect(() => {
    // Fetch settings
    const fetchSettings = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'settings', 'system'));
        if (docSnap.exists()) {
          setSettings(docSnap.data() as SystemSettings);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchSettings();

    const q = query(collection(db, 'products'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const prods: Product[] = [];
      snapshot.forEach((doc) => prods.push({ id: doc.id, ...doc.data() } as Product));
      setProducts(prods);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return alert('المنتج غير متوفر في المخزن');

    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert('وصلت للحد الأقصى المتاح في المخزن');
          return prev;
        }
        return prev.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
            : item
        );
      }
      return [...prev, {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        price: product.sellingPrice,
        total: product.sellingPrice
      }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    const product = products.find(p => p.id === productId);
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        if (product && newQty > product.stock) {
          alert('وصلت للحد الأقصى المتاح في المخزن');
          return item;
        }
        return { ...item, quantity: newQty, total: newQty * item.price };
      }
      return item;
    }));
  };

  const totalBeforeTax = cart.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = totalBeforeTax * (settings.taxRate / 100);
  const finalAmount = totalBeforeTax + taxAmount - discount;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      const saleData = {
        items: cart,
        totalAmount: totalBeforeTax,
        taxAmount,
        discountAmount: discount,
        finalAmount,
        currency: settings.currency,
        taxRate: settings.taxRate,
        paymentMethod: 'نقدي',
        createdAt: serverTimestamp(),
        invoiceNumber: `INV-${Date.now()}`,
        userName: profile?.name || 'غير معروف'
      };

      await addDoc(collection(db, 'sales'), saleData);
      
      // Update stock for each product
      for (const item of cart) {
        await updateDoc(doc(db, 'products', item.productId), {
          stock: increment(-item.quantity)
        });
      }

      setLastSale(saleData);
      setCart([]);
      setDiscount(0);
      setCheckoutSuccess(true);
      setTimeout(() => setCheckoutSuccess(false), 5000);
    } catch (error) {
      console.error(error);
      alert('حدث خطأ أثناء عملية البيع');
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.barcode?.includes(searchTerm)
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">
      <div style={{ display: 'none' }}>
        <Receipt ref={componentRef} sale={lastSale} settings={settings} />
      </div>
      {/* Products Selection Section */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <div className="relative group">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          <input 
            type="text" 
            placeholder="البحث بالاسم، الباركود أو التصنيف (F1)..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-sm shadow-sm"
          />
        </div>

        <div className="flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {loading ? (
              <div className="col-span-full text-center py-12 text-slate-400">جاري تحميل المنتجات...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="col-span-full text-center py-12 text-slate-400">لا توجد منتجات مطابقة للبحث</div>
            ) : filteredProducts.map((product) => (
              <motion.button 
                whileHover={{ y: -2 }}
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all text-right group flex flex-col"
              >
                <div className="aspect-square bg-slate-50 rounded-lg mb-2 flex items-center justify-center text-slate-200 group-hover:bg-indigo-50 transition-colors">
                  {product.image ? <img src={product.image} className="w-full h-full object-cover rounded-lg" /> : <Package className="w-8 h-8" />}
                </div>
                <h4 className="font-bold text-slate-900 truncate text-xs mb-1">{product.name}</h4>
                <div className="mt-auto flex items-center justify-between">
                  <p className="text-indigo-600 font-black text-sm">{product.sellingPrice} {settings.currency}</p>
                  <p className={`text-[10px] font-bold ${product.stock <= 5 ? 'text-red-500' : 'text-slate-400'}`}>مخزون: {product.stock}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-full lg:w-96 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden shrink-0">
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-black tracking-tight">السلة</h3>
          </div>
          <span className="bg-slate-800 px-3 py-1 rounded-full text-[10px] font-bold uppercase">{cart.length} أصناف</span>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <AnimatePresence>
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2 opacity-50 py-12 text-center">
                <ShoppingCart className="w-10 h-10 stroke-1" />
                <p className="font-bold text-sm">السلة فارغة</p>
              </div>
            ) : cart.map((item) => (
              <motion.div 
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                key={item.productId}
                className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 truncate text-[11px] mb-0.5">{item.productName}</p>
                  <p className="text-xs font-black text-indigo-600">{item.total.toFixed(2)} {settings.currency}</p>
                </div>
                <div className="flex items-center gap-1 bg-white rounded-md border border-slate-200 px-1">
                  <button onClick={() => updateQuantity(item.productId, -1)} className="p-0.5 hover:bg-slate-100 rounded text-slate-500"><Minus className="w-3 h-3" /></button>
                  <span className="w-5 text-center font-bold text-[10px]">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.productId, 1)} className="p-0.5 hover:bg-slate-100 rounded text-slate-500"><Plus className="w-3 h-3" /></button>
                </div>
                <button onClick={() => removeFromCart(item.productId)} className="text-slate-300 hover:text-red-500 p-1 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span>المجموع</span>
            <span className="font-bold">{totalBeforeTax.toFixed(2)} {settings.currency}</span>
          </div>
          <div className="flex items-center justify-between text-slate-500">
            <span>الضريبة ({settings.taxRate}٪)</span>
            <span className="font-bold">{taxAmount.toFixed(2)} {settings.currency}</span>
          </div>
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            <span className="text-sm font-bold text-slate-900">الإجمالي</span>
            <span className="text-xl font-black text-indigo-700">{finalAmount.toFixed(2)} {settings.currency}</span>
          </div>
          
          <button 
            disabled={cart.length === 0 && !checkoutSuccess}
            onClick={checkoutSuccess ? () => handlePrint() : handleCheckout}
            className={`w-full py-3 rounded-xl font-black text-base active:scale-95 transition-all shadow-md mt-1 flex items-center justify-center gap-2 ${
              checkoutSuccess 
                ? 'bg-emerald-600 text-white shadow-emerald-100' 
                : 'bg-indigo-600 text-white shadow-indigo-100 disabled:opacity-50 disabled:grayscale'
            }`}
          >
            {checkoutSuccess ? (
              <>
                <Printer className="w-5 h-5" />
                <span>طباعة الفاتورة</span>
              </>
            ) : (
              <span>دفع وإنهاء الفاتورة</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pos;
