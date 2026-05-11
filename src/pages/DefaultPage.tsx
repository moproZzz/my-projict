import React from 'react';

const DefaultPage = ({ title }: { title: string }) => (
  <div className="bg-white p-12 rounded-xl border border-slate-200 shadow-sm text-right flex flex-col items-center justify-center min-h-[300px]">
    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100">
      <div className="w-8 h-8 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
    </div>
    <h1 className="text-xl font-black text-slate-800 mb-2 tracking-tight">{title}</h1>
    <p className="text-slate-500 max-w-sm text-center text-sm leading-relaxed">
      هذه الصفحة قيد التطوير حالياً. سيتم إضافتها قريباً كجزء من الميزات المتقدمة لنظام إدارة المستودعات.
    </p>
  </div>
);

export default DefaultPage;
