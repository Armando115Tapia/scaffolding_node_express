// import express, { Request, Response, NextFunction } from 'express';
import * as express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import CreateUserDTO from '../users/user.dto';
import Controller from '../interfaces/controller.interface';
import validationMiddleware from '../middleware/validation.middleware';
import userModel from '../users/user.model';
import UserWithThatEmailAlreadyExistsException from '../exceptions/UserWithThatEmailAlreadyExistsException';
import LogInDto from './logIn.dto';
import WrongCredentialsException from '../exceptions/WrongCredentialsException';
import User from '../users/user.interface';
import TokenData from '../interfaces/tokenData.interface';
import DataStoredInToken from '../interfaces/dataStoredInToken.interface';

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
    this.router.post(`${this.path}/logout`, this.loggingOut);
  }

  private registration = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
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
      const tokenData = this.createToken(user);
      response.setHeader('Set-Cookie', [this.createCookie(tokenData)]);
      response.send(user);
    }
  };

  private loggingIn = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
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
        const tokenData = this.createToken(user);
        response.setHeader('Set-Cookie', [this.createCookie(tokenData)]);
        response.send(user);
      } else {
        next(new WrongCredentialsException());
      }
    } else {
      next(new WrongCredentialsException());
    }
  };

  private createToken(user: User): TokenData {
    const expiresIn = 60 * 60;
    const secret = process.env.JWT_SECRET || 'loquesea';
    const dataStoredInToken: DataStoredInToken = {
      _id: user._id,
    };

    return {
      expiresIn,
      token: jwt.sign(dataStoredInToken, secret, { expiresIn }),
    };
  }

  private createCookie(tokenData: TokenData) {
    return `Authorization=${tokenData.token};HttpOnly; Max-Age=${tokenData.expiresIn} `;
  }

  private loggingOut = (request: express.Request, response: express.Response) => {
    response.setHeader('Set-Cookie', ['Authorization=;Max-age=0']);
    response.send(200);
  };
}

export default AuthenticationController;
