import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import rateLimit from 'express-rate-limit';
import { NeuralNetwork } from './ai/neural_network.js';
import { generateRecipe, generateWeeklyMenu } from './ai/recipe_generator.js';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const app = express();

// ── Seguridad HTTP (helmet) ────────────────────────────────────────────────────
app.use(helmet());

// ── Configuración de CORS ──────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin.includes('localhost') || origin.includes('onrender.com')) {
      callback(null, true);
    } else {
      callback(null, true); // Permite acceso para aplicaciones web y móviles desplegadas
    }
  },
  credentials: true
}));

app.use(express.json());

const skipInternalRequests = (req: Request) => {
    const expectedKey = process.env.INTERNAL_API_KEY;
    const providedKey = req.headers['x-internal-key'];
    return typeof expectedKey === 'string' && typeof providedKey === 'string' && providedKey === expectedKey;
};

// ── Rate Limiting (RGPD / protección de recursos) ───────────────────────────
// Límite global: 120 peticiones por IP cada 15 minutos
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 120,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skip: skipInternalRequests,
    message: {
        status: 'error',
        error: 'Demasiadas peticiones. Por favor, inténtalo de nuevo en 15 minutos.'
    }
});

// Límite estricto para generación de menú IA (operación costosa): 10/15 min por IP
const aiMenuLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skip: skipInternalRequests,
    message: {
        status: 'error',
        error: 'Has alcanzado el límite de generaciones de menú. Por favor, espera 15 minutos.'
    }
});

// Límite diario por IP: 50 llamadas a IA por día (24h)
const dailyAiLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000,
    max: 50,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skip: skipInternalRequests,
    message: {
        status: 'error',
        error: 'Has alcanzado el límite diario de peticiones a la API (50 llamadas/día por cuenta). Inténtalo de nuevo mañana.'
    }
});

app.use(globalLimiter);
app.use('/api', dailyAiLimiter);

// ── Servir archivos estáticos del frontend (dist) y ruta raíz ──────────────
const distPath = path.resolve('./dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

app.get('/', (_req: Request, res: Response) => {
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).json({
      status: 'online',
      service: 'Recetator AI Backend Service',
      version: '1.0.0',
      model_trained: isModelTrained,
      endpoints: {
        status: '/api/v1/ai/status',
        detect_allergens: '/api/ai/detect-allergens',
        generate_recipe: '/api/ai/generate-recipe',
        generate_menu: '/api/ai/generate-menu',
        auto_retrain: '/api/ai/auto-retrain'
      }
    });
  }
});


const kitchenUrl = process.env.SUPABASE_KITCHEN_URL || '';
const kitchenKey = process.env.SUPABASE_KITCHEN_ANON_KEY || '';
const supermarketUrl = process.env.SUPABASE_SUPERMARKET_URL || '';
const supermarketKey = process.env.SUPABASE_SUPERMARKET_ANON_KEY || '';

const supabaseKitchen = createClient(kitchenUrl, kitchenKey);
const supabaseSupermarket = createClient(supermarketUrl, supermarketKey);

const MODEL_PATH = path.resolve('./src/backend/ai/model_state.json');


let isModelTrained = false;
let trainingMetrics = {
  epochs: 0,
  finalLoss: 0,
  trainedAt: '',
  recipeCount: 0
};


