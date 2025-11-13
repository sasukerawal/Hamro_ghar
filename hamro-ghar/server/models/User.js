import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      required: true,
    },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'member', 'admin'], default: 'member' }
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
