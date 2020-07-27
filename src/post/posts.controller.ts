import express, { Request, Response, NextFunction } from 'express';
import postModel from './posts.model';
import Post from './post.interface';
import { nextTick } from 'process';
import HttpException from '../exceptions/HttpException';
import PostNotFoundException from '../exceptions/PostNotFoundException';

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

  getPostById = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    const id = request.params?.id;
    try {
      const postById = await this.post.findById(id);
      // console.log('postById: ', postById);
      response.send(postById);
    } catch (e) {
      next(new PostNotFoundException(id));
    }
  };
  modifyPost = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    const id = request.params?.id;
    try {
      const newData: Post = request.body;
      const updatedPost = await this.post.findByIdAndUpdate(id, newData, {
        new: true,
      });
      response.send(updatedPost);
    } catch (e) {
      next(new PostNotFoundException(id));
    }
  };

  deletePost = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    const id = request.params?.id;
    try {
      const deletedPost = await this.post.findByIdAndDelete(id);
      response.send(deletedPost);
    } catch (e) {
      next(new PostNotFoundException(id));
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
