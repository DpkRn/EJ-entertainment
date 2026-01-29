import { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

const AdminContext = createContext(null);

const ADMIN_KEY_STORAGE = 'jitu-admin-key';
const API_BASE = '/api/admin';

function getStoredKey() {
  try {
    return localStorage.getItem(ADMIN_KEY_STORAGE) || '';
  } catch {
    return '';
  }
}

function adminClient(apiKey) {
  const key = apiKey || getStoredKey();
  return axios.create({
    baseURL: API_BASE,
    headers: key ? { 'X-Admin-Key': key } : {},
  });
}

export function AdminProvider({ children }) {
  const [apiKey, setApiKeyState] = useState(getStoredKey);
  const [authError, setAuthError] = useState(null);

  const setApiKey = useCallback((key) => {
    const trimmed = (key || '').trim();
    setApiKeyState(trimmed);
    if (trimmed) {
      try {
        localStorage.setItem(ADMIN_KEY_STORAGE, trimmed);
      } catch (_) {}
    } else {
      try {
        localStorage.removeItem(ADMIN_KEY_STORAGE);
      } catch (_) {}
    }
    setAuthError(null);
  }, []);

  const logout = useCallback(() => {
    setApiKeyState('');
    try {
      localStorage.removeItem(ADMIN_KEY_STORAGE);
    } catch (_) {}
    setAuthError(null);
  }, []);

  const request = useCallback(
    async (method, url, data = null) => {
      const client = adminClient(apiKey);
      try {
        if (method === 'get') return await client.get(url);
        if (method === 'post') return await client.post(url, data);
        if (method === 'put') return await client.put(url, data);
        if (method === 'delete') return await client.delete(url);
        throw new Error('Unknown method');
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          setAuthError(err.response?.data?.message || 'Invalid or missing admin key.');
        }
        throw err;
      }
    },
    [apiKey]
  );

  const value = {
    apiKey,
    setApiKey,
    logout,
    isAuthenticated: !!apiKey,
    authError,
    clearAuthError: () => setAuthError(null),
    admin: {
      getCategories: () => request('get', '/categories'),
      getCategoryById: (id) => request('get', `/categories/${id}`),
      createCategory: (body) => request('post', '/categories', body),
      updateCategory: (id, body) => request('put', `/categories/${id}`, body),
      deleteCategory: (id) => request('delete', `/categories/${id}`),
      getLinksByCategory: (categoryId) => request('get', `/links/category/${categoryId}`),
      getLinkById: (id) => request('get', `/links/${id}`),
      createLink: (body) => request('post', '/links', body),
      updateLink: (id, body) => request('put', `/links/${id}`, body),
      deleteLink: (id) => request('delete', `/links/${id}`),
      getVisitors: () => request('get', '/visitors'),
      getVisitorById: (id) => request('get', `/visitors/${id}`),
      createVisitor: (body) => request('post', '/visitors', body),
      updateVisitor: (id, body) => request('put', `/visitors/${id}`, body),
      deleteVisitor: (id) => request('delete', `/visitors/${id}`),
    },
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
  return ctx;
}
