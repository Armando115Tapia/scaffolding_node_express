import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';

import TokenData from '../interfaces/tokenData.interface';
import userModel from '../users/user.model';
import CreateUserDto from '../users/user.dto';
import UserWithThatEmailAlreadyExistsException from '../exceptions/UserWithThatEmailAlreadyExistsException';
import User from '../users/user.interface';
import DataStoredInToken from '../interfaces/dataStoredInToken.interface';
import * as jwt from 'jsonwebtoken';

class AuthenticationService {
  public user = userModel;

  public async register(userData: CreateUserDto) {
    if (await this.user.findOne({ email: userData.email })) {
      throw new UserWithThatEmailAlreadyExistsException(userData.email);
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = await this.user.create({
      ...userData,
      password: hashedPassword,
    });

    user.password = 'XD';
    const tokenData = this.createToken(user);
    const cookie = this.createCookie(tokenData);
    return {
      cookie,
      user,
    };
  }

  private createToken(user: User) {
    const expiresIn = 60 * 60;
    const secret = process.env.JWT_SECRET;

    const dataStoredInToken: DataStoredInToken = {
      _id: user._id,
    };

    return {
      expiresIn,
      token: jwt.sign(dataStoredInToken, secret, { expiresIn }),
    };
  }

  public createCookie(tokenData: TokenData) {
    console.log('Token data: ', tokenData);
    return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn}`;
  }
  public getTwoFactorAuthenticationCode() {
    const secretCode = speakeasy.generateSecret({
      name: process.env.TWO_FACTOR_AUTHENTICATION_APP_NAME,
    });

    return {
      otpauthUrl: secretCode.otpauth_url,
      base32: secretCode.base32,
    };
  }
  public respondWithQRCode(data: string, response: Response) {
    QRCode.toFileStream(response, data);
  }

  public verifyTwoFactorAuthenticationCode(
    twoFactorAuthenticationCode: string,
    user: User
  ) {
    return speakeasy.totp.verify({
      secret: user.twoFactorAuthenticationCode,
      encoding: 'base32',
      token: twoFactorAuthenticationCode,
    });
  }

  public createToken_2FA(user: User, isSecondFactorAuthenticated = false) {
    const expiresIn = 60 * 60; // an hour
    const secret = process.env.JWT_SECRET;
    const dataStoredInToken: DataStoredInToken = {
      isSecondFactorAuthenticated,
      _id: user._id,
    };
    return {
      expiresIn,
      token: jwt.sign(dataStoredInToken, secret, { expiresIn }),
    };
  }
}

export default AuthenticationService;
