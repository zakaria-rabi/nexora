/**
 * ProductCard — Glassmorphic product card with hover actions.
 * Used across: home, shop, recommendations, similar products.
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart, Eye } from 'lucide-react';
import { useCartStore, useAuthStore, useUIStore } from '../../store';
import { recommendationsAPI } from '../../utils/api';

const REASON_LABELS = {
  hybrid:        { label: '✦ Hybrid AI', color: '#818cf8' },
  collaborative: { label: '✦ You May Like', color: '#818cf8' },
  content:       { label: '✦ Similar Pick', color: '#22d3ee' },
  trending:      { label: '🔥 Trending', color: '#fbbf24' },
  new:           { label: '★ New', color: '#34d399' },
  popular:       { label: '⬆ Popular', color: '#f472b6' },
};

function Stars({ rating }) {
  return (
    <div style={{ display: 'flex', gap: 1 }}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} style={{ color: i < Math.floor(rating) ? '#fbbf24' : 'rgba(255,255,255,0.15)', fontSize: 12 }}>★</span>
      ))}
    </div>
  );
}

export default function ProductCard({ product, recTag, index = 0 }) {
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { showToast } = useUIStore();
  const [adding, setAdding] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  const discount = product.compare_price
    ? Math.round((1 - product.price / product.compare_price) * 100)
    : null;

  const primaryImage = product.primary_image || product.images?.[0]?.url;
  const rec = recTag ? REASON_LABELS[recTag] : null;

  async function handleAddToCart(e) {
    e.stopPropagation();
    if (!isAuthenticated) { navigate('/login'); return; }
    setAdding(true);
    const ok = await addItem(product.id, 1);
    if (ok) showToast(`${product.name} added to cart 🛍️`);
    setTimeout(() => setAdding(false), 1500);
  }

  function handleWishlist(e) {
    e.stopPropagation();
    setWishlisted(w => !w);
    showToast(wishlisted ? 'Removed from wishlist' : 'Added to wishlist ❤️');
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      whileHover={{ y: -6 }}
      onClick={() => navigate(`/shop/${product.slug}`)}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 20,
        overflow: 'hidden',
        cursor: 'pointer',
        position: 'relative',
      }}
      className="product-card-hover"
    >
      {/* Image Area */}
      <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden' }}>
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s' }}
            onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.target.style.transform = 'scale(1)'}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%', background: 'var(--bg3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56
          }}>
            📦
          </div>
        )}

        {/* Badges */}
        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {discount && (
            <span style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)', padding: '2px 8px', borderRadius: 100, fontSize: 11, fontWeight: 600 }}>
              -{discount}%
            </span>
          )}
          {product.is_featured && !rec && (
            <span style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)', padding: '2px 8px', borderRadius: 100, fontSize: 11, fontWeight: 600 }}>
              Featured
            </span>
          )}
        </div>

        {/* Hover actions */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileHover={{ opacity: 1, y: 0 }}
          style={{ position: 'absolute', bottom: 10, right: 10, display: 'flex', gap: 8 }}
        >
          <button
            onClick={handleAddToCart}
            style={{
              padding: 8, borderRadius: 8, border: '1px solid var(--border2)',
              background: adding ? 'rgba(52,211,153,0.15)' : 'rgba(10,10,16,0.85)',
              color: adding ? '#34d399' : 'var(--text)',
              cursor: 'pointer', backdropFilter: 'blur(8px)', transition: 'all 0.2s',
            }}
          >
            <ShoppingBag size={15} />
          </button>
          <button
            onClick={handleWishlist}
            style={{
              padding: 8, borderRadius: 8, border: '1px solid var(--border2)',
              background: wishlisted ? 'rgba(244,114,182,0.15)' : 'rgba(10,10,16,0.85)',
              color: wishlisted ? '#f472b6' : 'var(--text)',
              cursor: 'pointer', backdropFilter: 'blur(8px)', transition: 'all 0.2s',
            }}
          >
            <Heart size={15} fill={wishlisted ? '#f472b6' : 'none'} />
          </button>
        </motion.div>
      </div>

      {/* Info */}
      <div style={{ padding: 16 }}>
        {rec && (
          <div style={{ color: rec.color, fontSize: 10, fontWeight: 700, letterSpacing: '0.5px', marginBottom: 6 }}>
            {rec.label}
          </div>
        )}
        <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
          {product.brand}
        </div>
        <div style={{ fontSize: 15, fontWeight: 600, fontFamily: 'Syne, sans-serif', lineHeight: 1.3, marginBottom: 8 }}>
          {product.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Stars rating={product.avg_rating} />
          <span style={{ fontSize: 12, color: 'var(--text3)' }}>
            {product.avg_rating} ({product.review_count?.toLocaleString()})
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: 20, fontWeight: 800, fontFamily: 'Syne, sans-serif' }}>
              ${Number(product.price).toFixed(2)}
            </span>
            {product.compare_price && (
              <span style={{ fontSize: 13, color: 'var(--text3)', textDecoration: 'line-through', marginLeft: 6 }}>
                ${Number(product.compare_price).toFixed(2)}
              </span>
            )}
          </div>
          {product.stock_quantity < 10 && product.stock_quantity > 0 && (
            <span style={{ fontSize: 11, color: '#fbbf24', fontWeight: 600 }}>
              Only {product.stock_quantity} left!
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
