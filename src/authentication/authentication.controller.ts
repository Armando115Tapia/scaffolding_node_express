import express, { Request, Response, NextFunction } from 'express';
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
import RequestWithUser from '../interfaces/requestWithUser.interface';
import AuthenticationService from './authentication.service';
import authMiddleware from '../middleware/auth.middleware';

class AuthenticationController implements Controller {
  path: string = '/auth';
  router: express.Router = express.Router();
  user = userModel;
  public authenticationService = new AuthenticationService();

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
    this.router.post(
      `${this.path}/2fa/generate`,
      authMiddleware,
      this.generateTwoFactorAuthenticationCode
    );
  }

  private registration = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    const userData: CreateUserDTO = request.body;
    try {
      const { cookie, user } = await this.authenticationService.register(
        userData
      );
      response.setHeader('Set-Cookie', [cookie]);
      response.send(user);
    } catch (error) {
      next(error);
    }
  };

  private generateTwoFactorAuthenticationCode = async (
    request: RequestWithUser,
    response: Response
  ) => {
    const user = request.user;
    const {
      otpauthUrl,
      base32,
    } = this.authenticationService.getTwoFactorAuthenticationCode();
    await this.user.findByIdAndUpdate(user._id, {
      twoFactorAuthenticationCode: base32,
    });
    this.authenticationService.respondWithQRCode(otpauthUrl, response);
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

  private loggingOut = (request: Request, response: Response) => {
    response.setHeader('Set-Cookie', ['Authorization=;Max-age=0']);
    response.send(200);
  };
}

export default AuthenticationController;
