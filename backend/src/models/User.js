import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    phone: String,
    email: String,
    address: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' },
  },
  { _id: false }
);

const refreshSchema = new mongoose.Schema(
  {
    tokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    phone: { type: String, required: true, trim: true },
    role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
    refreshTokens: { type: [refreshSchema], default: [], select: false },
    addresses: { type: [addressSchema], default: [] },
  },
  { timestamps: true }
);

userSchema.index(
  { phone: 1 },
  { unique: true, partialFilterExpression: { phone: { $gt: '' } } }
);

userSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret.password;
    delete ret.refreshTokens;
    return ret;
  },
});

export const User = mongoose.model('User', userSchema);
