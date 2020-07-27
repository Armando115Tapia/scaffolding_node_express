import App from './app';
// import 'dotenv/config';
//import { validateEnv } from './utils/validateEnv';

// validateEnv();

import PostsController from './post/posts.controller';
const { PORT } = process.env;

const app = new App([new PostsController()], 5000);
app.listen();
