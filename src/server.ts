import App from './app';
// import 'dotenv/config';
//import { validateEnv } from './utils/validateEnv';

// validateEnv();

import PostsController from './post/posts.controller';
import AuthenticationController from './authentication/authentication.controller';
import ReportController from './reports/ReportController';
const { PORT } = process.env;

const app = new App(
  [
    new PostsController(),
    new AuthenticationController(),
    new ReportController(),
  ],
  5000
);
app.listen();
