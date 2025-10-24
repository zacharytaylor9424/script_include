// API utility functions with authentication and reCAPTCHA

export async function secureFetch(url: string, options: RequestInit = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers,
  });
}

// Specific API functions for your items
export const itemsAPI = {
  async getItems() {
    // GET requests don't need authentication (read-only)
    return fetch('/api/items');
  },

  async createItem(data: { name: string; value: string; recaptchaToken: string }) {
    return secureFetch('/api/items', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateItem(data: { id: string; name: string; value: string; recaptchaToken: string }) {
    return secureFetch('/api/items', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteItem(id: string, recaptchaToken: string) {
    return secureFetch(`/api/items?id=${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ recaptchaToken }),
    });
  },
};
