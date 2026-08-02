import { Info } from "lucide-react";

export default function InstructionCard() {
  return (
    <div className="glass-card">
      <h2
        className="card-title"
        style={{ fontSize: "1.25rem", marginBottom: "1rem" }}
      >
        <Info size={20} style={{ color: "#3b82f6" }} />
        ¿Cómo funciona la IA?
      </h2>
      <p
        style={{
          fontSize: "0.85rem",
          color: "#94a3b8",
          margin: "0 0 0.75rem 0",
          lineHeight: "1.6",
        }}
      >
        <strong>1. Generación de Recetas:</strong> Mediante un motor de
        co-ocurrencia culinaria, creamos combinaciones de ingredientes lógicas
        basadas en alérgenos seleccionados y tipos de comida.
      </p>
      <p
        style={{
          fontSize: "0.85rem",
          color: "#94a3b8",
          margin: "0 0 0.75rem 0",
          lineHeight: "1.6",
        }}
      >
        <strong>2. Mapeo Preciso de Precios:</strong> Se consultan los
        supermercados buscando el ingrediente exacto (filtrando productos
        parasitarios como "patatas con sabor a cebolla" si buscas "cebolla"),
        comparando costes totales en tiempo real.
      </p>
      <p
        style={{
          fontSize: "0.85rem",
          color: "#94a3b8",
          margin: "0",
          lineHeight: "1.6",
        }}
      >
        <strong>3. Clasificación de Gustos:</strong> Si la red neuronal está
        entrenada con las recetas y votos de la familia en "Calla y Come",
        puntuará cada candidata y te devolverá la combinación favorita de tu
        familia.
      </p>
    </div>
  );
}