const FEATURE_KEYS = [
  
  'meal_type:desayuno', 'meal_type:comida', 'meal_type:cena',
  
  'difficulty:facil', 'difficulty:intermedia', 'difficulty:dificil',
  
  'health:saludable', 'health:no saludable',
  
  'price:economica', 'price:cara',
  
  'diet_type:omnivoro', 'diet_type:vegetariano', 'diet_type:vegano', 'diet_type:pescetariano', 'diet_type:keto', 'diet_type:paleo', 'diet_type:sin_gluten', 'diet_type:sin_lactosa', 'diet_type:mediterranea',
  
  'allergen:gluten', 'allergen:lactosa', 'allergen:huevo', 'allergen:pescado', 'allergen:frutos secos', 'allergen:marisco', 'allergen:soja',
  
  'keyword:pollo', 'keyword:ternera', 'keyword:cerdo', 'keyword:carne', 'keyword:pescado', 'keyword:atun', 'keyword:salmon', 
  'keyword:queso', 'keyword:leche', 'keyword:huevo', 'keyword:arroz', 'keyword:pasta', 'keyword:harina', 
  'keyword:cebolla', 'keyword:tomate', 'keyword:patata', 'keyword:verdura', 'keyword:chocolate', 'keyword:azucar'
];

let neuralNet = new NeuralNetwork(FEATURE_KEYS);


try {
  if (fs.existsSync(MODEL_PATH)) {
    const rawData = fs.readFileSync(MODEL_PATH, 'utf-8');
    const state = JSON.parse(rawData);
    neuralNet.import(state.weights);
    isModelTrained = true;
    trainingMetrics = state.metrics;
    console.log('Successfully loaded trained AI model from disk.');
  }
} catch (e) {
  console.warn('Could not load trained model, will require training:', e);
}


app.get('/api/ai/status', (_req: Request, res: Response) => {
  res.json({
    status: 'success',
    data: {
      trained: isModelTrained,
      metrics: trainingMetrics,
      config: {
        featureCount: FEATURE_KEYS.length,
        port: process.env.PORT || 8002
      }
    }
  });
});


