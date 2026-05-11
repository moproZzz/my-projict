import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { 
  TrendingUp, Package, ShoppingCart, AlertCircle, Users, ArrowUpRight, ArrowDownRight, Plus
} from 'lucide-react';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { getDoc, doc } from 'firebase/firestore';
import { SystemSettings } from '../types';

const StatsCard = ({ title, value, icon: Icon, color, trend, extraBold }: any) => (
  <div className={`bg-white p-5 rounded-xl border border-slate-200 shadow-sm ${extraBold ? 'border-r-4 border-r-amber-500' : ''}`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-slate-500 text-sm mb-1">{title}</p>
        <h3 className={`text-2xl font-bold ${extraBold ? 'text-amber-600' : 'text-slate-900'}`}>{value}</h3>
        {trend && (
          <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend.positive ? 'text-emerald-600' : 'text-red-500'}`}>
            <span>%{trend.value} منذ الشهر الماضي</span>
          </div>
        )}
        {!trend && extraBold && (
          <div className="text-xs text-slate-400 mt-2">تتطلب إعادة طلب فورية</div>
        )}
      </div>
      <div className={`p-2.5 rounded-lg ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: '0',
    lowStock: 0,
    todaySales: '0',
    monthlyProfit: '0',
  });
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState('جنية مصري');

  const fetchStats = async () => {
    try {
      // Fetch settings
      const settingsSnap = await getDoc(doc(db, 'settings', 'system'));
      let currentCurrency = 'جنية مصري';
      if (settingsSnap.exists()) {
        const s = settingsSnap.data() as SystemSettings;
        currentCurrency = s.currency;
        setCurrency(s.currency);
      }

      // Fetch total products
      const productsSnap = await getDocs(collection(db, 'products'));
      const totalDocs = productsSnap.docs;
      const totalProductsCount = totalDocs.length;
      const lowStockCount = totalDocs.filter(d => (d.data().stock || 0) <= 5).length;

      // Fetch today's sales
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const salesQuery = query(collection(db, 'sales'), where('createdAt', '>=', startOfDay));
      const salesSnap = await getDocs(salesQuery);
      let todayTotal = 0;
      salesSnap.forEach(doc => {
        todayTotal += doc.data().finalAmount || 0;
      });

      setStats({
        totalProducts: totalProductsCount.toLocaleString(),
        lowStock: lowStockCount,
        todaySales: `${todayTotal.toLocaleString()}`,
        monthlyProfit: '0',
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const chartData = [
    { name: 'السبت', sales: 0 },
    { name: 'الأحد', sales: 0 },
    { name: 'الإثنين', sales: 0 },
    { name: 'الثلاثاء', sales: 0 },
    { name: 'الأربعاء', sales: 0 },
    { name: 'الخميس', sales: 0 },
    { name: 'الجمعة', sales: 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">لوحة التحكم</h1>
          <p className="text-sm text-slate-500">نظرة عامة على أداء المستودع والمبيعات</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-xs font-bold text-slate-600 shadow-sm hover:bg-slate-50 transition-all">تصدير PDF</button>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md hover:bg-indigo-700 transition-all">إضافة مخزون</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="إجمالي المنتجات" 
          value={loading ? '...' : stats.totalProducts} 
          icon={Package} 
          color="bg-blue-50 text-blue-600"
        />
        <StatsCard 
          title="نواقص المخزون" 
          value={loading ? '...' : stats.lowStock} 
          icon={AlertCircle} 
          color="bg-amber-50 text-amber-600"
          extraBold={stats.lowStock > 0}
        />
        <StatsCard 
          title="مبيعات اليوم" 
          value={loading ? '...' : `${stats.todaySales} ${currency}`} 
          icon={ShoppingCart} 
          color="bg-indigo-50 text-indigo-600"
        />
        <StatsCard 
          title="أرباح الشهر" 
          value={loading ? '...' : `${stats.monthlyProfit} ${currency}`} 
          icon={TrendingUp} 
          color="bg-emerald-50 text-emerald-600"
        />
      </div>

      <div className="grid grid-cols-12 gap-6 h-[400px]">
        <div className="col-span-12 lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800">حركة المبيعات الأسبوعية</h3>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-500">آخر ٧ أيام</span>
            </div>
          </div>
          <div className="flex-1 p-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-bold text-slate-800">أحدث العمليات</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="h-full flex items-center justify-center text-slate-400 text-xs italic">لا توجد عمليات مضافة حالياً</div>
          </div>
          <button className="p-4 text-center text-xs font-bold text-indigo-600 hover:bg-slate-50 transition-colors border-t border-slate-100">
            عرض كل النشاطات
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
