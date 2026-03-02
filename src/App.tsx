/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import GantiPassword from './pages/GantiPassword';
import ProtectedRoute from './components/ProtectedRoute';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import KelolaAkun from './pages/admin/KelolaAkun';
import SemuaKegiatan from './pages/admin/SemuaKegiatan';

// User Pages
import UserDashboard from './pages/user/Dashboard';
import FormInput from './pages/user/FormInput';
import Monitoring from './pages/user/Monitoring';

// PIC Pages
import PicDashboard from './pages/pic/Dashboard';
import ChecklistPending from './pages/pic/ChecklistPending';
import ChecklistComplete from './pages/pic/ChecklistComplete';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/login" replace />} />
          
          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="admin/dashboard" element={<AdminDashboard />} />
            <Route path="admin/kelola-akun" element={<KelolaAkun />} />
            <Route path="admin/semua-kegiatan" element={<SemuaKegiatan />} />
          </Route>
          
          {/* User Routes */}
          <Route element={<ProtectedRoute allowedRoles={['user']} />}>
            <Route path="user/dashboard" element={<UserDashboard />} />
            <Route path="user/form-input" element={<FormInput />} />
            <Route path="user/monitoring" element={<Monitoring />} />
          </Route>
          
          {/* PIC Routes */}
          <Route element={<ProtectedRoute allowedRoles={['pic']} />}>
            <Route path="pic/dashboard" element={<PicDashboard />} />
            <Route path="pic/checklist-pending" element={<ChecklistPending />} />
            <Route path="pic/checklist-complete" element={<ChecklistComplete />} />
          </Route>
          
          {/* Common Routes */}
          <Route path="ganti-password" element={<GantiPassword />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