app.post('/api/ai/train', async (req: Request, res: Response) => {
  const epochs = Number(req.body.epochs) || 1000;
  const learningRate = Number(req.body.learningRate) || 0.1;

  try {
    
    
    const { data: recipes, error: recError } = await supabaseKitchen
      .from('recipes')
      .select('*, recipe_ingredients(*, ingredients(*))');

    if (recError) {
      throw new Error(`Failed to fetch recipes: ${recError.message}`);
    }

    if (!recipes || recipes.length === 0) {
      res.status(400).json({
        status: 'error',
        error: 'No hay recetas en la base de datos de "Calla y Come" para entrenar.'
      });
      return;
    }

    
    const { data: weights, error: wError } = await supabaseKitchen
      .from('recipe_weights')
      .select('recipe_id, weight');

    if (wError) {
      throw new Error(`Failed to fetch weights: ${wError.message}`);
    }

    const weightsMap: Record<number, number> = {};
    (weights || []).forEach(w => {
      weightsMap[w.recipe_id] = w.weight;
    });

    
    
    
    let maxWeight = 0;
    Object.values(weightsMap).forEach(w => {
      if (w > maxWeight) maxWeight = w;
    });

    const dataset = recipes.map(r => {
      const weight = weightsMap[r.id] || 0;
      
      const target = maxWeight === 0 ? 0.5 : 0.1 + (weight / maxWeight) * 0.8;
      
      
      const mappedIngredients = (r.recipe_ingredients || []).map((ri: any) => ({
        name: ri.ingredients?.name || ''
      }));

      const parsedRecipeForFeatures = {
        meal_type: r.meal_type,
        difficulty: r.difficulty,
        health: r.health,
        price: r.price,
        diet_type: r.diet_type,
        allergens: r.allergens,
        ingredients: mappedIngredients
      };

      const inputs = NeuralNetwork.extractFeatures(parsedRecipeForFeatures, FEATURE_KEYS);
      return { inputs, target };
    });

    
    neuralNet = new NeuralNetwork(FEATURE_KEYS);
    const { finalLoss } = neuralNet.train(dataset, epochs, learningRate);

    
    isModelTrained = true;
    trainingMetrics = {
      epochs,
      finalLoss: Number(finalLoss.toFixed(6)),
      trainedAt: new Date().toISOString(),
      recipeCount: dataset.length
    };

    
    const dir = path.dirname(MODEL_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(MODEL_PATH, JSON.stringify({
      weights: neuralNet.export(),
      metrics: trainingMetrics
    }, null, 2));

    res.json({
      status: 'success',
      data: {
        message: 'Entrenamiento completado y guardado con éxito.',
        metrics: trainingMetrics
      }
    });

  } catch (err: any) {
    res.status(500).json({
      status: 'error',
      error: err.message || 'Error durante el entrenamiento.'
    });
  }
});


app.post('/api/ai/generate-recipe', async (req: Request, res: Response) => {
  const { meal_type, diet_type, allergens, max_budget, supermarket_id, health, difficulty } = req.body;

  try {
    
    const candidatesCount = isModelTrained ? 5 : 1;
    const candidates: any[] = [];

    for (let i = 0; i < candidatesCount; i++) {
      const candidate = await generateRecipe({
        meal_type,
        diet_type,
        allergens,
        max_budget,
        supermarket_id,
        health,
        difficulty
      }, supabaseSupermarket, supabaseKitchen);

      if (candidate) {
        
        const features = NeuralNetwork.extractFeatures(candidate, FEATURE_KEYS);
        const score = isModelTrained ? neuralNet.predict(features) : 0.5;
        candidates.push({ ...candidate, ai_score: score });
      }
    }

    if (candidates.length === 0) {
      res.status(404).json({
        status: 'error',
        error: 'No se pudo generar ninguna receta que cumpla con el presupuesto y las restricciones de alérgenos.'
      });
      return;
    }

    
    candidates.sort((a, b) => b.ai_score - a.ai_score);
    const bestRecipe = candidates[0];

    res.json({
      status: 'success',
      data: bestRecipe
    });

  } catch (err: any) {
    res.status(500).json({
      status: 'error',
      error: err.message || 'Error durante la generación de la receta.'
    });
  }
});

/**
 * POST /api/ai/vision-recipe
 * Recibe una lista de ingredientes detectados por foto o cámara (ej: ["huevos", "patatas", "cebolla"])
 * y genera recetas optimizadas con precios reales de supermercado.
 */
app.post('/api/ai/vision-recipe', async (req: Request, res: Response) => {
  const { detected_items, meal_type, diet_type, supermarket_id } = req.body;

  if (!detected_items || !Array.isArray(detected_items) || detected_items.length === 0) {
    res.status(400).json({
      status: 'error',
      error: 'Se requiere una lista de detected_items (mínimo 1 ingrediente).'
    });
    return;
  }

  try {
    const pantryItems = detected_items.map((item: string) => ({
      nombre: String(item).trim(),
      cantidad: 1,
      unidad: 'unidad'
    }));

    const recipe = await generateRecipe(
      {
        meal_type: meal_type || 'comida',
        diet_type: diet_type || 'omnivoro',
        supermarket_id: supermarket_id || 'todos',
        pantry_items: pantryItems
      },
      supabaseSupermarket,
      supabaseKitchen
    );

    if (!recipe) {
      res.status(404).json({
        status: 'error',
        error: 'No se pudo generar una receta adecuada con los ingredientes reconocidos.'
      });
      return;
    }

    res.json({
      status: 'success',
      data: {
        detected_ingredients_count: detected_items.length,
        recipe
      }
    });
  } catch (err: any) {
    res.status(500).json({
      status: 'error',
      error: err.message || 'Error durante la generación de receta por visión.'
    });
  }
});


app.post('/api/supermarkets/compare', async (req: Request, res: Response) => {
  const { ingredients } = req.body; 

  if (!ingredients || !Array.isArray(ingredients)) {
    res.status(400).json({
      status: 'error',
      error: 'Formato inválido. Se requiere un array de ingredientes.'
    });
    return;
  }

  try {
    const supermarkets = ['mercadona', 'eroski', 'dia', 'aldi', 'carrefour'];
    const comparison: Record<string, { total_cost: number; products: any[] }> = {};

    for (const sm of supermarkets) {
      let totalCost = 0;
      const products: any[] = [];

      for (const ing of ingredients) {
        
        const { data: dbProducts } = await supabaseSupermarket
          .from('productos')
          .select('referencia_id, nombre, precio, supermercado_id')
          .eq('supermercado_id', sm)
          .ilike('nombre', `%${ing.name.split(' ')[0]}%`);

        if (!dbProducts || dbProducts.length === 0) {
          totalCost += 0.60;
          products.push({
            ingredient_name: ing.name,
            product_name: `Estimado: ${ing.name}`,
            precio: 0.60,
            quantity: ing.quantity,
            unit: ing.unit,
            supermercado: sm,
            referencia_id: 'estimated'
          });
          continue;
        }

        
        const scored = dbProducts.map(p => {
          
          const normProduct = p.nombre.toLowerCase();
          const normQuery = ing.name.toLowerCase();
          let score = normProduct.includes(normQuery) ? 100 : 10;
          if (normProduct.startsWith(normQuery)) score += 50;
          return { product: p, score };
        }).sort((a, b) => b.score - a.score);

        const bestMatch = scored[0].product;
        const pPrice = Number(bestMatch.precio);
        let itemCost = pPrice;

        if (ing.unit === 'rebanadas' || ing.unit === 'unidades' || ing.unit === 'unidad') {
          itemCost = (pPrice / 6) * ing.quantity;
        } else if (ing.unit === 'g') {
          itemCost = (pPrice / 500) * ing.quantity;
        } else if (ing.unit === 'ml') {
          itemCost = (pPrice / 1000) * ing.quantity;
        }

        totalCost += itemCost;
        products.push({
          ingredient_name: ing.name,
          product_name: bestMatch.nombre,
          precio: pPrice,
          computed_cost: Number(itemCost.toFixed(2)),
          quantity: ing.quantity,
          unit: ing.unit,
          supermercado: sm,
          referencia_id: bestMatch.referencia_id
        });
      }

      comparison[sm] = {
        total_cost: Number(totalCost.toFixed(2)),
        products
      };
    }

    res.json({
      status: 'success',
      data: comparison
    });

  } catch (err: any) {
    res.status(500).json({
      status: 'error',
      error: err.message || 'Error al comparar supermercados.'
    });
  }
});


app.post('/api/ai/generate-menu', aiMenuLimiter, async (req: Request, res: Response) => {
  const { 
    weekly_budget = 50, 
    supermarket_id = 'todos', 
    diet_type = 'omnivoro', 
    allergens = [], 
    health = 'saludable', 
    difficulty = 'facil', 
    use_pantry = true,
    family_id
  } = req.body;

  try {
    let pantryItems: any[] = [];
    if (use_pantry && family_id) {
      const { data, error } = await supabaseKitchen
        .from('pantry')
        .select('ingredient_name, quantity, unit')
        .eq('family_id', family_id);
      
      if (!error && data) {
        pantryItems = data.map((item: any) => ({
          nombre: item.ingredient_name,
          cantidad: Number(item.quantity) || 0,
          unidad: item.unit
        }));
      }
    }

    const menuData = await generateWeeklyMenu({
      weekly_budget: Number(weekly_budget),
      supermarket_id,
      diet_type,
      allergens,
      health,
      difficulty,
      use_pantry,
      pantry_items: pantryItems,
      neural_network: isModelTrained ? neuralNet : undefined,
      feature_keys: FEATURE_KEYS,
      supabaseKitchen: supabaseKitchen
    }, supabaseSupermarket);

    res.json({
      status: 'success',
      data: menuData
    });
  } catch (err: any) {
    res.status(500).json({
      status: 'error',
      error: err.message || 'Error al generar el menú semanal.'
    });
  }
});


app.post('/api/ai/detect-allergens', (req: Request, res: Response) => {
  const { ingredients = [] } = req.body;
  
  const detectedSet = new Set<string>();
  const list = Array.isArray(ingredients) ? ingredients : [ingredients];

  const rules = [
    { allergen: 'gluten', keywords: ['pan', 'pasta', 'trigo', 'harina', 'espagueti', 'fideos', 'macarrones', 'centeno', 'avena', 'cebada', 'viena', 'tostada', 'galleta', 'bizcocho', 'cerveza', 'semola'] },
    { allergen: 'lactosa', keywords: ['leche', 'queso', 'yogur', 'lacteo', 'crema', 'nata', 'mantequilla', 'parmesano', 'mozzarella', 'suero', 'kefir'] },
    { allergen: 'huevo', keywords: ['huevo', 'yema', 'clara', 'mayonesa', 'merengue'] },
    { allergen: 'pescado', keywords: ['pescado', 'atun', 'salmon', 'merluza', 'bacalao', 'trucha', 'sardina', 'boqueron', 'lubina', 'dorada', 'gula'] },
    { allergen: 'marisco', keywords: ['marisco', 'gamba', 'langostino', 'mejillon', 'almeja', 'pulpo', 'calamar', 'cangrejo', 'langosta', 'ostra'] },
    { allergen: 'frutos secos', keywords: ['nuez', 'nueces', 'almendra', 'cacahuete', 'avellana', 'pistacho', 'anacardo', 'castaña'] },
    { allergen: 'soja', keywords: ['soja', 'tofu', 'tempeh', 'miso'] }
  ];

  list.forEach((ing: string) => {
    const norm = ing.toLowerCase();
    rules.forEach(rule => {
      if (rule.keywords.some(kw => norm.includes(kw))) {
        detectedSet.add(rule.allergen);
      }
    });
  });

  res.json({
    status: 'success',
    data: {
      allergens: Array.from(detectedSet)
    }
  });
});


app.get('/api/supermarkets/trends', async (_req: Request, res: Response) => {
  try {
    const { data: history, error } = await supabaseSupermarket
      .from('historial_precios')
      .select('supermercado_id, referencia_id, precio, fecha')
      .order('fecha', { ascending: false })
      .limit(100);

    let priceChanges: any[] = [];
    
    if (!error && history && history.length > 1) {
      const latestPrices: Record<string, { precio: number; fecha: string; history: number[] }> = {};
      
      history.forEach((h: any) => {
        const key = `${h.supermercado_id}:${h.referencia_id}`;
        if (!latestPrices[key]) {
          latestPrices[key] = { precio: Number(h.precio), fecha: h.fecha, history: [] };
        } else {
          latestPrices[key].history.push(Number(h.precio));
        }
      });

      Object.entries(latestPrices).forEach(([key, val]) => {
        if (val.history.length > 0) {
          const oldPrice = val.history[0];
          const newPrice = val.precio;
          const pct = ((newPrice - oldPrice) / oldPrice) * 100;
          if (Math.abs(pct) > 0.1) {
            const [supermercado_id, referencia_id] = key.split(':');
            priceChanges.push({
              supermercado_id,
              referencia_id,
              old_price: oldPrice,
              new_price: newPrice,
              change_pct: Number(pct.toFixed(1)),
              direction: pct > 0 ? 'up' : 'down'
            });
          }
        }
      });
    }

    const mockTrends = [
      {
        supermercado_id: 'mercadona',
        product_name: 'Aceite de Oliva Virgen Extra 1L',
        old_price: 9.45,
        new_price: 8.95,
        change_pct: -5.3,
        direction: 'down',
        date: new Date().toISOString()
      },
      {
        supermercado_id: 'carrefour',
        product_name: 'Pechuga de Pollo 1kg',
        old_price: 6.80,
        new_price: 7.20,
        change_pct: 5.8,
        direction: 'up',
        date: new Date().toISOString()
      },
      {
        supermercado_id: 'dia',
        product_name: 'Leche Entera 1L',
        old_price: 1.05,
        new_price: 0.99,
        change_pct: -5.7,
        direction: 'down',
        date: new Date().toISOString()
      },
      {
        supermercado_id: 'aldi',
        product_name: 'Plátano de Canarias 1kg',
        old_price: 2.10,
        new_price: 1.89,
        change_pct: -10.0,
        direction: 'down',
        date: new Date().toISOString()
      },
      {
        supermercado_id: 'eroski',
        product_name: 'Arroz Redondo 1kg',
        old_price: 1.45,
        new_price: 1.55,
        change_pct: 6.9,
        direction: 'up',
        date: new Date().toISOString()
      }
    ];

    res.json({
      status: 'success',
      data: {
        real_trends: priceChanges,
        mock_trends: mockTrends
      }
    });

  } catch (err: any) {
    res.status(500).json({
      status: 'error',
      error: err.message || 'Error al obtener tendencias de precios.'
    });
  }
});

let votesSinceLastTraining = 0;
const AUTO_RETRAIN_THRESHOLD = 5;

app.post('/api/ai/auto-retrain', async (_req: Request, res: Response) => {
  votesSinceLastTraining += 1;

  if (votesSinceLastTraining < AUTO_RETRAIN_THRESHOLD) {
    res.json({
      status: 'success',
      data: { retrained: false, votes_pending: votesSinceLastTraining, threshold: AUTO_RETRAIN_THRESHOLD }
    });
    return;
  }

  try {
    const { data: recipes, error: recError } = await supabaseKitchen
      .from('recipes')
      .select('*, recipe_ingredients(*, ingredients(*))');

    if (recError || !recipes || recipes.length === 0) {
      res.status(400).json({ status: 'error', error: 'No hay recetas suficientes para reentrenar.' });
      return;
    }

    const { data: weights, error: wError } = await supabaseKitchen
      .from('recipe_weights')
      .select('recipe_id, weight');

    if (wError) throw new Error(wError.message);

    const weightsMap: Record<number, number> = {};
    (weights || []).forEach((w: any) => { weightsMap[w.recipe_id] = w.weight; });

    let maxWeight = 0;
    Object.values(weightsMap).forEach(w => { if (w > maxWeight) maxWeight = w; });

    const dataset = recipes.map((r: any) => {
      const weight = weightsMap[r.id] || 0;
      const target = maxWeight === 0 ? 0.5 : 0.1 + (weight / maxWeight) * 0.8;
      const mappedIngredients = (r.recipe_ingredients || []).map((ri: any) => ({ name: ri.ingredients?.name || '' }));
      const inputs = NeuralNetwork.extractFeatures({
        meal_type: r.meal_type, difficulty: r.difficulty, health: r.health,
        price: r.price, diet_type: r.diet_type, allergens: r.allergens,
        ingredients: mappedIngredients
      }, FEATURE_KEYS);
      return { inputs, target };
    });

    neuralNet = new NeuralNetwork(FEATURE_KEYS);
    const { finalLoss } = neuralNet.train(dataset, 1000, 0.1);

    isModelTrained = true;
    trainingMetrics = {
      epochs: 1000,
      finalLoss: Number(finalLoss.toFixed(6)),
      trainedAt: new Date().toISOString(),
      recipeCount: dataset.length
    };

    fs.writeFileSync(MODEL_PATH, JSON.stringify({ weights: neuralNet.export(), metrics: trainingMetrics }, null, 2));

    votesSinceLastTraining = 0;

    res.json({
      status: 'success',
      data: { retrained: true, metrics: trainingMetrics }
    });
  } catch (err: any) {
    res.status(500).json({ status: 'error', error: err.message || 'Error en el reentrenamiento automático.' });
  }
});

const PORT = process.env.PORT || 8002;

app.listen(PORT, () => {
  console.log(`================================================================`);
  console.log(`🧠 Recetator AI Server running on http://localhost:${PORT}`);
  console.log(`================================================================`);
});
