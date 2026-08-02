import { TrendingDown, RotateCw, Gauge, Brain } from 'lucide-react';

interface AITrainerCardProps {
  modelStatus: any;
  epochs: number;
  setEpochs: (val: number) => void;
  learningRate: number;
  setLearningRate: (val: number) => void;
  isTraining: boolean;
  handleTrain: () => void;
  lossHistory: number[];
}

export default function AITrainerCard({
  modelStatus,
  epochs,
  setEpochs,
  learningRate,
  setLearningRate,
  isTraining,
  handleTrain,
  lossHistory
}: AITrainerCardProps) {
  const getLossSvgPoints = () => {
    if (lossHistory.length === 0) return '';
    const width = 360;
    const height = 100;
    const maxLoss = 0.5;
    const minLoss = 0.0;
    return lossHistory.map((val, idx) => {
      const x = (idx / (lossHistory.length - 1)) * width;
      const y = height - ((val - minLoss) / (maxLoss - minLoss)) * height;
      return `${x},${y}`;
    }).join(' ');
  };

  return (
    <div className="glass-card">
      <h2 className="card-title">
        <Brain size={24} style={{ color: '#a78bfa' }} />
        Estado del Cerebro IA
      </h2>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <span className="form-label" style={{ margin: 0 }}>Estado del Modelo:</span>
        {modelStatus?.trained ? (
          <span className="status-badge trained">
            <span className="pulse-dot" style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
            Entrenado
          </span>
        ) : (
          <span className="status-badge untrained">
            <span className="pulse-dot" style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }}></span>
            Sin Entrenar
          </span>
        )}
      </div>

      {modelStatus?.trained && (
        <div className="metrics-row">
          <div className="metric-box">
            <div className="metric-value">{modelStatus.metrics?.recipeCount}</div>
            <div className="metric-label">Recetas Usadas</div>
          </div>
          <div className="metric-box">
            <div className="metric-value" style={{ color: '#c084fc' }}>{modelStatus.metrics?.finalLoss}</div>
            <div className="metric-label">Pérdida (Loss)</div>
          </div>
        </div>
      )}

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', margin: '0 0 1rem 0', color: '#fff' }}>Hiperparámetros de Entrenamiento</h3>
        
        <div className="form-group">
          <label className="form-label">Épocas de Entrenamiento ({epochs})</label>
          <input 
            type="range" 
            min={100} 
            max={5000} 
            step={100}
            value={epochs} 
            onChange={(e) => setEpochs(Number(e.target.value))}
            className="form-control"
            style={{ padding: 0, height: 8, cursor: 'pointer' }}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Tasa de Aprendizaje / Learning Rate ({learningRate})</label>
          <select 
            value={learningRate} 
            onChange={(e) => setLearningRate(Number(e.target.value))}
            className="form-select"
          >
            <option value={0.01}>0.01 (Lento pero Preciso)</option>
            <option value={0.05}>0.05 (Equilibrado)</option>
            <option value={0.1}>0.10 (Rápido)</option>
            <option value={0.2}>0.20 (Muy Rápido)</option>
          </select>
        </div>

        <button 
          onClick={handleTrain} 
          disabled={isTraining} 
          className="btn-primary"
          style={{ marginTop: '1.5rem' }}
        >
          {isTraining ? (
            <>
              <RotateCw size={18} className="spinner" />
              Entrenando Red Neuronal...
            </>
          ) : (
            <>
              <Gauge size={18} />
              Entrenar Modelo con la Base de Datos
            </>
          )}
        </button>
      </div>

      {lossHistory.length > 0 && (
        <div className="chart-container">
          <div className="chart-header">
            <span className="chart-title">
              <TrendingDown size={14} style={{ color: '#a78bfa' }} />
              Curva de Pérdida del Entrenamiento
            </span>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Último Loss: {modelStatus.metrics?.finalLoss}</span>
          </div>
          <svg viewBox="0 0 360 100" style={{ width: '100%', height: 100 }}>
            <path d={getLossSvgPoints() ? `M ${getLossSvgPoints()}` : ''} />
          </svg>
        </div>
      )}
    </div>
  );
}
