import mongoose from 'mongoose';

const linkSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    label: { type: String, default: '' },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    likes: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    replies: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Link', linkSchema);
