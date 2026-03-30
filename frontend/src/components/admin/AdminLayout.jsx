/**
 * Admin Layout — sidebar + content area
 */
import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { BarChart2, Package, ShoppingCart, Users, Cpu, LogOut, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../../store';

const links = [
  { to: '/admin', label: 'Dashboard', icon: <BarChart2 size={18} />, end: true },
  { to: '/admin/products', label: 'Products', icon: <Package size={18} /> },
  { to: '/admin/orders', label: 'Orders', icon: <ShoppingCart size={18} /> },
  { to: '/admin/users', label: 'Users', icon: <Users size={18} /> },
];

export default function AdminLayout() {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Sidebar */}
      <aside style={{ width: 240, background: 'var(--bg2)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', padding: '24px 16px', flexShrink: 0, position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32, padding: '0 8px' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #6366f1, #22d3ee)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne', fontWeight: 800, fontSize: 14, color: '#fff' }}>N</div>
          <div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14 }}>NEXORA</div>
            <div style={{ fontSize: 11, color: 'var(--text3)' }}>Admin Panel</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', padding: '0 8px', marginBottom: 8 }}>Menu</div>
          {links.map(link => (
            <NavLink key={link.to} to={link.to} end={link.end} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10,
              marginBottom: 4, textDecoration: 'none', fontSize: 14, fontWeight: 500, transition: 'all 0.2s',
              color: isActive ? 'var(--accent2)' : 'var(--text2)',
              background: isActive ? 'rgba(99,102,241,0.1)' : 'transparent',
            })}>
              {link.icon}
              {link.label}
            </NavLink>
          ))}

          <div style={{ height: 1, background: 'var(--border)', margin: '16px 0' }} />
          <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', padding: '0 8px', marginBottom: 8 }}>AI Engine</div>
          <button style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, width: '100%', background: 'none', border: 'none', color: '#818cf8', fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}
            onClick={() => alert('ML retraining triggered! Check logs.')}>
            <Cpu size={18} />
            Retrain AI Model
          </button>
        </nav>

        {/* Footer */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px', marginBottom: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #f472b6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {user?.full_name?.[0] || 'A'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.full_name || 'Admin'}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>Administrator</div>
            </div>
          </div>
          <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', borderRadius: 8, background: 'none', border: 'none', color: 'var(--text3)', fontSize: 13, cursor: 'pointer', marginBottom: 4 }}>
            <ArrowLeft size={15} /> Back to Store
          </button>
          <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', borderRadius: 8, background: 'none', border: 'none', color: '#f87171', fontSize: 13, cursor: 'pointer' }}>
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: 32, overflowY: 'auto', minHeight: '100vh' }}>
        <Outlet />
      </main>
    </div>
  );
}
