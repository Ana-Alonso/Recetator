import { SupabaseClient } from '@supabase/supabase-js';
import { NeuralNetwork } from './neural_network.js';


export interface GeneratedIngredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface GeneratedRecipe {
  name: string;
  meal_type: 'desayuno' | 'comida' | 'cena';
  price: 'economica' | 'cara';
  difficulty: 'facil' | 'intermedia' | 'dificil';
  health: 'saludable' | 'no saludable';
  diet_type: string;
  allergens: string[];
  instructions: string[];
  ingredients: GeneratedIngredient[];
  
  supermarket_id?: string;
  estimated_cost?: number; 
  recipe_cost?: number;    
  comparison?: Record<string, { total_cost: number; recipe_cost?: number; products: any[] }>;
}


interface RecipeTemplate {
  namePattern: string;
  meal_type: 'desayuno' | 'comida' | 'cena';
  difficulty: 'facil' | 'intermedia' | 'dificil';
  health: 'saludable' | 'no saludable';
  diet_type: string;
  allergens: string[];
  ingredients: Array<{
    category: string; 
    options: Array<{ name: string; quantity: number; unit: string; allergens?: string[]; diet_type?: string }>;
  }>;
  instructions: string[];
}

const RECIPE_TEMPLATES: RecipeTemplate[] = [
  
  {
    namePattern: "Tostadas de [CARB] con [TOPPING] y [ADDITIONAL]",
    meal_type: "desayuno",
    difficulty: "facil",
    health: "saludable",
    diet_type: "vegetariano",
    allergens: ["gluten"],
    ingredients: [
      {
        category: "carb",
        options: [
          { name: "Pan de molde integral", quantity: 2, unit: "rebanadas" },
          { name: "Pan de centeno", quantity: 2, unit: "rebanadas" },
          { name: "Pan de molde familiar", quantity: 2, unit: "rebanadas" }
        ]
      },
      {
        category: "topping",
        options: [
          { name: "Tomate triturado", quantity: 50, unit: "g", diet_type: "vegano" },
          { name: "Queso fresco", quantity: 80, unit: "g", allergens: ["lactosa"], diet_type: "vegetariano" },
          { name: "Aguacate", quantity: 0.5, unit: "unidad", diet_type: "vegano" }
        ]
      },
      {
        category: "additional",
        options: [
          { name: "Aceite de oliva", quantity: 10, unit: "ml", diet_type: "vegano" },
          { name: "Huevo cocido", quantity: 1, unit: "unidad", allergens: ["huevo"], diet_type: "vegetariano" }
        ]
      }
    ],
    instructions: [
      "Tuesta las rebanadas de [CARB] al nivel deseado.",
      "Unta o coloca el [TOPPING] de manera uniforme sobre el pan tostado.",
      "Añade el [ADDITIONAL] por encima.",
      "Sazona con una pizca de sal y sirve inmediatamente caliente."
    ]
  },
  {
    namePattern: "Tortilla de [PROTEIN] con [VEGETABLE]",
    meal_type: "desayuno",
    difficulty: "facil",
    health: "saludable",
    diet_type: "vegetariano",
    allergens: ["huevo"],
    ingredients: [
      {
        category: "protein",
        options: [
          { name: "Huevos", quantity: 2, unit: "unidades", allergens: ["huevo"] }
        ]
      },
      {
        category: "vegetable",
        options: [
          { name: "Cebolla", quantity: 0.25, unit: "unidad", diet_type: "vegano" },
          { name: "Espinacas", quantity: 30, unit: "g", diet_type: "vegano" },
          { name: "Tomate", quantity: 0.5, unit: "unidad", diet_type: "vegano" }
        ]
      },
      {
        category: "oil",
        options: [
          { name: "Aceite de oliva", quantity: 5, unit: "ml", diet_type: "vegano" }
        ]
      }
    ],
    instructions: [
      "Pica finamente el [VEGETABLE].",
      "En una sartén pequeña, añade el [OIL] y saltea el [VEGETABLE] hasta que esté tierno.",
      "En un bol, bate los [PROTEIN] con un poco de sal.",
      "Vierte los huevos batidos sobre los vegetales y cocina a fuego medio-bajo.",
      "Dobla la tortilla a la mitad una vez que empiece a cuajar y sirve caliente."
    ]
  },
  {
    namePattern: "Bol de [BASE] con [FRUIT] y [TOPPING]",
    meal_type: "desayuno",
    difficulty: "facil",
    health: "saludable",
    diet_type: "vegetariano",
    allergens: ["lactosa"],
    ingredients: [
      {
        category: "base",
        options: [
          { name: "Yogur natural", quantity: 125, unit: "g", allergens: ["lactosa"], diet_type: "vegetariano" },
          { name: "Queso fresco batido", quantity: 150, unit: "g", allergens: ["lactosa"], diet_type: "vegetariano" }
        ]
      },
      {
        category: "fruit",
        options: [
          { name: "Plátano", quantity: 1, unit: "unidad", diet_type: "vegano" },
          { name: "Manzana", quantity: 1, unit: "unidad", diet_type: "vegano" }
        ]
      },
      {
        category: "topping",
        options: [
          { name: "Copos de avena", quantity: 30, unit: "g", diet_type: "vegano" },
          { name: "Miel", quantity: 15, unit: "g", diet_type: "vegetariano" }
        ]
      }
    ],
    instructions: [
      "Sirve la base de [BASE] en un bol mediano.",
      "Lava, pela y corta la [FRUIT] en rodajas o trozos pequeños.",
      "Coloca la fruta cortada con cuidado sobre el bol.",
      "Espolvorea el [TOPPING] por encima para decorar y dar textura.",
      "Disfruta de este desayuno fresco y nutritivo."
    ]
  },
  {
    namePattern: "Gachas de avena con [MILK] y [TOPPING]",
    meal_type: "desayuno",
    difficulty: "facil",
    health: "saludable",
    diet_type: "vegetariano",
    allergens: [],
    ingredients: [
      {
        category: "milk",
        options: [
          { name: "Leche entera", quantity: 200, unit: "ml", allergens: ["lactosa"], diet_type: "vegetariano" },
          { name: "Bebida de soja", quantity: 200, unit: "ml", diet_type: "vegano" }
        ]
      },
      {
        category: "topping",
        options: [
          { name: "Plátano", quantity: 0.5, unit: "unidad", diet_type: "vegano" },
          { name: "Manzana", quantity: 0.5, unit: "unidad", diet_type: "vegano" }
        ]
      },
      {
        category: "grains",
        options: [
          { name: "Copos de avena", quantity: 40, unit: "g", diet_type: "vegano" }
        ]
      }
    ],
    instructions: [
      "En un cazo pequeño, calienta la [MILK] a fuego medio.",
      "Añade los [GRAINS] y remueve continuamente durante 5-7 minutos hasta que espese.",
      "Vierte las gachas cremosas en un bol.",
      "Corta el [TOPPING] en láminas finas y colócalo encima antes de servir."
    ]
  },
  {
    namePattern: "Sandwich tostado de [CARB] con [PROTEIN] y [CHEESE]",
    meal_type: "desayuno",
    difficulty: "facil",
    health: "saludable",
    diet_type: "omnivoro",
    allergens: ["gluten", "lactosa"],
    ingredients: [
      {
        category: "carb",
        options: [
          { name: "Pan de molde integral", quantity: 2, unit: "rebanadas" },
          { name: "Pan de centeno", quantity: 2, unit: "rebanadas" }
        ]
      },
      {
        category: "protein",
        options: [
          { name: "Pechuga de pavo", quantity: 40, unit: "g", diet_type: "omnivoro" },
          { name: "Atún en aceite", quantity: 40, unit: "g", allergens: ["pescado"], diet_type: "pescetariano" },
          { name: "Huevo cocido", quantity: 1, unit: "unidad", allergens: ["huevo"], diet_type: "vegetariano" }
        ]
      },
      {
        category: "cheese",
        options: [
          { name: "Queso fresco", quantity: 50, unit: "g", allergens: ["lactosa"], diet_type: "vegetariano" }
        ]
      }
    ],
    instructions: [
      "Coloca las rebanadas de [CARB] en una tabla.",
      "Distribuye el [PROTEIN] y el [CHEESE] de manera uniforme entre los panes.",
      "Cierra el sandwich y llévalo a una sandwichera o plancha caliente.",
      "Tuesta durante 3-4 minutos hasta que el pan esté crujiente y sirve."
    ]
  },

  
  {
    namePattern: "Guiso tradicional de [PROTEIN] con [VEGETABLE] y [CARB]",
    meal_type: "comida",
    difficulty: "intermedia",
    health: "saludable",
    diet_type: "omnivoro",
    allergens: [],
    ingredients: [
      {
        category: "protein",
        options: [
          { name: "Carne picada de ternera", quantity: 200, unit: "g", diet_type: "omnivoro" },
          { name: "Pechuga de pollo cocida y desmechada", quantity: 200, unit: "g", diet_type: "omnivoro" },
          { name: "Garbanzos en conserva", quantity: 250, unit: "g", diet_type: "vegano" }
        ]
      },
      {
        category: "vegetable",
        options: [
          { name: "Cebolla", quantity: 0.5, unit: "unidad", diet_type: "vegano" },
          { name: "Tomate frito estilo casero", quantity: 150, unit: "g", diet_type: "vegano" },
          { name: "Pimiento verde", quantity: 0.5, unit: "unidad", diet_type: "vegano" }
        ]
      },
      {
        category: "carb",
        options: [
          { name: "Patata", quantity: 1, unit: "unidad", diet_type: "vegano" },
          { name: "Arroz redondo", quantity: 80, unit: "g", diet_type: "vegano" }
        ]
      },
      {
        category: "oil",
        options: [
          { name: "Aceite de oliva", quantity: 15, unit: "ml", diet_type: "vegano" }
        ]
      }
    ],
    instructions: [
      "Corta la cebolla, el pimiento y la [CARB] en cubos medianos.",
      "En una olla, calienta el [OIL] y sella la [PROTEIN] hasta que empiece a dorar.",
      "Añade la cebolla y el pimiento, sofriendo durante 5 minutos.",
      "Vierte el [VEGETABLE] y los trozos de [CARB], removiendo bien.",
      "Cubre con agua o caldo caliente, añade sal y cocina a fuego lento durante 20-25 minutos.",
      "Sirve caliente en un plato hondo."
    ]
  },
  {
    namePattern: "Plato de Pasta de [CARB] con Salsa de [VEGETABLE] y [TOPPING]",
    meal_type: "comida",
    difficulty: "facil",
    health: "saludable",
    diet_type: "vegetariano",
    allergens: ["gluten"],
    ingredients: [
      {
        category: "carb",
        options: [
          { name: "Pasta integral", quantity: 100, unit: "g" },
          { name: "Macarrones", quantity: 100, unit: "g" }
        ]
      },
      {
        category: "vegetable",
        options: [
          { name: "Tomate frito Hacendado", quantity: 120, unit: "g", diet_type: "vegano" },
          { name: "Tomate frito estilo casero", quantity: 120, unit: "g", diet_type: "vegano" },
          { name: "Salsa de tomate", quantity: 120, unit: "g", diet_type: "vegano" }
        ]
      },
      {
        category: "topping",
        options: [
          { name: "Queso rallado", quantity: 30, unit: "g", allergens: ["lactosa"], diet_type: "vegetariano" },
          { name: "Atún en aceite", quantity: 80, unit: "g", allergens: ["pescado"], diet_type: "pescetariano" },
          { name: "Champiñones", quantity: 50, unit: "g", diet_type: "vegano" }
        ]
      },
      {
        category: "oil",
        options: [
          { name: "Aceite de oliva", quantity: 8, unit: "ml", diet_type: "vegano" }
        ]
      }
    ],
    instructions: [
      "Cuece la [CARB] en abundante agua hirviendo con sal siguiendo las instrucciones del paquete. Escurre.",
      "En una sartén, calienta el [OIL] y saltea los champiñones o el [TOPPING] si es necesario.",
      "Vierte la salsa de [VEGETABLE] en la sartén y calienta a fuego lento.",
      "Mezcla la pasta escurrida con la salsa caliente.",
      "Sirve espolvoreando el [TOPPING] por encima y una pizca de orégano."
    ]
  },
  {
    namePattern: "Arroz meloso con [PROTEIN] y [VEGETABLE]",
    meal_type: "comida",
    difficulty: "intermedia",
    health: "saludable",
    diet_type: "omnivoro",
    allergens: [],
    ingredients: [
      {
        category: "protein",
        options: [
          { name: "Pechuga de pollo", quantity: 150, unit: "g", diet_type: "omnivoro" },
          { name: "Tofu firme", quantity: 120, unit: "g", diet_type: "vegano" }
        ]
      },
      {
        category: "vegetable",
        options: [
          { name: "Cebolla", quantity: 0.5, unit: "unidad", diet_type: "vegano" },
          { name: "Champiñones", quantity: 100, unit: "g", diet_type: "vegano" }
        ]
      },
      {
        category: "carb",
        options: [
          { name: "Arroz redondo", quantity: 80, unit: "g", diet_type: "vegano" }
        ]
      },
      {
        category: "oil",
        options: [
          { name: "Aceite de oliva", quantity: 10, unit: "ml", diet_type: "vegano" }
        ]
      }
    ],
    instructions: [
      "Lava y corta el [VEGETABLE] y la [PROTEIN] en trozos pequeños.",
      "En una sartén honda, calienta el [OIL] y dora la proteína.",
      "Añade la verdura y sofríe todo junto durante 5 minutos.",
      "Agrega el [CARB] y remueve para sellarlo.",
      "Vierte agua caliente (el triple del volumen del arroz) y cuece a fuego medio durante 15 minutos, removiendo ocasionalmente.",
      "Deja reposar 2 minutos y sirve meloso."
    ]
  },
  {
    namePattern: "Potaje de lentejas estofadas con [VEGETABLE] y [PROTEIN]",
    meal_type: "comida",
    difficulty: "intermedia",
    health: "saludable",
    diet_type: "omnivoro",
    allergens: [],
    ingredients: [
      {
        category: "vegetable",
        options: [
          { name: "Zanahoria", quantity: 1, unit: "unidad", diet_type: "vegano" },
          { name: "Patata", quantity: 1, unit: "unidad", diet_type: "vegano" }
        ]
      },
      {
        category: "protein",
        options: [
          { name: "Pechuga de pollo", quantity: 150, unit: "g", diet_type: "omnivoro" },
          { name: "Lentejas cocidas", quantity: 200, unit: "g", diet_type: "vegano" }
        ]
      },
      {
        category: "base",
        options: [
          { name: "Cebolla", quantity: 0.5, unit: "unidad", diet_type: "vegano" },
          { name: "Tomate triturado", quantity: 80, unit: "g", diet_type: "vegano" }
        ]
      },
      {
        category: "oil",
        options: [
          { name: "Aceite de oliva", quantity: 12, unit: "ml", diet_type: "vegano" }
        ]
      }
    ],
    instructions: [
      "Trocea finamente la [BASE] y la [VEGETABLE].",
      "En una olla mediana, calienta el [OIL] y sofríe la cebolla hasta que esté tierna.",
      "Añade el tomate y la [PROTEIN], sellando bien.",
      "Agrega los trozos de [VEGETABLE] y las lentejas.",
      "Cubre con agua, añade sal y cocina a fuego medio-bajo durante 25 minutos.",
      "Sirve bien caliente."
    ]
  },
  {
    namePattern: "Crema templada de [VEGETABLE] con guarnición de [TOPPING]",
    meal_type: "comida",
    difficulty: "facil",
    health: "saludable",
    diet_type: "vegetariano",
    allergens: ["lactosa"],
    ingredients: [
      {
        category: "vegetable",
        options: [
          { name: "Calabaza", quantity: 300, unit: "g", diet_type: "vegano" },
          { name: "Calabacín", quantity: 200, unit: "g", diet_type: "vegano" }
        ]
      },
      {
        category: "topping",
        options: [
          { name: "Queso fresco", quantity: 50, unit: "g", allergens: ["lactosa"], diet_type: "vegetariano" },
          { name: "Huevo cocido", quantity: 1, unit: "unidad", allergens: ["huevo"], diet_type: "vegetariano" }
        ]
      },
      {
        category: "aromatic",
        options: [
          { name: "Cebolla", quantity: 0.5, unit: "unidad", diet_type: "vegano" },
          { name: "Aceite de oliva", quantity: 10, unit: "ml", diet_type: "vegano" }
        ]
      }
    ],
    instructions: [
      "Pela y trocea la [VEGETABLE] y la cebolla.",
      "En una olla con un chorrito de aceite, rehoga la cebolla durante 5 minutos.",
      "Añade la [VEGETABLE] y cubre parcialmente con agua y sal.",
      "Cocina durante 15 minutos hasta que la verdura esté tierna y tritúrala.",
      "Sirve en un plato hondo coronando con el [TOPPING] troceado."
    ]
  },

  
  {
    namePattern: "[PROTEIN] a la Plancha con Ensalada de [VEGETABLE]",
    meal_type: "cena",
    difficulty: "facil",
    health: "saludable",
    diet_type: "omnivoro",
    allergens: [],
    ingredients: [
      {
        category: "protein",
        options: [
          { name: "Pechuga de pollo", quantity: 150, unit: "g", diet_type: "omnivoro" },
          { name: "Pescado blanco (merluza o bacalao)", quantity: 150, unit: "g", allergens: ["pescado"], diet_type: "pescetariano" },
          { name: "Tofu firme", quantity: 120, unit: "g", diet_type: "vegano" }
        ]
      },
      {
        category: "vegetable",
        options: [
          { name: "Lechuga iceberg", quantity: 80, unit: "g", diet_type: "vegano" },
          { name: "Tomate", quantity: 1, unit: "unidad", diet_type: "vegano" }
        ]
      },
      {
        category: "dressing",
        options: [
          { name: "Aceite de oliva", quantity: 10, unit: "ml", diet_type: "vegano" }
        ]
      }
    ],
    instructions: [
      "Lava y corta los ingredientes de la ensalada de [VEGETABLE]. Sazona y alinea con el [DRESSING].",
      "Pincela una plancha o sartén con unas gotas de [DRESSING] y calienta a fuego fuerte.",
      "Cocina el [PROTEIN] sazonado durante 3-4 minutos por lado hasta que esté bien cocido por dentro y dorado por fuera.",
      "Sirve en un plato llano la proteína recién hecha acompañada de la ensalada fresca."
    ]
  },
  {
    namePattern: "[PROTEIN] al Horno con [VEGETABLE]",
    meal_type: "cena",
    difficulty: "facil",
    health: "saludable",
    diet_type: "pescetariano",
    allergens: ["pescado"],
    ingredients: [
      {
        category: "protein",
        options: [
          { name: "Pescado blanco (merluza o bacalao)", quantity: 180, unit: "g", allergens: ["pescado"], diet_type: "pescetariano" },
          { name: "Pechuga de pollo", quantity: 180, unit: "g", diet_type: "omnivoro" }
        ]
      },
      {
        category: "vegetable",
        options: [
          { name: "Calabacín", quantity: 0.5, unit: "unidad", diet_type: "vegano" },
          { name: "Tomate", quantity: 1, unit: "unidad", diet_type: "vegano" }
        ]
      },
      {
        category: "oil",
        options: [
          { name: "Aceite de oliva", quantity: 10, unit: "ml", diet_type: "vegano" }
        ]
      }
    ],
    instructions: [
      "Precalienta el horno a 180ºC.",
      "Coloca en una bandeja apta para horno la [PROTEIN] y el [VEGETABLE] cortado en rodajas finas.",
      "Riega con un hilo de [OIL] y sazona con sal y tus hierbas aromáticas favoritas.",
      "Hornea durante 15-20 minutos hasta que la proteína esté en su punto y las verduras ligeramente doradas.",
      "Sirve caliente."
    ]
  },
  {
    namePattern: "Revuelto de [PROTEIN] con [VEGETABLE]",
    meal_type: "cena",
    difficulty: "facil",
    health: "saludable",
    diet_type: "vegetariano",
    allergens: ["huevo"],
    ingredients: [
      {
        category: "protein",
        options: [
          { name: "Huevos", quantity: 2, unit: "unidades", allergens: ["huevo"] }
        ]
      },
      {
        category: "vegetable",
        options: [
          { name: "Champiñones", quantity: 100, unit: "g", diet_type: "vegano" },
          { name: "Espinacas", quantity: 50, unit: "g", diet_type: "vegano" }
        ]
      },
      {
        category: "oil",
        options: [
          { name: "Aceite de oliva", quantity: 5, unit: "ml", diet_type: "vegano" }
        ]
      }
    ],
    instructions: [
      "Lava y corta el [VEGETABLE] en láminas o trozos medianos.",
      "En una sartén antiadherente, añade el [OIL] y saltea la verdura hasta que pierda su agua y esté tierna.",
      "Bate los [PROTEIN] con una pizca de sal.",
      "Vierte los huevos batidos sobre la verdura en la sartén y remueve constantemente a fuego lento hasta obtener una textura jugosa.",
      "Sirve de inmediato."
    ]
  },
  {
    namePattern: "Wok oriental de [VEGETABLE] con [PROTEIN]",
    meal_type: "cena",
    difficulty: "facil",
    health: "saludable",
    diet_type: "vegano",
    allergens: [],
    ingredients: [
      {
        category: "vegetable",
        options: [
          { name: "Pimiento verde", quantity: 0.5, unit: "unidad", diet_type: "vegano" },
          { name: "Cebolla", quantity: 0.5, unit: "unidad", diet_type: "vegano" }
        ]
      },
      {
        category: "protein",
        options: [
          { name: "Tofu firme", quantity: 150, unit: "g", diet_type: "vegano" },
          { name: "Pechuga de pollo", quantity: 150, unit: "g", diet_type: "omnivoro" }
        ]
      },
      {
        category: "oil",
        options: [
          { name: "Aceite de oliva", quantity: 10, unit: "ml", diet_type: "vegano" }
        ]
      }
    ],
    instructions: [
      "Corta el [VEGETABLE] y la [PROTEIN] en tiras finas.",
      "Calienta el [OIL] en un wok o sartén grande a fuego muy fuerte.",
      "Saltea la proteína durante 3 minutos y resérvala.",
      "Añade la verdura al wok caliente y saltea rápidamente para que quede al dente.",
      "Reincorpora la proteína y mezcla todo salteando un minuto más. Sirve caliente."
    ]
  },
  {
    namePattern: "Fajita de [CARB] rellena de [PROTEIN] y [VEGETABLE]",
    meal_type: "cena",
    difficulty: "facil",
    health: "saludable",
    diet_type: "omnivoro",
    allergens: ["gluten"],
    ingredients: [
      {
        category: "carb",
        options: [
          { name: "Pan de centeno", quantity: 1, unit: "unidad" }
        ]
      },
      {
        category: "protein",
        options: [
          { name: "Pechuga de pollo", quantity: 100, unit: "g", diet_type: "omnivoro" },
          { name: "Tofu firme", quantity: 100, unit: "g", diet_type: "vegano" }
        ]
      },
      {
        category: "vegetable",
        options: [
          { name: "Pimiento verde", quantity: 0.5, unit: "unidad", diet_type: "vegano" },
          { name: "Cebolla", quantity: 0.5, unit: "unidad", diet_type: "vegano" }
        ]
      },
      {
        category: "oil",
        options: [
          { name: "Aceite de oliva", quantity: 5, unit: "ml", diet_type: "vegano" }
        ]
      }
    ],
    instructions: [
      "Corta el [VEGETABLE] y la [PROTEIN] en tiras.",
      "Cocínalos en una sartén con el [OIL] hasta que estén dorados.",
      "Calienta el [CARB] ligeramente en una sartén limpia.",
      "Rellena con el salteado recién hecho, dobla y sirve."
    ]
  },
  {
    namePattern: "Sopa reconfortante de fideos con [PROTEIN]",
    meal_type: "cena",
    difficulty: "facil",
    health: "saludable",
    diet_type: "omnivoro",
    allergens: ["gluten"],
    ingredients: [
      {
        category: "protein",
        options: [
          { name: "Pechuga de pollo cocida y desmechada", quantity: 100, unit: "g", diet_type: "omnivoro" },
          { name: "Huevos", quantity: 1, unit: "unidad", allergens: ["huevo"], diet_type: "vegetariano" }
        ]
      },
      {
        category: "grain",
        options: [
          { name: "Pasta integral", quantity: 50, unit: "g", diet_type: "vegano" }
        ]
      },
      {
        category: "base",
        options: [
          { name: "Cebolla", quantity: 0.25, unit: "unidad", diet_type: "vegano" }
        ]
      }
    ],
    instructions: [
      "En una olla con agua hirviendo y sal, añade la cebolla cortada en trozos grandes para aromatizar.",
      "Añade la [GRAIN] y cuece durante 8-10 minutos.",
      "Incorpora la [PROTEIN] en hebras o picada y mezcla bien.",
      "Sirve en un plato hondo muy caliente."
    ]
  }
];



