import * as express from 'express';
import jwt from 'jsonwebtoken';
import DataStoredInToken from '../interfaces/dataStoredInToken.interface';
import userModel from '../users/user.model';
import WrongAuthenticationTokenException from '../exceptions/WrongAuthenticationTokenException';
import AuthenticationTokenMissingException from '../exceptions/AuthenticationTokenMissingException';

const authMiddleware = async (
  request: express.Request,
  response: express.Response,
  next: express.NextFunction
) => {
  const cookies = request.cookies;
  if (cookies && cookies.Authorization) {
    const secret = process.env.JWT_SECRET || 'loquesea';

    try {
      const verficationResponse = jwt.verify(
        cookies.Authorization,
        secret
      ) as DataStoredInToken;
      const id = verficationResponse._id;
      const user = await userModel.findOne({ _id: id });
      // console.log('verficationResponse', user);
      if (user) {
        request.user = user;
        next();
      } else {
        next(new WrongAuthenticationTokenException());
      }
    } catch (e) {
      next(new WrongAuthenticationTokenException());
    }
  } else {
    next(new AuthenticationTokenMissingException());
  }
};

export default authMiddleware;
