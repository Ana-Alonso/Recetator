import { useState } from "react";
import {
  Lock,
  Brain,
  ShoppingCart,
  ChefHat,
  Mail,
  ExternalLink,
  LogIn,
  Eye,
  EyeOff,
} from "lucide-react";

interface PortfolioLockScreenProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
}

const TECH_STACK = [
  { label: "React 19", color: "#61dafb" },
  { label: "TypeScript", color: "#3178c6" },
  { label: "Express", color: "#68d391" },
  { label: "Supabase", color: "#3ecf8e" },
  { label: "MLP Neural Net", color: "#f6ad55" },
  { label: "Vite 8", color: "#646cff" },
];

const FEATURES = [
  {
    icon: Brain,
    label: "IA propia entrenada",
    desc: "Red neuronal MLP implementada desde cero en TypeScript",
  },
  {
    icon: ShoppingCart,
    label: "Precios en tiempo real",
    desc: "Scraping multi-supermercado con fallback a caché Supabase",
  },
  {
    icon: ChefHat,
    label: "Ciclo de aprendizaje",
    desc: "La IA aprende de los votos de la familia y reentrena automáticamente",
  },
];

export const PortfolioLockScreen = ({ onLogin }: PortfolioLockScreenProps) => {
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    setError("");
    try {
      const ok = await onLogin(email.trim(), password);
      if (!ok) setError("Credenciales incorrectas o acceso no autorizado.");
    } catch {
      setError("Error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0d0f1a",
        color: "#e2e8f0",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          position: "relative",
          height: "55vh",
          minHeight: 320,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src="/hero.jpg"
          alt="Recetator AI"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.45,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(13,15,26,0.2) 0%, rgba(13,15,26,0.7) 70%, #0d0f1a 100%)",
          }}
        />

        <div
          style={{
            position: "relative",
            textAlign: "center",
            padding: "0 24px",
            maxWidth: 680,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(246,173,85,0.12)",
              border: "1px solid rgba(246,173,85,0.3)",
              borderRadius: 999,
              padding: "6px 16px",
              marginBottom: 20,
              fontSize: 12,
              color: "#f6ad55",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            <Lock size={11} />
            Acceso por invitación
          </div>

          <h1
            style={{
              fontSize: "clamp(36px, 6vw, 72px)",
              fontWeight: 800,
              margin: "0 0 16px",
              background: "linear-gradient(135deg, #fff 30%, #f6ad55 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              lineHeight: 1.1,
            }}
          >
            Recetator AI
          </h1>

          <p
            style={{
              fontSize: 17,
              color: "#94a3b8",
              maxWidth: 520,
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            Sistema de generación de recetas con inteligencia artificial propia,
            comparativa de precios entre supermercados y planificación semanal
            familiar.
          </p>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          maxWidth: 960,
          margin: "0 auto",
          width: "100%",
          padding: "0 24px 64px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
            marginBottom: 48,
          }}
        >
          {FEATURES.map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 16,
                padding: "24px 20px",
                backdropFilter: "blur(12px)",
                transition: "border-color 0.2s",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background:
                    "linear-gradient(135deg, rgba(246,173,85,0.2), rgba(242,104,65,0.15))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 14,
                }}
              >
                <Icon size={22} color="#f6ad55" />
              </div>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>
                {label}
              </div>
              <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>
                {desc}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            justifyContent: "center",
            marginBottom: 48,
          }}
        >
          {TECH_STACK.map(({ label, color }) => (
            <span
              key={label}
              style={{
                fontSize: 12,
                fontWeight: 600,
                padding: "5px 14px",
                borderRadius: 999,
                background: `${color}18`,
                border: `1px solid ${color}40`,
                color,
                letterSpacing: "0.03em",
              }}
            >
              {label}
            </span>
          ))}
        </div>

        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 20,
            padding: "32px 28px",
            maxWidth: 440,
            margin: "0 auto",
            backdropFilter: "blur(16px)",
          }}
        >
          {!showLogin ? (
            <div style={{ textAlign: "center" }}>
              <Lock size={32} color="#f6ad55" style={{ marginBottom: 16 }} />
              <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700 }}>
                Acceso restringido
              </h3>
              <p
                style={{
                  fontSize: 14,
                  color: "#64748b",
                  margin: "0 0 24px",
                  lineHeight: 1.6,
                }}
              >
                Este proyecto es privado y está interconectado con{" "}
                <strong style={{ color: "#94a3b8" }}>Calla y Come</strong> y la{" "}
                <strong style={{ color: "#94a3b8" }}>SuperMarket API</strong>.
                El acceso es solo para miembros invitados.
              </p>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                <button
                  onClick={() => setShowLogin(true)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    background: "linear-gradient(135deg, #f6ad55, #f26841)",
                    border: "none",
                    borderRadius: 12,
                    padding: "13px 20px",
                    color: "#fff",
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: "pointer",
                    width: "100%",
                  }}
                >
                  <LogIn size={16} />
                  Iniciar Sesión
                </button>
                <a
                  href="mailto:alonsogomezana03@gmail.com"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    padding: "13px 20px",
                    color: "#94a3b8",
                    fontSize: 14,
                    fontWeight: 500,
                    textDecoration: "none",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                >
                  <Mail size={15} />
                  Solicitar acceso demo
                </a>
                <a
                  href="https://github.com/Ana-Alonso"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    color: "#64748b",
                    fontSize: 13,
                    textDecoration: "none",
                    padding: "8px",
                  }}
                >
                  <ExternalLink size={13} />
                  Ver código en GitHub
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <button
                type="button"
                onClick={() => setShowLogin(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#64748b",
                  cursor: "pointer",
                  fontSize: 13,
                  marginBottom: 16,
                  padding: 0,
                }}
              >
                ← Volver
              </button>
              <h3 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 700 }}>
                Iniciar Sesión
              </h3>

              <div style={{ marginBottom: 14 }}>
                <label
                  style={{
                    fontSize: 13,
                    color: "#94a3b8",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 10,
                    padding: "11px 14px",
                    color: "#e2e8f0",
                    fontSize: 14,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ marginBottom: error ? 14 : 20 }}>
                <label
                  style={{
                    fontSize: 13,
                    color: "#94a3b8",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Contraseña
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    style={{
                      width: "100%",
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: 10,
                      padding: "11px 44px 11px 14px",
                      color: "#e2e8f0",
                      fontSize: 14,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#64748b",
                      display: "flex",
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  style={{
                    fontSize: 13,
                    color: "#fc8181",
                    marginBottom: 14,
                    padding: "8px 12px",
                    background: "rgba(252,129,129,0.08)",
                    borderRadius: 8,
                    border: "1px solid rgba(252,129,129,0.2)",
                  }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  background: loading
                    ? "rgba(246,173,85,0.4)"
                    : "linear-gradient(135deg, #f6ad55, #f26841)",
                  border: "none",
                  borderRadius: 12,
                  padding: "13px 20px",
                  color: "#fff",
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                {loading ? (
                  "Accediendo..."
                ) : (
                  <>
                    <LogIn size={16} /> Entrar
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