export function scoreProductMatch(productName: string, query: string, categoryName?: string): number {
  const normProduct = productName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  const normQuery = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

  
  if (!normProduct.includes(normQuery)) {
    return 0;
  }

  let score = 50; 

  
  
  const foodPrefixBlacklist = [
    { prefix: 'pan con', queryExclude: ['pan'] },
    { prefix: 'pan de', queryExclude: ['pan'] },
    { prefix: 'pan en', queryExclude: ['pan'] },
    { prefix: 'patatas con', queryExclude: ['patata', 'patatas'] },
    { prefix: 'patatas fritas con', queryExclude: ['patata', 'patatas'] },
    { prefix: 'patatas fritas en', queryExclude: ['patata', 'patatas'] },
    { prefix: 'atun con', queryExclude: ['atun'] },
    { prefix: 'atun en', queryExclude: ['atun'] },
    { prefix: 'galletas con', queryExclude: ['galleta', 'galletas'] },
    { prefix: 'galletas de', queryExclude: ['galleta', 'galletas'] },
    { prefix: 'sardinas en', queryExclude: ['sardina', 'sardinas'] },
    { prefix: 'salsa con', queryExclude: ['salsa'] }
  ];

  for (const item of foodPrefixBlacklist) {
    if (normProduct.startsWith(item.prefix)) {
      
      const matchesQuery = item.queryExclude.some(term => normQuery.includes(term));
      if (!matchesQuery) {
        
        return 0; 
      }
    }
  }

  
  if (normProduct.startsWith(normQuery)) {
    score += 100;
  }

  
  const queryIndex = normProduct.indexOf(normQuery);
  if (queryIndex > 0) {
    
    const prevText = normProduct.substring(0, queryIndex).trim();
    if (prevText.endsWith(' con') || prevText.endsWith(' en') || prevText.endsWith(' de sabor a') || prevText.endsWith(' con sabor a')) {
      score -= 30; 
    }
  }

  
  if (categoryName) {
    const normCat = categoryName.toLowerCase();
    if (normQuery.includes('leche') || normQuery.includes('queso') || normQuery.includes('yogur')) {
      if (normCat.includes('lacteos')) score += 50;
      else score -= 30;
    } else if (normQuery.includes('pan') || normQuery.includes('baguette')) {
      if (normCat.includes('panaderia') || normCat.includes('dulces')) score += 50;
      else score -= 30;
    } else if (normQuery.includes('aceite') || normQuery.includes('conserva') || normQuery.includes('atun')) {
      if (normCat.includes('aceite') || normCat.includes('conserva')) score += 50;
      else score -= 30;
    } else if (normQuery.includes('tomate') || normQuery.includes('cebolla') || normQuery.includes('patata') || normQuery.includes('lechuga')) {
      if (normCat.includes('fruta') || normCat.includes('verdura') || normCat.includes('conserva')) score += 50;
      else score -= 30;
    }
  }

  return Math.max(score, 1);
}


