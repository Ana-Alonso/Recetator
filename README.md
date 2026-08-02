![CI](https://github.com/Ana-Alonso/Recetator/actions/workflows/ci.yml/badge.svg)

# Recetator AI

Sistema de generación de recetas personalizadas con inteligencia artificial propia (red neuronal MLP entrenada en la base de datos de la familia), comparativa de precios en tiempo real entre múltiples supermercados y planificación de menú semanal optimizada.

Recetator actúa como el cerebro de **Calla y Come**: aprende los gustos de la familia a partir de sus votos y recetas guardadas, y genera siempre platos nuevos que aún no existen en el recetario personal.

---

## Arquitectura General

```
Recetator/
├── src/
│   ├── backend/
│   │   ├── server.ts               # Servidor Express con todos los endpoints de la API
│   │   └── ai/
│   │       ├── neural_network.ts   # Red neuronal MLP implementada desde cero
│   │       ├── recipe_generator.ts # Motor de generación y planificación semanal
│   │       └── model_state.json    # Pesos del modelo entrenado (persistido en disco)
│   ├── components/
│   │   ├── AITrainerCard.tsx       # Panel de entrenamiento y curva de pérdida
│   │   ├── InstructionCard.tsx     # Descripción del funcionamiento de la IA
│   │   ├── RecipeGeneratorTab.tsx  # Pestaña de generación individual
│   │   ├── WeeklyPlannerTab.tsx    # Pestaña de planificador semanal
│   │   └── PriceTrendsTab.tsx      # Pestaña de alertas de precios
│   ├── services/
│   │   ├── supabaseClient.ts       # Cliente de Supabase para Calla y Come
│   │   └── apiService.ts           # Llamadas HTTP tipadas al backend de la IA
│   ├── App.tsx                     # Orquestador del estado global
│   └── index.css                   # Sistema de diseño (Glassmorphism + tema oscuro)
├── .env                            # Variables de entorno (Supabase URLs, claves)
├── package.json
├── vite.config.ts
└── tsconfig.*.json
```

---

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 19 + TypeScript + Vite |
| Backend | Express + TypeScript + tsx/nodemon |
| Base de Datos (Recetario) | Supabase (Calla y Come) |
| Base de Datos (Supermercados) | Supabase (Catálogo de productos) |
| IA / Red Neuronal | MLP implementado desde cero en TypeScript |
| Iconos | Lucide React |
| Estilos | Vanilla CSS (Glassmorphism, dark mode) |

---

## Requisitos Previos

- **Node.js** `>= 20`
- **npm** `>= 10`
- Acceso a las dos instancias de **Supabase** (recetario y supermercados)

---

## Configuración

Crea o edita el archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
PORT=8002

SUPABASE_KITCHEN_URL=https://<tu-proyecto>.supabase.co
SUPABASE_KITCHEN_ANON_KEY=<anon-key-del-recetario>

SUPABASE_SUPERMARKET_URL=https://<tu-proyecto>.supabase.co
SUPABASE_SUPERMARKET_ANON_KEY=<anon-key-del-supermercado>

VITE_SUPABASE_KITCHEN_URL=https://<tu-proyecto>.supabase.co
VITE_SUPABASE_KITCHEN_ANON_KEY=<anon-key-del-recetario>
```

---

## Instalación y Ejecución

```bash
# Instalar dependencias
npm install

# Iniciar frontend y backend en paralelo (modo desarrollo)
npm run dev
```

| Servidor | URL |
|---|---|
| Frontend (Recetator) | `http://localhost:5174` |
| Backend IA | `http://localhost:8002` |

### Otros comandos útiles

```bash
# Solo el backend
npm run dev:backend

# Solo el frontend
npm run dev:frontend

# Build de producción (TypeScript + Vite)
npm run build

# Iniciar el backend compilado
npm start
```

---

## API REST — Endpoints

Todos los endpoints del servidor están disponibles en `http://localhost:8002`.

### `GET /api/ai/status`
Devuelve el estado actual del modelo neuronal: si está entrenado, número de épocas, pérdida final y número de recetas usadas.

---

### `POST /api/ai/train`
Entrena el modelo neuronal con las recetas y votos existentes en la base de datos de Calla y Come.

**Body:**
```json
{
  "epochs": 1000,
  "learningRate": 0.1
}
```

---

### `POST /api/ai/generate-recipe`
Genera una receta nueva que no existe aún en el recetario de la familia, con comparativa de precios entre supermercados.

**Body:**
```json
{
  "meal_type": "comida",
  "diet_type": "omnivoro",
  "allergens": ["lactosa"],
  "max_budget": 5,
  "supermarket_id": "todos",
  "health": "saludable",
  "difficulty": "facil",
  "pantry_items": [
    { "nombre": "Arroz", "cantidad": 200, "unidad": "g" }
  ]
}
```

---

### `POST /api/ai/generate-menu`
Genera un menú semanal completo (21 comidas: desayuno, comida y cena para 7 días) optimizando el presupuesto y garantizando que ningún plato se repita ni exista ya en el recetario.

**Body:**
```json
{
  "weekly_budget": 50,
  "supermarket_id": "todos",
  "diet_type": "omnivoro",
  "allergens": [],
  "health": "saludable",
  "difficulty": "facil",
  "use_pantry": true,
  "family_id": "uuid-de-la-familia"
}
```

---

### `POST /api/supermarkets/compare`
Compara el coste de una lista de ingredientes en todos los supermercados disponibles.

---

### `POST /api/ai/detect-allergens`
Detecta automáticamente los alérgenos presentes en una lista libre de ingredientes mediante clasificación semántica por palabras clave.

**Body:**
```json
{
  "ingredients": ["harina de trigo", "leche entera", "huevo"]
}
```

---

### `GET /api/supermarkets/trends`
Devuelve las fluctuaciones de precio registradas en la base de datos de productos y las alertas de oferta de la semana.

---

## Cómo Funciona la IA

### 1. Generación de Recetas
Recetator utiliza un catálogo de más de **16 plantillas culinarias** con ranuras de ingredientes intercambiables. Cada ranura tiene múltiples opciones compatibles por dieta (Omnívora, Vegetariana, Vegana, Pescetariana, Keto, Paleo, Sin Gluten, Sin Lactosa y Mediterránea) y alérgenos.

Antes de proponer una receta al usuario, el generador **consulta la base de datos de Calla y Come (https://github.com/Ana-Alonso/CallayCome)** y descarta automáticamente cualquier nombre que ya exista. Si hay coincidencia, reintenta hasta 8 veces con otras combinaciones de ingredientes hasta generar un plato nuevo.

### 2. Mapeo de Precios en Tiempo Real
Para cada ingrediente de la receta generada, se busca el producto más ajustado en la base de datos del supermercado (descartando coincidencias falsas mediante scoring de relevancia). Si el usuario tiene el ingrediente en su despensa, se descuenta la cantidad disponible y se calcula el coste neto a comprar.

### 3. Red Neuronal de Preferencias
Si el modelo está entrenado, se generan hasta **5 recetas candidatas** en paralelo y se puntúan con la red neuronal MLP, que ha aprendido las preferencias de la familia a partir de los votos (`recipe_weights`) almacenados en la base de datos. Se devuelve la receta con mayor afinidad junto a su porcentaje de puntuación.

### 4. Planificador Semanal
Para la planificación de 7 días, se generan **10 candidatos en paralelo** para cada tipo de comida (desayuno, comida y cena). A partir de estos candidatos únicos y sin repetición, se construye la rejilla semanal de 21 platos.

---

## Esquema de Base de Datos (Calla y Come)

Las recetas generadas por IA se guardan de forma relacional en las siguientes tablas:

| Tabla | Descripción |
|---|---|
| `recipes` | Metadatos de la receta: nombre, tipo de comida, dieta, dificultad, salud, precio, instrucciones, alérgenos |
| `ingredients` | Catálogo maestro de ingredientes por nombre |
| `recipe_ingredients` | Tabla de relación: une recetas con sus ingredientes (cantidad y unidad) |
| `pantry` | Despensa de la familia con cantidades disponibles |
| `recipe_weights` | Votos de la familia sobre recetas (usado para entrenar la red neuronal) |

---

## Estándares de Código

Este proyecto sigue la **regla estricta de cero comentarios**: el código se explica únicamente a través de nombres descriptivos y autoexplicativos. Cualquier fragmento que requiera un comentario para entenderse es una señal de refactorización necesaria.

- **Funciones y variables:** `camelCase` descriptivo
- **Componentes y clases:** `PascalCase`
- **Sin comentarios inline ni docstrings**
- **Tipado completo** en todas las firmas de funciones y retornos
- **Controladores delgados:** las rutas Express solo parsean, delegan y responden
- **Servicios dedicados:** toda la lógica de red y base de datos en `src/services/`
