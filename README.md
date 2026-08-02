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
│   │   ├── server.ts               # Servidor Express con Rate Limiting, Helmet y CORS restringido
│   │   └── ai/
│   │       ├── neural_network.ts   # Red neuronal MLP implementada desde cero
│   │       ├── recipe_generator.ts # Motor de generación y planificación semanal
│   │       └── model_state.json    # Pesos del modelo entrenado (persistido en disco)
│   ├── components/
│   │   ├── AITrainerCard.tsx       # Panel de entrenamiento y curva de pérdida
│   │   ├── InstructionCard.tsx     # Descripción del funcionamiento de la IA
│   │   ├── RecipeGeneratorTab.tsx  # Pestaña de generación individual
│   │   ├── WeeklyPlannerTab.tsx    # Pestaña de planificador semanal
│   │   ├── PriceTrendsTab.tsx      # Pestaña de alertas de precios
│   │   └── legal/                  # Componente CookieConsent (RGPD)
│   ├── pages/                      # Páginas legales RGPD (/privacy, /terms, /cookies)
│   ├── services/
│   │   ├── supabaseClient.ts       # Cliente de Supabase para Calla y Come
│   │   └── apiService.ts           # Llamadas HTTP tipadas al backend de la IA
│   ├── App.tsx                     # Orquestador del estado global con rutas legales
│   └── index.css                   # Sistema de diseño (Glassmorphism + tema oscuro)
├── public/
│   ├── robots.txt                  # Archivo de directivas para buscadores
│   └── sitemap.xml                 # Mapa del sitio XML
├── .env                            # Variables de entorno (Supabase URLs, claves)
├── package.json
├── vite.config.ts
└── tsconfig.*.json
```

---

## Stack Tecnológico & Seguridad

| Capa | Tecnología / Medida |
|---|---|
| Frontend | React 19 + TypeScript + Vite 8 |
| Backend | Express + TypeScript + Helmet.js + CORS restringido |
| Rate Limiting | `express-rate-limit`: 120 req/15min global, 10 req/15min generación menú IA |
| Cumplimiento RGPD | Banner de consentimiento de cookies local, `/privacy`, `/terms`, `/cookies` |
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
FRONTEND_URL=https://recetator.onrender.com

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

## API REST — Endpoints Protegidos con Rate Limiting

Todos los endpoints del servidor están disponibles en `http://localhost:8002` (o URL de Render en producción).

### `GET /api/ai/status`
Devuelve el estado actual del modelo neuronal: si está entrenado, número de épocas, pérdida final y número de recetas usadas.

---

### `POST /api/ai/train`
Entrena el modelo neuronal con las recetas y votos existentes en la base de datos de Calla y Come.

---

### `POST /api/ai/generate-recipe`
Genera una receta nueva que no existe aún en el recetario de la familia, con comparativa de precios entre supermercados.

---

### `POST /api/ai/generate-menu` *(Rate Limit: 10 req / 15 min)*
Genera un menú semanal completo (21 comidas: desayuno, comida y cena para 7 días) optimizando el presupuesto y garantizando que ningún plato se repita ni exista ya en el recetario.

---

### `POST /api/supermarkets/compare`
Compara el coste de una lista de ingredientes en todos los supermercados disponibles.

---

### `POST /api/ai/detect-allergens`
Detecta automáticamente los alérgenos presentes en una lista libre de ingredientes mediante clasificación semántica.

---

### `GET /api/supermarkets/trends`
Devuelve las fluctuaciones de precio registradas en la base de datos de productos y las alertas de oferta de la semana.

---

## Cómo Funciona la IA

### 1. Generación de Recetas
Recetator utiliza un catálogo de más de **16 plantillas culinarias** con ranuras de ingredientes intercambiables. Cada ranura tiene múltiples opciones compatibles por dieta (Omnívora, Vegetariana, Vegana, Pescetariana, Keto, Paleo, Sin Gluten, Sin Lactosa y Mediterránea) y alérgenos.

Antes de proponer una receta al usuario, el generador **consulta la base de datos de [Calla y Come](https://github.com/Ana-Alonso/CallayCome)** y descarta automáticamente cualquier nombre que ya exista. Si hay coincidencia, reintenta hasta 8 veces con otras combinaciones de ingredientes hasta generar un plato nuevo.

### 2. Mapeo de Precios en Tiempo Real
Para cada ingrediente de la receta generada, se busca el producto más ajustado en la base de datos del supermercado (descartando coincidencias falsas mediante scoring de relevancia). Si el usuario tiene el ingrediente en su despensa, se descuenta la cantidad disponible y se calcula el coste neto a comprar.

### 3. Red Neuronal de Preferencias
Si el modelo está entrenado, se generan hasta **5 recetas candidatas** en paralelo y se puntúan con la red neuronal MLP, que ha aprendido las preferencias de la familia a partir de los votos (`recipe_weights`) almacenados en la base de datos. Se devuelve la receta con mayor afinidad junto a su porcentaje de puntuación.

### 4. Planificador Semanal
Para la planificación de 7 días, se generan **10 candidatos en paralelo** para cada tipo de comida (desayuno, comida y cena). A partir de estos candidatos únicos y sin repetición, se construye la rejilla semanal de 21 platos.

---

## Privacidad y RGPD

- **Cookies**: Consentimiento explicito via `CookieConsent` banner (almacenamiento local, sin rastreo de terceros).
- **Rutas Legales**: `/privacy`, `/terms`, `/cookies` accesibles directamente.
- **Seguridad HTTP**: Middleware `helmet` y restricción de orígenes CORS.