export async function generateRecipe(
  params: {
    meal_type?: 'desayuno' | 'comida' | 'cena';
    diet_type?: string;
    allergens?: string[];
    max_budget?: number;
    supermarket_id?: string;
    health?: 'saludable' | 'no saludable';
    difficulty?: 'facil' | 'intermedia' | 'dificil';
    pantry_items?: { nombre: string; cantidad: number; unidad: string }[];
  },
  supabaseSupermarket: SupabaseClient,
  supabaseKitchen?: SupabaseClient
): Promise<GeneratedRecipe | null> {
  const targetMeal = params.meal_type || 'comida';
  const targetDiet = params.diet_type || 'omnivoro';
  const excludedAllergens = (params.allergens || []).map(a => a.toLowerCase().trim());
  const maxBudget = params.max_budget || 999;
  const targetSupermarket = params.supermarket_id || 'todos';
  const targetHealth = params.health || 'saludable';
  const targetDifficulty = params.difficulty || 'facil';

  let attempts = 0;
  let template;
  let resolvedIngredients: GeneratedIngredient[] = [];
  let replacers: Record<string, string> = {};
  let recipeAllergensSet = new Set<string>();
  let recipeDiet = 'vegano';
  let recipeName = '';
  let recipeInstructions: string[] = [];

  const HIGH_CARB_KEYWORDS = ['pan', 'pasta', 'arroz', 'patata', 'azucar', 'garbanzos', 'harina', 'macarrones', 'viena', 'centeno', 'tostada', 'molde', 'baguette', 'dulce', 'chocolate'];

  while (attempts < 8) {
    attempts++;
    
    let templates = RECIPE_TEMPLATES.filter(t => t.meal_type === targetMeal);
    if (templates.length === 0) {
      templates = RECIPE_TEMPLATES.filter(t => t.meal_type === 'comida');
    }

    
    template = templates[Math.floor(Math.random() * templates.length)];
    
    
    resolvedIngredients = [];
    replacers = {};
    recipeAllergensSet = new Set<string>();
    recipeDiet = 'vegano'; 
    let failedToResolve = false;

    for (const section of template.ingredients) {
      let options = section.options.filter(opt => {
        const hasExcludedAllergen = (opt.allergens || []).some(a => excludedAllergens.includes(a.toLowerCase().trim()));
        if (hasExcludedAllergen) return false;
        
        if (targetDiet === 'vegano' && opt.diet_type !== 'vegano') return false;
        if (targetDiet === 'vegetariano' && opt.diet_type !== 'vegano' && opt.diet_type !== 'vegetariano') return false;
        if (targetDiet === 'pescetariano' && opt.diet_type === 'omnivoro') return false;
        if (targetDiet === 'sin_gluten' && (opt.allergens || []).map(a => a.toLowerCase()).includes('gluten')) return false;
        if (targetDiet === 'sin_lactosa' && (opt.allergens || []).map(a => a.toLowerCase()).includes('lactosa')) return false;
        if (targetDiet === 'keto' && HIGH_CARB_KEYWORDS.some(kw => opt.name.toLowerCase().includes(kw))) return false;
        if (targetDiet === 'paleo' && (
          HIGH_CARB_KEYWORDS.some(kw => opt.name.toLowerCase().includes(kw)) ||
          (opt.allergens || []).map(a => a.toLowerCase()).includes('lactosa') ||
          ['leche', 'queso', 'yogur'].some(kw => opt.name.toLowerCase().includes(kw))
        )) return false;
        
        return true;
      });

      if (options.length === 0) {
        options = section.options.filter(opt => {
          return !(opt.allergens || []).some(a => excludedAllergens.includes(a.toLowerCase().trim()));
        });
      }

      if (options.length === 0) {
        failedToResolve = true;
        break;
      }

      const selectedOpt = options[Math.floor(Math.random() * options.length)];
      
      resolvedIngredients.push({
        name: selectedOpt.name,
        quantity: selectedOpt.quantity,
        unit: selectedOpt.unit
      });

      if (selectedOpt.allergens) {
        selectedOpt.allergens.forEach(a => recipeAllergensSet.add(a));
      }

      const optDiet = selectedOpt.diet_type || 'vegano';
      if (targetDiet === 'omnivoro') {
        if (optDiet === 'omnivoro') {
          recipeDiet = 'omnivoro';
        } else if (optDiet === 'pescetariano' && recipeDiet !== 'omnivoro') {
          recipeDiet = 'pescetariano';
        } else if (optDiet === 'vegetariano' && recipeDiet !== 'omnivoro' && recipeDiet !== 'pescetariano') {
          recipeDiet = 'vegetariano';
        }
      } else {
        recipeDiet = targetDiet;
      }

      replacers[`[${section.category.toUpperCase()}]`] = selectedOpt.name.toLowerCase();
    }

    if (failedToResolve) {
      continue;
    }

    
    recipeName = template.namePattern;
    Object.entries(replacers).forEach(([key, val]) => {
      recipeName = recipeName.replace(key, val);
    });
    recipeName = recipeName.charAt(0).toUpperCase() + recipeName.slice(1);

    
    if (supabaseKitchen) {
      try {
        const { data: existing } = await supabaseKitchen
          .from('recipes')
          .select('id')
          .ilike('name', recipeName.trim());
        if (existing && existing.length > 0) {
          continue;
        }
      } catch (err) {
        console.error(err);
      }
    }

    recipeInstructions = template.instructions.map(inst => {
      let replaced = inst;
      Object.entries(replacers).forEach(([key, val]) => {
        replaced = replaced.replace(key, val);
      });
      return replaced;
    });

    break;
  }

  
  const supermarketsToQuery = targetSupermarket === 'todos' || targetSupermarket === 'cheapest'
    ? ['mercadona', 'eroski', 'dia', 'aldi', 'carrefour']
    : [targetSupermarket.toLowerCase()];

  const pricingComparison: Record<string, { total_cost: number; recipe_cost?: number; products: any[] }> = {};
  const pantryItems = params.pantry_items ? JSON.parse(JSON.stringify(params.pantry_items)) : [];

  for (const supermarketId of supermarketsToQuery) {
    let totalShoppingCost = 0;
    let totalRecipeCost = 0;
    const resolvedProducts: any[] = [];
    const currentPantry = JSON.parse(JSON.stringify(pantryItems));

    for (const ing of resolvedIngredients) {
      
      const { data: dbProducts, error } = await supabaseSupermarket
        .from('productos')
        .select('referencia_id, nombre, precio, supermercado_id, categoria_id, categorias(nombre)')
        .eq('supermercado_id', supermarketId)
        .ilike('nombre', `%${ing.name.split(' ')[0]}%`); 

      if (error || !dbProducts || dbProducts.length === 0) {
        
        totalShoppingCost += 0.60;
        totalRecipeCost += 0.60;
        resolvedProducts.push({
          ingredient_name: ing.name,
          product_name: `Estimado: ${ing.name}`,
          precio: 0.60,
          quantity: ing.quantity,
          unit: ing.unit,
          quantity_needed: ing.quantity,
          used_from_pantry: 0,
          supermercado: supermarketId,
          referencia_id: 'estimated'
        });
        continue;
      }

      
      const scored = dbProducts.map(p => {
        const score = scoreProductMatch(
          p.nombre, 
          ing.name, 
          Array.isArray(p.categorias) ? (p.categorias as any)[0]?.nombre : (p.categorias as any)?.nombre
        );
        return { product: p, score };
      }).sort((a, b) => b.score - a.score);

      const bestMatch = scored[0];
      if (!bestMatch || bestMatch.score === 0) {
        
        totalShoppingCost += 0.60;
        totalRecipeCost += 0.60;
        resolvedProducts.push({
          ingredient_name: ing.name,
          product_name: `Estimado: ${ing.name}`,
          precio: 0.60,
          quantity: ing.quantity,
          unit: ing.unit,
          quantity_needed: ing.quantity,
          used_from_pantry: 0,
          supermercado: supermarketId,
          referencia_id: 'estimated'
        });
        continue;
      }

      
      let quantityNeeded = ing.quantity;
      let usedFromPantry = 0;
      
      const matchingPantryItem = currentPantry.find((pi: any) => 
        pi.nombre.toLowerCase().includes(ing.name.toLowerCase()) ||
        ing.name.toLowerCase().includes(pi.nombre.toLowerCase())
      );
      if (matchingPantryItem && matchingPantryItem.cantidad > 0) {
        const available = Number(matchingPantryItem.cantidad);
        if (available >= quantityNeeded) {
          usedFromPantry = quantityNeeded;
          quantityNeeded = 0;
          matchingPantryItem.cantidad = available - usedFromPantry;
        } else {
          usedFromPantry = available;
          quantityNeeded = quantityNeeded - available;
          matchingPantryItem.cantidad = 0;
        }
      }

      const pPrice = Number(bestMatch.product.precio);
      let itemShoppingCost = 0;
      let itemRecipeCost = pPrice;

      
      if (ing.unit === 'rebanadas' || ing.unit === 'unidades' || ing.unit === 'unidad') {
        itemRecipeCost = (pPrice / 6) * ing.quantity;
      } else if (ing.unit === 'g') {
        itemRecipeCost = (pPrice / 500) * ing.quantity;
      } else if (ing.unit === 'ml') {
        itemRecipeCost = (pPrice / 1000) * ing.quantity;
      }

      
      if (quantityNeeded > 0) {
        if (ing.unit === 'rebanadas' || ing.unit === 'unidades' || ing.unit === 'unidad') {
          itemShoppingCost = (pPrice / 6) * quantityNeeded;
        } else if (ing.unit === 'g') {
          itemShoppingCost = (pPrice / 500) * quantityNeeded;
        } else if (ing.unit === 'ml') {
          itemShoppingCost = (pPrice / 1000) * quantityNeeded;
        }
      }

      totalShoppingCost += itemShoppingCost;
      totalRecipeCost += itemRecipeCost;

      resolvedProducts.push({
        ingredient_name: ing.name,
        product_name: bestMatch.product.nombre,
        precio: pPrice,
        computed_cost: Number(itemShoppingCost.toFixed(2)),
        total_recipe_cost: Number(itemRecipeCost.toFixed(2)),
        quantity: ing.quantity,
        unit: ing.unit,
        quantity_needed: quantityNeeded,
        used_from_pantry: usedFromPantry,
        supermercado: supermarketId,
        referencia_id: bestMatch.product.referencia_id
      });
    }

    pricingComparison[supermarketId] = {
      total_cost: Number(totalShoppingCost.toFixed(2)),
      recipe_cost: Number(totalRecipeCost.toFixed(2)),
      products: resolvedProducts
    };
  }

  
  let cheapestSupermarket = targetSupermarket;
  let estimatedCost = 0;
  let rawRecipeCost = 0;

  if (targetSupermarket === 'todos' || targetSupermarket === 'cheapest') {
    
    let minPrice = Infinity;
    Object.entries(pricingComparison).forEach(([sm, details]) => {
      if (details.total_cost < minPrice) {
        minPrice = details.total_cost;
        cheapestSupermarket = sm;
      }
    });
    estimatedCost = minPrice;
    rawRecipeCost = pricingComparison[cheapestSupermarket]?.recipe_cost || minPrice;
  } else {
    const smDetails = pricingComparison[targetSupermarket.toLowerCase()];
    estimatedCost = smDetails?.total_cost || 0.60 * resolvedIngredients.length;
    rawRecipeCost = smDetails?.recipe_cost || estimatedCost;
  }

  
  if (estimatedCost > maxBudget) {
    
    
    const scaleFactor = maxBudget / estimatedCost;
    if (scaleFactor >= 0.5) { 
      resolvedIngredients.forEach(ing => {
        ing.quantity = Number((ing.quantity * scaleFactor).toFixed(1));
      });
      estimatedCost = estimatedCost * scaleFactor;
      rawRecipeCost = rawRecipeCost * scaleFactor;
      
      Object.keys(pricingComparison).forEach(sm => {
        pricingComparison[sm].total_cost = Number((pricingComparison[sm].total_cost * scaleFactor).toFixed(2));
        if (pricingComparison[sm].recipe_cost) {
          pricingComparison[sm].recipe_cost = Number((pricingComparison[sm].recipe_cost! * scaleFactor).toFixed(2));
        }
        pricingComparison[sm].products.forEach(p => {
          p.quantity = Number((p.quantity * scaleFactor).toFixed(1));
          p.computed_cost = Number((p.computed_cost * scaleFactor).toFixed(2));
          if (p.total_recipe_cost) {
            p.total_recipe_cost = Number((p.total_recipe_cost * scaleFactor).toFixed(2));
          }
        });
      });
    } else {
      return null; 
    }
  }

  return {
    name: recipeName,
    meal_type: targetMeal,
    price: estimatedCost < 3.0 ? 'economica' : 'cara',
    difficulty: targetDifficulty,
    health: targetHealth,
    diet_type: recipeDiet,
    allergens: Array.from(recipeAllergensSet),
    instructions: recipeInstructions,
    ingredients: resolvedIngredients,
    supermarket_id: cheapestSupermarket,
    estimated_cost: Number(estimatedCost.toFixed(2)),
    recipe_cost: Number(rawRecipeCost.toFixed(2)),
    comparison: pricingComparison
  };
}


