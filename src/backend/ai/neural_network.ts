export interface NetworkWeights {
  weightsInputHidden: number[][];
  weightsHiddenOutput: number[];
  biasHidden: number[];
  biasOutput: number;
  inputFeaturesList: string[];
}

export class NeuralNetwork {
  private inputSize: number;
  private hiddenSize: number;

  private weightsInputHidden: number[][];
  private weightsHiddenOutput: number[];
  private biasHidden: number[];
  private biasOutput: number;

  private learningRate: number = 0.1;
  private inputFeaturesList: string[] = [];

  constructor(inputFeatures: string[], hiddenSize: number = 12) {
    this.inputFeaturesList = inputFeatures;
    this.inputSize = inputFeatures.length;
    this.hiddenSize = hiddenSize;

    // Initialize weights and biases with small random values between -0.5 and 0.5
    this.weightsInputHidden = Array.from({ length: this.inputSize }, () =>
      Array.from({ length: this.hiddenSize }, () => Math.random() - 0.5)
    );
    this.weightsHiddenOutput = Array.from({ length: this.hiddenSize }, () => Math.random() - 0.5);
    this.biasHidden = Array.from({ length: this.hiddenSize }, () => Math.random() - 0.5);
    this.biasOutput = Math.random() - 0.5;
  }

  // Sigmoid activation function
  private sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
  }

  // Derivative of sigmoid
  private sigmoidDerivative(y: number): number {
    return y * (1 - y);
  }

  // Extract features from a recipe into a numerical vector
  public static extractFeatures(recipe: any, featuresList: string[]): number[] {
    const vector = Array(featuresList.length).fill(0);
    
    // Helper to set binary feature
    const setFeature = (featName: string, val: number = 1) => {
      const idx = featuresList.indexOf(featName);
      if (idx !== -1) vector[idx] = val;
    };

    // Meal Type
    setFeature(`meal_type:${recipe.meal_type}`);

    // Difficulty
    setFeature(`difficulty:${recipe.difficulty}`);

    // Health
    setFeature(`health:${recipe.health}`);

    // Price
    setFeature(`price:${recipe.price}`);

    // Diet Type
    setFeature(`diet_type:${recipe.diet_type}`);

    // Allergens
    if (recipe.allergens && Array.isArray(recipe.allergens)) {
      recipe.allergens.forEach((a: string) => {
        setFeature(`allergen:${a.toLowerCase().trim()}`);
      });
    }

    // Ingredients analysis (keywords)
    const ingNames = (recipe.ingredients || []).map((i: any) => i.name.toLowerCase().trim()).join(' ');
    
    const keywords = ['pollo', 'ternera', 'cerdo', 'carne', 'pescado', 'atun', 'salmon', 'queso', 'leche', 'huevo', 'arroz', 'pasta', 'harina', 'cebolla', 'tomate', 'patata', 'verdura', 'chocolate', 'azucar'];
    keywords.forEach(kw => {
      if (ingNames.includes(kw)) {
        setFeature(`keyword:${kw}`);
      }
    });

    return vector;
  }

  // Forward propagation
  public forward(inputs: number[]): { hiddenOutputs: number[]; output: number } {
    // Input -> Hidden
    const hiddenOutputs = Array(this.hiddenSize).fill(0);
    for (let j = 0; j < this.hiddenSize; j++) {
      let sum = this.biasHidden[j];
      for (let i = 0; i < this.inputSize; i++) {
        sum += inputs[i] * this.weightsInputHidden[i][j];
      }
      hiddenOutputs[j] = this.sigmoid(sum);
    }

    // Hidden -> Output
    let outputSum = this.biasOutput;
    for (let j = 0; j < this.hiddenSize; j++) {
      outputSum += hiddenOutputs[j] * this.weightsHiddenOutput[j];
    }
    const output = this.sigmoid(outputSum);

    return { hiddenOutputs, output };
  }

  // Predict method
  public predict(inputs: number[]): number {
    return this.forward(inputs).output;
  }

  // Backward propagation & weight update (Single Step)
  public backward(inputs: number[], target: number, learningRate: number): number {
    const { hiddenOutputs, output } = this.forward(inputs);

    // Calculate output error and delta
    const outputError = target - output;
    const outputDelta = outputError * this.sigmoidDerivative(output);

    // Calculate hidden errors and deltas
    const hiddenDeltas = Array(this.hiddenSize).fill(0);
    for (let j = 0; j < this.hiddenSize; j++) {
      const error = outputDelta * this.weightsHiddenOutput[j];
      hiddenDeltas[j] = error * this.sigmoidDerivative(hiddenOutputs[j]);
    }

    // Update weights and biases (Gradient Descent)
    // Hidden -> Output
    for (let j = 0; j < this.hiddenSize; j++) {
      this.weightsHiddenOutput[j] += learningRate * outputDelta * hiddenOutputs[j];
    }
    this.biasOutput += learningRate * outputDelta;

    // Input -> Hidden
    for (let i = 0; i < this.inputSize; i++) {
      for (let j = 0; j < this.hiddenSize; j++) {
        this.weightsInputHidden[i][j] += learningRate * hiddenDeltas[j] * inputs[i];
      }
    }
    for (let j = 0; j < this.hiddenSize; j++) {
      this.biasHidden[j] += learningRate * hiddenDeltas[j];
    }

    // Return Squared Error for loss tracking
    return 0.5 * (outputError * outputError);
  }

  // Train the network over multiple epochs
  public train(
    dataset: Array<{ inputs: number[]; target: number }>,
    epochs: number = 1000,
    learningRate: number = 0.1,
    onEpoch?: (epoch: number, avgLoss: number) => void
  ): { finalLoss: number } {
    this.learningRate = learningRate;
    let lastLoss = 0;

    for (let epoch = 1; epoch <= epochs; epoch++) {
      let totalLoss = 0;
      
      // Shuffle dataset to improve generalization
      const shuffled = [...dataset].sort(() => Math.random() - 0.5);

      for (const item of shuffled) {
        const loss = this.backward(item.inputs, item.target, this.learningRate);
        totalLoss += loss;
      }

      const avgLoss = totalLoss / dataset.length;
      lastLoss = avgLoss;

      if (onEpoch && (epoch % 50 === 0 || epoch === 1 || epoch === epochs)) {
        onEpoch(epoch, avgLoss);
      }
    }

    return { finalLoss: lastLoss };
  }

  // Export weights and structure to a JSON object
  public export(): NetworkWeights {
    return {
      weightsInputHidden: this.weightsInputHidden,
      weightsHiddenOutput: this.weightsHiddenOutput,
      biasHidden: this.biasHidden,
      biasOutput: this.biasOutput,
      inputFeaturesList: this.inputFeaturesList,
    };
  }

  // Import weights and structure from a JSON object
  public import(data: NetworkWeights): void {
    this.weightsInputHidden = data.weightsInputHidden;
    this.weightsHiddenOutput = data.weightsHiddenOutput;
    this.biasHidden = data.biasHidden;
    this.biasOutput = data.biasOutput;
    this.inputFeaturesList = data.inputFeaturesList;
    this.inputSize = data.inputFeaturesList.length;
    this.hiddenSize = data.biasHidden.length;
  }
}
