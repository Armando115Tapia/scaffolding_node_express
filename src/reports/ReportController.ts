import Controller from '../interfaces/controller.interface';
import express, { Request, Response, NextFunction } from 'express';
import userModel from '../users/user.model';

class ReportController implements Controller {
  public path: string = '/report';
  public router = express.Router();
  private user = userModel;

  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.get(this.path, this.generateReport);
  }

  private generateReport = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    const usersByCountries = await this.user.aggregate([
      {
        $match: {
          'address.country': {
            $exists: true,
          },
        },
      },
      {
        $group: {
          _id: {
            country: '$address.country',
          },
          users: {
            $push: {
              name: '$name',
              _id: '$_id',
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'posts',
          localField: 'users._id',
          foreignField: 'author',
          as: 'articles',
        },
      },
      {
        $addFields: {
          amountOfArticles: {
            $size: '$articles',
          },
        },
      },
      {
        $sort: {
          count: 1,
        },
      },
    ]);
    response.send(usersByCountries);
  };
}

export default ReportController;
