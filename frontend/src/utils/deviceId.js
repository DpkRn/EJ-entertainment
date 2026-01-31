/**
 * Uses FingerprintJS to derive a stable browser/device identifier.
 * No localStorage – the ID is computed from device/browser characteristics.
 */
import FingerprintJS from '@fingerprintjs/fingerprintjs';

let cachedVisitorId = null;
let loadPromise = null;

/**
 * Returns a promise that resolves to the fingerprint-based device ID (visitorId).
 * Result is cached in memory for the session only.
 */
export async function getDeviceId() {
  if (cachedVisitorId) return cachedVisitorId;
  if (!loadPromise) {
    loadPromise = FingerprintJS.load().then((fp) => fp.get());
  }
  const result = await loadPromise;
  cachedVisitorId = result.visitorId;
  return cachedVisitorId;
}
