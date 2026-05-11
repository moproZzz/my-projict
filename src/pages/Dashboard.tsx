import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { 
  TrendingUp, Package, ShoppingCart, AlertCircle, Users, ArrowUpRight, ArrowDownRight 
} from 'lucide-react';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

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
    totalProducts: '4,280',
    lowStock: 18,
    todaySales: '12,450 ر.س',
    monthlyProfit: '89,200 ر.س',
  });

  const chartData = [
    { name: 'السبت', sales: 4000 },
    { name: 'الأحد', sales: 3000 },
    { name: 'الإثنين', sales: 2000 },
    { name: 'الثلاثاء', sales: 2780 },
    { name: 'الأربعاء', sales: 1890 },
    { name: 'الخميس', sales: 2390 },
    { name: 'الجمعة', sales: 3490 },
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
          value={stats.totalProducts} 
          icon={Package} 
          color="bg-blue-50 text-blue-600"
          trend={{ value: 12, positive: true }}
        />
        <StatsCard 
          title="نواقص المخزون" 
          value={stats.lowStock} 
          icon={AlertCircle} 
          color="bg-amber-50 text-amber-600"
          extraBold={true}
        />
        <StatsCard 
          title="مبيعات اليوم" 
          value={stats.todaySales} 
          icon={ShoppingCart} 
          color="bg-indigo-50 text-indigo-600"
        />
        <StatsCard 
          title="أرباح الشهر" 
          value={stats.monthlyProfit} 
          icon={TrendingUp} 
          color="bg-emerald-50 text-emerald-600"
          trend={{ value: 2.4, positive: true }}
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
            {[
              { type: 'sale', title: 'فاتورة بيع جديدة', sub: '#INV-2940', time: 'قبل ٥ دقائق', amount: '١،٤٠٠ ر.س', positive: true },
              { type: 'stock', title: 'استلام شحنة', sub: 'S-802', time: 'قبل ١٨ دقيقة', amount: '٥٠ قطعة', positive: true },
              { type: 'alert', title: 'تنبيه: نفاذ كمية', sub: 'آيفون ١٥', time: 'قبل ساعة', amount: '٢ قطعة', positive: false },
            ].map((op, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  op.type === 'sale' ? 'bg-emerald-100 text-emerald-600' : 
                  op.type === 'stock' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'
                }`}>
                  {op.type === 'sale' && <ArrowUpRight className="w-4 h-4" />}
                  {op.type === 'stock' && <Plus className="w-4 h-4" />}
                  {op.type === 'alert' && <AlertCircle className="w-4 h-4" />}
                </div>
                <div className="text-sm">
                  <div className="font-medium text-slate-700">{op.title} <span className="font-bold text-slate-900">{op.sub}</span></div>
                  <div className="text-[10px] text-slate-400">{op.time} • {op.amount}</div>
                </div>
              </div>
            ))}
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
