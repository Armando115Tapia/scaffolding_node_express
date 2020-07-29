import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';

import CreateUserDTO from '../users/user.dto';
import Controller from '../interfaces/controller.interface';
import validationMiddleware from '../middleware/validation.middleware';
import userModel from '../users/user.model';
import UserWithThatEmailAlreadyExistsException from '../exceptions/UserWithThatEmailAlreadyExistsException';
import LogInDto from './logIn.dto';
import WrongCredentialsException from '../exceptions/WrongCredentialsException';

class AuthenticationController implements Controller {
  path: string = '/auth';
  router: express.Router = express.Router();
  user = userModel;

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}/register`,
      validationMiddleware(CreateUserDTO),
      this.registration
    );
    this.router.post(
      `${this.path}/login`,
      validationMiddleware(LogInDto),
      this.loggingIn
    );
  }

  private registration = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    const userData: CreateUserDTO = request.body;
    if (await this.user.findOne({ email: userData.email })) {
      next(new UserWithThatEmailAlreadyExistsException(userData.email));
    } else {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await this.user.create({
        ...userData,
        password: hashedPassword,
      });
      user.password = 'XD';
      response.send(user);
    }
  };

  private loggingIn = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    const logIndata: LogInDto = request.body;
    const user = await this.user.findOne({ email: logIndata.email });
    if (user) {
      const isPasswordMatching = await bcrypt.compare(
        logIndata.password,
        user.password
      );
      if (isPasswordMatching) {
        user.password = 'XD';
        response.send(user);
      } else {
        next(new WrongCredentialsException());
      }
    } else {
      next(new WrongCredentialsException());
    }
  };
}

export default AuthenticationController;
