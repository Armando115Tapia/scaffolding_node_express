import mongoose, { Schema } from 'mongoose';
import User from './user.interface';

const addressSchema = new Schema({
  street: String,
  city: String,
  country: String,
});

const userSchema = new Schema({
  address: addressSchema,
  name: String,
  email: String,
  password: String,
});

const userModel = mongoose.model<User & mongoose.Document>('User', userSchema);
export default userModel;
