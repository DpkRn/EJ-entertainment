/**
 * Protects /api/admin/* with a shared API key.
 * Client must send: X-Admin-Key: <key> or Authorization: Bearer <key>
 */
export function adminAuth(req, res, next) {
  const key = process.env.ADMIN_API_KEY;
  if (!key || key.length < 8) {
    return res.status(503).json({
      message: 'Admin API is not configured (set ADMIN_API_KEY with at least 8 characters)',
    });
  }

  const headerKey = req.get('X-Admin-Key') || (req.get('Authorization') || '').replace(/^Bearer\s+/i, '').trim();
  if (!headerKey) {
    return res.status(401).json({ message: 'Missing admin key. Send X-Admin-Key or Authorization: Bearer <key>.' });
  }

  if (headerKey !== key) {
    return res.status(403).json({ message: 'Invalid admin key.' });
  }

  next();
}
