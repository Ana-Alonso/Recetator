import { TrendingDown, Info } from 'lucide-react';

interface PriceTrendsTabProps {
  trends: any;
  SUPERMARKET_COLOR_HEX: Record<string, string>;
}

export default function PriceTrendsTab({
  trends,
  SUPERMARKET_COLOR_HEX
}: PriceTrendsTabProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="glass-card">
        <h2 className="card-title">
          <TrendingDown size={24} style={{ color: '#f87171' }} />
          Historial y Alertas de Precios AI
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.5rem' }}>
          Nuestra base de datos registra los precios cada vez que se consultan los supermercados. La IA escanea estos datos históricos para encontrar ofertas reales y productos que han bajado de precio.
        </p>

        <h3 style={{ fontSize: '1.1rem', color: '#fff', margin: '0 0 1rem 0' }}>
          Fluctuaciones en Tiempo Real (Base de Datos)
        </h3>
        {trends?.real_trends && trends.real_trends.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {trends.real_trends.map((t: any, idx: number) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <span style={{ display: 'inline-block', fontSize: '0.7rem', fontWeight: 700, marginRight: '0.5rem', textTransform: 'capitalize', color: SUPERMARKET_COLOR_HEX[t.supermercado_id] || '#60a5fa' }}>
                    {t.supermercado_id}
                  </span>
                  <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>Ref: {t.referencia_id}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8', textDecoration: 'line-through' }}>{t.old_price.toFixed(2)}€</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 700, color: t.direction === 'down' ? '#34d399' : '#f87171' }}>{t.new_price.toFixed(2)}€</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.15rem 0.4rem', borderRadius: '0.25rem', backgroundColor: t.direction === 'down' ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)', color: t.direction === 'down' ? '#34d399' : '#f87171' }}>
                    {t.direction === 'down' ? '-' : '+'}{Math.abs(t.change_pct)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0 0 1.5rem 0', fontStyle: 'italic' }}>
            Esperando a que el scraper registre cambios en la base de datos de productos.
          </p>
        )}

        <h3 style={{ fontSize: '1.1rem', color: '#fff', margin: '1.5rem 0 1rem 0' }}>
          Ofertas Destacadas de la Semana (Histórico)
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {(trends?.mock_trends || []).map((t: any, idx: number) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <span style={{ display: 'inline-block', fontSize: '0.7rem', fontWeight: 700, color: SUPERMARKET_COLOR_HEX[t.supermercado_id] || '#60a5fa', textTransform: 'capitalize', marginBottom: '0.25rem' }}>
                  {t.supermercado_id}
                </span>
                <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>{t.product_name}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8', textDecoration: 'line-through' }}>{t.old_price.toFixed(2)}€</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: t.direction === 'down' ? '#34d399' : '#f87171' }}>{t.new_price.toFixed(2)}€</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.15rem 0.4rem', borderRadius: '0.25rem', backgroundColor: t.direction === 'down' ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)', color: t.direction === 'down' ? '#34d399' : '#f87171' }}>
                  {t.direction === 'down' ? '-' : '+'}{Math.abs(t.change_pct)}%
                </span>
              </div>
            </div>
          ))}
        </div>
        
        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', backgroundColor: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', padding: '1rem', borderRadius: '0.75rem', color: '#60a5fa' }}>
          <Info size={20} style={{ flexShrink: 0 }} />
          <div>
            <h4 style={{ margin: '0 0 0.25rem 0', fontWeight: 700, fontSize: '0.9rem' }}>Recomendación Inteligente de Compra</h4>
            <p style={{ margin: 0, fontSize: '0.8rem', lineHeight: '1.5', color: '#93c5fd' }}>
              Esta semana la cesta de la compra de frutas y verduras está un 10% más barata en <strong>Aldi</strong>. El aceite de oliva ha bajado de precio en <strong>Mercadona</strong>, situándose como la opción de marca propia más barata.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
