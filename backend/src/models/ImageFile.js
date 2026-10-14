import mongoose from 'mongoose';

const imageFileSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true, unique: true },
    mime: { type: String, required: true },
    data: { type: Buffer, required: true },
  },
  { timestamps: true }
);

export const ImageFile = mongoose.model('ImageFile', imageFileSchema);
