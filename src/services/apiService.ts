const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8002';

export interface RecipeGenerationParams {
  meal_type: 'desayuno' | 'comida' | 'cena';
  diet_type: string;
  allergens: string[];
  max_budget: number;
  supermarket_id: string;
  health: 'saludable' | 'no saludable';
  difficulty: 'facil' | 'intermedia' | 'dificil';
  pantry_items: { nombre: string; cantidad: number; unit?: string; unidad?: string }[];
}

export interface MenuGenerationParams {
  weekly_budget: number;
  supermarket_id: string;
  diet_type: string;
  allergens: string[];
  health: 'saludable' | 'no saludable';
  difficulty: 'facil' | 'intermedia' | 'dificil';
  use_pantry: boolean;
  family_id: string | null;
}

export async function fetchSupermarketTrends(): Promise<any> {
  const response = await fetch(`${BACKEND_URL}/api/supermarkets/trends`);
  const result = await response.json();
  if (result.status !== 'success') {
    throw new Error(result.error || 'Failed to fetch trends');
  }
  return result.data;
}

export async function fetchAIStatus(): Promise<any> {
  const response = await fetch(`${BACKEND_URL}/api/ai/status`);
  const result = await response.json();
  if (result.status !== 'success') {
    throw new Error(result.error || 'Failed to fetch AI status');
  }
  return result.data;
}

export async function trainAIModel(epochs: number, learningRate: number): Promise<any> {
  const response = await fetch(`${BACKEND_URL}/api/ai/train`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ epochs, learningRate })
  });
  const result = await response.json();
  if (result.status !== 'success') {
    throw new Error(result.error || 'Failed to train AI model');
  }
  return result.data;
}

export async function generateRecipe(params: RecipeGenerationParams): Promise<any> {
  const response = await fetch(`${BACKEND_URL}/api/ai/generate-recipe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  const result = await response.json();
  if (result.status !== 'success') {
    throw new Error(result.error || 'Failed to generate recipe');
  }
  return result.data;
}

export async function generateWeeklyMenu(params: MenuGenerationParams): Promise<any> {
  const response = await fetch(`${BACKEND_URL}/api/ai/generate-menu`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  const result = await response.json();
  if (result.status !== 'success') {
    throw new Error(result.error || 'Failed to generate menu');
  }
  return result.data;
}
