import mongoose from 'mongoose';

const adminDeviceLogSchema = new mongoose.Schema(
  {
    deviceId: { type: String, required: true, unique: true },
    firstSeenAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('AdminDeviceLog', adminDeviceLogSchema);
