import express, { Request, Response } from 'express';
import postModel from './posts.model';
import Post from './post.interface';

class PostsController {
  public path = '/posts';
  public router = express.Router();
  private post = postModel;

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(this.path, this.getAllPosts);
    this.router.get(`${this.path}/:id`, this.getPostById);
    this.router.patch(`${this.path}/:id`, this.modifyPost);
    this.router.delete(`${this.path}/:id`, this.deletePost);
    this.router.post(this.path, this.createPost);
  }

  getAllPosts = async (request: Request, response: Response) => {
    const post = await postModel.find();
    response.send(post);
  };

  getPostById = async (request: Request, response: Response) => {
    const id = request.params?.id;
    const postById = await this.post.findById(id);
    response.send(postById);
  };
  modifyPost = async (request: Request, response: Response) => {
    const id = request.params?.id;
    const newData: Post = request.body;
    const updatedPost = await this.post.findByIdAndUpdate(id, newData, {
      new: true,
    });
    response.send(updatedPost);
  };

  deletePost = async (request: Request, response: Response) => {
    const id = request.params?.id;
    const deletedPost = await this.post.findByIdAndDelete(id);
    if (deletedPost) {
      response.send(deletedPost);
    } else {
      response.send(404);
    }
  };
  createPost = async (request: Request, response: Response) => {
    const postData: Post = request.body;
    const createdPost = new this.post(postData);
    const newPost = await createdPost.save();
    response.send(newPost);
  };
}

export default PostsController;
