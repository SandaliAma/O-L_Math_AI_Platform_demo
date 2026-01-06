/**
 * Sinhala Math Question Generator API Client
 * Connects frontend to FastAPI backend
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

/**
 * Custom API Error class
 */
class APIError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

/**
 * API Client for Sinhala Math Question Generator
 */
class MathQuestionAPI {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Make HTTP request to the API
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;

    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const config = {
      ... defaultOptions,
      ...options,
      headers: {
        ... defaultOptions.headers,
        ...options. headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response. ok) {
        const errorData = await response. json().catch(() => ({}));
        throw new APIError(
          errorData.detail || `HTTP Error:  ${response.status}`,
          response.status,
          errorData
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      // Network error or other issues
      throw new APIError(
        error.message || 'Network error - Is the backend running?',
        0,
        { originalError: error }
      );
    }
  }

  /**
   * Check API health status
   */
  async checkHealth() {
    return this.request('/health');
  }

  /**
   * Initialize the RAG system
   */
  async initialize(useMock = true) {
    return this.request(`/initialize?use_mock=${useMock}`, {
      method: 'POST',
    });
  }

  /**
   * Generate math questions
   */
  async generateQuestions({
    topic = 'වාරික ගණනය',
    difficulty = 'medium',
    numQuestions = 3,
  } = {}) {
    return this. request('/generate', {
      method: 'POST',
      body: JSON.stringify({
        topic,
        difficulty,
        num_questions: numQuestions,
      }),
    });
  }

  /**
   * Get available topics
   */
  async getTopics() {
    return this.request('/topics');
  }

  /**
   * Submit quiz answers for evaluation (if backend supports it)
   */
  async submitQuiz(quizData) {
    // This would be implemented if your backend has a submission endpoint
    // For now, we'll handle evaluation on the frontend
    return {
      success: true,
      message:  'Quiz submitted successfully',
      data: quizData,
    };
  }
}

// Create singleton instance
const mathAPI = new MathQuestionAPI();

// Named exports
export { MathQuestionAPI, APIError, mathAPI };

// Default export
export default mathAPI;