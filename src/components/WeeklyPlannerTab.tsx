import { Brain, Sparkles, AlertTriangle, RotateCw, CheckCircle2, Save } from 'lucide-react';

interface WeeklyPlannerTabProps {
  weeklyBudget: number;
  setWeeklyBudget: (val: number) => void;
  supermarketId: string;
  setSupermarketId: (val: string) => void;
  dietType: string;
  setDietType: (val: string) => void;
  usePantry: boolean;
  setUsePantry: (val: boolean) => void;
  pantryItems: any[];
  selectedAllergens: string[];
  toggleAllergen: (allergen: string) => void;
  errorMessage: string;
  isGeneratingMenu: boolean;
  handleGenerateMenu: () => void;
  generatedMenu: any;
  weeklySavingStatus: Record<string, 'idle' | 'saving' | 'saved' | 'error'>;
  handleSaveWeeklyRecipe: (recipe: any, day: string, mealType: string) => void;
  ALLERGEN_OPTIONS: string[];
  SUPERMARKET_COLOR_HEX: Record<string, string>;
}

export default function WeeklyPlannerTab({
  weeklyBudget,
  setWeeklyBudget,
  supermarketId,
  setSupermarketId,
  dietType,
  setDietType,
  usePantry,
  setUsePantry,
  pantryItems,
  selectedAllergens,
  toggleAllergen,
  errorMessage,
  isGeneratingMenu,
  handleGenerateMenu,
  generatedMenu,
  weeklySavingStatus,
  handleSaveWeeklyRecipe,
  ALLERGEN_OPTIONS,
  SUPERMARKET_COLOR_HEX
}: WeeklyPlannerTabProps) {
  return (
    <>
      <div className="glass-card">
        <h2 className="card-title">
          <Brain size={24} style={{ color: '#c084fc' }} />
          Planificador Semanal Inteligente
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.5rem' }}>
          Genera un menú equilibrado para la semana (21 comidas) que se ajuste a tus filtros y optimice el presupuesto aprovechando los productos que ya tienes en tu despensa.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Presupuesto Semanal Máximo (€)</label>
            <input 
              type="number" 
              min={10} 
              max={200} 
              step={5}
              value={weeklyBudget} 
              onChange={(e) => setWeeklyBudget(Number(e.target.value))}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Supermercado Preferido</label>
            <select value={supermarketId} onChange={(e) => setSupermarketId(e.target.value)} className="form-select">
              <option value="todos">Todos (Comparativa)</option>
              <option value="mercadona">Mercadona</option>
              <option value="eroski">Eroski</option>
              <option value="dia">Dia</option>
              <option value="aldi">Aldi</option>
              <option value="carrefour">Carrefour</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Tipo de Dieta</label>
            <select value={dietType} onChange={(e) => setDietType(e.target.value)} className="form-select">
              <option value="omnivoro">Omnívoro</option>
              <option value="vegetariano">Vegetariano</option>
              <option value="vegano">Vegano</option>
              <option value="pescetariano">Pescetariano</option>
              <option value="keto">Keto</option>
              <option value="paleo">Paleo</option>
              <option value="sin_gluten">Sin Gluten</option>
              <option value="sin_lactosa">Sin Lactosa</option>
              <option value="mediterranea">Mediterránea</option>
            </select>
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', height: '100%', paddingTop: '1.5rem' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', margin: 0 }}>
              <input 
                type="checkbox" 
                checked={usePantry} 
                onChange={(e) => setUsePantry(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: '#a78bfa' }}
              />
              Descontar existencias de Despensa ({pantryItems.length} art.)
            </label>
          </div>
        </div>

        <div className="form-group" style={{ marginTop: '1rem' }}>
          <label className="form-label">Alérgenos a Excluir</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {ALLERGEN_OPTIONS.map(allergen => {
              const active = selectedAllergens.includes(allergen);
              return (
                <button 
                  key={allergen}
                  onClick={() => toggleAllergen(allergen)}
                  className={`allergen-tag ${active ? 'active' : ''}`}
                  type="button"
                >
                  {allergen}
                </button>
              );
            })}
          </div>
        </div>

        {errorMessage && (
          <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', padding: '0.85rem', borderRadius: '0.75rem', color: '#f87171', fontSize: '0.9rem', marginTop: '1rem', alignItems: 'center' }}>
            <AlertTriangle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        <button 
          onClick={handleGenerateMenu}
          disabled={isGeneratingMenu}
          className="btn-primary"
          style={{ marginTop: '1.5rem' }}
        >
          {isGeneratingMenu ? (
            <>
              <RotateCw size={18} className="spinner" />
              Optimizando menú y cesta...
            </>
          ) : (
            <>
              <Sparkles size={18} />
              Optimizar Menú Semanal con IA
            </>
          )}
        </button>
      </div>

      {generatedMenu && (
        <div className="glass-card" style={{ border: '1px solid rgba(192,132,252,0.3)', boxShadow: '0 0 20px rgba(192,132,252,0.1)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="metric-box" style={{ padding: '1rem' }}>
              <span className="metric-label" style={{ fontSize: '0.75rem' }}>Coste de Compra Semanal</span>
              <div className="metric-value" style={{ color: '#34d399', fontSize: '1.8rem' }}>{Number(generatedMenu.total_shopping_cost).toFixed(2)}€</div>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Límite: {weeklyBudget}€</span>
            </div>
            <div className="metric-box" style={{ padding: '1rem' }}>
              <span className="metric-label" style={{ fontSize: '0.75rem' }}>Coste Total Recetas</span>
              <div className="metric-value" style={{ color: '#c084fc', fontSize: '1.8rem' }}>{Number(generatedMenu.total_recipe_cost).toFixed(2)}€</div>
              {usePantry && (
                <span style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 600 }}>
                  ¡Ahorro Despensa: -{(generatedMenu.total_recipe_cost - generatedMenu.total_shopping_cost).toFixed(2)}€!
                </span>
              )}
            </div>
            <div className="metric-box" style={{ padding: '1rem' }}>
              <span className="metric-label" style={{ fontSize: '0.75rem' }}>Súper Recomendado</span>
              <div className="metric-value" style={{ color: '#60a5fa', textTransform: 'capitalize', fontSize: '1.6rem' }}>{generatedMenu.cheapest_supermarket}</div>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Cesta más barata</span>
            </div>
          </div>

          {generatedMenu.comparison && Object.keys(generatedMenu.comparison).length > 1 && (
            <div className="comparison-container" style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1rem', color: '#fff', margin: '0 0 1rem 0' }}>
                Comparación Cesta Semanal Total (Solo Faltantes)
              </h3>
              {Object.entries(generatedMenu.comparison).map(([sm, details]: any) => {
                const maxPrice = Math.max(...Object.values(generatedMenu.comparison).map((x: any) => x.total_shopping_cost));
                const pct = (details.total_shopping_cost / maxPrice) * 100;
                const isCheapest = sm === generatedMenu.cheapest_supermarket;

                return (
                  <div key={sm} className="comparison-bar-row">
                    <div className="comparison-bar-info">
                      <span className="sm-name">
                        <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: SUPERMARKET_COLOR_HEX[sm] || '#94a3b8' }}></span>
                        {sm}
                        {isCheapest && <span className="badge-cheapest">RECOMENDADO</span>}
                      </span>
                      <span className="sm-price">{Number(details.total_shopping_cost).toFixed(2)}€</span>
                    </div>
                    <div className="progress-track">
                      <div 
                        className="progress-bar-fill" 
                        style={{ 
                          width: `${pct}%`, 
                          backgroundColor: SUPERMARKET_COLOR_HEX[sm] || '#60a5fa',
                          opacity: isCheapest ? 1 : 0.6
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <h3 style={{ fontSize: '1.2rem', color: '#fff', margin: '0 0 1rem 0' }}>Menú de 7 Días</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Object.entries(generatedMenu.menu).map(([day, meals]: any) => (
              <div key={day} style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '0.75rem', padding: '1rem' }}>
                <h4 style={{ margin: '0 0 0.75rem 0', color: '#c084fc', fontSize: '1rem', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '0.25rem' }}>
                  {day}
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                    <div>
                      <div className="form-label" style={{ fontSize: '0.7rem', marginBottom: '0.15rem' }}>☕ Desayuno</div>
                      <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.85rem', lineHeight: '1.2', marginBottom: '0.25rem' }}>{meals.desayuno.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#34d399' }}>{meals.desayuno.estimated_cost}€</div>
                    </div>
                    <div style={{ marginTop: '0.5rem' }}>
                      {weeklySavingStatus[`${day}:desayuno`] === 'saved' ? (
                        <span style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <CheckCircle2 size={12} /> Guardado
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSaveWeeklyRecipe(meals.desayuno, day, 'desayuno')}
                          disabled={weeklySavingStatus[`${day}:desayuno`] === 'saving'}
                          style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '0.35rem',
                            color: '#a78bfa',
                            fontSize: '0.7rem',
                            padding: '0.2rem 0.5rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontWeight: 600,
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(167,139,250,0.1)';
                            e.currentTarget.style.borderColor = 'rgba(167,139,250,0.3)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                          }}
                        >
                          {weeklySavingStatus[`${day}:desayuno`] === 'saving' ? (
                            <>
                              <RotateCw size={10} className="spinner" />
                              ...
                            </>
                          ) : (
                            <>
                              <Save size={10} />
                              Guardar
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                    <div>
                      <div className="form-label" style={{ fontSize: '0.7rem', marginBottom: '0.15rem' }}>🍲 Comida</div>
                      <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.85rem', lineHeight: '1.2', marginBottom: '0.25rem' }}>{meals.comida.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#34d399' }}>{meals.comida.estimated_cost}€</div>
                    </div>
                    <div style={{ marginTop: '0.5rem' }}>
                      {weeklySavingStatus[`${day}:comida`] === 'saved' ? (
                        <span style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <CheckCircle2 size={12} /> Guardado
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSaveWeeklyRecipe(meals.comida, day, 'comida')}
                          disabled={weeklySavingStatus[`${day}:comida`] === 'saving'}
                          style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '0.35rem',
                            color: '#a78bfa',
                            fontSize: '0.7rem',
                            padding: '0.2rem 0.5rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontWeight: 600,
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(167,139,250,0.1)';
                            e.currentTarget.style.borderColor = 'rgba(167,139,250,0.3)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                          }}
                        >
                          {weeklySavingStatus[`${day}:comida`] === 'saving' ? (
                            <>
                              <RotateCw size={10} className="spinner" />
                              ...
                            </>
                          ) : (
                            <>
                              <Save size={10} />
                              Guardar
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                    <div>
                      <div className="form-label" style={{ fontSize: '0.7rem', marginBottom: '0.15rem' }}>🍳 Cena</div>
                      <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.85rem', lineHeight: '1.2', marginBottom: '0.25rem' }}>{meals.cena.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#34d399' }}>{meals.cena.estimated_cost}€</div>
                    </div>
                    <div style={{ marginTop: '0.5rem' }}>
                      {weeklySavingStatus[`${day}:cena`] === 'saved' ? (
                        <span style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <CheckCircle2 size={12} /> Guardado
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSaveWeeklyRecipe(meals.cena, day, 'cena')}
                          disabled={weeklySavingStatus[`${day}:cena`] === 'saving'}
                          style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '0.35rem',
                            color: '#a78bfa',
                            fontSize: '0.7rem',
                            padding: '0.2rem 0.5rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontWeight: 600,
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(167,139,250,0.1)';
                            e.currentTarget.style.borderColor = 'rgba(167,139,250,0.3)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                          }}
                        >
                          {weeklySavingStatus[`${day}:cena`] === 'saving' ? (
                            <>
                              <RotateCw size={10} className="spinner" />
                              ...
                            </>
                          ) : (
                            <>
                              <Save size={10} />
                              Guardar
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
