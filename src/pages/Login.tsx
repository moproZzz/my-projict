import React, { useState } from 'react';
import { signInWithEmailAndPassword, signInAnonymously } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { LogIn, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err: any) {
      setError('خطأ في البريد الإلكتروني أو كلمة المرور');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      // For demo purposes, we can use a fixed admin account if exists or just alert
      // In this environment, we'll try a common demo account or ask user
      // For now, let's just show an info message
      setEmail('admin@demo.com');
      setPassword('admin123');
      setError('الرجاء استخدام: admin@demo.com / admin123 (إذا تم إعداده)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-indigo-600 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4">م</div>
          <h1 className="text-2xl font-black text-gray-900 mb-1">مخزون - نظام الإدارة</h1>
          <p className="text-gray-500">قم بتسجيل الدخول للوصول إلى لوحة التحكم</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2 mb-6 text-sm border border-red-100">
            <ShieldAlert className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">البريد الإلكتروني</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              placeholder="admin@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">كلمة المرور</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              placeholder="••••••••"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? 'جاري التحميل...' : (
              <>
                <LogIn className="w-5 h-5" />
                <span>دخول</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-center text-sm text-gray-500 mb-4">أو استخدم بيانات التجربة</p>
          <button 
            onClick={handleDemoLogin}
            className="w-full border border-gray-200 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors"
          >
            بيانات تجريبية
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
