import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Truck, 
  History, 
  Settings, 
  BarChart3,
  Store
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Sidebar = () => {
  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'لوحة التحكم' },
    { to: '/pos', icon: Store, label: 'نقاط البيع (POS)' },
    { to: '/products', icon: Package, label: 'المنتجات' },
    { to: '/sales', icon: ShoppingCart, label: 'المبيعات' },
    { to: '/customers', icon: Users, label: 'العملاء' },
    { to: '/suppliers', icon: Truck, label: 'الموردين' },
    { to: '/inventory', icon: History, label: 'حركة المخزون' },
    { to: '/settings', icon: Settings, label: 'الإعدادات' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white shrink-0">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-xl">م</div>
          <span className="text-xl font-bold tracking-tight">نظام مخزني</span>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group",
              isActive 
                ? "bg-indigo-600 text-white font-medium" 
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            )}
          >
            <item.icon className={cn("w-5 h-5", "group-hover:scale-110 transition-transform")} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 mt-auto">
        <div className="flex items-center gap-3 px-4 py-3 text-slate-500 text-xs">
          <span>الإصدار 1.0.0</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
