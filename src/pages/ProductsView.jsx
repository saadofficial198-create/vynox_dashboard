import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, ExternalLink, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../api/client';
import PageLoader from '../components/PageLoader';

export default function ProductsView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [site, setSite] = useState(null);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage] = useState(25);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sRes, pRes] = await Promise.all([
        api.getSite(id),
        api.getProducts(id, { page, per_page: perPage })
      ]);
      setSite(sRes.data);
      setProducts(pRes.data.products || []);
      setTotal(pRes.data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id, page, perPage]);

  useEffect(() => { load(); }, [load]);

  if (loading && page === 1) return <PageLoader />;

  return (
    <div className="page-enter" style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
      <button className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }} onClick={() => navigate(`/sites/${id}`)}>
        <ArrowLeft size={13} /> Back to Site Details
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 12 }}>
            <ShoppingBag size={24} style={{ color: 'var(--accent)' }} />
            WooCommerce Products
          </h1>
          <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>
            {site?.domain} — {total} products synced
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button 
            className="btn btn-ghost btn-sm" 
            disabled={page === 1} 
            onClick={() => setPage(p => p - 1)}
          >
            <ChevronLeft size={14} />
          </button>
          <span style={{ display: 'flex', alignItems: 'center', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
            Page {page} of {Math.ceil(total / perPage) || 1}
          </span>
          <button 
            className="btn btn-ghost btn-sm" 
            disabled={page >= Math.ceil(total / perPage)} 
            onClick={() => setPage(p => p + 1)}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {products.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
            <ShoppingBag size={32} style={{ marginBottom: 12, opacity: 0.5 }} />
            <div>No products found for this site.</div>
          </div>
        ) : (
          <table className="vynox-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Stock</th>
                <th>SKU</th>
                <th>Orders</th>
                <th>Reviews</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p._id}>
                  <td style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {p.image ? (
                      <img src={p.image} alt="" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover', background: 'var(--border)' }} />
                    ) : (
                      <div style={{ width: 36, height: 36, borderRadius: 6, background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ShoppingBag size={14} style={{ color: 'var(--text-muted)' }} />
                      </div>
                    )}
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{p.title}</div>
                      <a href={p.permalink} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 3, textDecoration: 'none' }}>
                        View Store <ExternalLink size={10} />
                      </a>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{p.price}</div>
                    {p.onSale && <div style={{ fontSize: 10, color: 'var(--text-muted)', textDecoration: 'line-through' }}>{p.regularPrice}</div>}
                  </td>
                  <td>
                    <span className={`badge ${p.stockStatus === 'instock' ? 'badge-success' : 'badge-critical'}`}>
                      {p.stockStatus}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{p.sku || '—'}</td>
                  <td style={{ fontWeight: 600 }}>{p.totalOrders}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{p.totalReviews}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
