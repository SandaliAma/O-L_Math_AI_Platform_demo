/**
 * Sinhala Math Question Generator API Client
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://172.28.15.124:8000';

class APIError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

class MathQuestionAPI {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;

    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const config = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new APIError(
          errorData.detail || `HTTP Error: ${response.status}`,
          response.status,
          errorData
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(
        error.message || 'Network error - Is the backend running?',
        0,
        { originalError: error }
      );
    }
  }

  async checkHealth() {
    return this.request('/health');
  }

  async generateQuestions({
    topic = 'වාරික ගණනය',
    difficulty = 'medium',
    numQuestions = 5,
  } = {}) {
    return this.request('/generate', {
      method: 'POST',
      body: JSON.stringify({
        topic,
        difficulty,
        num_questions: numQuestions,
      }),
    });
  }

  async getTopics() {
    return this.request('/topics');
  }

  async evaluateAnswer(data) {
    // This endpoint is on the Node.js backend, not the Python generator
    // We'll use the relative path /api assuming the proxy or CORS is set up for the main app
    const token = localStorage.getItem('token');
    const response = await fetch('/api/evaluate/explain', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Evaluation failed');
    }
    return response.json();
  }
}

const mathAPI = new MathQuestionAPI();

export { MathQuestionAPI, APIError, mathAPI };
export default mathAPI;