import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { getDeviceId } from '../utils/deviceId.js';

const VisitorContext = createContext(null);

const STORAGE_KEY = 'jitu-visitor-key';
const API_BASE = '/api/visitor';

function getStoredKey() {
  try {
    return localStorage.getItem(STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function VisitorProvider({ children }) {
  const [visitor, setVisitor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkSession = useCallback(async () => {
    const privateKey = getStoredKey();
    if (!privateKey) {
      setVisitor(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const deviceId = await getDeviceId();
      const res = await axios.get(`${API_BASE}/me`, {
        headers: { 'X-Visitor-Key': privateKey, 'X-Device-ID': deviceId },
      });
      setVisitor(res.data?.visitor ?? null);
    } catch (err) {
      setVisitor(null);
      if (err.response?.status === 401) {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch (_) {}
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Remove legacy device ID from localStorage (we now use fingerprint only)
  useEffect(() => {
    try {
      localStorage.removeItem('jitu-device-id');
    } catch (_) {}
  }, []);

  const login = useCallback(async (privateKey) => {
    const key = (privateKey || '').trim();
    if (!key) return { ok: false, message: 'Enter your private key.' };
    setError(null);
    setLoading(true);
    try {
      const deviceId = await getDeviceId();
      const res = await axios.post(`${API_BASE}/verify`, { privateKey: key, deviceId });
      const v = res.data?.visitor;
      if (v) {
        try {
          localStorage.setItem(STORAGE_KEY, key);
        } catch (_) {}
        setVisitor(v);
        return { ok: true };
      }
      return { ok: false, message: 'Invalid response.' };
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || err.message || 'Verification failed.';
      setError(msg);
      if (status === 403) return { ok: false, message: 'Device limit reached. You cannot add this device.' };
      if (status === 404) return { ok: false, message: 'Invalid private key. Access denied.' };
      return { ok: false, message: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setVisitor(null);
    setError(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (_) {}
  }, []);

  const value = {
    visitor,
    isAuthenticated: !!visitor,
    loading,
    error,
    setError,
    login,
    logout,
    checkSession,
    getDeviceId,
    getPrivateKey: getStoredKey,
  };

  return <VisitorContext.Provider value={value}>{children}</VisitorContext.Provider>;
}

export function useVisitor() {
  const ctx = useContext(VisitorContext);
  if (!ctx) throw new Error('useVisitor must be used within VisitorProvider');
  return ctx;
}
