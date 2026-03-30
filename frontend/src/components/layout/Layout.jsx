/**
 * Main Layout — Navigation + Outlet
 */
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Search, User, Zap, Home, Grid, Star, Package, ChevronDown } from 'lucide-react';
import { useCartStore, useAuthStore } from '../../store';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { items } = useCartStore();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const cartCount = items.reduce((s, i) => s + i.quantity, 0);
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/shop', label: 'Shop' },
    { path: '/recommendations', label: 'For You', badge: '✨' },
    { path: '/orders', label: 'Orders' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* ─── Navbar ───────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? 'rgba(5,5,8,0.92)' : 'transparent',
        borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        transition: 'all 0.3s',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', height: 64, gap: 32 }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'linear-gradient(135deg, #6366f1, #22d3ee)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, color: '#fff',
            }}>N</div>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: 'var(--text)', letterSpacing: '-0.5px' }}>
              NEXORA
            </span>
          </Link>

          {/* Nav links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
            {navLinks.map(link => (
              <Link key={link.path} to={link.path} style={{
                padding: '6px 14px', borderRadius: 8, fontSize: 14, fontWeight: 500,
                color: isActive(link.path) ? 'var(--text)' : 'var(--text2)',
                background: isActive(link.path) ? 'var(--surface2)' : 'transparent',
                textDecoration: 'none', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6,
              }}>
                {link.badge && <span style={{ fontSize: 12 }}>{link.badge}</span>}
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => navigate('/shop')} style={{ padding: 8, borderRadius: 8, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text2)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex' }}>
              <Search size={17} />
            </button>

            <button onClick={() => navigate('/cart')} style={{ padding: 8, borderRadius: 8, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text2)', cursor: 'pointer', position: 'relative', display: 'flex', transition: 'all 0.2s' }}>
              <ShoppingBag size={17} />
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute', top: -6, right: -6,
                  background: '#6366f1', color: '#fff', borderRadius: '50%',
                  width: 18, height: 18, fontSize: 9, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid var(--bg)',
                }}>{cartCount}</span>
              )}
            </button>

            {isAuthenticated ? (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setUserMenuOpen(o => !o)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px',
                    borderRadius: 8, background: 'var(--surface)', border: '1px solid var(--border)',
                    color: 'var(--text)', cursor: 'pointer', fontSize: 13, fontWeight: 500,
                  }}
                >
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #f472b6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff' }}>
                    {user?.full_name?.[0] || user?.username?.[0] || 'U'}
                  </div>
                  {user?.full_name?.split(' ')[0] || user?.username}
                  <ChevronDown size={13} />
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                      style={{
                        position: 'absolute', top: '110%', right: 0,
                        background: 'var(--bg2)', border: '1px solid var(--border2)',
                        borderRadius: 12, padding: 8, minWidth: 160, zIndex: 200,
                      }}
                    >
                      {user?.role === 'admin' && (
                        <button onClick={() => { navigate('/admin'); setUserMenuOpen(false); }} style={{ width: '100%', padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', color: '#818cf8', fontSize: 13, cursor: 'pointer', borderRadius: 8 }}>
                          Admin Dashboard
                        </button>
                      )}
                      <button onClick={() => { navigate('/orders'); setUserMenuOpen(false); }} style={{ width: '100%', padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', color: 'var(--text2)', fontSize: 13, cursor: 'pointer', borderRadius: 8 }}>
                        My Orders
                      </button>
                      <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
                      <button onClick={() => { logout(); setUserMenuOpen(false); }} style={{ width: '100%', padding: '8px 12px', textAlign: 'left', background: 'none', border: 'none', color: '#f87171', fontSize: 13, cursor: 'pointer', borderRadius: 8 }}>
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button onClick={() => navigate('/login')} style={{ padding: '8px 16px', borderRadius: 8, background: '#6366f1', color: '#fff', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ─── Page content ─────────────────────────── */}
      <main style={{ paddingTop: 64 }}>
        <Outlet />
      </main>

      {/* ─── Mobile bottom nav ────────────────────── */}
      <nav style={{
        display: 'none', position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(5,5,8,0.95)', borderTop: '1px solid var(--border)',
        backdropFilter: 'blur(20px)', padding: '8px 0', zIndex: 100,
      }} className="mobile-bottom-nav">
        {[
          { path: '/', icon: <Home size={22} />, label: 'Home' },
          { path: '/shop', icon: <Grid size={22} />, label: 'Shop' },
          { path: '/recommendations', icon: <Star size={22} />, label: 'For You' },
          { path: '/cart', icon: <ShoppingBag size={22} />, label: 'Cart' },
          { path: '/orders', icon: <Package size={22} />, label: 'Orders' },
        ].map(item => (
          <button key={item.path} onClick={() => navigate(item.path)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '6px 0', background: 'none', border: 'none', color: isActive(item.path) ? '#818cf8' : 'var(--text3)', cursor: 'pointer', fontSize: 10 }}>
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
