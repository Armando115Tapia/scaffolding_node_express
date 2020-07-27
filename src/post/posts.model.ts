import mongoose from 'mongoose';
import Post from './post.interface';
const { Schema } = mongoose;

const postSchema = new Schema({
  author: { type: String },
  content: { type: String },
  title: { type: String },
});

// Para que se conoscan todos los campos que requiere el post
const postModel = mongoose.model<Post & mongoose.Document>('Post', postSchema);
//const postModel = mongoose.model('Post', postSchema);
export default postModel;
