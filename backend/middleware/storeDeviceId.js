import Visitor from '../model/visitorModel.js';
import AdminDeviceLog from '../model/adminDeviceLogModel.js';

/**
 * Store admin device ID on first use (after adminAuth).
 * Client sends X-Device-ID. If this device has never used admin before, we insert a log.
 */
export async function storeAdminDevice(req, res, next) {
  const deviceId = (req.get('X-Device-ID') || '').trim();
  if (!deviceId) return next();

  try {
    await AdminDeviceLog.findOneAndUpdate(
      { deviceId },
      { $setOnInsert: { deviceId, firstSeenAt: new Date() } },
      { upsert: true }
    );
  } catch (_) {
    // non-fatal: don't block the request
  }
  next();
}

/**
 * Store visitor device ID on first use for that visitor.
 * Client sends X-Visitor-Key (privateKey) and X-Device-ID.
 * If deviceId is not in visitor.deviceID and under noOfDevice limit, add it.
 */
export async function storeVisitorDevice(req, res, next) {
  const privateKey = (req.get('X-Visitor-Key') || '').trim();
  const deviceId = (req.get('X-Device-ID') || '').trim();
  if (!privateKey || !deviceId) return next();

  try {
    const visitor = await Visitor.findOne({ privateKey });
    if (!visitor) return next();

    const deviceIDs = Array.isArray(visitor.deviceID) ? visitor.deviceID : [];
    const limit = visitor.noOfDevice ?? 1;
    if (deviceIDs.includes(deviceId)) return next();
    if (deviceIDs.length >= limit) return next();

    visitor.deviceID = [...deviceIDs, deviceId];
    await visitor.save();
  } catch (_) {
    // non-fatal: don't block the request
  }
  next();
}
