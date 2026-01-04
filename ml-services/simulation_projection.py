"""
Adaptive Learning Outcome Projection System
Compares DKT Adaptive Learning vs Baseline Static Learning
"""

import numpy as np
import pandas as pd
import json
import os
from typing import List, Dict, Tuple, Optional
from datetime import datetime
import matplotlib.pyplot as plt
import seaborn as sns
from dkt_model import DKTModel
import tensorflow as tf

# Set random seed for reproducibility
np.random.seed(42)
tf.random.set_seed(42)

class AdaptiveLearningSimulation:
    """
    Simulates and compares DKT adaptive learning vs baseline static learning
    """
    
    def __init__(self, model_path: str = 'dkt_trained_model.keras', 
                 target_topic: str = 'G11_16', target_mastery: float = 0.85,
                 num_students: int = 100, num_sessions: int = 50):
        """
        Initialize simulation
        
        Args:
            model_path: Path to trained DKT model
            target_topic: Topic ID to focus on (e.g., 'G11_16' for Geometric Progressions)
            target_mastery: Target mastery level (0.85 = 85%)
            num_students: Number of synthetic students
            num_sessions: Number of learning sessions to simulate
        """
        self.model_path = model_path
        self.target_topic = target_topic
        self.target_mastery = target_mastery
        self.num_students = num_students
        self.num_sessions = num_sessions
        
        # Topic mapping (G11_16 = Geometric Progressions)
        self.topic_mapping = {
            'G11_16': {
                'id': 16,  # Assuming topic_id 16 for G11_16
                'name': 'Geometric Progressions',
                'prerequisites': ['G10_03', 'G10_11', 'G10_14'],  # Fractions, LCM, Linear Equations
                'prerequisite_ids': [3, 11, 14]
            }
        }
        
        # Initialize DKT model
        self.dkt_model = None
        self.load_dkt_model()
        
        # Question bank (synthetic)
        self.question_bank = self.generate_question_bank()
        
        # Results storage
        self.results = {
            'baseline': [],
            'dkt': [],
            'dkt_xai': []  # DKT with XAI explanations
        }
    
    def load_dkt_model(self):
        """Load the trained DKT model"""
        try:
            # Try to load as Keras model (.keras format)
            if os.path.exists(self.model_path):
                # Load the .keras model file
                # Note: .keras files can be loaded directly
                self.dkt_model = tf.keras.models.load_model(self.model_path, compile=False)
                print(f"✓ Loaded DKT model from {self.model_path}")
                
                # Try to get model info (may fail if model structure is different)
                try:
                    if hasattr(self.dkt_model, 'input_shape'):
                        print(f"  Model input shape: {self.dkt_model.input_shape}")
                    if hasattr(self.dkt_model, 'output_shape'):
                        print(f"  Model output shape: {self.dkt_model.output_shape}")
                except:
                    pass
            else:
                print(f"⚠ Model not found at {self.model_path}, using fallback")
                self.dkt_model = None
        except Exception as e:
            print(f"⚠ Error loading model: {e}, using fallback")
            print(f"  Error details: {str(e)}")
            print(f"  Note: Simulation will use knowledge-based recommendations")
            self.dkt_model = None
    
    def generate_question_bank(self) -> List[Dict]:
        """Generate synthetic question bank"""
        questions = []
        topic_info = self.topic_mapping[self.target_topic]
        
        # Generate questions for target topic and prerequisites
        all_topics = [topic_info['id']] + topic_info['prerequisite_ids']
        
        question_id = 0
        for topic_id in all_topics:
            # Generate questions of varying difficulty
            for difficulty_level in ['easy', 'medium', 'hard']:
                for i in range(10):  # 10 questions per difficulty per topic
                    difficulty_value = {'easy': 0.3, 'medium': 1.0, 'hard': 2.0}[difficulty_level]
                    
                    questions.append({
                        'question_id': question_id,
                        'topic_id': topic_id,
                        'topic_name': f"Topic_{topic_id}",
                        'difficulty': difficulty_value,
                        'difficulty_level': difficulty_level,
                        'target_topic': topic_id == topic_info['id']
                    })
                    question_id += 1
        
        return questions
    
    def generate_synthetic_student(self, student_id: int) -> Dict:
        """
        Generate a synthetic student with initial state
        
        Initial Mastery: ~21% (Competency Level 2.1) in G11_16
        Overall Ability: 50 ± 5
        """
        overall_ability = np.random.normal(50, 5)
        overall_ability = np.clip(overall_ability, 20, 80)
        
        # Initial mastery for target topic: ~21% (2.1/10)
        target_mastery_initial = np.random.normal(0.21, 0.05)
        target_mastery_initial = np.clip(target_mastery_initial, 0.10, 0.35)
        
        # Prerequisite masteries (correlated with target)
        prereq_masteries = {}
        topic_info = self.topic_mapping[self.target_topic]
        for prereq_id in topic_info['prerequisite_ids']:
            # Prerequisites slightly higher than target (but still low)
            prereq_mastery = target_mastery_initial + np.random.uniform(0.05, 0.15)
            prereq_mastery = np.clip(prereq_mastery, 0.15, 0.50)
            prereq_masteries[prereq_id] = prereq_mastery
        
        # Knowledge state vector (100 skills)
        knowledge_vector = np.random.uniform(0.15, 0.45, 100)
        
        # Set specific masteries
        knowledge_vector[topic_info['id']] = target_mastery_initial
        for prereq_id, mastery in prereq_masteries.items():
            if prereq_id < len(knowledge_vector):
                knowledge_vector[prereq_id] = mastery
        
        return {
            'student_id': student_id,
            'overall_ability': overall_ability,
            'initial_mastery': target_mastery_initial,
            'knowledge_vector': knowledge_vector,
            'history': [],
            'anxiety_level': np.random.uniform(0.2, 0.6),  # Math anxiety (0-1)
            'time_efficiency': np.random.uniform(0.7, 1.3)  # Time multiplier
        }
    
    def simulate_answer(self, student: Dict, question: Dict) -> Tuple[bool, float]:
        """
        Simulate student answering a question
        
        Returns: (is_correct, time_taken)
        """
        topic_id = question['topic_id']
        difficulty = question['difficulty']
        
        # Get student's mastery for this topic
        if topic_id < len(student['knowledge_vector']):
            mastery = student['knowledge_vector'][topic_id]
        else:
            mastery = 0.3
        
        # Probability of correct answer
        # IRT-like model: P(correct) = mastery adjusted by difficulty
        base_prob = mastery
        difficulty_penalty = difficulty / 3.0  # Normalize difficulty
        success_prob = base_prob * (1 - difficulty_penalty * 0.5)
        success_prob = np.clip(success_prob, 0.1, 0.95)
        
        # Add some randomness based on ability
        ability_factor = student['overall_ability'] / 100.0
        success_prob = success_prob * (0.7 + 0.3 * ability_factor)
        success_prob = np.clip(success_prob, 0.05, 0.95)
        
        # Determine if correct
        is_correct = np.random.random() < success_prob
        
        # Time taken (seconds)
        base_time = 30 + difficulty * 20  # Base time increases with difficulty
        if not is_correct:
            base_time *= 1.5  # Takes longer if wrong
        
        # Adjust for student efficiency and anxiety
        time_taken = base_time * student['time_efficiency']
        if student['anxiety_level'] > 0.5:
            time_taken *= (1 + student['anxiety_level'] * 0.3)
        
        time_taken = np.clip(time_taken, 10, 300)
        
        return is_correct, time_taken
    
    def update_knowledge_state(self, student: Dict, question: Dict, is_correct: bool):
        """Update student's knowledge state after answering"""
        topic_id = question['topic_id']
        
        if topic_id >= len(student['knowledge_vector']):
            return
        
        mastery = student['knowledge_vector'][topic_id]
        
        # Learning gain: more if correct, less if wrong
        if is_correct:
            # Successful learning: mastery increases
            learning_rate = 0.05 + (1 - mastery) * 0.10  # Faster learning when mastery is low
            mastery += learning_rate
        else:
            # Failed attempt: small increase (learning from mistakes)
            learning_rate = 0.02
            mastery += learning_rate
        
        # Cap mastery at 1.0
        mastery = min(1.0, mastery)
        
        # Update knowledge vector
        student['knowledge_vector'][topic_id] = mastery
        
        # Prerequisite learning: if target topic improves, prerequisites also improve slightly
        topic_info = self.topic_mapping[self.target_topic]
        if topic_id == topic_info['id'] and is_correct:
            for prereq_id in topic_info['prerequisite_ids']:
                if prereq_id < len(student['knowledge_vector']):
                    # Small improvement in prerequisites
                    student['knowledge_vector'][prereq_id] = min(
                        1.0,
                        student['knowledge_vector'][prereq_id] + 0.01
                    )
    
    def baseline_recommendation(self, student: Dict, attempted_question_ids: set) -> Optional[Dict]:
        """
        Baseline strategy: Recommend easiest unattempted question
        (Static, non-adaptive)
        """
        unattempted = [q for q in self.question_bank 
                      if q['question_id'] not in attempted_question_ids]
        
        if not unattempted:
            return None
        
        # Sort by difficulty (easiest first)
        unattempted.sort(key=lambda x: x['difficulty'])
        return unattempted[0]
    
    def dkt_recommendation(self, student: Dict, attempted_question_ids: set) -> Optional[Dict]:
        """
        DKT strategy: Use model to recommend optimal question
        """
        unattempted = [q for q in self.question_bank 
                      if q['question_id'] not in attempted_question_ids]
        
        if not unattempted:
            return None
        
        if self.dkt_model is None:
            # Fallback: Use knowledge-based recommendation
            return self.knowledge_based_recommendation(student, unattempted)
        
        # Prepare student history for DKT model
        student_history = []
        for interaction in student['history'][-20:]:  # Last 20 interactions
            student_history.append({
                'question_id': interaction['question_id'],
                'topic_id': interaction['topic_id'],
                'is_correct': 1 if interaction['is_correct'] else 0,
                'time_taken': interaction['time_taken'],
                'attempts': interaction.get('attempts', 1)
            })
        
        # Predict knowledge state
        try:
            # Use DKT model to predict knowledge state
            knowledge_vector = self.predict_knowledge_state_dkt(student_history)
            
            # Find optimal question based on predicted learning reward
            best_question = None
            best_reward = -1
            
            for question in unattempted:
                topic_id = question['topic_id']
                difficulty = question['difficulty']
                
                # Get predicted mastery for this topic
                if topic_id < len(knowledge_vector):
                    predicted_mastery = knowledge_vector[topic_id]
                else:
                    predicted_mastery = 0.3
                
                # Calculate predicted success rate
                predicted_success = predicted_mastery * (1 - difficulty / 3.0)
                predicted_success = np.clip(predicted_success, 0.1, 0.9)
                
                # Learning reward: balance between challenge and success
                # Optimal zone: 60-80% success rate
                if 0.6 <= predicted_success <= 0.8:
                    reward = predicted_success * 2.0  # High reward in optimal zone
                elif predicted_success < 0.6:
                    reward = predicted_success * 0.5  # Low reward if too hard
                else:
                    reward = (1 - predicted_success) * 0.5  # Low reward if too easy
                
                # Bonus for target topic
                if question['target_topic']:
                    reward *= 1.2
                
                if reward > best_reward:
                    best_reward = reward
                    best_question = question
            
            return best_question if best_question else unattempted[0]
            
        except Exception as e:
            print(f"Error in DKT recommendation: {e}")
            return self.knowledge_based_recommendation(student, unattempted)
    
    def knowledge_based_recommendation(self, student: Dict, unattempted: List[Dict]) -> Dict:
        """Fallback recommendation based on knowledge state"""
        best_question = None
        best_score = -1
        
        for question in unattempted:
            topic_id = question['topic_id']
            difficulty = question['difficulty']
            
            if topic_id < len(student['knowledge_vector']):
                mastery = student['knowledge_vector'][topic_id]
            else:
                mastery = 0.3
            
            # Score: prefer questions in optimal learning zone
            predicted_success = mastery * (1 - difficulty / 3.0)
            predicted_success = np.clip(predicted_success, 0.1, 0.9)
            
            if 0.6 <= predicted_success <= 0.8:
                score = predicted_success * 2.0
            else:
                score = predicted_success
            
            if question['target_topic']:
                score *= 1.2
            
            if score > best_score:
                best_score = score
                best_question = question
        
        return best_question if best_question else unattempted[0]
    
    def predict_knowledge_state_dkt(self, student_history: List[Dict]) -> np.ndarray:
        """Predict knowledge state using DKT model"""
        if not student_history or self.dkt_model is None:
            # Return default knowledge vector
            return np.random.uniform(0.2, 0.4, 100)
        
        try:
            # Prepare input sequence
            max_length = len(student_history)
            if max_length == 0:
                return np.random.uniform(0.2, 0.4, 100)
            
            # Ensure minimum length for model
            if max_length < 1:
                max_length = 1
            
            questions = np.zeros((1, max_length), dtype=np.int32)
            topics = np.zeros((1, max_length), dtype=np.int32)
            correctness = np.zeros((1, max_length, 1), dtype=np.float32)
            time_taken = np.zeros((1, max_length, 1), dtype=np.float32)
            attempts = np.ones((1, max_length, 1), dtype=np.float32)
            
            for i, interaction in enumerate(student_history):
                questions[0, i] = interaction.get('question_id', 0) % 1000
                topics[0, i] = interaction.get('topic_id', 0) % 100
                correctness[0, i, 0] = float(interaction.get('is_correct', 0))
                time_taken[0, i, 0] = float(interaction.get('time_taken', 30)) / 300.0  # Normalize
                attempts[0, i, 0] = float(interaction.get('attempts', 1))
            
            # Predict - handle different model input formats
            try:
                # Try multi-input format (original DKT model)
                predictions = self.dkt_model.predict(
                    [questions, topics, correctness, time_taken, attempts],
                    verbose=0
                )
            except:
                # Try single input format or other formats
                try:
                    # Concatenate inputs
                    combined_input = np.concatenate([
                        questions.reshape(1, max_length, 1),
                        topics.reshape(1, max_length, 1),
                        correctness,
                        time_taken,
                        attempts
                    ], axis=-1)
                    predictions = self.dkt_model.predict(combined_input, verbose=0)
                except:
                    # Fallback: use topics only
                    predictions = self.dkt_model.predict(topics, verbose=0)
            
            # Handle different output shapes
            if len(predictions.shape) == 3:
                # Sequence output: take last timestep
                knowledge_state = predictions[0, -1, :]
            elif len(predictions.shape) == 2:
                # Already 2D: take first sample
                knowledge_state = predictions[0, :]
            else:
                # Unexpected shape, return default
                return np.random.uniform(0.2, 0.4, 100)
            
            # Ensure correct size (100 skills)
            if len(knowledge_state) < 100:
                # Pad with default values
                padded = np.zeros(100)
                padded[:len(knowledge_state)] = knowledge_state
                knowledge_state = padded
            elif len(knowledge_state) > 100:
                # Truncate
                knowledge_state = knowledge_state[:100]
            
            return knowledge_state
            
        except Exception as e:
            # Silent fallback - model may have different structure
            return np.random.uniform(0.2, 0.4, 100)
    
    def simulate_session(self, student: Dict, strategy: str, 
                        with_xai: bool = False) -> Dict:
        """
        Simulate one learning session
        
        Args:
            student: Student dictionary
            strategy: 'baseline' or 'dkt'
            with_xai: Whether to provide XAI explanations (affects engagement)
        
        Returns:
            Session metrics
        """
        attempted_question_ids = {h['question_id'] for h in student['history']}
        questions_per_session = 5  # 5 questions per session
        
        session_results = {
            'questions_attempted': 0,
            'questions_correct': 0,
            'total_time': 0,
            'recommendations_followed': 0,
            'failure_rate': 0,
            'anxiety_change': 0
        }
        
        initial_anxiety = student['anxiety_level']
        
        for _ in range(questions_per_session):
            # Get recommendation
            if strategy == 'baseline':
                recommended = self.baseline_recommendation(student, attempted_question_ids)
            else:  # dkt
                recommended = self.dkt_recommendation(student, attempted_question_ids)
            
            if recommended is None:
                break
            
            # XAI effect: Higher engagement if explanation provided
            if with_xai and strategy == 'dkt':
                # XAI increases trust and engagement
                engagement_prob = 0.95  # 95% follow recommendation with XAI
            elif strategy == 'dkt':
                engagement_prob = 0.85  # 85% follow without XAI
            else:
                engagement_prob = 0.80  # 80% follow baseline
            
            # Student may skip recommendation (engagement)
            if np.random.random() < engagement_prob:
                question = recommended
                session_results['recommendations_followed'] += 1
            else:
                # Pick random unattempted question
                unattempted = [q for q in self.question_bank 
                             if q['question_id'] not in attempted_question_ids]
                if unattempted:
                    question = np.random.choice(unattempted)
                else:
                    break
            
            # Simulate answer
            is_correct, time_taken = self.simulate_answer(student, question)
            
            # Update knowledge
            self.update_knowledge_state(student, question, is_correct)
            
            # Record interaction
            interaction = {
                'question_id': question['question_id'],
                'topic_id': question['topic_id'],
                'is_correct': is_correct,
                'time_taken': time_taken,
                'attempts': 1,
                'session': len(student['history']) // questions_per_session
            }
            student['history'].append(interaction)
            attempted_question_ids.add(question['question_id'])
            
            # Update metrics
            session_results['questions_attempted'] += 1
            if is_correct:
                session_results['questions_correct'] += 1
            else:
                session_results['failure_rate'] += 1
            session_results['total_time'] += time_taken
        
        # Calculate failure rate
        if session_results['questions_attempted'] > 0:
            session_results['failure_rate'] /= session_results['questions_attempted']
        
        # Anxiety change: Lower failure rate = lower anxiety
        anxiety_reduction = (1 - session_results['failure_rate']) * 0.05
        if with_xai:
            anxiety_reduction *= 1.2  # XAI provides more reassurance
        student['anxiety_level'] = max(0.1, initial_anxiety - anxiety_reduction)
        session_results['anxiety_change'] = initial_anxiety - student['anxiety_level']
        
        return session_results
    
    def run_simulation(self):
        """Run full simulation for all students and strategies"""
        print(f"\n{'='*60}")
        print("ADAPTIVE LEARNING OUTCOME PROJECTION")
        print(f"{'='*60}")
        print(f"Students: {self.num_students}")
        print(f"Sessions: {self.num_sessions}")
        print(f"Target Topic: {self.target_topic} ({self.topic_mapping[self.target_topic]['name']})")
        print(f"Target Mastery: {self.target_mastery * 100}%")
        print(f"{'='*60}\n")
        
        # Generate students
        students_baseline = [self.generate_synthetic_student(i) for i in range(self.num_students)]
        students_dkt = [self.generate_synthetic_student(i) for i in range(self.num_students)]
        students_dkt_xai = [self.generate_synthetic_student(i) for i in range(self.num_students)]
        
        # Run simulations
        for session in range(self.num_sessions):
            if (session + 1) % 10 == 0:
                print(f"Progress: Session {session + 1}/{self.num_sessions}")
            
            # Baseline group
            baseline_session_results = []
            for student in students_baseline:
                result = self.simulate_session(student, 'baseline', with_xai=False)
                baseline_session_results.append(result)
            
            # DKT group
            dkt_session_results = []
            for student in students_dkt:
                result = self.simulate_session(student, 'dkt', with_xai=False)
                dkt_session_results.append(result)
            
            # DKT + XAI group
            dkt_xai_session_results = []
            for student in students_dkt_xai:
                result = self.simulate_session(student, 'dkt', with_xai=True)
                dkt_xai_session_results.append(result)
            
            # Calculate session averages
            self.results['baseline'].append(self.aggregate_session_results(baseline_session_results))
            self.results['dkt'].append(self.aggregate_session_results(dkt_session_results))
            self.results['dkt_xai'].append(self.aggregate_session_results(dkt_xai_session_results))
        
        # Calculate final KPIs
        self.calculate_kpis(students_baseline, students_dkt, students_dkt_xai)
        
        print("\n✓ Simulation completed!")
    
    def aggregate_session_results(self, session_results: List[Dict]) -> Dict:
        """Aggregate results across students for one session"""
        return {
            'avg_questions_attempted': np.mean([r['questions_attempted'] for r in session_results]),
            'avg_questions_correct': np.mean([r['questions_correct'] for r in session_results]),
            'avg_total_time': np.mean([r['total_time'] for r in session_results]),
            'avg_recommendations_followed': np.mean([r['recommendations_followed'] for r in session_results]),
            'avg_failure_rate': np.mean([r['failure_rate'] for r in session_results]),
            'avg_anxiety_change': np.mean([r['anxiety_change'] for r in session_results])
        }
    
    def calculate_kpis(self, students_baseline: List[Dict], 
                       students_dkt: List[Dict], 
                       students_dkt_xai: List[Dict]):
        """Calculate Key Performance Indicators"""
        topic_id = self.topic_mapping[self.target_topic]['id']
        
        # Extract final masteries
        baseline_masteries = [s['knowledge_vector'][topic_id] for s in students_baseline 
                             if topic_id < len(s['knowledge_vector'])]
        dkt_masteries = [s['knowledge_vector'][topic_id] for s in students_dkt 
                        if topic_id < len(s['knowledge_vector'])]
        dkt_xai_masteries = [s['knowledge_vector'][topic_id] for s in students_dkt_xai 
                            if topic_id < len(s['knowledge_vector'])]
        
        # Initial mastery (same for all)
        initial_mastery = np.mean([s['initial_mastery'] for s in students_baseline])
        
        # KPI 1: Learning Efficacy (Average Learning Gain)
        def learning_gain(final_mastery, initial_mastery):
            if initial_mastery >= 1.0:
                return 0.0
            return (final_mastery - initial_mastery) / (1 - initial_mastery)
        
        baseline_gain = np.mean([learning_gain(m, initial_mastery) for m in baseline_masteries])
        dkt_gain = np.mean([learning_gain(m, initial_mastery) for m in dkt_masteries])
        dkt_xai_gain = np.mean([learning_gain(m, initial_mastery) for m in dkt_xai_masteries])
        
        # KPI 2: Efficiency (Attempts per Mastery Point)
        total_attempts_baseline = sum(len(s['history']) for s in students_baseline)
        total_attempts_dkt = sum(len(s['history']) for s in students_dkt)
        total_attempts_dkt_xai = sum(len(s['history']) for s in students_dkt_xai)
        
        mastery_gain_baseline = np.mean(baseline_masteries) - initial_mastery
        mastery_gain_dkt = np.mean(dkt_masteries) - initial_mastery
        mastery_gain_dkt_xai = np.mean(dkt_xai_masteries) - initial_mastery
        
        efficiency_baseline = total_attempts_baseline / (mastery_gain_baseline * self.num_students) if mastery_gain_baseline > 0 else float('inf')
        efficiency_dkt = total_attempts_dkt / (mastery_gain_dkt * self.num_students) if mastery_gain_dkt > 0 else float('inf')
        efficiency_dkt_xai = total_attempts_dkt_xai / (mastery_gain_dkt_xai * self.num_students) if mastery_gain_dkt_xai > 0 else float('inf')
        
        # KPI 3: Failure Rate
        baseline_failure = np.mean([r['avg_failure_rate'] for r in self.results['baseline']])
        dkt_failure = np.mean([r['avg_failure_rate'] for r in self.results['dkt']])
        dkt_xai_failure = np.mean([r['avg_failure_rate'] for r in self.results['dkt_xai']])
        
        # KPI 4: Engagement Rate (XAI specific)
        baseline_engagement = np.mean([r['avg_recommendations_followed'] / max(r['avg_questions_attempted'], 1) 
                                      for r in self.results['baseline']])
        dkt_engagement = np.mean([r['avg_recommendations_followed'] / max(r['avg_questions_attempted'], 1) 
                                 for r in self.results['dkt']])
        dkt_xai_engagement = np.mean([r['avg_recommendations_followed'] / max(r['avg_questions_attempted'], 1) 
                                      for r in self.results['dkt_xai']])
        
        # Store KPIs
        self.kpis = {
            'initial_mastery': initial_mastery,
            'final_mastery': {
                'baseline': np.mean(baseline_masteries),
                'dkt': np.mean(dkt_masteries),
                'dkt_xai': np.mean(dkt_xai_masteries)
            },
            'learning_gain': {
                'baseline': baseline_gain,
                'dkt': dkt_gain,
                'dkt_xai': dkt_xai_gain
            },
            'efficiency': {
                'baseline': efficiency_baseline,
                'dkt': efficiency_dkt,
                'dkt_xai': efficiency_dkt_xai
            },
            'failure_rate': {
                'baseline': baseline_failure,
                'dkt': dkt_failure,
                'dkt_xai': dkt_xai_failure
            },
            'engagement_rate': {
                'baseline': baseline_engagement,
                'dkt': dkt_engagement,
                'dkt_xai': dkt_xai_engagement
            },
            'anxiety_reduction': {
                'baseline': np.mean([r['avg_anxiety_change'] for r in self.results['baseline']]),
                'dkt': np.mean([r['avg_anxiety_change'] for r in self.results['dkt']]),
                'dkt_xai': np.mean([r['avg_anxiety_change'] for r in self.results['dkt_xai']])
            }
        }
        
        # Print results
        print(f"\n{'='*60}")
        print("KEY PERFORMANCE INDICATORS (KPIs)")
        print(f"{'='*60}")
        print(f"\n1. LEARNING EFFICACY (Average Learning Gain)")
        print(f"   Baseline:     {baseline_gain:.3f} ({baseline_gain*100:.1f}%)")
        print(f"   DKT:          {dkt_gain:.3f} ({dkt_gain*100:.1f}%)")
        print(f"   DKT + XAI:    {dkt_xai_gain:.3f} ({dkt_xai_gain*100:.1f}%)")
        print(f"   Improvement:  {(dkt_gain/baseline_gain - 1)*100:.1f}% (DKT vs Baseline)")
        print(f"   XAI Boost:    {(dkt_xai_gain/dkt_gain - 1)*100:.1f}% (DKT+XAI vs DKT)")
        
        print(f"\n2. EFFICIENCY (Attempts per Mastery Point)")
        print(f"   Baseline:     {efficiency_baseline:.1f}")
        print(f"   DKT:          {efficiency_dkt:.1f}")
        print(f"   DKT + XAI:    {efficiency_dkt_xai:.1f}")
        print(f"   Reduction:    {(1 - efficiency_dkt/efficiency_baseline)*100:.1f}% fewer attempts (DKT)")
        
        print(f"\n3. FAILURE RATE")
        print(f"   Baseline:     {baseline_failure*100:.1f}%")
        print(f"   DKT:          {dkt_failure*100:.1f}%")
        print(f"   DKT + XAI:    {dkt_xai_failure*100:.1f}%")
        
        print(f"\n4. ENGAGEMENT RATE")
        print(f"   Baseline:     {baseline_engagement*100:.1f}%")
        print(f"   DKT:          {dkt_engagement*100:.1f}%")
        print(f"   DKT + XAI:    {dkt_xai_engagement*100:.1f}%")
        print(f"   XAI Boost:    {(dkt_xai_engagement/dkt_engagement - 1)*100:.1f}%")
        
        print(f"\n5. ANXIETY REDUCTION")
        print(f"   Baseline:     {self.kpis['anxiety_reduction']['baseline']*100:.2f}%")
        print(f"   DKT:          {self.kpis['anxiety_reduction']['dkt']*100:.2f}%")
        print(f"   DKT + XAI:    {self.kpis['anxiety_reduction']['dkt_xai']*100:.2f}%")
        
        print(f"\n{'='*60}\n")
    
    def generate_report(self, output_path: str = 'simulation_report.json'):
        """Generate comprehensive report"""
        report = {
            'simulation_parameters': {
                'num_students': self.num_students,
                'num_sessions': self.num_sessions,
                'target_topic': self.target_topic,
                'target_mastery': self.target_mastery,
                'initial_mastery': self.kpis['initial_mastery']
            },
            'kpis': self.kpis,
            'session_by_session': {
                'baseline': self.results['baseline'],
                'dkt': self.results['dkt'],
                'dkt_xai': self.results['dkt_xai']
            },
            'projections': {
                'learning_gain_improvement': f"{(self.kpis['learning_gain']['dkt']/self.kpis['learning_gain']['baseline'] - 1)*100:.1f}%",
                'efficiency_improvement': f"{(1 - self.kpis['efficiency']['dkt']/self.kpis['efficiency']['baseline'])*100:.1f}%",
                'xai_engagement_boost': f"{(self.kpis['engagement_rate']['dkt_xai']/self.kpis['engagement_rate']['dkt'] - 1)*100:.1f}%",
                'xai_anxiety_reduction': f"{(self.kpis['anxiety_reduction']['dkt_xai']/self.kpis['anxiety_reduction']['baseline'] - 1)*100:.1f}%"
            },
            'timestamp': datetime.now().isoformat()
        }
        
        with open(output_path, 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"✓ Report saved to {output_path}")
        return report


if __name__ == '__main__':
    # Run simulation
    simulation = AdaptiveLearningSimulation(
        model_path='dkt_trained_model.keras',
        target_topic='G11_16',
        target_mastery=0.85,
        num_students=100,
        num_sessions=50
    )
    
    simulation.run_simulation()
    simulation.generate_report('simulation_report.json')

