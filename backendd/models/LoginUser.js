import mongoose from 'mongoose';

const loginSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], required: true },
  photo: { type: String }, // base64 or image URL
});

const LoginUser = mongoose.model('LoginUser', loginSchema, 'LoginDetails');

export default LoginUser;
