import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AppContext = createContext(null);

const API_BASE = '/api';

export function AppProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [links, setLinks] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch categories from backend (MongoDB)
  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      setError(null);
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE}/categories`);
        if (cancelled) return;
        const data = res.data;
        setCategories(Array.isArray(data) ? data : []);
        if (Array.isArray(data) && data.length > 0 && !selectedCategoryId) {
          setSelectedCategoryId(data[0]._id);
        }
      } catch (err) {
        if (cancelled) return;
        setCategories([]);
        setError(
          err.response?.data?.message || err.message || 'Could not load categories. Is the backend running?'
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadCategories();
    return () => { cancelled = true; };
  }, []);

  // Fetch links for selected category from backend (MongoDB)
  useEffect(() => {
    if (!selectedCategoryId) {
      setLinks([]);
      return;
    }

    let cancelled = false;

    async function loadLinks() {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${API_BASE}/links/category/${selectedCategoryId}`);
        if (cancelled) return;
        setLinks(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        if (cancelled) return;
        setLinks([]);
        setError(
          err.response?.data?.message || err.message || 'Could not load links.'
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadLinks();
    return () => { cancelled = true; };
  }, [selectedCategoryId]);

  const updateLink = (id, updates) => {
    setLinks((prev) =>
      prev.map((l) => (l._id === id ? { ...l, ...updates } : l))
    );
  };

  const value = {
    categories,
    links,
    selectedCategoryId,
    setSelectedCategoryId,
    loading,
    error,
    updateLink,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
