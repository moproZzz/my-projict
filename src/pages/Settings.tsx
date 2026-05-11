import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SystemSettings } from '../types';
import { Settings as SettingsIcon, Save, RefreshCw, Landmark, Globe, CreditCard } from 'lucide-react';

const Settings = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    companyName: 'هويدي',
    currency: 'جنية مصري',
    taxRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'system');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSettings(docSnap.data() as SystemSettings);
        } else {
          // حفظ الإعدادات الافتراضية إذا لم تكن موجودة
          await setDoc(docRef, settings);
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
    
    // فك التعليق بعد 3 ثواني كحد أقصى للأمان
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'system'), settings);
      alert('تم حفظ الإعدادات بنجاح');
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-slate-400">جاري تحميل الإعدادات...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 border border-indigo-100">
          <SettingsIcon className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">إعدادات النظام</h1>
          <p className="text-sm text-slate-500">تخصيص معلومات المؤسسة والبيانات الضريبية</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
        <div className="p-6 space-y-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4 uppercase text-xs tracking-wider">
            <Landmark className="w-4 h-4 text-indigo-500" />
            المعلومات الأساسية
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">اسم المؤسسة / الشركة</label>
              <input 
                required
                type="text" 
                value={settings.companyName}
                onChange={(e) => setSettings({...settings, companyName: e.target.value})}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">العملة</label>
                <input 
                  required
                  type="text" 
                  value={settings.currency}
                  onChange={(e) => setSettings({...settings, currency: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">نسبة الضريبة (٪)</label>
                <input 
                  required
                  type="number" 
                  value={settings.taxRate}
                  onChange={(e) => setSettings({...settings, taxRate: Number(e.target.value)})}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4 bg-slate-50/50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4 uppercase text-xs tracking-wider">
            <RefreshCw className="w-4 h-4 text-emerald-500" />
            قاعدة البيانات
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed mb-4">
            يمكنك إجراء نسخ احتياطي لبياناتك أو استعادتها من ملف خارجي لضمان سلامة بيانات المستودع.
          </p>
          <div className="flex gap-3">
            <button type="button" className="flex-1 bg-white border border-slate-200 text-slate-700 py-2 rounded-lg text-xs font-bold hover:bg-slate-100 transition-all">تصدير قاعدة البيانات</button>
            <button type="button" className="flex-1 bg-white border border-slate-200 text-slate-700 py-2 rounded-lg text-xs font-bold hover:bg-slate-100 transition-all">استيراد من ملف</button>
          </div>
        </div>

        <div className="p-6 flex justify-end">
          <button 
            type="submit" 
            disabled={saving}
            className="bg-indigo-600 text-white px-8 py-2.5 rounded-lg font-bold text-sm hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 flex items-center gap-2"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>حفظ الإعدادات</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings; 