export async function generateWeeklyMenu(
  params: {
    weekly_budget: number;
    supermarket_id: string;
    diet_type: string;
    allergens: string[];
    health: 'saludable' | 'no saludable';
    difficulty: 'facil' | 'intermedia' | 'dificil';
    use_pantry: boolean;
    pantry_items: { nombre: string; cantidad: number; unidad: string }[];
    neural_network?: any;
    feature_keys?: string[];
    supabaseKitchen?: SupabaseClient;
  },
  supabaseSupermarket: SupabaseClient
): Promise<{
  menu: Record<string, Record<string, GeneratedRecipe>>;
  cheapest_supermarket: string;
  total_shopping_cost: number;
  total_recipe_cost: number;
  comparison: Record<string, { total_shopping_cost: number; total_recipe_cost: number }>;
}> {
  const { weekly_budget, supermarket_id, diet_type, allergens, health, difficulty, use_pantry, pantry_items, neural_network, feature_keys, supabaseKitchen } = params;
  
  
  const breakfastPromises = Array.from({ length: 10 }, () =>
    generateRecipe({
      meal_type: 'desayuno',
      diet_type,
      allergens,
      max_budget: 999,
      supermarket_id: 'todos',
      health,
      difficulty
    }, supabaseSupermarket, supabaseKitchen)
  );

  const lunchPromises = Array.from({ length: 10 }, () =>
    generateRecipe({
      meal_type: 'comida',
      diet_type,
      allergens,
      max_budget: 999,
      supermarket_id: 'todos',
      health,
      difficulty
    }, supabaseSupermarket, supabaseKitchen)
  );

  const dinnerPromises = Array.from({ length: 10 }, () =>
    generateRecipe({
      meal_type: 'cena',
      diet_type,
      allergens,
      max_budget: 999,
      supermarket_id: 'todos',
      health,
      difficulty
    }, supabaseSupermarket, supabaseKitchen)
  );

  const [rawBreakfasts, rawLunches, rawDinners] = await Promise.all([
    Promise.all(breakfastPromises),
    Promise.all(lunchPromises),
    Promise.all(dinnerPromises)
  ]);

  const breakfasts: GeneratedRecipe[] = [];
  rawBreakfasts.forEach(r => {
    if (r && !breakfasts.some(x => x.name.toLowerCase().trim() === r.name.toLowerCase().trim())) {
      breakfasts.push(r);
    }
  });

  const lunches: GeneratedRecipe[] = [];
  rawLunches.forEach(r => {
    if (r && !lunches.some(x => x.name.toLowerCase().trim() === r.name.toLowerCase().trim())) {
      lunches.push(r);
    }
  });

  const dinners: GeneratedRecipe[] = [];
  rawDinners.forEach(r => {
    if (r && !dinners.some(x => x.name.toLowerCase().trim() === r.name.toLowerCase().trim())) {
      dinners.push(r);
    }
  });

  if (breakfasts.length === 0 || lunches.length === 0 || dinners.length === 0) {
    throw new Error('No se pudieron generar suficientes recetas candidatas con los filtros de dieta y alérgenos provistos.');
  }

  
  const scoreRecipe = (recipe: GeneratedRecipe) => {
    if (!neural_network || !feature_keys) return 0.5;
    try {
      const inputs = NeuralNetwork.extractFeatures(recipe, feature_keys);
      return neural_network.predict(inputs);
    } catch {
      return 0.5;
    }
  };

  const scoredBreakfasts = breakfasts.map(r => ({ recipe: r, score: scoreRecipe(r) }));
  const scoredLunches = lunches.map(r => ({ recipe: r, score: scoreRecipe(r) }));
  const scoredDinners = dinners.map(r => ({ recipe: r, score: scoreRecipe(r) }));

  let bestMenu: { day: number; desayuno: GeneratedRecipe; comida: GeneratedRecipe; cena: GeneratedRecipe }[] = [];
  let bestTotalScore = -1;
  let bestPricingComparison: Record<string, { total_shopping_cost: number; total_recipe_cost: number; products: any[] }> = {};
  let bestCheapestSupermarket = 'mercadona';

  const supermarketsToQuery = supermarket_id === 'todos' || supermarket_id === 'cheapest'
    ? ['mercadona', 'eroski', 'dia', 'aldi', 'carrefour']
    : [supermarket_id.toLowerCase()];

  
  for (let iter = 0; iter < 300; iter++) {
    const tempMenu: { day: number; desayuno: GeneratedRecipe; comida: GeneratedRecipe; cena: GeneratedRecipe }[] = [];
    let tempScore = 0;
    
    const chosenBreakfasts = new Set<string>();
    const chosenLunches = new Set<string>();
    const chosenDinners = new Set<string>();

    for (let day = 1; day <= 7; day++) {
      const bPick = pickWeightedUnique(scoredBreakfasts, chosenBreakfasts);
      const lPick = pickWeightedUnique(scoredLunches, chosenLunches);
      const dPick = pickWeightedUnique(scoredDinners, chosenDinners);

      tempMenu.push({
        day,
        desayuno: bPick.recipe,
        comida: lPick.recipe,
        cena: dPick.recipe
      });
      tempScore += bPick.score + lPick.score + dPick.score;
    }

    const weeklyComparison: Record<string, { total_shopping_cost: number; total_recipe_cost: number; products: any[] }> = {};

    for (const smId of supermarketsToQuery) {
      const weeklyIngredients: Record<string, { name: string; quantity: number; unit: string }> = {};

      tempMenu.forEach(dayMenu => {
        const allIngs = [...dayMenu.desayuno.ingredients, ...dayMenu.comida.ingredients, ...dayMenu.cena.ingredients];
        allIngs.forEach(ing => {
          const key = ing.name.toLowerCase();
          if (!weeklyIngredients[key]) {
            weeklyIngredients[key] = {
              name: ing.name,
              quantity: 0,
              unit: ing.unit
            };
          }
          weeklyIngredients[key].quantity += ing.quantity;
        });
      });

      let shoppingCost = 0;
      let recipeCost = 0;
      const resolvedProducts: any[] = [];
      const currentPantry = use_pantry ? JSON.parse(JSON.stringify(pantry_items || [])) : [];

      for (const key in weeklyIngredients) {
        const ing = weeklyIngredients[key];
        
        const findProductInCandidates = (list: GeneratedRecipe[]) => {
          for (const r of list) {
            const comp = r.comparison?.[smId];
            if (comp) {
              const match = comp.products.find(p => p.ingredient_name.toLowerCase() === key);
              if (match && match.referencia_id !== 'estimated') {
                return match;
              }
            }
          }
          return null;
        };

        const matchedProduct = findProductInCandidates(breakfasts) || findProductInCandidates(lunches) || findProductInCandidates(dinners);
        const pPrice = matchedProduct ? Number(matchedProduct.precio) : 0.60;
        const pName = matchedProduct ? matchedProduct.product_name : `Estimado: ${ing.name}`;
        const pRef = matchedProduct ? matchedProduct.referencia_id : 'estimated';

        let quantityNeeded = ing.quantity;
        let usedFromPantry = 0;

        const matchingPantryItem = currentPantry.find((pi: any) => 
          pi.nombre.toLowerCase().includes(ing.name.toLowerCase()) ||
          ing.name.toLowerCase().includes(pi.nombre.toLowerCase())
        );

        if (matchingPantryItem && matchingPantryItem.cantidad > 0) {
          const available = Number(matchingPantryItem.cantidad);
          if (available >= quantityNeeded) {
            usedFromPantry = quantityNeeded;
            quantityNeeded = 0;
            matchingPantryItem.cantidad = available - usedFromPantry;
          } else {
            usedFromPantry = available;
            quantityNeeded = quantityNeeded - available;
            matchingPantryItem.cantidad = 0;
          }
        }

        let itemRecipeCost = pPrice;
        let itemShoppingCost = 0;

        if (ing.unit === 'rebanadas' || ing.unit === 'unidades' || ing.unit === 'unidad') {
          itemRecipeCost = (pPrice / 6) * ing.quantity;
          if (quantityNeeded > 0) itemShoppingCost = (pPrice / 6) * quantityNeeded;
        } else if (ing.unit === 'g') {
          itemRecipeCost = (pPrice / 500) * ing.quantity;
          if (quantityNeeded > 0) itemShoppingCost = (pPrice / 500) * quantityNeeded;
        } else if (ing.unit === 'ml') {
          itemRecipeCost = (pPrice / 1000) * ing.quantity;
          if (quantityNeeded > 0) itemShoppingCost = (pPrice / 1000) * quantityNeeded;
        }

        shoppingCost += itemShoppingCost;
        recipeCost += itemRecipeCost;

        resolvedProducts.push({
          ingredient_name: ing.name,
          product_name: pName,
          precio: pPrice,
          computed_cost: Number(itemShoppingCost.toFixed(2)),
          total_recipe_cost: Number(itemRecipeCost.toFixed(2)),
          quantity: ing.quantity,
          unit: ing.unit,
          quantity_needed: quantityNeeded,
          used_from_pantry: usedFromPantry,
          supermercado: smId,
          referencia_id: pRef
        });
      }

      weeklyComparison[smId] = {
        total_shopping_cost: Number(shoppingCost.toFixed(2)),
        total_recipe_cost: Number(recipeCost.toFixed(2)),
        products: resolvedProducts
      };
    }

    let tempCheapestSupermarket = 'mercadona';
    let tempMinShoppingCost = Infinity;
    Object.entries(weeklyComparison).forEach(([smId, details]) => {
      if (details.total_shopping_cost < tempMinShoppingCost) {
        tempMinShoppingCost = details.total_shopping_cost;
        tempCheapestSupermarket = smId;
      }
    });

    if (tempMinShoppingCost <= weekly_budget) {
      if (tempScore > bestTotalScore) {
        bestMenu = tempMenu;
        bestTotalScore = tempScore;
        bestPricingComparison = weeklyComparison;
        bestCheapestSupermarket = tempCheapestSupermarket;
      }
    } else {
      if (bestTotalScore === -1) {
        bestMenu = tempMenu;
        bestPricingComparison = weeklyComparison;
        bestCheapestSupermarket = tempCheapestSupermarket;
      }
    }
  }

  function pickWeighted(list: { recipe: GeneratedRecipe; score: number }[]) {
    const sorted = [...list].sort((a, b) => b.score - a.score);
    const threshold = Math.max(1, Math.floor(sorted.length * 0.3));
    if (Math.random() < 0.7) {
      return sorted[Math.floor(Math.random() * threshold)];
    }
    return sorted[Math.floor(Math.random() * sorted.length)];
  }

  function pickWeightedUnique(list: { recipe: GeneratedRecipe; score: number }[], chosenSet: Set<string>) {
    const available = list.filter(item => !chosenSet.has(item.recipe.name.toLowerCase().trim()));
    if (available.length === 0) {
      return pickWeighted(list);
    }
    const chosen = pickWeighted(available);
    chosenSet.add(chosen.recipe.name.toLowerCase().trim());
    return chosen;
  }
  const menuByDay: Record<string, Record<string, GeneratedRecipe>> = {};
  const dayNames = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];
  
  dayNames.forEach((dayName, idx) => {
    const dayItem = bestMenu[idx] || bestMenu[0];
    const mapRecipeForCheapest = (r: GeneratedRecipe) => {
      const smDetails = bestPricingComparison[bestCheapestSupermarket];
      const recipeProducts = r.ingredients.map(ing => {
        const found = smDetails.products.find(p => p.ingredient_name.toLowerCase() === ing.name.toLowerCase());
        return found ? {
          ingredient_name: ing.name,
          product_name: found.product_name,
          precio: found.precio,
          computed_cost: found.computed_cost,
          total_recipe_cost: found.total_recipe_cost,
          quantity: ing.quantity,
          unit: ing.unit,
          supermercado: bestCheapestSupermarket,
          referencia_id: found.referencia_id
        } : {
          ingredient_name: ing.name,
          product_name: `Estimado: ${ing.name}`,
          precio: 0.60,
          computed_cost: 0.60,
          total_recipe_cost: 0.60,
          quantity: ing.quantity,
          unit: ing.unit,
          supermercado: bestCheapestSupermarket,
          referencia_id: 'estimated'
        };
      });
      return {
        ...r,
        supermarket_id: bestCheapestSupermarket,
        estimated_cost: Number(recipeProducts.reduce((sum, p) => sum + (p.computed_cost || 0), 0).toFixed(2)),
        recipe_cost: Number(recipeProducts.reduce((sum, p) => sum + (p.total_recipe_cost || p.computed_cost || 0), 0).toFixed(2)),
        comparison: {
          [bestCheapestSupermarket]: {
            total_cost: Number(recipeProducts.reduce((sum, p) => sum + (p.computed_cost || 0), 0).toFixed(2)),
            products: recipeProducts
          }
        }
      };
    };

    menuByDay[dayName] = {
      desayuno: mapRecipeForCheapest(dayItem.desayuno),
      comida: mapRecipeForCheapest(dayItem.comida),
      cena: mapRecipeForCheapest(dayItem.cena)
    };
  });

  const finalComparison: Record<string, { total_shopping_cost: number; total_recipe_cost: number }> = {};
  Object.entries(bestPricingComparison).forEach(([smId, details]) => {
    finalComparison[smId] = {
      total_shopping_cost: details.total_shopping_cost,
      total_recipe_cost: details.total_recipe_cost
    };
  });

  return {
    menu: menuByDay,
    cheapest_supermarket: bestCheapestSupermarket,
    total_shopping_cost: bestPricingComparison[bestCheapestSupermarket]?.total_shopping_cost || 0,
    total_recipe_cost: bestPricingComparison[bestCheapestSupermarket]?.total_recipe_cost || 0,
    comparison: finalComparison
  };
}
