import {
  Sparkles,
  AlertTriangle,
  RotateCw,
  CheckCircle2,
  Save,
} from "lucide-react";

interface RecipeGeneratorTabProps {
  mealType: "desayuno" | "comida" | "cena";
  setMealType: (val: "desayuno" | "comida" | "cena") => void;
  dietType: string;
  setDietType: (val: string) => void;
  maxBudget: number;
  setMaxBudget: (val: number) => void;
  supermarketId: string;
  setSupermarketId: (val: string) => void;
  health: "saludable" | "no saludable";
  setHealth: (val: "saludable" | "no saludable") => void;
  difficulty: "facil" | "intermedia" | "dificil";
  setDifficulty: (val: "facil" | "intermedia" | "dificil") => void;
  usePantry: boolean;
  setUsePantry: (val: boolean) => void;
  pantryItems: any[];
  selectedAllergens: string[];
  toggleAllergen: (allergen: string) => void;
  errorMessage: string;
  isGenerating: boolean;
  handleGenerate: () => void;
  generatedRecipe: any;
  selectedSmTab: string;
  setSelectedSmTab: (val: string) => void;
  savingStatus: "idle" | "saving" | "saved" | "error";
  handleSaveRecipe: () => void;
  ALLERGEN_OPTIONS: string[];
  SUPERMARKET_COLOR_HEX: Record<string, string>;
}

