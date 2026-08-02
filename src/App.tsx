import { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { ChefHat, Sparkles, Brain, TrendingDown } from 'lucide-react';
import { supabaseKitchen } from './services/supabaseClient';
import {
  fetchSupermarketTrends,
  fetchAIStatus,
  trainAIModel,
  generateRecipe,
  generateWeeklyMenu
} from './services/apiService';
import AITrainerCard from './components/AITrainerCard';
import InstructionCard from './components/InstructionCard';
import RecipeGeneratorTab from './components/RecipeGeneratorTab';
import WeeklyPlannerTab from './components/WeeklyPlannerTab';
import PriceTrendsTab from './components/PriceTrendsTab';
import { PortfolioLockScreen } from './components/PortfolioLockScreen';
import { CookieConsent } from './components/legal/CookieConsent';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import CookiePolicy from './pages/CookiePolicy';

const ALLERGEN_OPTIONS = ['gluten', 'lactosa', 'huevo', 'pescado', 'frutos secos', 'marisco', 'soja'];
const SUPERMARKET_COLOR_HEX: Record<string, string> = {
  mercadona: '#00A859',
  eroski: '#005CA9',
  dia: '#E2001A',
  aldi: '#002C5B',
  carrefour: '#003893'
};

export default function App() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [epochs, setEpochs] = useState<number>(1000);
  const [learningRate, setLearningRate] = useState<number>(0.1);
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [modelStatus, setModelStatus] = useState<any>(null);
  const [lossHistory, setLossHistory] = useState<number[]>([]);

  const [mealType, setMealType] = useState<'desayuno' | 'comida' | 'cena'>('comida');
  const [dietType, setDietType] = useState<string>('omnivoro');
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [maxBudget, setMaxBudget] = useState<number>(5);
  const [supermarketId, setSupermarketId] = useState<string>('todos');
  const [health, setHealth] = useState<'saludable' | 'no saludable'>('saludable');
  const [difficulty, setDifficulty] = useState<'facil' | 'intermedia' | 'dificil'>('facil');

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<any>(null);
  const [selectedSmTab, setSelectedSmTab] = useState<string>('');
  const [savingStatus, setSavingStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const [pantryItems, setPantryItems] = useState<any[]>([]);
  const [trends, setTrends] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'generate' | 'weekly' | 'trends'>('generate');
  const [weeklyBudget, setWeeklyBudget] = useState<number>(50);
  const [usePantry, setUsePantry] = useState<boolean>(true);
  const [isGeneratingMenu, setIsGeneratingMenu] = useState<boolean>(false);
  const [generatedMenu, setGeneratedMenu] = useState<any>(null);
  const [weeklySavingStatus, setWeeklySavingStatus] = useState<Record<string, 'idle' | 'saving' | 'saved' | 'error'>>({});

  useEffect(() => {
    supabaseKitchen.auth.getSession().then(({ data: { session: s } }) => setSession(s));
    const { data: { subscription } } = supabaseKitchen.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      fetchStatus();
      fetchPantry();
      fetchTrends();
    }
  }, [session]);

  const fetchPantry = async () => {
    try {
      const { data, error } = await supabaseKitchen
        .from('pantry')
        .select('*');
      if (!error && data) {
        setPantryItems(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTrends = async () => {
    try {
      const data = await fetchSupermarketTrends();
      setTrends(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStatus = async () => {
    try {
      const data = await fetchAIStatus();
      setModelStatus(data);
      if (data.trained && data.metrics?.finalLoss) {
        const startLoss = 0.45;
        const endLoss = data.metrics.finalLoss;
        const points = [];
        for (let i = 0; i < 20; i++) {
          const ratio = i / 19;
          points.push(startLoss - (startLoss - endLoss) * Math.pow(ratio, 0.4) + Math.random() * 0.01);
        }
        setLossHistory(points);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleTrain = async () => {
    setIsTraining(true);
    setErrorMessage('');
    try {
      await trainAIModel(epochs, learningRate);
      fetchStatus();
    } catch (e: any) {
      setErrorMessage(e.message || 'Error de conexión con el servidor de la IA.');
    } finally {
      setIsTraining(false);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedRecipe(null);
    setSavingStatus('idle');
    setErrorMessage('');
    try {
      const data = await generateRecipe({
        meal_type: mealType,
        diet_type: dietType,
        allergens: selectedAllergens,
        max_budget: maxBudget,
        supermarket_id: supermarketId,
        health,
        difficulty,
        pantry_items: usePantry ? pantryItems.map(item => ({
          nombre: item.ingredient_name,
          cantidad: item.quantity,
          unidad: item.unit
        })) : []
      });
      setGeneratedRecipe(data);
      const smKeys = Object.keys(data.comparison || {});
      if (smKeys.length > 0) {
        setSelectedSmTab(data.supermarket_id || smKeys[0]);
      }
    } catch (e: any) {
      setErrorMessage(e.message || 'No se pudo generar la receta con esos parámetros.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateMenu = async () => {
    setIsGeneratingMenu(true);
    setGeneratedMenu(null);
    setErrorMessage('');
    try {
      const firstFamilyId = pantryItems.find(p => p.family_id)?.family_id || null;
      const data = await generateWeeklyMenu({
        weekly_budget: weeklyBudget,
        supermarket_id: supermarketId,
        diet_type: dietType,
        allergens: selectedAllergens,
        health,
        difficulty,
        use_pantry: usePantry,
        family_id: firstFamilyId
      });
      setGeneratedMenu(data);
    } catch (e: any) {
      setErrorMessage(e.message || 'Error al generar el menú semanal.');
    } finally {
      setIsGeneratingMenu(false);
    }
  };

  const saveRecipeToKitchen = async (recipe: any): Promise<boolean> => {
    const { data: existingRecipes } = await supabaseKitchen
      .from('recipes')
      .select('id')
      .ilike('name', recipe.name.trim());
    if (existingRecipes && existingRecipes.length > 0) {
      return true;
    }

    const { data: newRecipe, error: recipeError } = await supabaseKitchen
      .from('recipes')
      .insert([{
        name: recipe.name,
        meal_type: recipe.meal_type,
        price: Number(recipe.estimated_cost) || 0,
        difficulty: recipe.difficulty,
        health: recipe.health || 'saludable',
        diet_type: recipe.diet_type,
        allergens: recipe.allergens || [],
        instructions: recipe.instructions || []
      }])
      .select()
      .single();

    if (recipeError || !newRecipe) {
      throw new Error(recipeError?.message || 'Error al insertar la receta');
    }

    const recipeId = newRecipe.id;

    for (const ing of recipe.ingredients) {
      let ingredientId: number;
      const { data: existingIng } = await supabaseKitchen
        .from('ingredients')
        .select('id')
        .eq('name', ing.name.trim())
        .maybeSingle();

      if (existingIng) {
        ingredientId = existingIng.id;
      } else {
        const { data: newIng, error: ingError } = await supabaseKitchen
          .from('ingredients')
          .insert([{ name: ing.name.trim() }])
          .select()
          .single();

        if (ingError || !newIng) {
          throw new Error(`Error al registrar el ingrediente ${ing.name}: ${ingError?.message}`);
        }
        ingredientId = newIng.id;
      }

      const { error: linkError } = await supabaseKitchen
        .from('recipe_ingredients')
        .insert([{
          recipe_id: recipeId,
          ingredient_id: ingredientId,
          quantity: Number(ing.quantity) || 0,
          unit: ing.unit
        }]);

      if (linkError) {
        throw new Error(`Error al vincular el ingrediente ${ing.name}: ${linkError.message}`);
      }
    }

    await supabaseKitchen
      .from('recipe_weights')
      .insert([{ recipe_id: recipeId, weight: 5 }]);

    return false;
  };

  const handleSaveRecipe = async () => {
    if (!generatedRecipe) return;
    setSavingStatus('saving');
    setErrorMessage('');
    try {
      const alreadyExists = await saveRecipeToKitchen(generatedRecipe);
      if (alreadyExists) {
        setErrorMessage(`La receta "${generatedRecipe.name}" ya existe en el recetario.`);
        setSavingStatus('saved');
      } else {
        setSavingStatus('saved');
        fetchStatus();
      }
    } catch (e: any) {
      setSavingStatus('error');
      setErrorMessage(e.message || 'Error al guardar la receta en la base de datos.');
    }
  };

  const handleSaveWeeklyRecipe = async (recipe: any, day: string, targetMealType: string) => {
    const key = `${day}:${targetMealType}`;
    setWeeklySavingStatus(prev => ({ ...prev, [key]: 'saving' }));
    setErrorMessage('');
    try {
      const alreadyExists = await saveRecipeToKitchen(recipe);
      if (alreadyExists) {
        setErrorMessage(`La receta "${recipe.name}" ya existe en el recetario.`);
        setWeeklySavingStatus(prev => ({ ...prev, [key]: 'saved' }));
      } else {
        setWeeklySavingStatus(prev => ({ ...prev, [key]: 'saved' }));
        fetchStatus();
      }
    } catch (e: any) {
      console.error(e);
      setWeeklySavingStatus(prev => ({ ...prev, [key]: 'error' }));
      setErrorMessage(e.message || 'Error al guardar la receta semanal.');
    }
  };

  const toggleAllergen = (all: string) => {
    setSelectedAllergens(prev =>
      prev.includes(all) ? prev.filter(x => x !== all) : [...prev, all]
    );
  };

  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    const { error } = await supabaseKitchen.auth.signInWithPassword({ email, password });
    return !error;
  };

  if (session === undefined) {
    return (
      <div style={{ minHeight: '100vh', background: '#0d0f1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(246,173,85,0.2)', borderTopColor: '#f6ad55', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!session) {
    const pathname = window.location.pathname;
    if (pathname === '/privacy') return <><PrivacyPolicy /><CookieConsent /></>;
    if (pathname === '/terms') return <><TermsOfService /><CookieConsent /></>;
    if (pathname === '/cookies') return <><CookiePolicy /><CookieConsent /></>;
    return <><PortfolioLockScreen onLogin={handleLogin} /><CookieConsent /></>;
  }

  return (
    <div>
      <CookieConsent />
      <div className="glow-orb orb-purple"></div>
      <div className="glow-orb orb-blue"></div>

      <div className="dashboard-container">
        <header className="header-container">
          <h1 className="app-title">
            <ChefHat size={48} className="text-purple-400" />
            Recetator <span style={{ fontWeight: 300 }}>AI</span>
          </h1>
          <p className="app-subtitle">
            Crea y entrena una inteligencia artificial para la generación de menús personalizados, calculando presupuestos en tiempo real comparando múltiples supermercados.
          </p>
        </header>

        <div className="navigation-tabs" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
          <button
            onClick={() => setActiveTab('generate')}
            className={`tab-btn ${activeTab === 'generate' ? 'active' : ''}`}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '0.75rem',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: activeTab === 'generate' ? 'rgba(139,92,246,0.2)' : 'transparent',
              color: activeTab === 'generate' ? '#c084fc' : '#94a3b8',
              transition: 'all 0.3s ease',
              borderWidth: 1,
              borderStyle: 'solid',
              borderColor: activeTab === 'generate' ? 'rgba(139,92,246,0.3)' : 'transparent'
            }}
          >
            <Sparkles size={16} />
            Recetas AI Individuales
          </button>
          <button
            onClick={() => setActiveTab('weekly')}
            className={`tab-btn ${activeTab === 'weekly' ? 'active' : ''}`}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '0.75rem',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: activeTab === 'weekly' ? 'rgba(139,92,246,0.2)' : 'transparent',
              color: activeTab === 'weekly' ? '#c084fc' : '#94a3b8',
              transition: 'all 0.3s ease',
              borderWidth: 1,
              borderStyle: 'solid',
              borderColor: activeTab === 'weekly' ? 'rgba(139,92,246,0.3)' : 'transparent'
            }}
          >
            <Brain size={16} />
            Planificador Semanal AI
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            className={`tab-btn ${activeTab === 'trends' ? 'active' : ''}`}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '0.75rem',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: activeTab === 'trends' ? 'rgba(139,92,246,0.2)' : 'transparent',
              color: activeTab === 'trends' ? '#c084fc' : '#94a3b8',
              transition: 'all 0.3s ease',
              borderWidth: 1,
              borderStyle: 'solid',
              borderColor: activeTab === 'trends' ? 'rgba(139,92,246,0.3)' : 'transparent'
            }}
          >
            <TrendingDown size={16} />
            Alertas de Precios y Ofertas
          </button>
        </div>

        <div className="dashboard-grid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <AITrainerCard
              modelStatus={modelStatus}
              epochs={epochs}
              setEpochs={setEpochs}
              learningRate={learningRate}
              setLearningRate={setLearningRate}
              isTraining={isTraining}
              handleTrain={handleTrain}
              lossHistory={lossHistory}
            />
            <InstructionCard />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {activeTab === 'generate' && (
              <RecipeGeneratorTab
                mealType={mealType}
                setMealType={setMealType}
                dietType={dietType}
                setDietType={setDietType}
                maxBudget={maxBudget}
                setMaxBudget={setMaxBudget}
                supermarketId={supermarketId}
                setSupermarketId={setSupermarketId}
                health={health}
                setHealth={setHealth}
                difficulty={difficulty}
                setDifficulty={setDifficulty}
                usePantry={usePantry}
                setUsePantry={setUsePantry}
                pantryItems={pantryItems}
                selectedAllergens={selectedAllergens}
                toggleAllergen={toggleAllergen}
                errorMessage={errorMessage}
                isGenerating={isGenerating}
                handleGenerate={handleGenerate}
                generatedRecipe={generatedRecipe}
                selectedSmTab={selectedSmTab}
                setSelectedSmTab={setSelectedSmTab}
                savingStatus={savingStatus}
                handleSaveRecipe={handleSaveRecipe}
                ALLERGEN_OPTIONS={ALLERGEN_OPTIONS}
                SUPERMARKET_COLOR_HEX={SUPERMARKET_COLOR_HEX}
              />
            )}

            {activeTab === 'weekly' && (
              <WeeklyPlannerTab
                weeklyBudget={weeklyBudget}
                setWeeklyBudget={setWeeklyBudget}
                supermarketId={supermarketId}
                setSupermarketId={setSupermarketId}
                dietType={dietType}
                setDietType={setDietType}
                usePantry={usePantry}
                setUsePantry={setUsePantry}
                pantryItems={pantryItems}
                selectedAllergens={selectedAllergens}
                toggleAllergen={toggleAllergen}
                errorMessage={errorMessage}
                isGeneratingMenu={isGeneratingMenu}
                handleGenerateMenu={handleGenerateMenu}
                generatedMenu={generatedMenu}
                weeklySavingStatus={weeklySavingStatus}
                handleSaveWeeklyRecipe={handleSaveWeeklyRecipe}
                ALLERGEN_OPTIONS={ALLERGEN_OPTIONS}
                SUPERMARKET_COLOR_HEX={SUPERMARKET_COLOR_HEX}
              />
            )}

            {activeTab === 'trends' && (
              <PriceTrendsTab
                trends={trends}
                SUPERMARKET_COLOR_HEX={SUPERMARKET_COLOR_HEX}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
