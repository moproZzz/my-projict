import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, Search, User as UserIcon } from 'lucide-react';

const Header = () => {
  const { profile } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 sticky top-0 z-10">
      <div className="flex items-center gap-4 flex-1 max-w-lg hidden md:flex">
        <div className="relative group w-full">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          <input 
            type="text" 
            placeholder="بحث سريع عن منتج، فاتورة، عميل..." 
            className="w-full pr-10 pl-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative p-2 text-slate-500 hover:text-indigo-600 transition-colors transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        
        <div className="text-sm text-slate-500 font-medium hidden sm:block">
          {new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>

        <div className="flex items-center gap-3 border-r border-slate-100 pr-6">
          <div className="text-left md:text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-900">{profile?.name}</p>
            <p className="text-xs text-slate-400">{profile?.role === 'admin' ? 'مدير النظام' : 'موظف'}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold">
            {profile?.name?.charAt(0) || 'ع'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
