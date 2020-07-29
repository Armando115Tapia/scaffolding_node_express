import HttpException from './HttpException';
class AuthenticationTokenMissingException extends HttpException {
  constructor() {
    super(400, 'Token must be send');
  }
}

export default AuthenticationTokenMissingException;
