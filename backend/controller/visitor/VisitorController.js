import Visitor from '../../model/visitorModel.js';

/**
 * POST /api/visitor/verify
 * Body: { privateKey, deviceId }
 * First-time visitor: validate private key, check device limit, add deviceId if allowed.
 */
export async function verify(req, res) {
  try {
    const { privateKey, deviceId } = req.body || {};
    const key = (privateKey || '').trim();
    const devId = (deviceId || '').trim();
    if (!key || !devId) {
      return res.status(400).json({ message: 'privateKey and deviceId are required' });
    }

    const visitor = await Visitor.findOne({ privateKey: key });
    if (!visitor) {
      return res.status(404).json({ message: 'Invalid private key. Access denied.' });
    }

    const deviceIDs = Array.isArray(visitor.deviceID) ? visitor.deviceID : [];
    const limit = visitor.noOfDevice ?? 1;
    console.log(deviceIDs, limit);
    console.log(privateKey, devId);
    if (deviceIDs.includes(devId)) {
      // Already registered this device – allow
      return res.json({
        visitor: {
          _id: visitor._id,
          name: visitor.name,
          role: visitor.role,
          privateKey: visitor.privateKey,
          noOfDevice: visitor.noOfDevice,
          deviceID: visitor.deviceID,
        },
      });
    }

    if (deviceIDs.length >= limit) {
      return res.status(403).json({
        message: 'Device limit reached. You cannot add this device.',
      });
    }

    visitor.deviceID = [...deviceIDs, devId];
    await visitor.save();

    res.json({
      visitor: {
        _id: visitor._id,
        name: visitor.name,
        role: visitor.role,
        privateKey: visitor.privateKey,
        noOfDevice: visitor.noOfDevice,
        deviceID: visitor.deviceID,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

/**
 * GET /api/visitor/me
 * Headers: X-Visitor-Key (privateKey), X-Device-ID
 * Returning visitor: check if this device is allowed for this key.
 */
export async function me(req, res) {
  try {
    const privateKey = (req.get('X-Visitor-Key') || '').trim();
    const deviceId = (req.get('X-Device-ID') || '').trim();
    if (!privateKey || !deviceId) {
      return res.status(401).json({ message: 'Missing X-Visitor-Key or X-Device-ID' });
    }

    const visitor = await Visitor.findOne({ privateKey });
    if (!visitor) {
      return res.status(401).json({ message: 'Invalid private key' });
    }

    const deviceIDs = Array.isArray(visitor.deviceID) ? visitor.deviceID : [];
    if (!deviceIDs.includes(deviceId)) {
      return res.status(401).json({ message: 'This device is not registered. Please verify again.' });
    }

    res.json({
      visitor: {
        _id: visitor._id,
        name: visitor.name,
        role: visitor.role,
        privateKey: visitor.privateKey,
        noOfDevice: visitor.noOfDevice,
        deviceID: visitor.deviceID,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
