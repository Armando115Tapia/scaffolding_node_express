import 'dotenv/config';
import { validateEnv } from './utils/validateEnv';
import App from './app';

import PostsController from './post/posts.controller';
import AuthenticationController from './authentication/authentication.controller';
import ReportController from './reports/ReportController';
const { PORT } = process.env;

// ORM CONFIG
import { createConnection } from 'typeorm';
import config from './ormconfig';

validateEnv();

(async () => {
  try {
    await createConnection(config);
  } catch (error) {
    console.log('Error while connecting to the database: ', error);
    return error;
  }
  const app = new App(
    [
      new PostsController(),
      new AuthenticationController(),
      new ReportController(),
    ],
    Number(PORT)
  );
})();

// MONGO CONNECTION

/*
const app = new App(
  [
    new PostsController(),
    new AuthenticationController(),
    new ReportController(),
  ],
  Number(PORT)
);
app.listen();*/
