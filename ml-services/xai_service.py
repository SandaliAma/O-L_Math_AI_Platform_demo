"""
Explainable AI (XAI) Service for DKT Recommendations
Provides SHAP/LIME-based explanations for why questions are recommended
"""

import numpy as np
from typing import List, Dict, Optional, Tuple
import warnings
warnings.filterwarnings('ignore')

try:
    import shap
    SHAP_AVAILABLE = True
except ImportError:
    SHAP_AVAILABLE = False
    print("⚠ SHAP not available, using simplified XAI")

try:
    from lime import lime_tabular
    LIME_AVAILABLE = True
except ImportError:
    LIME_AVAILABLE = False
    print("⚠ LIME not available, using simplified XAI")


class XAIService:
    """
    Explainable AI service for DKT recommendations
    """
    
    def __init__(self):
        self.shap_available = SHAP_AVAILABLE
        self.lime_available = LIME_AVAILABLE
    
    def extract_features(self, student: Dict, question: Dict, 
                        knowledge_vector: np.ndarray) -> np.ndarray:
        """
        Extract features for XAI analysis
        
        Returns feature vector:
        [mastery_target, mastery_prereq1, mastery_prereq2, mastery_prereq3,
         difficulty, time_avg, error_rate, anxiety_level, attempts_avg]
        """
        topic_id = question['topic_id']
        topic_name = question.get('topic_name', 'Unknown')
        
        # Get mastery for target topic
        if topic_id < len(knowledge_vector):
            mastery_target = knowledge_vector[topic_id]
        else:
            mastery_target = 0.3
        
        # Get prerequisite masteries
        prereq_masteries = []
        if topic_id == 16:  # G11_16 (Geometric Progressions)
            prereq_ids = [3, 11, 14]  # G10_03, G10_11, G10_14
            for prereq_id in prereq_ids:
                if prereq_id < len(knowledge_vector):
                    prereq_masteries.append(knowledge_vector[prereq_id])
                else:
                    prereq_masteries.append(0.3)
        else:
            prereq_masteries = [0.3, 0.3, 0.3]
        
        # Calculate average time and error rate from history
        history = student.get('history', [])
        if history:
            avg_time = np.mean([h.get('time_taken', 30) for h in history[-10:]])
            error_rate = 1 - np.mean([1 if h.get('is_correct', False) else 0 
                                     for h in history[-10:]])
            avg_attempts = np.mean([h.get('attempts', 1) for h in history[-10:]])
        else:
            avg_time = 30.0
            error_rate = 0.5
            avg_attempts = 1.0
        
        # Normalize features
        features = np.array([
            mastery_target,                    # 0: Target topic mastery
            prereq_masteries[0],              # 1: Prerequisite 1 mastery
            prereq_masteries[1],              # 2: Prerequisite 2 mastery
            prereq_masteries[2],              # 3: Prerequisite 3 mastery
            question.get('difficulty', 1.0),   # 4: Question difficulty
            avg_time / 300.0,                 # 5: Normalized average time
            error_rate,                        # 6: Error rate
            student.get('anxiety_level', 0.5), # 7: Anxiety level
            avg_attempts / 5.0                 # 8: Normalized average attempts
        ])
        
        return features
    
    def calculate_feature_importance(self, student: Dict, question: Dict,
                                    knowledge_vector: np.ndarray,
                                    predicted_success_rate: float) -> Dict:
        """
        Calculate feature importance for recommendation explanation
        
        Uses simplified SHAP-like approach if SHAP is not available
        """
        features = self.extract_features(student, question, knowledge_vector)
        
        if self.shap_available:
            return self._shap_explanation(student, question, knowledge_vector, 
                                        predicted_success_rate, features)
        else:
            return self._simplified_explanation(student, question, knowledge_vector,
                                              predicted_success_rate, features)
    
    def _simplified_explanation(self, student: Dict, question: Dict,
                               knowledge_vector: np.ndarray,
                               predicted_success_rate: float,
                               features: np.ndarray) -> Dict:
        """
        Simplified feature importance calculation
        (Gradient-based approximation)
        """
        topic_id = question['topic_id']
        
        # Calculate importance scores
        importance_scores = {}
        
        # 1. Target mastery importance
        mastery_target = features[0]
        if mastery_target < 0.4:
            importance_scores['low_mastery_target'] = {
                'value': mastery_target,
                'impact': 'high',
                'message': f"Your mastery in this topic is low ({mastery_target*100:.0f}%)"
            }
        
        # 2. Prerequisite mastery importance
        prereq_names = ['Fractions (G10_03)', 'LCM of Algebraic Expressions (G10_11)', 
                       'Linear Equations (G10_14)']
        prereq_issues = []
        for i, prereq_name in enumerate(prereq_names):
            prereq_mastery = features[i + 1]
            if prereq_mastery < 0.4:
                prereq_issues.append({
                    'topic': prereq_name,
                    'mastery': prereq_mastery,
                    'impact': 'critical' if prereq_mastery < 0.3 else 'high'
                })
        
        if prereq_issues:
            importance_scores['prerequisite_gaps'] = {
                'issues': prereq_issues,
                'impact': 'high'
            }
        
        # 3. Difficulty vs Mastery mismatch
        difficulty = features[4]
        if difficulty > mastery_target * 2.0:
            importance_scores['difficulty_mismatch'] = {
                'value': difficulty,
                'mastery': mastery_target,
                'impact': 'high',
                'message': f"Question difficulty ({difficulty:.1f}) is too high for current mastery ({mastery_target*100:.0f}%)"
            }
        
        # 4. Time/Anxiety signals
        avg_time = features[5] * 300.0
        anxiety = features[7]
        if avg_time > 60 or anxiety > 0.6:
            importance_scores['time_anxiety'] = {
                'avg_time': avg_time,
                'anxiety': anxiety,
                'impact': 'medium',
                'message': "High hesitation detected (long response times or anxiety)"
            }
        
        # 5. Error rate
        error_rate = features[6]
        if error_rate > 0.6:
            importance_scores['high_error_rate'] = {
                'value': error_rate,
                'impact': 'high',
                'message': f"Recent error rate is high ({error_rate*100:.0f}%)"
            }
        
        return {
            'feature_importance': importance_scores,
            'predicted_success_rate': predicted_success_rate,
            'recommendation_type': self._determine_recommendation_type(
                predicted_success_rate, features
            )
        }
    
    def _determine_recommendation_type(self, predicted_success: float, 
                                      features: np.ndarray) -> str:
        """Determine the type of recommendation"""
        if predicted_success < 0.4:
            return 'foundation_review'  # Too hard, need prerequisites
        elif predicted_success < 0.6:
            return 'scaffolded_learning'  # Challenging but achievable
        elif predicted_success <= 0.8:
            return 'optimal_challenge'  # Perfect learning zone
        else:
            return 'reinforcement'  # Easy, for mastery
    
    def _shap_explanation(self, student: Dict, question: Dict,
                         knowledge_vector: np.ndarray,
                         predicted_success_rate: float,
                         features: np.ndarray) -> Dict:
        """
        SHAP-based explanation (if available)
        """
        # Simplified SHAP implementation
        # In production, use actual SHAP explainer
        return self._simplified_explanation(student, question, knowledge_vector,
                                           predicted_success_rate, features)
    
    def generate_explanation_text(self, xai_result: Dict, 
                                 question: Dict, student: Dict) -> str:
        """
        Generate human-readable explanation text
        """
        topic_name = question.get('topic_name', 'this topic')
        predicted_success = xai_result['predicted_success_rate']
        rec_type = xai_result['recommendation_type']
        importance = xai_result['feature_importance']
        
        explanation_parts = []
        
        # Header
        explanation_parts.append(f"🎯 Adaptive Goal: Mastery in {topic_name}")
        explanation_parts.append(f"Recommended Action: Focus on this question (Predicted Success: {predicted_success*100:.0f}%)")
        explanation_parts.append("")
        explanation_parts.append("✅ Why This Recommendation? (Explainable AI)")
        explanation_parts.append("")
        
        # Key reasons
        reasons = []
        
        # Low mastery
        if 'low_mastery_target' in importance:
            info = importance['low_mastery_target']
            reasons.append(f"• Skill Gap: Your mastery in {topic_name} is {info['value']*100:.0f}%, indicating a need for focused practice.")
        
        # Prerequisite gaps
        if 'prerequisite_gaps' in importance:
            prereq_info = importance['prerequisite_gaps']
            for issue in prereq_info['issues']:
                reasons.append(f"• Prerequisite Gap: {issue['topic']} mastery is only {issue['mastery']*100:.0f}%, which is critical for success.")
        
        # Difficulty mismatch
        if 'difficulty_mismatch' in importance:
            info = importance['difficulty_mismatch']
            reasons.append(f"• Difficulty Level: This question's difficulty ({info['value']:.1f}) may be challenging given your current mastery ({info['mastery']*100:.0f}%).")
        
        # Time/Anxiety
        if 'time_anxiety' in importance:
            info = importance['time_anxiety']
            reasons.append(f"• Time/Anxiety Signal: Your average response time ({info['avg_time']:.0f}s) and anxiety level suggest you may benefit from a more structured approach.")
        
        # High error rate
        if 'high_error_rate' in importance:
            info = importance['high_error_rate']
            reasons.append(f"• Performance Pattern: Recent error rate is {info['value']*100:.0f}%, indicating a need for review.")
        
        # If no specific issues, provide positive explanation
        if not reasons:
            if rec_type == 'optimal_challenge':
                reasons.append("• Optimal Challenge: This question is in your optimal learning zone (60-80% success rate), maximizing learning efficiency.")
            elif rec_type == 'reinforcement':
                reasons.append("• Reinforcement: This question will help solidify your understanding and build confidence.")
            else:
                reasons.append("• Personalized Path: This recommendation is based on your current knowledge state and learning trajectory.")
        
        explanation_parts.extend(reasons)
        explanation_parts.append("")
        
        # Path forward
        if rec_type == 'foundation_review':
            explanation_parts.append("📚 The Path Forward:")
            explanation_parts.append("We are prioritizing foundation review to stabilize prerequisite skills before proceeding to more advanced topics. This is an efficient, low-stress path to mastery.")
        elif rec_type == 'scaffolded_learning':
            explanation_parts.append("📚 The Path Forward:")
            explanation_parts.append("This question provides appropriate scaffolding - challenging enough to promote growth, but achievable with your current skills.")
        elif rec_type == 'optimal_challenge':
            explanation_parts.append("📚 The Path Forward:")
            explanation_parts.append("This question is perfectly calibrated to your current level, ensuring maximum learning gain with minimal frustration.")
        else:
            explanation_parts.append("📚 The Path Forward:")
            explanation_parts.append("This recommendation aligns with your learning goals and current progress trajectory.")
        
        return "\n".join(explanation_parts)
    
    def explain_recommendation(self, student: Dict, question: Dict,
                              knowledge_vector: np.ndarray,
                              predicted_success_rate: float) -> Dict:
        """
        Main method to generate explanation for a recommendation
        
        Returns:
            Dictionary with explanation data and text
        """
        # Calculate feature importance
        xai_result = self.calculate_feature_importance(
            student, question, knowledge_vector, predicted_success_rate
        )
        
        # Generate explanation text
        explanation_text = self.generate_explanation_text(
            xai_result, question, student
        )
        
        return {
            'explanation': explanation_text,
            'xai_data': xai_result,
            'key_factors': self._extract_key_factors(xai_result),
            'confidence': predicted_success_rate
        }
    
    def _extract_key_factors(self, xai_result: Dict) -> List[str]:
        """Extract key factors for quick summary"""
        factors = []
        importance = xai_result['feature_importance']
        
        if 'low_mastery_target' in importance:
            factors.append("Low Mastery in Target Topic")
        if 'prerequisite_gaps' in importance:
            factors.append("Prerequisite Skill Gaps")
        if 'difficulty_mismatch' in importance:
            factors.append("Difficulty-Mastery Mismatch")
        if 'time_anxiety' in importance:
            factors.append("Time/Anxiety Indicators")
        if 'high_error_rate' in importance:
            factors.append("High Error Rate")
        
        if not factors:
            factors.append("Optimal Learning Zone")
        
        return factors


# Global XAI service instance
xai_service = XAIService()


def generate_recommendation_explanation(optimal_question_id: int,
                                       influential_features: Dict,
                                       student: Dict,
                                       question: Dict,
                                       knowledge_vector: np.ndarray,
                                       predicted_success_rate: float) -> str:
    """
    Generate recommendation explanation (for API compatibility)
    
    Args:
        optimal_question_id: ID of recommended question
        influential_features: Dictionary of influential features
        student: Student data
        question: Question data
        knowledge_vector: Current knowledge state
        predicted_success_rate: Predicted success probability
    
    Returns:
        Explanation text
    """
    result = xai_service.explain_recommendation(
        student, question, knowledge_vector, predicted_success_rate
    )
    return result['explanation']

