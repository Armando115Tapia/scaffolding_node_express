import HttpException from './HttpException';
class WrongAuthenticationTokenException extends HttpException {
  constructor() {
    super(400, 'Authentication failed, incorrect credentials');
  }
}

export default WrongAuthenticationTokenException;
