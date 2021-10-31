import "reflect-metadata";
import { createConnection } from "typeorm";
import * as express from "express";
import { Request, Response } from "express";
import { Routes } from "./routes";
import * as cors from 'cors'


createConnection().then(async connection => {

  // create express app
  const app = express();
  app.use(cors())
  app.use(express.json());

  // register express routes from defined application routes
  Routes.forEach(route => {

    // implemented middleware
    const middlewareFn = route.middlewareArr ? (req: Request, res: Response, next: express.NextFunction) => {
      route.middlewareArr.forEach(middleware => {
        try {
          middleware(req, res, next)

        } catch (err) {
          let error = err;
          if (!(error instanceof Error)) {
            error = new Error("something went wrong")
          }
          res.status(500).send({ message: error.message })
        }
      })

    } : (req: Request, res: Response, next: express.NextFunction) => {
      next();
    }

    (app as any)[route.method](route.route, middlewareFn, (req: Request, res: Response, next: Function) => {

      console.log(route.route)

      const result = (new (route.controller as any))[route.action](req, res, next);
      if (result instanceof Promise) {
        result.then(result => result !== null && result !== undefined ? res.send(result) : undefined)
          .catch((err) => res.status(500).send({ error: "Something Went Wrong", err }));

      } else if (result !== null && result !== undefined) {
        res.json(result);
      }
    });
  });

  // start express server
  const PORT = Number(process.env.PORT) || 3000
  app.listen(PORT);

  console.log(`Express server has started on port ${PORT}`);

}).catch(error => console.log(error));
