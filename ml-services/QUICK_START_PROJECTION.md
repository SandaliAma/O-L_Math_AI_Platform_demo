# Quick Start: Adaptive Learning Projection System

## Prerequisites

1. **Python 3.8+** installed
2. **Trained DKT Model** (`dkt_trained_model.keras`) in `ml-services/` directory
3. **Dependencies** installed

## Installation

```bash
cd ml-services
pip install -r requirements.txt
```

## Run Projection

### Option 1: Complete System (Recommended)

```bash
python run_projection.py
```

This will:
- Run simulation (100 students, 50 sessions)
- Generate `simulation_report.json`
- Create all visualizations
- Generate markdown report

### Option 2: Step by Step

```python
# 1. Run simulation
from simulation_projection import AdaptiveLearningSimulation

simulation = AdaptiveLearningSimulation(
    model_path='dkt_trained_model.keras',
    target_topic='G11_16',
    target_mastery=0.85,
    num_students=100,
    num_sessions=50
)
simulation.run_simulation()
simulation.generate_report('simulation_report.json')

# 2. Generate visualizations
from visualize_projection import ProjectionVisualizer

visualizer = ProjectionVisualizer('simulation_report.json')
visualizer.generate_all_visualizations()
```

## Output Files

After running, you'll get:

1. **simulation_report.json** - Complete simulation data
2. **learning_curves.png** - Mastery progression over time
3. **kpi_comparison.png** - Side-by-side KPI comparison
4. **improvement_metrics.png** - Improvement percentages
5. **projection_summary.md** - Markdown report

## Expected Results

### Learning Gain
- **Baseline**: ~0.35-0.45 (35-45%)
- **DKT**: ~0.45-0.55 (45-55%)
- **Improvement**: 20-30% higher

### Efficiency
- **Baseline**: ~150-200 attempts per mastery point
- **DKT**: ~120-160 attempts per mastery point
- **Reduction**: 15-25% fewer attempts

### XAI Impact
- **Engagement Boost**: +15% (DKT+XAI vs DKT)
- **Anxiety Reduction**: +10% additional reduction

## Troubleshooting

### Model Not Found
```
⚠ Model not found at dkt_trained_model.keras, using fallback
```
**Solution**: Place the trained model in `ml-services/` directory. Simulation will still run with fallback.

### Import Errors
```
ModuleNotFoundError: No module named 'tensorflow'
```
**Solution**: Install dependencies:
```bash
pip install -r requirements.txt
```

### Memory Issues
If simulation is too slow or crashes:
- Reduce `num_students` (e.g., 50 instead of 100)
- Reduce `num_sessions` (e.g., 25 instead of 50)

## Customization

### Change Parameters

Edit `run_projection.py` or create your own script:

```python
simulation = AdaptiveLearningSimulation(
    model_path='dkt_trained_model.keras',
    target_topic='G10_14',      # Different topic
    target_mastery=0.80,         # Different target
    num_students=200,            # More students
    num_sessions=100             # More sessions
)
```

### Test XAI Service

```python
from xai_service import xai_service

student = {
    'student_id': 'S001',
    'anxiety_level': 0.5,
    'history': []
}

question = {
    'question_id': 'Q001',
    'topic_id': 16,
    'topic_name': 'Geometric Progressions',
    'difficulty': 1.2
}

knowledge_vector = np.array([0.3] * 100)  # 100 skills
knowledge_vector[16] = 0.25  # Target topic mastery

explanation = xai_service.explain_recommendation(
    student, question, knowledge_vector, 0.65
)

print(explanation['explanation'])
```

## Next Steps

1. Review `simulation_report.json` for detailed data
2. Check visualizations in generated PNG files
3. Read `projection_summary.md` for formatted report
4. Use results for research papers or grant proposals

## Support

For detailed documentation, see `PROJECTION_SYSTEM_README.md`

