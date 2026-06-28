const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ai-power-tours-production.up.railway.app/api';
import * as integrations from './integrations.js';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  getToken() {
    return this.token || localStorage.getItem('authToken');
  }

  async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Auth methods
  auth = {
    me: async () => {
      return this.request('/auth/me');
    },

    updateMe: async (data) => {
      return this.request('/auth/me', {
        method: 'PATCH',
        body: data,
      });
    },

    changePassword: async (currentPassword, newPassword) => {
      return this.request('/auth/change-password', {
        method: 'POST',
        body: { currentPassword, newPassword },
      });
    },

    logout: async () => {
      try {
        const result = await this.request('/auth/logout', {
          method: 'POST',
        });
        this.setToken(null);
        localStorage.removeItem('user');
        return result;
      } catch (error) {
        // Clear token even if request fails
        this.setToken(null);
        localStorage.removeItem('user');
        throw error;
      }
    },

    redirectToLogin: (returnPath = '/') => {
      localStorage.setItem('returnPath', returnPath);
      window.location.href = `${API_BASE_URL}/auth/google`;
    },

    getStatus: async () => {
      return this.request('/auth/status');
    },
  };

  // Entity methods
  entities = {
    Trip: {
      find: async () => {
        return this.request('/trips');
      },

      findById: async (id) => {
        return this.request(`/trips/${id}`);
      },

      create: async (data) => {
        return this.request('/trips', {
          method: 'POST',
          body: data,
        });
      },

      update: async (id, data) => {
        return this.request(`/trips/${id}`, {
          method: 'PATCH',
          body: data,
        });
      },

      delete: async (id) => {
        return this.request(`/trips/${id}`, {
          method: 'DELETE',
        });
      },
    },

    Hotel: {
      find: async (query = {}) => {
        const params = new URLSearchParams(query);
        return this.request(`/hotels?${params}`);
      },

      findById: async (id) => {
        return this.request(`/hotels/${id}`);
      },

      create: async (data) => {
        return this.request('/hotels', {
          method: 'POST',
          body: data,
        });
      },

      update: async (id, data) => {
        return this.request(`/hotels/${id}`, {
          method: 'PATCH',
          body: data,
        });
      },

      delete: async (id) => {
        return this.request(`/hotels/${id}`, {
          method: 'DELETE',
        });
      },
    },

    Booking: {
      find: async () => {
        return this.request('/bookings');
      },

      findById: async (id) => {
        return this.request(`/bookings/${id}`);
      },

      create: async (data) => {
        return this.request('/bookings', {
          method: 'POST',
          body: data,
        });
      },

      update: async (id, data) => {
        return this.request(`/bookings/${id}`, {
          method: 'PATCH',
          body: data,
        });
      },

      cancel: async (id) => {
        return this.request(`/bookings/${id}/cancel`, {
          method: 'POST',
        });
      },
    },

    TravelPackage: {
      find: async (query = {}) => {
        const params = new URLSearchParams(query);
        return this.request(`/packages?${params}`);
      },

      findById: async (id) => {
        return this.request(`/packages/${id}`);
      },

      create: async (data) => {
        return this.request('/packages', {
          method: 'POST',
          body: data,
        });
      },

      update: async (id, data) => {
        return this.request(`/packages/${id}`, {
          method: 'PATCH',
          body: data,
        });
      },

      delete: async (id) => {
        return this.request(`/packages/${id}`, {
          method: 'DELETE',
        });
      },
    },

    Flight: {
      find: async (query = {}) => {
        const params = new URLSearchParams(query);
        return this.request(`/flights?${params}`);
      },

      findById: async (id) => {
        return this.request(`/flights/${id}`);
      },

      create: async (data) => {
        return this.request('/flights', {
          method: 'POST',
          body: data,
        });
      },

      update: async (id, data) => {
        return this.request(`/flights/${id}`, {
          method: 'PATCH',
          body: data,
        });
      },

      delete: async (id) => {
        return this.request(`/flights/${id}`, {
          method: 'DELETE',
        });
      },
    },
  };

  integrations = integrations;

  // Search methods (direct API, no LLM)
  search = {
    hotels: async (city) => {
      return this.request(`/search/hotels?city=${encodeURIComponent(city)}`);
    },

    flights: async ({ from, to, departDate, returnDate }) => {
      let url = `/search/flights?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&departDate=${departDate}`;
      if (returnDate) url += `&returnDate=${returnDate}`;
      return this.request(url);
    },

    buses: async ({ from, to, date }) => {
      return this.request(`/search/buses?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${date}`);
    },

    trains: async ({ from, to, date }) => {
      return this.request(`/search/trains?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${date}`);
    },
  };
}

export const apiClient = new ApiClient();
export default apiClient;
