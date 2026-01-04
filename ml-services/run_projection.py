"""
Main script to run the complete Adaptive Learning Projection System
"""

import os
import sys
from simulation_projection import AdaptiveLearningSimulation
from visualize_projection import ProjectionVisualizer

def main():
    """Run complete projection system"""
    print("\n" + "="*70)
    print("ADAPTIVE LEARNING OUTCOME PROJECTION SYSTEM")
    print("="*70)
    print("\nThis system will:")
    print("1. Simulate 100 students over 50 learning sessions")
    print("2. Compare DKT Adaptive vs Baseline Static learning")
    print("3. Evaluate XAI impact on engagement and anxiety")
    print("4. Generate comprehensive reports and visualizations")
    print("\n" + "="*70 + "\n")
    
    # Check if model exists
    model_path = 'dkt_trained_model.keras'
    if not os.path.exists(model_path):
        print(f"⚠ Warning: Model file '{model_path}' not found.")
        print("   Simulation will use fallback knowledge-based recommendations.")
        print("   For best results, ensure the trained model is available.\n")
    
    # Initialize and run simulation
    print("Starting simulation...\n")
    simulation = AdaptiveLearningSimulation(
        model_path=model_path,
        target_topic='G11_16',
        target_mastery=0.85,
        num_students=100,
        num_sessions=50
    )
    
    # Run simulation
    simulation.run_simulation()
    
    # Generate report
    report_path = 'simulation_report.json'
    simulation.generate_report(report_path)
    
    # Generate visualizations
    print("\n" + "="*70)
    print("GENERATING VISUALIZATIONS")
    print("="*70 + "\n")
    
    visualizer = ProjectionVisualizer(report_path)
    visualizer.generate_all_visualizations()
    
    print("\n" + "="*70)
    print("PROJECTION COMPLETE!")
    print("="*70)
    print("\nGenerated files:")
    print(f"  - {report_path}")
    print("  - learning_curves.png")
    print("  - kpi_comparison.png")
    print("  - improvement_metrics.png")
    print("  - projection_summary.md")
    print("\n" + "="*70 + "\n")

if __name__ == '__main__':
    main()

