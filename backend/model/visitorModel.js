import mongoose from 'mongoose';

const visitorSchema = new mongoose.Schema(
  {
    privateKey: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    role: { type: String, required: true },
    deviceID: { type: [String], default: [] },
    noOfDevice: { type: Number, default: 1 },
  },
  { timestamps: true }
);

export default mongoose.model('Visitor', visitorSchema);
