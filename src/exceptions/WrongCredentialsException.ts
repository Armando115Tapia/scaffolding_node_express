import HttpException from './HttpException';

class WrongCredentialsException extends HttpException {
  constructor() {
    super(400, `Credentilas are incorrect`);
  }
}
export default WrongCredentialsException;