export default function RecipeGeneratorTab({
  mealType,
  setMealType,
  dietType,
  setDietType,
  maxBudget,
  setMaxBudget,
  supermarketId,
  setSupermarketId,
  health,
  setHealth,
  difficulty,
  setDifficulty,
  usePantry,
  setUsePantry,
  pantryItems,
  selectedAllergens,
  toggleAllergen,
  errorMessage,
  isGenerating,
  handleGenerate,
  generatedRecipe,
  selectedSmTab,
  setSelectedSmTab,
  savingStatus,
  handleSaveRecipe,
  ALLERGEN_OPTIONS,
  SUPERMARKET_COLOR_HEX,
}: RecipeGeneratorTabProps) {
  return (
    <>
      <div className="glass-card">
        <h2 className="card-title">
          <Sparkles size={24} style={{ color: "#60a5fa" }} />
          Generador de Recetas
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
          }}
        >
          <div className="form-group">
            <label className="form-label">Tipo de Comida</label>
            <select
              value={mealType}
              onChange={(e: any) => setMealType(e.target.value)}
              className="form-select"
            >
              <option value="desayuno">Desayuno</option>
              <option value="comida">Comida</option>
              <option value="cena">Cena</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Tipo de Dieta</label>
            <select
              value={dietType}
              onChange={(e) => setDietType(e.target.value)}
              className="form-select"
            >
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
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
          }}
        >
          <div className="form-group">
            <label className="form-label">Presupuesto Máximo (€)</label>
            <input
              type="number"
              min={1}
              max={50}
              step={0.5}
              value={maxBudget}
              onChange={(e) => setMaxBudget(Number(e.target.value))}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Supermercado</label>
            <select
              value={supermarketId}
              onChange={(e) => setSupermarketId(e.target.value)}
              className="form-select"
            >
              <option value="todos">Todos (Comparativa)</option>
              <option value="mercadona">Mercadona</option>
              <option value="eroski">Eroski</option>
              <option value="dia">Dia</option>
              <option value="aldi">Aldi</option>
              <option value="carrefour">Carrefour</option>
            </select>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
          }}
        >
          <div className="form-group">
            <label className="form-label">Saludable</label>
            <select
              value={health}
              onChange={(e: any) => setHealth(e.target.value)}
              className="form-select"
            >
              <option value="saludable">Saludable</option>
              <option value="no saludable">Menos saludable</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Dificultad</label>
            <select
              value={difficulty}
              onChange={(e: any) => setDifficulty(e.target.value)}
              className="form-select"
            >
              <option value="facil">Fácil</option>
              <option value="intermedia">Intermedia</option>
              <option value="dificil">Difícil</option>
            </select>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
            alignItems: "center",
          }}
        >
          <div className="form-group" style={{ margin: 0 }}>
            <label
              className="form-label"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                cursor: "pointer",
                margin: 0,
              }}
            >
              <input
                type="checkbox"
                checked={usePantry}
                onChange={(e) => setUsePantry(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: "#a78bfa" }}
              />
              Descontar existencias de Despensa ({pantryItems.length} art.)
            </label>
          </div>
        </div>

        <div className="form-group" style={{ marginTop: "1.5rem" }}>
          <label className="form-label">Alérgenos a Excluir</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {ALLERGEN_OPTIONS.map((allergen) => {
              const active = selectedAllergens.includes(allergen);
              return (
                <button
                  key={allergen}
                  onClick={() => toggleAllergen(allergen)}
                  className={`allergen-tag ${active ? "active" : ""}`}
                  type="button"
                >
                  {allergen}
                </button>
              );
            })}
          </div>
        </div>

        {errorMessage && (
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.2)",
              padding: "0.85rem",
              borderRadius: "0.75rem",
              color: "#f87171",
              fontSize: "0.9rem",
              marginTop: "1rem",
              alignItems: "center",
            }}
          >
            <AlertTriangle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="btn-primary"
          style={{ marginTop: "1.5rem" }}
        >
          {isGenerating ? (
            <>
              <RotateCw size={18} className="spinner" />
              Generando receta con IA...
            </>
          ) : (
            <>
              <Sparkles size={18} />
              Generar Receta con IA
            </>
          )}
        </button>
      </div>

      {generatedRecipe && (
        <div
          className="glass-card"
          style={{
            border: "1px solid rgba(59,130,246,0.3)",
            boxShadow: "0 0 20px rgba(59,130,246,0.15)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "1.5rem",
            }}
          >
            <div>
              <span
                className="status-badge"
                style={{
                  backgroundColor: "rgba(59,130,246,0.1)",
                  borderColor: "rgba(59,130,246,0.2)",
                  color: "#60a5fa",
                  marginBottom: "0.5rem",
                }}
              >
                {generatedRecipe.meal_type}
              </span>
              <span
                className="status-badge"
                style={{
                  marginLeft: "0.5rem",
                  backgroundColor: "rgba(255,255,255,0.05)",
                  color: "#94a3b8",
                }}
              >
                {generatedRecipe.diet_type}
              </span>
              <h2
                style={{
                  fontSize: "1.8rem",
                  fontWeight: 800,
                  margin: "0.5rem 0 0 0",
                  color: "#fff",
                }}
              >
                {generatedRecipe.name}
              </h2>
            </div>
            {generatedRecipe.ai_score !== undefined && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  background:
                    "linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(59,130,246,0.2) 100%)",
                  border: "1px solid rgba(139,92,246,0.3)",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "0.75rem",
                  textAlign: "center",
                }}
              >
                <span
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 800,
                    color: "#c084fc",
                  }}
                >
                  {Math.round(generatedRecipe.ai_score * 100)}%
                </span>
                <span
                  style={{
                    fontSize: "0.65rem",
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    fontWeight: 600,
                  }}
                >
                  Afinidad
                </span>
              </div>
            )}
          </div>

          <div
            style={{
              display: "flex",
              gap: "2rem",
              marginBottom: "1.5rem",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              paddingBottom: "1rem",
            }}
          >
            <div>
              <span className="form-label" style={{ marginBottom: "0.25rem" }}>
                {generatedRecipe.recipe_cost &&
                generatedRecipe.recipe_cost !== generatedRecipe.estimated_cost
                  ? "Coste de Compra"
                  : "Coste Estimado"}
              </span>
              <span
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 800,
                  color: "#34d399",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                }}
              >
                {generatedRecipe.estimated_cost}€
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 400,
                    color: "#94a3b8",
                    textTransform: "capitalize",
                  }}
                >
                  (en {generatedRecipe.supermarket_id})
                </span>
              </span>
              {generatedRecipe.recipe_cost &&
                generatedRecipe.recipe_cost !==
                  generatedRecipe.estimated_cost && (
                  <div
                    style={{
                      fontSize: "0.7rem",
                      color: "#94a3b8",
                      marginTop: "0.15rem",
                    }}
                  >
                    Total receta:{" "}
                    <span style={{ textDecoration: "line-through" }}>
                      {generatedRecipe.recipe_cost}€
                    </span>
                    <span
                      style={{
                        color: "#34d399",
                        marginLeft: "0.25rem",
                        fontWeight: 600,
                      }}
                    >
                      (Despensa aplicada)
                    </span>
                  </div>
                )}
            </div>
            <div>
              <span className="form-label" style={{ marginBottom: "0.25rem" }}>
                Dificultad
              </span>
              <span
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  color: "#fff",
                  textTransform: "capitalize",
                }}
              >
                {generatedRecipe.difficulty}
              </span>
            </div>
            <div>
              <span className="form-label" style={{ marginBottom: "0.25rem" }}>
                Alérgenos
              </span>
              <span
                style={{
                  fontSize: "0.9rem",
                  fontWeight: 500,
                  color:
                    generatedRecipe.allergens.length > 0
                      ? "#f87171"
                      : "#34d399",
                }}
              >
                {generatedRecipe.allergens.length > 0
                  ? generatedRecipe.allergens.join(", ")
                  : "Ninguno"}
              </span>
            </div>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <h3
              style={{
                fontSize: "1.1rem",
                color: "#fff",
                margin: "0 0 0.75rem 0",
              }}
            >
              Ingredientes
            </h3>
            <ul
              style={{
                paddingLeft: "1.25rem",
                margin: 0,
                fontSize: "0.95rem",
                color: "#cbd5e1",
                lineHeight: "1.8",
              }}
            >
              {generatedRecipe.ingredients.map((ing: any, idx: number) => (
                <li key={idx}>
                  <strong>
                    {ing.quantity} {ing.unit}
                  </strong>{" "}
                  de {ing.name}
                </li>
              ))}
            </ul>
          </div>

          <div
            style={{
              marginBottom: "1.5rem",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              paddingBottom: "1.5rem",
            }}
          >
            <h3
              style={{
                fontSize: "1.1rem",
                color: "#fff",
                margin: "0 0 0.75rem 0",
              }}
            >
              Instrucciones de Preparación
            </h3>
            <ol
              style={{
                paddingLeft: "1.25rem",
                margin: 0,
                fontSize: "0.95rem",
                color: "#cbd5e1",
                lineHeight: "1.8",
              }}
            >
              {generatedRecipe.instructions.map((inst: string, idx: number) => (
                <li key={idx} style={{ marginBottom: "0.5rem" }}>
                  {inst}
                </li>
              ))}
            </ol>
          </div>

          {generatedRecipe.comparison &&
            Object.keys(generatedRecipe.comparison).length > 1 && (
              <div className="comparison-container">
                <h3
                  style={{
                    fontSize: "1.1rem",
                    color: "#fff",
                    margin: "0 0 1rem 0",
                  }}
                >
                  Comparativa de Precios por Supermercado
                </h3>

                {Object.entries(generatedRecipe.comparison).map(
                  ([sm, details]: any) => {
                    const maxPrice = Math.max(
                      ...Object.values(generatedRecipe.comparison).map(
                        (x: any) => x.total_cost,
                      ),
                    );
                    const pct = (details.total_cost / maxPrice) * 100;
                    const isCheapest = sm === generatedRecipe.supermarket_id;

                    return (
                      <div key={sm} className="comparison-bar-row">
                        <div className="comparison-bar-info">
                          <span className="sm-name">
                            <span
                              style={{
                                width: 10,
                                height: 10,
                                borderRadius: "50%",
                                backgroundColor:
                                  SUPERMARKET_COLOR_HEX[sm] || "#94a3b8",
                              }}
                            ></span>
                            {sm}
                            {isCheapest && (
                              <span className="badge-cheapest">MÁS BARATO</span>
                            )}
                          </span>
                          <span className="sm-price">
                            {details.total_cost}€
                          </span>
                        </div>
                        <div className="progress-track">
                          <div
                            className="progress-bar-fill"
                            style={{
                              width: `${pct}%`,
                              backgroundColor:
                                SUPERMARKET_COLOR_HEX[sm] || "#60a5fa",
                              opacity: isCheapest ? 1 : 0.6,
                            }}
                          ></div>
                        </div>
                      </div>
                    );
                  },
                )}

                <div className="tab-pills">
                  {Object.keys(generatedRecipe.comparison).map((sm) => (
                    <button
                      key={sm}
                      onClick={() => setSelectedSmTab(sm)}
                      className={`tab-pill ${selectedSmTab === sm ? "active" : ""}`}
                    >
                      {sm}
                    </button>
                  ))}
                </div>

                {selectedSmTab && generatedRecipe.comparison[selectedSmTab] && (
                  <div className="products-mapping-list">
                    <h4
                      style={{
                        margin: "0 0 0.75rem 0",
                        fontSize: "0.9rem",
                        color: "#fff",
                        textTransform: "capitalize",
                      }}
                    >
                      Cesta en {selectedSmTab}
                    </h4>
                    {generatedRecipe.comparison[selectedSmTab].products.map(
                      (prod: any, idx: number) => (
                        <div key={idx} className="mapping-item">
                          <div>
                            <div className="mapping-name">
                              {prod.ingredient_name} ({prod.quantity}{" "}
                              {prod.unit})
                              {prod.used_from_pantry > 0 && (
                                <span
                                  style={{
                                    color: "#34d399",
                                    marginLeft: "0.5rem",
                                    fontWeight: 600,
                                  }}
                                >
                                  (Despensa: -{prod.used_from_pantry}{" "}
                                  {prod.unit})
                                </span>
                              )}
                            </div>
                            <div className="mapping-product">
                              {prod.product_name}
                            </div>
                          </div>
                          <div className="mapping-price">
                            {prod.computed_cost}€
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>
            )}

          <div>
            {savingStatus === "saved" ? (
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  background: "rgba(16,185,129,0.1)",
                  border: "1px solid rgba(16,185,129,0.2)",
                  padding: "0.85rem",
                  borderRadius: "0.75rem",
                  color: "#34d399",
                  fontSize: "0.95rem",
                  marginTop: "1.5rem",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 600,
                }}
              >
                <CheckCircle2 size={18} />
                ¡Receta guardada en Calla y Come!
              </div>
            ) : (
              <button
                onClick={handleSaveRecipe}
                disabled={savingStatus === "saving"}
                className="btn-success"
              >
                {savingStatus === "saving" ? (
                  <>
                    <RotateCw size={18} className="spinner" />
                    Guardando receta...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Guardar Receta en Calla y Come
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
