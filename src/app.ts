import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
const { MONGO_URI } = process.env;

class App {
  public app: express.Application;
  public port: number;

  constructor(controllers: any, port: number) {
    this.app = express();
    this.port = port;

    this.connectToTheDatabase();
    this.initializeMiddlewares();
    this.initializeControllers(controllers);
  }

  private initializeMiddlewares() {
    this.app.use(bodyParser.json());
  }

  private initializeControllers(controllers: any) {
    controllers.forEach((controller: any) => {
      this.app.use('/', controller.router);
    });
  }

  private async connectToTheDatabase() {
    try {
      const dataBaseconnect = await mongoose.connect(
        `mongodb://192.168.100.243:27017/database_post`,
        {
          useNewUrlParser: true,
          useFindAndModify: false,
          useUnifiedTopology: true,
        }
      );
    } catch (e) {
      console.log(e);
    }

  }

  public listen() {
    this.app.listen(this.port, () => {
      console.log(`App listening on the port: ${this.port}`);
    });
  }
}

export default App;
