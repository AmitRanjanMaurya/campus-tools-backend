// API utility for connecting frontend to backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://campus-tools-api.vercel.app';

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async signup(email: string, password: string, name: string) {
    return this.request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async logout() {
    return this.request('/api/auth/logout', {
      method: 'POST',
    });
  }

  // AI endpoints
  async solveDoubt(question: string, subject: string) {
    return this.request('/api/ai/doubt-solver', {
      method: 'POST',
      body: JSON.stringify({ question, subject }),
    });
  }

  async generateQuiz(topic: string, difficulty: string, questionCount: number) {
    return this.request('/api/ai/quiz-generator', {
      method: 'POST',
      body: JSON.stringify({ topic, difficulty, questionCount }),
    });
  }

  async generateSummary(text: string) {
    return this.request('/api/ai/deepseek-summary', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  async checkPlagiarism(text: string) {
    return this.request('/api/plagiarism-check', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  async generateMindMap(topic: string, subtopics: string[]) {
    return this.request('/api/mind-map-generator', {
      method: 'POST',
      body: JSON.stringify({ topic, subtopics }),
    });
  }

  // Blog endpoints
  async getBlogPosts() {
    return this.request('/api/blog');
  }

  async getBlogPost(slug: string) {
    return this.request(`/api/blog/${slug}`);
  }

  async createBlogPost(post: any, token: string) {
    return this.request('/api/blog', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(post),
    });
  }

  async updateBlogPost(id: string, post: any, token: string) {
    return this.request(`/api/blog/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(post),
    });
  }

  async deleteBlogPost(id: string, token: string) {
    return this.request(`/api/blog/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
