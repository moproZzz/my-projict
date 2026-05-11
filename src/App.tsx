/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Sales from './pages/Sales';
import Customers from './pages/Customers';
import Suppliers from './pages/Suppliers';
import InventoryLog from './pages/InventoryLog';
import Settings from './pages/Settings';
import Pos from './pages/Pos';

// قمنا بإزالة ProtectedRoute و Login لأننا لم نعد بحاجة لهما

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* الآن جميع الروابط داخل الـ Layout مباشرة بدون شرط تسجيل الدخول */}
          <Route
            path="/*"
            element={
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/sales" element={<Sales />} />
                  <Route path="/pos" element={<Pos />} />
                  <Route path="/customers" element={<Customers />} />
                  <Route path="/suppliers" element={<Suppliers />} />
                  <Route path="/inventory" element={<InventoryLog />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </Layout>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}